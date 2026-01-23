from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.log import Log
from app.schemas.log import LogResponse

router = APIRouter(prefix="/api/logs", tags=["logs"])


@router.get("/", response_model=List[LogResponse])
async def list_logs(
    skip: int = 0,
    limit: int = 100,
    tipo_relatorio: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lista logs de relatórios gerados"""
    query = db.query(Log)
    
    if tipo_relatorio:
        query = query.filter(Log.tipo_relatorio == tipo_relatorio)
    
    logs = query.order_by(Log.horario.desc()).offset(skip).limit(limit).all()
    return logs


@router.get("/{log_id}", response_model=LogResponse)
async def get_log(log_id: int, db: Session = Depends(get_db)):
    """Busca um log por ID"""
    log = db.query(Log).filter(Log.id == log_id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Log com ID {log_id} não encontrado"
        )
    return log
