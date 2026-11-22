import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type UiDensity = 'default' | 'compact';

export interface UiState {
  sidebarCollapsed: boolean;
  density: UiDensity;
}

export interface UiActions {
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setDensity: (density: UiDensity) => void;
  toggleDensity: () => void;
  resetUiPreferences: () => void;
}

export type UiStore = UiState & UiActions;

const DEFAULT_UI_STATE: UiState = {
  sidebarCollapsed: false,
  density: 'default',
};

export const useUiStore = create<UiStore>()(
  devtools(
    persist(
      (set) => ({
        ...DEFAULT_UI_STATE,
        setSidebarCollapsed: (collapsed) =>
          set({ sidebarCollapsed: collapsed }, undefined, 'ui/setSidebarCollapsed'),
        toggleSidebar: () =>
          set(
            (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
            undefined,
            'ui/toggleSidebar',
          ),
        setDensity: (density) => set({ density }, undefined, 'ui/setDensity'),
        toggleDensity: () =>
          set(
            (state) => ({
              density: state.density === 'default' ? 'compact' : 'default',
            }),
            undefined,
            'ui/toggleDensity',
          ),
        resetUiPreferences: () => set(DEFAULT_UI_STATE, undefined, 'ui/resetUiPreferences'),
      }),
      {
        name: 'platform-admin:ui',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          density: state.density,
        }),
      },
    ),
    {
      name: 'PlatformUiStore',
      enabled: import.meta.env.DEV,
    },
  ),
);
