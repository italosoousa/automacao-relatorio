# /backend/app/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.services.parser import read_spreadsheet
from app.services.dashboard import process_dashboard_data
from app.models.schemas import DashboardResponse

app = FastAPI(
    title="Análise de Planilhas API",
    description="API para processar e analisar planilhas de vendas e produtos.",
    version="1.0.0"
)

# Configuração do CORS para permitir requisições do frontend
origins = [
    "http://localhost:5173",  # Endereço padrão do Vite
    "http://127.0.0.1:5173",
    "http://localhost:3000", # Endereço comum de desenvolvimento React
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
    """Endpoint de verificação de saúde."""
    return {"status": "ok"}

@app.post("/api/dashboard/preview", response_model=DashboardResponse, tags=["Dashboard"])
def get_dashboard_preview(ml_file: UploadFile = File(...), base_file: UploadFile = File(...)):
    """
    Recebe duas planilhas (Mercado Livre e Base de Produtos), processa os dados
    e retorna uma estrutura JSON para exibição em um dashboard.
    """
    if not ml_file or not base_file:
        raise HTTPException(status_code=400, detail="Ambos os arquivos são obrigatórios.")

    try:
        df_ml = read_spreadsheet(ml_file)
        df_base = read_spreadsheet(base_file)
    except HTTPException as e:
        # Repassa exceções do leitor de planilhas
        raise e
    except Exception as e:
        # Captura outras exceções inesperadas durante a leitura
        raise HTTPException(status_code=500, detail=f"Erro inesperado ao ler os arquivos: {str(e)}")

    try:
        # Processa os dados para gerar o dashboard
        result = process_dashboard_data(df_ml, df_base)
        return result
    except ValueError as e:
        # Erros de negócio, como colunas não encontradas
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Captura outras exceções inesperadas durante o processamento
        raise HTTPException(status_code=500, detail=f"Erro inesperado ao processar os dados: {str(e)}")

