from pydantic import BaseModel
from typing import List, Optional


class DashboardRow(BaseModel):
    sku: Optional[str] = None
    descricao: str
    estado: Optional[str] = None
    lucro_bruto: Optional[float] = None
    status_group: str

    # campos do modal
    sale_number: Optional[str] = None
    sale_date: Optional[str] = None
    status_description: Optional[str] = None
    revenue_product: Optional[float] = None
    fee_taxes: Optional[float] = None
    shipping_fees: Optional[float] = None
    total: Optional[float] = None
    cost: Optional[float] = None
    ml_listing_id: Optional[str] = None


class MissingSkuItem(BaseModel):
    sku: Optional[str] = None
    descricao: str
    estado: Optional[str] = None


class DashboardSummary(BaseModel):
    total_lucro: float
    total_itens: int
    skus_sem_cadastro: int


class FilterOptions(BaseModel):
    states: List[str]
    status_group: List[str]


class DashboardResponse(BaseModel):
    rows: List[DashboardRow]
    summary: DashboardSummary
    filter_options: FilterOptions
    missing_skus: List[MissingSkuItem]
