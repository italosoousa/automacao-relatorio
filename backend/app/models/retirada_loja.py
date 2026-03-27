from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class RetiradaLoja(Base):
    __tablename__ = "retiradas_lojas"

    id = Column(Integer, primary_key=True, index=True)
    loja = Column(String(50), nullable=False, index=True)
    responsavel = Column(String(100), nullable=False)
    observacao = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    items = relationship("RetiradaLojaItem", back_populates="retirada", cascade="all, delete-orphan")


class RetiradaLojaItem(Base):
    __tablename__ = "retiradas_lojas_items"

    id = Column(Integer, primary_key=True, index=True)
    retirada_id = Column(Integer, ForeignKey("retiradas_lojas.id"), nullable=False, index=True)
    codigo_linx = Column(String(50), nullable=True)
    codigo_barras = Column(String(100), nullable=True)
    descricao = Column(String(500), nullable=True)
    preco_custo = Column(Numeric(10, 2), nullable=True)

    retirada = relationship("RetiradaLoja", back_populates="items")
