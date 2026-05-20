import os
from pydantic_settings import BaseSettings
from typing import Optional


def normalize_database_url(url: str) -> str:
    """
    Garante que a DATABASE_URL sempre use o driver pymysql.
    Se a URL vier como mysql://, converte para mysql+pymysql://
    """
    if not url:
        return "mysql+pymysql://usuario:senha@localhost:3306/nome_do_banco"
    
    # Se começar com mysql:// (sem driver), adiciona +pymysql
    if url.startswith("mysql://"):
        url = url.replace("mysql://", "mysql+pymysql://", 1)
    # Se começar com mysql+mysqldb://, troca para pymysql
    elif url.startswith("mysql+mysqldb://"):
        url = url.replace("mysql+mysqldb://", "mysql+pymysql://", 1)
    # Se já começar com mysql+pymysql://, mantém como está
    
    return url


class Settings(BaseSettings):
    # Database
    # Lê DATABASE_URL do ambiente (será normalizado após criação)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://usuario:senha@localhost:3306/nome_do_banco"
    )
    
    # Secrets
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    )
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


# Criar instância e normalizar DATABASE_URL
_settings = Settings()
# Normaliza a URL para garantir uso de pymysql
_settings.DATABASE_URL = normalize_database_url(_settings.DATABASE_URL)

settings = _settings
