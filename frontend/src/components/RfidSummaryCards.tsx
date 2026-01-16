// /frontend/src/components/RfidSummaryCards.tsx
import React from 'react';
import { Card, Col, Row, Statistic, theme, Space, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  FileTextOutlined,
  TagOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { RfidDashboardCards } from '../api/rfidDashboard';

const { useToken } = theme;

interface RfidSummaryCardsProps {
  cards: RfidDashboardCards;
}

const KPICard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  note?: string;
  onClick?: () => void;
}> = ({ title, value, icon, color, note, onClick }) => {
  const cardStyles: React.CSSProperties = onClick ? { cursor: 'pointer' } : {};

  const cardContent = (
    <Card hoverable={!!onClick} style={cardStyles} onClick={onClick}>
      <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Statistic
            title={title}
            value={value}
            valueStyle={{ color, fontSize: '2rem', fontWeight: 600 }}
          />
          {note && (
            <div style={{ opacity: 0.6, marginTop: 8, fontSize: '0.85rem' }}>
              {note}
            </div>
          )}
        </Space>
        <div style={{ fontSize: '2rem', opacity: 0.3 }}>{icon}</div>
      </Space>
    </Card>
  );

  return onClick ? (
    <Tooltip title="Clique para ver detalhes">{cardContent}</Tooltip>
  ) : (
    cardContent
  );
};

export const RfidSummaryCards: React.FC<RfidSummaryCardsProps> = ({ cards }) => {
  const { token } = useToken();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Linha 1: Totais MICROVIX e RFID */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <KPICard
            title="Total MICROVIX (Esperado)"
            value={cards.total_itens_microvix}
            icon={<FileTextOutlined />}
            color={token.colorPrimary}
            note="Quantidade total enviada/teórica"
          />
        </Col>
        <Col xs={24} sm={12}>
          <KPICard
            title="Total RFID (Lido)"
            value={cards.total_itens_rfid}
            icon={<TagOutlined />}
            color={token.colorInfo}
            note="Quantidade total lida pelo RFID"
          />
        </Col>
      </Row>

      {/* Linha 2: Status da Conferência */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <KPICard
            title="✅ Itens OK"
            value={cards.itens_ok}
            icon={<CheckCircleOutlined />}
            color={token.colorSuccess}
            note="Quantidades conferem"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <KPICard
            title="⚠️ Total de Divergências"
            value={cards.total_divergencias}
            icon={<DashboardOutlined />}
            color={
              cards.total_divergencias === 0
                ? token.colorSuccess
                : token.colorWarning
            }
            note={
              cards.total_divergencias === 0
                ? 'Nenhuma divergência encontrada'
                : 'Itens que precisam de atenção'
            }
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <KPICard
            title="📊 Total de Itens"
            value={cards.itens_ok + cards.total_divergencias}
            icon={<FileTextOutlined />}
            color={token.colorText}
            note="EANs únicos conferidos"
          />
        </Col>
      </Row>

      {/* Linha 3: Detalhamento das Divergências */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="❌ Faltando"
            value={cards.itens_faltando}
            icon={<MinusCircleOutlined />}
            color={
              cards.itens_faltando > 0 ? token.colorError : token.colorTextSecondary
            }
            note={
              cards.itens_faltando > 0
                ? 'RFID < MICROVIX'
                : 'Nenhum item faltando'
            }
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="📦 Sobrando"
            value={cards.itens_sobrando}
            icon={<PlusCircleOutlined />}
            color={
              cards.itens_sobrando > 0 ? token.colorWarning : token.colorTextSecondary
            }
            note={
              cards.itens_sobrando > 0
                ? 'RFID > MICROVIX'
                : 'Nenhum item sobrando'
            }
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="📋 Só MICROVIX"
            value={cards.itens_so_microvix}
            icon={<FileTextOutlined />}
            color={
              cards.itens_so_microvix > 0 ? token.colorError : token.colorTextSecondary
            }
            note={
              cards.itens_so_microvix > 0
                ? 'Não lido pelo RFID'
                : 'Todos foram lidos'
            }
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="🏷️ Só RFID"
            value={cards.itens_so_rfid}
            icon={<ExclamationCircleOutlined />}
            color={
              cards.itens_so_rfid > 0 ? token.colorWarning : token.colorTextSecondary
            }
            note={
              cards.itens_so_rfid > 0
                ? 'Não estava no MICROVIX'
                : 'Nenhum item extra'
            }
          />
        </Col>
      </Row>
    </Space>
  );
};
