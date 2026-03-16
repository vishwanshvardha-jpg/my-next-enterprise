# Aura Music Project Log

This log tracks the journey of the project refactor, documenting what was changed, why, and the state before/after.

## [2026-03-16] - Refactor Initiation

### Overview
Starting the staged architecture refactor to improve state management, caching, and overall code quality.

---

## [2026-03-16] - Stage 1: Backend Optimization (Search Caching)

### Changes
#### [MODIFY] [redis.ts](file:///Users/admin/code/auramusic-backend/src/config/redis.ts)
- **Before**: Redis client was commented out, exporting `null` as a placeholder.
- **After**: Re-enabled `ioredis` client with connection logging and error handling.
- **Reason**: To provide a functional caching layer for search results.

#### [MODIFY] [music.controller.ts](file:///Users/admin/code/auramusic-backend/src/controllers/music.controller.ts)
- **Before**: Directly fetched from iTunes API on every request.
- **After**: Implemented "Cache-Aside" pattern.
    - Added Redis `get` before network fetch.
    - Added Redis `set` with 1-hour TTL after network fetch.
    - Added `source` field in response (`cache` vs `network`) for tracking.
- **Reason**: To significantly reduce search latency for frequent queries and minimize external API calls.

### Verification Results
- (Pending) Redis connection verification (User needs to start Redis server).

---

## [2026-03-16] - Stage 2: Core State Infrastructure

### Changes
#### [NEW] [playback.ts](file:///Users/admin/code/my-next-enterprise/lib/store/playback.ts)
- **Before**: State was managed locally in `app/page.tsx` using `useState` and `useRef` for `audio`.
- **After**: Created a Zustand store `usePlaybackStore`.
    - Centralized `currentTrack`, `isPlaying`, `playbackContext`, and `currentList`.
    - Integrated `HTMLAudioElement` directly into the store (lazy init).
    - Added standardized actions: `setTrack`, `togglePlay`, `play`, `pause`, `next`, `prev`.
- **Reason**: To eliminate prop-drilling and ensure consistent playback state across all components.

#### [NEW] [index.ts](file:///Users/admin/code/my-next-enterprise/lib/store/index.ts)
- **Before**: No centralized store directory.
- **After**: Main entry point for all Zustand stores.
- **Reason**: To provide a clean, unified API for accessing global state.

### Verification Results
- Store initialized successfully and exports available.

---

## [2026-03-16] - Stage 3: Playback Integration

### Changes
#### [MODIFY] [NowPlayingBar.tsx](file:///Users/admin/code/my-next-enterprise/components/NowPlayingBar/NowPlayingBar.tsx)
- **Before**: Received playback state and control functions as props. Used a local `audioRef`.
- **After**: Subscribes directly to `usePlaybackStore`.
    - Removed all props.
    - Uses global `audio` object and actions (`togglePlay`, `next`, `prev`).
    - Derived `hasNext`/`hasPrev` from global `currentList`.
- **Reason**: To decouple the player bar from the layout and allow it to function independently.

#### [MODIFY] [page.tsx](file:///Users/admin/code/my-next-enterprise/app/page.tsx)
- **Before**: Managed large amounts of playback state (`currentTrack`, `isPlaying`, etc.) and a local `audioRef`. Passed complex props to `NowPlayingBar`.
- **After**: Connected to `usePlaybackStore`.
    - Deleted ~40 lines of local playback logic and state.
    - Simplified `handlePlayFromCard` and `handlePlayAll` to use store actions.
    - Uses `setList` to keep the store synchronized with the current view (search results or playlist).
    - Simplified `NowPlayingBar` usage to `<NowPlayingBar />`.
- **Reason**: To reduce component complexity, improve maintainability, and fix state synchronization issues.

### Verification Results
- (Pending) Verification of audio persistence across navigation (requires running app).

---

## [2026-03-16] - Stage 4: Library & Settings Migration

### Changes
#### [NEW] [library.ts](file:///Users/admin/code/my-next-enterprise/lib/store/library.ts)
- Created a specialized store for library state (playlists, liked songs, navigation).
- Centralized optimistic updates and data fetching logic.

#### [MODIFY] [Sidebar.tsx](file:///Users/admin/code/my-next-enterprise/components/Sidebar/Sidebar.tsx)
- Replaced local playlist state with `useLibraryStore`.
- Connected navigation actions to the global store.

#### [MODIFY] [page.tsx](file:///Users/admin/code/my-next-enterprise/app/page.tsx)
- Deleted ~120 lines of local library management logic.
- Unified data flow: components now trigger store actions, which synchronize state across the app.
- Simplified component props and significantly reduced state drilling.

### Verification Results
- Component-level logic verified via code review.
- Circular dependency checks passed.
- Redundant state completely eliminated.

---

## [2026-03-16] - Build & Lint Fixes

### Changes
- Cleaned up exhaustive list of unused imports across `page.tsx`, `Sidebar.tsx`, and `NowPlayingBar.tsx`.
- Resolved `any` type errors in `library.ts` by introducing a compatible `AuthUser` interface.
- Fixed action invocation scope in `library.ts` (added `get().` prefix).
- Standardized import sorting in `library.ts` and `Sidebar.tsx`.

### Verification Results
- ✅ `npm run build` passed successfully with **zero warnings**.



---

## [2026-03-16] - Redis Connection Resilience

### Changes
- Modified `src/config/redis.ts` to implement a limited retry strategy and concise error logging for `ECONNREFUSED`.
- Updated `searchMusic` controller to check `redis.status === 'ready'` before attempting cache operations.
- Added a helpful warning suggesting `brew services start redis` when connection fails.

### Verification Results
- ✅ Backend no longer crashes or spams `AggregateError` when Redis is down.
- ✅ Search functionality remains active via network fallback.

