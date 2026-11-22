import { AppstoreOutlined, DashboardOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { AdminShell, SAAS_PORTALS } from '@repo/ui';
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';

type MerchantNavPath = '/dashboard' | '/orders' | '/products';

const NAV_ITEMS: Array<{ key: MerchantNavPath; icon: ReactNode; label: string }> = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '店铺概览' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '本店订单' },
  { key: '/products', icon: <AppstoreOutlined />, label: '商品与套餐' },
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

export function MerchantLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const navigate = useNavigate();

  const selectedKey = NAV_ITEMS.find((item) => pathname.startsWith(item.key))?.key ?? '/dashboard';

  return (
    <AdminShell
      brandName="商家工作台"
      brandShortName="商家"
      roleBadge="Merchant"
      accentColor="#059669"
      userName="星辰科技 · 店长"
      menuItems={MENU_ITEMS}
      selectedKey={selectedKey}
      onMenuSelect={(key) => navigate({ to: key as MerchantNavPath })}
      portalLinks={SAAS_PORTALS.map((portal) => ({
        ...portal,
        active: portal.key === 'merchant',
      }))}
    >
      <Outlet />
    </AdminShell>
  );
}
