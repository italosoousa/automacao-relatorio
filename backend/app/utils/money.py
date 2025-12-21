# /backend/app/utils/money.py
import re
from typing import Union

def parse_money_brl(value: Union[str, int, float]) -> float:
    """
    Converte um valor monetário em string (formato BRL) para float.
    Exemplos: "R$ 1.234,56" -> 1234.56 | "1,23" -> 1.23
    """
    if isinstance(value, (int, float)):
        return float(value)
    
    if not isinstance(value, str) or not value.strip():
        return 0.0

    # Remove o símbolo de R$, espaços e pontos de milhar
    value = value.strip().replace("R$", "").replace(".", "").strip()
    
    # Substitui a vírgula decimal por um ponto
    value = value.replace(",", ".")
    
    # Remove caracteres não numéricos restantes (exceto o ponto decimal)
    value = re.sub(r"[^0-9.]", "", value)

    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0
