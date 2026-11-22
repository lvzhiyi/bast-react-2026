import { PartnerLayout } from '@/app/layouts/PartnerLayout';
import { Suspense, lazy } from 'react';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router';

const PartnerDashboardPage = lazy(() =>
  import('@/features/dashboard/PartnerDashboardPage').then((m) => ({
    default: m.PartnerDashboardPage,
  })),
);

const ReferralTenantPage = lazy(() =>
  import('@/features/referrals/ReferralTenantPage').then((m) => ({
    default: m.ReferralTenantPage,
  })),
);

const SettlementListPage = lazy(() =>
  import('@/features/settlements/SettlementListPage').then((m) => ({
    default: m.SettlementListPage,
  })),
);

const fallback = <div className="p-6 text-gray-500">页面加载中...</div>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <PartnerLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={fallback}>
            <PartnerDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'referrals',
        element: (
          <Suspense fallback={fallback}>
            <ReferralTenantPage />
          </Suspense>
        ),
      },
      {
        path: 'settlements',
        element: (
          <Suspense fallback={fallback}>
            <SettlementListPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
