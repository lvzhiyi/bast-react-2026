import { CURRENT_TENANT_ID, CURRENT_TENANT_NAME } from '@/app/constants';
import { PlusOutlined } from '@ant-design/icons';
import {
  type OrderItem,
  type OrderStatus,
  useCreateOrder,
  useOrders,
  useUpdateOrder,
} from '@repo/api';
import { PageContainer, StatusBadge } from '@repo/ui';
import { formatCurrency } from '@repo/utils';
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

const STATUS_MAP: Record<OrderStatus, { color: string; text: string }> = {
  PENDING: { color: 'orange', text: '待支付' },
  PAID: { color: 'green', text: '已支付' },
  CANCELLED: { color: 'default', text: '已取消' },
};

interface MerchantOrderFormValues {
  customerName: string;
  amount: number;
  remark?: string;
}

export function MerchantOrderPage() {
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm<MerchantOrderFormValues>();

  const { data, isLoading } = useOrders({
    page,
    pageSize,
    keyword,
    status: statusFilter,
    tenantId: CURRENT_TENANT_ID,
  });

  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();

  const handleConfirmPaid = async (record: OrderItem) => {
    await updateMutation.mutateAsync({ id: record.id, status: 'PAID' });
    message.success(`订单 ${record.orderNo} 已确认收款`);
  };

  const handleCancelOrder = async (record: OrderItem) => {
    await updateMutation.mutateAsync({ id: record.id, status: 'CANCELLED' });
    message.success(`订单 ${record.orderNo} 已取消`);
  };

  const handleCreateSubmit = async () => {
    const values = await form.validateFields();
    await createMutation.mutateAsync({
      tenantId: CURRENT_TENANT_ID,
      tenantName: CURRENT_TENANT_NAME,
      customerName: values.customerName,
      amount: values.amount,
      status: 'PENDING',
      remark: values.remark,
    });
    message.success('本店订单已创建');
    form.resetFields();
    setCreateOpen(false);
  };

  const columns: ColumnsType<OrderItem> = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
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
      title: '商家操作',
      key: 'action',
      width: 180,
      render: (_, record) =>
        record.status === 'PENDING' ? (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              loading={updateMutation.isPending}
              onClick={() => handleConfirmPaid(record)}
            >
              确认收款
            </Button>
            <Popconfirm
              title="确认取消该订单？"
              okText="确认"
              cancelText="再想想"
              onConfirm={() => handleCancelOrder(record)}
            >
              <Button type="link" size="small" danger>
                取消订单
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          <span className="text-xs text-gray-400">已归档</span>
        ),
    },
  ];

  return (
    <PageContainer
      title="本店订单履约"
      subtitle={`仅展示 ${CURRENT_TENANT_NAME} 的交易订单，支持核销收款与代客录单`}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.setFieldsValue({ amount: 5000 });
            setCreateOpen(true);
          }}
        >
          新建本店订单
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input.Search
          placeholder="搜索订单号或客户名称..."
          allowClear
          style={{ width: 260 }}
          onSearch={(val) => {
            setPage(1);
            setKeyword(val);
          }}
        />
        <Select
          allowClear
          placeholder="按状态筛选"
          style={{ width: 150 }}
          value={statusFilter}
          onChange={(val) => {
            setPage(1);
            setStatusFilter(val);
          }}
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
          showTotal: (total) => `共 ${total} 条本店订单`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      <Modal
        title="新建本店订单"
        open={createOpen}
        confirmLoading={createMutation.isPending}
        onOk={handleCreateSubmit}
        onCancel={() => setCreateOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="客户名称"
            name="customerName"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder="例如：浦东新区科创中心" />
          </Form.Item>
          <Form.Item
            label="订单金额 (CNY)"
            name="amount"
            rules={[{ required: true, message: '请输入订单金额' }]}
          >
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="备注说明" name="remark">
            <Input.TextArea rows={3} placeholder="选填：输入采购需求或交付备注" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
