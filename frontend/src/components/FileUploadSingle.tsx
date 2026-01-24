// /frontend/src/components/FileUploadSingle.tsx
import React, { useState } from 'react';
import { Button, Card, Upload, message } from 'antd';
import { InboxOutlined, RocketOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Dragger } = Upload;

interface FileUploadSingleProps {
  onGenerate: (file: File) => void;
  loading: boolean;
  fileLabel?: string;
  buttonText?: string;
  accept?: string;
}

export const FileUploadSingle: React.FC<FileUploadSingleProps> = ({ 
  onGenerate, 
  loading,
  fileLabel = "Planilha",
  buttonText = "Gerar Relatório",
  accept = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleGenerateClick = () => {
    if (fileList.length === 0) {
      message.error('Por favor, selecione o arquivo antes de gerar o relatório.');
      return;
    }

    const file = fileList[0]?.originFileObj as File;

    if (file) {
      onGenerate(file);
    }
  };

  const draggerProps: UploadProps = {
    accept,
    multiple: false,
    beforeUpload: () => false,
    listType: 'text',
    showUploadList: {
      showRemoveIcon: true,
    },
    onChange: ({ fileList }) => setFileList(fileList.slice(-1)),
    fileList,
  };

  return (
    <Card title="Upload de Planilha">
      <div style={{ marginBottom: 16 }}>
        <Dragger {...draggerProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{fileLabel}</p>
          <p className="ant-upload-hint">Clique ou arraste o arquivo (.xlsx, .csv)</p>
        </Dragger>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Button
          type="primary"
          icon={<RocketOutlined />}
          onClick={handleGenerateClick}
          loading={loading}
          disabled={fileList.length === 0}
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
