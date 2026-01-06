// /frontend/src/pages/DashboardPage.tsx
import React, { useState, useMemo } from 'react';
import { Layout, Typography, Alert, Spin, Result, Space, Input } from 'antd';

import { FileUpload } from '../components/FileUpload';
import { getDashboardPreview, DashboardResponse, DashboardRow } from '../api/dashboard';
import { SummaryCards } from '../components/SummaryCards';
import { StatusFilter } from '../components/StatusFilter';
import { OriginalStateFilter } from '../components/OriginalStateFilter';
import { DashboardTable } from '../components/DashboardTable';
import { MissingSkusDrawer } from '../components/MissingSkusDrawer';
import { ProductDetailsModal } from '../components/ProductDetailsModal';

const { Content } = Layout;
const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedStatusGroup, setSelectedStatusGroup] = useState<string | null>(null);
  const [selectedOriginalState, setSelectedOriginalState] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // --- Modal de Detalhes ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DashboardRow | null>(null);

  // --- Barra de pesquisa ---
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleGenerate = async (mlFile: File, baseFile: File) => {
    setLoading(true);
    setError(null);
    setDashboardData(null);

    // reset filtros
    setSelectedStatusGroup(null);
    setSelectedOriginalState(null);
    setSearchTerm('');

    try {
      const data = await getDashboardPreview(mlFile, baseFile);
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers do Modal ---
  const handleRowClick = (record: DashboardRow) => {
    setSelectedRow(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  // 1) Filtragem por Status Group
  const filteredByStatusGroup = useMemo(() => {
    if (!dashboardData) return [];
    if (!selectedStatusGroup) return dashboardData.rows;
    return dashboardData.rows.filter((row) => row.status_group === selectedStatusGroup);
  }, [dashboardData, selectedStatusGroup]);

  // 2) Opções de Estado disponíveis baseadas no Status Group selecionado
  const availableOriginalStates = useMemo(() => {
    if (!filteredByStatusGroup.length) return [];
    const states = new Set<string>();
    filteredByStatusGroup.forEach((row) => {
      if (row.estado) states.add(row.estado);
    });
    return Array.from(states).sort();
  }, [filteredByStatusGroup]);

  // 3) Filtragem final combinada (Status Group + Estado Original)
  const finalFilteredRows = useMemo(() => {
    if (!selectedOriginalState) return filteredByStatusGroup;
    return filteredByStatusGroup.filter((row) => row.estado === selectedOriginalState);
  }, [filteredByStatusGroup, selectedOriginalState]);

  // 4) Busca textual (SKU, Nº da venda, Descrição) aplicada por último
  const searchedRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return finalFilteredRows;

    return finalFilteredRows.filter((row) => {
      const sku = (row.sku ?? '').toString().toLowerCase();
      const saleNumber = (row.sale_number ?? '').toString().toLowerCase();
      const desc = (row.descricao ?? '').toString().toLowerCase();

      return sku.includes(term) || saleNumber.includes(term) || desc.includes(term);
    });
  }, [finalFilteredRows, searchTerm]);

  // 5) Lucro e quantidade filtrados (baseado no resultado final)
  const filteredProfit = useMemo(() => {
    if (!searchedRows.length) return undefined;
    return searchedRows.reduce((acc, row) => acc + (row.lucro_bruto ?? 0), 0);
  }, [searchedRows]);

  const filteredCount = useMemo(() => searchedRows.length, [searchedRows]);

  // Quando muda o Status, reseta o Estado
  const handleStatusGroupChange = (status: string | null) => {
    setSelectedStatusGroup(status);
    setSelectedOriginalState(null);
  };

  const handleOpenDrawer = () => setIsDrawerOpen(true);
  const handleCloseDrawer = () => setIsDrawerOpen(false);

  const hasAnyFilter = !!selectedStatusGroup || !!selectedOriginalState || !!searchTerm.trim();

  return (
    <Content style={{ padding: '24px 48px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2} style={{ margin: 0 }}>
          Dashboard de Análise de Lucro
        </Title>

        <FileUpload onGenerate={handleGenerate} loading={loading} />

        {error && (
          <Alert
            message="Erro ao Gerar Dashboard"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {loading && <Spin spinning tip="Processando planilhas..." fullscreen />}

        {!loading && !error && !dashboardData && (
          <Result
            icon={<Text style={{ fontSize: 48 }}>📊</Text>}
            title="Aguardando arquivos"
            subTitle="Por favor, faça o upload das duas planilhas e clique em 'Gerar Dashboard' para começar."
          />
        )}

        {dashboardData && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <SummaryCards
              summary={dashboardData.summary}
              filteredCount={filteredCount}
              filteredProfit={filteredProfit}
              isFilterActive={hasAnyFilter}
              onMissingSkusClick={handleOpenDrawer}
            />

            {/* Barra de pesquisa */}
            <Input.Search
              placeholder="Buscar por SKU, número da venda ou descrição..."
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: 520 }}
            />

            <Space wrap>
              <StatusFilter
                statusOptions={dashboardData.filter_options.status_group}
                onFilterChange={handleStatusGroupChange}
                disabled={loading}
              />

              <OriginalStateFilter
                stateOptions={availableOriginalStates}
                onFilterChange={setSelectedOriginalState}
                disabled={loading || !selectedStatusGroup}
                value={selectedOriginalState}
              />
            </Space>

            <DashboardTable
              data={searchedRows}
              loading={loading}
              onRowClick={handleRowClick}
            />
          </Space>
        )}
      </Space>

      <MissingSkusDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        items={dashboardData?.missing_skus || []}
      />

      <ProductDetailsModal
        open={isModalOpen}
        onClose={handleCloseModal}
        data={selectedRow}
      />
    </Content>
  );
};
