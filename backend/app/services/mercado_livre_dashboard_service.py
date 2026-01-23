import pandas as pd
from sqlalchemy.orm import Session
from app.utils.parsing import norm_sku, to_float, safe_str
from app.services.product_service import get_products_dict_by_sku


def classify_status_group(estado: str | None, status_desc: str | None) -> str:
    """
    Classifica o status do produto em grupos.
    Ordem de verificação é importante: casos mais específicos primeiro.
    """
    text = f"{estado or ''} {status_desc or ''}".lower()
    
    # 1. MEDIACAO: mediações, reclamações e disputas
    # Verifica ANTES de cancelado para evitar que mediações sejam classificadas como canceladas
    # Exemplos: "em mediação", "reclamação", "disputa", "mediação aberta"
    mediacao_keywords = ["media", "reclama", "disputa", "mediacao", "mediação"]
    if any(keyword in text for keyword in mediacao_keywords):
        return "MEDIACAO"
    
    # 2. CANCELADO: cancelamentos, reembolsos e devoluções
    # Verifica devoluções ANTES de "entregue/enviado" para evitar falsos positivos
    # Exemplos: "devolvido", "devolução", "retorno", "reembolso", "cancelado"
    cancel_keywords = [
        "cancel", "reembolso", "reembols", "devolv", "devolução", 
        "devolvido", "devolvida", "retorn", "retorno", "troca",
        "estorn", "estorno", "devol", "devolucao"
    ]
    if any(keyword in text for keyword in cancel_keywords):
        return "CANCELADO"
    
    # 3. ENVIADO: produtos entregues/enviados (mas não devolvidos)
    # IMPORTANTE: Esta verificação vem DEPOIS de devoluções para evitar
    # classificar devoluções como "enviado" quando contêm palavras como "entregue"
    if any(keyword in text for keyword in ["chegou", "entreg", "enviad"]):
        return "ENVIADO"
    
    # 4. A_ENVIAR: pendências de envio
    if any(keyword in text for keyword in ["para enviar", "informar", "imprimir"]):
        return "A_ENVIAR"

    # Default: assume que está pendente de envio
    return "A_ENVIAR"


def build_mercado_livre_dashboard(ml_bytes: bytes, db: Session, use_base_file: bool = False, base_bytes: bytes = None) -> dict:
    # 1) Lê ML (header real na linha 6 do Excel -> header=5)
    ml = pd.read_excel(ml_bytes, header=5, engine="openpyxl")

    # 2) Normaliza SKUs do ML
    ml["__sku"] = ml["SKU"].apply(norm_sku)

    # 3) Busca produtos do banco de dados
    ml_skus = ml["__sku"].dropna().unique().tolist()
    products_dict = get_products_dict_by_sku(db, ml_skus)

    # 4) Se use_base_file=True, ainda permite usar planilha como fallback
    # (útil para migração gradual)
    base_cost_dict = {}
    if use_base_file and base_bytes:
        base = pd.read_excel(base_bytes, header=0, engine="openpyxl")
        base["__sku_codigo"] = base["Código"].apply(norm_sku)
        base["__sku_referencia"] = base["Referência"].apply(norm_sku) if "Referência" in base.columns else None
        
        ml_sku_set = set(ml_skus)
        codigo_match = len(ml_sku_set.intersection(set(base["__sku_codigo"].dropna().unique()))) if "Código" in base.columns else 0
        ref_match = len(ml_sku_set.intersection(set(base["__sku_referencia"].dropna().unique()))) if "Referência" in base.columns else 0
        
        if ref_match > codigo_match:
            base["__sku"] = base["__sku_referencia"]
        else:
            base["__sku"] = base["__sku_codigo"]
        
        base_cost = base[["__sku", "Custo Total Unit."]].copy()
        for _, row in base_cost.iterrows():
            sku = row["__sku"]
            if sku:
                base_cost_dict[sku] = to_float(row.get("Custo Total Unit."))

    # 5) Monta linhas no formato do frontend
    rows = []
    missing_skus = []

    for _, r in ml.iterrows():
        sku = safe_str(r.get("__sku"))
        descricao = safe_str(r.get("Título do anúncio")) or safe_str(r.get("Variação")) or "—"
        estado = safe_str(r.get("Estado"))
        status_desc = safe_str(r.get("Descrição do status"))

        revenue_product = to_float(r.get("Receita por produtos (BRL)"))
        fee_taxes = to_float(r.get("Tarifa de venda e impostos (BRL)"))
        shipping_fees = to_float(r.get("Tarifas de envio (BRL)"))
        total = to_float(r.get("Total (BRL)"))

        # Busca custo do banco de dados primeiro, depois da planilha (se disponível)
        cost = None
        if sku:
            product = products_dict.get(norm_sku(sku))
            if product and product.preco_custo is not None:
                cost = float(product.preco_custo)
            elif use_base_file and base_bytes and sku in base_cost_dict:
                cost = base_cost_dict[sku]

        # Classifica o status primeiro
        status_group = classify_status_group(estado, status_desc)

        # Regra do lucro:
        # Produtos com status MEDIACAO ou CANCELADO devem ter lucro_bruto como None
        # Para os demais: valor da venda do produto - valor de custo
        if status_group in ["MEDIACAO", "CANCELADO"]:
            lucro_bruto = None
        else:
            lucro_bruto = (total - cost) if (total is not None and cost is not None) else None

        row = {
            "sku": sku,
            "descricao": descricao or "—",
            "estado": estado,
            "lucro_bruto": lucro_bruto,
            "status_group": status_group,

            # modal:
            "sale_number": safe_str(r.get("N.º de venda")),
            "sale_date": safe_str(r.get("Data da venda")),  # mantém "humano", seu modal já trata
            "status_description": status_desc,
            "revenue_product": revenue_product,
            "fee_taxes": fee_taxes,
            "shipping_fees": shipping_fees,
            "total": total,
            "cost": cost,
            "ml_listing_id": safe_str(r.get("# de anúncio")),
        }

        rows.append(row)

        if sku and cost is None:
            missing_skus.append({
                "sku": sku,
                "descricao": row["descricao"],
                "estado": estado
            })

    # 7) Summary
    total_itens = len(rows)
    skus_sem_cadastro = len(missing_skus)

    # Calcula o lucro total apenas para produtos que não são MEDIACAO ou CANCELADO
    total_lucro = 0.0
    for x in rows:
        # Só inclui no cálculo se lucro_bruto não for None e não for MEDIACAO ou CANCELADO
        if x["lucro_bruto"] is not None and x["status_group"] not in ["MEDIACAO", "CANCELADO"]:
            total_lucro += float(x["lucro_bruto"])

    # 8) Filter options (listas únicas e ordenadas)
    states = sorted({(x["estado"] or "Indefinido") for x in rows})
    status_groups = sorted({x["status_group"] for x in rows})

    return {
        "rows": rows,
        "summary": {
            "total_lucro": float(total_lucro),
            "total_itens": int(total_itens),
            "skus_sem_cadastro": int(skus_sem_cadastro),
        },
        "filter_options": {
            "states": states,
            "status_group": status_groups,
        },
        "missing_skus": missing_skus,
    }
