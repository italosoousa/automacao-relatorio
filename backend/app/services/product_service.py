from sqlalchemy.orm import Session
from typing import Dict, Optional, List
from app.models.product import Product
from app.utils.parsing import norm_sku, norm_ean, safe_str


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


def get_product_by_codigo_barras(db: Session, codigo_barras: str) -> Optional[Product]:
    """Busca um produto no banco por código de barras normalizado"""
    if not codigo_barras:
        return None
    
    normalized_ean = norm_ean(codigo_barras)
    if not normalized_ean:
        return None
    
    # Busca produto por código de barras
    product = db.query(Product).filter(Product.codigo_barras == normalized_ean).first()
    return product


def get_products_dict_by_codigo_barras(db: Session, codigos_barras: List[str]) -> Dict[str, Product]:
    """
    Busca múltiplos produtos por código de barras e retorna um dicionário {codigo_barras_normalizado: Product}
    Útil para fazer merge rápido com dados do RFID
    """
    if not codigos_barras:
        return {}
    
    # Normaliza todos os códigos de barras
    normalized_eans = [norm_ean(cb) for cb in codigos_barras if norm_ean(cb)]
    if not normalized_eans:
        return {}
    
    # Busca produtos no banco
    products = db.query(Product).filter(Product.codigo_barras.in_(normalized_eans)).all()
    
    # Cria dicionário {codigo_barras_normalizado: Product}
    products_dict = {}
    for product in products:
        if product.codigo_barras:
            normalized = norm_ean(product.codigo_barras)
            if normalized:
                products_dict[normalized] = product
    
    return products_dict
