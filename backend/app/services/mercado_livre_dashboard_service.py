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
    mediacao_keywords = [
        # termos gerais
        "media", "mediacao", "mediação",
        "reclama", "reclamacao", "reclamação",
        "disputa",

        # frases comuns vistas na planilha (estado/descrição)
        "reclamação encerr", "reclamacao encerr",
        "mediação finaliz", "mediacao finaliz",
        "devolução habilitada", "devolucao habilitada",
        "não poderá reiniciar", "nao podera reiniciar",
        "não sera possivel abrir", "não será possível abrir",
    ]
    if any(keyword in text for keyword in mediacao_keywords):
        return "MEDIACAO"
    
    # 2. CANCELADO: cancelamentos, reembolsos e devoluções
    # Verifica devoluções ANTES de "entregue/enviado" para evitar falsos positivos
    # Exemplos: "devolvido", "devolução", "retorno", "reembolso", "cancelado"
    cancel_keywords = [
        # termos gerais
        "cancel", "cancelad", "cancelada", "cancelado", "cancelou",
        "reembolso", "reembols", "reembolsad", "reembolsado", "reembolsada",
        "estorn", "estorno",
        "troca",

        # devolução/retorno (variações com/sem acento)
        "devolv", "devol", "devolucao", "devolução",
        "devolvido", "devolvida",
        "retorn", "retorno", "retornará", "retornara", "retornou",

        # frases comuns vistas na planilha (estado/descrição)
        "devolução a caminho", "devolucao a caminho",
        "a devolução", "a devolucao",
        "devolvido no dia", "devolvida no dia",
        "pacote cancelado", "cancelado pelo mercado livre",
        "entrega foi recusada", "entrega recusada", "recusada",
        "produto retornou", "retornará para você", "retornara para voce",
        "arrepend",  # "se arrependeu da compra"
    ]
    if any(keyword in text for keyword in cancel_keywords):
        return "CANCELADO"
    
    # 3. ENVIADO: produtos entregues/enviados (mas não devolvidos)
    # IMPORTANTE: Esta verificação vem DEPOIS de devoluções para evitar
    # classificar devoluções como "enviado" quando contêm palavras como "entregue"
    if any(keyword in text for keyword in [
        "chegou",
        "entreg",  # entregue/entrega
        "enviad",  # enviado/enviada
        "recebid",  # recebido/recebida (casos comuns do ML)
        "entrega realizada",
        "entregue ao destinat", "entregue ao destinatário",
    ]):
        return "ENVIADO"
    
    # 4. A_ENVIAR: pendências de envio
    if any(keyword in text for keyword in [
        # fluxo clássico de etiqueta/postagem
        "para enviar",
        "informar",
        "imprimir",
        "etiqueta",
        "gerar etiqueta",
        "pronto para enviar",
        "preparando",
        "aguardando envio",

        # frases vistas na planilha
        "a caminho",  # ainda em trânsito / não entregue
        "chega ", "chegará", "chegara",  # "Chega segunda-feira..."
        "venda concretizada",
        "concretizamos a venda",
    ]):
        return "A_ENVIAR"

    # Default: assume que está pendente de envio
    return "A_ENVIAR"


def build_mercado_livre_dashboard(ml_bytes: bytes, db: Session) -> dict:
    """
    Gera dashboard do Mercado Livre.
    
    Busca produtos diretamente do banco de dados usando o SKU da planilha do ML.
    """
    # 1) Lê ML (header real na linha 6 do Excel -> header=5)
    ml = pd.read_excel(ml_bytes, header=5, engine="openpyxl")

    # 2) Normaliza SKUs do ML
    ml["__sku"] = ml["SKU"].apply(norm_sku)

    # 3) Busca produtos do banco de dados por SKU
    ml_skus = ml["__sku"].dropna().unique().tolist()
    products_dict = get_products_dict_by_sku(db, ml_skus)

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

        # Quantidade vendida (coluna G da planilha do ML)
        # No relatório do ML essa coluna costuma se chamar "Unidades"
        quantity = (
            to_float(r.get("Unidades"))
            or to_float(r.get("Quantidade"))
            or to_float(r.get("Qtd"))
        )
        if quantity is None or quantity <= 0:
            quantity = 1

        # Normaliza para inteiro quando vier como float (ex.: 3.0)
        try:
            quantity = int(quantity)
        except Exception:
            quantity = 1

        # Verifica se o produto tem SKU
        has_sku = sku and sku.strip() != ""
        
        # Busca custo do banco de dados usando SKU (só se tiver SKU)
        cost = None
        if has_sku:
            product = products_dict.get(norm_sku(sku))
            if product and product.preco_custo is not None:
                cost = float(product.preco_custo)

        # Classifica o status primeiro
        status_group = classify_status_group(estado, status_desc)

        # Regra do lucro:
        # 1. Produtos SEM SKU: lucro_bruto = None (não identificados)
        # 2. Produtos com status MEDIACAO ou CANCELADO: lucro_bruto = None
        # 3. Para os demais: valor da venda do produto - valor de custo
        if not has_sku:
            # Produto sem SKU: não calcula lucro e vai para produtos não identificados
            lucro_bruto = None
        elif status_group in ["MEDIACAO", "CANCELADO"]:
            lucro_bruto = None
        else:
            # Lucro considerando quantidade: total - (custo_unitario * quantidade)
            if total is not None and cost is not None:
                lucro_bruto = total - (cost * quantity)
            else:
                lucro_bruto = None

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
            "quantity": quantity,
            "total_cost": (cost * quantity) if (cost is not None and quantity is not None) else None,
            "ml_listing_id": safe_str(r.get("# de anúncio")),
        }

        rows.append(row)

        # Adiciona à lista de produtos não identificados se:
        # 1. Não tem SKU, OU
        # 2. Tem SKU mas não tem custo cadastrado no banco
        if not has_sku:
            missing_skus.append({
                "sku": None,  # Sem SKU
                "descricao": row["descricao"],
                "estado": estado
            })
        elif has_sku and cost is None:
            missing_skus.append({
                "sku": sku,
                "descricao": row["descricao"],
                "estado": estado
            })

    # 7) Summary
    total_itens = len(rows)
    skus_sem_cadastro = len(missing_skus)

    # Calcula o lucro total apenas para produtos que:
    # 1. Têm SKU (produtos identificados)
    # 2. Não são MEDIACAO ou CANCELADO
    # 3. Têm lucro_bruto calculado (não None)
    total_lucro = 0.0
    for x in rows:
        # Só inclui no cálculo se:
        # - Tem SKU (produto identificado)
        # - Lucro não é None
        # - Status não é MEDIACAO ou CANCELADO
        has_sku = x["sku"] and str(x["sku"]).strip() != ""
        if has_sku and x["lucro_bruto"] is not None and x["status_group"] not in ["MEDIACAO", "CANCELADO"]:
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
