// /frontend/src/components/DashboardTable.tsx
import React from 'react';
import { Table, Tag, Tooltip, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DashboardRow } from '../api/dashboard';

const { useToken } = theme;

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
}

const columns: ColumnsType<DashboardRow> = [
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
        if(record.lucro_bruto === null) {
            return (
                <Tooltip title="Este SKU não foi encontrado na base de produtos. O lucro não pôde ser calculado.">
                    <span style={{ opacity: 0.8 }}>{text} <Tag color="warning" style={{marginLeft: 4}}>Sem Custo</Tag></span>
                </Tooltip>
            )
        }
        return text;
    }
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
    sorter: (a, b) => (a.lucro_bruto ?? -Infinity) - (b.lucro_bruto ?? -Infinity),
    render: (value) => <ProfitTag value={value} />,
  },
];

export const DashboardTable: React.FC<{ data: DashboardRow[]; loading: boolean; }> = ({ data, loading }) => (
  <Table<DashboardRow>
    columns={columns}
    dataSource={data}
    loading={loading}
    rowKey={(record, index) => `${record.sku}-${index}`}
    pagination={{ 
        pageSize: 20, 
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'] 
    }}
    scroll={{ x: 'max-content' }}
    size="middle"
  />
);