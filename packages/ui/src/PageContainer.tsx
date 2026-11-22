import type { ReactNode } from 'react';

export interface PageContainerProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
  children: ReactNode;
}

export function PageContainer({ title, subtitle, extra, children }: PageContainerProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg shadow-xs border border-gray-100">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 m-0">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 mt-1 mb-0">{subtitle}</p>}
        </div>
        {extra && <div>{extra}</div>}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-100">{children}</div>
    </div>
  );
}
