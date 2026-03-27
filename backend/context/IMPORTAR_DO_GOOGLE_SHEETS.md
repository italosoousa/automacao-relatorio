# Como Importar Planilha do Google Sheets para o Banco de Dados

## 📋 Passo a Passo Completo

### Opção 1: Exportar do Google Sheets e Importar via API (Recomendado)

#### Passo 1: Exportar do Google Sheets

1. Abra sua planilha no Google Sheets: `Produtos API Atualizado`
2. Vá em **Arquivo** → **Fazer download** → **Microsoft Excel (.xlsx)**
3. Salve o arquivo no seu computador (ex: `produtos.xlsx`)

#### Passo 2: Verificar o Formato

Certifique-se de que a planilha tem:
- **Primeira linha:** Cabeçalhos das colunas
- **Colunas esperadas:**
  - `CODIGO_LINX` (obrigatório)
  - `DESCRICAO` (opcional)
  - `SKU` (opcional)
  - `CODIGO_BARRAS` (opcional)
  - `PRECO_CUSTO` (opcional)

**Importante:** Os nomes das colunas devem estar na primeira linha e podem estar em qualquer ordem.

#### Passo 3: Importar via API

**Usando a Documentação Interativa (Swagger):**

1. Acesse: `https://automacao-relatorio-production.up.railway.app/docs`
2. Encontre o endpoint: `POST /api/products/import-from-excel`
3. Clique em **"Try it out"**
4. Clique em **"Choose File"** e selecione o arquivo `produtos.xlsx`
5. Configure `update_existing`:
   - `false` = Ignora produtos que já existem
   - `true` = Atualiza produtos existentes
6. Clique em **"Execute"**

**Usando cURL:**

```bash
curl -X POST "https://automacao-relatorio-production.up.railway.app/api/products/import-from-excel?update_existing=false" \
  -H "accept: application/json" \
  -F "file=@produtos.xlsx"
```

**Usando Python:**

```python
import requests

url = "https://automacao-relatorio-production.up.railway.app/api/products/import-from-excel"
files = {"file": open("produtos.xlsx", "rb")}
params = {"update_existing": False}

response = requests.post(url, files=files, params=params)
print(response.json())
```

### Opção 2: Script Python Local

Se preferir importar localmente:

```bash
cd backend
python scripts/import_products.py ~/Downloads/produtos.xlsx
```

## 🔍 Verificando os Dados Importados

Após a importação, você pode verificar:

### Via API:

```bash
# Listar todos os produtos
curl https://automacao-relatorio-production.up.railway.app/api/products/

# Buscar um produto específico
curl https://automacao-relatorio-production.up.railway.app/api/products/codigo-linx/2794
```

### Via MySQL Workbench:

1. Conecte ao banco de dados
2. Execute:
```sql
SELECT * FROM products LIMIT 10;
SELECT COUNT(*) as total_produtos FROM products;
```

## ⚠️ Observações Importantes

### Sobre a Planilha

Baseado na imagem que você mostrou:
- ✅ A planilha tem as colunas corretas
- ✅ Os dados parecem estar formatados corretamente
- ⚠️ A coluna `SKU` está vazia - isso é normal, será salvo como `NULL`

### Sobre Valores Vazios

- Campos vazios serão salvos como `NULL` no banco
- `CODIGO_LINX` é obrigatório - linhas sem esse valor serão ignoradas
- Outros campos podem estar vazios

### Sobre Duplicatas

- Se `update_existing=false`: Produtos com mesmo `CODIGO_LINX` serão ignorados
- Se `update_existing=true`: Produtos existentes serão atualizados com os novos dados

## 🎯 Exemplo de Resposta da API

Após importar, você receberá algo como:

```json
{
  "message": "Importação concluída",
  "created": 45,
  "updated": 0,
  "skipped": 0,
  "errors": null,
  "total_rows": 45
}
```

## 🆘 Problemas Comuns

### Erro: "Coluna 'CODIGO_LINX' não encontrada"

**Causa:** O nome da coluna está diferente.

**Solução:**
- Verifique se a primeira linha tem exatamente `CODIGO_LINX`
- Pode estar escrito diferente (ex: "Codigo Linx", "CÓDIGO_LINX", etc)
- O sistema é case-insensitive, mas o nome deve estar correto

### Erro: "A planilha está vazia"

**Causa:** A planilha não tem dados além do cabeçalho.

**Solução:**
- Verifique se há dados abaixo da primeira linha
- Certifique-se de que exportou a planilha completa

### Erro: "Erro ao processar planilha"

**Causa:** Problema com formato ou dados.

**Solução:**
- Verifique se o arquivo é realmente `.xlsx` (não `.xls` ou `.csv`)
- Verifique se não há caracteres especiais problemáticos
- Tente exportar novamente do Google Sheets

## 📝 Dicas

1. **Primeira importação:** Use `update_existing=false` para não sobrescrever nada
2. **Atualizações futuras:** Use `update_existing=true` para atualizar produtos existentes
3. **Backup:** Antes de importar muitos dados, faça backup do banco
4. **Teste pequeno:** Teste primeiro com 5-10 produtos para verificar se está tudo ok

## 🚀 Próximos Passos

Após importar os produtos:

1. Os produtos estarão disponíveis no banco de dados
2. O sistema de relatórios (Mercado Livre) usará automaticamente esses produtos
3. Você pode gerenciar produtos via API: criar, atualizar, listar, deletar
