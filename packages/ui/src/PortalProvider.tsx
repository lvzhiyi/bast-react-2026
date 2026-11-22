import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { type ReactNode, useState } from 'react';

export interface PortalProviderProps {
  primaryColor?: string;
  children: ReactNode;
}

export function PortalProvider({ primaryColor = '#1677ff', children }: PortalProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
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
