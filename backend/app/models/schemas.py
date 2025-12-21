# /backend/app/models/schemas.py
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class DashboardRow(BaseModel):
    sku: Optional[str]
    descricao: str
    estado: Optional[str]
    lucro_bruto: Optional[float]

# Novo schema para a lista de SKUs não encontrados
class MissingSkuRow(BaseModel):
    sku: Optional[str]
    descricao: str
    estado: Optional[str]

class DashboardSummary(BaseModel):
    total_lucro: float
    total_itens: int
    skus_sem_cadastro: int

class DashboardResponse(BaseModel):
    rows: List[DashboardRow]
    summary: DashboardSummary
    states: List[str]
    missing_skus: List[MissingSkuRow] # Nova lista