from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.rfid_dashboard_service import build_rfid_dashboard
from app.schemas.rfid_dashboard import RFIDDashboardResponse
from app.database import get_db
from app.models.log import Log

router = APIRouter(prefix="/api/rfid-dashboard", tags=["rfid-dashboard"])


@router.post("/preview", response_model=RFIDDashboardResponse)
async def rfid_dashboard_preview(
    microvix_file: UploadFile = File(..., description="Arquivo MICROVIX.xlsx"),
    rfid_file: UploadFile = File(..., description="Arquivo RFID.csv"),
    db: Session = Depends(get_db),
):
    """
    Endpoint para processar e comparar planilhas MICROVIX vs RFID.
    
    Recebe dois arquivos:
    - microvix_file: Arquivo Excel (.xlsx) com colunas: EAN, Descrição, Qtd
    - rfid_file: Arquivo CSV (.csv) com colunas: EAN, CATEGORIA, QUANTIDADE (separado por ;)
    
    Retorna dashboard com:
    - cards: Resumo estatístico da conferência
    - divergencias: Lista de itens com divergências (status != OK)
    - ok: Lista de itens corretos (status = OK)
    - all: Lista completa de todos os itens
    """
    try:
        # Ler arquivos
        microvix_bytes = await microvix_file.read()
        rfid_bytes = await rfid_file.read()
        
        # Processar e gerar dashboard
        result = build_rfid_dashboard(microvix_bytes, rfid_bytes)
        
        # Cria log da geração do relatório
        total_divergencias = result.get("cards", {}).get("total_divergencias", 0)
        log_entry = Log(
            tipo_relatorio="rfid",
            detalhes=f"Relatório gerado com {total_divergencias} divergências encontradas",
            arquivo_origem=f"{microvix_file.filename} / {rfid_file.filename}"
        )
        db.add(log_entry)
        db.commit()
        
        return result
    
    except KeyError as e:
        # Erro de coluna faltando
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    
    except Exception as e:
        # Outros erros
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar arquivos: {str(e)}"
        )
