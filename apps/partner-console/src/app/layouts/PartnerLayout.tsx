import { AccountBookOutlined, DashboardOutlined, TeamOutlined } from '@ant-design/icons';
import { AdminShell, SAAS_PORTALS } from '@repo/ui';
import { Outlet, useLocation, useNavigate } from 'react-router';

const MENU_ITEMS = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '渠道收益大盘' },
  { key: '/referrals', icon: <TeamOutlined />, label: '推广商户明细' },
  { key: '/settlements', icon: <AccountBookOutlined />, label: '分佣结算管理' },
];

export function PartnerLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey =
    MENU_ITEMS.find((item) => location.pathname.startsWith(item.key))?.key ?? '/dashboard';

  return (
    <AdminShell
      brandName="渠道商后台"
      brandShortName="渠道"
      roleBadge="Partner"
      accentColor="#7c3aed"
      userName="华东金牌渠道商"
      menuItems={MENU_ITEMS}
      selectedKey={selectedKey}
      onMenuSelect={(key) => navigate(key)}
      portalLinks={SAAS_PORTALS.map((portal) => ({
        ...portal,
        active: portal.key === 'partner',
      }))}
    >
      <Outlet />
    </AdminShell>
  );
}
