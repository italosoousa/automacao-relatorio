// /frontend/src/components/MissingSkusDrawer.tsx
import React, { useMemo, useState } from 'react'
import { Drawer, Table, Input, Button, Space, message, Tooltip } from 'antd'
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { MissingSkuItem } from '@/api/dashboard'

interface MissingSkusDrawerProps {
  open: boolean
  onClose: () => void
  items: MissingSkuItem[]
}

const columns: ColumnsType<MissingSkuItem> = [
  {
    title: 'SKU',
    dataIndex: 'sku',
    key: 'sku',
    sorter: (a, b) => (a.sku || '').localeCompare(b.sku || ''),
    render: (val: string | null) => {
      if (!val || val.trim() === '') {
        return <span style={{ color: '#ff4d4f', fontStyle: 'italic' }}>Sem SKU</span>;
      }
      return val;
    },
  },
  {
    title: 'Descrição do Anúncio (ML)',
    dataIndex: 'descricao',
    key: 'descricao',
    render: (val: unknown) => (typeof val === 'string' && val.trim() ? val : '—'),
  },
  {
    title: 'Estado',
    dataIndex: 'estado',
    key: 'estado',
    render: (val: unknown) => (typeof val === 'string' && val.trim() ? val : '—'),
  },
]

// Escapa um campo para CSV (aspas duplas duplicadas)
function csvEscape(value: unknown): string {
  const s = value == null ? '' : String(value)
  return `"${s.replace(/"/g, '""')}"`
}

export const MissingSkusDrawer: React.FC<MissingSkusDrawerProps> = ({
  open,
  onClose,
  items,
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items
    const q = searchTerm.toLowerCase()

    return items.filter((item) => {
      const sku = (item.sku || '').toLowerCase()
      const desc = (item.descricao || '').toLowerCase()
      return sku.includes(q) || desc.includes(q)
    })
  }, [items, searchTerm])

  const handleCopy = async () => {
    try {
      const skuList = filteredItems
        .map((item) => item.sku || 'SEM_SKU')
        .join('\n')

      await navigator.clipboard.writeText(skuList)
      const count = filteredItems.length
      message.success(`${count} ${count === 1 ? 'item copiado' : 'itens copiados'} para a área de transferência!`)
    } catch {
      message.error('Não foi possível copiar. Verifique as permissões do navegador.')
    }
  }

  const handleExportCsv = () => {
    // Cabeçalho
    const header = ['SKU', 'Descricao', 'Estado'].map(csvEscape).join(',') + '\n'

    // Linhas
    const rows = filteredItems
      .map((item) => {
        const sku = item.sku ?? ''
        const descricao = item.descricao ?? ''
        const estado = item.estado ?? ''
        return [sku, descricao, estado].map(csvEscape).join(',')
      })
      .join('\n')

    const csvContent = header + rows + (rows ? '\n' : '')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `skus_sem_cadastro_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
    message.success('CSV exportado com sucesso!')
  }

  return (
    <Drawer
      title="Produtos não identificados"
      open={open}
      onClose={onClose}
      width={900}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Input
          placeholder="Buscar por SKU ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />

        <Space wrap>
          <Tooltip title="Copiar SKUs (um por linha)">
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              Copiar SKUs
            </Button>
          </Tooltip>

          <Tooltip title="Exportar tabela filtrada como CSV">
            <Button icon={<DownloadOutlined />} onClick={handleExportCsv}>
              Exportar CSV
            </Button>
          </Tooltip>

          <span style={{ opacity: 0.8 }}>
            Mostrando <b>{filteredItems.length}</b> de <b>{items.length}</b>
          </span>
        </Space>

        <Table<MissingSkuItem>
          columns={columns}
          dataSource={filteredItems}
          // Evita warning do antd: não usar (record, index)
          rowKey={(record) =>
            `${record.sku ?? 'SEM_SKU'}-${record.estado ?? 'SEM_ESTADO'}-${record.descricao ?? 'SEM_DESC'}`
          }
          pagination={{ pageSize: 15, showSizeChanger: true }}
          bordered
          size="middle"
        />
      </Space>
    </Drawer>
  )
}
