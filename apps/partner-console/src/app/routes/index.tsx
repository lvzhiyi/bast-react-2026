import { PartnerLayout } from '@/app/layouts/PartnerLayout';
import { CURRENT_PARTNER_ID } from '@/shared/constants';
import {
  settlementSearchSchema,
  settlementsQueryOptions,
  tenantSearchSchema,
  tenantsQueryOptions,
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
  component: PartnerLayout,
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
      context.queryClient.ensureQueryData(tenantsQueryOptions({ partnerId: CURRENT_PARTNER_ID })),
      context.queryClient.ensureQueryData(
        settlementsQueryOptions({ partnerId: CURRENT_PARTNER_ID }),
      ),
    ]);
  },
  component: lazyRouteComponent(() => import('@/features/dashboard'), 'PartnerDashboardPage'),
});

const referralsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/referrals',
  validateSearch: tenantSearchSchema,
  loaderDeps: ({ search }) => ({
    keyword: search.keyword,
    status: search.status,
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      tenantsQueryOptions({ partnerId: CURRENT_PARTNER_ID, ...deps }),
    ),
  component: lazyRouteComponent(() => import('@/features/referrals'), 'ReferralTenantPage'),
});

const settlementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settlements',
  validateSearch: settlementSearchSchema,
  loaderDeps: ({ search }) => ({
    status: search.status,
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      settlementsQueryOptions({ partnerId: CURRENT_PARTNER_ID, ...deps }),
    ),
  component: lazyRouteComponent(() => import('@/features/settlements'), 'SettlementListPage'),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  referralsRoute,
  settlementsRoute,
]);

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
