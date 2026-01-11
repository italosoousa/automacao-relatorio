// /frontend/src/components/ExportButton.tsx
import React from 'react';
import { Button, Dropdown, MenuProps, message } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FileTextOutlined } from '@ant-design/icons';
import { DashboardRow } from '../api/dashboard';
// @ts-ignore
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  data: DashboardRow[];
  filename?: string;
}

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const exportToExcel = (data: DashboardRow[], filename: string) => {
  try {
    // Prepara os dados para exportação
    const exportData = data.map((row) => ({
      SKU: row.sku || 'N/A',
      Descrição: row.descricao || 'N/A',
      Status: row.status_group || 'N/A',
      Estado: row.estado || 'N/A',
      'Nº da Venda': row.sale_number || 'N/A',
      'Data da Venda': row.sale_date || 'N/A',
      'Descrição do Status': row.status_description || 'N/A',
      'Receita (Produto)': row.revenue_product !== null ? formatCurrency(row.revenue_product) : 'N/A',
      'Tarifa + Impostos': row.fee_taxes !== null ? formatCurrency(row.fee_taxes) : 'N/A',
      'Tarifa de Envio': row.shipping_fees !== null ? formatCurrency(row.shipping_fees) : 'N/A',
      'Total (ML)': row.total !== null ? formatCurrency(row.total) : 'N/A',
      Custo: row.cost !== null ? formatCurrency(row.cost) : 'N/A',
      'Lucro Bruto': row.lucro_bruto !== null ? formatCurrency(row.lucro_bruto) : 'N/A',
      'ID Anúncio (ML)': row.ml_listing_id || 'N/A',
    }));

    // Cria a workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Ajusta largura das colunas
    const colWidths = [
      { wch: 15 }, // SKU
      { wch: 40 }, // Descrição
      { wch: 15 }, // Status
      { wch: 25 }, // Estado
      { wch: 15 }, // Nº da Venda
      { wch: 15 }, // Data da Venda
      { wch: 30 }, // Descrição do Status
      { wch: 18 }, // Receita
      { wch: 18 }, // Tarifa + Impostos
      { wch: 18 }, // Tarifa de Envio
      { wch: 18 }, // Total
      { wch: 18 }, // Custo
      { wch: 18 }, // Lucro Bruto
      { wch: 20 }, // ID Anúncio
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');

    // Faz o download
    XLSX.writeFile(wb, `${filename}.xlsx`);
    message.success('Arquivo Excel exportado com sucesso!');
  } catch (error) {
    message.error('Erro ao exportar arquivo Excel');
    console.error(error);
  }
};

const exportToCSV = (data: DashboardRow[], filename: string) => {
  try {
    // Cabeçalhos
    const headers = [
      'SKU',
      'Descrição',
      'Status',
      'Estado',
      'Nº da Venda',
      'Data da Venda',
      'Descrição do Status',
      'Receita (Produto)',
      'Tarifa + Impostos',
      'Tarifa de Envio',
      'Total (ML)',
      'Custo',
      'Lucro Bruto',
      'ID Anúncio (ML)',
    ];

    // Dados
    const rows = data.map((row) => [
      row.sku || 'N/A',
      row.descricao || 'N/A',
      row.status_group || 'N/A',
      row.estado || 'N/A',
      row.sale_number || 'N/A',
      row.sale_date || 'N/A',
      row.status_description || 'N/A',
      row.revenue_product !== null ? formatCurrency(row.revenue_product) : 'N/A',
      row.fee_taxes !== null ? formatCurrency(row.fee_taxes) : 'N/A',
      row.shipping_fees !== null ? formatCurrency(row.shipping_fees) : 'N/A',
      row.total !== null ? formatCurrency(row.total) : 'N/A',
      row.cost !== null ? formatCurrency(row.cost) : 'N/A',
      row.lucro_bruto !== null ? formatCurrency(row.lucro_bruto) : 'N/A',
      row.ml_listing_id || 'N/A',
    ]);

    // Converte para CSV
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    // BOM para UTF-8 (suporta acentos)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success('Arquivo CSV exportado com sucesso!');
  } catch (error) {
    message.error('Erro ao exportar arquivo CSV');
    console.error(error);
  }
};

export const ExportButton: React.FC<ExportButtonProps> = ({ data, filename = 'dashboard' }) => {
  const items: MenuProps['items'] = [
    {
      key: 'excel',
      label: 'Exportar para Excel (.xlsx)',
      icon: <FileExcelOutlined />,
      onClick: () => exportToExcel(data, filename),
    },
    {
      key: 'csv',
      label: 'Exportar para CSV (.csv)',
      icon: <FileTextOutlined />,
      onClick: () => exportToCSV(data, filename),
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button icon={<DownloadOutlined />} disabled={data.length === 0}>
        Exportar Dados
      </Button>
    </Dropdown>
  );
};
