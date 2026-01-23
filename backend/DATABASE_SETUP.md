# Configuração do Banco de Dados MySQL

Este guia explica como configurar o banco de dados MySQL para o sistema.

## 📋 Pré-requisitos

- MySQL instalado e rodando
- Python 3.8+
- Acesso ao MySQL com permissões para criar banco de dados

## 🔧 Passo a Passo

### 1. Instalar Dependências

```bash
cd backend
pip install -r requirements.txt
```

### 2. Criar Banco de Dados MySQL

Você precisa executar o comando SQL no MySQL. Existem várias formas:

#### Opção A: Terminal/Command Line (MySQL CLI)

1. Abra o Terminal (macOS/Linux) ou Prompt de Comando/PowerShell (Windows)
2. Conecte-se ao MySQL:
   ```bash
   mysql -u root -p
   ```
   (Digite sua senha quando solicitado)

3. Execute o comando:
   ```sql
   CREATE DATABASE automacao_relatorio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. Verifique se foi criado:
   ```sql
   SHOW DATABASES;
   ```

5. Saia do MySQL:
   ```sql
   EXIT;
   ```

#### Opção B: MySQL Workbench (Interface Gráfica)

1. Abra o MySQL Workbench
2. Conecte-se ao seu servidor MySQL
3. Clique em "Query" ou pressione `Ctrl+Shift+Enter` (Windows) ou `Cmd+Shift+Enter` (Mac)
4. Cole o comando:
   ```sql
   CREATE DATABASE automacao_relatorio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
5. Execute o comando (ícone do raio ou `Ctrl+Enter`)

#### Opção C: phpMyAdmin (se estiver usando XAMPP/WAMP)

1. Acesse `http://localhost/phpmyadmin` no navegador
2. Clique na aba "SQL"
3. Cole o comando:
   ```sql
   CREATE DATABASE automacao_relatorio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Clique em "Executar"

#### Opção D: DBeaver ou outra ferramenta SQL

1. Conecte-se ao MySQL através da ferramenta
2. Abra um editor SQL
3. Execute o comando:
   ```sql
   CREATE DATABASE automacao_relatorio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

**Nota:** Você pode usar qualquer nome para o banco de dados, apenas lembre-se de atualizar o `DATABASE_URL` no arquivo `.env` com o nome escolhido.

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
DATABASE_URL=mysql+pymysql://seu_usuario:sua_senha@localhost:3306/automacao_relatorio
SECRET_KEY=sua-chave-secreta-aqui
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Formato do DATABASE_URL:**
```
mysql+pymysql://usuario:senha@host:porta/nome_do_banco
```

### 4. Inicializar Tabelas

As tabelas serão criadas automaticamente quando você iniciar o servidor pela primeira vez.

Para criar manualmente:

```python
from app.database import engine, Base
from app.models.product import Product
from app.models.log import Log

Base.metadata.create_all(bind=engine)
```

Ou simplesmente inicie o servidor:

```bash
uvicorn app.main:app --reload
```

## 📊 Estrutura das Tabelas

### Tabela `products`

Armazena informações dos produtos que substituem a planilha de base.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| codigo_linx | VARCHAR(50) | Código único do produto no sistema LINX |
| descricao | VARCHAR(500) | Descrição do produto |
| sku | VARCHAR(100) | SKU do produto (usado para busca) |
| codigo_barras | VARCHAR(100) | Código de barras |
| preco_custo | DECIMAL(10,2) | Preço de custo do produto |
| created_at | DATETIME | Data de criação |
| updated_at | DATETIME | Data de atualização |

### Tabela `logs`

Registra quando relatórios são gerados no sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| tipo_relatorio | VARCHAR(100) | Tipo: "mercado_livre", "rfid", "sugestao_vendas" |
| horario | DATETIME | Horário em que o relatório foi gerado |
| detalhes | TEXT | Informações adicionais sobre o relatório |
| arquivo_origem | VARCHAR(500) | Nome do arquivo processado (opcional) |

## 🔌 Endpoints da API

### Produtos

- `GET /api/products/` - Lista produtos (com paginação e busca)
- `GET /api/products/{id}` - Busca produto por ID
- `GET /api/products/codigo-linx/{codigo_linx}` - Busca por CODIGO_LINX
- `GET /api/products/sku/{sku}` - Busca por SKU
- `POST /api/products/` - Cria novo produto
- `POST /api/products/bulk` - Cria múltiplos produtos
- `PUT /api/products/{id}` - Atualiza produto
- `DELETE /api/products/{id}` - Deleta produto

### Logs

- `GET /api/logs/` - Lista logs (com filtro por tipo)
- `GET /api/logs/{id}` - Busca log por ID

## 📝 Importar Produtos da Planilha

Para migrar produtos da planilha para o banco de dados, você pode:

1. **Usar a API bulk:**
```python
import requests
import pandas as pd

# Ler planilha
df = pd.read_excel("produtos.xlsx")

# Preparar dados
products = []
for _, row in df.iterrows():
    products.append({
        "codigo_linx": str(row["Código"]),
        "descricao": row.get("Descrição", ""),
        "sku": str(row.get("Código", "")),  # Ajuste conforme sua planilha
        "codigo_barras": str(row.get("Código de Barras", "")),
        "preco_custo": float(row.get("Custo Total Unit.", 0))
    })

# Enviar para API
response = requests.post(
    "http://localhost:8000/api/products/bulk",
    json=products
)
```

2. **Ou criar um script Python:**
```python
from app.database import SessionLocal
from app.models.product import Product
import pandas as pd

db = SessionLocal()

df = pd.read_excel("produtos.xlsx")
for _, row in df.iterrows():
    product = Product(
        codigo_linx=str(row["Código"]),
        descricao=row.get("Descrição"),
        sku=str(row.get("Código", "")),
        codigo_barras=str(row.get("Código de Barras", "")),
        preco_custo=float(row.get("Custo Total Unit.", 0))
    )
    db.add(product)

db.commit()
db.close()
```

## 🔄 Migração Gradual

O sistema permite usar tanto o banco de dados quanto a planilha durante a migração:

- **Sem planilha:** O sistema busca produtos apenas do banco de dados
- **Com planilha:** O sistema usa o banco primeiro, e a planilha como fallback

Isso permite migração gradual sem quebrar o sistema.

## ⚠️ Troubleshooting

### Erro de conexão

Verifique:
- MySQL está rodando
- Credenciais no `.env` estão corretas
- Banco de dados foi criado
- Usuário tem permissões adequadas

### Erro de encoding

Certifique-se de que o banco foi criado com:
```sql
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
```

### Tabelas não criadas

Execute manualmente:
```python
from app.database import engine, Base
Base.metadata.create_all(bind=engine)
```
