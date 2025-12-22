# /backend/app/services/dashboard.py
import pandas as pd
import numpy as np
from typing import Dict, Any

from app.services.normalize import find_column, normalize_status_group
from app.utils.columns import (
    ML_SKU_NAMES, ML_SKU_INDEX,
    ML_STATE_NAMES, ML_STATE_INDEX,
    ML_VALUE_NAMES, ML_VALUE_INDEX,
    ML_DESC_NAMES, ML_DESC_INDEX,
    BASE_REF_NAMES, BASE_REF_INDEX,
    BASE_COST_NAMES, BASE_COST_INDEX,
    BASE_DESC_NAMES, BASE_DESC_INDEX
)
from app.utils.money import parse_money_brl

def process_dashboard_data(df_ml: pd.DataFrame, df_base: pd.DataFrame) -> Dict[str, Any]:
    # 1. Identificar colunas
    ml_sku_col = find_column(df_ml, ML_SKU_NAMES, ML_SKU_INDEX)
    ml_state_col = find_column(df_ml, ML_STATE_NAMES, ML_STATE_INDEX)
    ml_value_col = find_column(df_ml, ML_VALUE_NAMES, ML_VALUE_INDEX)
    ml_desc_col = find_column(df_ml, ML_DESC_NAMES, ML_DESC_INDEX)
    
    base_ref_col = find_column(df_base, BASE_REF_NAMES, BASE_REF_INDEX)
    base_cost_col = find_column(df_base, BASE_COST_NAMES, BASE_COST_INDEX)
    base_desc_col = find_column(df_base, BASE_DESC_NAMES, BASE_DESC_INDEX)

    if not all([ml_sku_col, base_ref_col]):
        raise ValueError("Não foi possível encontrar a coluna de SKU/Referência em uma das planilhas.")

    # 2. Renomear e selecionar colunas
    df_ml_processed = df_ml[[ml_sku_col, ml_state_col, ml_value_col, ml_desc_col]].copy()
    df_ml_processed.rename(columns={
        ml_sku_col: 'sku',
        ml_state_col: 'estado',
        ml_value_col: 'valor_ml',
        ml_desc_col: 'descricao_ml'
    }, inplace=True)

    df_base_processed = df_base[[base_ref_col, base_cost_col, base_desc_col]].copy()
    df_base_processed.rename(columns={
        base_ref_col: 'referencia',
        base_cost_col: 'custo',
        base_desc_col: 'descricao_base'
    }, inplace=True)

    # 3. Converter tipos e normalizar
    df_ml_processed['sku'] = df_ml_processed['sku'].astype(str).str.strip()
    df_ml_processed['valor_ml'] = df_ml_processed['valor_ml'].apply(parse_money_brl)
    df_ml_processed['estado'].fillna('Não especificado', inplace=True)

    # NOVA ETAPA: Criar a coluna de status agrupado
    df_ml_processed['status_group'] = df_ml_processed['estado'].apply(normalize_status_group)

    df_base_processed['referencia'] = df_base_processed['referencia'].astype(str).str.strip()
    df_base_processed['custo'] = df_base_processed['custo'].apply(parse_money_brl)
    
    df_base_processed.drop_duplicates(subset=['referencia'], keep='first', inplace=True)

    # 4. Fazer o merge
    df_merged = pd.merge(df_ml_processed, df_base_processed, left_on='sku', right_on='referencia', how='left')

    # 5. Calcular lucro e tratar SKUs
    df_merged['lucro_bruto'] = df_merged['valor_ml'] - df_merged['custo']

    # Nova regra de negócio: Zerar lucro para status CANCELADO ou MEDIACAO
    df_merged.loc[df_merged['status_group'].isin(['CANCELADO', 'MEDIACAO']), 'lucro_bruto'] = 0
    
    df_merged['lucro_bruto'] = df_merged['lucro_bruto'].replace({np.nan: None})
    df_merged['descricao'] = df_merged['descricao_base'].fillna(df_merged['descricao_ml'])
    df_merged['descricao'].fillna("SKU sem cadastro na base", inplace=True)

    skus_sem_cadastro = int(df_merged['referencia'].isna().sum())

    # 6. Montar a resposta
    df_missing = df_merged[df_merged['referencia'].isna()].copy()
    df_missing.fillna({'sku': 'N/A', 'descricao': 'N/A', 'estado': 'N/A'}, inplace=True)
    missing_skus_list = df_missing[['sku', 'descricao', 'estado']].to_dict(orient='records')

    # Garantir que a coluna 'status_group' exista no result_df
    result_df = df_merged[['sku', 'descricao', 'estado', 'lucro_bruto', 'status_group']].copy()
    result_df.fillna({'sku': 'N/A', 'descricao': 'N/A', 'estado': 'N/A', 'status_group': 'A_ENVIAR'}, inplace=True)
    
    rows = result_df.to_dict(orient='records')
    total_lucro = float(result_df['lucro_bruto'].sum())
    total_itens = len(rows)
    
    # Opções de filtro para o frontend
    filter_options = {
        "states": sorted(list(result_df['estado'].unique())),
        "status_group": ["ENVIADO", "A_ENVIAR", "MEDIACAO", "CANCELADO"]
    }
    
    summary = {
        "total_lucro": total_lucro,
        "total_itens": total_itens,
        "skus_sem_cadastro": skus_sem_cadastro
    }

    return {
        "rows": rows, 
        "summary": summary, 
        "filter_options": filter_options, # Alterado de 'states' para 'filter_options'
        "missing_skus": missing_skus_list
    }