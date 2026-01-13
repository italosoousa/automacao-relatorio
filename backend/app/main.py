import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.mercado_livre_dashboard import router as mercado_livre_dashboard_router
from app.api.rfid_dashboard import router as rfid_dashboard_router
from app.api.sugestao_vendas_dashboard import router as sugestao_vendas_dashboard_router

app = FastAPI(title="Automacao Relatorio API")

# Configuração de CORS com suporte a variáveis de ambiente
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mercado_livre_dashboard_router)
app.include_router(rfid_dashboard_router)
app.include_router(sugestao_vendas_dashboard_router)