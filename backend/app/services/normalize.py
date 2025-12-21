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


def normalize_status_group(text: str) -> str:
    """
    Normaliza o status do pedido em um dos 4 grupos definidos.
    A ordem de verificação é importante: MEDIACAO > CANCELADO > ENVIADO > A_ENVIAR.
    """
    if not isinstance(text, str):
        return "A_ENVIAR"

    # Reutiliza a normalização de texto para consistência (lowercase, sem acentos, etc)
    # Passamos por uma normalização inicial para remover acentos e caracteres especiais
    normalized_text = normalize_col_name(text)

    # 1. MEDIACAO
    mediation_keys = ["mediacao", "reclamacao"]
    if any(key in normalized_text for key in mediation_keys):
        return "MEDIACAO"

    # 2. CANCELADO
    cancel_keys = ["cancel", "cancelada", "venda cancelada", "pacote cancelado"]
    if any(key in normalized_text for key in cancel_keys):
        return "CANCELADO"

    # 3. ENVIADO
    sent_keys = ["entregue", "a caminho", "ponto de retirada", "chega"]
    if any(key in normalized_text for key in sent_keys):
        return "ENVIADO"

    # 4. A_ENVIAR (inclui o fallback)
    to_send_keys = ["etiqueta", "nf", "nfe", "informar", "para enviar", "combine"]
    if any(key in normalized_text for key in to_send_keys):
        return "A_ENVIAR"

    # Fallback default
    return "A_ENVIAR"
