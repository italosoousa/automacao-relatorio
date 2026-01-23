from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from fastapi import HTTPException
from app.core.config import settings
import logging
import os

logger = logging.getLogger(__name__)

# Garantir que a DATABASE_URL sempre use pymysql
# Se por algum motivo a URL não tiver +pymysql, força o uso
database_url = settings.DATABASE_URL
if not database_url.startswith("mysql+pymysql://"):
    if database_url.startswith("mysql://"):
        database_url = database_url.replace("mysql://", "mysql+pymysql://", 1)
        logger.warning("⚠️ DATABASE_URL foi normalizada para usar pymysql")
    elif database_url.startswith("mysql+mysqldb://"):
        database_url = database_url.replace("mysql+mysqldb://", "mysql+pymysql://", 1)
        logger.warning("⚠️ DATABASE_URL foi convertida de mysqldb para pymysql")

# Criar engine do SQLAlchemy
# O engine é criado sempre, mas a conexão só acontece quando necessário
# IMPORTANTE: Sempre usa pymysql como driver
engine = create_engine(
    database_url,
    pool_pre_ping=True,  # Verifica conexões antes de usar
    pool_recycle=3600,   # Recicla conexões após 1 hora
    echo=False,  # Mude para True para ver SQL queries no console
    connect_args={"connect_timeout": 5}  # Timeout de 5 segundos
)

# Criar SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()


# Dependency para FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
