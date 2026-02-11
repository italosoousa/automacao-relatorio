// /frontend/src/components/ProductDetailsModal.tsx
import React, { useMemo } from 'react';
import { Modal, Descriptions, Tag, Typography, Divider, Card, Row, Col, Statistic, Space, theme } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  CalendarOutlined,
  TagOutlined,
  FileTextOutlined,
  PercentageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { DashboardRow } from '@/api/dashboard';

interface ProductDetailsModalProps {
  open: boolean;
  onClose: () => void;
  data: DashboardRow | null;
}

const { Text, Title } = Typography;
const { useToken } = theme;

// Helper: moeda
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || typeof value === 'undefined') return 'N/A';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Helper: percentual
const formatPercent = (value: number | null | undefined) => {
  if (value === null || typeof value === 'undefined') return 'N/A';
  return `${value.toFixed(2)}%`;
};

// Helper: data
const formatSaleDate = (raw: string | null | undefined) => {
  if (!raw) return 'N/A';

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return raw;
};

const statusColor = (status: string) => {
  const s = status.toLowerCase();

  if (s.includes('chegou') || s.includes('entreg')) return 'green';
  if (s.includes('cancel')) return 'red';
  if (s.includes('media') || s.includes('reclama') || s.includes('disputa')) return 'orange';
  if (s.includes('fiscal') || s.includes('nfe') || s.includes('dados')) return 'gold';

  return 'blue';
};

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ open, onClose, data }) => {
  const { token } = useToken();
  
  const getStatusGroupConfig = (statusGroup: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      ENVIADO: {
        color: token.colorSuccess,
        icon: <CheckCircleOutlined />,
        label: 'Enviado',
      },
      A_ENVIAR: {
        color: token.colorInfo,
        icon: <ClockCircleOutlined />,
        label: 'A Enviar',
      },
      MEDIACAO: {
        color: token.colorWarning,
        icon: <ExclamationCircleOutlined />,
        label: 'Mediação',
      },
      CANCELADO: {
        color: token.colorError,
        icon: <CloseCircleOutlined />,
        label: 'Cancelado',
      },
    };

    return configs[statusGroup] || { color: token.colorTextSecondary, icon: <TagOutlined />, label: statusGroup };
  };

  const saleStatusTag = useMemo(() => {
    if (!data) return <Tag>Sem status</Tag>;
    const text = data.status_description?.trim();
    if (!text) return <Tag>Sem status</Tag>;
    return <Tag color={statusColor(text)}>{text}</Tag>;
  }, [data]);

  const statusGroupConfig = useMemo(() => {
    if (!data) return { color: token.colorTextSecondary, icon: <TagOutlined />, label: 'N/A' };
    return getStatusGroupConfig(data.status_group);
  }, [data, token.colorTextSecondary]);

  // Cálculos adicionais
  const marginPercent = useMemo(() => {
    if (!data || data.total === null || data.total === 0 || data.lucro_bruto === null) return null;
    return (data.lucro_bruto / data.total) * 100;
  }, [data]);

  const roiPercent = useMemo(() => {
    if (!data || data.cost === null || data.cost === 0 || data.lucro_bruto === null) return null;
    return (data.lucro_bruto / data.cost) * 100;
  }, [data]);

  const totalFees = useMemo(() => {
    if (!data) return null;
    const fees = (data.fee_taxes ?? 0) + (data.shipping_fees ?? 0);
    return fees > 0 ? fees : null;
  }, [data]);

  const netRevenue = useMemo(() => {
    if (!data || data.revenue_product === null) return null;
    return data.revenue_product - (totalFees ?? 0);
  }, [data, totalFees]);

  // Early return DEPOIS de todos os hooks
  if (!data) return null;

  return (
    <Modal
      title={
        <Space>
          <ShoppingOutlined />
          <span>Detalhes do Produto</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width="95%"
      style={{ maxWidth: 900 }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Informações Básicas */}
        <Card size="small" title={
          <Space>
            <FileTextOutlined />
            <span>Informações Básicas</span>
          </Space>
        }>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="SKU" span={1}>
              <Text strong copyable style={{ fontSize: '1.1rem' }}>
                {data.sku || 'N/A'}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Status" span={1}>
              <Tag
                color={statusGroupConfig.color}
                icon={statusGroupConfig.icon}
                style={{ fontSize: '0.9rem', padding: '4px 12px' }}
              >
                {statusGroupConfig.label}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Descrição" span={2}>
              <Text>{data.descricao || 'N/A'}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Estado">
              <Tag>{data.estado || 'Indefinido'}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Status Detalhado">
              {saleStatusTag}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Informações da Venda */}
        <Card size="small" title={
          <Space>
            <CalendarOutlined />
            <span>Informações da Venda</span>
          </Space>
        }>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Nº da Venda">
              <Text copyable strong>{data.sale_number || 'N/A'}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Data da Venda">
              <Space>
                <CalendarOutlined />
                <Text>{formatSaleDate(data.sale_date)}</Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="ID do Anúncio (ML)" span={2}>
              <Text copyable>{data.ml_listing_id || 'N/A'}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Resumo Financeiro */}
        <Card size="small" title={
          <Space>
            <DollarOutlined />
            <span>Resumo Financeiro</span>
          </Space>
        }>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Statistic
                title="Lucro Bruto"
                value={data.lucro_bruto ?? 0}
                precision={2}
                prefix="R$"
                valueStyle={{
                  color: (data.lucro_bruto ?? 0) >= 0 ? token.colorSuccess : token.colorError,
                  fontSize: '1.5rem',
                  fontWeight: 600,
                }}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Statistic
                title="Margem de Lucro"
                value={marginPercent ?? 0}
                precision={2}
                suffix="%"
                valueStyle={{
                  color: (marginPercent ?? 0) >= 0 ? token.colorSuccess : token.colorError,
                  fontSize: '1.5rem',
                }}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Statistic
                title="ROI (Retorno sobre Investimento)"
                value={roiPercent ?? 0}
                precision={2}
                suffix="%"
                valueStyle={{
                  color: (roiPercent ?? 0) >= 0 ? token.colorSuccess : token.colorError,
                  fontSize: '1.5rem',
                }}
              />
            </Col>
          </Row>
        </Card>

        {/* Detalhes Financeiros */}
        <Card size="small" title={
          <Space>
            <DollarOutlined />
            <span>Detalhes Financeiros</span>
          </Space>
        }>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Receita do Produto">
              <Text strong style={{ color: token.colorSuccess, fontSize: '1rem' }}>
                {formatCurrency(data.revenue_product)}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Total Recebido (ML)">
              <Text strong style={{ fontSize: '1rem' }}>
                {formatCurrency(data.total)}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Custo do Produto">
              {data.cost === null ? (
                <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                  Não cadastrado
                </Tag>
              ) : (
                <Text strong style={{ color: token.colorError, fontSize: '1rem' }}>
                  {formatCurrency(data.cost)}
                </Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Receita Líquida">
              {netRevenue !== null ? (
                <Text style={{ fontSize: '1rem' }}>
                  {formatCurrency(netRevenue)}
                </Text>
              ) : (
                <Text type="secondary">N/A</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Tarifas e Impostos">
              <Text style={{ color: token.colorError }}>
                {formatCurrency(data.fee_taxes)}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Tarifas de Envio">
              <Text style={{ color: token.colorError }}>
                {formatCurrency(data.shipping_fees)}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Total de Taxas" span={2}>
              <Text strong style={{ color: token.colorError, fontSize: '1rem' }}>
                {formatCurrency(totalFees)}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Informações Adicionais */}
        {data.lucro_bruto === null && (
          <Card size="small" type="warning">
            <Space>
              <ExclamationCircleOutlined style={{ color: token.colorWarning }} />
              <Text type="warning">
                <strong>Atenção:</strong> Este produto não possui custo cadastrado na base de dados.
                O lucro bruto não pôde ser calculado.
              </Text>
            </Space>
          </Card>
        )}
      </Space>
    </Modal>
  );
};
