// /frontend/src/components/Navigation.tsx
import React from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, FileTextOutlined, BarChartOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Mercado Livre',
    },
    {
      key: '/rfid-dashboard',
      icon: <FileTextOutlined />,
      label: 'RFID',
    },
    {
      key: '/sugestao-vendas-dashboard',
      icon: <BarChartOutlined />,
      label: 'Sugestão Vendas',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{
        background: 'transparent',
        borderBottom: 'none',
        lineHeight: '72px',
        fontSize: '14px',
        fontWeight: 500,
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        fontFamily: 'var(--font-body)',
      }}
    />
  );
};
