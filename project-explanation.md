# Aura Music: Deep Technical Walkthrough

Aura Music is a premium music streaming platform featuring a decoupled architecture. This handbook provides an exhaustive guide to the system, from the initial boot sequence to the underlying data models.

---

## 1. Project Entry Points

### Frontend (Next.js)
- **Start Command**: `pnpm dev`
- **Entry File**: `app/layout.tsx`
- **Execution Flow**:
  1. Next.js 15 initializes the App Router.
  2. `layout.tsx` wraps the application in the `AuthProvider`, which initializes the Supabase client.
  3. The `Inter` font is loaded as a CSS variable across the `<body>`.
  4. The main view is rendered in `app/page.tsx`, which connects to centralized Zustand stores.

### Backend (Express)
- **Start Command**: `pnpm dev` (executes `tsx watch src/index.ts`)
- **Entry File**: `src/index.ts`
- **Execution Flow**:
  1. `dotenv.config()` loads environment variables.
  2. Express 5 app is initialized with modern async handling.
  3. Route modules (`music`, `library`, `playlist`) are mounted.
  4. The server starts listening on `PORT 4000`.

---

## 2. Complete Folder Structure

### Frontend (`my-next-enterprise`)
- **`app/`**: Next.js App Router root.
  - `page.tsx`: Views and layout orchestration. Connects to `useLibraryStore` and `usePlaybackStore`.
  - `layout.tsx`: Root shell, providers, and global styles.
- **`components/`**: Logic and UI modules.
  - `Providers/AuthProvider.tsx`: Manages the Supabase auth state.
  - `NowPlayingBar/`: Handles audio progress and controls by subscribing directly to `usePlaybackStore`.
  - `Sidebar/`: Navigation and playlist listing.
  - `TrackList/`: Renders track collections in grid or list format.
- **`lib/`**: Utilities and shared logic.
  - `api-client.ts`: Wrapper for authenticated backend requests.
  - `store/`: Centralized state management (Zustand).
    - `playback.ts`: Audio state, `HTMLAudioElement` integration, and playback actions.
    - `library.ts`: Playlists, liked songs, and library navigation.
  - `actions/`: Frontend-triggered functions calling the backend.

### Backend (`auramusic-backend`)
- **`src/`**: Source root.
  - **`routes/`**: Endpoint definitions (e.g., `playlist.routes.ts`).
  - **`controllers/`**: Request handling and response formatting (e.g., `music.controller.ts`).
  - **`services/`**: Pure business logic and external integrations (e.g., `itunes.service.ts`).
  - **`middleware/`**: Auth guards and error handlers (e.g., `auth.ts`).
  - **`config/`**: External connection configurations (Supabase, Redis).

---

## 3. Full User Flow Walkthrough (Example: Searching & Liking)

1. **App Load**: User enters. `AuthProvider` checks session. `page.tsx` starts an initial "Top Hits" search.
2. **User Search**: User types "Chill" in `SearchBar`.
   - `SearchBar.tsx` clears its debounce timer and sets a new one (500ms).
   - After 500ms, `onSearch("Chill")` triggers `handleSearch` in `page.tsx`.
   - `fetch('http://localhost:4000/v1/music/search?q=Chill')` hits the backend.
3. **Backend Processing**: 
   - `music.routes.ts` routes the request to `searchMusic` in `music.controller.ts`.
   - The controller checks the (optional) Redis cache using a "Cache-Aside" pattern.
   - If Redis is down, it falls back to the network gracefully with a 1-hour TTL on success.
   - `itunes.service.ts` calls the Apple iTunes API, filters results for valid previews, and returns them.
4. **UI Update**: `page.tsx` updates `tracks` state. `TrackList` re-renders with "Chill" tracks.
5. **Liking a Song**: User clicks the Heart icon.
   - `handleToggleLike` in `page.tsx` calls `toggleLikeSong` in `lib/actions/liked-songs.ts`.
   - `apiFetch('/library/toggle', { method: 'POST', body: track })` is called.
   - Backend `library.service.ts` inserts/deletes from the `liked_songs` table in Supabase.
   - Frontend updates `likedSongIds` state periodically or on success to sync the Heart icon.

---

## 4. Frontend Code Walkthrough (Key Selections)

### State Management (`lib/store/playback.ts`)
The app uses Zustand to manage global state, eliminating prop-drilling.

