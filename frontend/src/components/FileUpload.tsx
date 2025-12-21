// /frontend/src/components/FileUpload.tsx
import React, { useState } from 'react';
import { Button, Card, Col, Row, Upload, message, Divider } from 'antd';
import { InboxOutlined, RocketOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Dragger } = Upload;

interface FileUploadProps {
  onGenerate: (mlFile: File, baseFile: File) => void;
  loading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onGenerate, loading }) => {
  const [mlFileList, setMlFileList] = useState<UploadFile[]>([]);
  const [baseFileList, setBaseFileList] = useState<UploadFile[]>([]);

  const handleGenerateClick = () => {
    if (mlFileList.length === 0 || baseFileList.length === 0) {
      message.error('Por favor, selecione ambos os arquivos antes de gerar o dashboard.');
      return;
    }

    const mlFile = mlFileList[0]?.originFileObj as File;
    const baseFile = baseFileList[0]?.originFileObj as File;

    if (mlFile && baseFile) {
      onGenerate(mlFile, baseFile);
    }
  };

  const commonDraggerProps: UploadProps = {
    accept: '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
    multiple: false,
    beforeUpload: () => false,
    listType: 'text',
    showUploadList: {
      showRemoveIcon: true,
    },
  };

  return (
    <Card title="Upload de Planilhas">
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <Dragger
              {...commonDraggerProps}
              onChange={({ fileList }) => setMlFileList(fileList.slice(-1))}
              fileList={mlFileList}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Planilha do Mercado Livre</p>
              <p className="ant-upload-hint">Clique ou arraste o arquivo (.xlsx, .csv)</p>
            </Dragger>
          </div>
        </Col>

        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <Dragger
              {...commonDraggerProps}
              onChange={({ fileList }) => setBaseFileList(fileList.slice(-1))}
              fileList={baseFileList}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Planilha Base de Produtos</p>
              <p className="ant-upload-hint">Clique ou arraste o arquivo (.xlsx, .csv)</p>
            </Dragger>
          </div>
        </Col>
      </Row>

      {/* Espaço visual fixo antes da ação */}
      <Divider style={{ margin: '32px 0' }} />

      {/* Área de ação isolada */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="primary"
          icon={<RocketOutlined />}
          onClick={handleGenerateClick}
          loading={loading}
          disabled={mlFileList.length === 0 || baseFileList.length === 0}
          size="large"
        >
          Gerar Dashboard
        </Button>
      </div>
    </Card>
  );
};
