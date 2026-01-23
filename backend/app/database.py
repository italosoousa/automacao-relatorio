from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from fastapi import HTTPException
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Criar engine do SQLAlchemy
# O engine é criado sempre, mas a conexão só acontece quando necessário
engine = create_engine(
    settings.DATABASE_URL,
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
