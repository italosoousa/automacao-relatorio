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

      const resp = await axios.post(`${API_BASE_URL}/api/products/import-from-excel`, form, {
        timeout: 0,
      });

      const data = resp.data;

      notification.success({
        message: 'Atualização de preços concluída',
        description: `${data.alterados ?? 0} alterados, ${data.corretos ?? 0} já estavam corretos, ${data.nao_encontrados ?? 0} não encontrados`,
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
            � Atualizar Preços de Produtos
          </Title>
        </div>

        <Card style={{ maxWidth: 920 }}>
          <FileUploadSingle
            onGenerate={handleGenerate}
            loading={loading}
            fileLabel="Planilha de Preços (Coluna A: Código de Barras, Coluna B: Preço)"
            buttonText="Atualizar Preços"
          />
        </Card>

        {result && result.success === false && (
          <div style={{ marginTop: 16, maxWidth: 920 }}>
            <Alert
              type="error"
              message="Erro ao atualizar preços"
              description={
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(result.detail || result.data, null, 2)}</pre>
              }
            />
          </div>
        )}

        {loading && <Spin spinning tip="Atualizando preços..." />}

        {!loading && !result && (
          <Result
            icon={<Title style={{ fontSize: 48 }}>💰</Title>}
            title="Aguardando planilha"
            subTitle="Faça o upload da planilha com os preços (código de barras na coluna A e preço na coluna B) e clique em 'Atualizar Preços'."
          />
        )}

        {result && result.success === true && (
          <div style={{ marginTop: 16, maxWidth: 920 }}>
            <Card title="Resumo da Atualização">
              <div>Total processados: {result.data?.total_processados ?? '-'}</div>
              <div style={{ color: '#52c41a', fontWeight: 'bold' }}>✅ Alterados: {result.data?.alterados ?? 0}</div>
              <div style={{ color: '#1890ff', fontWeight: 'bold' }}>ℹ️ Já estavam corretos: {result.data?.corretos ?? 0}</div>
              <div style={{ color: '#faad14', fontWeight: 'bold' }}>⚠️ Não encontrados: {result.data?.nao_encontrados ?? 0}</div>
            </Card>
          </div>
        )}
      </Space>
    </Content>
  );
};

export default ProductsImportPage;
