import pandas as pd
from app.utils.parsing import norm_sku, to_float, safe_str


def classify_status_group(estado: str | None, status_desc: str | None) -> str:
    text = f"{estado or ''} {status_desc or ''}".lower()

    if "cancel" in text or "reembolso" in text or "reembols" in text:
        return "CANCELADO"
    if "media" in text or "reclama" in text or "disputa" in text:
        return "MEDIACAO"
    # “chegou”, “entregue”, “enviado” etc.
    if "chegou" in text or "entreg" in text or "enviad" in text:
        return "ENVIADO"
    # “para enviar”, “informar nfe”, “imprimir etiqueta”, etc.
    if "para enviar" in text or "informar" in text or "imprimir" in text:
        return "A_ENVIAR"

    return "A_ENVIAR"


def build_dashboard(ml_bytes: bytes, base_bytes: bytes) -> dict:
    # 1) Lê ML (header real na linha 6 do Excel -> header=5)
    ml = pd.read_excel(ml_bytes, header=5, engine="openpyxl")

    # 2) Lê Base (SKU col A = "Código"; custo = "Custo Total Unit.")
    base = pd.read_excel(base_bytes, header=0, engine="openpyxl")

    # 3) Normaliza SKUs
    ml["__sku"] = ml["SKU"].apply(norm_sku)
    # Normaliza SKU do ML (coluna T -> já vem como "SKU")
    ml["__sku"] = ml["SKU"].apply(norm_sku)

    # Normaliza possíveis chaves na base
    base["__sku_codigo"] = base["Código"].apply(norm_sku)
    base["__sku_referencia"] = base["Referência"].apply(norm_sku) if "Referência" in base.columns else None

    # Decide qual coluna usar como chave, baseado em quantos batem
    ml_sku_set = set(ml["__sku"].dropna().unique())

    codigo_match = 0
    ref_match = 0

    if "Código" in base.columns:
        codigo_match = len(ml_sku_set.intersection(set(base["__sku_codigo"].dropna().unique())))

    if "Referência" in base.columns:
        ref_match = len(ml_sku_set.intersection(set(base["__sku_referencia"].dropna().unique())))

    # Escolhe a melhor chave
    if ref_match > codigo_match:
        base["__sku"] = base["__sku_referencia"]
    else:
        base["__sku"] = base["__sku_codigo"]


    # 4) Seleciona custo (e opcionalmente descrição da base, se quiser usar depois)
    base_cost = base[["__sku", "Custo Total Unit."]].copy()
    base_cost = base_cost.rename(columns={"Custo Total Unit.": "__cost"})

    # 5) Merge por SKU
    merged = ml.merge(base_cost, on="__sku", how="left")

    # 6) Monta linhas no formato do frontend
    rows = []
    missing_skus = []

    for _, r in merged.iterrows():
        sku = safe_str(r.get("__sku"))
        descricao = safe_str(r.get("Título do anúncio")) or safe_str(r.get("Variação")) or "—"
        estado = safe_str(r.get("Estado"))
        status_desc = safe_str(r.get("Descrição do status"))

        revenue_product = to_float(r.get("Receita por produtos (BRL)"))
        fee_taxes = to_float(r.get("Tarifa de venda e impostos (BRL)"))
        shipping_fees = to_float(r.get("Tarifas de envio (BRL)"))
        total = to_float(r.get("Total (BRL)"))

        cost = to_float(r.get("__cost"))

        # Regra do lucro:
        # você comentou “valor da venda do produto - valor de custo”
        # Então vamos usar revenue_product como base principal.
        # Se revenue_product vier vazio, cai pro total.
        lucro_bruto = (total - cost) if (total is not None and cost is not None) else None

        status_group = classify_status_group(estado, status_desc)

        row = {
            "sku": sku,
            "descricao": descricao or "—",
            "estado": estado,
            "lucro_bruto": lucro_bruto,
            "status_group": status_group,

            # modal:
            "sale_number": safe_str(r.get("N.º de venda")),
            "sale_date": safe_str(r.get("Data da venda")),  # mantém “humano”, seu modal já trata
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

    total_lucro = 0.0
    for x in rows:
        if x["lucro_bruto"] is not None:
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
