from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.mercado_livre_dashboard_service import build_mercado_livre_dashboard
from app.schemas.mercado_livre_dashboard import MercadoLivreDashboardResponse
from app.database import get_db
from app.models.log import Log
from datetime import datetime

router = APIRouter(prefix="/api/mercado-livre-dashboard", tags=["mercado-livre-dashboard"])


@router.post("/preview", response_model=MercadoLivreDashboardResponse)
async def mercado_livre_dashboard_preview(
    ml_file: UploadFile = File(...),
    base_file: UploadFile = File(None),  # Opcional agora, pois usamos banco de dados
    db: Session = Depends(get_db),
):
    try:
        ml_bytes = await ml_file.read()
        base_bytes = await base_file.read() if base_file else None

        # Usa banco de dados, mas permite fallback para planilha se fornecida
        use_base_file = base_bytes is not None
        result = build_mercado_livre_dashboard(ml_bytes, db, use_base_file, base_bytes)
        
        # Cria log da geração do relatório
        log_entry = Log(
            tipo_relatorio="mercado_livre",
            detalhes=f"Relatório gerado com {result['summary']['total_itens']} itens",
            arquivo_origem=ml_file.filename
        )
        db.add(log_entry)
        db.commit()
        
        return result

    except KeyError as e:
        # quando coluna esperada não existe
        raise HTTPException(
            status_code=400,
            detail=f"Coluna esperada não encontrada na planilha: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
