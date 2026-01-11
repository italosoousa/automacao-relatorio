# Guia de Deploy - Sistema de Análise de Planilhas

Este guia explica como fazer o deploy do sistema completo (backend + frontend) para produção.

> **🚀 Para deploy específico Railway + Vercel, veja [DEPLOY_RAILWAY_VERCEL.md](./DEPLOY_RAILWAY_VERCEL.md)**

## 📋 Pré-requisitos

- Conta no [Render](https://render.com) ou [Railway](https://railway.app) (para backend)
- Conta no [Vercel](https://vercel.com) ou [Netlify](https://netlify.com) (para frontend)
- Repositório Git (GitHub, GitLab ou Bitbucket)

## 🚀 Opção 1: Render (Backend) + Vercel (Frontend) - RECOMENDADO

### Backend no Render

1. **Acesse [Render](https://render.com)** e faça login
2. **Crie um novo Web Service**
   - Conecte seu repositório Git
   - Selecione o diretório `backend`
   - Configure:
     - **Name**: `automacao-relatorio-api`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Configure as variáveis de ambiente**:
   - `ALLOWED_ORIGINS`: `https://seu-frontend.vercel.app` (você adicionará isso depois do deploy do frontend)
   - `PYTHON_VERSION`: `3.12.0`
4. **Deploy**: Render fará o deploy automaticamente
5. **Anote a URL**: Será algo como `https://automacao-relatorio-api.onrender.com`

### Frontend no Vercel

1. **Acesse [Vercel](https://vercel.com)** e faça login
2. **Importe seu projeto**
   - Conecte seu repositório Git
   - Selecione o diretório `frontend`
   - Framework Preset: **Vite**
3. **Configure as variáveis de ambiente**:
   - `VITE_API_BASE_URL`: `https://automacao-relatorio-api.onrender.com` (URL do seu backend)
4. **Deploy**: Vercel fará o deploy automaticamente
5. **Anote a URL**: Será algo como `https://seu-projeto.vercel.app`

### Atualizar CORS do Backend

Após o deploy do frontend, volte ao Render e atualize a variável de ambiente:
- `ALLOWED_ORIGINS`: `https://seu-projeto.vercel.app`

O backend será reiniciado automaticamente com a nova configuração.

---

## 🚀 Opção 2: Railway (Backend) + Netlify (Frontend)

### Backend no Railway

1. **Acesse [Railway](https://railway.app)** e faça login
2. **Crie um novo projeto** → **Deploy from GitHub repo**
3. **Selecione o diretório `backend`**
4. **Configure as variáveis de ambiente**:
   - `ALLOWED_ORIGINS`: `https://seu-frontend.netlify.app` (adicionar depois)
   - `PORT`: Railway define automaticamente
5. **Railway detectará automaticamente** o `Procfile` e fará o deploy
6. **Anote a URL**: Será algo como `https://seu-projeto.up.railway.app`

### Frontend no Netlify

1. **Acesse [Netlify](https://netlify.com)** e faça login
2. **Add new site** → **Import an existing project**
3. **Conecte seu repositório Git**
4. **Configure**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. **Configure as variáveis de ambiente**:
   - `VITE_API_BASE_URL`: `https://seu-projeto.up.railway.app`
6. **Deploy**: Netlify fará o deploy automaticamente
7. **Anote a URL**: Será algo como `https://seu-projeto.netlify.app`

### Atualizar CORS do Backend

Após o deploy do frontend, volte ao Railway e atualize:
- `ALLOWED_ORIGINS`: `https://seu-projeto.netlify.app`

---

## 🔧 Configuração Manual (Alternativa)

Se preferir fazer deploy manual ou usar outras plataformas:

### Backend

1. Certifique-se de que o arquivo `Procfile` existe na raiz do `backend/`
2. Configure a variável de ambiente `ALLOWED_ORIGINS` com a URL do frontend
3. Configure a variável `PORT` (geralmente definida automaticamente)

### Frontend

1. Configure a variável de ambiente `VITE_API_BASE_URL` com a URL do backend
2. Execute `npm run build` para gerar os arquivos estáticos
3. Faça upload da pasta `dist/` para seu servidor

---

## ✅ Checklist Pós-Deploy

- [ ] Backend está respondendo (acesse `/docs` para ver a documentação Swagger)
- [ ] Frontend está acessível
- [ ] CORS está configurado corretamente (sem erros no console do navegador)
- [ ] Upload de arquivos está funcionando
- [ ] Teste completo do fluxo: upload → processamento → visualização

---

## 🐛 Troubleshooting

### Erro de CORS no navegador
- Verifique se `ALLOWED_ORIGINS` no backend inclui a URL exata do frontend (com `https://`)
- Certifique-se de que não há espaços extras na variável

### Frontend não consegue conectar ao backend
- Verifique se `VITE_API_BASE_URL` está configurada corretamente
- Certifique-se de que a URL do backend está acessível (teste no navegador)

### Timeout ao processar planilhas grandes
- Algumas plataformas têm timeout padrão de 30s
- Considere aumentar o timeout ou usar planilhas menores
- Render e Railway permitem aumentar o timeout nas configurações

### Erro 502 Bad Gateway
- Verifique os logs do backend na plataforma de deploy
- Certifique-se de que todas as dependências estão no `requirements.txt`
- Verifique se o comando de start está correto

---

## 📝 Notas Importantes

1. **Custos**: 
   - Render: Plano gratuito disponível (pode hibernar após inatividade)
   - Railway: Plano gratuito com limites
   - Vercel: Plano gratuito generoso
   - Netlify: Plano gratuito disponível

2. **Performance**: 
   - O primeiro request após inatividade pode ser mais lento (cold start)
   - Considere usar planos pagos para melhor performance

3. **Segurança**:
   - As URLs das APIs estão expostas no frontend (isso é normal para SPAs)
   - Considere adicionar rate limiting no backend para produção

---

## 🎉 Pronto!

Após seguir este guia, seu sistema estará disponível na web e seu cliente poderá acessá-lo através da URL do frontend.
