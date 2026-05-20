"""
Endpoint WebSocket para execução do robô Playwright de retiradas.

Rota: ws://host/api/retirada-lojas/{retirada_id}/robot/ws

O frontend se conecta a esta rota após aprovação e recebe em tempo real
cada passo executado pelo robô. Ao finalizar, o banco é atualizado com o resultado.
"""

import dataclasses
import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.retirada_loja import RetiradaLoja
from app.services.retirada_robot import LinxRetiradaRobot, RobotStep

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/retirada-lojas", tags=["retirada_robot"])


@router.websocket("/{retirada_id}/robot/ws")
async def robot_websocket(
    retirada_id: int,
    websocket: WebSocket,
    db: Session = Depends(get_db),
):
    """
    Executa o robô Playwright para uma retirada aprovada via WebSocket.

    Mensagens enviadas ao cliente (JSON):
        {
            "step_id": "login",
            "status": "running" | "success" | "error" | "info" | "skip",
            "message": "Mensagem descritiva do passo",
            "product_barcode": "7300..." | null,
            "product_desc": "Nome do produto" | null
        }

    Ao final, o banco é atualizado com robo_executado=True, robo_executado_em e robo_resultado.
    """
    await websocket.accept()

    async def send_step(step: RobotStep):
        """Envia um passo como JSON via WebSocket."""
        try:
            await websocket.send_json(dataclasses.asdict(step))
        except Exception:
            pass  # conexão pode ter fechado

    try:
        # ── Validar retirada ─────────────────────────────────────────────────
        retirada = db.query(RetiradaLoja).filter(RetiradaLoja.id == retirada_id).first()

        if not retirada:
            await send_step(RobotStep(
                step_id="validation_error",
                status="error",
                message=f"Retirada #{retirada_id} não encontrada.",
            ))
            await websocket.close(code=1008)
            return

        if retirada.status != "aprovado":
            await send_step(RobotStep(
                step_id="validation_error",
                status="error",
                message=f"Retirada #{retirada_id} não está aprovada (status: {retirada.status}). "
                        "O robô só executa retiradas aprovadas.",
            ))
            await websocket.close(code=1008)
            return

        if retirada.robo_executado:
            await send_step(RobotStep(
                step_id="validation_error",
                status="error",
                message=f"O robô já foi executado para esta retirada em "
                        f"{retirada.robo_executado_em}.",
            ))
            await websocket.close(code=1008)
            return

        # ── Preparar itens ───────────────────────────────────────────────────
        items = [
            {
                "codigo_barras": item.codigo_barras,
                "descricao": item.descricao,
                "codigo_linx": item.codigo_linx,
            }
            for item in retirada.items
        ]

        await send_step(RobotStep(
            step_id="init",
            status="info",
            message=f"Iniciando robô para Retirada #{retirada_id} "
                    f"· Loja: {retirada.loja} · {len(items)} produto(s)...",
        ))

        # ── Executar robô ────────────────────────────────────────────────────
        robot = LinxRetiradaRobot(loja=retirada.loja, items=items)
        success = await robot.execute(on_progress=send_step)

        # ── Atualizar banco de dados ─────────────────────────────────────────
        retirada.robo_executado = True
        retirada.robo_executado_em = datetime.now(timezone.utc)
        retirada.robo_resultado = (
            "Execução concluída com sucesso. Todos os produtos foram retirados."
            if success
            else "Execução concluída com erros. Verifique os logs acima."
        )
        db.commit()
        db.refresh(retirada)

        logger.info(
            f"Robô finalizado para retirada #{retirada_id}: "
            f"{'sucesso' if success else 'com erros'}"
        )

    except WebSocketDisconnect:
        logger.warning(f"WebSocket desconectado durante execução do robô (retirada #{retirada_id})")
    except Exception as e:
        logger.error(f"Erro no WebSocket do robô (retirada #{retirada_id}): {e}", exc_info=True)
        try:
            await send_step(RobotStep(
                step_id="server_error",
                status="error",
                message=f"Erro interno no servidor: {str(e)}",
            ))
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
