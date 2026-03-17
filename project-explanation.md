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
```text
my-next-enterprise/
├── app/                        # Next.js App Router root
│   ├── layout.tsx              # Root shell, providers, and global styles
│   └── page.tsx                # Views orchestration (useLibraryStore, usePlaybackStore)
├── components/                 # Modular UI components
│   ├── Auth/                   # Auth modals and overlays
│   ├── Button/                 # Atomic button components
│   ├── HomeView.tsx            # Main dashboard view
│   ├── NowPlayingBar/          # Persistent audio controller
│   ├── Playlist/               # Playlist management UI
│   ├── Providers/              # React Context providers (AuthProvider)
│   ├── Sidebar/                # App navigation
│   ├── TopNav/                 # Search and profile header
│   └── TrackList/              # Reusable track containers (Grid/List)
├── hooks/                      # Custom React hooks
├── lib/                        # Shared logic and utilities
│   ├── actions/                # Frontend API action wrappers
│   ├── store/                  # Zustand state management
│   │   ├── slices/             # Modular store slices
│   │   ├── library.ts          # Playlists and liked songs state
│   │   └── playback.ts         # Audio and playback control state
│   ├── supabase/               # Supabase clients (client, server, middleware)
│   ├── api-client.ts           # Authenticated fetch wrapper
│   ├── itunes.ts               # iTunes API utilities
│   └── types.ts                # Global TypeScript definitions
├── styles/                     # Global CSS and Tailwind configuration
├── e2e/                        # Playwright end-to-end tests
├── assets/                     # Static assets (logos, images)
├── public/                     # Public static files
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

### Backend (`auramusic-backend`)
```text
auramusic-backend/
├── src/                        # Source root
│   ├── config/                 # External service configurations (Supabase, Redis)
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Express middleware (Auth, Errors)
│   ├── routes/                 # API endpoint definitions
│   ├── services/               # Business logic and external API integrations
│   └── index.ts                # Application entry point
├── dist/                       # Compiled production code
├── package.json                # API dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

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

## 10. Authentication Flow
Aura Music uses **Supabase Auth** with a **Cross-Boundary Security Model**.

1. **Frontend Initiation**: In `AuthOverlay.tsx`, users log in via Supabase's `signInWithPassword`.
2. **Session Persistence**: The `AuthProvider.tsx` wraps the app, listening for `onAuthStateChange`. It stores the session in a React Context.
3. **Backend Authorization**: 
   - Every request to the backend includes an `Authorization: Bearer <JWT>` header.
   - The `api-client.ts` utility automatically injects this token by calling `supabase.auth.getSession()`.
4. **Backend Verification**: 
   - The `auth.ts` middleware in the Express backend intercepts the request.
   - It uses `supabase.auth.getUser(token)` to verify the JWT and extract the `user_id`.
   - The `user_id` is then attached to the `req` object for use in controllers.

---

## 11. Search Logic & Optimization
Search is designed for speed and efficiency, balancing user experience with API rate limiting.

1. **Debouncing**: The `SearchBar.tsx` uses a 500ms debounce. This prevents making a request for every keystroke, reducing server load.
2. **Global Integration**: Searching automatically switches the view to "Home" via `selectPlaylist('home')` in `page.tsx`.
3. **Backend Caching (Redis)**:
   - **Key Format**: `search:<normalized_query>`.
   - **Fail-Open Design**: If Redis is down, the backend logs a warning and fetches directly from iTunes, ensuring no service interruption.
   - **TTL**: Results are cached for 1 hour to balance data freshness with performance.
4. **Data Normalization**: The `itunes.service.ts` filters out tracks without preview URLs and transforms the raw iTunes response into a clean `iTunesTrack` object.

---

## 12. Playback System Architecture
The playback system is built on a "Source of Truth" pattern using Zustand.

1. **The Store (`playback.ts`)**:
   - Holds a single `HTMLAudioElement` that persists across route changes.
   - Manages `currentTrack`, `isPlaying`, and the `playbackList` (queue).
2. **UI Synchronization**:
   - `NowPlayingBar.tsx` listens to the `timeupdate` and `ended` events on the audio object.
   - It updates local progress state 60 times per second for smooth seeking bars.
3. **Context Sensitivity**: When a track is played from a playlist, the store captures the `context` (e.g., 'recent', 'playlist') to allow for correct "Next/Previous" navigation within that specific list.

---

## 13. Library & Playlist Implementation
Library management uses **Optimistic Updates** to provide a snappy, "local-first" feel.

1. **Optimistic UI**: In `library.ts` (Zustand), the `toggleLike` action updates the local state *before* the API call completes. If the API fails, the store rolls back the state and notifies the user.
2. **JSONB Persistence**: 
   - We store the entire `trackData` as a JSONB column in Supabase.
   - **Why?** This prevents "link rot" where a track's metadata might change or vanish from iTunes, but remains playable from our library.
3. **Playlist Synchronization**: Creating or deleting a playlist triggers a `refreshPlaylists()` call which re-syncs the Sidebar's playlist array with the database.

---

## 14. PostHog Analytics Integration
Aura Music integrates PostHog for product telemetry and user behavior analysis.

1. **Initialization**: Configured in `instrumentation-client.ts` with `/ingest` proxying to avoid ad-blockers.
2. **Automatic Tracking**: Captures page views and session duration out of the box.
3. **Custom Events**:
   - `auth_modal_opened`: Tracked when a guest tries to like a song.
   - `playlist_deleted`: Tracked in `Sidebar.tsx` to understand feature usage.
4. **Environment Awareness**: Debug logging is enabled in development but silenced in production.

---

## 15. Frontend-Backend Communication
The `api-fetch` utility at `lib/api-client.ts` is the central gateway for all data.

- **Base URL**: Set to `http://localhost:4000/v1` for local development.
- **Error Handling**: Standardizes error responses from the backend into human-readable exceptions.
- **Auto-Auth**: Injects the Supabase access token into every request, ensuring only authenticated users can modify libraries or playlists.

---
*Deep Dive Documentation — Aura Music Engineering — March 2026*
