import { CURRENT_TENANT_ID, CURRENT_TENANT_NAME } from '@/app/constants';
import { type OrderItem, type OrderStatus, useOrders, useProducts } from '@repo/api';
import { MetricCard, PageContainer, StatusBadge } from '@repo/ui';
import { formatCurrency } from '@repo/utils';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const ORDER_STATUS_MAP: Record<OrderStatus, { color: string; text: string }> = {
  PENDING: { color: 'orange', text: '待支付' },
  PAID: { color: 'green', text: '已支付' },
  CANCELLED: { color: 'default', text: '已取消' },
};

export function MerchantDashboardPage() {
  const { data: orderData, isLoading: ordersLoading } = useOrders({
    page: 1,
    pageSize: 20,
    tenantId: CURRENT_TENANT_ID,
  });
  const { data: products = [], isLoading: productsLoading } = useProducts({
    tenantId: CURRENT_TENANT_ID,
  });

  const orders = orderData?.list ?? [];
  const paidRevenue = orders
    .filter((item) => item.status === 'PAID')
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingOrdersCount = orders.filter((item) => item.status === 'PENDING').length;
  const activeProductsCount = products.filter((item) => item.status === 'ON_SALE').length;
  const lowStockCount = products.filter(
    (item) => item.status === 'ON_SALE' && item.stock <= 10,
  ).length;

  const columns: ColumnsType<OrderItem> = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
    { title: '采购客户', dataIndex: 'customerName', key: 'customerName' },
    {
      title: '金额',
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
      title={`${CURRENT_TENANT_NAME} · 店铺经营概览`}
      subtitle="数据严格按当前商家租户隔离，独立打包与发版"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="已实收营业额"
          value={ordersLoading ? '...' : formatCurrency(paidRevenue)}
          hint="仅统计本店已支付订单"
          accentColor="#059669"
        />
        <MetricCard
          title="待处理收款订单"
          value={ordersLoading ? '...' : pendingOrdersCount}
          hint="请及时在订单页核对打款"
          accentColor="#fa8c16"
        />
        <MetricCard
          title="在售套餐/商品"
          value={productsLoading ? '...' : activeProductsCount}
          hint={`店铺共维护 ${products.length} 个 SKU`}
          accentColor="#1677ff"
        />
        <MetricCard
          title="低库存预警 (<=10)"
          value={productsLoading ? '...' : lowStockCount}
          hint="关注即将售罄的服务名额"
          accentColor="#dc2626"
        />
      </div>

      <div className="mb-3 text-sm font-semibold text-gray-800">本店近期订单</div>
      <Table
        rowKey="id"
        size="small"
        loading={ordersLoading}
        columns={columns}
        dataSource={orders.slice(0, 5)}
        pagination={false}
      />
    </PageContainer>
  );
}
