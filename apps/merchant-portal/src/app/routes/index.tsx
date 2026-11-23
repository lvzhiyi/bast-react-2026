import { MerchantLayout } from '@/app/layouts/MerchantLayout';
import { CURRENT_TENANT_ID } from '@/shared/constants';
import {
  merchantOrderSearchSchema,
  ordersQueryOptions,
  productSearchSchema,
  productsQueryOptions,
} from '@repo/api';
import { createPortalQueryClient } from '@repo/ui';
import type { QueryClient } from '@tanstack/react-query';
import {
  RouterProvider,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router';

export const queryClient = createPortalQueryClient();

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: MerchantLayout,
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
      context.queryClient.ensureQueryData(
        ordersQueryOptions({ page: 1, pageSize: 20, tenantId: CURRENT_TENANT_ID }),
      ),
      context.queryClient.ensureQueryData(productsQueryOptions({ tenantId: CURRENT_TENANT_ID })),
    ]);
  },
  component: lazyRouteComponent(() => import('@/features/dashboard'), 'MerchantDashboardPage'),
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  validateSearch: merchantOrderSearchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    keyword: search.keyword,
    status: search.status,
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      ordersQueryOptions({ ...deps, tenantId: CURRENT_TENANT_ID }),
    ),
  component: lazyRouteComponent(() => import('@/features/orders'), 'MerchantOrderPage'),
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  validateSearch: productSearchSchema,
  loaderDeps: ({ search }) => ({
    keyword: search.keyword,
    status: search.status,
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      productsQueryOptions({ tenantId: CURRENT_TENANT_ID, ...deps }),
    ),
  component: lazyRouteComponent(() => import('@/features/products'), 'ProductListPage'),
});

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, ordersRoute, productsRoute]);

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
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
