import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BStoriesThemeTokens } from "../theme/bstories-tokens";

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

const SideBar: React.FC = () => {
  const location = useLocation();

  return (
    <aside
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <img src="/assets/logo-pequena.png" alt="B.stories" style={{ height: 48, width: "auto", display: "block" }} />
        <div style={{ fontSize: 16, fontWeight: 700, color: BStoriesThemeTokens.primary, fontFamily: "var(--font-heading)" }}>
          B.stories
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        <Link to="/" style={linkStyle(location.pathname === "/")}>Mercado Livre</Link>
        <Link to="/rfid-dashboard" style={linkStyle(location.pathname === "/rfid-dashboard")}>RFID</Link>
        <Link to="/sugestao-vendas-dashboard" style={linkStyle(location.pathname === "/sugestao-vendas-dashboard")}>Sugestão de vendas</Link>
      </nav>

      <div style={{ marginTop: "auto", width: "100%", display: "flex", justifyContent: "center" }}>
        <img src="/assets/logo-grande.png" alt="B.stories footer" style={{ height: 60, width: "auto", maxWidth: "100%", display: "block" }} />
      </div>
    </aside>
  );
};

export default SideBar;
