import { type OrderItem, type OrderStatus, useOrders, useTenants } from '@repo/api';
import { MetricCard, PageContainer, StatusBadge } from '@repo/ui';
import { formatCurrency } from '@repo/utils';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const ORDER_STATUS_MAP: Record<OrderStatus, { color: string; text: string }> = {
  PENDING: { color: 'orange', text: '待支付' },
  PAID: { color: 'green', text: '已支付' },
  CANCELLED: { color: 'default', text: '已取消' },
};

export function PlatformDashboardPage() {
  const { data: tenants = [], isLoading: tenantsLoading } = useTenants();
  const { data: orderData, isLoading: ordersLoading } = useOrders({ page: 1, pageSize: 5 });

  const totalGmv = tenants.reduce((sum, item) => sum + item.monthlyGmv, 0);
  const activeCount = tenants.filter((item) => item.status === 'ACTIVE').length;
  const pendingReviewCount = tenants.filter((item) => item.status === 'PENDING_REVIEW').length;

  const columns: ColumnsType<OrderItem> = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: '所属租户', dataIndex: 'tenantName', key: 'tenantName' },
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
        const badge = ORDER_STATUS_MAP[status];
        return <StatusBadge color={badge.color} label={badge.text} />;
      },
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  ];

  return (
    <PageContainer
      title="平台运营大盘"
      subtitle="全局监控所有入驻商家、待审租户与跨租户交易流水（来自 @repo/api 共享数据层）"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="全平台本月 GMV"
          value={formatCurrency(totalGmv)}
          hint="汇总自全量活跃租户月度流水"
          accentColor="#1677ff"
        />
        <MetricCard
          title="已激活租户数"
          value={tenantsLoading ? '...' : activeCount}
          hint={`总入驻租户 ${tenants.length} 家`}
          accentColor="#059669"
        />
        <MetricCard
          title="待审核入驻租户"
          value={tenantsLoading ? '...' : pendingReviewCount}
          hint="需运营人员在租户管理页审批"
          accentColor="#fa8c16"
        />
        <MetricCard
          title="全平台累计订单"
          value={ordersLoading ? '...' : (orderData?.total ?? 0)}
          hint="跨商家实时交易单量"
          accentColor="#7c3aed"
        />
      </div>

      <div className="mb-3 text-sm font-semibold text-gray-800">最近跨租户订单动态</div>
      <Table
        rowKey="id"
        size="small"
        loading={ordersLoading}
        columns={columns}
        dataSource={orderData?.list ?? []}
        pagination={false}
      />
    </PageContainer>
  );
}
