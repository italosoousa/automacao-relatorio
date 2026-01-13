from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.rfid_dashboard_service import build_rfid_dashboard
from app.schemas.rfid_dashboard import RfidDashboardResponse

router = APIRouter(prefix="/api/rfid-dashboard", tags=["rfid-dashboard"])


@router.post("/preview", response_model=RfidDashboardResponse)
async def rfid_dashboard_preview(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
):
    try:
        file1_bytes = await file1.read()
        file2_bytes = await file2.read()

        result = build_rfid_dashboard(file1_bytes, file2_bytes)
        return result

    except KeyError as e:
        # quando coluna esperada não existe
        raise HTTPException(
            status_code=400,
            detail=f"Coluna esperada não encontrada na planilha: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
