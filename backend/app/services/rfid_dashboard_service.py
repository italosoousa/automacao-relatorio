import pandas as pd
from io import BytesIO
from sqlalchemy.orm import Session
from app.utils.parsing import norm_ean, to_int, safe_str
from app.services.product_service import get_products_dict_by_codigo_barras


def build_rfid_dashboard(microvix_bytes: bytes, rfid_bytes: bytes, db: Session) -> dict:
    """
    Processa as planilhas MICROVIX e RFID e retorna o dashboard de conferência.
    
    Busca produtos do banco de dados usando código de barras para obter descrições.
    
    Args:
        microvix_bytes: Bytes do arquivo MICROVIX.xlsx
        rfid_bytes: Bytes do arquivo RFID.csv
        db: Sessão do banco de dados
    
    Returns:
        dict com estrutura: {cards, divergencias, ok, all}
    
    Raises:
        KeyError: Se colunas esperadas não existirem
        Exception: Outros erros de processamento
    """
    
    # ============================================================================
    # 1. LER E VALIDAR MICROVIX
    # ============================================================================
    try:
        df_microvix = pd.read_excel(BytesIO(microvix_bytes), engine="openpyxl")
    except Exception as e:
        raise Exception(f"Erro ao ler arquivo MICROVIX: {str(e)}")
    
    # Validar colunas esperadas no MICROVIX
    required_cols_microvix = ["EAN", "Qtd"]
    missing_cols = [col for col in required_cols_microvix if col not in df_microvix.columns]
    if missing_cols:
        raise KeyError(
            f"Colunas obrigatórias não encontradas no arquivo MICROVIX: {', '.join(missing_cols)}. "
            f"Colunas disponíveis: {', '.join(df_microvix.columns.tolist())}"
        )
    
    # ============================================================================
    # 2. LER E VALIDAR RFID
    # ============================================================================
    # Tenta UTF-8, depois latin-1
    try:
        df_rfid = pd.read_csv(
            BytesIO(rfid_bytes),
            sep=';',
            dtype=str,
            encoding='utf-8'
        )
    except UnicodeDecodeError:
        try:
            df_rfid = pd.read_csv(
                BytesIO(rfid_bytes),
                sep=';',
                dtype=str,
                encoding='latin-1'
            )
        except Exception as e:
            raise Exception(f"Erro ao ler arquivo RFID com encoding latin-1: {str(e)}")
    except Exception as e:
        raise Exception(f"Erro ao ler arquivo RFID: {str(e)}")
    
    # Validar colunas esperadas no RFID
    required_cols_rfid = ["EAN", "QUANTIDADE"]
    missing_cols = [col for col in required_cols_rfid if col not in df_rfid.columns]
    if missing_cols:
        raise KeyError(
            f"Colunas obrigatórias não encontradas no arquivo RFID: {', '.join(missing_cols)}. "
            f"Colunas disponíveis: {', '.join(df_rfid.columns.tolist())}"
        )
    
    # ============================================================================
    # 3. NORMALIZAR E AGRUPAR MICROVIX
    # ============================================================================
    df_microvix["__ean"] = df_microvix["EAN"].apply(norm_ean)
    df_microvix["__qtd"] = df_microvix["Qtd"].apply(to_int)
    
    # Pegar descrição se existir
    if "Descrição" in df_microvix.columns:
        df_microvix["__descricao"] = df_microvix["Descrição"].apply(safe_str)
    else:
        df_microvix["__descricao"] = None
    
    # Remover linhas sem EAN válido e agrupar por EAN (somar quantidades)
    microvix_grouped = (
        df_microvix[df_microvix["__ean"].notna()]
        .groupby("__ean", as_index=False)
        .agg({
            "__qtd": "sum",
            "__descricao": "first"  # Pega a primeira descrição disponível
        })
    )
    
    # ============================================================================
    # 4. NORMALIZAR E AGRUPAR RFID
    # ============================================================================
    df_rfid["__ean"] = df_rfid["EAN"].apply(norm_ean)
    df_rfid["__qtd"] = df_rfid["QUANTIDADE"].apply(to_int)
    
    # Pegar categoria/descrição se existir
    if "CATEGORIA" in df_rfid.columns:
        df_rfid["__categoria"] = df_rfid["CATEGORIA"].apply(safe_str)
    else:
        df_rfid["__categoria"] = None
    
    # Remover linhas sem EAN válido e agrupar por EAN (somar quantidades)
    rfid_grouped = (
        df_rfid[df_rfid["__ean"].notna()]
        .groupby("__ean", as_index=False)
        .agg({
            "__qtd": "sum",
            "__categoria": "first"  # Pega a primeira categoria disponível
        })
    )
    
    # ============================================================================
    # 5. MERGE E CLASSIFICAÇÃO
    # ============================================================================
    # Merge outer para pegar todos os EANs de ambos os lados
    merged = pd.merge(
        microvix_grouped,
        rfid_grouped,
        on="__ean",
        how="outer",
        suffixes=("_microvix", "_rfid")
    )
    
    # Preencher NaN com 0 nas quantidades
    merged["__qtd_microvix"] = merged["__qtd_microvix"].fillna(0).astype(int)
    merged["__qtd_rfid"] = merged["__qtd_rfid"].fillna(0).astype(int)
    
    # ============================================================================
    # 5.1. BUSCAR PRODUTOS DO BANCO DE DADOS POR CÓDIGO DE BARRAS
    # ============================================================================
    # Busca produtos do banco usando códigos de barras (EANs)
    eans_list = merged["__ean"].dropna().unique().tolist()
    products_dict = get_products_dict_by_codigo_barras(db, eans_list)
    
    # ============================================================================
    # 5.2. ESCOLHER DESCRIÇÃO: Prioriza banco de dados, depois MICROVIX, depois RFID
    # ============================================================================
    def get_descricao_final(row):
        ean = row["__ean"]
        # Primeiro tenta buscar do banco de dados
        if ean:
            product = products_dict.get(norm_ean(ean))
            if product and product.descricao:
                return product.descricao
        
        # Se não encontrou no banco, usa MICROVIX
        desc_microvix = row.get("__descricao")
        if desc_microvix:
            return desc_microvix
        
        # Por último, usa categoria do RFID
        return row.get("__categoria")
    
    merged["__descricao_final"] = merged.apply(get_descricao_final, axis=1)
    
    # Calcular diferença
    merged["__diferenca"] = merged["__qtd_rfid"] - merged["__qtd_microvix"]
    
    # Classificar status
    def classify_status(row):
        qtd_microvix = row["__qtd_microvix"]
        qtd_rfid = row["__qtd_rfid"]
        
        if qtd_microvix == 0 and qtd_rfid > 0:
            return "SO_RFID"
        elif qtd_rfid == 0 and qtd_microvix > 0:
            return "SO_MICROVIX"
        elif qtd_rfid == qtd_microvix:
            return "OK"
        elif qtd_rfid < qtd_microvix:
            return "FALTANDO"
        else:  # qtd_rfid > qtd_microvix
            return "SOBRANDO"
    
    merged["__status"] = merged.apply(classify_status, axis=1)
    
    # ============================================================================
    # 6. CRIAR LISTA DE ROWS
    # ============================================================================
    rows = []
    for _, row in merged.iterrows():
        rows.append({
            "codigo_barras": row["__ean"],
            "descricao": safe_str(row["__descricao_final"]),
            "qtd_microvix": int(row["__qtd_microvix"]),
            "qtd_rfid": int(row["__qtd_rfid"]),
            "diferenca": int(row["__diferenca"]),
            "status": row["__status"]
        })
    
    # ============================================================================
    # 7. SEPARAR DIVERGÊNCIAS E OK
    # ============================================================================
    divergencias = [r for r in rows if r["status"] != "OK"]
    ok_list = [r for r in rows if r["status"] == "OK"]
    
    # Ordenar divergências por prioridade
    status_priority = {
        "FALTANDO": 1,
        "SOBRANDO": 2,
        "SO_MICROVIX": 3,
        "SO_RFID": 4
    }
    divergencias.sort(key=lambda x: status_priority.get(x["status"], 99))
    
    # ============================================================================
    # 8. CALCULAR CARDS
    # ============================================================================
    total_itens_microvix = int(merged["__qtd_microvix"].sum())
    total_itens_rfid = int(merged["__qtd_rfid"].sum())
    
    status_counts = merged["__status"].value_counts().to_dict()
    
    cards = {
        "total_itens_microvix": total_itens_microvix,
        "total_itens_rfid": total_itens_rfid,
        "total_divergencias": len(divergencias),
        "itens_ok": status_counts.get("OK", 0),
        "itens_faltando": status_counts.get("FALTANDO", 0),
        "itens_sobrando": status_counts.get("SOBRANDO", 0),
        "itens_so_microvix": status_counts.get("SO_MICROVIX", 0),
        "itens_so_rfid": status_counts.get("SO_RFID", 0),
    }
    
    # ============================================================================
    # 9. RETORNAR RESULTADO
    # ============================================================================
    return {
        "cards": cards,
        "divergencias": divergencias,
        "ok": ok_list,
        "all": rows
    }
