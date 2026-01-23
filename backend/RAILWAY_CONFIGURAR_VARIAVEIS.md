# Como Configurar Variáveis de Ambiente no Railway

## ⚠️ Problema Identificado

O erro mostra que a aplicação está tentando conectar em `localhost`, o que significa que a variável `DATABASE_URL` **não está configurada no Railway**.

**Importante:** O arquivo `.env` **NÃO funciona em produção**. Você precisa configurar as variáveis de ambiente diretamente no Railway.

## 🔧 Solução: Configurar no Railway

### Passo 1: Acessar as Variáveis de Ambiente

1. No Railway, clique no serviço **"automacao-relatorio"** (não no MySQL)
2. Vá na aba **"Variables"** (ou **"Settings"** → **"Variables"**)

### Passo 2: Adicionar DATABASE_URL

1. Clique em **"+ New Variable"** ou **"Add Variable"**
2. Configure:
   - **Name:** `DATABASE_URL`
   - **Value:** Use a variável do MySQL do Railway

### Passo 3: Obter a DATABASE_URL do MySQL

**Opção A: Usar a variável automática do Railway (Recomendado)**

1. No serviço **MySQL**, vá em **"Variables"**
2. Procure por `MYSQL_URL` ou `DATABASE_URL`
3. Copie o valor
4. **IMPORTANTE:** Se começar com `mysql://`, adicione `+pymysql` depois de `mysql`:
   ```
   mysql://... → mysql+pymysql://...
   ```

**Opção B: Montar manualmente**

Se não houver variável automática, monte usando:
```
mysql+pymysql://root:SENHA@HOST:PORTA/railway
```

Onde:
- `SENHA`: Senha do MySQL (encontre em Variables do MySQL)
- `HOST`: Host do MySQL (ex: `turntable.proxy.rlwy.net`)
- `PORTA`: Porta do MySQL (ex: `29940`)

### Passo 4: Formato Correto

A `DATABASE_URL` deve ter este formato:

```
mysql+pymysql://root:SENHA@HOST:PORTA/railway
```

**Exemplo:**
```
mysql+pymysql://root:WJIiwiGMKydzdMjwLHwpMUkXEGjgEjTs@turntable.proxy.rlwy.net:29940/railway
```

⚠️ **ATENÇÃO:** Note o `+pymysql` após `mysql` - isso é necessário!

**Por quê?**
- Se você usar apenas `mysql://`, o SQLAlchemy tentará usar o driver `MySQLdb` (que não está instalado)
- Isso causará o erro: `ModuleNotFoundError: No module named 'MySQLdb'`
- O código agora normaliza automaticamente URLs que começam com `mysql://` para `mysql+pymysql://`, mas é melhor configurar corretamente desde o início

### Passo 5: Outras Variáveis Importantes

Configure também:

1. **SECRET_KEY:**
   - Name: `SECRET_KEY`
   - Value: Uma string aleatória segura (ex: gere com `openssl rand -hex 32`)

2. **ALLOWED_ORIGINS:**
   - Name: `ALLOWED_ORIGINS`
   - Value: URL do seu frontend (ex: `https://seu-frontend.vercel.app`)

### Passo 6: Fazer Redeploy

Após configurar as variáveis:

1. O Railway pode fazer redeploy automaticamente
2. Ou clique em **"Redeploy"** manualmente
3. Verifique os logs - deve aparecer:
   ```
   ✅ Tabelas do banco de dados criadas/verificadas com sucesso
   ```

## 🔍 Verificar se Funcionou

Após o redeploy, verifique os logs:

1. Vá em **"Deploy Logs"**
2. Procure por:
   - ✅ `Tabelas do banco de dados criadas/verificadas com sucesso`
   - ❌ Se ainda aparecer erro de conexão, verifique a `DATABASE_URL`

## 🧪 Testar a Conexão

Após configurar, teste os endpoints:

```bash
# Listar produtos
curl https://automacao-relatorio-production.up.railway.app/api/products/

# Listar logs
curl https://automacao-relatorio-production.up.railway.app/api/logs/
```

## 📝 Resumo do Problema

| Item | Status Atual | Correto |
|------|--------------|---------|
| `.env` local | ✅ Configurado | ✅ OK para desenvolvimento |
| Variável no Railway | ❌ **NÃO configurada** | ⚠️ **PRECISA configurar** |
| Formato DATABASE_URL | ❌ `mysql://` | ✅ `mysql+pymysql://` |

## 🎯 Checklist

- [ ] Acessar serviço "automacao-relatorio" no Railway
- [ ] Ir em "Variables"
- [ ] Adicionar `DATABASE_URL` com formato `mysql+pymysql://...`
- [ ] Adicionar `SECRET_KEY`
- [ ] Adicionar `ALLOWED_ORIGINS`
- [ ] Fazer redeploy
- [ ] Verificar logs - deve aparecer ✅

## 🆘 Se Ainda Não Funcionar

### Erro: `ModuleNotFoundError: No module named 'MySQLdb'`
**Causa:** A `DATABASE_URL` está usando `mysql://` em vez de `mysql+pymysql://`

**Solução:**
1. Verifique a variável `DATABASE_URL` no Railway
2. Certifique-se de que começa com `mysql+pymysql://`
3. O código agora normaliza automaticamente, mas é melhor configurar corretamente

### Outros Problemas

1. **Verifique o formato:** Deve ser `mysql+pymysql://` não `mysql://`
2. **Verifique as credenciais:** Usuário, senha, host e porta corretos
3. **Verifique o nome do banco:** Railway geralmente usa `railway` como nome padrão
4. **Veja os logs completos:** Pode haver mais detalhes do erro

## 🔧 Normalização Automática

O código agora normaliza automaticamente a `DATABASE_URL` para usar `pymysql`:
- `mysql://...` → `mysql+pymysql://...` (conversão automática)
- `mysql+mysqldb://...` → `mysql+pymysql://...` (conversão automática)
- `mysql+pymysql://...` → mantém como está (já está correto)

Mas **sempre configure corretamente** no Railway para evitar problemas!
