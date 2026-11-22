import {
  type TenantItem,
  type TenantPlan,
  type TenantStatus,
  useTenants,
  useUpdateTenantStatus,
} from '@repo/api';
import { PageContainer, StatusBadge } from '@repo/ui';
import { formatCurrency, formatPercent } from '@repo/utils';
import { App, Button, Input, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

const STATUS_MAP: Record<TenantStatus, { color: string; text: string }> = {
  ACTIVE: { color: 'green', text: '运营中' },
  PENDING_REVIEW: { color: 'orange', text: '待审核' },
  SUSPENDED: { color: 'red', text: '已冻结' },
};

const PLAN_MAP: Record<TenantPlan, { color: string; text: string }> = {
  STANDARD: { color: 'default', text: '标准版' },
  PRO: { color: 'blue', text: '专业版' },
  ENTERPRISE: { color: 'purple', text: '企业版' },
};

export function TenantListPage() {
  const { message } = App.useApp();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenantStatus | undefined>();

  const { data: tenants = [], isLoading } = useTenants({ keyword, status: statusFilter });
  const updateStatusMutation = useUpdateTenantStatus();

  const handleStatusChange = async (record: TenantItem, nextStatus: TenantStatus, tip: string) => {
    await updateStatusMutation.mutateAsync({ id: record.id, status: nextStatus });
    message.success(`${record.name} ${tip}`);
  };

  const columns: ColumnsType<TenantItem> = [
    { title: '租户名称', dataIndex: 'name', key: 'name' },
    {
      title: '版本套餐',
      dataIndex: 'plan',
      key: 'plan',
      width: 110,
      render: (plan: TenantPlan) => {
        const item = PLAN_MAP[plan];
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '归属渠道商',
      dataIndex: 'partnerName',
      key: 'partnerName',
      render: (name?: string) => name ?? <span className="text-gray-400">平台直客</span>,
    },
    {
      title: '分佣比例',
      dataIndex: 'commissionRate',
      key: 'commissionRate',
      width: 100,
      render: (rate: number) => (rate > 0 ? formatPercent(rate, 0) : '-'),
    },
    {
      title: '本月 GMV',
      dataIndex: 'monthlyGmv',
      key: 'monthlyGmv',
      align: 'right',
      render: (val: number) => <span className="font-medium">{formatCurrency(val)}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: TenantStatus) => {
        const item = STATUS_MAP[status];
        return <StatusBadge color={item.color} label={item.text} />;
      },
    },
    { title: '入驻时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'PENDING_REVIEW' && (
            <Button
              type="primary"
              size="small"
              loading={updateStatusMutation.isPending}
              onClick={() => handleStatusChange(record, 'ACTIVE', '已通过入驻审核')}
            >
              通过审核
            </Button>
          )}
          {record.status === 'ACTIVE' && (
            <Button
              type="link"
              size="small"
              danger
              loading={updateStatusMutation.isPending}
              onClick={() => handleStatusChange(record, 'SUSPENDED', '已被冻结')}
            >
              冻结
            </Button>
          )}
          {record.status === 'SUSPENDED' && (
            <Button
              type="link"
              size="small"
              loading={updateStatusMutation.isPending}
              onClick={() => handleStatusChange(record, 'ACTIVE', '已恢复正常运营')}
            >
              恢复运营
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="租户审核与管理"
      subtitle="支持平台运营对多租户进行入驻审批、版本核验与风控冻结"
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input.Search
          placeholder="搜索租户名称或渠道商..."
          allowClear
          style={{ width: 260 }}
          onSearch={(val) => setKeyword(val)}
        />
        <Select
          allowClear
          placeholder="按状态筛选"
          style={{ width: 150 }}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { label: '运营中', value: 'ACTIVE' },
            { label: '待审核', value: 'PENDING_REVIEW' },
            { label: '已冻结', value: 'SUSPENDED' },
          ]}
        />
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={tenants}
        pagination={false}
      />
    </PageContainer>
  );
}
