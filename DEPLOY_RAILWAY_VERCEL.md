# 🚀 Guia de Deploy - Railway (Backend) + Vercel (Frontend)

Este guia específico explica como fazer deploy do sistema usando **Railway** para o backend e **Vercel** para o frontend.

## 📋 Pré-requisitos

- Conta no [Railway](https://railway.app) (conta GitHub funciona)
- Conta no [Vercel](https://vercel.com) (conta GitHub funciona)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Código commitado e pushado no repositório

---

## 🔧 Parte 1: Deploy do Backend no Railway

### Passo 1: Criar projeto no Railway

1. Acesse https://railway.app e faça login com GitHub
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha seu repositório
5. Railway detectará automaticamente que é um projeto Python

### Passo 2: Configurar o serviço

1. Railway criará um serviço automaticamente
2. Clique no serviço para abrir as configurações
3. Vá em **"Settings"** > **"Source"**
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt` (Railway detecta automaticamente)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (Railway detecta automaticamente)

### Passo 3: Configurar variáveis de ambiente

1. Vá em **"Variables"** no painel do serviço
2. Adicione a variável:
   - **Key**: `ALLOWED_ORIGINS`
   - **Value**: `https://seu-frontend.vercel.app` (você atualizará depois com a URL real do Vercel)
3. **IMPORTANTE**: Por enquanto, deixe apenas a URL do Vercel (você adicionará depois)

### Passo 4: Obter a URL do backend

1. Após o deploy, Railway gerará uma URL automaticamente
2. Vá em **"Settings"** > **"Networking"**
3. Anote a URL (algo como `https://seu-projeto.up.railway.app`)
4. **OU** crie um domínio customizado se preferir

### Passo 5: Verificar o deploy

1. Acesse `https://sua-url-railway.app/docs` para ver a documentação Swagger
2. Se aparecer a documentação, o backend está funcionando! ✅

---

## 🎨 Parte 2: Deploy do Frontend no Vercel

### Passo 1: Importar projeto no Vercel

1. Acesse https://vercel.com e faça login
2. Clique em **"Add New..."** > **"Project"**
3. Conecte seu repositório GitHub
4. Selecione o repositório

### Passo 2: Configurar o projeto

1. Configure as seguintes opções:
   - **Framework Preset**: `Vite` (deve detectar automaticamente)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `dist` (padrão do Vite)
   - **Install Command**: `npm install` (padrão)

### Passo 3: Configurar variáveis de ambiente

1. Antes de fazer deploy, vá em **"Environment Variables"**
2. Adicione:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://sua-url-railway.app` (URL do seu backend no Railway)
   - **Environments**: Marque todas (Production, Preview, Development)

### Passo 4: Fazer deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar
3. Vercel fornecerá uma URL (algo como `https://seu-projeto.vercel.app`)
4. **Anote esta URL!**

### Passo 5: Atualizar CORS no Railway

1. Volte ao Railway
2. Vá em **"Variables"** do seu serviço backend
3. Atualize `ALLOWED_ORIGINS`:
   - **Value**: `https://seu-projeto.vercel.app` (URL do seu frontend no Vercel)
4. O Railway reiniciará automaticamente o serviço

---

## ✅ Verificação Final

### Testar o sistema completo:

1. **Acesse o frontend**: `https://seu-projeto.vercel.app`
2. **Faça upload das planilhas**
3. **Verifique se o dashboard carrega**
4. **Teste os filtros e funcionalidades**

### Se houver erros de CORS:

- Verifique se `ALLOWED_ORIGINS` no Railway contém a URL exata do Vercel (com `https://`)
- Certifique-se de que não há espaços extras na variável
- Reinicie o serviço no Railway se necessário

### Se o frontend não conseguir conectar ao backend:

- Verifique se `VITE_API_BASE_URL` no Vercel está correta
- Certifique-se de que a URL do Railway está acessível (teste no navegador)
- Verifique os logs no Railway para erros

---

## 🔍 Troubleshooting

### Backend não inicia no Railway

- Verifique os logs em **"Deployments"** > **"View Logs"**
- Certifique-se de que `requirements.txt` está correto
- Verifique se o `Procfile` está na raiz do diretório `backend`

### Frontend não faz build no Vercel

- Verifique os logs de build no Vercel
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se o `vite.config.ts` está correto

### Erro 502 Bad Gateway

- Verifique se o backend está rodando (acesse `/docs`)
- Verifique os logs do Railway
- Certifique-se de que a porta está configurada corretamente

### Timeout ao processar planilhas

- Railway tem timeout padrão de 30 segundos
- Considere aumentar o timeout ou otimizar o processamento
- Para planilhas muito grandes, considere usar Railway Pro

---

## 📝 Checklist de Deploy

- [ ] Backend deployado no Railway
- [ ] URL do backend anotada
- [ ] Variável `ALLOWED_ORIGINS` configurada (pode ser temporária)
- [ ] Frontend deployado no Vercel
- [ ] Variável `VITE_API_BASE_URL` configurada no Vercel
- [ ] URL do frontend anotada
- [ ] `ALLOWED_ORIGINS` atualizada com URL do Vercel
- [ ] Sistema testado end-to-end
- [ ] CORS funcionando corretamente
- [ ] Upload de arquivos funcionando

---

## 🎉 Pronto!

Seu sistema está no ar! Acesse a URL do Vercel e comece a usar.

### URLs importantes:

- **Frontend**: `https://seu-projeto.vercel.app`
- **Backend API**: `https://sua-url-railway.app`
- **Documentação API**: `https://sua-url-railway.app/docs`

---

## 💡 Dicas

1. **Domínios customizados**: Tanto Railway quanto Vercel permitem domínios customizados
2. **Monitoramento**: Use os dashboards do Railway e Vercel para monitorar uso
3. **Logs**: Ambos fornecem logs detalhados para debugging
4. **Rollback**: Railway e Vercel mantêm histórico de deploys para rollback fácil

---

## 🔐 Segurança

- ✅ CORS configurado corretamente
- ✅ Variáveis de ambiente não expostas no código
- ✅ HTTPS habilitado automaticamente
- ✅ Headers de segurança configurados no Vercel

---

**Boa sorte com o deploy! 🚀**
