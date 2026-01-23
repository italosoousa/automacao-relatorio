# Como Conectar MySQL Workbench ao Banco de Dados

## 📥 Passo 1: Instalar MySQL Workbench

Se ainda não tiver instalado:

1. Baixe em: https://dev.mysql.com/downloads/workbench/
2. Escolha a versão para macOS
3. Instale o arquivo `.dmg`
4. Arraste o MySQL Workbench para a pasta Applications

## 🔌 Passo 2: Criar Nova Conexão

1. Abra o **MySQL Workbench**
2. Na tela inicial, você verá a seção **"MySQL Connections"**
3. Clique no botão **"+"** (plus) ao lado de "MySQL Connections"
   - Ou vá em: `Database` → `Manage Connections...` → `New`

## ⚙️ Passo 3: Configurar a Conexão

Preencha os seguintes campos:

### Configurações Básicas:
- **Connection Name:** `Automacao Relatorio` (ou qualquer nome que preferir)
- **Connection Method:** `Standard (TCP/IP)`
- **Hostname:** `127.0.0.1` ou `localhost`
- **Port:** `3306` (porta padrão do MySQL)
- **Username:** `root`
- **Password:** (deixe vazio - o MySQL foi instalado sem senha)

### Configurações Avançadas (Opcional):
- Clique na aba **"Advanced"**
- **Default Schema:** `automacao_relatorio`

## 💾 Passo 4: Salvar e Testar

1. Clique em **"Test Connection"** para verificar se está tudo certo
2. Se aparecer "Successfully made the MySQL connection", clique em **"OK"**
3. Clique em **"OK"** novamente para salvar a conexão

## 🚀 Passo 5: Conectar

1. Na tela inicial do MySQL Workbench, você verá sua nova conexão
2. Clique duas vezes na conexão **"Automacao Relatorio"**
3. Ou clique com botão direito → **"Open Connection"**

## 📊 Passo 6: Ver as Tabelas

Após conectar:

1. No painel esquerdo, expanda **"SCHEMAS"**
2. Expanda **"automacao_relatorio"**
3. Expanda **"Tables"**
4. Você verá as tabelas:
   - `logs`
   - `products`

### Para ver os dados:
- Clique com botão direito na tabela → **"Select Rows - Limit 1000"**
- Ou use o ícone de tabela ao lado do nome da tabela

### Para ver a estrutura:
- Clique com botão direito na tabela → **"Table Inspector"**
- Ou clique na aba **"Columns"** no painel inferior

## 🔍 Resumo das Configurações

```
Connection Name: Automacao Relatorio
Hostname: 127.0.0.1
Port: 3306
Username: root
Password: (vazio)
Default Schema: automacao_relatorio
```

## ⚠️ Problemas Comuns

### Erro: "Can't connect to MySQL server"
**Solução:** Certifique-se de que o MySQL está rodando:
```bash
/opt/homebrew/opt/mysql/bin/mysqld_safe --datadir=/opt/homebrew/var/mysql &
```

### Erro: "Access denied"
**Solução:** Se você configurou uma senha, use-a. Se não, deixe o campo password vazio.

### Não aparece o banco "automacao_relatorio"
**Solução:** O banco pode não ter sido criado ainda. Execute:
```bash
mysql -u root -e "CREATE DATABASE automacao_relatorio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Porta 3306 não está disponível
**Solução:** Verifique se o MySQL está usando a porta 3306:
```bash
lsof -i :3306
```

## 🎯 Dicas Úteis

1. **Salvar a senha:** Se configurar senha depois, marque "Store in Keychain" para não precisar digitar sempre
2. **Favoritar:** Você pode marcar a conexão como favorita clicando na estrela
3. **SQL Editor:** Use `Ctrl+Enter` (ou `Cmd+Enter` no Mac) para executar queries
4. **Auto-complete:** O Workbench tem auto-complete para SQL - use `Ctrl+Space`

## 📝 Exemplo de Query

Depois de conectar, você pode executar queries SQL:

```sql
-- Ver todas as tabelas
SHOW TABLES;

-- Ver estrutura da tabela products
DESCRIBE products;

-- Ver todos os produtos
SELECT * FROM products;

-- Ver logs recentes
SELECT * FROM logs ORDER BY horario DESC LIMIT 10;

-- Contar produtos
SELECT COUNT(*) as total_produtos FROM products;
```
