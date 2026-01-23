from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    codigo_linx = Column(String(50), unique=True, index=True, nullable=False)
    descricao = Column(String(500), nullable=True)
    sku = Column(String(100), index=True, nullable=True)
    codigo_barras = Column(String(100), index=True, nullable=True)
    preco_custo = Column(Numeric(10, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
