from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LogBase(BaseModel):
    tipo_relatorio: str
    detalhes: Optional[str] = None
    arquivo_origem: Optional[str] = None


class LogCreate(LogBase):
    pass


class LogResponse(LogBase):
    id: int
    horario: datetime

    class Config:
        from_attributes = True
