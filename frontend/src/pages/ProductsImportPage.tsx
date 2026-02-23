import React, { useState } from 'react';
import { Layout, Typography, Alert, notification, Card, Space, Result, Spin } from 'antd';
import axios from 'axios';
import { FileUploadSingle } from '../components/FileUploadSingle';
import { BStoriesThemeTokens } from '../theme/bstories-tokens';

// normalizeApiUrl replicated from dashboard API helper
const isProduction = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    hostname.includes('vercel.app') ||
    hostname.includes('netlify.app') ||
    import.meta.env.PROD ||
    (hostname !== 'localhost' && hostname !== '127.0.0.1')
  );
};

const normalizeApiUrl = (url: string | undefined): string => {
  const envUrl = url || import.meta.env.VITE_API_BASE_URL;

  if (envUrl) {
    let normalizedUrl = envUrl.trim().replace(/\/+$/, '');
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    return normalizedUrl;
  }

  if (isProduction()) {
    return 'https://automacao-relatorio-production.up.railway.app';
  }

  return 'http://127.0.0.1:8000';
};

const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_BASE_URL);

const { Content } = Layout;
const { Title } = Typography;

export const ProductsImportPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleGenerate = async (file: File) => {
    setLoading(true);
    setResult(null);

    try {
      const form = new FormData();
      form.append('file', file);

      const resp = await axios.post(`${API_BASE_URL}/api/products/import-from-excel?update_existing=true`, form, {
        timeout: 120000,
      });

      const data = resp.data;

      notification.success({
        message: 'Importação concluída',
        description: `${data.created ?? 0} criados, ${data.updated ?? 0} atualizados, ${data.skipped ?? 0} ignorados`,
      });
      setResult({ success: true, data });
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || String(err);
      notification.error({
        message: 'Erro ao importar planilha',
        description: String(detail),
      });
      setResult({ success: false, detail: err?.response?.data || detail });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Content style={{ padding: '16px', maxWidth: '100%', overflowX: 'auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Title level={2} style={{ margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.75rem)', color: BStoriesThemeTokens.primary }}>
            📥 Importar / Atualizar Produtos
          </Title>
        </div>

        <Card style={{ maxWidth: 920 }}>
          <FileUploadSingle
            onGenerate={handleGenerate}
            loading={loading}
            fileLabel="Planilha de Produtos"
            buttonText="Importar e Atualizar"
          />
        </Card>

        {result && result.success === false && (
          <div style={{ marginTop: 16, maxWidth: 920 }}>
            <Alert
              type="error"
              message="Importação retornou erro"
              description={
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(result.detail || result.data, null, 2)}</pre>
              }
            />
          </div>
        )}

        {loading && <Spin spinning tip="Processando importação..." />}

        {!loading && !result && (
          <Result
            icon={<Title style={{ fontSize: 48 }}>📥</Title>}
            title="Aguardando planilha"
            subTitle="Faça o upload da planilha de produtos e clique em 'Importar e Atualizar' para sincronizar com o banco de dados."
          />
        )}

        {result && result.success === true && (
          <div style={{ marginTop: 16, maxWidth: 920 }}>
            <Card title="Resumo da Importação">
              <div>Linhas processadas: {result.data?.total_rows ?? '-'}</div>
              <div>Criados: {result.data?.created ?? 0}</div>
              <div>Atualizados: {result.data?.updated ?? 0}</div>
              <div>Ignorados: {result.data?.skipped ?? 0}</div>
              {result.data?.errors && (
                <div style={{ marginTop: 12 }}>
                  <strong>Erros:</strong>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result.data.errors, null, 2)}</pre>
                </div>
              )}
            </Card>
          </div>
        )}
      </Space>
    </Content>
  );
};

export default ProductsImportPage;
