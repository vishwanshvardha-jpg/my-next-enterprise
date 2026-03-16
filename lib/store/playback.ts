import { create } from 'zustand';
import { iTunesTrack } from 'lib/itunes';

interface PlaybackState {
  // Current playing track
  currentTrack: iTunesTrack | null;
  // Whether music is currently playing
  isPlaying: boolean;
  // The context from which the track is playing (search, playlist, etc.)
  playbackContext: 'search' | 'recent' | 'playlist' | 'library' | null;
  // List of tracks in the current playback context
  currentList: iTunesTrack[];
  // Reference to the audio object (initialized lazily)
  audio: HTMLAudioElement | null;

  // Actions
  setTrack: (track: iTunesTrack, context?: 'search' | 'recent' | 'playlist' | 'library', list?: iTunesTrack[]) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  setList: (list: iTunesTrack[]) => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  playbackContext: null,
  currentList: [],
  audio: typeof window !== 'undefined' ? new Audio() : null,

  setTrack: (track, context, list) => {
    const { audio, currentTrack } = get();
    if (!audio) return;

    // If it's the same track, just toggle play
    if (currentTrack?.trackId === track.trackId) {
      if (get().isPlaying) {
        audio.pause();
        set({ isPlaying: false });
      } else {
        audio.play();
        set({ isPlaying: true });
      }
      return;
    }

    // New track
    audio.pause();
    audio.src = track.previewUrl || '';
    audio.play();

    set({
      currentTrack: track,
      isPlaying: true,
      playbackContext: context || get().playbackContext,
      currentList: list || get().currentList,
    });
  },

  togglePlay: () => {
    const { audio, isPlaying, currentTrack } = get();
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    set({ isPlaying: !isPlaying });
  },

  play: () => {
    const { audio, currentTrack } = get();
    if (!audio || !currentTrack) return;
    audio.play();
    set({ isPlaying: true });
  },

  pause: () => {
    const { audio } = get();
    if (!audio) return;
    audio.pause();
    set({ isPlaying: false });
  },

  next: () => {
    const { currentTrack, currentList, setTrack } = get();
    if (!currentTrack || currentList.length === 0) return;

    const currentIndex = currentList.findIndex(t => t.trackId === currentTrack.trackId);
    if (currentIndex !== -1 && currentIndex < currentList.length - 1) {
      const nextTrack = currentList[currentIndex + 1];
      if (nextTrack) setTrack(nextTrack);
    }
  },

  prev: () => {
    const { currentTrack, currentList, setTrack } = get();
    if (!currentTrack || currentList.length === 0) return;

    const currentIndex = currentList.findIndex(t => t.trackId === currentTrack.trackId);
    if (currentIndex > 0) {
      const prevTrack = currentList[currentIndex - 1];
      if (prevTrack) setTrack(prevTrack);
    }
  },


  setList: (list) => set({ currentList: list }),
}));
