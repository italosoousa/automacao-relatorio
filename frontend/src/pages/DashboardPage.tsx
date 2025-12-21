// /frontend/src/pages/DashboardPage.tsx
import React, { useState, useMemo } from 'react';
import { Layout, Typography, Alert, Spin, Result, Space } from 'antd';
import { FileUpload } from '../components/FileUpload';
import { getDashboardPreview, DashboardResponse } from '../api/dashboard';
import { SummaryCards } from '../components/SummaryCards';
import { StateFilter } from '../components/StateFilter';
import { DashboardTable } from '../components/DashboardTable';
import { MissingSkusDrawer } from '../components/MissingSkusDrawer'; // Importado

const { Content } = Layout;
const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Estado do Drawer

  const handleGenerate = async (mlFile: File, baseFile: File) => {
    setLoading(true);
    setError(null);
    setDashboardData(null);
    setSelectedState(null);

    try {
      const data = await getDashboardPreview(mlFile, baseFile);
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (!dashboardData) return [];
    if (!selectedState) return dashboardData.rows;
    return dashboardData.rows.filter(row => row.estado === selectedState);
  }, [dashboardData, selectedState]);
  
  const filteredProfit = useMemo(() => {
    if (!selectedState || filteredRows.length === 0) return undefined;
    return filteredRows.reduce((acc, row) => acc + (row.lucro_bruto || 0), 0);
  }, [filteredRows, selectedState]);

  const handleOpenDrawer = () => setIsDrawerOpen(true);
  const handleCloseDrawer = () => setIsDrawerOpen(false);

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
                filteredCount={filteredRows.length} 
                filteredProfit={filteredProfit}
                isFilterActive={!!selectedState}
                onMissingSkusClick={handleOpenDrawer} // Conectado
            />
            <StateFilter states={dashboardData.states} onFilterChange={setSelectedState} disabled={loading} />
            <DashboardTable data={filteredRows} loading={loading} />
          </Space>
        )}
      </Space>
      
      {/* Drawer renderizado aqui, fora do fluxo principal */}
      <MissingSkusDrawer 
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        items={dashboardData?.missing_skus || []}
      />
    </Content>
  );
};
