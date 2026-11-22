import { CURRENT_TENANT_ID } from '@/app/constants';
import { PlusOutlined } from '@ant-design/icons';
import {
  type CreateProductPayload,
  type ProductItem,
  type ProductStatus,
  useCreateProduct,
  useProducts,
  useToggleProductStatus,
} from '@repo/api';
import { PageContainer, StatusBadge } from '@repo/ui';
import { formatCurrency } from '@repo/utils';
import { App, Button, Input, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { ProductFormModal } from './ProductFormModal';

const PRODUCT_STATUS_MAP: Record<ProductStatus, { color: string; text: string }> = {
  ON_SALE: { color: 'green', text: '在售中' },
  OFF_SHELF: { color: 'default', text: '已下架' },
};

export function ProductListPage() {
  const { message } = App.useApp();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: products = [], isLoading } = useProducts({
    tenantId: CURRENT_TENANT_ID,
    keyword,
    status: statusFilter,
  });

  const createMutation = useCreateProduct();
  const toggleMutation = useToggleProductStatus();

  const handleToggle = async (record: ProductItem) => {
    const updated = await toggleMutation.mutateAsync(record.id);
    message.success(`${record.name} 已${updated.status === 'ON_SALE' ? '上架销售' : '下架停售'}`);
  };

  const handleCreate = async (values: CreateProductPayload) => {
    await createMutation.mutateAsync(values);
    message.success('商品创建成功');
    setModalOpen(false);
  };

  const columns: ColumnsType<ProductItem> = [
    { title: 'SKU 编码', dataIndex: 'sku', key: 'sku', width: 140 },
    { title: '商品 / 套餐名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category', key: 'category', width: 120 },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (val: number) => <span className="font-medium">{formatCurrency(val)}</span>,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 90,
      align: 'right',
      render: (stock: number) => (
        <span className={stock <= 10 ? 'text-red-600 font-semibold' : ''}>{stock}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ProductStatus) => {
        const item = PRODUCT_STATUS_MAP[status];
        return <StatusBadge color={item.color} label={item.text} />;
      },
    },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          loading={toggleMutation.isPending}
          onClick={() => handleToggle(record)}
        >
          {record.status === 'ON_SALE' ? '下架' : '上架'}
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title="商品与套餐管理"
      subtitle="商家独立维护本店在售 SaaS 套餐与增值服务 SKU"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          新增商品
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input.Search
          placeholder="搜索商品名称或 SKU..."
          allowClear
          style={{ width: 260 }}
          onSearch={(val) => setKeyword(val)}
        />
        <Select
          allowClear
          placeholder="按状态筛选"
          style={{ width: 140 }}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { label: '在售中', value: 'ON_SALE' },
            { label: '已下架', value: 'OFF_SHELF' },
          ]}
        />
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={products}
        pagination={false}
      />

      <ProductFormModal
        open={modalOpen}
        confirmLoading={createMutation.isPending}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </PageContainer>
  );
}
