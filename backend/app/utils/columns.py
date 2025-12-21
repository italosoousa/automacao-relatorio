# /backend/app/utils/columns.py

# Nomes de colunas primários e alternativos para a planilha do Mercado Livre
ML_SKU_NAMES = ["SKU"]
ML_STATE_NAMES = ["Estado"]
ML_VALUE_NAMES = ["Total (BRL)", "Total", "Receita", "Valor"]
ML_DESC_NAMES = ["Título do anúncio"] # Fallback para descrição

# Índices de fallback baseados em letras de coluna (0-indexed)
# C=2, Q=16, T=19
ML_SKU_INDEX = 19
ML_STATE_INDEX = 2
ML_VALUE_INDEX = 16
ML_DESC_INDEX = 1 # Fallback para B, "Título do anúncio"

# Nomes de colunas para a planilha Base de Produtos
BASE_REF_NAMES = ["Referência"]
BASE_COST_NAMES = ["Custo"]
BASE_DESC_NAMES = ["Descrição", "Descricao", "Nome do Produto"]

# Índices de fallback para a planilha Base
# D=3, H=7
BASE_REF_INDEX = 3
BASE_COST_INDEX = 7
BASE_DESC_INDEX = 1 # Fallback para B, uma coluna de descrição provável
