# /backend/app/services/normalize.py
import re
import pandas as pd
from typing import List, Optional

def normalize_col_name(name: str) -> str:
    """
    Normaliza o nome de uma coluna: minúsculas, sem acentos, 
    sem espaços duplicados e remove espaços nas extremidades.
    """
    if not isinstance(name, str):
        return ""
    # Mapeamento de acentos para seus equivalentes sem acento
    accent_map = {
        'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a',
        'é': 'e', 'ê': 'e',
        'í': 'i',
        'ó': 'o', 'ô': 'o', 'õ': 'o',
        'ú': 'u', 'ü': 'u',
        'ç': 'c'
    }
    
    name = name.lower().strip()
    for char, replacement in accent_map.items():
        name = name.replace(char, replacement)
    
    name = re.sub(r'\s+', ' ', name) # Remove espaços duplicados
    return name


def find_column(df: pd.DataFrame, possible_names: List[str], fallback_index: int) -> Optional[str]:
    """
    Encontra o nome real de uma coluna no DataFrame com base em uma lista de nomes possíveis.
    Se não encontrar por nome, usa o índice de fallback.
    """
    normalized_cols = {normalize_col_name(col): col for col in df.columns}
    
    for name in possible_names:
        normalized_name = normalize_col_name(name)
        if normalized_name in normalized_cols:
            return normalized_cols[normalized_name]
            
    # Fallback para o índice se nenhum nome for encontrado
    if 0 <= fallback_index < len(df.columns):
        return df.columns[fallback_index]
        
    return None
