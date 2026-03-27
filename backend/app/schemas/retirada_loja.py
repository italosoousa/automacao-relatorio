from pydantic import BaseModel
from decimal import Decimal
from typing import Optional, List
from datetime import datetime


class ProductLookupResponse(BaseModel):
    codigo_linx: str
    descricao: Optional[str] = None
    preco_custo: Optional[float] = None
    codigo_barras: Optional[str] = None
    sku: Optional[str] = None


class RetiradaLojaItemCreate(BaseModel):
    codigo_linx: Optional[str] = None
    codigo_barras: Optional[str] = None
    descricao: Optional[str] = None
    preco_custo: Optional[Decimal] = None


class RetiradaLojaItemResponse(BaseModel):
    id: int
    retirada_id: int
    codigo_linx: Optional[str] = None
    codigo_barras: Optional[str] = None
    descricao: Optional[str] = None
    preco_custo: Optional[Decimal] = None

    class Config:
        from_attributes = True


class RetiradaLojaCreate(BaseModel):
    loja: str
    responsavel: str
    observacao: Optional[str] = None
    items: List[RetiradaLojaItemCreate]


class RetiradaLojaResponse(BaseModel):
    id: int
    loja: str
    responsavel: str
    observacao: Optional[str] = None
    created_at: datetime
    items: List[RetiradaLojaItemResponse]

    # Aprovação
    status: str = "pendente"
    aprovado_por: Optional[str] = None
    aprovado_em: Optional[datetime] = None
    motivo_rejeicao: Optional[str] = None

    # Robô Playwright (integração futura)
    robo_executado: bool = False
    robo_executado_em: Optional[datetime] = None
    robo_resultado: Optional[str] = None

    class Config:
        from_attributes = True


class RetiradaLojaListItem(BaseModel):
    id: int
    loja: str
    responsavel: str
    created_at: datetime
    total_items: int

    # Aprovação
    status: str = "pendente"
    aprovado_por: Optional[str] = None
    aprovado_em: Optional[datetime] = None
    motivo_rejeicao: Optional[str] = None

    # Robô Playwright (integração futura)
    robo_executado: bool = False
    robo_executado_em: Optional[datetime] = None
    robo_resultado: Optional[str] = None

    class Config:
        from_attributes = True


# ── Requests de aprovação/rejeição ─────────────────────────────────────────────

class AprovarRetiradaRequest(BaseModel):
    aprovado_por: str


class RejeitarRetiradaRequest(BaseModel):
    motivo_rejeicao: str
