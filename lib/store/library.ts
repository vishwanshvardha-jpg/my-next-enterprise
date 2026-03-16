import { create } from 'zustand';
import { getLikedSongs, toggleLikeSong } from 'lib/actions/liked-songs';
import { addSongToPlaylist as addSongAction, deletePlaylist as deletePlaylistAction, getPlaylists, getPlaylistSongs } from 'lib/actions/playlists';
import { iTunesTrack } from 'lib/itunes';
import { LikedSong, Playlist } from 'lib/types';

interface AuthUser {
  email?: string | null;
}


interface LibraryState {
  likedSongs: LikedSong[];
  playlists: Playlist[];
  activePlaylistId: string | 'liked' | 'library' | 'home';
  playlistTracks: (iTunesTrack & { addedAt?: string })[];
  currentPlaylistName: string;
  isAddingSongs: boolean;
  playlistSearchTracks: iTunesTrack[];
  isLoading: boolean;

  // Actions
  fetchInitialData: (user: AuthUser | null) => Promise<void>;
  fetchPlaylistTracks: (id: string | 'liked' | 'library') => Promise<void>;
  selectPlaylist: (id: string | 'liked' | 'library' | 'home') => void;
  toggleLike: (track: iTunesTrack, user: AuthUser | null) => Promise<void>;
  addToPlaylist: (track: iTunesTrack, playlistId: string) => Promise<void>;
  setAddingSongs: (isAdding: boolean) => void;
  handlePlaylistSearch: (query: string) => Promise<void>;
  setPlaylistSearchTracks: (tracks: iTunesTrack[]) => void;
  refreshPlaylists: () => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  likedSongs: [],
  playlists: [],
  activePlaylistId: 'home',
  playlistTracks: [],
  currentPlaylistName: '',
  isAddingSongs: false,
  playlistSearchTracks: [],
  isLoading: false,

  fetchInitialData: async (user) => {
    if (!user) {
      set({ likedSongs: [], playlists: [] });
      return;
    }
    set({ isLoading: true });
    try {
      const [songs, userPlaylists] = await Promise.all([
        getLikedSongs(),
        getPlaylists()
      ]);
      set({ likedSongs: songs, playlists: userPlaylists });
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPlaylistTracks: async (id) => {
    set({ isLoading: true });
    try {
      if (id === 'liked') {
        set({ currentPlaylistName: 'Liked Songs' });
        const songs = await getLikedSongs();
        set({ playlistTracks: songs.map((s: LikedSong) => ({ ...s.trackData, addedAt: s.createdAt })) });
      } else if (id === 'library') {
        set({ currentPlaylistName: 'My Library', playlistTracks: [] });
      } else {
        const { playlists } = get();
        const p = playlists.find(pl => pl.id === id);
        set({ currentPlaylistName: p?.name || 'Playlist' });
        const songs = await getPlaylistSongs(id);
        set({ playlistTracks: songs as (iTunesTrack & { addedAt?: string })[] });
      }
    } catch (err) {
      console.error('Failed to fetch playlist tracks:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  selectPlaylist: (id) => {
    const { fetchPlaylistTracks } = get();
    set({ activePlaylistId: id, isAddingSongs: false, playlistTracks: [] });
    if (id !== 'home') {
      fetchPlaylistTracks(id as string);
    }
  },

  toggleLike: async (track, user) => {
    if (!user) return;

    const { likedSongs, activePlaylistId, fetchPlaylistTracks, fetchInitialData } = get();
    const isLiked = likedSongs.some(s => s.trackId === track.trackId);

    // Optimistic update
    if (isLiked) {
      set({ likedSongs: likedSongs.filter(s => s.trackId !== track.trackId) });
    } else {
      set({ 
        likedSongs: [{ 
          trackId: track.trackId, 
          createdAt: new Date().toISOString(), 
          trackData: track 
        }, ...likedSongs] 
      });
    }

    try {
      await toggleLikeSong(track, isLiked);
      if (activePlaylistId === 'liked' || activePlaylistId === 'library') {
        fetchPlaylistTracks(activePlaylistId);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      fetchInitialData(user);
    }
  },

  addToPlaylist: async (track, playlistId) => {
    const { activePlaylistId, fetchPlaylistTracks } = get();
    try {
      await addSongAction(playlistId, track);
      if (activePlaylistId === playlistId) fetchPlaylistTracks(playlistId);
      // We don't have user object here, but fetchInitialData needs it
      // For now, we'll just assume it's called from where user is available
    } catch (err) {
      console.error('Failed to add to playlist:', err);
    }
  },

  setAddingSongs: (isAdding) => set({ isAddingSongs: isAdding }),

  handlePlaylistSearch: async (query) => {
    if (!query.trim()) {
      set({ playlistSearchTracks: [] });
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/v1/music/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = (await res.json()) as { tracks: iTunesTrack[] };
      set({ playlistSearchTracks: data.tracks });
    } catch (err) {
      console.error('Playlist search error:', err);
      set({ playlistSearchTracks: [] });
    }
  },

  setPlaylistSearchTracks: (tracks) => set({ playlistSearchTracks: tracks }),

  refreshPlaylists: async () => {
    try {
      const userPlaylists = await getPlaylists();
      set({ playlists: userPlaylists as Playlist[] });
    } catch (err) {
      console.error('Failed to refresh playlists:', err);
    }
  },

  deletePlaylist: async (id) => {
    try {
      await deletePlaylistAction(id);
      const { refreshPlaylists, activePlaylistId, selectPlaylist } = get();
      await refreshPlaylists();
      if (activePlaylistId === id) selectPlaylist('library');
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  }
}));
