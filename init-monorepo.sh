#!/usr/bin/env bash
set -e

echo "🚀 开始初始化大型 B 端 SaaS Monorepo 架构..."

# 1. 创建 Monorepo 顶层目录
mkdir -p apps/admin/src/{app/{routes,layouts},features/{auth,order-management}/{api,components,hooks,pages,stores,types},shared/{api,components/{ui,common},config,hooks,stores,types,utils}}
mkdir -p packages/{ui/src,utils/src,tsconfig}

# 2. 根目录 package.json
cat << 'JSON' > package.json
{
  "name": "enterprise-saas-monorepo",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "typecheck": "turbo run typecheck",
    "lint": "biome check .",
    "format": "biome format --write ."
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "turbo": "^2.4.0",
    "typescript": "^5.7.3"
  }
}
JSON

# 3. pnpm-workspace.yaml
cat << 'YAML' > pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
YAML

# 4. turbo.json (配置增量构建与任务拓扑)
cat << 'JSON' > turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    }
  }
}
JSON

# 5. Biome 全局代码规范
cat << 'JSON' > biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": { "noUnusedImports": "error" }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": { "quoteStyle": "single" }
  }
}
JSON

# 6. 公共 TSConfig 基座 (packages/tsconfig)
cat << 'JSON' > packages/tsconfig/package.json
{
  "name": "@repo/tsconfig",
  "version": "0.0.0",
  "private": true
}
JSON

cat << 'JSON' > packages/tsconfig/react-app.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "isolatedModules": true,
    "skipLibCheck": true
  }
}
JSON

# 7. 公共工具包 (packages/utils)
cat << 'JSON' > packages/utils/package.json
{
  "name": "@repo/utils",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  },
  "devDependencies": {
    "@repo/tsconfig": "workspace:*",
    "typescript": "^5.7.3"
  }
}
JSON

cat << 'TS' > packages/utils/src/index.ts
export function formatCurrency(amount: number, currency = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
  }).format(amount);
}
TS

# 8. 公共业务组件包 (packages/ui)
cat << 'JSON' > packages/ui/package.json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "antd": "^5.24.0"
  },
  "devDependencies": {
    "@repo/tsconfig": "workspace:*",
    "@types/react": "^19.0.0",
    "antd": "^5.24.0",
    "react": "^19.0.0",
    "typescript": "^5.7.3"
  }
}
JSON

cat << 'TSX' > packages/ui/src/index.ts
export { PageContainer } from './PageContainer';
TSX

cat << 'TSX' > packages/ui/src/PageContainer.tsx
import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
}

export function PageContainer({ title, extra, children }: PageContainerProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-xs">
        <h1 className="text-lg font-semibold text-gray-900 m-0">{title}</h1>
        {extra && <div>{extra}</div>}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-xs">{children}</div>
    </div>
  );
}
TSX

# 9. B 端主应用 (apps/admin)
cat << 'JSON' > apps/admin/package.json
{
  "name": "@repo/admin",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@ant-design/icons": "^5.6.1",
    "@repo/ui": "workspace:*",
    "@repo/utils": "workspace:*",
    "@tanstack/react-query": "^5.66.0",
    "antd": "^5.24.0",
    "axios": "^1.7.9",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.2.0",
    "zod": "^3.24.2",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@repo/tsconfig": "workspace:*",
    "@tailwindcss/vite": "^4.0.6",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.6",
    "typescript": "^5.7.3",
    "vite": "^6.1.0"
  }
}
JSON

cat << 'JSON' > apps/admin/tsconfig.json
{
  "extends": "@repo/tsconfig/react-app.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/app/*": ["./src/app/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  },
  "include": ["src"]
}
JSON

cat << 'TS' > apps/admin/vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@/app': path.resolve(__dirname, './src/app'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
TS

cat << 'HTML' > apps/admin/index.html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Enterprise SaaS Admin</title>
  </head>
  <body class="bg-gray-100">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML

cat << 'CSS' > apps/admin/src/index.css
@import "tailwindcss";
CSS

# 10. 填充 Shared 基础设施层示例
cat << 'TS' > apps/admin/src/shared/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 统一收敛处理 401 / 403 / 500 提示
    return Promise.reject(error);
  },
);
TS

cat << 'TS' > apps/admin/src/shared/stores/useGlobalLayoutStore.ts
import { create } from 'zustand';

interface GlobalLayoutState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useGlobalLayoutStore = create<GlobalLayoutState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
TS

# 11. 填充 Feature 业务域标准示范 (order-management)
cat << 'TS' > apps/admin/src/features/order-management/types/order.ts
export interface OrderItem {
  id: string;
  orderNo: string;
  customerName: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
}

