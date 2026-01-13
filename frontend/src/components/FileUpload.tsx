// /frontend/src/components/FileUpload.tsx
import React, { useState } from 'react';
import { Button, Card, Col, Row, Upload, message, Divider } from 'antd';
import { InboxOutlined, RocketOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Dragger } = Upload;

interface FileUploadProps {
  onGenerate: (file1: File, file2: File) => void;
  loading: boolean;
  file1Label?: string;
  file2Label?: string;
  buttonText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onGenerate, 
  loading,
  file1Label = "Planilha 1",
  file2Label = "Planilha 2",
  buttonText = "Gerar Relatório"
}) => {
  const [file1List, setFile1List] = useState<UploadFile[]>([]);
  const [file2List, setFile2List] = useState<UploadFile[]>([]);

  const handleGenerateClick = () => {
    if (file1List.length === 0 || file2List.length === 0) {
      message.error('Por favor, selecione ambos os arquivos antes de gerar o relatório.');
      return;
    }

    const file1 = file1List[0]?.originFileObj as File;
    const file2 = file2List[0]?.originFileObj as File;

    if (file1 && file2) {
      onGenerate(file1, file2);
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
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12}>
          <div style={{ marginBottom: 16 }}>
            <Dragger
              {...commonDraggerProps}
              onChange={({ fileList }) => setFile1List(fileList.slice(-1))}
              fileList={file1List}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{file1Label}</p>
              <p className="ant-upload-hint">Clique ou arraste o arquivo (.xlsx, .csv)</p>
            </Dragger>
          </div>
        </Col>

        <Col xs={24} sm={24} md={12}>
          <div style={{ marginBottom: 16 }}>
            <Dragger
              {...commonDraggerProps}
              onChange={({ fileList }) => setFile2List(fileList.slice(-1))}
              fileList={file2List}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{file2Label}</p>
              <p className="ant-upload-hint">Clique ou arraste o arquivo (.xlsx, .csv)</p>
            </Dragger>
          </div>
        </Col>
      </Row>

      <Divider style={{ margin: '24px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Button
          type="primary"
          icon={<RocketOutlined />}
          onClick={handleGenerateClick}
          loading={loading}
          disabled={file1List.length === 0 || file2List.length === 0}
          size="large"
          block
          style={{ maxWidth: '400px' }}
        >
          {buttonText}
        </Button>
      </div>
    </Card>
  );
};
