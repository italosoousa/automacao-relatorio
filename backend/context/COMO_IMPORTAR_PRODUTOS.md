# Como Importar Produtos de uma Planilha para o Banco de Dados

Existem duas formas de importar produtos de uma planilha Excel para o banco de dados:

## 📋 Formato da Planilha

A planilha Excel deve ter as seguintes colunas:

| Coluna | Obrigatória | Descrição |
|--------|-------------|-----------|
| **CODIGO_LINX** | ✅ Sim | Código único do produto no sistema LINX |
| DESCRICAO | ❌ Não | Descrição do produto |
| SKU | ❌ Não | SKU do produto |
| CODIGO_BARRAS | ❌ Não | Código de barras |
| PRECO_CUSTO | ❌ Não | Preço de custo (aceita também "PRECO" ou "CUSTO") |

**Nota:** Os nomes das colunas são case-insensitive (não importa maiúsculas/minúsculas).

### Exemplo de Planilha

```
CODIGO_LINX | DESCRICAO              | SKU      | CODIGO_BARRAS | PRECO_CUSTO
------------|------------------------|----------|---------------|------------
12345       | Produto Exemplo 1      | SKU001   | 7891234567890 | 10.50
12346       | Produto Exemplo 2      | SKU002   | 7891234567891 | 15.75
```

## 🚀 Opção 1: Via API (Recomendado para Produção)

### Passo 1: Preparar a Planilha

Certifique-se de que a planilha tem pelo menos a coluna `CODIGO_LINX`.

### Passo 2: Fazer Upload via API

**Usando cURL:**
```bash
curl -X POST "https://seu-backend.railway.app/api/products/import-from-excel" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@caminho/para/produtos.xlsx" \
  -F "update_existing=false"
```

**Usando Python (requests):**
```python
import requests

url = "https://seu-backend.railway.app/api/products/import-from-excel"
files = {"file": open("produtos.xlsx", "rb")}
data = {"update_existing": False}

response = requests.post(url, files=files, data=data)
print(response.json())
```

**Usando a Documentação Interativa:**
1. Acesse: `https://seu-backend.railway.app/docs`
2. Encontre o endpoint `POST /api/products/import-from-excel`
3. Clique em "Try it out"
4. Faça upload do arquivo
5. Configure `update_existing` (true para atualizar existentes, false para ignorar)
6. Execute

### Parâmetros

- **file**: Arquivo Excel (.xlsx) com os produtos
- **update_existing**: 
  - `false` (padrão): Ignora produtos que já existem
  - `true`: Atualiza produtos existentes com os novos dados

### Resposta

```json
{
  "message": "Importação concluída",
  "created": 150,
  "updated": 0,
  "skipped": 5,
  "errors": null,
  "total_rows": 155
}
```

## 💻 Opção 2: Script Python (Recomendado para Desenvolvimento)

### Passo 1: Preparar o Ambiente

Certifique-se de que:
- O MySQL está rodando
- O arquivo `.env` está configurado
- As dependências estão instaladas

### Passo 2: Executar o Script

```bash
cd backend

# Importar sem atualizar existentes (padrão)
python scripts/import_products.py caminho/para/produtos.xlsx

# Importar atualizando produtos existentes
python scripts/import_products.py caminho/para/produtos.xlsx --update
```

### Exemplo Completo

```bash
# Ativar ambiente virtual (se estiver usando)
source venv/bin/activate

# Executar importação
python scripts/import_products.py ~/Downloads/produtos.xlsx
```

### Saída do Script

```
📖 Lendo planilha: ~/Downloads/produtos.xlsx
✅ Planilha lida com sucesso: 155 linhas encontradas

🔄 Processando produtos...
  + Criado: 12345
  + Criado: 12346
  ⊘ Ignorado (já existe): 12347
  ...

💾 Salvando no banco de dados...

==================================================
📊 RESUMO DA IMPORTAÇÃO
==================================================
✅ Produtos criados: 150
🔄 Produtos atualizados: 0
⊘ Produtos ignorados: 5
📝 Total de linhas processadas: 155

✅ Importação concluída com sucesso!
```

## ⚙️ Comportamento

### Modo Padrão (update_existing=false)

- **Produtos novos:** São criados no banco
- **Produtos existentes:** São ignorados (não são atualizados)
- **Linhas vazias:** São ignoradas

### Modo Update (update_existing=true)

- **Produtos novos:** São criados no banco
- **Produtos existentes:** São atualizados com os novos dados da planilha
- **Linhas vazias:** São ignoradas

## 🔍 Validações

O sistema valida automaticamente:

1. **CODIGO_LINX obrigatório:** Linhas sem CODIGO_LINX são ignoradas
2. **Duplicatas:** Se `update_existing=false`, produtos com mesmo CODIGO_LINX são ignorados
3. **Formato de preço:** Aceita números com vírgula ou ponto decimal
4. **Campos vazios:** Campos vazios são salvos como `NULL` no banco

## 🆘 Problemas Comuns

### Erro: "Coluna 'CODIGO_LINX' não encontrada"

**Causa:** A planilha não tem a coluna obrigatória.

**Solução:**
- Verifique se a coluna existe na planilha
- Verifique se o nome está correto (case-insensitive)
- Verifique se não há espaços extras no nome da coluna

### Erro: "Produto com CODIGO_LINX 'XXX' já existe"

**Causa:** Tentando criar produto que já existe (modo padrão).

**Solução:**
- Use `update_existing=true` para atualizar produtos existentes
- Ou remova os produtos duplicados da planilha

### Erro: "A planilha está vazia"

**Causa:** A planilha não tem dados.

**Solução:**
- Verifique se a planilha tem dados
- Verifique se está usando a aba correta (se houver múltiplas abas)

## 📝 Dicas

1. **Backup:** Antes de importar muitos produtos, faça backup do banco
2. **Teste pequeno:** Teste primeiro com uma planilha pequena (10-20 produtos)
3. **Validação:** Verifique os dados na planilha antes de importar
4. **Logs:** Use os logs/erros retornados para identificar problemas

## 🎯 Exemplo de Planilha Completa

Crie uma planilha Excel com esta estrutura:

| CODIGO_LINX | DESCRICAO | SKU | CODIGO_BARRAS | PRECO_CUSTO |
|-------------|-----------|-----|---------------|-------------|
| 001 | Produto A | SKU001 | 7891234567890 | 10.50 |
| 002 | Produto B | SKU002 | 7891234567891 | 15.75 |
| 003 | Produto C | SKU003 | 7891234567892 | 20.00 |

Salve como `.xlsx` e importe usando uma das opções acima!
