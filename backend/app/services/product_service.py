from sqlalchemy.orm import Session
from typing import Dict, Optional
from app.models.product import Product
from app.utils.parsing import norm_sku


def get_product_by_sku(db: Session, sku: str) -> Optional[Product]:
    """Busca um produto no banco por SKU normalizado"""
    if not sku:
        return None
    
    normalized_sku = norm_sku(sku)
    if not normalized_sku:
        return None
    
    # Tenta buscar por SKU normalizado
    product = db.query(Product).filter(Product.sku == normalized_sku).first()
    return product


def get_product_by_codigo_linx(db: Session, codigo_linx: str) -> Optional[Product]:
    """Busca um produto no banco por CODIGO_LINX"""
    if not codigo_linx:
        return None
    
    product = db.query(Product).filter(Product.codigo_linx == str(codigo_linx).strip()).first()
    return product


def get_products_dict_by_sku(db: Session, skus: list) -> Dict[str, Product]:
    """
    Busca múltiplos produtos por SKU e retorna um dicionário {sku_normalizado: Product}
    Útil para fazer merge rápido com dados do ML
    """
    if not skus:
        return {}
    
    # Normaliza todos os SKUs
    normalized_skus = [norm_sku(sku) for sku in skus if norm_sku(sku)]
    if not normalized_skus:
        return {}
    
    # Busca produtos no banco
    products = db.query(Product).filter(Product.sku.in_(normalized_skus)).all()
    
    # Cria dicionário {sku_normalizado: Product}
    products_dict = {}
    for product in products:
        if product.sku:
            products_dict[product.sku] = product
    
    return products_dict
