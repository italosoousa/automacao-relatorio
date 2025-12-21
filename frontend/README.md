# Frontend - Analisador de Planilhas

Esta é a aplicação frontend do projeto, desenvolvida com React, Vite, TypeScript e Ant Design.

## Funcionalidades

- **Interface Responsiva**: Construída com Ant Design para uma UI limpa e profissional.
- **Upload Intuitivo**: Componentes de arrastar e soltar para as duas planilhas.
- **Dashboard Interativo**:
  - Cards de resumo com totais de lucro e itens.
  - Filtro por "Estado" com busca.
  - Tabela de dados com ordenação.
- **Formatação de Dados**: Valores monetários são exibidos em Reais (BRL).
- **Tratamento de Erros**: Exibe mensagens claras caso ocorra um problema na comunicação com a API ou no processamento dos arquivos.

## Como Executar

A partir da raiz do projeto, entre na pasta do frontend.

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento com Vite.
- `npm run build`: Compila a aplicação para produção.
- `npm run lint`: Executa o linter (ESLint) para análise de código.
- `npm run preview`: Inicia um servidor local para visualizar a build de produção.