export interface OrderQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
}
TS

cat << 'TS' > apps/admin/src/features/order-management/api/keys.ts
import type { OrderQueryParams } from '../types/order';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderQueryParams) => [...orderKeys.lists(), params] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};
TS

cat << 'TS' > apps/admin/src/features/order-management/api/get-orders.ts
import { useQuery } from '@tanstack/react-query';
import type { OrderItem, OrderQueryParams } from '../types/order';
import { orderKeys } from './keys';

// 模拟接口请求（实际项目中替换为 apiClient.get）
export async function fetchOrders(params: OrderQueryParams): Promise<{ list: OrderItem[]; total: number }> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    total: 2,
    list: [
      { id: '1', orderNo: 'ORD-2026001', customerName: '星辰科技', amount: 12800, status: 'PAID', createdAt: '2026-11-20' },
      { id: '2', orderNo: 'ORD-2026002', customerName: '远航物流', amount: 5400, status: 'PENDING', createdAt: '2026-11-21' },
    ].filter((item) => !params.keyword || item.customerName.includes(params.keyword)),
  };
}

export function useOrders(params: OrderQueryParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => fetchOrders(params),
  });
}
TS

cat << 'TSX' > apps/admin/src/features/order-management/pages/OrderListPage.tsx
import { PageContainer } from '@repo/ui';
import { formatCurrency } from '@repo/utils';
import { Button, Input, Table, Tag } from 'antd';
import { useState } from 'react';
import { useOrders } from '../api/get-orders';
import type { OrderItem } from '../types/order';

export function OrderListPage() {
  const [keyword, setKeyword] = useState('');
  const { data, isLoading } = useOrders({ page: 1, pageSize: 10, keyword });

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
    {
      title: '订单金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => formatCurrency(val),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderItem['status']) => (
        <Tag color={status === 'PAID' ? 'green' : 'orange'}>{status}</Tag>
      ),
    },
  ];

  return (
    <PageContainer
      title="订单管理"
      extra={<Button type="primary">新建订单</Button>}
    >
      <div className="mb-4 max-w-xs">
        <Input.Search
          placeholder="搜索客户名称..."
          allowClear
          onSearch={(val) => setKeyword(val)}
        />
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.list ?? []}
        pagination={{ total: data?.total ?? 0 }}
      />
    </PageContainer>
  );
}
TSX

# Feature 门面出口（只暴露允许外部引用的页面/组件）
cat << 'TS' > apps/admin/src/features/order-management/index.ts
export { OrderListPage } from './pages/OrderListPage';
export type { OrderItem } from './types/order';
TS

# 12. 填充 App 应用装配层
cat << 'TSX' > apps/admin/src/app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1分钟内不重复静默重拉
      retry: 1,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>{children}</ConfigProvider>
    </QueryClientProvider>
  );
}
TSX

cat << 'TSX' > apps/admin/src/app/layouts/MainLayout.tsx
import { MenuFoldOutlined, MenuUnfoldOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useGlobalLayoutStore } from '@/shared/stores/useGlobalLayoutStore';
import { Button, Layout, Menu } from 'antd';
import { Outlet } from 'react-router';

const { Header, Sider, Content } = Layout;

export function MainLayout() {
  const { sidebarCollapsed, toggleSidebar } = useGlobalLayoutStore();

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={sidebarCollapsed}>
        <div className="h-14 flex items-center justify-center text-white font-bold text-base">
          {sidebarCollapsed ? 'SaaS' : 'Enterprise SaaS'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['orders']}
          items={[{ key: 'orders', icon: <ShoppingCartOutlined />, label: '订单管理' }]}
        />
      </Sider>
      <Layout>
        <Header className="bg-white px-4 flex items-center shadow-2xs">
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
          />
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
TSX

cat << 'TSX' > apps/admin/src/app/routes/index.tsx
import { MainLayout } from '@/app/layouts/MainLayout';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';

// 路由级别懒加载，直接从 Feature 门面导入
const OrderListPage = lazy(() =>
  import('@/features/order-management').then((m) => ({ default: m.OrderListPage })),
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/orders" replace /> },
      {
        path: 'orders',
        element: (
          <Suspense fallback={<div className="p-6">加载中...</div>}>
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
TSX

cat << 'TSX' > apps/admin/src/main.tsx
import { AppProviders } from '@/app/providers';
import { AppRouter } from '@/app/routes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
);
TSX

echo "✅ 初始化完成！接下来请执行：pnpm install && pnpm dev"
