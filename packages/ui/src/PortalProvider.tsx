import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { type ReactNode, useState } from 'react';

export interface PortalProviderProps {
  primaryColor?: string;
  compact?: boolean;
  queryClient?: QueryClient;
  children: ReactNode;
}

export function createPortalQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        retry: 1,
      },
    },
  });
}

export function PortalProvider({
  primaryColor = '#1677ff',
  compact = false,
  queryClient: externalQueryClient,
  children,
}: PortalProviderProps) {
  const [defaultQueryClient] = useState(() => createPortalQueryClient());
  const queryClient = externalQueryClient ?? defaultQueryClient;

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: compact ? theme.compactAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: primaryColor,
            borderRadius: 6,
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
