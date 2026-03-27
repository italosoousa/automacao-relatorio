from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.retirada_loja import RetiradaLoja, RetiradaLojaItem
from app.schemas.retirada_loja import (
    RetiradaLojaCreate,
    RetiradaLojaResponse,
    RetiradaLojaListItem,
    ProductLookupResponse,
)
from app.services.product_service import get_product_by_codigo_barras

router = APIRouter(prefix="/api/retirada-lojas", tags=["retirada_lojas"])


@router.get("/lookup/barcode/{barcode}", response_model=ProductLookupResponse)
async def lookup_product_by_barcode(barcode: str, db: Session = Depends(get_db)):
    """Busca produto pelo código de barras para uso na bipagem"""
    product = get_product_by_codigo_barras(db, barcode)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Produto não encontrado para o código de barras: {barcode}",
        )
    return ProductLookupResponse(
        codigo_linx=product.codigo_linx,
        descricao=product.descricao,
        preco_custo=float(product.preco_custo) if product.preco_custo is not None else None,
        codigo_barras=product.codigo_barras,
        sku=product.sku,
    )


@router.get("/", response_model=List[RetiradaLojaListItem])
async def list_retiradas(
    skip: int = 0,
    limit: int = 100,
    loja: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Lista retiradas para lojas salvas"""
    query = db.query(RetiradaLoja)
    if loja:
        query = query.filter(RetiradaLoja.loja == loja)
    retiradas = query.order_by(RetiradaLoja.created_at.desc()).offset(skip).limit(limit).all()
    return [
        RetiradaLojaListItem(
            id=r.id,
            loja=r.loja,
            responsavel=r.responsavel,
            created_at=r.created_at,
            total_items=len(r.items),
        )
        for r in retiradas
    ]


@router.get("/{retirada_id}", response_model=RetiradaLojaResponse)
async def get_retirada(retirada_id: int, db: Session = Depends(get_db)):
    """Busca uma retirada por ID com todos os seus itens"""
    retirada = db.query(RetiradaLoja).filter(RetiradaLoja.id == retirada_id).first()
    if not retirada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Retirada {retirada_id} não encontrada",
        )
    return retirada


@router.post("/", response_model=RetiradaLojaResponse, status_code=status.HTTP_201_CREATED)
async def create_retirada(payload: RetiradaLojaCreate, db: Session = Depends(get_db)):
    """Salva uma retirada para loja com todos os itens bipados"""
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A retirada deve conter pelo menos um item.",
        )

    retirada = RetiradaLoja(
        loja=payload.loja,
        responsavel=payload.responsavel,
        observacao=payload.observacao,
    )
    db.add(retirada)
    db.flush()

    for item_data in payload.items:
        item = RetiradaLojaItem(
            retirada_id=retirada.id,
            codigo_linx=item_data.codigo_linx,
            codigo_barras=item_data.codigo_barras,
            descricao=item_data.descricao,
            preco_custo=item_data.preco_custo,
        )
        db.add(item)

    db.commit()
    db.refresh(retirada)
    return retirada
