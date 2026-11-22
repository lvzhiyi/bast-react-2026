import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  type CreateOrderPayload,
  type OrderItem,
  type OrderStatus,
  useCreateOrder,
  useDeleteOrder,
  useOrders,
  useTenants,
  useUpdateOrder,
} from '@repo/api';
import { PageContainer, StatusBadge } from '@repo/ui';
import { formatCurrency } from '@repo/utils';
import { getRouteApi } from '@tanstack/react-router';
import { App, Button, Input, Popconfirm, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { OrderFormModal } from './OrderFormModal';

const ordersRouteApi = getRouteApi('/orders');

const STATUS_MAP: Record<OrderStatus, { color: string; text: string }> = {
  PENDING: { color: 'orange', text: '待支付' },
  PAID: { color: 'green', text: '已支付' },
  CANCELLED: { color: 'default', text: '已取消' },
};

export function OrderListPage() {
  const { message } = App.useApp();
  const search = ordersRouteApi.useSearch();
  const navigate = ordersRouteApi.useNavigate();

  const page = search.page ?? 1;
  const pageSize = search.pageSize ?? 10;
  const [keywordInput, setKeywordInput] = useState(search.keyword ?? '');

  useEffect(() => {
    setKeywordInput(search.keyword ?? '');
  }, [search.keyword]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);

  const { data: tenants = [] } = useTenants();
  const { data, isLoading } = useOrders({
    page,
    pageSize,
    keyword: search.keyword,
    status: search.status,
    tenantId: search.tenantId,
  });

  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();
  const deleteMutation = useDeleteOrder();

  const handleOpenCreate = () => {
    setEditingOrder(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (record: OrderItem) => {
    setEditingOrder(record);
    setModalOpen(true);
  };

  const handleFormSubmit = async (values: CreateOrderPayload) => {
    if (editingOrder) {
      await updateMutation.mutateAsync({ ...values, id: editingOrder.id });
      message.success('订单更新成功');
    } else {
      await createMutation.mutateAsync(values);
      message.success('订单创建成功');
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    message.success('订单已删除');
  };

  const columns: ColumnsType<OrderItem> = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: '所属租户', dataIndex: 'tenantName', key: 'tenantName', width: 170 },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
    {
      title: '订单金额',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (val: number) => <span className="font-medium">{formatCurrency(val)}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: OrderStatus) => {
        const item = STATUS_MAP[status];
        return <StatusBadge color={item.color} label={item.text} />;
      },
    },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除该订单？"
            description="删除后数据将无法恢复"
            okText="确认"
            cancelText="取消"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="全平台订单管理"
      subtitle="平台运营可按租户维度检索与干预全网订单"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          新建订单
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input.Search
          placeholder="搜索订单号、租户或客户..."
          allowClear
          style={{ width: 260 }}
          value={keywordInput}
          onChange={(e) => {
            const val = e.target.value;
            setKeywordInput(val);
            if (val === '' && search.keyword !== undefined) {
              navigate({
                search: (prev) => ({ ...prev, page: undefined, keyword: undefined }),
              });
            }
          }}
          onSearch={(val) => {
            const normalized = val.trim() || undefined;
            setKeywordInput(normalized ?? '');
            navigate({
              search: (prev) => ({ ...prev, page: undefined, keyword: normalized }),
            });
          }}
        />
        <Select
          allowClear
          placeholder="按租户筛选"
          style={{ width: 200 }}
          value={search.tenantId}
          onChange={(val) =>
            navigate({
              search: (prev) => ({ ...prev, page: undefined, tenantId: val }),
            })
          }
          options={tenants.map((t) => ({ label: t.name, value: t.id }))}
        />
        <Select
          allowClear
          placeholder="按状态筛选"
          style={{ width: 140 }}
          value={search.status}
          onChange={(val) =>
            navigate({
              search: (prev) => ({ ...prev, page: undefined, status: val }),
            })
          }
          options={[
            { label: '待支付', value: 'PENDING' },
            { label: '已支付', value: 'PAID' },
            { label: '已取消', value: 'CANCELLED' },
          ]}
        />
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.list ?? []}
        pagination={{
          current: page,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条订单`,
          onChange: (p, ps) => {
            navigate({
              search: (prev) => ({
                ...prev,
                page: p > 1 && ps === pageSize ? p : undefined,
                pageSize: ps !== 10 ? ps : undefined,
              }),
            });
          },
        }}
      />

      <OrderFormModal
        open={modalOpen}
        editingOrder={editingOrder}
        tenants={tenants}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </PageContainer>
  );
}
