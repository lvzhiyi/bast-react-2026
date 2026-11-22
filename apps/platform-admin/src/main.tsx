import { queryClient } from '@/app/queryClient';
import { AppRouter } from '@/app/routes';
import { useUiStore } from '@/app/stores';
import { PortalProvider } from '@repo/ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

function PlatformApp() {
  const density = useUiStore((state) => state.density);

  return (
    <PortalProvider
      primaryColor="#1677ff"
      compact={density === 'compact'}
      queryClient={queryClient}
    >
      <AppRouter />
    </PortalProvider>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <PlatformApp />
    </StrictMode>,
  );
}
