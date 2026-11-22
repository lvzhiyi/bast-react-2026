import { ApartmentOutlined, DashboardOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { AdminShell, SAAS_PORTALS } from '@repo/ui';
import { Outlet, useLocation, useNavigate } from 'react-router';

const MENU_ITEMS = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '运营大盘' },
  { key: '/tenants', icon: <ApartmentOutlined />, label: '租户审核与管理' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '全平台订单' },
];

export function PlatformLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey =
    MENU_ITEMS.find((item) => location.pathname.startsWith(item.key))?.key ?? '/dashboard';

  return (
    <AdminShell
      brandName="SaaS 运营总台"
      brandShortName="运营"
      roleBadge="Platform Admin"
      accentColor="#1677ff"
      userName="平台总控管理员"
      menuItems={MENU_ITEMS}
      selectedKey={selectedKey}
      onMenuSelect={(key) => navigate(key)}
      portalLinks={SAAS_PORTALS.map((portal) => ({
        ...portal,
        active: portal.key === 'platform',
      }))}
    >
      <Outlet />
    </AdminShell>
  );
}
