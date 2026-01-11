# 🚀 Deploy Railway + Vercel - Resumo Rápido

## ✅ Arquivos Criados/Configurados

### Backend (Railway):
- ✅ `backend/Procfile` - Comando de start
- ✅ `backend/runtime.txt` - Versão do Python
- ✅ `backend/railway.json` - Configuração Railway
- ✅ `backend/nixpacks.toml` - Configuração Nixpacks
- ✅ `backend/app/main.py` - CORS configurado com variáveis de ambiente

### Frontend (Vercel):
- ✅ `frontend/vercel.json` - Configuração Vercel
- ✅ `frontend/src/api/dashboard.ts` - URL da API via variável de ambiente

## 📝 Variáveis de Ambiente Necessárias

### Railway (Backend):
```
ALLOWED_ORIGINS=https://seu-frontend.vercel.app
```

### Vercel (Frontend):
```
VITE_API_BASE_URL=https://sua-url-railway.app
```

## 🎯 Passos Rápidos

1. **Railway**: 
   - New Project > GitHub repo > Root: `backend`
   - Variável: `ALLOWED_ORIGINS` (atualizar depois com URL do Vercel)

2. **Vercel**:
   - New Project > GitHub repo > Root: `frontend`
   - Variável: `VITE_API_BASE_URL` (URL do Railway)

3. **Atualizar CORS**:
   - Voltar no Railway e atualizar `ALLOWED_ORIGINS` com URL do Vercel

## 📖 Guia Completo

Veja o arquivo **DEPLOY_RAILWAY_VERCEL.md** para instruções detalhadas passo a passo.
