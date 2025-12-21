// /frontend/src/pages/DashboardPage.tsx
import React, { useState, useMemo } from 'react';
import { Layout, Typography, Alert, Spin, Result, Space } from 'antd';
import { FileUpload } from '../components/FileUpload';
import { getDashboardPreview, DashboardResponse } from '../api/dashboard';
import { SummaryCards } from '../components/SummaryCards';
import { StatusFilter } from '../components/StatusFilter'; // ALTERADO
import { DashboardTable } from '../components/DashboardTable';
import { MissingSkusDrawer } from '../components/MissingSkusDrawer';

const { Content } = Layout;
const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatusGroup, setSelectedStatusGroup] = useState<string | null>(null);
  const [selectedOriginalState, setSelectedOriginalState] = useState<string | null>(null); // NOVO ESTADO
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleGenerate = async (mlFile: File, baseFile: File) => {
    setLoading(true);
    setError(null);
    setDashboardData(null);
    setSelectedStatusGroup(null);
    setSelectedOriginalState(null); // RESET NOVO ESTADO

    try {
      const data = await getDashboardPreview(mlFile, baseFile);
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  // Filtragem por Status Group
  const filteredByStatusGroup = useMemo(() => {
    if (!dashboardData) return [];
    if (!selectedStatusGroup) return dashboardData.rows;
    return dashboardData.rows.filter(row => row.status_group === selectedStatusGroup);
  }, [dashboardData, selectedStatusGroup]);

  // Opções de Estado disponíveis baseadas no Status Group selecionado
  const availableOriginalStates = useMemo(() => {
    if (!filteredByStatusGroup || filteredByStatusGroup.length === 0) return [];
    const states = new Set<string>();
    filteredByStatusGroup.forEach(row => {
      if (row.estado) states.add(row.estado);
    });
    return Array.from(states).sort();
  }, [filteredByStatusGroup]);

  // Filtragem final combinada (Status Group + Estado Original)
  const finalFilteredRows = useMemo(() => {
    if (!selectedOriginalState) return filteredByStatusGroup;
    return filteredByStatusGroup.filter(row => row.estado === selectedOriginalState);
  }, [filteredByStatusGroup, selectedOriginalState]);

  // Lucro e quantidade filtrados
  const filteredProfit = useMemo(() => {
    if (!finalFilteredRows || finalFilteredRows.length === 0) return undefined;
    return finalFilteredRows.reduce((acc, row) => acc + (row.lucro_bruto || 0), 0);
  }, [finalFilteredRows]);

  const filteredCount = useMemo(() => {
    return finalFilteredRows.length;
  }, [finalFilteredRows]);

  // Handler para mudança do filtro de Status Group, reseta o filtro de Estado Original
  const handleStatusGroupChange = (status: string | null) => {
    setSelectedStatusGroup(status);
    setSelectedOriginalState(null); // Resetar filtro de estado ao mudar o status group
  };

  const handleOpenDrawer = () => setIsDrawerOpen(true);
  const handleCloseDrawer = () => setIsDrawerOpen(false); // Corrigido o typo setIsDrawerInClose

  return (
    <Content style={{ padding: '24px 48px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2} style={{ margin: 0 }}>
          Dashboard de Análise de Lucro
        </Title>
        
        <FileUpload onGenerate={handleGenerate} loading={loading} />

        {error && <Alert message="Erro ao Gerar Dashboard" description={error} type="error" showIcon closable onClose={() => setError(null)} />}

        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Spin size="large" tip="Processando planilhas..." /></div>}

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
                isFilterActive={!!selectedStatusGroup || !!selectedOriginalState} // Atualizado
                onMissingSkusClick={handleOpenDrawer}
            />
            <Space> {/* Agrupa os filtros */}
                <StatusFilter 
                    statusOptions={dashboardData.filter_options.status_group} 
                    onFilterChange={handleStatusGroupChange} // Usa o novo handler
                    disabled={loading} 
                />
                <OriginalStateFilter 
                    stateOptions={availableOriginalStates}
                    onFilterChange={setSelectedOriginalState}
                    disabled={loading || !selectedStatusGroup} // Desabilita se não houver status group selecionado
                    value={selectedOriginalState} // Passa o valor para controle do Select
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