```typescript
// playback.ts (Zustand Store)
export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  audio: typeof Audio !== 'undefined' ? new Audio() : null,

  setTrack: (track, context, list) => {
    const { audio } = get();
    if (!audio) return;

    set({ currentTrack: track, playbackContext: context, currentList: list });
    audio.src = track.previewUrl;
    audio.play();
    set({ isPlaying: true });
  },
  
  togglePlay: () => {
    const { audio, isPlaying } = get();
    if (!audio) return;
    isPlaying ? audio.pause() : audio.play();
    set({ isPlaying: !isPlaying });
  }
}));
```

---

## 5. Playback System Deep Dive

### The Centralized Audio Object
The app uses a single `HTMLAudioElement` managed within the `usePlaybackStore`. This ensures that music never stops and is accessible from any component without prop-drilling.

### UI Synchronization (`NowPlayingBar.tsx`)
The `NowPlayingBar` subscribes to the store and attaches event listeners to the global audio object:

```typescript
// NowPlayingBar.tsx
const { audio, currentTrack, isPlaying } = usePlaybackStore();

useEffect(() => {
  if (!audio) return;

  const handleTimeUpdate = () => setProgress(audio.currentTime);
  const handleLoadedMetadata = () => setDuration(audio.duration);
  const handleEnded = () => { if (hasNext) next(); };

  audio.addEventListener("timeupdate", handleTimeUpdate);
  audio.addEventListener("loadedmetadata", handleLoadedMetadata);
  audio.addEventListener("ended", handleEnded);

  return () => {
    audio.removeEventListener("timeupdate", handleTimeUpdate);
    audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    audio.removeEventListener("ended", handleEnded);
  };
}, [audio, hasNext, next]);
```

---

## 6. Backend Request Flow (Example: Library Fetch)

**Step-by-Step Chain**:
1. **Frontend**: `getLikedSongs()` calls `apiFetch('/library/liked')`.
2. **Backend**: 
   - `src/index.ts` receives request -> `app.use("/v1/library", libraryRoutes)`.
   - `src/routes/library.routes.ts`: `GET /liked` -> `authenticate` -> `libraryController.getLiked`.
3. **Auth Middleware**:
   ```typescript
   // src/middleware/auth.ts
   // Verifies the Supabase JWT sent in the Authorization header
   const { data: { user } } = await supabase.auth.getUser(token);
   req.user = user; // Attach authenticated user to the request
   ```
4. **Service Execution**: 
   - `library.controller.ts` calls `libraryService.getLikedSongs(req.user.id)`.
   - `library.service.ts` queries Supabase: `.from("liked_songs").select("*").eq("user_id", userId)`.
5. **Response**: Data flows back to `page.tsx`, updating the library view.

---

## 7. Redis Caching Implementation

### Initialization (`src/config/redis.ts`)
Redis is configured to cache search results to reduce latency.

```typescript
// src/config/redis.ts
import { Redis } from "ioredis";

// Configures the connection to a local or remote Redis instance
// Currently uses a placeholder if REDIS_URL is not provided
export const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL) 
  : null;
```

### Usage in Controller
```typescript
// src/controllers/music.controller.ts
async function searchMusic(req, res) {
  const query = req.query.q;
  const cacheKey = `music:search:${query}`;

  // 1. Check if we have a cached response
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return res.json({ tracks: JSON.parse(cached), source: "cache" });
  }

  // 2. Cache miss -> Fetch from external API
  const tracks = await itunesService.searchTracks(query);

  // 3. Save to Redis with a 1-hour TTL (Time To Live)
  if (redis) {
    await redis.set(cacheKey, JSON.stringify(tracks), "EX", 3600);
  }

  return res.json({ tracks, source: "network" });
}
```

---

## 8. Supabase Integration

### Database Schema
- **`liked_songs`**:
  - `user_id` (UUID): Reference to auth user.
  - `track_id` (Integer): The iTunes track ID.
  - `track_data` (JSONB): The full iTunes JSON object. *Note: Storing full data allows the library to render instantly without re-fetching.*
- **`playlists`**: Metadata table for custom folders.
- **`playlist_songs`**: Junction table linking tracks to playlists. Includes a `position` column to preserve user ordering.

---

## 9. Security & Engineering Decisions

### Separated Backend
**Decision**: Move Supabase mutations from Frontend to local Backend.
**Reason**: This allowed the backend to use the `SERVICE_ROLE_KEY` (admin access). This solves complex permission issues where a user might need to add a song to a shared playlist they don't "own" in the traditional sense, while still enforcing logic via the controller.

### JSONB Storage
**Decision**: Store external API response objects as JSONB.
**Reason**: iTunes API returns over 20 fields for a track. Creating 20 columns in Postgres would be brittle. JSONB allows flexibilty while maintaining indexing capabilities on `track_id`.

---
*Created for Aura Music Engineering Team — March 2026*
