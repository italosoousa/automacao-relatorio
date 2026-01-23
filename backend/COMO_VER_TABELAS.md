# Como Ver as Tabelas do Banco de Dados

## 🚀 Forma Rápida (Script)

Execute o script que foi criado:

```bash
cd backend
./ver_tabelas.sh
```

Este script mostra:
- Lista de todas as tabelas
- Estrutura de cada tabela
- Estatísticas (quantidade de registros)

## 📋 Comandos MySQL Diretos

### Ver todas as tabelas:
```bash
mysql -u root automacao_relatorio -e "SHOW TABLES;"
```

### Ver estrutura da tabela `products`:
```bash
mysql -u root automacao_relatorio -e "DESCRIBE products;"
```

### Ver estrutura da tabela `logs`:
```bash
mysql -u root automacao_relatorio -e "DESCRIBE logs;"
```

### Ver dados da tabela `products`:
```bash
mysql -u root automacao_relatorio -e "SELECT * FROM products;"
```

### Ver dados da tabela `logs`:
```bash
mysql -u root automacao_relatorio -e "SELECT * FROM logs ORDER BY horario DESC LIMIT 10;"
```

## 🖥️ Interface Gráfica (Opcional)

Se preferir uma interface visual, você pode usar:

### MySQL Workbench
- Baixe em: https://dev.mysql.com/downloads/workbench/
- Conecte com:
  - Host: `localhost`
  - Port: `3306`
  - User: `root`
  - Password: (deixe vazio se não configurou senha)
  - Database: `automacao_relatorio`

### DBeaver (Gratuito e Multiplataforma)
- Baixe em: https://dbeaver.io/download/
- Suporta MySQL, PostgreSQL, SQLite, etc.

### TablePlus (macOS)
- Baixe na App Store ou: https://tableplus.com/

## 📊 Via API do Backend

Quando o backend estiver rodando, você também pode ver os dados via API:

### Listar produtos:
```bash
curl http://localhost:8000/api/products/
```

### Listar logs:
```bash
curl http://localhost:8000/api/logs/
```

Ou acesse a documentação interativa:
```
http://localhost:8000/docs
```

## 🔍 Estrutura das Tabelas

### Tabela `products`
- `id` - ID único do produto
- `codigo_linx` - Código do sistema LINX
- `descricao` - Descrição do produto
- `sku` - SKU do produto
- `codigo_barras` - Código de barras
- `preco_custo` - Preço de custo
- `created_at` - Data de criação
- `updated_at` - Data de atualização

### Tabela `logs`
- `id` - ID único do log
- `tipo_relatorio` - Tipo: "mercado_livre", "rfid", "sugestao_vendas"
- `horario` - Horário da geração do relatório
- `detalhes` - Detalhes adicionais
- `arquivo_origem` - Nome do arquivo processado
