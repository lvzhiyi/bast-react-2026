import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface AuthSessionUser {
  id: string;
  name: string;
  role: string;
}

export interface AuthState {
  accessToken: string | null;
  user: AuthSessionUser | null;
  activeTenantId: string | null;
}

export interface AuthActions {
  setSession: (payload: {
    accessToken: string;
    user: AuthSessionUser;
    activeTenantId?: string | null;
  }) => void;
  setActiveTenantId: (tenantId: string | null) => void;
  logout: () => void;
}

export type AuthStore = AuthState & AuthActions;

const INITIAL_AUTH_STATE: AuthState = {
  accessToken: 'dev-platform-token',
  user: {
    id: 'admin-1',
    name: '平台总控管理员',
    role: 'Platform Admin',
  },
  activeTenantId: null,
};

export const selectIsAuthenticated = (state: AuthStore) => Boolean(state.accessToken);

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        ...INITIAL_AUTH_STATE,
        setSession: ({ accessToken, user, activeTenantId = null }) =>
          set(
            {
              accessToken,
              user,
              activeTenantId,
            },
            undefined,
            'auth/setSession',
          ),
        setActiveTenantId: (tenantId) =>
          set({ activeTenantId: tenantId }, undefined, 'auth/setActiveTenantId'),
        logout: () =>
          set(
            {
              accessToken: null,
              user: null,
              activeTenantId: null,
            },
            undefined,
            'auth/logout',
          ),
      }),
      {
        name: 'platform-admin:auth',
        partialize: (state) => ({
          accessToken: state.accessToken,
          user: state.user,
          activeTenantId: state.activeTenantId,
        }),
      },
    ),
    {
      name: 'PlatformAuthStore',
      enabled: import.meta.env.DEV,
    },
  ),
);
