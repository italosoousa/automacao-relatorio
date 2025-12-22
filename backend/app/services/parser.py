# /backend/app/services/parser.py
import pandas as pd
from fastapi import UploadFile, HTTPException
import io

def read_spreadsheet(file: UploadFile) -> pd.DataFrame:
    """
    Lê um arquivo .xlsx ou .csv e o retorna como um DataFrame pandas.
    """
    filename = file.filename
    if not filename:
        raise HTTPException(status_code=400, detail="Nome do arquivo não encontrado.")

    content = file.file.read()
    file.file.close() # Fechar o arquivo após a leitura

    try:
        if filename.endswith('.xlsx'):
            return pd.read_excel(io.BytesIO(content), engine='openpyxl', skiprows=6)
        elif filename.endswith('.csv'):
            # Tenta detectar o separador, mas assume ; ou , como padrão
            try:
                return pd.read_csv(io.BytesIO(content), sep=None, engine='python', encoding='utf-8-sig')
            except Exception:
                 # Fallback para latin1 se utf-8 falhar
                return pd.read_csv(io.BytesIO(content), sep=None, engine='python', encoding='latin1')
        else:
            raise HTTPException(status_code=400, detail=f"Formato de arquivo não suportado: {filename}. Use .xlsx ou .csv.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler ou processar o arquivo {filename}: {e}")

