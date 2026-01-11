# 🚀 Deploy Rápido - Passo a Passo

## 1️⃣ Deploy do Backend (Render)

1. Acesse https://render.com e faça login
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório Git
4. Configure:
   - **Name**: `automacao-relatorio-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Adicione variável de ambiente:
   - **Key**: `ALLOWED_ORIGINS`
   - **Value**: `https://seu-frontend.vercel.app` (você atualizará depois)
6. Clique em **"Create Web Service"**
7. **Anote a URL** do backend (ex: `https://automacao-relatorio-api.onrender.com`)

## 2️⃣ Deploy do Frontend (Vercel)

1. Acesse https://vercel.com e faça login
2. Clique em **"Add New..."** → **"Project"**
3. Conecte seu repositório Git
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
5. Adicione variável de ambiente:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://automacao-relatorio-api.onrender.com` (URL do seu backend)
6. Clique em **"Deploy"**
7. **Anote a URL** do frontend (ex: `https://seu-projeto.vercel.app`)

## 3️⃣ Atualizar CORS do Backend

1. Volte ao Render
2. Vá em **Environment** → **Environment Variables**
3. Atualize `ALLOWED_ORIGINS` com a URL do frontend:
   - **Value**: `https://seu-projeto.vercel.app`
4. O backend será reiniciado automaticamente

## ✅ Pronto!

Seu sistema está no ar! Acesse a URL do frontend e teste o upload de planilhas.

---

**💡 Dica**: Para mais detalhes e troubleshooting, consulte o arquivo `DEPLOY.md`
