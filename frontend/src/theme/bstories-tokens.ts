/**
 * Design Tokens da B.stories
 * Baseado no Manual de Identidade Visual oficial
 * 
 * Este arquivo define todos os tokens de design da marca B.stories,
 * incluindo paleta de cores, tipografia e espaçamentos.
 */

// ============================================================================
// PALETA DE CORES OFICIAL B.STORIES
// ============================================================================

export const BStoriesColors = {
  // Cores principais da paleta oficial
  richBlack: '#312C29',      // Preto rico, para textos principais e fundos escuros
  burgundy: '#72383E',        // Borgonha, cor primária da marca
  charcoalGray: '#646464',    // Cinza carvão, para textos secundários
  sandGold: '#A28C64',        // Dourado areia, para acentos e destaques
  warmGray: '#A8998D',        // Cinza quente, para elementos neutros
  cream: '#F1ECDE',           // Creme, para fundos suaves
  offWhite: '#F7F6F6',        // Branco off, para fundos principais
} as const;

// ============================================================================
// SISTEMA DE TOKENS SEMÂNTICOS
// ============================================================================

export const BStoriesThemeTokens = {
  // CORES PRIMÁRIAS
  primary: BStoriesColors.burgundy,           // #72383E - Cor principal da marca
  primaryDark: BStoriesColors.richBlack,      // #312C29 - Variação escura
  primaryHover: '#8a4a51',                     // Hover state (burgundy + 15% brilho)
  primaryActive: '#5e2e34',                    // Active state (burgundy - 15% brilho)
  
  // CORES SECUNDÁRIAS E ACENTOS
  accent: BStoriesColors.sandGold,             // #A28C64 - Dourado para destaques
  accentSecondary: BStoriesColors.warmGray,    // #A8998D - Cinza quente para variações
  
  // TEXTOS
  textPrimary: BStoriesColors.richBlack,       // #312C29 - Texto principal
  textSecondary: BStoriesColors.charcoalGray,  // #646464 - Texto secundário
  textMuted: BStoriesColors.warmGray,          // #A8998D - Texto desativado/placeholder
  textOnPrimary: BStoriesColors.offWhite,      // #F7F6F6 - Texto sobre cor primária
  
  // BACKGROUNDS
  backgroundPrimary: BStoriesColors.offWhite,  // #F7F6F6 - Fundo principal
  backgroundSecondary: BStoriesColors.cream,   // #F1ECDE - Fundo secundário/alternativo
  backgroundElevated: '#FFFFFF',               // Branco puro para cards elevados
  backgroundDark: BStoriesColors.richBlack,    // #312C29 - Fundo escuro
  
  // BORDAS E DIVISORES
  border: '#D4CEC2',                           // Derivado de cream com mais opacidade
  borderSubtle: '#E8E4DB',                     // Borda sutil
  divider: BStoriesColors.warmGray,            // #A8998D - Divisores
  
  // ESTADOS SEMÂNTICOS (mantém cores padrão para acessibilidade)
  success: '#52c41a',                          // Verde para sucesso
  warning: '#faad14',                          // Laranja para avisos
  error: '#ff4d4f',                            // Vermelho para erros
  info: BStoriesColors.sandGold,               // #A28C64 - Info usa o dourado da marca
  
  // OVERLAYS E SOMBRAS
  overlay: 'rgba(49, 44, 41, 0.45)',          // richBlack com 45% opacidade
  shadowLight: 'rgba(49, 44, 41, 0.08)',      // Sombra leve
  shadowMedium: 'rgba(49, 44, 41, 0.12)',     // Sombra média
  shadowStrong: 'rgba(49, 44, 41, 0.16)',     // Sombra forte
} as const;

// ============================================================================
// TIPOGRAFIA
// ============================================================================

export const BStoriesTypography = {
  // Fontes principais conforme manual
  fontFamilyHeading: '"Cralika Regular", "Georgia", "Times New Roman", serif',
  fontFamilyBody: '"Louis George", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontFamilyMono: '"Courier New", monospace',
  
  // Tamanhos de fonte
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  
  // Pesos de fonte
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Alturas de linha
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// ESPAÇAMENTO (baseado em múltiplos de 4px/8px)
// ============================================================================

export const BStoriesSpacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

// ============================================================================
// RAIOS DE BORDA
// ============================================================================

export const BStoriesBorderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

// ============================================================================
// LOGO - ÁREA DE PROTEÇÃO
// ============================================================================

/**
 * Área de proteção do logo conforme manual:
 * - Módulo X = altura da letra "L" deitada
 * - Margem mínima de 1x em todos os lados
 * 
 * Para implementação em código, usamos padding proporcional
 */
export const BStoriesLogo = {
  protectionAreaModule: '1.5rem', // Margem de proteção (1x)
  minPadding: '1.5rem',           // Padding mínimo ao redor do logo
  iconSize: {
    sm: '32px',
    md: '48px',
    lg: '64px',
    xl: '96px',
  },
} as const;

// ============================================================================
// EXPORTAÇÃO DE TIPOS
// ============================================================================

export type BStoriesColorKey = keyof typeof BStoriesColors;
export type BStoriesThemeTokenKey = keyof typeof BStoriesThemeTokens;
export type BStoriesTypographyKey = keyof typeof BStoriesTypography;
