import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIState {
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  isNowPlayingPanelOpen: boolean
  toggleNowPlayingPanel: () => void
  setNowPlayingPanelOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      isNowPlayingPanelOpen: false,
      toggleNowPlayingPanel: () => set((state) => ({ isNowPlayingPanelOpen: !state.isNowPlayingPanelOpen })),
      setNowPlayingPanelOpen: (open) => set({ isNowPlayingPanelOpen: open }),
    }),
    {
      name: "aura-ui-storage",
    }
  )
)
