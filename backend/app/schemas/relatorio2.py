from pydantic import BaseModel
from typing import List, Optional, Any, Dict


# TODO: Customizar os schemas conforme necessário para o Relatório 2
class Relatorio2Row(BaseModel):
    # Exemplo de campos - ajustar conforme necessário
    id: Optional[str] = None
    campo1: Optional[str] = None
    campo2: Optional[float] = None
    # Adicionar mais campos conforme necessário


class Relatorio2Summary(BaseModel):
    total_itens: int
    # Adicionar mais campos de resumo conforme necessário


class Relatorio2Response(BaseModel):
    rows: List[Relatorio2Row]
    summary: Relatorio2Summary
    # Adicionar mais campos conforme necessário
