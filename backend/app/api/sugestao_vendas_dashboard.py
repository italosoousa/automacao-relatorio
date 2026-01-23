from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.sugestao_vendas_dashboard_service import build_sugestao_vendas_dashboard
from app.schemas.sugestao_vendas_dashboard import SugestaoVendasDashboardResponse
from app.database import get_db
from app.models.log import Log

router = APIRouter(prefix="/api/sugestao-vendas-dashboard", tags=["sugestao-vendas-dashboard"])


@router.post("/preview", response_model=SugestaoVendasDashboardResponse)
async def sugestao_vendas_dashboard_preview(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        file1_bytes = await file1.read()
        file2_bytes = await file2.read()

        result = build_sugestao_vendas_dashboard(file1_bytes, file2_bytes)
        
        # Cria log da geração do relatório
        total_itens = result.get("summary", {}).get("total_itens", 0)
        log_entry = Log(
            tipo_relatorio="sugestao_vendas",
            detalhes=f"Relatório gerado com {total_itens} itens",
            arquivo_origem=f"{file1.filename} / {file2.filename}"
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
