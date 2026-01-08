from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.dashboard_service import build_dashboard
from app.schemas.dashboard import DashboardResponse

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.post("/preview", response_model=DashboardResponse)
async def dashboard_preview(
    ml_file: UploadFile = File(...),
    base_file: UploadFile = File(...),
):
    try:
        ml_bytes = await ml_file.read()
        base_bytes = await base_file.read()

        result = build_dashboard(ml_bytes, base_bytes)
        return result

    except KeyError as e:
        # quando coluna esperada não existe
        raise HTTPException(
            status_code=400,
            detail=f"Coluna esperada não encontrada na planilha: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
