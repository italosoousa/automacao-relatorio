from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.utils.parsing import norm_sku, safe_str
import pandas as pd
from io import BytesIO
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/products", tags=["products"])


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Cria um novo produto"""
    # Verifica se já existe produto com o mesmo codigo_linx
    existing = db.query(Product).filter(Product.codigo_linx == product.codigo_linx).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Produto com CODIGO_LINX '{product.codigo_linx}' já existe"
        )
    
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.get("/", response_model=List[ProductResponse])
async def list_products(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lista produtos com paginação e busca opcional"""
    query = db.query(Product)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Product.codigo_linx.like(search_term)) |
            (Product.descricao.like(search_term)) |
            (Product.sku.like(search_term)) |
            (Product.codigo_barras.like(search_term))
        )
    
    products = query.offset(skip).limit(limit).all()
    return products


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Busca um produto por ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Produto com ID {product_id} não encontrado"
        )
    return product


@router.get("/codigo-linx/{codigo_linx}", response_model=ProductResponse)
async def get_product_by_codigo_linx(codigo_linx: str, db: Session = Depends(get_db)):
    """Busca um produto por CODIGO_LINX"""
    product = db.query(Product).filter(Product.codigo_linx == codigo_linx).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Produto com CODIGO_LINX '{codigo_linx}' não encontrado"
        )
    return product


@router.get("/sku/{sku}", response_model=List[ProductResponse])
async def get_products_by_sku(sku: str, db: Session = Depends(get_db)):
    """Busca produtos por SKU (pode haver múltiplos)"""
    normalized_sku = norm_sku(sku)
    products = db.query(Product).filter(Product.sku == normalized_sku).all()
    return products


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza um produto"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Produto com ID {product_id} não encontrado"
        )
    
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Deleta um produto"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Produto com ID {product_id} não encontrado"
        )
    
    db.delete(product)
    db.commit()
    return None


@router.post("/bulk", response_model=List[ProductResponse], status_code=status.HTTP_201_CREATED)
async def create_products_bulk(
    products: List[ProductCreate],
    db: Session = Depends(get_db)
):
    """Cria múltiplos produtos de uma vez"""
    created_products = []
    errors = []
    
    for product_data in products:
        # Verifica se já existe
        existing = db.query(Product).filter(
            Product.codigo_linx == product_data.codigo_linx
        ).first()
        
        if existing:
            errors.append(f"Produto com CODIGO_LINX '{product_data.codigo_linx}' já existe")
            continue
        
        db_product = Product(**product_data.model_dump())
        db.add(db_product)
        created_products.append(db_product)
    
    if created_products:
        db.commit()
        for product in created_products:
            db.refresh(product)
    
    if errors and not created_products:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="; ".join(errors)
        )
    
    return created_products


@router.post("/import-from-excel", status_code=status.HTTP_200_OK)
async def import_products_from_excel(
    file: UploadFile = File(..., description="Planilha Excel com código de barras (coluna A) e preço (coluna B)"),
    db: Session = Depends(get_db)
):
    """
    Atualiza preços de produtos a partir de uma planilha Excel.
    
    A planilha deve ter exatamente 2 colunas:
    - Coluna A: Código de Barras
    - Coluna B: Preço Novo
    
    Retorna:
    - alterados: Número de produtos que tiveram o preço atualizado
    - nao_encontrados: Número de códigos de barras não encontrados
    - corretos: Número de produtos que já tinham o preço correto
    """
    try:
        file_bytes = await file.read()
        
        try:
            df = pd.read_excel(BytesIO(file_bytes), engine="openpyxl", header=None, usecols=[0, 1])
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao ler arquivo Excel: {str(e)}"
            )
        
        if df.empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A planilha está vazia"
            )
        
        # Renomear colunas para clareza
        df.columns = ["codigo_barras", "preco_novo"]
        
        # Remover linhas com código de barras ou preço vazios
        df = df.dropna(subset=["codigo_barras", "preco_novo"])
        
        alterados = 0
        nao_encontrados = 0
        corretos = 0
        
        for index, row in df.iterrows():
            try:
                # Normalizar código de barras
                codigo_barras = safe_str(row["codigo_barras"]).strip()
                if codigo_barras.endswith('.0') and codigo_barras.replace('.0', '').isdigit():
                    codigo_barras = codigo_barras[:-2]
                
                if not codigo_barras:
                    nao_encontrados += 1
                    continue
                
                # Converter preço
                try:
                    preco_novo = Decimal(str(row["preco_novo"]).replace(",", "."))
                except (ValueError, TypeError):
                    nao_encontrados += 1
                    continue
                
                # Buscar produto
                produto = db.query(Product).filter(
                    Product.codigo_barras == codigo_barras
                ).first()
                
                if not produto:
                    nao_encontrados += 1
                    continue
                
                # Comparar e atualizar preço
                if produto.preco_custo == preco_novo:
                    corretos += 1
                else:
                    produto.preco_custo = preco_novo
                    alterados += 1
                    
            except Exception:
                nao_encontrados += 1
                continue
        
        # Commit único ao final
        db.commit()
        
        return {
            "alterados": alterados,
            "nao_encontrados": nao_encontrados,
            "corretos": corretos,
            "total_processados": len(df)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao processar planilha de preços: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar planilha: {str(e)}"
        )
