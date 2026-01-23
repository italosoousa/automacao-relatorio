# Como Iniciar o MySQL

O MySQL foi instalado, mas precisa ser iniciado manualmente. Siga estes passos:

## Opção 1: Iniciar MySQL Manualmente (Recomendado)

Abra um **novo terminal** e execute:

```bash
# Iniciar MySQL em background
/opt/homebrew/opt/mysql/bin/mysqld_safe --datadir=/opt/homebrew/var/mysql &
```

Aguarde alguns segundos e então execute:

```bash
# Criar o banco de dados
mysql -u root -e "CREATE DATABASE automacao_relatorio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## Opção 2: Usar o Script Automático

Execute o script que foi criado:

```bash
cd backend
./setup_mysql.sh
```

## Verificar se Funcionou

Teste a conexão:

```bash
mysql -u root -e "SHOW DATABASES;"
```

Você deve ver `automacao_relatorio` na lista.

## Configuração do .env

O arquivo `.env` já está configurado com:
```
DATABASE_URL=mysql+pymysql://root@localhost:3306/automacao_relatorio
```

## Iniciar o Backend

Depois que o MySQL estiver rodando e o banco criado:

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

Agora você deve ver:
```
✅ Tabelas do banco de dados criadas/verificadas com sucesso
```

## Problemas Comuns

### MySQL não inicia
- Verifique se não há outro processo MySQL rodando
- Tente: `killall mysqld` e depois inicie novamente

### Erro de conexão
- Certifique-se de que o MySQL está rodando: `lsof -i :3306`
- Verifique o arquivo `.env` está correto

### Esqueceu de iniciar o MySQL
- Sempre inicie o MySQL antes de rodar o backend
- Ou configure para iniciar automaticamente com: `brew services start mysql` (pode precisar de permissões)
