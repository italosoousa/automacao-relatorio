// /frontend/src/App.tsx
import React from "react";
import { ConfigProvider, Layout } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MercadoLivreDashboardPage } from "./pages/MercadoLivreDashboardPage";
import { RfidDashboardPage } from "./pages/RfidDashboardPage";
import { SugestaoVendasDashboardPage } from "./pages/SugestaoVendasDashboardPage";
import { Navigation } from "./components/Navigation";
import { bstoriesTheme } from "./theme/antd-bstories-theme";
import { BStoriesThemeTokens } from "./theme/bstories-tokens";
import "./index.css";

const { Header, Footer } = Layout;

const App: React.FC = () => (
  <ConfigProvider theme={bstoriesTheme}>
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{
            background: BStoriesThemeTokens.backgroundElevated,
            padding: "0 24px",
            borderBottom: `1px solid ${BStoriesThemeTokens.border}`,
            position: "sticky",
            top: 0,
            zIndex: 1000,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            boxShadow: `0 2px 8px ${BStoriesThemeTokens.shadowMedium}`,
            height: "72px",
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
            <img
              src="/IDV_B.stories_Versão05.png"
              alt="B.stories logo"
              style={{
                height: "48px",
                width: "auto",
                display: "block",
              }}
            />
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: BStoriesThemeTokens.primary,
                  lineHeight: "1.2",
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-heading)",
                }}
              >
                B.stories Analytics
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: BStoriesThemeTokens.textSecondary,
                  lineHeight: "1",
                  marginTop: "2px",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-body)",
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
            background: BStoriesThemeTokens.backgroundSecondary,
            padding: "20px",
            fontSize: "14px",
            color: BStoriesThemeTokens.textSecondary,
            borderTop: `1px solid ${BStoriesThemeTokens.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              fontFamily: "var(--font-body)",
            }}
          >
            <img
              src="/IDV_B.stories_Versão01.png"
              alt="B.stories footer"
              style={{ height: "40px", width: "auto", display: "block" }}
            />
            <div>
              <strong
                style={{
                  color: BStoriesThemeTokens.primary,
                  fontFamily: "var(--font-heading)",
                }}
              >
                B.stories
              </strong>{" "}
              Analytics ©{new Date().getFullYear()}
            </div>
          </div>
        </Footer>
      </Layout>
    </BrowserRouter>
  </ConfigProvider>
);

export default App;
