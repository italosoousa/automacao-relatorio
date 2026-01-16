// /frontend/src/pages/RfidDashboardPage.tsx
import React, { useState, useMemo } from 'react';
import {
  Layout,
  Typography,
  Alert,
  Spin,
  Result,
  Space,
  Input,
  Card,
  Radio,
  Divider,
} from 'antd';
import {
  FilterOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

import { FileUpload } from '../components/FileUpload';
import {
  getRfidDashboardPreview,
  RfidDashboardResponse,
  RfidDashboardRow,
  RfidStatus,
} from '../api/rfidDashboard';
import { RfidSummaryCards } from '../components/RfidSummaryCards';
import { RfidDashboardTable } from '../components/RfidDashboardTable';
import { ExportButton } from '../components/ExportButton';
import { QuickActions } from '../components/QuickActions';
import { StatusFilter } from '../components/StatusFilter';

const { Content } = Layout;
const { Title, Text } = Typography;

type ViewMode = 'all' | 'divergencias' | 'ok';

export const RfidDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<RfidDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Filtros ---
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const handleGenerate = async (microvixFile: File, rfidFile: File) => {
    setLoading(true);
    setError(null);
    setDashboardData(null);

    // Reset filtros
    setSearchTerm('');
    setSelectedStatus(null);
    setViewMode('all');

    try {
      const data = await getRfidDashboardPreview(microvixFile, rfidFile);
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  // 1) Filtragem por modo de visualização
  const filteredByViewMode = useMemo(() => {
    if (!dashboardData) return [];

    const allRows = dashboardData.all || [
      ...dashboardData.divergencias,
      ...dashboardData.ok,
    ];

    if (viewMode === 'divergencias') {
      return allRows.filter((row) => row.status !== 'OK');
    } else if (viewMode === 'ok') {
      return allRows.filter((row) => row.status === 'OK');
    }

    return allRows; // 'all'
  }, [dashboardData, viewMode]);

  // 2) Filtragem por status específico
  const filteredByStatus = useMemo(() => {
    if (!selectedStatus) return filteredByViewMode;
    return filteredByViewMode.filter((row) => row.status === selectedStatus);
  }, [filteredByViewMode, selectedStatus]);

  // 3) Busca textual (EAN ou descrição)
  const searchedRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return filteredByStatus;

    return filteredByStatus.filter((row) => {
      const ean = (row.codigo_barras ?? '').toLowerCase();
      const desc = (row.descricao ?? '').toLowerCase();
      return ean.includes(term) || desc.includes(term);
    });
  }, [filteredByStatus, searchTerm]);

  // Opções de status disponíveis (baseado nos dados)
  const availableStatuses = useMemo(() => {
    if (!dashboardData) return [];

    const allRows = dashboardData.all || [
      ...dashboardData.divergencias,
      ...dashboardData.ok,
    ];

    const statuses = new Set<RfidStatus>();
    allRows.forEach((row) => statuses.add(row.status));

    return Array.from(statuses).sort();
  }, [dashboardData]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus(null);
    setViewMode('all');
  };

  const handleReset = () => {
    setDashboardData(null);
    handleClearFilters();
  };

  const hasAnyFilter =
    !!searchTerm.trim() || !!selectedStatus || viewMode !== 'all';

  // Total de itens antes dos filtros
  const totalItems = useMemo(() => {
    if (!dashboardData) return 0;
    return (
      dashboardData.all?.length ||
      dashboardData.divergencias.length + dashboardData.ok.length
    );
  }, [dashboardData]);

  return (
    <Content style={{ padding: '16px', maxWidth: '100%', overflowX: 'auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <Title level={2} style={{ margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.75rem)' }}>
            🏷️ Conferência RFID
          </Title>
          {dashboardData && (
            <Text type="secondary" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}>
              Última atualização: {new Date().toLocaleString('pt-BR')}
            </Text>
          )}
        </div>

        {/* Upload de Arquivos */}
        <FileUpload
          onGenerate={handleGenerate}
          loading={loading}
          file1Label="Planilha MICROVIX (.xlsx)"
          file2Label="Planilha RFID (.csv)"
          buttonText="Gerar Conferência"
        />

        {/* Error Alert */}
        {error && (
          <Alert
            message="Erro ao Gerar Conferência"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {/* Loading Spinner */}
        {loading && <Spin spinning tip="Processando conferência..." fullscreen />}

        {/* Empty State */}
        {!loading && !error && !dashboardData && (
          <Result
            icon={<Text style={{ fontSize: 48 }}>🏷️</Text>}
            title="Aguardando arquivos"
            subTitle="Faça o upload da planilha MICROVIX e do arquivo RFID para iniciar a conferência."
          />
        )}

        {/* Dashboard Content */}
        {dashboardData && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Summary Cards */}
            <RfidSummaryCards cards={dashboardData.cards} />

            {/* Filtros e Ações */}
            <Card
              title={
                <Space>
                  <FilterOutlined />
                  <span>Filtros e Visualização</span>
                </Space>
              }
              extra={
                <Space wrap style={{ marginTop: '8px' }}>
                  <QuickActions
                    onClearFilters={handleClearFilters}
                    onReset={handleReset}
                    hasFilters={hasAnyFilter}
                    hasData={!!dashboardData}
                  />
                  <ExportButton
                    data={searchedRows}
                    filename={`rfid-conferencia-${new Date().toISOString().split('T')[0]}`}
                  />
                </Space>
              }
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Busca */}
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Buscar por código de barras (EAN) ou descrição..."
                  allowClear
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%' }}
                  size="large"
                />

                {/* Modo de Visualização */}
                <div>
                  <Text strong style={{ marginRight: 12 }}>
                    Visualizar:
                  </Text>
                  <Radio.Group
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="all">
                      📊 Todos ({totalItems})
                    </Radio.Button>
                    <Radio.Button value="divergencias">
                      ⚠️ Divergências ({dashboardData.cards.total_divergencias})
                    </Radio.Button>
                    <Radio.Button value="ok">
                      ✅ OK ({dashboardData.cards.itens_ok})
                    </Radio.Button>
                  </Radio.Group>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* Filtro por Status */}
                <StatusFilter
                  statusOptions={availableStatuses}
                  onFilterChange={setSelectedStatus}
                  disabled={loading}
                />
              </Space>
            </Card>

            {/* Alert de Filtros Ativos */}
            {hasAnyFilter && (
              <Alert
                message={`Mostrando ${searchedRows.length} de ${totalItems} itens`}
                type="info"
                showIcon
                closable
                onClose={handleClearFilters}
                action={
                  <QuickActions
                    onClearFilters={handleClearFilters}
                    onReset={handleReset}
                    hasFilters={hasAnyFilter}
                    hasData={!!dashboardData}
                  />
                }
              />
            )}

            {/* Tabela de Conferência */}
            <RfidDashboardTable data={searchedRows} loading={loading} />

            {/* Resumo Final */}
            {searchedRows.length === 0 && !loading && (
              <Result
                icon={
                  viewMode === 'ok' ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                  )
                }
                title={
                  viewMode === 'ok'
                    ? 'Nenhum item OK encontrado'
                    : 'Nenhum item encontrado'
                }
                subTitle={
                  hasAnyFilter
                    ? 'Tente ajustar os filtros ou limpar a busca.'
                    : 'Não há dados para exibir nesta visualização.'
                }
              />
            )}
          </Space>
        )}
      </Space>
    </Content>
  );
};
