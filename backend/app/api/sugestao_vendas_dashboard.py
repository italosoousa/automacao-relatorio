from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.sugestao_vendas_dashboard_service import build_sugestao_vendas_dashboard
from app.schemas.sugestao_vendas_dashboard import SugestaoVendasDashboardResponse

router = APIRouter(prefix="/api/sugestao-vendas-dashboard", tags=["sugestao-vendas-dashboard"])


@router.post("/preview", response_model=SugestaoVendasDashboardResponse)
async def sugestao_vendas_dashboard_preview(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
):
    try:
        file1_bytes = await file1.read()
        file2_bytes = await file2.read()

        result = build_sugestao_vendas_dashboard(file1_bytes, file2_bytes)
        return result

    except KeyError as e:
        # quando coluna esperada não existe
        raise HTTPException(
            status_code=400,
            detail=f"Coluna esperada não encontrada na planilha: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
