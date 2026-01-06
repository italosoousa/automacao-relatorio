# /backend/app/models/schemas.py
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class DashboardRow(BaseModel):
    # Campos existentes
    sku: Optional[str]
    descricao: str
    estado: Optional[str]
    lucro_bruto: Optional[float]
    status_group: str

    # Novos campos para o modal de detalhes
    sale_number: Optional[str]
    sale_date: Optional[str]
    status_description: Optional[str]
    revenue_product: Optional[float]
    fee_taxes: Optional[float]
    shipping_fees: Optional[float]
    total: Optional[float]
    cost: Optional[float]
    ml_listing_id: Optional[str]

class MissingSkuRow(BaseModel):
    sku: Optional[str]
    descricao: str
    estado: Optional[str]

class DashboardSummary(BaseModel):
    total_lucro: float
    total_itens: int
    skus_sem_cadastro: int

# NOVO MODELO PARA FILTROS
class FilterOptions(BaseModel):
    states: List[str]
    status_group: List[str]

class DashboardResponse(BaseModel):
    rows: List[DashboardRow]
    summary: DashboardSummary
    filter_options: FilterOptions # ALTERADO DE 'states'
    missing_skus: List[MissingSkuRow]