import { PlatformLayout } from '@/app/layouts/PlatformLayout';
import { Suspense, lazy } from 'react';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router';

const PlatformDashboardPage = lazy(() =>
  import('@/features/dashboard/PlatformDashboardPage').then((m) => ({
    default: m.PlatformDashboardPage,
  })),
);

const TenantListPage = lazy(() =>
  import('@/features/tenant-management/TenantListPage').then((m) => ({
    default: m.TenantListPage,
  })),
);

const OrderListPage = lazy(() =>
  import('@/features/order-management/OrderListPage').then((m) => ({
    default: m.OrderListPage,
  })),
);

const fallback = <div className="p-6 text-gray-500">页面加载中...</div>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <PlatformLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={fallback}>
            <PlatformDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'tenants',
        element: (
          <Suspense fallback={fallback}>
            <TenantListPage />
          </Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <Suspense fallback={fallback}>
            <OrderListPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
