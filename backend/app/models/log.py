from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    tipo_relatorio = Column(String(100), nullable=False, index=True)  # Ex: "mercado_livre", "rfid", "sugestao_vendas"
    horario = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    detalhes = Column(Text, nullable=True)  # Informações adicionais sobre o relatório gerado
    arquivo_origem = Column(String(500), nullable=True)  # Nome do arquivo processado (opcional)
