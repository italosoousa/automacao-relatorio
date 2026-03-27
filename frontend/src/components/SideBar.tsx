import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BStoriesThemeTokens } from "../theme/bstories-tokens";
import { ShopOutlined, QrcodeOutlined, BarChartOutlined, UploadOutlined, ContainerOutlined, CheckSquareOutlined } from '@ant-design/icons';

const linkStyle = (active: boolean): React.CSSProperties => ({
  display: "block",
  padding: "10px 14px",
  borderRadius: 8,
  color: active ? BStoriesThemeTokens.primary : BStoriesThemeTokens.textSecondary,
  background: active ? BStoriesThemeTokens.backgroundSecondary : "transparent",
  textDecoration: "none",
  fontFamily: "var(--font-body)",
  fontWeight: 600,
});

const navItemStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 12px',
  borderRadius: 10,
  color: active ? BStoriesThemeTokens.primary : BStoriesThemeTokens.textSecondary,
  background: active ? BStoriesThemeTokens.backgroundSecondary : 'transparent',
  textDecoration: 'none',
  width: '100%',
  boxSizing: 'border-box',
});

const SideBar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="bstories-sidebar"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: 260,
        background: BStoriesThemeTokens.backgroundElevated,
        borderRight: `1px solid ${BStoriesThemeTokens.border}`,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        boxSizing: "border-box",
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <img src="/assets/logo-pequena.png" alt="B.stories" style={{ height: 56, width: "auto", display: "block" }} />
        <div style={{ textAlign: 'center' }}>
          <div className="system-title" style={{ fontSize: 18, fontWeight: 800, color: BStoriesThemeTokens.primary, fontFamily: "var(--font-heading)", lineHeight: 1 }}>
            Bstoris Analytics
          </div>
          <div className="system-subtitle" style={{ fontSize: 12, color: BStoriesThemeTokens.textSecondary, marginTop: 4, fontFamily: 'var(--font-body)' }}>
            Sistema de Relatórios
          </div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        <Link to="/" style={navItemStyle(location.pathname === "/")}>
          <ShopOutlined style={{ fontSize: 18 }} />
          <span className="sidebar-label">Mercado Livre</span>
        </Link>

        <Link to="/rfid-dashboard" style={navItemStyle(location.pathname === "/rfid-dashboard")}>
          <QrcodeOutlined style={{ fontSize: 18 }} />
          <span className="sidebar-label">RFID</span>
        </Link>

        <Link to="/sugestao-vendas-dashboard" style={navItemStyle(location.pathname === "/sugestao-vendas-dashboard")}>
          <BarChartOutlined style={{ fontSize: 18 }} />
          <span className="sidebar-label">Sugestão de vendas</span>
        </Link>

        <Link to="/retirada-lojas" style={navItemStyle(location.pathname === "/retirada-lojas")}>
          <ContainerOutlined style={{ fontSize: 18 }} />
          <span className="sidebar-label">Retirada para Lojas</span>
        </Link>

        <Link to="/aprovacao-retiradas" style={navItemStyle(location.pathname === "/aprovacao-retiradas")}>
          <CheckSquareOutlined style={{ fontSize: 18 }} />
          <span className="sidebar-label">Aprovação de Retiradas</span>
        </Link>
      </nav>

      <div style={{ width: '80%', height: 1, background: BStoriesThemeTokens.border, opacity: 0.6, marginTop: 8 }} />

      <div style={{ marginTop: 12, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Link to="/import-products" style={{ ...navItemStyle(location.pathname === '/import-products'), maxWidth: '220px', justifyContent: 'center' }}>
          <UploadOutlined style={{ fontSize: 18 }} />
          <span className="sidebar-label">Importar Produtos</span>
        </Link>
      </div>

      <div style={{ marginTop: "auto", width: "100%", display: "flex", justifyContent: "center" }}>
        <img src="/assets/logo-grande.png" alt="B.stories footer" style={{ height: 60, width: "auto", maxWidth: "100%", display: "block" }} />
      </div>
    </aside>
  );
};

export default SideBar;
