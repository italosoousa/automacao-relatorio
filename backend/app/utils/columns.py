# /backend/app/utils/columns.py

# Nomes de colunas primários e alternativos para a planilha do Mercado Livre
ML_SKU_NAMES = ["SKU"]
ML_STATE_NAMES = ["Estado"]
ML_VALUE_NAMES = ["Total (BRL)", "Total", "Receita", "Valor"]
ML_DESC_NAMES = ["Título do anúncio"] # Fallback para descrição

# Novas colunas para o modal de detalhes
ML_SALE_NUMBER_NAMES = ["N.º de venda", "N de venda"]
ML_SALE_DATE_NAMES = ["Data da venda"]
ML_STATUS_DESC_NAMES = ["Descrição do status"]
ML_REVENUE_NAMES = ["Receita por produtos (BRL)"]
ML_FEE_NAMES = ["Tarifa de venda e impostos (BRL)"]
ML_SHIPPING_FEE_NAMES = ["Tarifas de envio (BRL)"]
ML_LISTING_ID_NAMES = ["# de anúncio"]

# Índices de fallback baseados em letras de coluna (0-indexed)
ML_SKU_INDEX = 19 # Coluna T
ML_STATE_INDEX = 2 # Coluna C
ML_VALUE_INDEX = 16 # Coluna Q
ML_DESC_INDEX = 1 # Fallback para B, "Título do anúncio"

# Índices para as novas colunas
ML_SALE_NUMBER_INDEX = 0 # Coluna A
ML_SALE_DATE_INDEX = 1 # Coluna B
ML_STATUS_DESC_INDEX = 3 # Coluna D
ML_REVENUE_INDEX = 7 # Coluna H
ML_FEE_INDEX = 10 # Coluna K
ML_SHIPPING_FEE_INDEX = 12 # Coluna M
ML_LISTING_ID_INDEX = 20 # Coluna U


# Nomes de colunas para a planilha Base de Produtos
BASE_REF_NAMES = ["Referência"]
BASE_COST_NAMES = ["Custo", "Custo Total Unit."]
BASE_DESC_NAMES = ["Descrição", "Descricao", "Nome do Produto"]

# Índices de fallback para a planilha Base
# D=3, H=7
BASE_REF_INDEX = 3
BASE_COST_INDEX = 7
BASE_DESC_INDEX = 1 # Fallback para B, uma coluna de descrição provável
