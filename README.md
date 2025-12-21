# Analisador de Planilhas (MVP)

Este projeto é um sistema fullstack para análise de planilhas de vendas e produtos, projetado para calcular o lucro bruto e fornecer um dashboard interativo.

O sistema é composto por:
- **Backend**: Uma API em Python (FastAPI) que processa as planilhas.
- **Frontend**: Uma aplicação em React (TypeScript) que permite o upload dos arquivos e a visualização dos dados.

## Como Executar o Projeto

Para rodar o projeto completo, você precisará ter o **Node.js** (v18+) e o **Python** (v3.8+) instalados.

### 1. Backend (Python)

Navegue até a pasta do backend, crie um ambiente virtual, instale as dependências e inicie o servidor.

```bash
# Navegue até a pasta do backend
cd backend

# Crie e ative um ambiente virtual
# No Windows:
python -m venv venv
venv\\Scripts\\activate
# No macOS/Linux:
# python3 -m venv venv
# source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Inicie o servidor FastAPI
uvicorn app.main:app --reload
```

O servidor backend estará disponível em `http://127.0.0.1:8000`.

### 2. Frontend (React)

Abra **outro terminal**, navegue até a pasta do frontend, instale as dependências e inicie a aplicação.

```bash
# Navegue até a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie a aplicação de desenvolvimento
npm run dev
```

A aplicação frontend estará disponível em `http://localhost:5173`. Abra este endereço no seu navegador para usar o sistema.

## Estrutura do Projeto

O projeto está organizado em um monorepo com duas pastas principais:

- `/backend`: Contém a API FastAPI.
  - `/app`: Código fonte da aplicação.
    - `/services`: Lógica de negócio para processamento dos dados.
    - `/models`: Esquemas Pydantic para validação de dados.
    - `/utils`: Funções utilitárias.
    - `main.py`: Arquivo principal da API com os endpoints.
  - `requirements.txt`: Dependências Python.
- `/frontend`: Contém a aplicação React.
  - `/src`: Código fonte da aplicação.
    - `/api`: Funções para comunicação com o backend.
    - `/components`: Componentes React reutilizáveis.
    - `/pages`: Componentes de página.
  - `package.json`: Dependências e scripts do Node.js.
