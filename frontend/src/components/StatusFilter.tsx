// /frontend/src/components/StatusFilter.tsx
import React from 'react';
import { Select, Typography, Space } from 'antd';

const { Text } = Typography;

interface StatusFilterProps {
  statusOptions: string[]; // Alterado de 'statuses' para 'statusOptions'
  onFilterChange: (status: string | null) => void;
  disabled?: boolean;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  statusOptions,
  onFilterChange,
  disabled = false,
}) => {
  const handleChange = (selectedValue: string | null) => {
    onFilterChange(selectedValue);
  };

  return (
    <Space>
      <Text strong>Filtrar por Status:</Text>
      <Select
        placeholder="Todos"
        allowClear
        style={{ width: 200 }}
        onChange={handleChange}
        disabled={disabled || statusOptions.length === 0}
      >
        {statusOptions.map((status) => (
          <Select.Option key={status} value={status}>
            {status}
          </Select.Option>
        ))}
      </Select>
    </Space>
  );
};
