from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    codigo_linx: str
    descricao: Optional[str] = None
    sku: Optional[str] = None
    codigo_barras: Optional[str] = None
    preco_custo: Optional[Decimal] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    descricao: Optional[str] = None
    sku: Optional[str] = None
    codigo_barras: Optional[str] = None
    preco_custo: Optional[Decimal] = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
