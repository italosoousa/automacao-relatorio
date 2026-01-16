/**
 * Configuração de Tema do Ant Design para B.stories
 * 
 * Este arquivo adapta os tokens da B.stories para o sistema de temas do Ant Design,
 * garantindo que todos os componentes da biblioteca sigam a identidade visual da marca.
 */

import type { ThemeConfig } from 'antd';
import { BStoriesThemeTokens, BStoriesTypography } from './bstories-tokens';

/**
 * Tema B.stories para Ant Design
 * 
 * Configuração Light Theme baseada na paleta de cores do manual de identidade visual.
 */
export const bstoriesTheme: ThemeConfig = {
  token: {
    // ========================================================================
    // CORES PRIMÁRIAS
    // ========================================================================
    colorPrimary: BStoriesThemeTokens.primary,              // #72383E - Burgundy
    colorSuccess: BStoriesThemeTokens.success,              // #52c41a - Verde
    colorWarning: BStoriesThemeTokens.warning,              // #faad14 - Laranja
    colorError: BStoriesThemeTokens.error,                  // #ff4d4f - Vermelho
    colorInfo: BStoriesThemeTokens.info,                    // #A28C64 - Dourado

    // ========================================================================
    // TIPOGRAFIA
    // ========================================================================
    fontFamily: BStoriesTypography.fontFamilyBody,          // Louis George
    fontSize: 14,                                            // Tamanho base
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    // ========================================================================
    // BACKGROUNDS E SUPERFÍCIES
    // ========================================================================
    colorBgBase: BStoriesThemeTokens.backgroundPrimary,     // #F7F6F6 - Off-white
    colorBgContainer: BStoriesThemeTokens.backgroundElevated, // #FFFFFF - Cards
    colorBgElevated: BStoriesThemeTokens.backgroundElevated,  // #FFFFFF
    colorBgLayout: BStoriesThemeTokens.backgroundSecondary,   // #F1ECDE - Cream
    colorBgSpotlight: BStoriesThemeTokens.backgroundSecondary, // #F1ECDE

    // ========================================================================
    // TEXTOS
    // ========================================================================
    colorText: BStoriesThemeTokens.textPrimary,             // #312C29 - Rich black
    colorTextSecondary: BStoriesThemeTokens.textSecondary,  // #646464 - Charcoal gray
    colorTextTertiary: BStoriesThemeTokens.textMuted,       // #A8998D - Warm gray
    colorTextQuaternary: BStoriesThemeTokens.textMuted,     // #A8998D

    // ========================================================================
    // BORDAS E DIVISORES
    // ========================================================================
    colorBorder: BStoriesThemeTokens.border,                // #D4CEC2
    colorBorderSecondary: BStoriesThemeTokens.borderSubtle, // #E8E4DB
    colorSplit: BStoriesThemeTokens.borderSubtle,           // #E8E4DB

    // ========================================================================
    // RAIOS DE BORDA
    // ========================================================================
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    borderRadiusXS: 2,

    // ========================================================================
    // SOMBRAS
    // ========================================================================
    boxShadow: `0 1px 2px 0 ${BStoriesThemeTokens.shadowLight}, 
                0 1px 6px -1px ${BStoriesThemeTokens.shadowMedium}, 
                0 2px 4px 0 ${BStoriesThemeTokens.shadowLight}`,
    boxShadowSecondary: `0 1px 4px 0 ${BStoriesThemeTokens.shadowLight}`,

    // ========================================================================
    // LINKS
    // ========================================================================
    colorLink: BStoriesThemeTokens.primary,                 // #72383E
    colorLinkHover: BStoriesThemeTokens.primaryHover,       // #8a4a51
    colorLinkActive: BStoriesThemeTokens.primaryActive,     // #5e2e34

    // ========================================================================
    // CONTROLE DE ALTURA
    // ========================================================================
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,

    // ========================================================================
    // HIGHLIGHT E FOCUS
    // ========================================================================
    colorHighlight: BStoriesThemeTokens.accent,             // #A28C64 - Sand gold
  },

  // ==========================================================================
  // CONFIGURAÇÕES DE COMPONENTES ESPECÍFICOS
  // ==========================================================================
  components: {
    // ------------------------------------------------------------------------
    // TYPOGRAPHY - Usa Cralika para headings
    // ------------------------------------------------------------------------
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0,
      fontFamilyCode: BStoriesTypography.fontFamilyMono,
    },

    // ------------------------------------------------------------------------
    // BUTTON
    // ------------------------------------------------------------------------
    Button: {
      fontWeight: 500,
      primaryShadow: 'none',
      dangerShadow: 'none',
      defaultShadow: 'none',
      // Ajusta hover/active states
      colorPrimaryHover: BStoriesThemeTokens.primaryHover,
      colorPrimaryActive: BStoriesThemeTokens.primaryActive,
    },

    // ------------------------------------------------------------------------
    // CARD
    // ------------------------------------------------------------------------
    Card: {
      headerBg: 'transparent',
      headerFontSize: 16,
      headerFontSizeSM: 14,
      colorBorderSecondary: BStoriesThemeTokens.borderSubtle,
    },

    // ------------------------------------------------------------------------
    // TABLE
    // ------------------------------------------------------------------------
    Table: {
      headerBg: BStoriesThemeTokens.backgroundSecondary,    // #F1ECDE - Cream
      headerColor: BStoriesThemeTokens.textPrimary,         // #312C29
      rowHoverBg: BStoriesThemeTokens.backgroundSecondary,  // #F1ECDE
      borderColor: BStoriesThemeTokens.border,              // #D4CEC2
    },

    // ------------------------------------------------------------------------
    // MENU
    // ------------------------------------------------------------------------
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: BStoriesThemeTokens.backgroundSecondary,  // #F1ECDE
      itemSelectedColor: BStoriesThemeTokens.primary,           // #72383E
      itemHoverBg: BStoriesThemeTokens.backgroundSecondary,     // #F1ECDE
      itemHoverColor: BStoriesThemeTokens.primary,              // #72383E
      itemActiveBg: BStoriesThemeTokens.backgroundSecondary,    // #F1ECDE
      horizontalItemSelectedColor: BStoriesThemeTokens.primary, // #72383E
      horizontalItemHoverColor: BStoriesThemeTokens.primary,    // #72383E
    },

    // ------------------------------------------------------------------------
    // TAG
    // ------------------------------------------------------------------------
    Tag: {
      defaultBg: BStoriesThemeTokens.backgroundSecondary,   // #F1ECDE
      defaultColor: BStoriesThemeTokens.textPrimary,        // #312C29
    },

    // ------------------------------------------------------------------------
    // INPUT
    // ------------------------------------------------------------------------
    Input: {
      hoverBorderColor: BStoriesThemeTokens.primary,        // #72383E
      activeBorderColor: BStoriesThemeTokens.primary,       // #72383E
      activeShadow: `0 0 0 2px ${BStoriesThemeTokens.primary}20`, // 20 = 12.5% opacity
    },

    // ------------------------------------------------------------------------
    // SELECT
    // ------------------------------------------------------------------------
    Select: {
      optionSelectedBg: BStoriesThemeTokens.backgroundSecondary,  // #F1ECDE
      optionSelectedColor: BStoriesThemeTokens.primary,           // #72383E
      optionActiveBg: BStoriesThemeTokens.backgroundSecondary,    // #F1ECDE
    },

    // ------------------------------------------------------------------------
    // MODAL
    // ------------------------------------------------------------------------
    Modal: {
      headerBg: BStoriesThemeTokens.backgroundElevated,     // #FFFFFF
      contentBg: BStoriesThemeTokens.backgroundElevated,    // #FFFFFF
      footerBg: BStoriesThemeTokens.backgroundElevated,     // #FFFFFF
    },

    // ------------------------------------------------------------------------
    // DRAWER
    // ------------------------------------------------------------------------
    Drawer: {
      colorBgElevated: BStoriesThemeTokens.backgroundElevated,  // #FFFFFF
    },

    // ------------------------------------------------------------------------
    // STATISTIC (para os cards de KPI)
    // ------------------------------------------------------------------------
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 24,
    },

    // ------------------------------------------------------------------------
    // DIVIDER
    // ------------------------------------------------------------------------
    Divider: {
      colorSplit: BStoriesThemeTokens.border,               // #D4CEC2
    },

    // ------------------------------------------------------------------------
    // TOOLTIP
    // ------------------------------------------------------------------------
    Tooltip: {
      colorBgSpotlight: BStoriesThemeTokens.primaryDark,    // #312C29
      colorTextLightSolid: BStoriesThemeTokens.backgroundPrimary, // #F7F6F6
    },

    // ------------------------------------------------------------------------
    // PAGINATION
    // ------------------------------------------------------------------------
    Pagination: {
      itemActiveBg: BStoriesThemeTokens.primary,            // #72383E
      itemActiveBgDisabled: BStoriesThemeTokens.borderSubtle, // #E8E4DB
      itemLinkBg: BStoriesThemeTokens.backgroundElevated,   // #FFFFFF
    },

    // ------------------------------------------------------------------------
    // LAYOUT
    // ------------------------------------------------------------------------
    Layout: {
      headerBg: BStoriesThemeTokens.backgroundElevated,     // #FFFFFF
      bodyBg: BStoriesThemeTokens.backgroundPrimary,        // #F7F6F6
      footerBg: BStoriesThemeTokens.backgroundSecondary,    // #F1ECDE
      siderBg: BStoriesThemeTokens.backgroundElevated,      // #FFFFFF
    },
  },
};

/**
 * Exportação do tema como default para facilitar importação
 */
export default bstoriesTheme;
