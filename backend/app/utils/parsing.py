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
