// /frontend/src/components/QuickActions.tsx
import React from 'react';
import { Space, Button, Tooltip } from 'antd';
import {
  ClearOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

interface QuickActionsProps {
  onClearFilters: () => void;
  onReset: () => void;
  hasFilters: boolean;
  hasData: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onClearFilters,
  onReset,
  hasFilters,
  hasData,
}) => {
  return (
    <Space wrap size="small">
      {hasFilters && (
        <Tooltip title="Limpar todos os filtros">
          <Button
            icon={<ClearOutlined />}
            onClick={onClearFilters}
            disabled={!hasFilters}
            size="small"
          >
            <span style={{ fontSize: 'clamp(11px, 2vw, 14px)' }}>Limpar Filtros</span>
          </Button>
        </Tooltip>
      )}
      {hasData && (
        <Tooltip title="Recarregar dados">
          <Button
            icon={<ReloadOutlined />}
            onClick={onReset}
            size="small"
          >
            <span style={{ fontSize: 'clamp(11px, 2vw, 14px)' }}>Nova Análise</span>
          </Button>
        </Tooltip>
      )}
    </Space>
  );
};
