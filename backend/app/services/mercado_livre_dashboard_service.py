import pandas as pd
from io import BytesIO
from sqlalchemy.orm import Session
from app.utils.parsing import norm_sku, to_float, safe_str
from app.services.product_service import get_products_dict_by_sku
import logging

logger = logging.getLogger(__name__)


def classify_status_group(estado: str | None, status_desc: str | None) -> str:
    """
    Classifica o status do produto em grupos.
    """
    text = f"{estado or ''} {status_desc or ''}".lower()
    
    # MEDIACAO
    if any(kw in text for kw in ["media", "reclama", "disputa"]):
        return "MEDIACAO"
    
    # CANCELADO
    if any(kw in text for kw in ["cancel", "reembolso", "estorno", "devolv", "retorn", "arrependeu", "recusada"]):
        return "CANCELADO"
    
    # ENVIADO
    if any(kw in text for kw in ["entreg", "enviad", "recebid", "chegou"]):
        return "ENVIADO"
    
    # A_ENVIAR (padrão)
    return "A_ENVIAR"


def build_mercado_livre_dashboard(ml_bytes: bytes, db: Session) -> dict:
    """
    Gera dashboard do Mercado Livre.
    Lê planilha do ML, busca produtos no banco pelo SKU e calcula lucro.
    """
    try:
        # Lê o Excel (header na linha 6, índice 5)
        ml = pd.read_excel(BytesIO(ml_bytes), header=5, engine="openpyxl")
    except Exception as e:
        logger.error(f"Erro ao ler arquivo Excel: {str(e)}")
        raise ValueError(f"Erro ao ler arquivo Excel: {str(e)}")
    
    if ml.empty:
        logger.warning("Planilha do Mercado Livre está vazia")
        return {
            "rows": [],
            "summary": {"total_lucro": 0.0, "total_itens": 0, "skus_sem_cadastro": 0},
            "filter_options": {"states": [], "status_group": []},
            "missing_skus": [],
        }
    
    # Verifica se coluna SKU existe
    if "SKU" not in ml.columns:
        raise KeyError(f"Coluna 'SKU' não encontrada. Colunas disponíveis: {', '.join(ml.columns.tolist())}")
    
    # Normaliza SKUs
    ml["__sku_normalized"] = ml["SKU"].apply(lambda x: norm_sku(x) if pd.notna(x) else None)
    
    # Busca todos os produtos do banco
    ml_skus = ml["__sku_normalized"].dropna().unique().tolist()
    products_dict = get_products_dict_by_sku(db, ml_skus) if ml_skus else {}
    
    rows = []
    missing_skus = []
    
    for _, row in ml.iterrows():
        try:
            # SKU
            sku = safe_str(row.get("SKU"))
            sku_normalized = row.get("__sku_normalized")
            has_sku = sku and sku.strip() != ""
            
            # Descrição do produto
            descricao = None
            for col in ["Título do anúncio", "Titulo do anuncio"]:
                if col in ml.columns:
                    val = safe_str(row.get(col))
                    if val:
                        descricao = val
                        break
            descricao = descricao or "—"
            
            # Estado e Status
            estado = safe_str(row.get("Estado"))
            status_desc = safe_str(row.get("Descrição do status"))
            status_group = classify_status_group(estado, status_desc)
            
            # Valores financeiros
            revenue_product = to_float(row.get("Receita por produtos (BRL)")) or 0.0
            fee_taxes = to_float(row.get("Tarifa de venda e impostos (BRL)")) or 0.0
            shipping_fees = to_float(row.get("Tarifas de envio (BRL)")) or 0.0
            total = to_float(row.get("Total (BRL)")) or 0.0
            
            # Quantidade
            quantity = to_float(row.get("Unidades")) or to_float(row.get("Quantidade")) or 1.0
            quantity = int(quantity) if quantity > 0 else 1
            
            # Busca custo do banco
            cost = None
            if has_sku and sku_normalized:
                product = products_dict.get(sku_normalized)
                if product and product.preco_custo:
                    cost = float(product.preco_custo)
            
            # Calcula lucro bruto
            lucro_bruto = None
            if has_sku and cost is not None and status_group not in ["MEDIACAO", "CANCELADO"]:
                lucro_bruto = total - (cost * quantity)
            
            # Monta linha
            row_data = {
                "sku": sku,
                "descricao": descricao,
                "estado": estado or "—",
                "lucro_bruto": lucro_bruto,
                "status_group": status_group,
                "sale_number": safe_str(row.get("N.º de venda")),
                "sale_date": safe_str(row.get("Data da venda")),
                "status_description": status_desc,
                "revenue_product": revenue_product,
                "fee_taxes": fee_taxes,
                "shipping_fees": shipping_fees,
                "total": total,
                "cost": cost,
                "quantity": quantity,
                "total_cost": (cost * quantity) if cost else None,
                "ml_listing_id": safe_str(row.get("# de anúncio")),
            }
            
            rows.append(row_data)
            
            # Registra produtos sem cadastro
            if not has_sku or (has_sku and cost is None):
                missing_skus.append({
                    "sku": sku if has_sku else None,
                    "descricao": descricao,
                    "estado": estado
                })
                
        except Exception as e:
            logger.warning(f"Erro ao processar linha: {str(e)}")
            continue
    
    # Calcula summary
    total_itens = len(rows)
    skus_sem_cadastro = len(missing_skus)
    total_lucro = sum(
        float(r["lucro_bruto"]) 
        for r in rows 
        if r["lucro_bruto"] is not None
    )
    
    # Filter options
    states = sorted({(r["estado"] or "Indefinido") for r in rows})
    status_groups = sorted({r["status_group"] for r in rows})
    
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

