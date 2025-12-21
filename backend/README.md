# Backend - Analisador de Planilhas

Esta é a API backend do projeto, desenvolvida com FastAPI.

## Funcionalidades

- **CORS Habilitado**: Permite requisições do frontend local (`http://localhost:5173`).
- **Upload de Arquivos**: Aceita planilhas `.xlsx` e `.csv` via `multipart/form-data`.
- **Processamento Robusto**: Utiliza `pandas` para ler e processar os dados, com normalização de colunas e tratamento de valores.
- **Endpoints**:
  - `POST /api/dashboard/preview`: O endpoint principal que recebe os dois arquivos, os processa e retorna o JSON para o dashboard.
  - `GET /api/health`: Endpoint para verificar se a API está no ar.

## Como Executar

Certifique-se de estar com seu ambiente virtual ativado.

```bash
# A partir da raiz do projeto, entre na pasta do backend
cd backend

# Instale as dependências
pip install -r requirements.txt

# Inicie o servidor
uvicorn app.main:app --reload
```

O servidor estará rodando em `http://127.0.0.1:8000`.

## Exemplo de Requisição (cURL)

Você pode testar a API com o comando `curl` a partir do diretório `/backend`. Crie dois arquivos de exemplo, `ml.xlsx` e `base.xlsx`, para usar no comando.

```bash
curl -X POST "http://127.0.0.1:8000/api/dashboard/preview" \
-F "ml_file=@./ml.xlsx" \
-F "base_file=@./base.xlsx"
```

## Exemplo de Resposta JSON

O endpoint retornará um JSON estruturado da seguinte forma:

```json
{
  "rows": [
    {
      "sku": "SKU001",
      "descricao": "Produto Exemplo 1",
      "estado": "Informar a NF-e já emitida",
      "lucro_bruto": 50.75
    },
    {
      "sku": "SKU002",
      "descricao": "Produto Exemplo 2",
      "estado": "Pronto para enviar",
      "lucro_bruto": 120.50
    },
    {
      "sku": "SKU_SEM_BASE",
      "descricao": "SKU sem cadastro na base",
      "estado": "Informar a NF-e já emitida",
      "lucro_bruto": null
    }
  ],
  "summary": {
    "total_lucro": 171.25,
    "total_itens": 3,
    "skus_sem_cadastro": 1
  },
  "states": [
    "Informar a NF-e já emitida",
    "Pronto para enviar"
  ]
}
```
