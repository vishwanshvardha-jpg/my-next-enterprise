import { create } from 'zustand'

interface GuestState {
  isGuest: boolean
  songsPlayed: number
  tourStep: number          // 0=idle, 1-5=active steps, 6=end card
  isTourActive: boolean
  isTourCompleted: boolean
  limitModalDismissed: boolean
  sourcePlaylistId: string | null
  sourceToken: string | null

  enterGuestMode: (playlistId: string, token: string) => void
  incrementSongsPlayed: () => void
  startTour: () => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  completeTour: () => void
  dismissEndCard: () => void
  dismissLimitModal: () => void
  exitGuestMode: () => void
}

export const useGuestStore = create<GuestState>((set, get) => ({
  isGuest: false,
  songsPlayed: 0,
  tourStep: 0,
  isTourActive: false,
  isTourCompleted: false,
  limitModalDismissed: false,
  sourcePlaylistId: null,
  sourceToken: null,

  enterGuestMode: (playlistId, token) =>
    set({ isGuest: true, sourcePlaylistId: playlistId, sourceToken: token }),

  incrementSongsPlayed: () =>
    set((state) => ({ songsPlayed: state.songsPlayed + 1 })),

  startTour: () =>
    set({ tourStep: 1, isTourActive: true, isTourCompleted: false }),

  nextStep: () => {
    const { tourStep } = get()
    if (tourStep >= 5) {
      set({ tourStep: 6, isTourActive: false, isTourCompleted: true })
    } else {
      set({ tourStep: tourStep + 1 })
    }
  },

  prevStep: () => {
    const { tourStep } = get()
    if (tourStep > 1) set({ tourStep: tourStep - 1 })
  },

  skipTour: () =>
    set({ isTourActive: false, tourStep: 0 }),

  completeTour: () =>
    set({ tourStep: 6, isTourActive: false, isTourCompleted: true }),

  dismissEndCard: () =>
    set({ tourStep: 0 }),

  dismissLimitModal: () =>
    set({ limitModalDismissed: true }),

  exitGuestMode: () =>
    set({
      isGuest: false,
      songsPlayed: 0,
      tourStep: 0,
      isTourActive: false,
      isTourCompleted: false,
      limitModalDismissed: false,
      sourcePlaylistId: null,
      sourceToken: null,
    }),
}))
