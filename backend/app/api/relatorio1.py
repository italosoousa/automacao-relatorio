from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.relatorio1_service import build_relatorio1
from app.schemas.relatorio1 import Relatorio1Response

router = APIRouter(prefix="/api/relatorio1", tags=["relatorio1"])


@router.post("/preview", response_model=Relatorio1Response)
async def relatorio1_preview(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
):
    try:
        file1_bytes = await file1.read()
        file2_bytes = await file2.read()

        result = build_relatorio1(file1_bytes, file2_bytes)
        return result

    except KeyError as e:
        # quando coluna esperada não existe
        raise HTTPException(
            status_code=400,
            detail=f"Coluna esperada não encontrada na planilha: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
