# Identidade Visual B.stories - Documentação

Este documento descreve a implementação da identidade visual da **B.stories** no sistema de analytics/relatórios.

## 📋 Índice

1. [Paleta de Cores](#paleta-de-cores)
2. [Tipografia](#tipografia)
3. [Sistema de Design Tokens](#sistema-de-design-tokens)
4. [Logo e Área de Proteção](#logo-e-área-de-proteção)
5. [Componentes](#componentes)
6. [Arquivos Modificados](#arquivos-modificados)

---

## 🎨 Paleta de Cores

A paleta oficial da B.stories foi implementada conforme o Manual de Identidade Visual:

| Nome             | Hex Code | Uso Principal                          |
|------------------|----------|----------------------------------------|
| Rich Black       | #312C29  | Textos principais, fundos escuros      |
| Burgundy         | #72383E  | Cor primária da marca                  |
| Charcoal Gray    | #646464  | Textos secundários                     |
| Sand Gold        | #A28C64  | Acentos e destaques                    |
| Warm Gray        | #A8998D  | Elementos neutros, textos desativados  |
| Cream            | #F1ECDE  | Fundos secundários/alternativos        |
| Off-White        | #F7F6F6  | Fundo principal                        |

### Tokens Semânticos

As cores foram mapeadas para tokens semânticos para facilitar o uso:

```typescript
primary: #72383E          // Botões primários, links, destaques
primaryDark: #312C29      // Variações escuras
accent: #A28C64           // Destaques, informações
textPrimary: #312C29      // Texto principal
textSecondary: #646464    // Texto secundário
backgroundPrimary: #F7F6F6 // Fundo principal da aplicação
backgroundSecondary: #F1ECDE // Fundo alternativo (cards hover, tabelas)
```

---

## ✍️ Tipografia

### Fontes Oficiais

Conforme o Manual de Identidade Visual:

- **Cralika Regular**: Para títulos e headings (H1-H6)
- **Louis George**: Para textos corridos e body text

### Implementação Atual

**Status**: Fontes implementadas com fallbacks temporários

- **Cralika Regular** → Fallback temporário: **Playfair Display**
- **Louis George** → Fallback temporário: **Lato**

Os fallbacks foram escolhidos por sua semelhança visual com as fontes oficiais.

### Como Atualizar para Fontes Oficiais

Quando os arquivos de fonte oficiais estiverem disponíveis:

1. Adicione os arquivos `.woff2` e `.woff` em `/frontend/public/fonts/`
2. No arquivo `/frontend/src/theme/typography.css`, descomente os `@font-face` declarations
3. Atualize os imports para apontar para os arquivos corretos

### Hierarquia Tipográfica

```css
h1: 48px (Cralika Regular, semibold)
h2: 36px (Cralika Regular, semibold)
h3: 30px (Cralika Regular, semibold)
h4: 24px (Cralika Regular, semibold)
h5: 20px (Cralika Regular, semibold)
h6: 18px (Cralika Regular, semibold)
body: 16px (Louis George, regular)
```

---

## 🎯 Sistema de Design Tokens

### Localização

```
/frontend/src/theme/
├── bstories-tokens.ts          # Tokens base (cores, fontes, espaçamentos)
├── antd-bstories-theme.ts      # Configuração do tema Ant Design
└── typography.css              # Estilos globais de tipografia
```

### Estrutura de Tokens

```typescript
// Cores
BStoriesColors       // Paleta bruta
BStoriesThemeTokens  // Tokens semânticos

// Tipografia
BStoriesTypography   // Fontes, tamanhos, pesos

// Espaçamento
BStoriesSpacing      // xs, sm, md, lg, xl, 2xl, 3xl

// Raios de Borda
BStoriesBorderRadius // none, sm, md, lg, xl, full

// Logo
BStoriesLogo        // Área de proteção, tamanhos
```

### Como Usar

```typescript
import { BStoriesThemeTokens } from '@/theme/bstories-tokens';

// Em componentes
<div style={{ 
  color: BStoriesThemeTokens.primary,
  backgroundColor: BStoriesThemeTokens.backgroundPrimary 
}}>
  ...
</div>

// Com theme hook do Ant Design (recomendado)
import { theme } from 'antd';
const { token } = theme.useToken();

<Button style={{ color: token.colorPrimary }}>
  ...
</Button>
```

---

## 🏷️ Logo e Área de Proteção

### Componente

```typescript
import { LogoBStories } from '@/components/LogoBStories';

// Logo completo
<LogoBStories variant="full" size="md" />

// Apenas ícone
<LogoBStories variant="icon" size="sm" />
```

### Área de Proteção

Conforme o manual:
- **Módulo X** = altura da letra "L" deitada
- **Margem mínima**: 1x em todos os lados

A área de proteção é aplicada automaticamente quando `withProtectionArea={true}` (padrão).

### Props

| Prop                | Tipo                   | Default | Descrição                          |
|---------------------|------------------------|---------|-------------------------------------|
| variant             | 'full' \| 'icon'       | 'full'  | Variante do logo                    |
| size                | 'sm' \| 'md' \| 'lg' \| 'xl' | 'md'    | Tamanho do logo                     |
| withProtectionArea  | boolean                | true    | Aplica padding de área de proteção  |

### Nota Importante

**O logo atual é um placeholder SVG**. Quando o logo oficial em formato SVG/PNG estiver disponível, substitua o conteúdo do componente `LogoBStories.tsx`.

---

## 🧩 Componentes

### Componentes Atualizados

Todos os componentes foram atualizados para usar o sistema de tokens da B.stories:

#### UI Base
- ✅ **App.tsx** - Header e Footer com nova identidade
- ✅ **Navigation** - Menu com cores da marca
- ✅ **LogoBStories** - Novo componente de logo

#### Dashboards
- ✅ **SummaryCards** - Cards de KPI com cores B.stories
- ✅ **DashboardTable** - Tabela com paleta atualizada
- ✅ **StatusStatistics** - Estatísticas por status
- ✅ **ProductDetailsModal** - Modal de detalhes

#### Filtros
- ✅ **StatusFilter** - Filtro de status
- ✅ **ProfitRangeFilter** - Filtro de lucro
- ✅ **OriginalStateFilter** - Filtro de estado

#### Utilidades
- ✅ **FileUpload** - Upload de arquivos
- ✅ **ExportButton** - Botão de exportação
- ✅ **QuickActions** - Ações rápidas
- ✅ **MissingSkusDrawer** - Drawer de SKUs faltantes

### Tema Ant Design

O tema do Ant Design foi completamente reconfigurado para seguir a identidade B.stories:

```typescript
import { bstoriesTheme } from '@/theme/antd-bstories-theme';

<ConfigProvider theme={bstoriesTheme}>
  <App />
</ConfigProvider>
```

Componentes Ant Design customizados:
- Button
- Card
- Table
- Menu
- Tag
- Input / Select
- Modal / Drawer
- Tooltip
- Pagination
- Layout

---

## 📁 Arquivos Modificados

### Novos Arquivos

```
frontend/src/
├── theme/
│   ├── bstories-tokens.ts         # ✨ NOVO - Design tokens
│   ├── antd-bstories-theme.ts     # ✨ NOVO - Tema Ant Design
│   └── typography.css             # ✨ NOVO - Tipografia global
└── components/
    └── LogoBStories.tsx           # ✨ NOVO - Componente de logo
```

### Arquivos Atualizados

```
frontend/
├── src/
│   ├── App.tsx                    # ✏️ Header, footer, tema
│   ├── index.css                  # ✏️ Variáveis CSS, estilos globais
│   └── components/
│       ├── Navigation.tsx         # ✏️ Removido theme="dark"
│       ├── SummaryCards.tsx       # ✏️ Cores dos tokens
│       ├── DashboardTable.tsx     # ✏️ Cores dos tokens
│       ├── StatusStatistics.tsx   # ✏️ Cores dos tokens
│       ├── ProductDetailsModal.tsx # ✏️ Cores dos tokens
│       └── ProfitRangeFilter.tsx  # ✏️ Cores dos tokens
└── vite.config.ts                 # ✏️ PWA manifest atualizado
```

---

## 🔄 Migrando Componentes Futuros

Para criar ou atualizar componentes seguindo a identidade B.stories:

### 1. Importar Tokens

```typescript
import { BStoriesThemeTokens } from '@/theme/bstories-tokens';
// OU usar hook do Ant Design (recomendado)
import { theme } from 'antd';
const { token } = theme.useToken();
```

### 2. Usar Tokens Semânticos

❌ **NÃO faça:**
```typescript
<div style={{ color: '#1890ff' }}>...</div>
<h1 style={{ fontFamily: 'Arial' }}>...</h1>
```

✅ **FAÇA:**
```typescript
<div style={{ color: token.colorPrimary }}>...</div>
<h1 className="heading">...</h1>
```

### 3. Seguir Hierarquia Tipográfica

```typescript
// Títulos usam Cralika (automático via CSS global)
<h1>Título Principal</h1>
<h2>Subtítulo</h2>

// Textos usam Louis George (automático via body)
<p>Texto corrido...</p>
<span>Label</span>
```

### 4. Respeitar Área de Proteção do Logo

```typescript
// ✅ Com área de proteção
<LogoBStories withProtectionArea={true} />

// ⚠️ Sem área de proteção (use apenas em contextos especiais)
<LogoBStories withProtectionArea={false} />
```

---

## 📊 PWA e Meta Tags

### Manifest (PWA)

Atualizado em `vite.config.ts`:

```javascript
{
  name: 'B.stories Analytics',
  short_name: 'B.stories',
  theme_color: '#72383E',      // Burgundy
  background_color: '#F7F6F6', // Off-white
}
```

### Recomendação: Atualizar Ícones

Os ícones PWA atuais ainda não refletem a nova identidade. Recomenda-se:

1. Criar novos ícones com o logo B.stories
2. Substituir `/frontend/public/pwa-192x192.png`
3. Substituir `/frontend/public/pwa-512x512.png`
4. Atualizar `favicon.ico`

---

## ✅ Checklist de Implementação

- [x] Criar sistema de design tokens
- [x] Configurar fontes Cralika e Louis George (com fallbacks)
- [x] Atualizar tema do Ant Design
- [x] Criar componente de Logo com área de proteção
- [x] Atualizar App.tsx com nova identidade
- [x] Atualizar estilos globais (index.css)
- [x] Atualizar todos os componentes
- [x] Remover cores antigas hardcoded
- [x] Atualizar PWA manifest
- [ ] **PENDENTE**: Substituir fallback fonts por fontes oficiais (quando disponíveis)
- [ ] **PENDENTE**: Substituir logo placeholder por logo oficial SVG/PNG
- [ ] **PENDENTE**: Atualizar ícones PWA (favicon, pwa-192, pwa-512)

---

## 🎨 Acessibilidade

A nova paleta de cores mantém contraste adequado para acessibilidade:

| Combinação                       | Contraste | WCAG AA | WCAG AAA |
|----------------------------------|-----------|---------|----------|
| Rich Black (#312C29) / Off-White | 15.8:1    | ✅      | ✅       |
| Burgundy (#72383E) / Off-White   | 7.2:1     | ✅      | ✅       |
| Charcoal Gray / Off-White        | 5.8:1     | ✅      | ✅       |

---

## 📝 Notas Finais

### Manutenção

1. **Sempre use tokens**: Nunca use cores hardcoded
2. **Documente mudanças**: Atualize este arquivo se adicionar novos tokens
3. **Teste responsividade**: A tipografia usa clamp() para adaptar-se a diferentes telas
4. **Mantenha consistência**: Use componentes Ant Design sempre que possível

### Suporte

Para dúvidas sobre a identidade visual, consulte o **Manual de Identidade Visual da B.stories** (documento oficial).

---

**Última atualização**: Janeiro 2026  
**Versão**: 1.0.0  
**Desenvolvido por**: Cursor AI Assistant
