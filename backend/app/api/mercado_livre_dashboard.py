from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.mercado_livre_dashboard_service import build_mercado_livre_dashboard
from app.schemas.mercado_livre_dashboard import MercadoLivreDashboardResponse

router = APIRouter(prefix="/api/mercado-livre-dashboard", tags=["mercado-livre-dashboard"])


@router.post("/preview", response_model=MercadoLivreDashboardResponse)
async def mercado_livre_dashboard_preview(
    ml_file: UploadFile = File(...),
    base_file: UploadFile = File(...),
):
    try:
        ml_bytes = await ml_file.read()
        base_bytes = await base_file.read()

        result = build_mercado_livre_dashboard(ml_bytes, base_bytes)
        return result

    except KeyError as e:
        # quando coluna esperada não existe
        raise HTTPException(
            status_code=400,
            detail=f"Coluna esperada não encontrada na planilha: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
