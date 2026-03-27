# 📊 Guia Rápido: Importar Planilha do Google Sheets

## 🎯 Passo a Passo Simples

### 1️⃣ Exportar do Google Sheets

1. Abra sua planilha: **"Produtos API Atualizado"**
2. Clique em **Arquivo** → **Fazer download** → **Microsoft Excel (.xlsx)**
3. Salve o arquivo (ex: `produtos.xlsx`)

### 2️⃣ Importar via API

**Opção A: Usando a Interface Web (Mais Fácil)**

1. Acesse: `https://automacao-relatorio-production.up.railway.app/docs`
2. Procure por: `POST /api/products/import-from-excel`
3. Clique em **"Try it out"**
4. Clique em **"Choose File"** e selecione o arquivo `produtos.xlsx`
5. Deixe `update_existing` como `false` (primeira importação)
6. Clique em **"Execute"**

**Opção B: Usando cURL (Terminal)**

```bash
curl -X POST "https://automacao-relatorio-production.up.railway.app/api/products/import-from-excel?update_existing=false" \
  -F "file=@produtos.xlsx"
```

### 3️⃣ Verificar Resultado

Você receberá uma resposta como:

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

## ✅ Sua Planilha Está Pronta!

Baseado na imagem que você mostrou, sua planilha tem:
- ✅ `codigo_linx` - Coluna B
- ✅ `descricao` - Coluna C  
- ✅ `sku` - Coluna D (pode estar vazia)
- ✅ `codigo_barras` - Coluna E
- ✅ `preco_custo` - Coluna F

**Tudo certo!** O sistema vai reconhecer automaticamente essas colunas.

## 🔍 Verificar Dados Importados

Após importar, você pode verificar:

```bash
# Ver quantos produtos foram importados
curl https://automacao-relatorio-production.up.railway.app/api/products/

# Ver um produto específico
curl https://automacao-relatorio-production.up.railway.app/api/products/codigo-linx/2794
```

Ou no MySQL Workbench:

```sql
SELECT COUNT(*) FROM products;
SELECT * FROM products LIMIT 10;
```

## 🎉 Pronto!

Depois da importação, os produtos estarão no banco de dados e o sistema de relatórios (Mercado Livre) usará automaticamente esses dados ao invés da planilha!
