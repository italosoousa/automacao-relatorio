// /frontend/src/pages/Relatorio2Page.tsx
import React, { useState } from 'react';
import { Layout, Typography, Alert, Spin, Result, Space } from 'antd';
import { FileUpload } from '../components/FileUpload';
import { getRelatorio2Preview, Relatorio2Response } from '../api/relatorio2';

const { Content } = Layout;
const { Title } = Typography;

export const Relatorio2Page: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Relatorio2Response | null>(null);

  const handleGenerate = async (file1: File, file2: File) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await getRelatorio2Preview(file1, file2);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Content style={{ padding: '16px', maxWidth: '100%', overflowX: 'auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2} style={{ margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.75rem)' }}>
          📋 Relatório 2
        </Title>

        <FileUpload 
          onGenerate={handleGenerate} 
          loading={loading}
          file1Label="Planilha 1"
          file2Label="Planilha 2"
          buttonText="Gerar Relatório 2"
        />

        {error && (
          <Alert
            message="Erro ao Gerar Relatório"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {loading && <Spin spinning tip="Processando planilhas..." fullscreen />}

        {!loading && !error && !data && (
          <Result
            icon={<Typography.Text style={{ fontSize: 48 }}>📋</Typography.Text>}
            title="Aguardando arquivos"
            subTitle="Por favor, faça o upload das duas planilhas e clique em 'Gerar Relatório 2' para começar."
          />
        )}

        {data && (
          <Alert
            message="Relatório gerado com sucesso"
            description={`Total de itens: ${data.summary.total_itens}`}
            type="success"
            showIcon
          />
        )}
      </Space>
    </Content>
  );
};
