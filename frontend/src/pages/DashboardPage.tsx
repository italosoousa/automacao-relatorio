// /frontend/src/pages/DashboardPage.tsx
import React, { useState, useMemo } from 'react';
import { Layout, Typography, Alert, Spin, Result, Space } from 'antd';

import { FileUpload } from '../components/FileUpload';
import { getDashboardPreview, DashboardResponse } from '../api/dashboard';
import { SummaryCards } from '../components/SummaryCards';
import { StatusFilter } from '../components/StatusFilter';
import { OriginalStateFilter  } from '../components/OriginalStateFilter'; // ✅ CORRIGIDO (antes era OriginalStateFilter)
import { DashboardTable } from '../components/DashboardTable';
import { MissingSkusDrawer } from '../components/MissingSkusDrawer';

const { Content } = Layout;
const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedStatusGroup, setSelectedStatusGroup] = useState<string | null>(null);
  const [selectedOriginalState, setSelectedOriginalState] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleGenerate = async (mlFile: File, baseFile: File) => {
    setLoading(true);
    setError(null);
    setDashboardData(null);

    // reset filtros
    setSelectedStatusGroup(null);
    setSelectedOriginalState(null);

    try {
      const data = await getDashboardPreview(mlFile, baseFile);
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
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

  // 4) Lucro e quantidade filtrados (baseado no filtro final)
  const filteredProfit = useMemo(() => {
    if (!finalFilteredRows.length) return undefined;
    return finalFilteredRows.reduce((acc, row) => acc + (row.lucro_bruto || 0), 0);
  }, [finalFilteredRows]);

  const filteredCount = useMemo(() => finalFilteredRows.length, [finalFilteredRows]);

  // Quando muda o Status, reseta o Estado
  const handleStatusGroupChange = (status: string | null) => {
    setSelectedStatusGroup(status);
    setSelectedOriginalState(null);
  };

  const handleOpenDrawer = () => setIsDrawerOpen(true);
  const handleCloseDrawer = () => setIsDrawerOpen(false);

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

        {/* ✅ Corrigido: Spin com tip precisa ser nested ou fullscreen */}
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
              isFilterActive={!!selectedStatusGroup || !!selectedOriginalState}
              onMissingSkusClick={handleOpenDrawer}
            />

            <Space>
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


            <DashboardTable data={finalFilteredRows} loading={loading} />
          </Space>
        )}
      </Space>

      <MissingSkusDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        items={dashboardData?.missing_skus || []}
      />
    </Content>
  );
};
