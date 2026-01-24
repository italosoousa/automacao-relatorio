from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.mercado_livre_dashboard_service import build_mercado_livre_dashboard
from app.schemas.mercado_livre_dashboard import MercadoLivreDashboardResponse
from app.database import get_db
from app.models.log import Log
from datetime import datetime
import logging
import traceback

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/mercado-livre-dashboard", tags=["mercado-livre-dashboard"])


@router.post("/preview", response_model=MercadoLivreDashboardResponse)
async def mercado_livre_dashboard_preview(
    ml_file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Gera dashboard do Mercado Livre.
    
    Agora busca produtos diretamente do banco de dados usando o SKU.
    Não é mais necessário enviar a planilha de base de produtos.
    """
    try:
        ml_bytes = await ml_file.read()

        # Busca produtos do banco de dados usando SKU
        result = build_mercado_livre_dashboard(ml_bytes, db)
        
        # Cria log da geração do relatório
        try:
            log_entry = Log(
                tipo_relatorio="mercado_livre",
                detalhes=f"Relatório gerado com {result['summary']['total_itens']} itens",
                arquivo_origem=ml_file.filename
            )
            db.add(log_entry)
            db.commit()
        except Exception as log_error:
            # Se falhar ao criar log, não quebra o fluxo principal
            logger.warning(f"Erro ao criar log: {str(log_error)}")
            db.rollback()
        
        return result

    except KeyError as e:
        # quando coluna esperada não existe
        error_msg = f"Coluna esperada não encontrada na planilha: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=400,
            detail=error_msg
        )
    except Exception as e:
        # Log completo do erro para debug
        error_trace = traceback.format_exc()
        error_msg = f"Erro ao processar relatório do Mercado Livre: {str(e)}"
        logger.error(f"{error_msg}\n{error_trace}")
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )
