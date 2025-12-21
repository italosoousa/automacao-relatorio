// /frontend/src/App.tsx
import React from 'react';
import { ConfigProvider, Layout, theme } from 'antd';
import { DashboardPage } from './pages/DashboardPage';
import './index.css';

const { Header, Footer } = Layout;

// Configuração do tema escuro profissional
const darkThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    // Cor primária moderna (um tom de azul)
    colorPrimary: '#1677ff', // Azul padrão do Ant Design V5, que é moderno
    // Cores para semântica
    colorSuccess: '#52c41a', // Verde para lucro
    colorError: '#ff4d4f',   // Vermelho para prejuízo
    colorWarning: '#faad14', // Laranja para avisos
    // Fontes e fundo
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    // Fundo principal um pouco mais claro que o padrão para os cards se destacarem
    colorBgLayout: '#141414',
    colorBgContainer: '#1d1d1d',
  },
  components: {
    Card: {
      headerBg: 'transparent',
    }
  }
};

const App: React.FC = () => (
  <ConfigProvider theme={darkThemeConfig}>
    <Layout style={{ minHeight: '100vh' }}>
      <Header 
        style={{ 
          background: darkThemeConfig.token.colorBgContainer, 
          padding: '0 24px', 
          borderBottom: '1px solid #303030'
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
          Analisador de Planilhas
        </div>
      </Header>
      <Layout>
        <DashboardPage />
      </Layout>
      <Footer style={{ textAlign: 'center', background: darkThemeConfig.token.colorBgLayout }}>
        Analisador de Planilhas ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  </ConfigProvider>
);

export default App;