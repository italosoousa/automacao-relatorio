# Configuração PWA - Instruções

## ✅ O que já está configurado:

1. **Plugin PWA instalado** (`vite-plugin-pwa`)
2. **Manifest.json configurado** (via vite.config.ts)
3. **Service Worker configurado** (gerado automaticamente)
4. **Meta tags PWA** adicionadas no index.html
5. **Responsividade** melhorada para mobile

## 📱 Como testar o PWA:

### 1. Build da aplicação:
```bash
npm run build
```

### 2. Servir a aplicação (para testar PWA):
```bash
npm run preview
```

### 3. Testar no navegador:
- Abra o DevTools (F12)
- Vá em "Application" > "Service Workers"
- Verifique se o service worker está registrado
- Vá em "Application" > "Manifest" para ver o manifest

### 4. Instalar no dispositivo:
- **Chrome/Edge (Desktop)**: Clique no ícone de instalação na barra de endereços
- **Chrome (Android)**: Menu > "Adicionar à tela inicial"
- **Safari (iOS)**: Compartilhar > "Adicionar à Tela de Início"

## 🎨 Criar ícones PWA:

Você precisa criar os seguintes ícones na pasta `public/`:

1. **pwa-192x192.png** (192x192 pixels)
2. **pwa-512x512.png** (512x512 pixels)
3. **apple-touch-icon.png** (180x180 pixels) - opcional mas recomendado

### Ferramentas recomendadas:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/

### Especificações dos ícones:
- **Formato**: PNG
- **Fundo**: #1677ff (azul) ou transparente
- **Ícone**: Emoji 📊 ou logo da aplicação em branco
- **Tamanho mínimo**: 192x192 para Android, 180x180 para iOS

## 🔧 Configurações atuais:

- **Nome**: Dashboard de Análise de Lucro
- **Nome curto**: Dashboard ML
- **Tema**: #1677ff (azul)
- **Background**: #141414 (escuro)
- **Display**: standalone (abre como app)
- **Orientação**: portrait (pode ser alterado para "any")

## 📝 Notas:

- O PWA funciona mesmo sem os ícones (usará ícone padrão)
- O service worker é gerado automaticamente no build
- A aplicação funciona offline após o primeiro carregamento
- Cache de API configurado para 24 horas

## 🚀 Deploy:

Após fazer o deploy, o PWA estará disponível automaticamente. Os usuários poderão "instalar" a aplicação no dispositivo.
