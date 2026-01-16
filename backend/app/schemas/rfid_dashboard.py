from pydantic import BaseModel
from typing import List, Optional


class RFIDRow(BaseModel):
    """Representa uma linha do relatório de conferência RFID vs MICROVIX."""
    codigo_barras: str
    descricao: Optional[str] = None
    qtd_microvix: int
    qtd_rfid: int
    diferenca: int  # qtd_rfid - qtd_microvix (positivo = sobrando, negativo = faltando)
    status: str  # OK, FALTANDO, SOBRANDO, SO_MICROVIX, SO_RFID


class RFIDCards(BaseModel):
    """Cards de resumo do dashboard RFID."""
    total_itens_microvix: int  # Soma das quantidades do MICROVIX
    total_itens_rfid: int      # Soma das quantidades do RFID
    total_divergencias: int    # Quantidade de EANs com status != OK
    itens_ok: int              # Quantidade de EANs com status OK
    itens_faltando: int        # Quantidade de EANs com status FALTANDO
    itens_sobrando: int        # Quantidade de EANs com status SOBRANDO
    itens_so_microvix: int     # Quantidade de EANs apenas no MICROVIX
    itens_so_rfid: int         # Quantidade de EANs apenas no RFID


class RFIDDashboardResponse(BaseModel):
    """Resposta completa do endpoint de dashboard RFID."""
    cards: RFIDCards
    divergencias: List[RFIDRow]  # Itens com status != OK
    ok: List[RFIDRow]            # Itens com status OK
    all: List[RFIDRow]           # Todos os itens (útil para tabela completa e filtros)
