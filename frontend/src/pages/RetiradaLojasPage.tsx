import React, { useState, useRef, useCallback } from "react";
import {
  Layout,
  Typography,
  Card,
  Select,
  Input,
  Button,
  Table,
  Tag,
  Space,
  Alert,
  Result,
  Statistic,
  Row,
  Col,
  Divider,
  Popconfirm,
  message,
  Tooltip,
} from "antd";
import type { InputRef } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ShopOutlined,
  UserOutlined,
  BarcodeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  lookupProductByBarcode,
  createRetirada,
  type ProductLookupResult,
} from "../api/retiradaLojas";
import { BStoriesThemeTokens } from "../theme/bstories-tokens";

const { Content } = Layout;
const { Title, Text } = Typography;

const LOJAS = ["LD", "MECA", "MARY", "CRM", "LOJA"];

interface RetiradaItem {
  key: string;
  codigo_barras: string;
  codigo_linx: string | null;
  descricao: string | null;
  preco_custo: number | null;
  found: boolean;
}

type PageStep = "setup" | "scanning" | "success";

export const RetiradaLojasPage: React.FC = () => {
  const [step, setStep] = useState<PageStep>("setup");

  // setup
  const [loja, setLoja] = useState<string | null>(null);
  const [responsavel, setResponsavel] = useState<string>("");

  // scanning
  const [items, setItems] = useState<RetiradaItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const barcodeInputRef = useRef<InputRef>(null);

  // confirm
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);

  const focusBarcodeInput = useCallback(() => {
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 50);
  }, []);

  const handleIniciar = () => {
    if (!loja) {
      message.warning("Selecione a loja de destino.");
      return;
    }
    if (!responsavel.trim()) {
      message.warning("Informe o nome do responsável.");
      return;
    }
    setItems([]);
    setStep("scanning");
    focusBarcodeInput();
  };

  const handleScan = async () => {
    const barcode = barcodeInput.trim();
    if (!barcode) return;

    setBarcodeInput("");
    setScanning(true);

    try {
      const product: ProductLookupResult = await lookupProductByBarcode(barcode);
      const newItem: RetiradaItem = {
        key: `${Date.now()}-${barcode}`,
        codigo_barras: barcode,
        codigo_linx: product.codigo_linx,
        descricao: product.descricao,
        preco_custo: product.preco_custo,
        found: true,
      };
      setItems((prev) => [...prev, newItem]);
      message.success(`Produto adicionado: ${product.descricao ?? barcode}`);
    } catch {
      const newItem: RetiradaItem = {
        key: `${Date.now()}-${barcode}`,
        codigo_barras: barcode,
        codigo_linx: null,
        descricao: null,
        preco_custo: null,
        found: false,
      };
      setItems((prev) => [...prev, newItem]);
      message.error(`Produto não encontrado: ${barcode}`);
    } finally {
      setScanning(false);
      focusBarcodeInput();
    }
  };

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
    focusBarcodeInput();
  };

  const handleConfirmar = async () => {
    if (items.length === 0) {
      message.warning("Adicione pelo menos um produto antes de confirmar.");
      return;
    }
    setConfirmLoading(true);
    try {
      const payload = {
        loja: loja!,
        responsavel: responsavel.trim(),
        items: items.map((item) => ({
          codigo_linx: item.codigo_linx,
          codigo_barras: item.codigo_barras,
          descricao: item.descricao,
          preco_custo: item.preco_custo,
        })),
      };
      const response = await createRetirada(payload);
      setSavedId(response.id);
      setStep("success");
    } catch {
      message.error("Erro ao salvar a retirada. Tente novamente.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleNovaRetirada = () => {
    setStep("setup");
    setLoja(null);
    setResponsavel("");
    setItems([]);
    setBarcodeInput("");
    setSavedId(null);
  };

  const totalValor = items.reduce(
    (acc, item) => acc + (item.found ? (item.preco_custo ?? 0) : 0),
    0
  );
  const totalNaoEncontrados = items.filter((item) => !item.found).length;

  const columns: ColumnsType<RetiradaItem> = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_: unknown, __: RetiradaItem, index: number) => (
        <Text type="secondary">{index + 1}</Text>
      ),
    },
    {
      title: "Cód. Barras",
      dataIndex: "codigo_barras",
      key: "codigo_barras",
      width: 160,
      render: (value: string) => (
        <Text code style={{ fontSize: 12 }}>
          {value}
        </Text>
      ),
    },
    {
      title: "Cód. Interno",
      dataIndex: "codigo_linx",
      key: "codigo_linx",
      width: 120,
      render: (value: string | null) =>
        value ? (
          <Text strong>{value}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Descrição",
      dataIndex: "descricao",
      key: "descricao",
      render: (value: string | null, record: RetiradaItem) =>
        record.found ? (
          <Text>{value ?? "—"}</Text>
        ) : (
          <Space>
            <ExclamationCircleOutlined style={{ color: BStoriesThemeTokens.error }} />
            <Text type="danger">Produto não encontrado</Text>
          </Space>
        ),
    },
    {
      title: "Preço de Custo",
      dataIndex: "preco_custo",
      key: "preco_custo",
      width: 140,
      align: "right" as const,
      render: (value: number | null, record: RetiradaItem) =>
        record.found && value !== null ? (
          <Text strong>
            {value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Status",
      key: "status",
      width: 110,
      align: "center" as const,
      render: (_: unknown, record: RetiradaItem) =>
        record.found ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Encontrado
          </Tag>
        ) : (
          <Tag icon={<ExclamationCircleOutlined />} color="error">
            Não encontrado
          </Tag>
        ),
    },
    {
      title: "Ação",
      key: "action",
      width: 70,
      align: "center" as const,
      render: (_: unknown, record: RetiradaItem) => (
        <Tooltip title="Remover item">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleRemoveItem(record.key)}
          />
        </Tooltip>
      ),
    },
  ];

  // ── STEP: SETUP ──────────────────────────────────────────────────────────────
  if (step === "setup") {
    return (
      <Content style={{ padding: "32px 24px", maxWidth: 520, margin: "0 auto" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              🏪 Retirada para Lojas
            </Title>
            <Text type="secondary">
              Configure a retirada antes de iniciar a bipagem dos produtos.
            </Text>
          </div>

          <Card
            title={
              <Space>
                <ShopOutlined style={{ color: BStoriesThemeTokens.primary }} />
                Configurar Retirada
              </Space>
            }
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Loja de Destino
                </Text>
                <Select
                  placeholder="Selecione a loja"
                  style={{ width: "100%" }}
                  size="large"
                  value={loja}
                  onChange={setLoja}
                  options={LOJAS.map((l) => ({ value: l, label: l }))}
                />
              </div>

              <div>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Responsável
                </Text>
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nome do responsável"
                  size="large"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  onPressEnter={handleIniciar}
                />
              </div>

              <Button
                type="primary"
                size="large"
                block
                icon={<BarcodeOutlined />}
                onClick={handleIniciar}
              >
                Iniciar Bipagem
              </Button>
            </Space>
          </Card>
        </Space>
      </Content>
    );
  }

  // ── STEP: SUCCESS ─────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <Content style={{ padding: "32px 24px", maxWidth: 600, margin: "0 auto" }}>
        <Result
          status="success"
          title="Retirada confirmada com sucesso!"
          subTitle={
            <Space direction="vertical" size="small">
              <Text>
                Retirada <strong>#{savedId}</strong> registrada para a loja{" "}
                <strong>{loja}</strong>.
              </Text>
              <Text type="secondary">
                Responsável: {responsavel} · {items.length} produto(s) registrado(s)
              </Text>
            </Space>
          }
          extra={[
            <Button
              type="primary"
              key="nova"
              size="large"
              icon={<PlusCircleOutlined />}
              onClick={handleNovaRetirada}
            >
              Nova Retirada
            </Button>,
          ]}
        />
      </Content>
    );
  }

  // ── STEP: SCANNING ────────────────────────────────────────────────────────────
  return (
    <Content style={{ padding: "16px 24px", maxWidth: "100%" }}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>

        {/* Cabeçalho da sessão */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            padding: "12px 16px",
            background: BStoriesThemeTokens.backgroundSecondary,
            borderRadius: 8,
            border: `1px solid ${BStoriesThemeTokens.border}`,
          }}
        >
          <Space size="large" wrap>
            <Space>
              <ShopOutlined style={{ color: BStoriesThemeTokens.primary }} />
              <Text strong>Loja:</Text>
              <Tag color="default" style={{ fontSize: 14, padding: "2px 12px" }}>
                {loja}
              </Tag>
            </Space>
            <Space>
              <UserOutlined style={{ color: BStoriesThemeTokens.primary }} />
              <Text strong>Responsável:</Text>
              <Text>{responsavel}</Text>
            </Space>
          </Space>
          <Popconfirm
            title="Cancelar retirada?"
            description="Todos os itens bipados serão perdidos."
            onConfirm={handleNovaRetirada}
            okText="Sim, cancelar"
            cancelText="Não"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<CloseOutlined />} danger>
              Cancelar
            </Button>
          </Popconfirm>
        </div>

        {/* Input de bipagem */}
        <Card
          title={
            <Space>
              <BarcodeOutlined style={{ color: BStoriesThemeTokens.primary }} />
              Bipar Produto
            </Space>
          }
        >
          <Space.Compact style={{ width: "100%" }}>
            <Input
              ref={barcodeInputRef}
              placeholder="Bipe ou digite o código de barras e pressione Enter"
              size="large"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onPressEnter={handleScan}
              disabled={scanning}
              autoFocus
              prefix={<BarcodeOutlined style={{ color: BStoriesThemeTokens.textMuted }} />}
              style={{ fontSize: 16 }}
            />
            <Button
              type="primary"
              size="large"
              loading={scanning}
              onClick={handleScan}
              icon={<CheckOutlined />}
            >
              Adicionar
            </Button>
          </Space.Compact>
          {scanning && (
            <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
              Buscando produto...
            </Text>
          )}
        </Card>

        {/* Resumo */}
        {items.length > 0 && (
          <Row gutter={16}>
            <Col xs={8}>
              <Card size="small">
                <Statistic
                  title="Total de Itens"
                  value={items.length}
                  valueStyle={{ color: BStoriesThemeTokens.primary, fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col xs={8}>
              <Card size="small">
                <Statistic
                  title="Valor Total (custo)"
                  value={totalValor}
                  precision={2}
                  prefix="R$"
                  valueStyle={{ color: BStoriesThemeTokens.success, fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col xs={8}>
              <Card size="small">
                <Statistic
                  title="Não Encontrados"
                  value={totalNaoEncontrados}
                  valueStyle={{
                    color:
                      totalNaoEncontrados > 0
                        ? BStoriesThemeTokens.error
                        : BStoriesThemeTokens.success,
                    fontSize: 24,
                  }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Tabela de itens */}
        <Card
          title={
            <Space>
              <Text strong>
                Produtos Bipados
                {items.length > 0 && (
                  <Tag
                    style={{ marginLeft: 8 }}
                    color={BStoriesThemeTokens.primary}
                  >
                    {items.length}
                  </Tag>
                )}
              </Text>
            </Space>
          }
          extra={
            items.length > 0 && (
              <Popconfirm
                title="Limpar todos os itens?"
                onConfirm={() => {
                  setItems([]);
                  focusBarcodeInput();
                }}
                okText="Sim"
                cancelText="Não"
              >
                <Button danger size="small" icon={<DeleteOutlined />}>
                  Limpar tudo
                </Button>
              </Popconfirm>
            )
          }
        >
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <BarcodeOutlined
                style={{
                  fontSize: 48,
                  color: BStoriesThemeTokens.textMuted,
                  marginBottom: 12,
                  display: "block",
                }}
              />
              <Text type="secondary">
                Nenhum produto bipado ainda. Utilize o campo acima para adicionar itens.
              </Text>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={items}
              rowKey="key"
              size="small"
              pagination={false}
              scroll={{ x: 800 }}
              rowClassName={(record) =>
                record.found ? "" : "retirada-row-not-found"
              }
              style={{ overflowX: "auto" }}
            />
          )}
        </Card>

        {/* Aviso de não encontrados */}
        {totalNaoEncontrados > 0 && (
          <Alert
            type="warning"
            showIcon
            message={`${totalNaoEncontrados} produto(s) não encontrado(s) no banco de dados.`}
            description="Esses itens serão salvos apenas com o código de barras, sem informações de produto."
          />
        )}

        {/* Botão Confirmar */}
        {items.length > 0 && (
          <>
            <Divider />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Popconfirm
                title="Confirmar retirada?"
                description={`${items.length} item(s) serão salvos para a loja ${loja}.`}
                onConfirm={handleConfirmar}
                okText="Confirmar"
                cancelText="Cancelar"
                icon={<CheckCircleOutlined style={{ color: BStoriesThemeTokens.success }} />}
              >
                <Button
                  type="primary"
                  size="large"
                  loading={confirmLoading}
                  icon={<CheckCircleOutlined />}
                >
                  Confirmar Retirada ({items.length} {items.length === 1 ? "item" : "itens"})
                </Button>
              </Popconfirm>
            </div>
          </>
        )}
      </Space>

      <style>{`
        .retirada-row-not-found td {
          background-color: #fff2f0 !important;
        }
        .retirada-row-not-found:hover td {
          background-color: #ffe7e5 !important;
        }
      `}</style>
    </Content>
  );
};
