// /frontend/src/components/RfidDashboardTable.tsx
import React, { useMemo } from 'react';
import { Table, Tag, Tooltip, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { RfidDashboardRow, RfidStatus } from '../api/rfidDashboard';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';

const { useToken } = theme;
const { Text } = Typography;

/**
 * Tipo interno com chave estável para o Ant Design Table
 */
type RowWithKey = RfidDashboardRow & { __rowKey: string };

/**
 * Configuração de cores e ícones por status
 */
const getStatusConfig = (status: RfidStatus, token: any) => {
  const configs = {
    OK: {
      color: token.colorSuccess,
      icon: <CheckCircleOutlined />,
      label: 'OK',
      description: 'Quantidades conferem',
    },
    FALTANDO: {
      color: token.colorError,
      icon: <MinusCircleOutlined />,
      label: 'Faltando',
      description: 'Faltam itens no RFID',
    },
    SOBRANDO: {
      color: token.colorWarning,
      icon: <PlusCircleOutlined />,
      label: 'Sobrando',
      description: 'Itens extras no RFID',
    },
    SO_MICROVIX: {
      color: token.colorError,
      icon: <ExclamationCircleOutlined />,
      label: 'Só MICROVIX',
      description: 'Não foi lido pelo RFID',
    },
    SO_RFID: {
      color: token.colorWarning,
      icon: <WarningOutlined />,
      label: 'Só RFID',
      description: 'Não estava no MICROVIX',
    },
  };

  return configs[status] || configs.OK;
};

/**
 * Componente de Tag de Status
 */
const StatusTag: React.FC<{ status: RfidStatus }> = ({ status }) => {
  const { token } = useToken();
  const config = getStatusConfig(status, token);

  return (
    <Tooltip title={config.description}>
      <Tag color={config.color} icon={config.icon} style={{ fontSize: '0.9rem', padding: '4px 12px' }}>
        {config.label}
      </Tag>
    </Tooltip>
  );
};

/**
 * Renderiza diferença com cor apropriada
 */
const DiferencaCell: React.FC<{ diferenca: number; status: RfidStatus }> = ({
  diferenca,
  status,
}) => {
  const { token } = useToken();

  let color = token.colorText;
  let prefix = '';

  if (status === 'FALTANDO' || status === 'SO_MICROVIX') {
    color = token.colorError;
    prefix = diferenca > 0 ? '+' : '';
  } else if (status === 'SOBRANDO' || status === 'SO_RFID') {
    color = token.colorWarning;
    prefix = diferenca > 0 ? '+' : '';
  }

  return (
    <Text strong style={{ color, fontSize: '1rem' }}>
      {prefix}{diferenca}
    </Text>
  );
};

/**
 * Colunas da tabela
 */
const createColumns = (token: any): ColumnsType<RowWithKey> => [
  {
    title: 'Código de Barras (EAN)',
    dataIndex: 'codigo_barras',
    key: 'codigo_barras',
    width: 180,
    sorter: (a, b) => (a.codigo_barras || '').localeCompare(b.codigo_barras || ''),
    render: (ean) => (
      <Text strong copyable style={{ fontSize: '0.95rem' }}>
        {ean}
      </Text>
    ),
  },
  {
    title: 'Descrição',
    dataIndex: 'descricao',
    key: 'descricao',
    width: 320,
    ellipsis: true,
    sorter: (a, b) => (a.descricao || '').localeCompare(b.descricao || ''),
    render: (text: string | null) => (
      <Tooltip title={text || 'Sem descrição'}>
        <Text style={{ opacity: text ? 1 : 0.6 }}>
          {text || 'Sem descrição'}
        </Text>
      </Tooltip>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 160,
    sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
    render: (status: RfidStatus) => <StatusTag status={status} />,
  },
  {
    title: 'Qtd MICROVIX',
    dataIndex: 'qtd_microvix',
    key: 'qtd_microvix',
    width: 140,
    align: 'right',
    sorter: (a, b) => a.qtd_microvix - b.qtd_microvix,
    render: (value) => (
      <Text style={{ fontSize: '1rem', fontWeight: 500 }}>
        {value.toLocaleString('pt-BR')}
      </Text>
    ),
  },
  {
    title: 'Qtd RFID',
    dataIndex: 'qtd_rfid',
    key: 'qtd_rfid',
    width: 120,
    align: 'right',
    sorter: (a, b) => a.qtd_rfid - b.qtd_rfid,
    render: (value) => (
      <Text style={{ fontSize: '1rem', fontWeight: 500 }}>
        {value.toLocaleString('pt-BR')}
      </Text>
    ),
  },
  {
    title: 'Diferença',
    dataIndex: 'diferenca',
    key: 'diferenca',
    width: 120,
    align: 'right',
    sorter: (a, b) => a.diferenca - b.diferenca,
    render: (value, record) => <DiferencaCell diferenca={value} status={record.status} />,
  },
];

/**
 * Gera uma assinatura determinística da linha
 */
function buildRowSignature(row: RfidDashboardRow) {
  return [
    row.codigo_barras ?? '',
    row.descricao ?? '',
    row.qtd_microvix ?? '',
    row.qtd_rfid ?? '',
    row.status ?? '',
  ].join('|');
}

interface RfidDashboardTableProps {
  data: RfidDashboardRow[];
  loading: boolean;
}

export const RfidDashboardTable: React.FC<RfidDashboardTableProps> = ({
  data,
  loading,
}) => {
  const { token } = useToken();

  /**
   * Gera __rowKey estável sem usar index (evita warning do AntD)
   */
  const dataWithKeys = useMemo<RowWithKey[]>(() => {
    const counter = new Map<string, number>();

    return data.map((row) => {
      const signature = buildRowSignature(row);
      const count = (counter.get(signature) ?? 0) + 1;
      counter.set(signature, count);

      return {
        ...row,
        __rowKey: `${signature}#${count}`,
      };
    });
  }, [data]);

  const columns = useMemo(() => createColumns(token), [token]);

  return (
    <Table<RowWithKey>
      columns={columns}
      dataSource={dataWithKeys}
      loading={loading}
      rowKey="__rowKey"
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} itens`,
        responsive: true,
      }}
      scroll={{ x: 'max-content' }}
      size="middle"
      // Aplica cor de fundo diferente para divergências
      onRow={(record) => ({
        style: {
          backgroundColor:
            record.status !== 'OK'
              ? `${token.colorWarning}08` // 8 = ~5% opacity
              : undefined,
        },
      })}
    />
  );
};
