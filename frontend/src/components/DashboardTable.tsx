// /frontend/src/components/DashboardTable.tsx
import React, { useMemo } from 'react';
import { Table, Tag, Tooltip, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DashboardRow } from '../api/dashboard';

const { useToken } = theme;
const { Text } = Typography;

/**
 * Tipo interno com chave estável para o Ant Design Table
 */
type RowWithKey = DashboardRow & { __rowKey: string };

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const MoneyCell: React.FC<{ value: number | null | undefined }> = ({ value }) => {
  const { token } = useToken();

  if (value === null || value === undefined) {
    return <span style={{ opacity: 0.6 }}>—</span>;
  }

  // cor neutra pra números “normais”
  return <span style={{ color: token.colorText, fontWeight: 500 }}>{formatCurrency(value)}</span>;
};

const ProfitCell: React.FC<{ value: number | null | undefined }> = ({ value }) => {
  const { token } = useToken();

  if (value === null || value === undefined) {
    return <Tag color="default">N/A</Tag>;
  }

  const color = value >= 0 ? token.colorSuccess : token.colorError;
  return <span style={{ color, fontWeight: 600 }}>{formatCurrency(value)}</span>;
};

const NegativeMoney: React.FC<{ value: number | null }> = ({ value }) => {
  if (value === null || value === undefined) {
    return <Tag color="default">N/A</Tag>;
  }

  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  return (
    <span style={{ color: '#cf1322', fontWeight: 500 }}>
      {formatted}
    </span>
  );
};


const StatusGroupTag: React.FC<{ status: string }> = ({ status }) => {
  const colorMapping: Record<string, string> = {
    ENVIADO: 'blue',
    A_ENVIAR: 'cyan',
    MEDIACAO: 'orange',
    CANCELADO: 'red',
  };

  return <Tag color={colorMapping[status] || 'default'}>{status}</Tag>;
};

/**
 * Colunas tipadas com RowWithKey (mesmo tipo da Table)
 */
const columns: ColumnsType<RowWithKey> = [
  {
    title: 'SKU',
    dataIndex: 'sku',
    key: 'sku',
    width: 120,
    sorter: (a, b) => (a.sku || '').localeCompare(b.sku || ''),
    render: (sku) =>
      sku ? (
        <Text strong copyable>
          {sku}
        </Text>
      ) : (
        <span style={{ opacity: 0.6 }}>Sem SKU</span>
      ),
  },
  {
    title: 'Descrição',
    dataIndex: 'descricao',
    key: 'descricao',
    width: 320,
    ellipsis: true,
    sorter: (a, b) => (a.descricao || '').localeCompare(b.descricao || ''),
    render: (text: string, record) => {
      const content = (
        <span style={{ opacity: record.lucro_bruto === null ? 0.85 : 1 }}>
          {text}
          {record.lucro_bruto === null && (
            <Tag color="warning" style={{ marginLeft: 8 }}>
              Sem Custo
            </Tag>
          )}
        </span>
      );

      if (record.lucro_bruto === null) {
        return (
          <Tooltip title="Este SKU não foi encontrado na base de produtos. O lucro não pôde ser calculado.">
            {content}
          </Tooltip>
        );
      }

      return (
        <Tooltip title={text}>
          {content}
        </Tooltip>
      );
    },
  },
  {
    title: 'Status',
    dataIndex: 'status_group',
    key: 'status_group',
    width: 120,
    sorter: (a, b) => (a.status_group || '').localeCompare(b.status_group || ''),
    render: (status: string) => <StatusGroupTag status={status} />,
  },
  {
    title: 'Estado',
    dataIndex: 'estado',
    key: 'estado',
    width: 220,
    ellipsis: true,
    sorter: (a, b) => (a.estado || '').localeCompare(b.estado || ''),
    render: (estado: string | null) => (
      <Tooltip title={estado || 'Indefinido'}>
        <span>{estado || 'Indefinido'}</span>
      </Tooltip>
    ),
  },

  // Financeiro (ML)
  {
  title: 'Receita (Produto)',
  dataIndex: 'revenue_product',
  key: 'revenue_product',
  align: 'right',
  render: (value) =>
    value === null || value === undefined ? (
      <Tag>N/A</Tag>
    ) : (
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value)
    ),
},
{
  title: 'Tarifa + Impostos',
  dataIndex: 'fee_taxes',
  key: 'fee_taxes',
  align: 'right',
  render: (value) => <NegativeMoney value={value} />,
},
{
  title: 'Tarifa de Envio',
  dataIndex: 'shipping_fees',
  key: 'shipping_fees',
  align: 'right',
  render: (value) => <NegativeMoney value={value} />,
},

  {
    title: 'Total (ML)',
    dataIndex: 'total',
    key: 'total',
    width: 140,
    align: 'right',
    sorter: (a, b) => (a.total ?? -Infinity) - (b.total ?? -Infinity),
    render: (value) => <MoneyCell value={value} />,
  },

  // Base
  {
    title: 'Custo',
    dataIndex: 'cost',
    key: 'cost',
    width: 130,
    align: 'right',
    sorter: (a, b) => (a.cost ?? -Infinity) - (b.cost ?? -Infinity),
    render: (value: number | null) =>
      value === null ? <Tag color="orange">Não cadastrado</Tag> : <MoneyCell value={value} />,
  },

  // Resultado
  {
    title: 'Lucro Bruto',
    dataIndex: 'lucro_bruto',
    key: 'lucro_bruto',
    width: 140,
    align: 'right',
    sorter: (a, b) => (a.lucro_bruto ?? -Infinity) - (b.lucro_bruto ?? -Infinity),
    render: (value) => <ProfitCell value={value} />,
  },

  {
    title: 'Anúncio (ML)',
    dataIndex: 'ml_listing_id',
    key: 'ml_listing_id',
    width: 170,
    ellipsis: true,
    render: (val: string | null) => (
      <Tooltip title={val || '—'}>
        <Text copyable style={{ opacity: val ? 1 : 0.6 }}>
          {val || '—'}
        </Text>
      </Tooltip>
    ),
  },
];

/**
 * Gera uma assinatura determinística da linha
 */
function buildRowSignature(row: DashboardRow) {
  return [
    row.sku ?? '',
    row.descricao ?? '',
    row.status_group ?? '',
    row.estado ?? '',
    row.lucro_bruto ?? '',
    row.sale_number ?? '',
    row.ml_listing_id ?? '',
  ].join('|');
}

export const DashboardTable: React.FC<{
  data: DashboardRow[];
  loading: boolean;
  onRowClick: (record: DashboardRow) => void;
}> = ({ data, loading, onRowClick }) => {
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
      }}
      scroll={{ x: 1700 }}
      size="middle"
      onRow={(record) => ({
        onClick: () => onRowClick(record),
        style: { cursor: 'pointer' },
      })}
    />
  );
};
