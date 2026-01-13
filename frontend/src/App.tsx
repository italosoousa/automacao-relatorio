// /frontend/src/App.tsx
import React from "react";
import { ConfigProvider, Layout, theme } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MercadoLivreDashboardPage } from "./pages/MercadoLivreDashboardPage";
import { RfidDashboardPage } from "./pages/RfidDashboardPage";
import { SugestaoVendasDashboardPage } from "./pages/SugestaoVendasDashboardPage";
import { Navigation } from "./components/Navigation";
import "./index.css";

const { Header, Footer } = Layout;

// Configuração do tema escuro profissional
const darkThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    // Cor primária moderna (um tom de azul)
    colorPrimary: "#1677ff", // Azul padrão do Ant Design V5, que é moderno
    // Cores para semântica
    colorSuccess: "#52c41a", // Verde para lucro
    colorError: "#ff4d4f", // Vermelho para prejuízo
    colorWarning: "#faad14", // Laranja para avisos
    // Fontes e fundo
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    // Fundo principal um pouco mais claro que o padrão para os cards se destacarem
    colorBgLayout: "#141414",
    colorBgContainer: "#1d1d1d",
  },
  components: {
    Card: {
      headerBg: "transparent",
    },
  },
};

const App: React.FC = () => (
  <ConfigProvider theme={darkThemeConfig}>
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{
            background: darkThemeConfig.token.colorBgContainer,
            padding: "0 24px",
            borderBottom: "1px solid #303030",
            position: "sticky",
            top: 0,
            zIndex: 1000,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            height: "64px",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                boxShadow: "0 2px 4px rgba(22, 119, 255, 0.3)",
                flexShrink: 0,
              }}
            >
              📊
            </div>
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "white",
                  lineHeight: "1.2",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                Analisador de Planilhas
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.65)",
                  lineHeight: "1",
                  marginTop: "2px",
                  whiteSpace: "nowrap",
                }}
              >
                Sistema de Relatórios
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Navigation />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {/* Espaço reservado para balancear o layout */}
          </div>
        </Header>
        <Layout>
          <Routes>
            <Route path="/" element={<MercadoLivreDashboardPage />} />
            <Route path="/rfid-dashboard" element={<RfidDashboardPage />} />
            <Route
              path="/sugestao-vendas-dashboard"
              element={<SugestaoVendasDashboardPage />}
            />
          </Routes>
        </Layout>
        <Footer
          style={{
            textAlign: "center",
            background: darkThemeConfig.token.colorBgLayout,
            padding: "16px",
            fontSize: "0.85rem",
          }}
        >
          Analisador de Planilhas ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </BrowserRouter>
  </ConfigProvider>
);

export default App;
