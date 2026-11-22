import { AppRouter, queryClient } from '@/app/routes';
import { PortalProvider } from '@repo/ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <PortalProvider primaryColor="#7c3aed" queryClient={queryClient}>
        <AppRouter />
      </PortalProvider>
    </StrictMode>,
  );
}
