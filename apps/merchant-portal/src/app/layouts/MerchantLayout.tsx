import { AppstoreOutlined, DashboardOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { AdminShell, SAAS_PORTALS } from '@repo/ui';
import { Outlet, useLocation, useNavigate } from 'react-router';

const MENU_ITEMS = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '店铺概览' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '本店订单' },
  { key: '/products', icon: <AppstoreOutlined />, label: '商品与套餐' },
];

export function MerchantLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey =
    MENU_ITEMS.find((item) => location.pathname.startsWith(item.key))?.key ?? '/dashboard';

  return (
    <AdminShell
      brandName="商家工作台"
      brandShortName="商家"
      roleBadge="Merchant"
      accentColor="#059669"
      userName="星辰科技 · 店长"
      menuItems={MENU_ITEMS}
      selectedKey={selectedKey}
      onMenuSelect={(key) => navigate(key)}
      portalLinks={SAAS_PORTALS.map((portal) => ({
        ...portal,
        active: portal.key === 'merchant',
      }))}
    >
      <Outlet />
    </AdminShell>
  );
}
