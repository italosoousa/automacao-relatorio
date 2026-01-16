import re
import pandas as pd


def norm_sku(value) -> str | None:
    """Normaliza SKU para conseguir bater ML vs Base."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    s = str(value).strip()
    if not s:
        return None
    # remove espaços extras
    s = re.sub(r"\s+", "", s)
    return s


def to_float(value) -> float | None:
    """Converte valores numéricos com NaN -> None."""
    if value is None:
        return None
    try:
        if pd.isna(value):
            return None
        return float(value)
    except Exception:
        return None


def safe_str(value) -> str | None:
    if value is None:
        return None
    try:
        if pd.isna(value):
            return None
        s = str(value).strip()
        return s if s else None
    except Exception:
        return None


def norm_ean(value) -> str | None:
    """
    Normaliza código de barras (EAN) para cruzamento RFID vs MICROVIX.
    Remove espaços, .0 do Excel, e caracteres estranhos.
    """
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    
    s = str(value).strip()
    if not s:
        return None
    
    # Remove .0 que pode vir do Excel quando o EAN é numérico
    if s.endswith('.0'):
        s = s[:-2]
    
    # Remove espaços extras e caracteres não numéricos comuns
    s = re.sub(r"\s+", "", s)
    
    # Remove aspas que podem vir do CSV
    s = s.replace('"', '').replace("'", '')
    
    return s if s else None


def to_int(value) -> int | None:
    """
    Converte valores para inteiro com segurança.
    Trata NaN, strings vazias, floats e strings.
    """
    if value is None:
        return None
    try:
        if pd.isna(value):
            return None
        
        # Se for string, limpa e converte
        if isinstance(value, str):
            s = value.strip()
            if not s:
                return None
            # Remove vírgulas de milhares se houver
            s = s.replace(',', '').replace('.', '')
            return int(float(s))
        
        # Se for float ou int, converte direto
        return int(float(value))
    except (ValueError, TypeError):
        return None
