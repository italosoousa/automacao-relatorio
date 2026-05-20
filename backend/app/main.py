import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.mercado_livre_dashboard import router as mercado_livre_dashboard_router
from app.api.rfid_dashboard import router as rfid_dashboard_router
from app.api.sugestao_vendas_dashboard import router as sugestao_vendas_dashboard_router
from app.api.products import router as products_router
from app.api.logs import router as logs_router
from app.api.retirada_lojas import router as retirada_lojas_router
from app.api.retirada_robot_ws import router as retirada_robot_ws_router
from app.core.config import settings
from app.database import engine, Base
import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Tentar criar tabelas (não quebra se MySQL não estiver disponível)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tabelas do banco de dados criadas/verificadas com sucesso")
    except Exception as e:
        logger.warning(f"⚠️ Não foi possível conectar ao banco de dados: {e}")
        logger.warning("⚠️ O app continuará funcionando, mas funcionalidades do banco estarão desabilitadas")
        logger.warning("⚠️ Certifique-se de que o MySQL está rodando e o DATABASE_URL está correto no .env")
    
    yield
    
    # Shutdown (se necessário)
    pass


app = FastAPI(title="Automacao Relatorio API", lifespan=lifespan)

# Configuração de CORS
allowed_origins = settings.ALLOWED_ORIGINS.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(mercado_livre_dashboard_router)
app.include_router(rfid_dashboard_router)
app.include_router(sugestao_vendas_dashboard_router)
app.include_router(products_router)
app.include_router(logs_router)
app.include_router(retirada_lojas_router)
app.include_router(retirada_robot_ws_router)