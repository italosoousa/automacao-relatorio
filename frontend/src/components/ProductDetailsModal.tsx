// /frontend/src/components/ProductDetailsModal.tsx
import React, { useMemo } from 'react';
import { Modal, Descriptions, Tag, Typography, Divider } from 'antd';
import { DashboardRow } from '../api/dashboard';

interface ProductDetailsModalProps {
  open: boolean;
  onClose: () => void;
  data: DashboardRow | null;
}

const { Text } = Typography;

// Helper: moeda
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || typeof value === 'undefined') return 'N/A';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Helper: data
// Sua API às vezes manda "23 de dezembro de 2025 11:51 hs."
// Isso NÃO é ISO e o Date() não garante parsing.
// Aqui a gente tenta converter; se não der, mostra o texto original.
const formatSaleDate = (raw: string | null | undefined) => {
  if (!raw) return 'N/A';

  // tenta parse padrão (quando for ISO ou algo compatível)
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString('pt-BR');
  }

  // fallback: mostra o texto “humano” como veio
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
  if (!data) return null;

  const saleStatusTag = useMemo(() => {
    const text = data.status_description?.trim();
    if (!text) return <Tag>Sem status</Tag>;
    return <Tag color={statusColor(text)}>{text}</Tag>;
  }, [data.status_description]);

  return (
    <Modal
      title="Detalhes da Venda"
      open={open}
      onCancel={onClose}
      footer={null}
      width={860}
    >
      <Descriptions bordered column={2} size="middle" style={{ marginBottom: 16 }}>
        {/* SKU + Anúncio */}
        <Descriptions.Item label="SKU" span={2}>
          <Text strong copyable>
            {data.sku || 'N/A'}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="Descrição" span={2}>
          {data.descricao || 'N/A'}
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '12px 0' }} />

      {/* ✅ As 3 colunas removidas do dashboard agora ficam aqui no card */}
      <Descriptions bordered column={2} size="middle" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Nº da Venda">
          <Text copyable>{data.sale_number || 'N/A'}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="Data da Venda">
          <Text>{formatSaleDate(data.sale_date)}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="Status da Venda" span={2}>
          {saleStatusTag}
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '12px 0' }} />

      {/* Financeiro */}
      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Custo do Produto">
          {data.cost === null ? (
            <Tag color="orange">Não cadastrado</Tag>
          ) : (
            <Text strong style={{ color: '#cf1322' }}>
              {formatCurrency(data.cost)}
            </Text>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Lucro Bruto">
          <Text strong style={{ color: (data.lucro_bruto ?? 0) > 0 ? '#3f8600' : '#cf1322' }}>
            {formatCurrency(data.lucro_bruto)}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="Receita (Produto)">
          {formatCurrency(data.revenue_product)}
        </Descriptions.Item>

        <Descriptions.Item label="Tarifas e Impostos">
          {formatCurrency(data.fee_taxes)}
        </Descriptions.Item>

        <Descriptions.Item label="Tarifas de Envio">
          {formatCurrency(data.shipping_fees)}
        </Descriptions.Item>

        <Descriptions.Item label="Total Recebido">
          <Text strong>{formatCurrency(data.total)}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="ID do Anúncio ML" span={2}>
          <Text copyable>{data.ml_listing_id || 'N/A'}</Text>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};
