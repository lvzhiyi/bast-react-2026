import { useAuthStore, useUiStore } from '@/app/stores';
import {
  ApartmentOutlined,
  ColumnHeightOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { AdminShell, SAAS_PORTALS } from '@repo/ui';
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button, Tooltip } from 'antd';
import type { ReactNode } from 'react';

type PlatformNavPath = '/dashboard' | '/tenants' | '/orders';

const NAV_ITEMS: Array<{ key: PlatformNavPath; icon: ReactNode; label: string }> = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '运营大盘' },
  { key: '/tenants', icon: <ApartmentOutlined />, label: '租户审核与管理' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '全平台订单' },
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

export function PlatformLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const navigate = useNavigate();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed);
  const density = useUiStore((state) => state.density);
  const toggleDensity = useUiStore((state) => state.toggleDensity);
  const user = useAuthStore((state) => state.user);

  const selectedKey = NAV_ITEMS.find((item) => pathname.startsWith(item.key))?.key ?? '/dashboard';

  return (
    <AdminShell
      brandName="SaaS 运营总台"
      brandShortName="运营"
      roleBadge={user?.role ?? 'Guest'}
      accentColor="#1677ff"
      userName={user?.name ?? '未登录'}
      menuItems={MENU_ITEMS}
      selectedKey={selectedKey}
      onMenuSelect={(key) => navigate({ to: key as PlatformNavPath })}
      collapsed={sidebarCollapsed}
      onCollapsedChange={setSidebarCollapsed}
      headerActions={
        <Tooltip title={density === 'compact' ? '切换为标准视图' : '切换为紧凑视图'}>
          <Button
            type="text"
            size="small"
            icon={<ColumnHeightOutlined />}
            onClick={toggleDensity}
            className="text-xs text-gray-600"
          >
            {density === 'compact' ? '紧凑视图' : '标准视图'}
          </Button>
        </Tooltip>
      }
      portalLinks={SAAS_PORTALS.map((portal) => ({
        ...portal,
        active: portal.key === 'platform',
      }))}
    >
      <Outlet />
    </AdminShell>
  );
}
