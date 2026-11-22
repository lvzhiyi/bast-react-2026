import { queryClient } from '@/app/queryClient';
import { useAuthStore } from '@/app/stores';
import { createApiClient } from '@repo/api';

export const platformApiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/platform',
  getAccessToken: () => useAuthStore.getState().accessToken,
  onUnauthorized: () => {
    useAuthStore.getState().logout();
    queryClient.clear();
  },
});
