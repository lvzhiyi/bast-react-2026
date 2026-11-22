import { MerchantLayout } from '@/app/layouts/MerchantLayout';
import { Suspense, lazy } from 'react';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router';

const MerchantDashboardPage = lazy(() =>
  import('@/features/dashboard/MerchantDashboardPage').then((m) => ({
    default: m.MerchantDashboardPage,
  })),
);

const MerchantOrderPage = lazy(() =>
  import('@/features/orders/MerchantOrderPage').then((m) => ({
    default: m.MerchantOrderPage,
  })),
);

const ProductListPage = lazy(() =>
  import('@/features/products/ProductListPage').then((m) => ({
    default: m.ProductListPage,
  })),
);

const fallback = <div className="p-6 text-gray-500">页面加载中...</div>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <MerchantLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={fallback}>
            <MerchantDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <Suspense fallback={fallback}>
            <MerchantOrderPage />
          </Suspense>
        ),
      },
      {
        path: 'products',
        element: (
          <Suspense fallback={fallback}>
            <ProductListPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
