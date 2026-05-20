import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Typography,
  Timeline,
  Tag,
  Space,
  Button,
  Alert,
  Spin,
  Result,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  MinusCircleOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { BStoriesThemeTokens } from "../theme/bstories-tokens";

const { Text, Title } = Typography;

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface RobotStepMessage {
  step_id: string;
  status: "running" | "success" | "error" | "info" | "skip";
  message: string;
  product_barcode: string | null;
  product_desc: string | null;
}

interface Props {
  retiradaId: number | null;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const WS_BASE_URL = (() => {
  const httpUrl =
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
      ? "https://automacao-relatorio-production.up.railway.app"
      : "http://127.0.0.1:8000");
  return String(httpUrl).replace(/^http/, "ws");
})();

const STATUS_ICON: Record<RobotStepMessage["status"], React.ReactNode> = {
  running: <LoadingOutlined style={{ color: BStoriesThemeTokens.primary }} />,
  success: <CheckCircleOutlined style={{ color: BStoriesThemeTokens.success }} />,
  error: <CloseCircleOutlined style={{ color: BStoriesThemeTokens.error }} />,
  info: <InfoCircleOutlined style={{ color: "#1677ff" }} />,
  skip: <MinusCircleOutlined style={{ color: BStoriesThemeTokens.textMuted }} />,
};

const STATUS_COLOR: Record<RobotStepMessage["status"], string> = {
  running: BStoriesThemeTokens.primary,
  success: BStoriesThemeTokens.success,
  error: BStoriesThemeTokens.error,
  info: "#1677ff",
  skip: BStoriesThemeTokens.textMuted,
};

// ── Componente ─────────────────────────────────────────────────────────────────

export const RobotProgressModal: React.FC<Props> = ({
  retiradaId,
  open,
  onClose,
  onComplete,
}) => {
  // Usa Map para atualizar steps in-place pelo step_id (running → success/error)
  const [steps, setSteps] = useState<Map<string, RobotStepMessage>>(new Map());
  const [connected, setConnected] = useState(false);
  const [done, setDone] = useState(false);
  const [success, setSuccess] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ── Conexão WebSocket ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !retiradaId) return;

    // Reset state
    setSteps(new Map());
    setConnected(false);
    setDone(false);
    setSuccess(false);
    setConnectionError(null);

    const wsUrl = `${WS_BASE_URL}/api/retirada-lojas/${retiradaId}/robot/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg: RobotStepMessage = JSON.parse(event.data);

        setSteps((prev) => {
          const next = new Map(prev);
          next.set(msg.step_id, msg);
          return next;
        });

        // Detectar fim da execução
        if (msg.step_id === "finished") {
          setDone(true);
          setSuccess(msg.status === "success");
          onComplete();
        }
      } catch {
        // ignora mensagens malformadas
      }
    };

    ws.onerror = () => {
      setConnectionError(
        "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
      );
      setDone(true);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [open, retiradaId]);

  // ── Auto-scroll para o último passo ─────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps.size]);

  // ── Itens do Timeline ────────────────────────────────────────────────────────
  const stepsArray = Array.from(steps.values());

  const timelineItems = stepsArray.map((step) => ({
    dot: STATUS_ICON[step.status],
    color: STATUS_COLOR[step.status],
    children: (
      <div style={{ paddingBottom: 4 }}>
        <Space size={8} wrap>
          <Text
            style={{
              color:
                step.status === "error"
                  ? BStoriesThemeTokens.error
                  : step.status === "success"
                  ? BStoriesThemeTokens.success
                  : step.status === "skip"
                  ? BStoriesThemeTokens.textMuted
                  : undefined,
            }}
          >
            {step.message}
          </Text>
          {step.product_barcode && (
            <Tag
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 11,
                margin: 0,
              }}
            >
              {step.product_barcode}
            </Tag>
          )}
        </Space>
      </div>
    ),
  }));

  // ── Render ───────────────────────────────────────────────────────────────────

  const isRunning = open && !done;

  return (
    <Modal
      open={open}
      width={680}
      style={{ top: 40 }}
      closable={done}
      maskClosable={false}
      keyboard={done}
      onCancel={done ? onClose : undefined}
      title={
        <Space>
          <RobotOutlined style={{ color: BStoriesThemeTokens.primary, fontSize: 18 }} />
          <Text strong style={{ fontSize: 16 }}>
            Robô Playwright · Retirada #{retiradaId}
          </Text>
          {isRunning && (
            <Spin size="small" />
          )}
        </Space>
      }
      footer={
        done ? (
          <Button type="primary" onClick={onClose}>
            Fechar
          </Button>
        ) : null
      }
      destroyOnHidden
    >
      <div
        style={{
          maxHeight: 460,
          overflowY: "auto",
          padding: "16px 0",
        }}
      >
        {connectionError ? (
          <Alert type="error" showIcon message={connectionError} />
        ) : stepsArray.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Conectando ao servidor...</Text>
            </div>
          </div>
        ) : (
          <>
            <Timeline items={timelineItems} />

            {done && (
              <Result
                status={success ? "success" : "error"}
                title={success ? "Retirada executada com sucesso!" : "Execução com erros"}
                subTitle={
                  success
                    ? "Todos os produtos foram retirados no sistema Linx."
                    : "Alguns produtos não foram processados. Verifique os logs acima."
                }
                style={{ padding: "16px 0 0" }}
              />
            )}
          </>
        )}

        {/* Âncora para auto-scroll */}
        <div ref={bottomRef} />
      </div>
    </Modal>
  );
};
