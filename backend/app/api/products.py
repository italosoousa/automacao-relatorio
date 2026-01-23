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
    file: UploadFile = File(..., description="Planilha Excel (.xlsx) com produtos"),
    update_existing: bool = False,
    db: Session = Depends(get_db)
):
    """
    Importa produtos de uma planilha Excel.
    
    A planilha deve ter as seguintes colunas:
    - CODIGO_LINX (obrigatório)
    - DESCRICAO (opcional)
    - SKU (opcional)
    - CODIGO_BARRAS (opcional)
    - PRECO_CUSTO (opcional)
    
    Parâmetros:
    - update_existing: Se True, atualiza produtos existentes. Se False, ignora duplicados.
    """
    try:
        # Ler arquivo Excel
        file_bytes = await file.read()
        
        try:
            df = pd.read_excel(BytesIO(file_bytes), engine="openpyxl")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao ler arquivo Excel: {str(e)}"
            )
        
        # Normalizar nomes das colunas (case insensitive, remove espaços)
        # Converter todos os nomes de colunas para string primeiro
        df.columns = [str(col).strip().upper() for col in df.columns]
        
        # Verificar coluna obrigatória
        if "CODIGO_LINX" not in df.columns:
            # Garantir que todas as colunas são strings para o join
            colunas_str = [str(col) for col in df.columns.tolist()]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coluna 'CODIGO_LINX' não encontrada na planilha. Colunas disponíveis: " + ", ".join(colunas_str)
            )
        
        # Mapear colunas (case insensitive)
        column_mapping = {
            "CODIGO_LINX": "codigo_linx",
            "DESCRICAO": "descricao",
            "SKU": "sku",
            "CODIGO_BARRAS": "codigo_barras",
            "PRECO_CUSTO": "preco_custo",
            "PRECO": "preco_custo",  # Aceita também "PRECO"
            "CUSTO": "preco_custo",  # Aceita também "CUSTO"
        }
        
        # Preparar dados
        created_count = 0
        updated_count = 0
        skipped_count = 0
        errors = []
        
        # Processar em lotes para melhor performance e tratamento de erros
        BATCH_SIZE = 50
        products_to_add = []
        
        for index, row in df.iterrows():
            try:
                # Processar CODIGO_LINX com tratamento seguro de tipos
                codigo_linx_raw = row.get("CODIGO_LINX")
                
                # Converter para string de forma segura (trata float, int, NaN, etc)
                codigo_linx = safe_str(codigo_linx_raw)
                
                if not codigo_linx:
                    skipped_count += 1
                    continue
                
                # Garantir que não tem .0 no final (normalização extra)
                if codigo_linx.endswith('.0') and codigo_linx.replace('.0', '').replace('-', '').isdigit():
                    codigo_linx = codigo_linx[:-2]
                
                # Buscar produto existente (também tenta com .0 caso exista no banco)
                existing = db.query(Product).filter(Product.codigo_linx == codigo_linx).first()
                if not existing:
                    # Tenta também com .0 caso o banco tenha salvo assim
                    codigo_linx_with_dot = codigo_linx + '.0'
                    existing = db.query(Product).filter(Product.codigo_linx == codigo_linx_with_dot).first()
                    if existing:
                        # Se encontrou com .0, atualiza para sem .0
                        existing.codigo_linx = codigo_linx
                
                # Preparar dados do produto usando safe_str para todos os campos de texto
                # codigo_barras pode vir como float do Excel (ex: 3605531812213.0)
                codigo_barras_raw = row.get("CODIGO_BARRAS")
                codigo_barras = safe_str(codigo_barras_raw)
                # Garantir que código de barras não tenha .0 no final
                if codigo_barras and codigo_barras.endswith('.0') and codigo_barras.replace('.0', '').isdigit():
                    codigo_barras = codigo_barras[:-2]
                
                product_data = {
                    "codigo_linx": codigo_linx,
                    "descricao": safe_str(row.get("DESCRICAO")),
                    "sku": safe_str(row.get("SKU")),
                    "codigo_barras": codigo_barras,
                }
                
                # Processar preço (pode estar em PRECO_CUSTO, PRECO ou CUSTO)
                preco = None
                for col in ["PRECO_CUSTO", "PRECO", "CUSTO"]:
                    if col in df.columns:
                        valor = row.get(col)
                        if pd.notna(valor):
                            try:
                                # Converte para string primeiro, depois para Decimal
                                if isinstance(valor, (int, float)):
                                    preco = Decimal(str(valor).replace(",", "."))
                                else:
                                    preco = Decimal(str(valor).replace(",", "."))
                                break
                            except (ValueError, TypeError, Exception):
                                pass
                
                product_data["preco_custo"] = preco
                
                # Remover valores vazios e garantir que strings são realmente strings
                cleaned_data = {}
                for k, v in product_data.items():
                    if v is None:
                        cleaned_data[k] = None
                    elif k == "preco_custo":
                        # Preço já é Decimal ou None
                        cleaned_data[k] = v
                    elif isinstance(v, str):
                        # Se já é string, mantém
                        cleaned_data[k] = v if v.strip() else None
                    else:
                        # Converte para string se necessário
                        cleaned_data[k] = safe_str(v)
                
                product_data = cleaned_data
                
                # Garantir que codigo_linx é sempre string (não pode ser None)
                if not product_data.get("codigo_linx"):
                    skipped_count += 1
                    continue
                
                if existing:
                    if update_existing:
                        # Atualizar produto existente
                        try:
                            for key, value in product_data.items():
                                if key != "codigo_linx" and value is not None:
                                    setattr(existing, key, value)
                            # Commit imediato da atualização
                            db.commit()
                            updated_count += 1
                        except Exception as update_error:
                            db.rollback()
                            errors.append(f"Linha {index + 2}: Erro ao atualizar produto {codigo_linx} - {str(update_error)}")
                            continue
                    else:
                        skipped_count += 1
                else:
                    # Adicionar à lista para criar em lote
                    products_to_add.append((index, product_data, codigo_linx))
                    
            except Exception as e:
                error_msg = f"Linha {index + 2}: {str(e)}"
                # Adicionar mais contexto se possível
                try:
                    codigo_linx_info = f" (CODIGO_LINX: {row.get('CODIGO_LINX', 'N/A')})"
                    error_msg += codigo_linx_info
                except:
                    pass
                errors.append(error_msg)
                continue
        
        # Processar produtos em lotes
        for batch_start in range(0, len(products_to_add), BATCH_SIZE):
            batch = products_to_add[batch_start:batch_start + BATCH_SIZE]
            batch_created = 0
            
            for index, product_data, codigo_linx in batch:
                try:
                    db_product = Product(**product_data)
                    db.add(db_product)
                    batch_created += 1
                except Exception as create_error:
                    error_msg = str(create_error)
                    # Se for erro de duplicata
                    if "Duplicate entry" in error_msg or "1062" in error_msg or "UNIQUE constraint" in error_msg:
                        # Verifica se realmente existe
                        existing_check = db.query(Product).filter(Product.codigo_linx == codigo_linx).first()
                        if existing_check:
                            errors.append(f"Linha {index + 2}: Produto com CODIGO_LINX '{codigo_linx}' já existe (duplicata)")
                            skipped_count += 1
                        else:
                            errors.append(f"Linha {index + 2}: Erro de duplicata ao criar produto '{codigo_linx}'")
                            skipped_count += 1
                    else:
                        errors.append(f"Linha {index + 2}: Erro ao criar produto '{codigo_linx}' - {error_msg}")
            
            # Commit do lote
            if batch_created > 0:
                try:
                    db.commit()
                    created_count += batch_created
                except Exception as commit_error:
                    db.rollback()
                    error_msg = str(commit_error)
                    if "Duplicate entry" in error_msg or "1062" in error_msg:
                        # Se houver duplicata no commit, processa um por um
                        for idx, pd_data, clx in batch:
                            try:
                                existing = db.query(Product).filter(Product.codigo_linx == clx).first()
                                if not existing:
                                    db_product = Product(**pd_data)
                                    db.add(db_product)
                                    db.commit()
                                    created_count += 1
                                else:
                                    skipped_count += 1
                            except Exception:
                                db.rollback()
                                skipped_count += 1
        
        # Atualizações já foram commitadas individualmente acima
        
        # Refresh dos produtos criados (não é estritamente necessário, mas ajuda)
        # Removido para evitar problemas com tipos - o commit já persiste os dados
        
        return {
            "message": "Importação concluída",
            "created": created_count,
            "updated": updated_count,
            "skipped": skipped_count,
            "errors": errors if errors else None,
            "total_rows": len(df)
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A planilha está vazia"
        )
    except HTTPException:
        # Re-raise HTTPExceptions (já formatadas)
        raise
    except Exception as e:
        # Log do erro completo para debug
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Erro ao processar planilha: {str(e)}\n{error_trace}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar planilha: {str(e)}"
        )
