// /frontend/src/components/SummaryCards.tsx
import React from 'react';
import { Card, Col, Row, Statistic, theme, Divider, Space, Tooltip } from 'antd';
import { 
    DollarCircleOutlined, 
    PieChartOutlined, 
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    FilterOutlined
} from '@ant-design/icons';
import { DashboardSummary } from '@/api/dashboard';

const { useToken } = theme;

interface SummaryCardsProps {
  summary: DashboardSummary;
  filteredCount?: number;
  filteredProfit?: number;
  isFilterActive: boolean;
  onMissingSkusClick: () => void; // Nova prop
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const KPICard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; note?: string; onClick?: () => void; }> = 
({ title, value, icon, color, note, onClick }) => {
    const cardStyles: React.CSSProperties = onClick ? { cursor: 'pointer' } : {};
    
    const cardContent = (
      <Card hoverable={!!onClick} style={cardStyles} onClick={onClick}>
          <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space direction="vertical">
                  <Statistic title={title} value={value} valueStyle={{ color, fontSize: '2rem', fontWeight: 600 }} />
                  {note && <div style={{ opacity: 0.6, marginTop: 8 }}>{note}</div>}
              </Space>
              <div style={{ fontSize: '2rem', opacity: 0.3 }}>{icon}</div>
          </Space>
      </Card>
    );

    return onClick ? <Tooltip title="Clique para ver detalhes">{cardContent}</Tooltip> : cardContent;
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, filteredCount, filteredProfit, isFilterActive, onMissingSkusClick }) => {
    const { token } = useToken();

    const profitColor = summary.total_lucro >= 0 ? token.colorSuccess : token.colorError;
    const filteredProfitColor = (filteredProfit ?? 0) >= 0 ? token.colorSuccess : token.colorError;

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={8}>
                    <KPICard 
                        title="Lucro Total (Geral)"
                        value={formatCurrency(summary.total_lucro)}
                        icon={<DollarCircleOutlined />}
                        color={profitColor}
                        note={`Baseado em ${summary.total_itens} itens vendidos`}
                    />
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <KPICard 
                        title="Itens Mapeados"
                        value={summary.total_itens - summary.skus_sem_cadastro}
                        icon={<CheckCircleOutlined />}
                        color={token.colorText}
                    />
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <KPICard 
                        title="Produtos Não Identificados"
                        value={summary.skus_sem_cadastro}
                        icon={<ExclamationCircleOutlined />}
                        color={summary.skus_sem_cadastro > 0 ? token.colorWarning : token.colorText}
                        note={summary.skus_sem_cadastro > 0 ? "Produtos sem SKU ou sem cadastro - lucro não calculado" : "Todos os produtos foram identificados"}
                        onClick={summary.skus_sem_cadastro > 0 ? onMissingSkusClick : undefined} // Tornando o card clicável
                    />
                </Col>
            </Row>

            {isFilterActive && (
                <>
                    <Divider><FilterOutlined /> Resultados do Filtro</Divider>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                             <KPICard 
                                title="Lucro Total (Filtro)"
                                value={formatCurrency(filteredProfit ?? 0)}
                                icon={<DollarCircleOutlined />}
                                color={filteredProfitColor}
                                note={`em ${filteredCount} itens filtrados`}
                            />
                        </Col>
                        <Col xs={24} sm={12}>
                             <KPICard 
                                title="Quantidade (Filtro)"
                                value={filteredCount ?? 0}
                                icon={<PieChartOutlined />}
                                color={token.colorText}
                            />
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};
