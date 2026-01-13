from pydantic import BaseModel
from typing import List, Optional, Any, Dict


# TODO: Customizar os schemas conforme necessário para o Dashboard RFID
class RfidDashboardRow(BaseModel):
    # Exemplo de campos - ajustar conforme necessário
    id: Optional[str] = None
    campo1: Optional[str] = None
    campo2: Optional[float] = None
    # Adicionar mais campos conforme necessário


class RfidDashboardSummary(BaseModel):
    total_itens: int
    # Adicionar mais campos de resumo conforme necessário


class RfidDashboardResponse(BaseModel):
    rows: List[RfidDashboardRow]
    summary: RfidDashboardSummary
    # Adicionar mais campos conforme necessário
