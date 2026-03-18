import posthog from 'posthog-js';
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
  // Shuffle and repeat states
  isShuffle: boolean;
  repeatMode: "off" | "all" | "one";

  // Actions
  setTrack: (track: iTunesTrack, context?: 'search' | 'recent' | 'playlist' | 'library', list?: iTunesTrack[]) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setList: (list: iTunesTrack[]) => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  playbackContext: null,
  currentList: [],
  isShuffle: false,
  repeatMode: "off",
  audio: typeof window !== 'undefined' ? new Audio() : null,

  setTrack: (track, context, list) => {
    const { audio, currentTrack } = get();
    if (!audio) return;

    // If it's the same track, just toggle play or update context/list
    if (currentTrack?.trackId === track.trackId) {
      if (context || list) {
        set({
          playbackContext: context || get().playbackContext,
          currentList: list || get().currentList,
        });
      }

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

    posthog.capture('track_played', {
      track_id: track.trackId,
      track_name: track.trackName,
      artist_name: track.artistName,
      context: context || get().playbackContext
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

    posthog.capture('track_played', {
      track_id: currentTrack.trackId,
      track_name: currentTrack.trackName,
      artist_name: currentTrack.artistName,
      trigger: 'manual_play'
    });
  },

  pause: () => {
    const { audio, currentTrack } = get();
    if (!audio) return;
    audio.pause();
    set({ isPlaying: false });

    if (currentTrack) {
      posthog.capture('track_paused', {
        track_id: currentTrack.trackId,
        track_name: currentTrack.trackName
      });
    }
  },

  next: () => {
    const { currentTrack, currentList, setTrack, isShuffle, repeatMode, audio } = get();
    if (!currentTrack || currentList.length === 0) return;

    if (repeatMode === "one" && audio) {
      audio.currentTime = 0;
      audio.play();
      return;
    }

    if (isShuffle) {
      const remainingTracks = currentList.filter(t => t.trackId !== currentTrack.trackId);
      if (remainingTracks.length > 0) {
        const randomTrack = remainingTracks[Math.floor(Math.random() * remainingTracks.length)];
        if (randomTrack) setTrack(randomTrack as iTunesTrack);
      }
      return;
    }

    const currentIndex = currentList.findIndex(t => t.trackId === currentTrack.trackId);
    if (currentIndex !== -1) {
      if (currentIndex < currentList.length - 1) {
        const t = currentList[currentIndex + 1];
        if (t) setTrack(t);
      } else if (repeatMode === "all") {
        const t = currentList[0];
        if (t) setTrack(t);
      }
    }
  },

  prev: () => {
    const { currentTrack, currentList, setTrack, audio, isShuffle, repeatMode } = get();
    if (!currentTrack || currentList.length === 0) return;

    // If more than 3 seconds in, just restart track
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      audio.play();
      return;
    }

    if (isShuffle) {
      const remainingTracks = currentList.filter(t => t.trackId !== currentTrack.trackId);
      if (remainingTracks.length > 0) {
        const randomTrack = remainingTracks[Math.floor(Math.random() * remainingTracks.length)];
        if (randomTrack) setTrack(randomTrack as iTunesTrack);
      }
      return;
    }

    const currentIndex = currentList.findIndex(t => t.trackId === currentTrack.trackId);
    if (currentIndex > 0) {
      const t = currentList[currentIndex - 1];
      if (t) setTrack(t);
    } else if (repeatMode === "all" && currentList.length > 0) {
      const t = currentList[currentList.length - 1];
      if (t) setTrack(t);
    }
  },

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  
  toggleRepeat: () => set((state) => {
    const nextMode = {
      "off": "all",
      "all": "one",
      "one": "off"
    } as const;
    return { repeatMode: nextMode[state.repeatMode] };
  }),


  setList: (list) => set({ currentList: list }),
}));
