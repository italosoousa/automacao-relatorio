# Estrutura de Relatórios - Guia de Implementação

## 📋 Visão Geral

O sistema foi estruturado de forma modular para suportar múltiplos relatórios que funcionam de maneira similar: o usuário faz upload de duas planilhas, o sistema faz um cruzamento de dados e retorna informações processadas.

## 🏗️ Arquitetura

### Frontend

#### Rotas
- `/` - Dashboard de Análise de Lucro (relatório original)
- `/relatorio-1` - Relatório 1 (novo)
- `/relatorio-2` - Relatório 2 (novo)

#### Componentes Reutilizáveis
- **FileUpload**: Componente genérico que aceita labels customizáveis para os dois arquivos
- **Navigation**: Menu de navegação no header para alternar entre relatórios

#### Estrutura de Arquivos
```
frontend/src/
├── pages/
│   ├── DashboardPage.tsx      # Relatório original
│   ├── Relatorio1Page.tsx     # Novo relatório 1
│   └── Relatorio2Page.tsx     # Novo relatório 2
├── api/
│   ├── dashboard.ts           # API do dashboard original
│   ├── relatorio1.ts          # API do relatório 1
│   └── relatorio2.ts          # API do relatório 2
└── components/
    ├── FileUpload.tsx          # Componente genérico de upload
    └── Navigation.tsx          # Menu de navegação
```

### Backend

#### Estrutura de Arquivos
```
backend/app/
├── api/
│   ├── dashboard.py            # Endpoint do dashboard original
│   ├── relatorio1.py           # Endpoint do relatório 1
│   └── relatorio2.py           # Endpoint do relatório 2
├── schemas/
│   ├── dashboard.py            # Schemas Pydantic do dashboard
│   ├── relatorio1.py           # Schemas Pydantic do relatório 1
│   └── relatorio2.py           # Schemas Pydantic do relatório 2
└── services/
    ├── dashboard_service.py    # Lógica de processamento do dashboard
    ├── relatorio1_service.py   # Lógica de processamento do relatório 1
    └── relatorio2_service.py   # Lógica de processamento do relatório 2
```

## 🚀 Como Implementar um Novo Relatório

### Passo 1: Definir os Schemas (Backend)

Edite `backend/app/schemas/relatorio1.py` ou `relatorio2.py` para definir:
- **Row**: Estrutura de cada linha do relatório
- **Summary**: Resumo/estatísticas do relatório
- **Response**: Resposta completa da API

Exemplo:
```python
class Relatorio1Row(BaseModel):
    sku: Optional[str] = None
    nome_produto: str
    quantidade: int
    valor_total: float

class Relatorio1Summary(BaseModel):
    total_itens: int
    valor_total_geral: float

class Relatorio1Response(BaseModel):
    rows: List[Relatorio1Row]
    summary: Relatorio1Summary
```

### Passo 2: Implementar a Lógica de Processamento (Backend)

Edite `backend/app/services/relatorio1_service.py` ou `relatorio2_service.py`:

```python
def build_relatorio1(file1_bytes: bytes, file2_bytes: bytes) -> dict:
    # 1. Ler as planilhas
    df1 = pd.read_excel(file1_bytes, engine="openpyxl")
    df2 = pd.read_excel(file2_bytes, engine="openpyxl")
    
    # 2. Fazer cruzamento de dados
    merged = df1.merge(df2, on="chave_comum", how="left")
    
    # 3. Processar dados
    rows = []
    for _, row in merged.iterrows():
        rows.append({
            "sku": row.get("SKU"),
            "nome_produto": row.get("Nome"),
            # ... outros campos
        })
    
    # 4. Calcular resumo
    summary = {
        "total_itens": len(rows),
        "valor_total_geral": sum(r["valor_total"] for r in rows)
    }
    
    return {
        "rows": rows,
        "summary": summary
    }
```

### Passo 3: Atualizar os Tipos TypeScript (Frontend)

Edite `frontend/src/api/relatorio1.ts` ou `relatorio2.ts` para refletir os schemas do backend:

