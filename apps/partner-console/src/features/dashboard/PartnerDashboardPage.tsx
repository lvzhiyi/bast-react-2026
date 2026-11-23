import { CURRENT_PARTNER_ID, CURRENT_PARTNER_NAME } from '@/shared/constants';
import { type SettlementItem, type SettlementStatus, useSettlements, useTenants } from '@repo/api';
import { MetricCard, PageContainer, StatusBadge } from '@repo/ui';
import { formatCurrency, formatPercent } from '@repo/utils';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const SETTLEMENT_STATUS_MAP: Record<SettlementStatus, { color: string; text: string }> = {
  PENDING: { color: 'orange', text: '打款审核中' },
  PAID: { color: 'green', text: '已打款' },
};

export function PartnerDashboardPage() {
  const { data: referrals = [], isLoading: referralsLoading } = useTenants({
    partnerId: CURRENT_PARTNER_ID,
  });
  const { data: settlements = [], isLoading: settlementsLoading } = useSettlements({
    partnerId: CURRENT_PARTNER_ID,
  });

  const referredGmv = referrals.reduce((sum, item) => sum + item.monthlyGmv, 0);
  const settledCommission = settlements
    .filter((item) => item.status === 'PAID')
    .reduce((sum, item) => sum + item.commissionAmount, 0);
  const pendingCommission = settlements
    .filter((item) => item.status === 'PENDING')
    .reduce((sum, item) => sum + item.commissionAmount, 0);

  const columns: ColumnsType<SettlementItem> = [
    { title: '结算单号', dataIndex: 'settlementNo', key: 'settlementNo', width: 150 },
    { title: '结算周期', dataIndex: 'period', key: 'period' },
    {
      title: '计佣 GMV',
      dataIndex: 'grossGmv',
      key: 'grossGmv',
      align: 'right',
      render: (val: number) => formatCurrency(val),
    },
    {
      title: '平均佣金率',
      dataIndex: 'commissionRate',
      key: 'commissionRate',
      width: 110,
      render: (rate: number) => formatPercent(rate, 0),
    },
    {
      title: '应结佣金',
      dataIndex: 'commissionAmount',
      key: 'commissionAmount',
      align: 'right',
      render: (val: number) => (
        <span className="font-semibold text-purple-700">{formatCurrency(val)}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: SettlementStatus) => {
        const item = SETTLEMENT_STATUS_MAP[status];
        return <StatusBadge color={item.color} label={item.text} />;
      },
    },
  ];

  return (
    <PageContainer
      title={`${CURRENT_PARTNER_NAME} · 渠道收益大盘`}
      subtitle="按代理商维度聚合名下商户业绩与返佣结算进度（严禁触达平台全局风控数据）"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="名下推广商户"
          value={referralsLoading ? '...' : referrals.length}
          hint={`其中已激活 ${referrals.filter((t) => t.status === 'ACTIVE').length} 家`}
          accentColor="#7c3aed"
        />
        <MetricCard
          title="名下商户本月 GMV"
          value={referralsLoading ? '...' : formatCurrency(referredGmv)}
          hint="所有签约推广商户当月流水汇总"
          accentColor="#1677ff"
        />
        <MetricCard
          title="累计已打款佣金"
          value={settlementsLoading ? '...' : formatCurrency(settledCommission)}
          hint="历史已完成银行对公打款"
          accentColor="#059669"
        />
        <MetricCard
          title="待结算佣金"
          value={settlementsLoading ? '...' : formatCurrency(pendingCommission)}
          hint="待平台财务复核放款"
          accentColor="#fa8c16"
        />
      </div>

      <div className="mb-3 text-sm font-semibold text-gray-800">近期分佣结算流水</div>
      <Table
        rowKey="id"
        size="small"
        loading={settlementsLoading}
        columns={columns}
        dataSource={settlements.slice(0, 5)}
        pagination={false}
      />
    </PageContainer>
  );
}
