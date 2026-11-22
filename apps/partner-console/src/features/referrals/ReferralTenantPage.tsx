import { CURRENT_PARTNER_ID } from '@/app/constants';
import { type TenantItem, type TenantPlan, type TenantStatus, useTenants } from '@repo/api';
import { PageContainer, StatusBadge } from '@repo/ui';
import { formatCurrency, formatPercent } from '@repo/utils';
import { getRouteApi } from '@tanstack/react-router';
import { Input, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

const referralsRouteApi = getRouteApi('/referrals');

const TENANT_STATUS_MAP: Record<TenantStatus, { color: string; text: string }> = {
  ACTIVE: { color: 'green', text: '运营中' },
  PENDING_REVIEW: { color: 'orange', text: '待平台审核' },
  SUSPENDED: { color: 'red', text: '已冻结' },
};

const PLAN_MAP: Record<TenantPlan, { color: string; text: string }> = {
  STANDARD: { color: 'default', text: '标准版' },
  PRO: { color: 'blue', text: '专业版' },
  ENTERPRISE: { color: 'purple', text: '企业版' },
};

export function ReferralTenantPage() {
  const search = referralsRouteApi.useSearch();
  const navigate = referralsRouteApi.useNavigate();
  const [keywordInput, setKeywordInput] = useState(search.keyword ?? '');

  useEffect(() => {
    setKeywordInput(search.keyword ?? '');
  }, [search.keyword]);

  const { data: referrals = [], isLoading } = useTenants({
    partnerId: CURRENT_PARTNER_ID,
    keyword: search.keyword,
    status: search.status,
  });

  const columns: ColumnsType<TenantItem> = [
    { title: '商户名称', dataIndex: 'name', key: 'name' },
    {
      title: '签约套餐',
      dataIndex: 'plan',
      key: 'plan',
      width: 110,
      render: (plan: TenantPlan) => {
        const item = PLAN_MAP[plan];
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '审核/运营状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: TenantStatus) => {
        const item = TENANT_STATUS_MAP[status];
        return <StatusBadge color={item.color} label={item.text} />;
      },
    },
    {
      title: '本月 GMV',
      dataIndex: 'monthlyGmv',
      key: 'monthlyGmv',
      align: 'right',
      render: (val: number) => formatCurrency(val),
    },
    {
      title: '签约分佣比',
      dataIndex: 'commissionRate',
      key: 'commissionRate',
      width: 110,
      render: (rate: number) => formatPercent(rate, 0),
    },
    {
      title: '预估本月佣金',
      key: 'estimatedCommission',
      align: 'right',
      render: (_, record) => (
        <span className="font-semibold text-purple-700">
          {formatCurrency(Math.round(record.monthlyGmv * record.commissionRate))}
        </span>
      ),
    },
    { title: '入驻时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  ];

  return (
    <PageContainer title="推广商户明细" subtitle="仅展示由本渠道商推荐入驻的商户及其月度预估分佣">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input.Search
          placeholder="搜索推广商户名称..."
          allowClear
          style={{ width: 260 }}
          value={keywordInput}
          onChange={(e) => {
            const val = e.target.value;
            setKeywordInput(val);
            if (val === '' && search.keyword !== undefined) {
              navigate({
                search: (prev) => ({ ...prev, keyword: undefined }),
              });
            }
          }}
          onSearch={(val) => {
            const normalized = val.trim() || undefined;
            setKeywordInput(normalized ?? '');
            navigate({
              search: (prev) => ({ ...prev, keyword: normalized }),
            });
          }}
        />
        <Select
          allowClear
          placeholder="按状态筛选"
          style={{ width: 160 }}
          value={search.status}
          onChange={(val) =>
            navigate({
              search: (prev) => ({ ...prev, status: val }),
            })
          }
          options={[
            { label: '运营中', value: 'ACTIVE' },
            { label: '待平台审核', value: 'PENDING_REVIEW' },
            { label: '已冻结', value: 'SUSPENDED' },
          ]}
        />
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={referrals}
        pagination={false}
      />
    </PageContainer>
  );
}