```typescript
export interface Relatorio1Row {
  sku?: string | null;
  nome_produto: string;
  quantidade: number;
  valor_total: number;
}

export interface Relatorio1Summary {
  total_itens: number;
  valor_total_geral: number;
}
```

### Passo 4: Customizar a Página (Frontend)

Edite `frontend/src/pages/Relatorio1Page.tsx` ou `Relatorio2Page.tsx`:

1. **Customizar labels do FileUpload**:
```tsx
<FileUpload 
  onGenerate={handleGenerate} 
  loading={loading}
  file1Label="Planilha de Vendas"
  file2Label="Planilha de Produtos"
  buttonText="Gerar Relatório 1"
/>
```

2. **Adicionar componentes de visualização**:
   - Tabelas customizadas
   - Gráficos
   - Filtros específicos
   - Cards de resumo

3. **Reutilizar componentes existentes** (se aplicável):
   - `DashboardTable` (pode ser adaptado)
   - `SummaryCards` (pode ser adaptado)
   - `ExportButton` (pode ser reutilizado)

## 📝 Exemplo de Implementação Completa

### Backend - Service
```python
def build_relatorio1(file1_bytes: bytes, file2_bytes: bytes) -> dict:
    # Ler planilhas
    vendas = pd.read_excel(file1_bytes, header=0, engine="openpyxl")
    produtos = pd.read_excel(file2_bytes, header=0, engine="openpyxl")
    
    # Normalizar SKUs
    vendas["__sku"] = vendas["SKU"].apply(norm_sku)
    produtos["__sku"] = produtos["Código"].apply(norm_sku)
    
    # Merge
    merged = vendas.merge(produtos[["__sku", "Custo"]], on="__sku", how="left")
    
    # Processar
    rows = []
    for _, r in merged.iterrows():
        rows.append({
            "sku": safe_str(r.get("__sku")),
            "nome": safe_str(r.get("Produto")),
            "quantidade": int(r.get("Quantidade", 0)),
            "valor": float(r.get("Valor", 0)),
            "custo": float(r.get("Custo", 0)),
        })
    
    return {
        "rows": rows,
        "summary": {
            "total_itens": len(rows),
            "valor_total": sum(r["valor"] for r in rows),
        }
    }
```

### Frontend - Página
```tsx
export const Relatorio1Page: React.FC = () => {
  const [data, setData] = useState<Relatorio1Response | null>(null);
  
  // ... handlers
  
  return (
    <Content>
      <FileUpload 
        file1Label="Planilha de Vendas"
        file2Label="Planilha de Produtos"
        buttonText="Gerar Relatório"
        onGenerate={handleGenerate}
        loading={loading}
      />
      
      {data && (
        <>
          <SummaryCards summary={data.summary} />
          <Table dataSource={data.rows} />
        </>
      )}
    </Content>
  );
};
```

## ✅ Checklist de Implementação

- [ ] Definir schemas no backend (`schemas/relatorio*.py`)
- [ ] Implementar lógica de processamento (`services/relatorio*_service.py`)
- [ ] Atualizar tipos TypeScript (`api/relatorio*.ts`)
- [ ] Customizar página do frontend (`pages/Relatorio*Page.tsx`)
- [ ] Adicionar componentes de visualização específicos
- [ ] Testar upload e processamento
- [ ] Testar exibição dos dados
- [ ] Adicionar filtros/busca se necessário
- [ ] Adicionar exportação se necessário

## 🔄 Reutilização de Componentes

Muitos componentes do Dashboard podem ser reutilizados ou adaptados:

- **FileUpload**: ✅ Já genérico
- **DashboardTable**: Pode ser adaptado para diferentes estruturas
- **SummaryCards**: Pode ser customizado com diferentes métricas
- **ExportButton**: ✅ Pode ser reutilizado diretamente
- **Filtros**: Podem ser criados específicos para cada relatório

## 📚 Próximos Passos

1. Definir os requisitos específicos de cada relatório
2. Implementar a lógica de cruzamento de dados
3. Criar componentes de visualização específicos
4. Adicionar filtros e funcionalidades conforme necessário
