from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.mercado_livre_dashboard_service import build_mercado_livre_dashboard
from app.schemas.mercado_livre_dashboard import MercadoLivreDashboardResponse
from app.database import get_db
from app.models.log import Log
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/mercado-livre-dashboard", tags=["mercado-livre-dashboard"])


@router.post("/preview", response_model=MercadoLivreDashboardResponse)
async def mercado_livre_dashboard_preview(
    ml_file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Gera dashboard do Mercado Livre.
    Busca produtos do banco de dados usando o SKU da planilha do ML.
    """
    try:
        ml_bytes = await ml_file.read()
        result = build_mercado_livre_dashboard(ml_bytes, db)
        
        # Log da operação
        try:
            log_entry = Log(
                tipo_relatorio="mercado_livre",
                detalhes=f"Dashboard gerado com {result['summary']['total_itens']} itens",
                arquivo_origem=ml_file.filename
            )
            db.add(log_entry)
            db.commit()
        except Exception:
            db.rollback()
        
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao processar Mercado Livre: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar arquivo: {str(e)}")

