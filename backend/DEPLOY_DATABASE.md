# Configuração do Banco de Dados para Deploy

## ⚠️ Importante

O banco de dados local (`localhost`) **NÃO funciona em produção**. Você precisa configurar um banco de dados na plataforma de deploy.

## 🎯 O que precisa ser feito

1. **Criar um banco de dados na plataforma de deploy** (Railway/Render)
2. **Configurar a variável de ambiente `DATABASE_URL`** na plataforma
3. **O código já está preparado** - ele usa a variável de ambiente automaticamente

## 🚂 Railway (Recomendado)

### Passo 1: Criar Banco de Dados MySQL no Railway

1. Acesse seu projeto no Railway: https://railway.app
2. Clique em **"+ New"** → **"Database"** → **"Add MySQL"**
3. Railway criará automaticamente um banco MySQL
4. Anote as credenciais que aparecerem

### Passo 2: Configurar Variável de Ambiente

1. No seu serviço de API (não no banco), vá em **"Variables"**
2. Adicione a variável:
   ```
   DATABASE_URL=mysql+pymysql://usuario:senha@host:porta/nome_do_banco
   ```
3. O Railway fornece uma variável `DATABASE_URL` automaticamente - você pode usar ela!
4. Se não aparecer, copie a string de conexão do banco criado

### Passo 3: Deploy

1. Faça commit e push para a branch main
2. O Railway fará deploy automaticamente
3. As tabelas serão criadas automaticamente na primeira execução

## 🎨 Render

### Passo 1: Criar Banco de Dados MySQL no Render

1. Acesse: https://render.com
2. Clique em **"New +"** → **"PostgreSQL"** ou **"MySQL"**
   - **Nota:** Render oferece PostgreSQL grátis, mas você pode usar MySQL pago
3. Configure:
   - **Name:** `automacao-relatorio-db`
   - **Database:** `automacao_relatorio`
   - **User:** (será gerado)
   - **Password:** (será gerado)
4. Anote as credenciais

### Passo 2: Configurar no Serviço Web

1. No seu serviço web (API), vá em **"Environment"**
2. Adicione a variável:
   ```
   DATABASE_URL=mysql+pymysql://usuario:senha@host:porta/nome_do_banco
   ```
3. Use a **Internal Database URL** que o Render fornece

### Passo 3: Deploy

1. Faça commit e push
2. O Render fará deploy
3. As tabelas serão criadas automaticamente

## 🔧 Formato da DATABASE_URL

O formato correto é:

```
mysql+pymysql://usuario:senha@host:porta/nome_do_banco
```

**Exemplo Railway:**
```
mysql+pymysql://root:senha123@containers-us-west-123.railway.app:5432/railway
```

**Exemplo Render:**
```
mysql+pymysql://usuario:senha@dpg-xxxxx-a.oregon-postgres.render.com:5432/automacao_relatorio
```

## ✅ Verificação

Após o deploy, verifique se funcionou:

1. Acesse os logs do deploy
2. Procure por: `✅ Tabelas do banco de dados criadas/verificadas com sucesso`
3. Se aparecer erro de conexão, verifique a `DATABASE_URL`

## 🧪 Testar em Produção

Após o deploy, teste os endpoints:

```bash
# Listar produtos (deve retornar vazio inicialmente)
curl https://seu-backend.railway.app/api/products/

# Listar logs
curl https://seu-backend.railway.app/api/logs/
```

## 📝 Checklist Antes do Deploy

- [ ] Banco de dados criado na plataforma (Railway/Render)
- [ ] Variável `DATABASE_URL` configurada no serviço web
- [ ] Variável `SECRET_KEY` configurada (importante para segurança)
- [ ] Variável `ALLOWED_ORIGINS` configurada com URL do frontend
- [ ] Código commitado e pushado para main

## 🔒 Segurança

**IMPORTANTE:** Nunca commite o arquivo `.env` com credenciais reais!

O arquivo `.env` já está no `.gitignore`, mas verifique:

```bash
# Verificar se .env está ignorado
git check-ignore backend/.env
```

## 🆘 Problemas Comuns

### Erro: "Can't connect to MySQL server"
- Verifique se a `DATABASE_URL` está correta
- Verifique se o banco está acessível (não bloqueado por firewall)
- No Railway, use a variável interna do banco

### Erro: "Access denied"
- Verifique usuário e senha na `DATABASE_URL`
- Certifique-se de que o usuário tem permissões

### Tabelas não são criadas
- Verifique os logs do deploy
- O erro pode aparecer no startup do app
- As tabelas são criadas automaticamente na primeira execução

## 🎯 Resumo

1. **Local:** Usa `localhost` (arquivo `.env`)
2. **Produção:** Usa variável de ambiente `DATABASE_URL` configurada na plataforma
3. **Código:** Já está preparado para usar variáveis de ambiente
4. **Deploy:** Só precisa configurar a `DATABASE_URL` na plataforma

O código **já funciona** - você só precisa configurar o banco na plataforma de deploy! 🚀
