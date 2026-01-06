# /backend/app/services/parser.py
import pandas as pd
from fastapi import UploadFile, HTTPException
import io
from typing import List, Optional


def _detect_header_row(raw_df: pd.DataFrame, keywords: List[str], min_hits: int = 2) -> Optional[int]:
    """
    Detecta a linha de cabeçalho procurando múltiplas palavras-chave.
    Retorna o índice da linha com mais matches, se atingir min_hits.
    """
    best_row = None
    best_hits = 0

    kw = [k.lower() for k in keywords]

    for i, row in raw_df.iterrows():
        row_str = row.astype(str).str.lower().fillna("")
        hits = 0
        for k in kw:
            if row_str.str.contains(k, na=False).any():
                hits += 1
        if hits > best_hits:
            best_hits = hits
            best_row = i

    if best_row is not None and best_hits >= min_hits:
        return int(best_row)
    return None


def read_spreadsheet(file: UploadFile) -> pd.DataFrame:
    """
    Lê um arquivo .xlsx ou .csv e retorna um DataFrame pandas
    com cabeçalhos corretamente detectados.
    """
    filename = file.filename
    if not filename:
        raise HTTPException(status_code=400, detail="Nome do arquivo não encontrado.")

    content = file.file.read()
    file.file.close()

    try:
        if filename.lower().endswith(".xlsx"):
            raw_df = pd.read_excel(io.BytesIO(content), engine="openpyxl", header=None)

            # Keywords gerais (serve tanto pra ML quanto pra base)
            keywords = [
                # Mercado Livre
                "n.º de venda", "data da venda", "descrição do status",
                "receita por produtos", "tarifa de venda", "tarifas de envio",
                "total", "sku", "# de anúncio", "anúncio",
                # Base
                "referência", "custo", "custo total", "descrição"
            ]

            header_row = _detect_header_row(raw_df, keywords=keywords, min_hits=2)
            if header_row is None:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Não foi possível identificar a linha de cabeçalho da planilha. "
                        "Verifique se o arquivo é o export correto e não está com layout diferente."
                    ),
                )

            df = pd.read_excel(
                io.BytesIO(content),
                engine="openpyxl",
                header=header_row,
            )

            # Remove colunas completamente vazias e normaliza nomes
            df = df.dropna(axis=1, how="all")
            df.columns = [str(c).strip() for c in df.columns]

            return df

        if filename.lower().endswith(".csv"):
            try:
                df = pd.read_csv(io.BytesIO(content), sep=None, engine="python", encoding="utf-8-sig")
            except Exception:
                df = pd.read_csv(io.BytesIO(content), sep=None, engine="python", encoding="latin1")

            df = df.dropna(axis=1, how="all")
            df.columns = [str(c).strip() for c in df.columns]
            return df

        raise HTTPException(status_code=400, detail=f"Formato não suportado: {filename}. Use .xlsx ou .csv.")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler ou processar o arquivo {filename}: {str(e)}")
