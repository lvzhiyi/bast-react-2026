import { CURRENT_PARTNER_ID } from '@/app/constants';
import { PlusOutlined } from '@ant-design/icons';
import {
  type SettlementItem,
  type SettlementStatus,
  useCreateSettlement,
  useSettlements,
} from '@repo/api';
import { PageContainer, StatusBadge } from '@repo/ui';
import { formatCurrency, formatPercent } from '@repo/utils';
import { getRouteApi } from '@tanstack/react-router';
import { App, Button, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const settlementsRouteApi = getRouteApi('/settlements');

const SETTLEMENT_STATUS_MAP: Record<SettlementStatus, { color: string; text: string }> = {
  PENDING: { color: 'orange', text: '打款审核中' },
  PAID: { color: 'green', text: '已打款' },
};

export function SettlementListPage() {
  const { message } = App.useApp();
  const search = settlementsRouteApi.useSearch();
  const navigate = settlementsRouteApi.useNavigate();

  const { data: settlements = [], isLoading } = useSettlements({
    partnerId: CURRENT_PARTNER_ID,
    status: search.status,
  });

  const createMutation = useCreateSettlement();

  const handleApplySettlement = async () => {
    const created = await createMutation.mutateAsync({
      partnerId: CURRENT_PARTNER_ID,
    });
    message.success(
      `已提交结算申请 ${created.settlementNo}（预计佣金 ${formatCurrency(created.commissionAmount)}）`,
    );
  };

  const columns: ColumnsType<SettlementItem> = [
    { title: '结算单号', dataIndex: 'settlementNo', key: 'settlementNo', width: 150 },
    { title: '结算周期', dataIndex: 'period', key: 'period', width: 160 },
    { title: '有效商户数', dataIndex: 'referralCount', key: 'referralCount', width: 110 },
    {
      title: '计佣总 GMV',
      dataIndex: 'grossGmv',
      key: 'grossGmv',
      align: 'right',
      render: (val: number) => formatCurrency(val),
    },
    {
      title: '综合分佣率',
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
      title: '结算状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: SettlementStatus) => {
        const item = SETTLEMENT_STATUS_MAP[status];
        return <StatusBadge color={item.color} label={item.text} />;
      },
    },
    { title: '申请时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  ];

  return (
    <PageContainer
      title="分佣结算管理"
      subtitle="查看历史分佣打款记录，并基于当前名下活跃商户 GMV 一键发起本期结算申请"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          loading={createMutation.isPending}
          onClick={handleApplySettlement}
        >
          申请本期结算
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select
          allowClear
          placeholder="按结算状态筛选"
          style={{ width: 160 }}
          value={search.status}
          onChange={(val) =>
            navigate({
              search: (prev) => ({ ...prev, status: val }),
            })
          }
          options={[
            { label: '打款审核中', value: 'PENDING' },
            { label: '已打款', value: 'PAID' },
          ]}
        />
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={settlements}
        pagination={false}
      />
    </PageContainer>
  );
}
