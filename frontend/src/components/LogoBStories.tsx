/**
 * Logo B.stories Component
 * 
 * Componente que exibe o logo da B.stories respeitando a área de proteção
 * conforme especificado no Manual de Identidade Visual.
 * 
 * Área de Proteção:
 * - Módulo X = altura da letra "L" deitada da marca
 * - Margem mínima de 1x em todos os lados
 * 
 * Este componente garante que nenhum outro elemento visual encoste no logo,
 * mantendo sempre o espaçamento mínimo necessário.
 */

import React from 'react';
import { BStoriesLogo, BStoriesThemeTokens } from '../theme/bstories-tokens';

interface LogoBStoriesProps {
  /**
   * Variante do logo
   * - 'full': Logo completo com texto B.stories
   * - 'icon': Apenas o símbolo/ícone "B"
   */
  variant?: 'full' | 'icon';
  
  /**
   * Tamanho do logo
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Se deve aplicar a área de proteção (padding)
   */
  withProtectionArea?: boolean;
  
  /**
   * Estilos adicionais
   */
  style?: React.CSSProperties;
  
  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Logo SVG temporário da B.stories
 * 
 * NOTA: Substitua este SVG pelo logo oficial quando disponível.
 * Este é um placeholder que representa a marca B.stories.
 */
const BStoriesLogoSVG: React.FC<{ size: string; color?: string }> = ({ size, color }) => {
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };
  
  const dimension = sizeMap[size as keyof typeof sizeMap] || sizeMap.md;
  const fillColor = color || BStoriesThemeTokens.primary;
  
  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Circle background */}
      <circle cx="50" cy="50" r="48" fill={fillColor} />
      
      {/* Letter "B" */}
      <path
        d="M30 25 H45 C52 25 57 29 57 36 C57 40 55 43 52 44.5 C56 46 59 49.5 59 55 C59 62 54 67 46 67 H30 Z M38 32 V42 H45 C48 42 50 40 50 37 C50 34 48 32 45 32 Z M38 49 V60 H46 C49.5 60 52 58 52 54.5 C52 51 49.5 49 46 49 Z"
        fill={BStoriesThemeTokens.backgroundElevated}
        strokeWidth="0"
      />
      
      {/* Decorative dot (represents stories/narrative) */}
      <circle 
        cx="70" 
        cy="30" 
        r="6" 
        fill={BStoriesThemeTokens.accent}
      />
    </svg>
  );
};

/**
 * Logo completo com texto "B.stories"
 */
const BStoriesFullLogoSVG: React.FC<{ size: string }> = ({ size }) => {
  const sizeMap = {
    sm: { width: 120, height: 32 },
    md: { width: 160, height: 48 },
    lg: { width: 200, height: 64 },
    xl: { width: 280, height: 96 },
  };
  
  const dimensions = sizeMap[size as keyof typeof sizeMap] || sizeMap.md;
  
  return (
    <svg
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Icon part (circle with B) */}
      <circle cx="25" cy="25" r="23" fill={BStoriesThemeTokens.primary} />
      <path
        d="M15 12.5 H22.5 C26 12.5 28.5 14.5 28.5 18 C28.5 20 27.5 21.5 26 22.25 C28 23 29.5 24.75 29.5 27.5 C29.5 31 27 33.5 23 33.5 H15 Z M19 16 V21 H22.5 C24 21 25 20 25 18.5 C25 17 24 16 22.5 16 Z M19 24.5 V30 H23 C24.75 30 26 29 26 27.25 C26 25.5 24.75 24.5 23 24.5 Z"
        fill={BStoriesThemeTokens.backgroundElevated}
      />
      <circle cx="35" cy="15" r="3" fill={BStoriesThemeTokens.accent} />
      
      {/* Text "B.stories" */}
      <text
        x="60"
        y="32"
        fill={BStoriesThemeTokens.primary}
        fontSize="24"
        fontWeight="600"
        fontFamily="'Playfair Display', 'Cralika Regular', serif"
        letterSpacing="-0.5"
      >
        B.stories
      </text>
    </svg>
  );
};

/**
 * Componente Principal do Logo
 */
export const LogoBStories: React.FC<LogoBStoriesProps> = ({
  variant = 'full',
  size = 'md',
  withProtectionArea = true,
  style,
  className,
}) => {
  const protectionPadding = withProtectionArea ? BStoriesLogo.minPadding : '0';
  
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: protectionPadding,
    ...style,
  };
  
  return (
    <div className={className} style={containerStyle}>
      {variant === 'full' ? (
        <BStoriesFullLogoSVG size={size} />
      ) : (
        <BStoriesLogoSVG size={size} />
      )}
    </div>
  );
};

/**
 * Variante compacta para uso em favicons, avatares, etc.
 */
export const LogoBStoriesIcon: React.FC<Omit<LogoBStoriesProps, 'variant'>> = (props) => {
  return <LogoBStories {...props} variant="icon" withProtectionArea={false} />;
};

/**
 * Export default
 */
export default LogoBStories;
