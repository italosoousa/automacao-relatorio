// /frontend/src/components/OriginalStateFilter.tsx
import React from 'react';
import { Select, Typography, Space } from 'antd';

const { Text } = Typography;

interface OriginalStateFilterProps {
  stateOptions: string[];
  onFilterChange: (state: string | null) => void;
  disabled?: boolean;
  value: string | null; // Adiciona a prop 'value' para controlar o Select
}

export const OriginalStateFilter: React.FC<OriginalStateFilterProps> = ({
  stateOptions,
  onFilterChange,
  disabled = false,
  value,
}) => {
  const handleChange = (selectedValue: string | null) => {
    onFilterChange(selectedValue);
  };

  return (
    <Space>
      <Text strong>Filtrar por Estado:</Text>
      <Select
        placeholder="Todos"
        allowClear
        style={{ width: 200 }}
        onChange={handleChange}
        disabled={disabled || stateOptions.length === 0}
        value={value} // Controla o valor do Select
      >
        {stateOptions.map((state) => (
          <Select.Option key={state} value={state}>
            {state}
          </Select.Option>
        ))}
      </Select>
    </Space>
  );
};
