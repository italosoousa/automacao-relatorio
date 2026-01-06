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
    BASE_DESC_NAMES, BASE_DESC_INDEX,
    ML_SALE_NUMBER_NAMES, ML_SALE_NUMBER_INDEX,
    ML_SALE_DATE_NAMES, ML_SALE_DATE_INDEX,
    ML_STATUS_DESC_NAMES, ML_STATUS_DESC_INDEX,
    ML_REVENUE_NAMES, ML_REVENUE_INDEX,
    ML_FEE_NAMES, ML_FEE_INDEX,
    ML_SHIPPING_FEE_NAMES, ML_SHIPPING_FEE_INDEX,
    ML_LISTING_ID_NAMES, ML_LISTING_ID_INDEX,
)
from app.utils.money import parse_money_brl


def _safe_parse_money(value):
    if value is None:
        return np.nan
    if isinstance(value, float) and np.isnan(value):
        return np.nan
    if isinstance(value, str) and value.strip() == "":
        return np.nan
    try:
        return parse_money_brl(value)
    except Exception:
        return np.nan


def _nan_to_none_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    Garante que não exista NaN/Inf no DF (JSON do FastAPI não aceita).
    """
    df = df.replace([np.nan, np.inf, -np.inf], None)
    return df


def process_dashboard_data(df_ml: pd.DataFrame, df_base: pd.DataFrame) -> Dict[str, Any]:
    # 1) Identificar colunas
    ml_sku_col = find_column(df_ml, ML_SKU_NAMES, ML_SKU_INDEX)
    ml_state_col = find_column(df_ml, ML_STATE_NAMES, ML_STATE_INDEX)
    ml_value_col = find_column(df_ml, ML_VALUE_NAMES, ML_VALUE_INDEX)
    ml_desc_col = find_column(df_ml, ML_DESC_NAMES, ML_DESC_INDEX)

    ml_sale_number_col = find_column(df_ml, ML_SALE_NUMBER_NAMES, ML_SALE_NUMBER_INDEX)
    ml_sale_date_col = find_column(df_ml, ML_SALE_DATE_NAMES, ML_SALE_DATE_INDEX)
    ml_status_desc_col = find_column(df_ml, ML_STATUS_DESC_NAMES, ML_STATUS_DESC_INDEX)
    ml_revenue_col = find_column(df_ml, ML_REVENUE_NAMES, ML_REVENUE_INDEX)
    ml_fee_col = find_column(df_ml, ML_FEE_NAMES, ML_FEE_INDEX)
    ml_shipping_fee_col = find_column(df_ml, ML_SHIPPING_FEE_NAMES, ML_SHIPPING_FEE_INDEX)
    ml_listing_id_col = find_column(df_ml, ML_LISTING_ID_NAMES, ML_LISTING_ID_INDEX)

    base_ref_col = find_column(df_base, BASE_REF_NAMES, BASE_REF_INDEX)
    base_cost_col = find_column(df_base, BASE_COST_NAMES, BASE_COST_INDEX)
    base_desc_col = find_column(df_base, BASE_DESC_NAMES, BASE_DESC_INDEX)

    # Mínimo para funcionar
    if not ml_sku_col or not ml_value_col:
        raise ValueError("Não foi possível encontrar SKU e Valor/Total na planilha do Mercado Livre.")
    if not base_ref_col:
        raise ValueError("Não foi possível encontrar a coluna Referência na base de produtos.")

    # 2) Selecionar colunas encontradas e renomear
    ml_cols_to_keep = [
        ml_sku_col, ml_state_col, ml_value_col, ml_desc_col,
        ml_sale_number_col, ml_sale_date_col, ml_status_desc_col,
        ml_revenue_col, ml_fee_col, ml_shipping_fee_col, ml_listing_id_col
    ]
    ml_cols_to_keep = [c for c in ml_cols_to_keep if c and c in df_ml.columns]
    df_ml_processed = df_ml.loc[:, ml_cols_to_keep].copy()

    rename_map_ml = {
        ml_sku_col: "sku",
        ml_state_col: "estado",
        ml_value_col: "total",
        ml_desc_col: "descricao_ml",
        ml_sale_number_col: "sale_number",
        ml_sale_date_col: "sale_date",
        ml_status_desc_col: "status_description",
        ml_revenue_col: "revenue_product",
        ml_fee_col: "fee_taxes",
        ml_shipping_fee_col: "shipping_fees",
        ml_listing_id_col: "ml_listing_id",
    }
    rename_map_ml = {k: v for k, v in rename_map_ml.items() if k and k in df_ml_processed.columns}
    df_ml_processed = df_ml_processed.rename(columns=rename_map_ml)

    base_cols_to_keep = [base_ref_col, base_cost_col, base_desc_col]
    base_cols_to_keep = [c for c in base_cols_to_keep if c and c in df_base.columns]
    df_base_processed = df_base.loc[:, base_cols_to_keep].copy()

    rename_map_base = {base_ref_col: "referencia"}
    if base_cost_col and base_cost_col in df_base_processed.columns:
        rename_map_base[base_cost_col] = "cost"
    if base_desc_col and base_desc_col in df_base_processed.columns:
        rename_map_base[base_desc_col] = "descricao_base"

    df_base_processed = df_base_processed.rename(columns=rename_map_base)

    # 3) Normalização
    df_ml_processed["sku"] = df_ml_processed["sku"].astype(str).str.strip()
    df_ml_processed["total"] = df_ml_processed["total"].apply(_safe_parse_money)

    optional_defaults = {
        "estado": "Não especificado",
        "descricao_ml": "",
        "sale_number": "",
        "sale_date": "",
        "status_description": "",
        "revenue_product": np.nan,
        "fee_taxes": np.nan,
        "shipping_fees": np.nan,
        "ml_listing_id": "",
    }
    for col, default in optional_defaults.items():
        if col not in df_ml_processed.columns:
            df_ml_processed[col] = default

    df_ml_processed["estado"] = df_ml_processed["estado"].fillna("Não especificado")
    for col in ["sale_number", "ml_listing_id", "sale_date", "status_description", "descricao_ml"]:
        df_ml_processed[col] = df_ml_processed[col].astype(str).fillna("").str.strip()

    for col in ["revenue_product", "fee_taxes", "shipping_fees"]:
        df_ml_processed[col] = df_ml_processed[col].apply(_safe_parse_money)

    df_ml_processed["status_group"] = df_ml_processed["estado"].apply(normalize_status_group)

    df_base_processed["referencia"] = df_base_processed["referencia"].astype(str).str.strip()
    if "cost" not in df_base_processed.columns:
        df_base_processed["cost"] = np.nan
    else:
        df_base_processed["cost"] = df_base_processed["cost"].apply(_safe_parse_money)

    if "descricao_base" not in df_base_processed.columns:
        df_base_processed["descricao_base"] = ""

    df_base_processed = df_base_processed.drop_duplicates(subset=["referencia"], keep="first")

    # 4) Merge
    df_merged = pd.merge(
        df_ml_processed,
        df_base_processed,
        left_on="sku",
        right_on="referencia",
        how="left",
    )

    # 5) Lucro
    total_num = pd.to_numeric(df_merged["total"], errors="coerce")
    cost_num = pd.to_numeric(df_merged["cost"], errors="coerce")
    df_merged["lucro_bruto"] = total_num - cost_num
    df_merged.loc[df_merged["status_group"].isin(["CANCELADO", "MEDIACAO"]), "lucro_bruto"] = 0

    # Descrição consolidada
    df_merged["descricao"] = df_merged["descricao_base"].replace({np.nan: ""})
    df_merged.loc[df_merged["descricao"].astype(str).str.strip() == "", "descricao"] = df_merged["descricao_ml"]
    df_merged["descricao"] = df_merged["descricao"].replace({np.nan: ""})
    df_merged.loc[df_merged["descricao"].astype(str).str.strip() == "", "descricao"] = "SKU sem cadastro na base"

    skus_sem_cadastro = int(df_merged["referencia"].isna().sum())

    # Missing SKUs
    df_missing = df_merged[df_merged["referencia"].isna()].copy()
    df_missing = df_missing.fillna({"sku": "N/A", "descricao": "N/A", "estado": "N/A"})
    missing_skus_list = df_missing[["sku", "descricao", "estado"]].to_dict(orient="records")

    # 6) Resposta
    result_columns = [
        "sku", "descricao", "estado", "lucro_bruto", "status_group",
        "sale_number", "sale_date", "status_description", "revenue_product",
        "fee_taxes", "shipping_fees", "total", "cost", "ml_listing_id",
    ]
    for col in result_columns:
        if col not in df_merged.columns:
            df_merged[col] = np.nan

    result_df = df_merged.loc[:, result_columns].copy()

    fill_values = {
        "sku": "N/A",
        "descricao": "N/A",
        "estado": "N/A",
        "status_group": "A_ENVIAR",
        "sale_number": "",
        "sale_date": "",
        "status_description": "",
        "ml_listing_id": "",
    }
    result_df = result_df.fillna(value=fill_values)

    # >>> AQUI está a correção que mata o erro do JSON (NaN -> None)
    result_df = _nan_to_none_df(result_df)

    rows = result_df.to_dict(orient="records")

    total_lucro = float(pd.to_numeric(df_merged["lucro_bruto"], errors="coerce").fillna(0).sum())
    total_itens = len(rows)

    summary = {
        "total_lucro": total_lucro,
        "total_itens": total_itens,
        "skus_sem_cadastro": skus_sem_cadastro,
    }

    filter_options = {
        "states": sorted(list(pd.Series(result_df["estado"]).fillna("N/A").astype(str).unique())),
        "status_group": ["ENVIADO", "A_ENVIAR", "MEDIACAO", "CANCELADO"],
    }

    return {
        "rows": rows,
        "summary": summary,
        "filter_options": filter_options,
        "missing_skus": missing_skus_list,
    }
