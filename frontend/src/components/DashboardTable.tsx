import React, { useMemo } from 'react';
import { Table, Tag, Tooltip, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DashboardRow } from '../api/dashboard';

const { useToken } = theme;

/**
 * Tipo interno com chave estável para o Ant Design Table
 */
type RowWithKey = DashboardRow & { __rowKey: string };

const ProfitTag: React.FC<{ value: number | null }> = ({ value }) => {
  const { token } = useToken();

  if (value === null || value === undefined) {
    return <Tag color="default">N/A</Tag>;
  }

  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  const color = value >= 0 ? token.colorSuccess : token.colorError;

  return <span style={{ color, fontWeight: 500 }}>{formatted}</span>;
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
    title: 'Código do Produto (SKU)',
    dataIndex: 'sku',
    key: 'sku',
    sorter: (a, b) => (a.sku || '').localeCompare(b.sku || ''),
    render: (sku) => sku || <span style={{ opacity: 0.6 }}>Sem SKU</span>,
  },
  {
    title: 'Descrição do Produto',
    dataIndex: 'descricao',
    key: 'descricao',
    sorter: (a, b) => a.descricao.localeCompare(b.descricao),
    render: (text, record) => {
      if (record.lucro_bruto === null) {
        return (
          <Tooltip title="Este SKU não foi encontrado na base de produtos. O lucro não pôde ser calculado.">
            <span style={{ opacity: 0.8 }}>
              {text}{' '}
              <Tag color="warning" style={{ marginLeft: 4 }}>
                Sem Custo
              </Tag>
            </span>
          </Tooltip>
        );
      }
      return text;
    },
  },
  {
    title: 'Status',
    dataIndex: 'status_group',
    key: 'status_group',
    sorter: (a, b) => a.status_group.localeCompare(b.status_group),
    render: (status) => <StatusGroupTag status={status} />,
  },
  {
    title: 'Estado',
    dataIndex: 'estado',
    key: 'estado',
    sorter: (a, b) => (a.estado || '').localeCompare(b.estado || ''),
    render: (estado) => estado || 'Indefinido',
  },
  {
    title: 'Lucro Bruto',
    dataIndex: 'lucro_bruto',
    key: 'lucro_bruto',
    align: 'right',
    sorter: (a, b) =>
      (a.lucro_bruto ?? -Infinity) - (b.lucro_bruto ?? -Infinity),
    render: (value) => <ProfitTag value={value} />,
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
  ].join('|');
}

export const DashboardTable: React.FC<{
  data: DashboardRow[];
  loading: boolean;
}> = ({ data, loading }) => {
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
      scroll={{ x: 'max-content' }}
      size="middle"
    />
  );
};
