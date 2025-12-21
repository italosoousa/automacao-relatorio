// /frontend/src/components/StateFilter.tsx
import React from 'react';
import { Select, Card } from 'antd';

interface StateFilterProps {
  states: string[];
  onFilterChange: (selectedState: string | null) => void;
  disabled: boolean;
}

export const StateFilter: React.FC<StateFilterProps> = ({ states, onFilterChange, disabled }) => {
  const options = states.map(state => ({ label: state, value: state }));

  return (
    <Card style={{ marginBottom: 24 }}>
      <Select
        showSearch
        allowClear
        placeholder="Filtrar por Estado"
        style={{ width: '100%' }}
        options={options}
        onChange={(value) => onFilterChange(value || null)}
        disabled={disabled}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
      />
    </Card>
  );
};
