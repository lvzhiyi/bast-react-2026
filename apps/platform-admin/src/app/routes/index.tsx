import { PlatformLayout } from '@/app/layouts/PlatformLayout';
import { queryClient } from '@/app/queryClient';
import { type AuthStore, useAuthStore } from '@/app/stores';
import {
  orderSearchSchema,
  ordersQueryOptions,
  tenantSearchSchema,
  tenantsQueryOptions,
} from '@repo/api';
import type { QueryClient } from '@tanstack/react-query';
import {
  RouterProvider,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router';

export { queryClient };

export interface PlatformRouterContext {
  queryClient: QueryClient;
  getAuthState: () => AuthStore;
}

const rootRoute = createRootRouteWithContext<PlatformRouterContext>()({
  component: PlatformLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard', replace: true });
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.query(tenantsQueryOptions()),
      context.queryClient.query(ordersQueryOptions({ page: 1, pageSize: 5 })),
    ]);
  },
  component: lazyRouteComponent(() => import('@/features/dashboard'), 'PlatformDashboardPage'),
});

const tenantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tenants',
  validateSearch: tenantSearchSchema,
  loaderDeps: ({ search }) => ({
    keyword: search.keyword,
    status: search.status,
  }),
  loader: ({ context, deps }) => context.queryClient.query(tenantsQueryOptions(deps)),
  component: lazyRouteComponent(() => import('@/features/tenant-management'), 'TenantListPage'),
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  validateSearch: orderSearchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    keyword: search.keyword,
    status: search.status,
    tenantId: search.tenantId,
  }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.query(tenantsQueryOptions()),
      context.queryClient.query(ordersQueryOptions(deps)),
    ]);
  },
  component: lazyRouteComponent(() => import('@/features/order-management'), 'OrderListPage'),
});

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, tenantsRoute, ordersRoute]);

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    getAuthState: () => useAuthStore.getState(),
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultPendingComponent: () => <div className="p-6 text-gray-500">页面加载中...</div>,
  defaultNotFoundComponent: () => (
    <div className="p-6 text-gray-500">页面不存在，请从左侧菜单选择功能模块。</div>
  ),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
