// /frontend/src/components/StatusStatistics.tsx
import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Tag, Progress } from 'antd';
import { DashboardRow } from '../api/dashboard';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

interface StatusStatisticsProps {
  data: DashboardRow[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const StatusStatistics: React.FC<StatusStatisticsProps> = ({ data }) => {
  const stats = useMemo(() => {
    const groups: Record<string, { count: number; profit: number; items: DashboardRow[] }> = {
      ENVIADO: { count: 0, profit: 0, items: [] },
      A_ENVIAR: { count: 0, profit: 0, items: [] },
      MEDIACAO: { count: 0, profit: 0, items: [] },
      CANCELADO: { count: 0, profit: 0, items: [] },
    };

    data.forEach((row) => {
      const status = row.status_group;
      if (groups[status]) {
        groups[status].count++;
        groups[status].items.push(row);
        if (row.lucro_bruto !== null) {
          groups[status].profit += row.lucro_bruto;
        }
      }
    });

    return groups;
  }, [data]);

  const totalItems = data.length;
  const totalProfit = data.reduce((acc, row) => acc + (row.lucro_bruto ?? 0), 0);

  const statusConfig = [
    {
      key: 'ENVIADO',
      title: 'Enviados',
      icon: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
    },
    {
      key: 'A_ENVIAR',
      title: 'A Enviar',
      icon: <ClockCircleOutlined style={{ color: '#13c2c2' }} />,
      color: '#13c2c2',
    },
    {
      key: 'MEDIACAO',
      title: 'Mediação',
      icon: <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />,
      color: '#fa8c16',
    },
    {
      key: 'CANCELADO',
      title: 'Cancelados',
      icon: <CloseCircleOutlined style={{ color: '#f5222d' }} />,
      color: '#f5222d',
    },
  ];

  return (
    <Card title="Estatísticas por Status" style={{ marginTop: 16 }}>
      <Row gutter={[16, 16]}>
        {statusConfig.map((config) => {
          const stat = stats[config.key];
          const percentage = totalItems > 0 ? (stat.count / totalItems) * 100 : 0;

          return (
            <Col xs={24} sm={12} lg={6} key={config.key}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 12, fontSize: 24 }}>{config.icon}</div>
                <Statistic
                  title={config.title}
                  value={stat.count}
                  suffix={`(${percentage.toFixed(1)}%)`}
                  valueStyle={{ fontSize: '1.5rem', fontWeight: 600 }}
                />
                <Progress
                  percent={percentage}
                  strokeColor={config.color}
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
                <div style={{ marginTop: 8, fontSize: '0.9rem', opacity: 0.7 }}>
                  {stat.count > 0 && stat.profit !== 0 ? (
                    <Tag color={config.color}>
                      Lucro: {formatCurrency(stat.profit)}
                    </Tag>
                  ) : (
                    <Tag color="default">Sem lucro calculado</Tag>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};
