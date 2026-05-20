import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  Form,
  Tabs,
  Badge,
  Tooltip,
  Alert,
  Statistic,
  Row,
  Col,
  Card,
  Divider,
  message,
  Spin,
  Empty,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
  ShopOutlined,
  CalendarOutlined,
  RobotOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  listRetiradas,
  getRetirada,
  aprovarRetirada,
  rejeitarRetirada,
  type RetiradaListItem,
  type RetiradaResponse,
  type RetiradaItemResponse,
  type RetiradaStatus,
} from "../api/retiradaLojas";
import { BStoriesThemeTokens } from "../theme/bstories-tokens";
import { RobotProgressModal } from "../components/RobotProgressModal";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

// ── Helpers de status ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  RetiradaStatus,
  { color: string; icon: React.ReactNode; label: string }
> = {
  pendente: {
    color: "warning",
    icon: <ClockCircleOutlined />,
    label: "Pendente",
  },
  aprovado: {
    color: "success",
    icon: <CheckCircleOutlined />,
    label: "Aprovado",
  },
  rejeitado: {
    color: "error",
    icon: <CloseCircleOutlined />,
    label: "Rejeitado",
  },
};

const StatusTag: React.FC<{ status: RetiradaStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pendente;
  return (
    <Tag icon={cfg.icon} color={cfg.color} style={{ fontWeight: 600 }}>
      {cfg.label}
    </Tag>
  );
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── Componente principal ──────────────────────────────────────────────────────

export const AprovacaoRetiradaPage: React.FC = () => {
  const [retiradas, setRetiradas] = useState<RetiradaListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"todas" | RetiradaStatus>("todas");

  // Drawer de detalhes
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [selectedRetirada, setSelectedRetirada] = useState<RetiradaResponse | null>(null);

  // Modal de aprovação
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<RetiradaListItem | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveForm] = Form.useForm();

  // Modal do robô Playwright
  const [robotModalOpen, setRobotModalOpen] = useState(false);
  const [robotRetiradaId, setRobotRetiradaId] = useState<number | null>(null);

  // Modal de rejeição
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<RetiradaListItem | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectForm] = Form.useForm();

  // ── Carregamento ────────────────────────────────────────────────────────────

  const loadRetiradas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listRetiradas();
      setRetiradas(data);
    } catch {
      message.error("Erro ao carregar retiradas. Verifique a conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRetiradas();
  }, [loadRetiradas]);

  // ── Contagens por status ────────────────────────────────────────────────────

  const counts = {
    todas: retiradas.length,
    pendente: retiradas.filter((r) => r.status === "pendente").length,
    aprovado: retiradas.filter((r) => r.status === "aprovado").length,
    rejeitado: retiradas.filter((r) => r.status === "rejeitado").length,
  };

  // ── Filtro de aba ───────────────────────────────────────────────────────────

  const filteredRetiradas =
    activeTab === "todas"
      ? retiradas
      : retiradas.filter((r) => r.status === activeTab);

  // ── Drawer: ver detalhes ────────────────────────────────────────────────────

  const handleViewDetails = async (record: RetiradaListItem) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    setSelectedRetirada(null);
    try {
      const detail = await getRetirada(record.id);
      setSelectedRetirada(detail);
    } catch {
      message.error("Erro ao carregar detalhes da retirada.");
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  // ── Aprovar ─────────────────────────────────────────────────────────────────

  const openApproveModal = (record: RetiradaListItem) => {
    setApproveTarget(record);
    approveForm.resetFields();
    setApproveModalOpen(true);
  };

  const handleAprovar = async () => {
    try {
      const values = await approveForm.validateFields();
      if (!approveTarget) return;
      setApproveLoading(true);

      await aprovarRetirada(approveTarget.id, values.aprovado_por);

      message.success(`Retirada #${approveTarget.id} aprovada! Iniciando robô...`);
      setApproveModalOpen(false);

      // Atualiza o drawer se estiver aberto na mesma retirada
      if (selectedRetirada?.id === approveTarget.id) {
        const updated = await getRetirada(approveTarget.id);
        setSelectedRetirada(updated);
      }

      // Abre o modal do robô para acompanhar a execução
      setRobotRetiradaId(approveTarget.id);
      setRobotModalOpen(true);

      await loadRetiradas();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) return; // validação do form
      message.error("Erro ao aprovar retirada. Tente novamente.");
    } finally {
      setApproveLoading(false);
    }
  };

  // ── Rejeitar ────────────────────────────────────────────────────────────────

  const openRejectModal = (record: RetiradaListItem) => {
    setRejectTarget(record);
    rejectForm.resetFields();
    setRejectModalOpen(true);
  };

  const handleRejeitar = async () => {
    try {
      const values = await rejectForm.validateFields();
      if (!rejectTarget) return;
      setRejectLoading(true);

      await rejeitarRetirada(rejectTarget.id, values.motivo_rejeicao);

      message.success(`Retirada #${rejectTarget.id} rejeitada.`);
      setRejectModalOpen(false);

      if (selectedRetirada?.id === rejectTarget.id) {
        const updated = await getRetirada(rejectTarget.id);
        setSelectedRetirada(updated);
      }

      await loadRetiradas();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) return;
      message.error("Erro ao rejeitar retirada. Tente novamente.");
    } finally {
      setRejectLoading(false);
    }
  };

  // ── Colunas da tabela principal ─────────────────────────────────────────────

  const columns: ColumnsType<RetiradaListItem> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      render: (id: number) => <Text strong>#{id}</Text>,
    },
    {
      title: "Loja",
      dataIndex: "loja",
      key: "loja",
      width: 80,
      render: (loja: string) => (
        <Tag style={{ fontWeight: 700, fontSize: 13 }}>{loja}</Tag>
      ),
    },
    {
      title: "Responsável",
      dataIndex: "responsavel",
      key: "responsavel",
      render: (v: string) => (
        <Space>
          <UserOutlined style={{ color: BStoriesThemeTokens.textMuted }} />
          <Text>{v}</Text>
        </Space>
      ),
    },
    {
      title: "Data / Hora",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {formatDate(v)}
        </Text>
      ),
    },
    {
      title: "Itens",
      dataIndex: "total_items",
      key: "total_items",
      width: 70,
      align: "center" as const,
      render: (v: number) => <Badge count={v} color={BStoriesThemeTokens.primary} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s: RetiradaStatus) => <StatusTag status={s} />,
    },
    {
      title: "Aprovado por",
      dataIndex: "aprovado_por",
      key: "aprovado_por",
      width: 140,
      render: (v: string | null, record: RetiradaListItem) => {
        if (record.status === "aprovado" && v) {
          return (
            <Tooltip title={`Em: ${formatDate(record.aprovado_em)}`}>
              <Text style={{ color: BStoriesThemeTokens.success }}>{v}</Text>
            </Tooltip>
          );
        }
        if (record.status === "rejeitado" && record.motivo_rejeicao) {
          return (
            <Tooltip title={record.motivo_rejeicao}>
              <Text type="danger" style={{ cursor: "help" }}>
                <ExclamationCircleOutlined /> Ver motivo
              </Text>
            </Tooltip>
          );
        }
        return <Text type="secondary">—</Text>;
      },
    },
    {
      title: "Ações",
      key: "actions",
      width: 200,
      fixed: "right" as const,
      render: (_: unknown, record: RetiradaListItem) => (
        <Space size="small">
          <Tooltip title="Ver produtos bipados">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            >
              Detalhes
            </Button>
          </Tooltip>
          {record.status === "pendente" && (
            <>
              <Tooltip title="Aprovar retirada">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => openApproveModal(record)}
                >
                  Aprovar
                </Button>
              </Tooltip>
              <Tooltip title="Rejeitar retirada">
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => openRejectModal(record)}
                >
                  Rejeitar
                </Button>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  // ── Colunas dos itens no drawer ─────────────────────────────────────────────

  const itemColumns: ColumnsType<RetiradaItemResponse> = [
    {
      title: "#",
      key: "idx",
      width: 45,
      render: (_: unknown, __: RetiradaItemResponse, i: number) => (
        <Text type="secondary">{i + 1}</Text>
      ),
    },
    {
      title: "Cód. Barras",
      dataIndex: "codigo_barras",
      key: "codigo_barras",
      width: 180,
      render: (v: string | null) =>
        v ? (
          <span
            style={{
              display: "inline-block",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.06em",
              background: BStoriesThemeTokens.backgroundSecondary,
              border: `1px solid ${BStoriesThemeTokens.border}`,
              borderRadius: 6,
              padding: "3px 10px",
              color: BStoriesThemeTokens.textPrimary,
              whiteSpace: "nowrap",
            }}
          >
            {v}
          </span>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Cód. Interno",
      dataIndex: "codigo_linx",
      key: "codigo_linx",
      width: 110,
      render: (v: string | null) =>
        v ? <Text strong>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "Descrição",
      dataIndex: "descricao",
      key: "descricao",
      render: (v: string | null) =>
        v ? (
          <Text>{v}</Text>
        ) : (
          <Space>
            <ExclamationCircleOutlined style={{ color: BStoriesThemeTokens.error }} />
            <Text type="danger">Não encontrado</Text>
          </Space>
        ),
    },
    {
      title: "Preço Custo",
      dataIndex: "preco_custo",
      key: "preco_custo",
      width: 130,
      align: "right" as const,
      render: (v: number | string | null) => {
        const num = v != null ? Number(v) : null;
        return num != null && !isNaN(num) ? (
          <Text strong>
            {num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Content style={{ padding: "0 0 32px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>

        {/* Cabeçalho */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              ✅ Aprovação de Retiradas
            </Title>
            <Text type="secondary">
              Gerencie e aprove as retiradas solicitadas pelos vendedores.
            </Text>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadRetiradas}
            loading={loading}
          >
            Atualizar
          </Button>
        </div>

        {/* Cards de resumo */}
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Total"
                value={counts.todas}
                valueStyle={{ fontSize: 22 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Pendentes"
                value={counts.pendente}
                valueStyle={{ color: "#faad14", fontSize: 22 }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Aprovadas"
                value={counts.aprovado}
                valueStyle={{ color: BStoriesThemeTokens.success, fontSize: 22 }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Rejeitadas"
                value={counts.rejeitado}
                valueStyle={{ color: BStoriesThemeTokens.error, fontSize: 22 }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Aviso de pendentes */}
        {counts.pendente > 0 && (
          <Alert
            type="warning"
            showIcon
            message={`${counts.pendente} retirada(s) aguardando aprovação.`}
          />
        )}

        {/* Tabela com abas */}
        <Card styles={{ body: { padding: 0 } }}>
          <Tabs
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as typeof activeTab)}
            style={{ padding: "0 16px" }}
            items={[
              { key: "todas", label: <span>Todas <Badge count={counts.todas} color="default" /></span> },
              { key: "pendente", label: <span>Pendentes <Badge count={counts.pendente} color="warning" /></span> },
              { key: "aprovado", label: <span>Aprovadas <Badge count={counts.aprovado} color="success" /></span> },
              { key: "rejeitado", label: <span>Rejeitadas <Badge count={counts.rejeitado} color="error" /></span> },
            ]}
          />
          <Table
            columns={columns}
            dataSource={filteredRetiradas}
            rowKey="id"
            loading={loading}
            size="middle"
            scroll={{ x: 1000 }}
            locale={{ emptyText: <Empty description="Nenhuma retirada encontrada" /> }}
            pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} retiradas` }}
            onRow={(record) => ({
              style: { cursor: "pointer" },
              onDoubleClick: () => handleViewDetails(record),
            })}
          />
        </Card>
      </Space>

      {/* ── Modal fullscreen: Detalhes da retirada ────────────────────────── */}
      <Modal
        open={drawerOpen}
        onCancel={() => setDrawerOpen(false)}
        width="95vw"
        style={{ top: 16 }}
        styles={{
          body: {
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
            padding: "24px 32px",
          },
          header: { borderBottom: `1px solid ${BStoriesThemeTokens.border}`, paddingBottom: 12 },
        }}
        title={
          selectedRetirada ? (
            <Space size="middle">
              <Text strong style={{ fontSize: 18 }}>
                Retirada #{selectedRetirada.id}
              </Text>
              <StatusTag status={selectedRetirada.status as RetiradaStatus} />
              <Text type="secondary" style={{ fontSize: 13 }}>
                <ShopOutlined /> {selectedRetirada.loja} &nbsp;·&nbsp;
                <UserOutlined /> {selectedRetirada.responsavel} &nbsp;·&nbsp;
                <CalendarOutlined /> {formatDate(selectedRetirada.created_at)}
              </Text>
            </Space>
          ) : (
            "Detalhes da Retirada"
          )
        }
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {selectedRetirada ? `${selectedRetirada.items.length} produto(s) bipado(s)` : ""}
            </Text>
            <Space>
              <Button onClick={() => setDrawerOpen(false)}>Fechar</Button>
              {selectedRetirada?.status === "pendente" && (
                <>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => {
                      setDrawerOpen(false);
                      openRejectModal(selectedRetirada as unknown as RetiradaListItem);
                    }}
                  >
                    Rejeitar
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      setDrawerOpen(false);
                      openApproveModal(selectedRetirada as unknown as RetiradaListItem);
                    }}
                  >
                    Aprovar
                  </Button>
                </>
              )}
            </Space>
          </div>
        }
        destroyOnHidden
      >
        {drawerLoading ? (
          <div style={{ textAlign: "center", paddingTop: 100 }}>
            <Spin size="large" tip="Carregando detalhes..." />
          </div>
        ) : selectedRetirada ? (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>

            {/* Alertas de status */}
            {selectedRetirada.status === "aprovado" && (
              <Alert
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                message={`Aprovado por ${selectedRetirada.aprovado_por}`}
                description={`Em ${formatDate(selectedRetirada.aprovado_em)}`}
              />
            )}
            {selectedRetirada.status === "rejeitado" && (
              <Alert
                type="error"
                showIcon
                message="Retirada rejeitada"
                description={selectedRetirada.motivo_rejeicao ?? "Sem motivo informado."}
              />
            )}

            {/* Info do robô */}
            {selectedRetirada.status === "aprovado" && (
              <Alert
                type={selectedRetirada.robo_executado ? "success" : "info"}
                showIcon
                icon={<RobotOutlined />}
                message={
                  selectedRetirada.robo_executado
                    ? `Robô executado em ${formatDate(selectedRetirada.robo_executado_em)}`
                    : "Robô ainda não executado"
                }
                description={
                  selectedRetirada.robo_executado
                    ? selectedRetirada.robo_resultado ?? "Execução concluída."
                    : "Após a aprovação, o robô Playwright executará automaticamente a retirada no sistema."
                }
              />
            )}

            {selectedRetirada.observacao && (
              <Alert
                type="info"
                showIcon
                message="Observação"
                description={selectedRetirada.observacao}
              />
            )}

            {/* Cards de resumo */}
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                    <ShopOutlined /> Loja
                  </Text>
                  <Text strong style={{ fontSize: 20 }}>{selectedRetirada.loja}</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                    <UserOutlined /> Responsável
                  </Text>
                  <Text strong style={{ fontSize: 16 }}>{selectedRetirada.responsavel}</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                    Total de Itens
                  </Text>
                  <Text strong style={{ fontSize: 20 }}>{selectedRetirada.items.length}</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                    Valor Total
                  </Text>
                  <Text strong style={{ fontSize: 16, color: BStoriesThemeTokens.primary }}>
                    {selectedRetirada.items
                      .reduce((acc, item) => acc + Number(item.preco_custo ?? 0), 0)
                      .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </Text>
                </Card>
              </Col>
            </Row>

            <Divider style={{ margin: "4px 0" }} />

            {/* Tabela de itens */}
            <div>
              <Text strong style={{ fontSize: 16, display: "block", marginBottom: 14 }}>
                Produtos Bipados ({selectedRetirada.items.length})
              </Text>
              <Table
                columns={itemColumns}
                dataSource={selectedRetirada.items}
                rowKey="id"
                size="middle"
                pagination={false}
                rowClassName={(record) =>
                  !record.descricao ? "retirada-row-not-found" : ""
                }
                summary={() => {
                  const total = selectedRetirada.items.reduce(
                    (acc, item) => acc + Number(item.preco_custo ?? 0),
                    0
                  );
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <Text strong style={{ fontSize: 14 }}>Total</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ fontSize: 14, color: BStoriesThemeTokens.primary }}>
                          {total.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
              />
            </div>
          </Space>
        ) : null}
      </Modal>

      {/* ── Modal: Aprovar ────────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: BStoriesThemeTokens.success }} />
            Aprovar Retirada {approveTarget ? `#${approveTarget.id}` : ""}
          </Space>
        }
        open={approveModalOpen}
        onCancel={() => setApproveModalOpen(false)}
        onOk={handleAprovar}
        okText="Confirmar Aprovação"
        cancelText="Cancelar"
        okButtonProps={{ loading: approveLoading }}
        destroyOnHidden
      >
        {approveTarget && (
          <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
            <Text type="secondary">
              Loja: <strong>{approveTarget.loja}</strong> · Responsável:{" "}
              <strong>{approveTarget.responsavel}</strong> · {approveTarget.total_items} item(s)
            </Text>
          </Space>
        )}
        <Form form={approveForm} layout="vertical">
          <Form.Item
            name="aprovado_por"
            label="Aprovado por (seu nome)"
            rules={[{ required: true, message: "Informe o nome do aprovador." }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nome do gerente / aprovador"
              size="large"
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Modal: Rejeitar ───────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <CloseCircleOutlined style={{ color: BStoriesThemeTokens.error }} />
            Rejeitar Retirada {rejectTarget ? `#${rejectTarget.id}` : ""}
          </Space>
        }
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleRejeitar}
        okText="Confirmar Rejeição"
        cancelText="Cancelar"
        okButtonProps={{ loading: rejectLoading, danger: true }}
        destroyOnHidden
      >
        {rejectTarget && (
          <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
            <Text type="secondary">
              Loja: <strong>{rejectTarget.loja}</strong> · Responsável:{" "}
              <strong>{rejectTarget.responsavel}</strong> · {rejectTarget.total_items} item(s)
            </Text>
          </Space>
        )}
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="motivo_rejeicao"
            label="Motivo da rejeição"
            rules={[{ required: true, message: "Informe o motivo da rejeição." }]}
          >
            <TextArea
              rows={4}
              placeholder="Descreva o motivo da rejeição..."
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Modal do Robô Playwright ──────────────────────────────────────── */}
      <RobotProgressModal
        retiradaId={robotRetiradaId}
        open={robotModalOpen}
        onClose={() => setRobotModalOpen(false)}
        onComplete={loadRetiradas}
      />

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
