// /frontend/src/components/ProductDetailsModal.tsx
import React from 'react';
import { Modal, Descriptions, Tag, Typography } from 'antd';
import { DashboardRow } from '../api/dashboard';

interface ProductDetailsModalProps {
  open: boolean;
  onClose: () => void;
  data: DashboardRow | null;
}

const { Text } = Typography;

// Helper para formatar moeda
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || typeof value === 'undefined') {
    return 'N/A';
  }
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ open, onClose, data }) => {
  if (!data) {
    return null;
  }

  return (
    <Modal
      title="Detalhes da Venda"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="SKU" span={2}>
          <Text strong copyable>
            {data.sku || 'N/A'}
          </Text>
        </Descriptions.Item>
        
        <Descriptions.Item label="Nº da Venda" span={1}>{data.sale_number || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Data da Venda" span={1}>{data.sale_date ? new Date(data.sale_date).toLocaleDateString('pt-BR') : 'N/A'}</Descriptions.Item>
        
        <Descriptions.Item label="Status da Venda" span={2}>
          <Tag>{data.status_description || 'N/A'}</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Custo do Produto" span={1}>
          {data.cost === null ? <Tag color="orange">Não cadastrado</Tag> : <Text strong style={{ color: '#cf1322' }}>{formatCurrency(data.cost)}</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="Lucro Bruto" span={1}>
          <Text strong style={{ color: data.lucro_bruto && data.lucro_bruto > 0 ? '#3f8600' : '#cf1322' }}>
            {formatCurrency(data.lucro_bruto)}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="Receita (Produto)" span={1}>{formatCurrency(data.revenue_product)}</Descriptions.Item>
        <Descriptions.Item label="Tarifas e Impostos" span={1}>{formatCurrency(data.fee_taxes)}</Descriptions.Item>
        <Descriptions.Item label="Tarifas de Envio" span={1}>{formatCurrency(data.shipping_fees)}</Descriptions.Item>
        <Descriptions.Item label="Total Recebido" span={1}><Text strong>{formatCurrency(data.total)}</Text></Descriptions.Item>

        <Descriptions.Item label="ID do Anúncio ML" span={2}>
            <Text copyable>{data.ml_listing_id || 'N/A'}</Text>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};
