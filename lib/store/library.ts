import posthog from 'posthog-js';
import { create } from 'zustand';
import { getLikedSongs, toggleLikeSong } from 'lib/actions/liked-songs';
import { addSongToPlaylist as addSongAction, deletePlaylist as deletePlaylistAction, getPlaylists, getPlaylistSongs, leavePlaylist as leavePlaylistAction, updatePlaylist as updatePlaylistAction } from 'lib/actions/playlists';
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
  leavePlaylist: (id: string) => Promise<void>;
  updatePlaylistImage: (id: string, imageUrl: string) => Promise<void>;
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
    if (id !== 'home' && id !== 'recent') {
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
      
      posthog.capture(isLiked ? 'track_unliked' : 'track_liked', {
        track_id: track.trackId,
        track_name: track.trackName,
        artist_name: track.artistName
      });

      if (activePlaylistId === 'liked' || activePlaylistId === 'library') {
        fetchPlaylistTracks(activePlaylistId);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      fetchInitialData(user);
    }
  },

  addToPlaylist: async (track, playlistId) => {
    const { activePlaylistId, fetchPlaylistTracks, playlists, playlistTracks } = get();

    // Optimistic update: immediately add track so UI reflects the change
    if (activePlaylistId === playlistId) {
      set({ playlistTracks: [...playlistTracks, { ...track, addedAt: new Date().toISOString() }] });
    }

    try {
      await addSongAction(playlistId, track);

      const playlist = playlists.find(p => p.id === playlistId);
      posthog.capture('track_added_to_playlist', {
        track_id: track.trackId,
        track_name: track.trackName,
        playlist_id: playlistId,
        playlist_name: playlist?.name
      });

      if (activePlaylistId === playlistId) fetchPlaylistTracks(playlistId);
    } catch (err) {
      console.error('Failed to add to playlist:', err);
      // Rollback optimistic update on failure
      if (activePlaylistId === playlistId) {
        set({ playlistTracks: playlistTracks });
      }
    }
  },

  setAddingSongs: (isAdding) => set({ isAddingSongs: isAdding }),

  handlePlaylistSearch: async (query) => {
    if (!query.trim()) {
      set({ playlistSearchTracks: [] });
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/v1/music/search?q=${encodeURIComponent(query)}`);
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
      const { refreshPlaylists, activePlaylistId, selectPlaylist, playlists } = get();
      const playlist = playlists.find(p => p.id === id);

      await deletePlaylistAction(id);

      posthog.capture('playlist_deleted', {
        playlist_id: id,
        playlist_name: playlist?.name
      });

      await refreshPlaylists();
      if (activePlaylistId === id) selectPlaylist('library');
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  },

  updatePlaylistImage: async (id, imageUrl) => {
    await updatePlaylistAction(id, imageUrl);
    set((state) => ({
      playlists: state.playlists.map((p) =>
        p.id === id ? { ...p, image_url: imageUrl } : p
      ),
    }));
  },

  leavePlaylist: async (id) => {
    try {
      const { refreshPlaylists, activePlaylistId, selectPlaylist, playlists } = get();
      const playlist = playlists.find(p => p.id === id);

      await leavePlaylistAction(id);

      posthog.capture('playlist_left', {
        playlist_id: id,
        playlist_name: playlist?.name
      });

      await refreshPlaylists();
      if (activePlaylistId === id) selectPlaylist('library');
    } catch (err) {
      console.error('Failed to leave playlist:', err);
    }
  }
}));
