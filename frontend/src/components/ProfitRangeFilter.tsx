// /frontend/src/components/ProfitRangeFilter.tsx
import React from 'react';
import { InputNumber, Space, Typography, theme } from 'antd';
import { DollarOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { useToken } = theme;

interface ProfitRangeFilterProps {
  minProfit: number | null;
  maxProfit: number | null;
  onMinChange: (value: number | null) => void;
  onMaxChange: (value: number | null) => void;
  disabled?: boolean;
}

export const ProfitRangeFilter: React.FC<ProfitRangeFilterProps> = ({
  minProfit,
  maxProfit,
  onMinChange,
  onMaxChange,
  disabled,
}) => {
  const { token } = useToken();
  
  return (
    <Space wrap style={{ width: '100%' }}>
      <DollarOutlined style={{ color: token.colorPrimary }} />
      <Text strong style={{ fontSize: 'clamp(12px, 2vw, 14px)' }}>Lucro:</Text>
      <InputNumber
        prefix="R$"
        placeholder="Mínimo"
        value={minProfit}
        onChange={onMinChange}
        disabled={disabled}
        style={{ width: '100%', minWidth: 120, maxWidth: 140 }}
        formatter={(value) => {
          if (!value) return '';
          return `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }}
        parser={(value) => {
          if (!value) return null;
          return parseFloat(value.replace(/R\$\s?|(,*)/g, '')) || null;
        }}
      />
      <Text style={{ fontSize: 'clamp(12px, 2vw, 14px)' }}>até</Text>
      <InputNumber
        prefix="R$"
        placeholder="Máximo"
        value={maxProfit}
        onChange={onMaxChange}
        disabled={disabled}
        style={{ width: '100%', minWidth: 120, maxWidth: 140 }}
        formatter={(value) => {
          if (!value) return '';
          return `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }}
        parser={(value) => {
          if (!value) return null;
          return parseFloat(value.replace(/R\$\s?|(,*)/g, '')) || null;
        }}
      />
    </Space>
  );
};
