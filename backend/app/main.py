import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.dashboard import router as dashboard_router
from app.api.relatorio1 import router as relatorio1_router
from app.api.relatorio2 import router as relatorio2_router

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

app.include_router(dashboard_router)
app.include_router(relatorio1_router)
app.include_router(relatorio2_router)