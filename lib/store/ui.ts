import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIState {
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  isNowPlayingPanelOpen: boolean
  toggleNowPlayingPanel: () => void
  setNowPlayingPanelOpen: (open: boolean) => void
  isMobileSidebarOpen: boolean
  toggleMobileSidebar: () => void
  setMobileSidebarOpen: (open: boolean) => void
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
      isMobileSidebarOpen: false,
      toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
    }),
    {
      name: "aura-ui-storage",
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        isNowPlayingPanelOpen: state.isNowPlayingPanelOpen,
      }),
    }
  )
)
