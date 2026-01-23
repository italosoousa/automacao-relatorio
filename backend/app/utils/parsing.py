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
    """
    Converte valor para string de forma segura.
    Trata None, NaN, float, int, e outros tipos.
    Remove .0 de floats inteiros do Excel.
    """
    if value is None:
        return None
    try:
        if pd.isna(value):
            return None
        
        # Se for float, trata especialmente (remove .0 se for inteiro)
        if isinstance(value, float):
            # Se for NaN (já verificado acima, mas por segurança)
            if pd.isna(value):
                return None
            # Se for um float inteiro (ex: 12345.0, 48.0), converte para int primeiro
            if value.is_integer():
                s = str(int(value))
            else:
                # Para floats decimais, remove zeros à direita desnecessários
                s = str(value)
                if '.' in s:
                    s = s.rstrip('0').rstrip('.')
        elif isinstance(value, int):
            s = str(value)
        else:
            s = str(value)
            # Se a string resultante termina com .0, remove
            if s.endswith('.0') and s.replace('.0', '').replace('-', '').isdigit():
                s = s[:-2]
        
        s = s.strip()
        return s if s and s.lower() not in ["nan", "none", ""] else None
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
