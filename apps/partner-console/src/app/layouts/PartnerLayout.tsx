import { AccountBookOutlined, DashboardOutlined, TeamOutlined } from '@ant-design/icons';
import { AdminShell, SAAS_PORTALS } from '@repo/ui';
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';

type PartnerNavPath = '/dashboard' | '/referrals' | '/settlements';

const NAV_ITEMS: Array<{ key: PartnerNavPath; icon: ReactNode; label: string }> = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '渠道收益大盘' },
  { key: '/referrals', icon: <TeamOutlined />, label: '推广商户明细' },
  { key: '/settlements', icon: <AccountBookOutlined />, label: '分佣结算管理' },
];

const MENU_ITEMS = NAV_ITEMS.map((item) => ({
  key: item.key,
  icon: item.icon,
  label: (
    <Link to={item.key} className="text-inherit no-underline" onClick={(e) => e.stopPropagation()}>
      {item.label}
    </Link>
  ),
}));

export function PartnerLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const navigate = useNavigate();

  const selectedKey = NAV_ITEMS.find((item) => pathname.startsWith(item.key))?.key ?? '/dashboard';

  return (
    <AdminShell
      brandName="渠道商后台"
      brandShortName="渠道"
      roleBadge="Partner"
      accentColor="#7c3aed"
      userName="华东金牌渠道商"
      menuItems={MENU_ITEMS}
      selectedKey={selectedKey}
      onMenuSelect={(key) => navigate({ to: key as PartnerNavPath })}
      portalLinks={SAAS_PORTALS.map((portal) => ({
        ...portal,
        active: portal.key === 'partner',
      }))}
    >
      <Outlet />
    </AdminShell>
  );
}
