// /frontend/src/App.tsx
import React from "react";
import { ConfigProvider, Layout } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MercadoLivreDashboardPage } from "./pages/MercadoLivreDashboardPage";
import { RfidDashboardPage } from "./pages/RfidDashboardPage";
import { SugestaoVendasDashboardPage } from "./pages/SugestaoVendasDashboardPage";
import { ProductsImportPage } from "./pages/ProductsImportPage";
import { RetiradaLojasPage } from "./pages/RetiradaLojasPage";
import { AprovacaoRetiradaPage } from "./pages/AprovacaoRetiradaPage";
import { Navigation } from "./components/Navigation";
import { bstoriesTheme } from "./theme/antd-bstories-theme";
import { BStoriesThemeTokens } from "./theme/bstories-tokens";
import "./index.css";
import SideBar from "./components/SideBar";

const App: React.FC = () => (
  <ConfigProvider theme={bstoriesTheme}>
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh", display: "flex" }}>
        <SideBar />
        <Layout className="bstories-content" style={{ padding: "24px", minHeight: "100vh", flex: 1 }}>
          <Routes>
            <Route path="/" element={<MercadoLivreDashboardPage />} />
            <Route path="/rfid-dashboard" element={<RfidDashboardPage />} />
            <Route path="/import-products" element={<ProductsImportPage />} />
            <Route
              path="/sugestao-vendas-dashboard"
              element={<SugestaoVendasDashboardPage />}
            />
            <Route path="/retirada-lojas" element={<RetiradaLojasPage />} />
            <Route path="/aprovacao-retiradas" element={<AprovacaoRetiradaPage />} />
          </Routes>
        </Layout>
      </Layout>
    </BrowserRouter>
  </ConfigProvider>
);

export default App;
