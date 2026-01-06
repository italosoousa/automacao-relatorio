# /backend/app/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import traceback

from app.services.parser import read_spreadsheet
from app.services.dashboard import process_dashboard_data
from app.models.schemas import DashboardResponse

app = FastAPI(
    title="Análise de Planilhas API",
    description="API para processar e analisar planilhas de vendas e produtos.",
    version="1.0.0",
)

# CORS (frontend Vite/React)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["Monitoring"])
def health_check():
    return {"status": "ok"}


@app.post("/api/dashboard/preview", response_model=DashboardResponse, tags=["Dashboard"])
def get_dashboard_preview(
    ml_file: UploadFile = File(...),
    base_file: UploadFile = File(...),
):
    """
    Recebe duas planilhas (Mercado Livre e Base de Produtos), processa os dados
    e retorna uma estrutura JSON para exibição em um dashboard.
    """
    if ml_file is None or base_file is None:
        raise HTTPException(status_code=400, detail="Ambos os arquivos são obrigatórios.")

    # 1) Ler planilhas
    try:
        df_ml = read_spreadsheet(ml_file)
        df_base = read_spreadsheet(base_file)
    except HTTPException:
        # já tem status_code/detail corretos
        raise
    except Exception as e:
        print("\n" + "=" * 80)
        print("ERRO AO LER AS PLANILHAS (read_spreadsheet)")
        print(traceback.format_exc())
        print("=" * 80 + "\n")
        raise HTTPException(status_code=500, detail=f"Erro ao ler os arquivos: {str(e)}")

    # 2) Processar dados do dashboard
    try:
        result = process_dashboard_data(df_ml, df_base)
        return result
    except ValueError as e:
        # Erros de regra/colunas obrigatórias
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Mostra o erro real no terminal e devolve detail para o frontend
        print("\n" + "=" * 80)
        print("ERRO AO PROCESSAR O DASHBOARD (process_dashboard_data)")
        print(traceback.format_exc())
        print("=" * 80 + "\n")
        raise HTTPException(status_code=500, detail=str(e))
