<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into AuraMusic, a Next.js 15.3 App Router music streaming application. PostHog was initialized using the `instrumentation-client.ts` pattern (the recommended approach for Next.js 15.3+), with a reverse proxy configured via `next.config.ts` rewrites. Error tracking via `capture_exceptions` is enabled globally. User identification is called on sign-up and sign-in using the Supabase user ID as the distinct ID, and `posthog.reset()` is called on sign-out to clear the session. Events were added across 7 files covering the full user journey from authentication through playback and library management.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User successfully creates a new account | `components/Auth/AuthOverlay.tsx` |
| `user_logged_in` | User successfully signs in | `components/Auth/AuthOverlay.tsx` |
| `user_logged_out` | User signs out of their account | `components/Providers/AuthProvider.tsx` |
| `auth_modal_opened` | Auth modal triggered when unauthenticated user tries a protected action | `app/page.tsx` |
| `track_played` | User starts playing a track (with track_id, track_name, artist_name, collection_name) | `components/TrackCard/TrackCard.tsx` |
| `track_liked` | User likes a track | `components/TrackCard/TrackCard.tsx` |
| `track_unliked` | User removes a like from a track | `components/TrackCard/TrackCard.tsx` |
| `track_added_to_playlist` | User adds a track to a playlist | `components/TrackCard/TrackCard.tsx` |
| `track_searched` | User submits a search query | `components/SearchBar/SearchBar.tsx` |
| `playlist_created` | User creates a new playlist (with name, privacy setting) | `components/Playlist/CreatePlaylistModal.tsx` |
| `playlist_deleted` | User deletes a playlist | `components/Sidebar/Sidebar.tsx` |
| `playback_skipped_next` | User skips to the next track | `components/NowPlayingBar/NowPlayingBar.tsx` |
| `playback_skipped_prev` | User skips to the previous track | `components/NowPlayingBar/NowPlayingBar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics](https://us.posthog.com/project/345972/dashboard/1369356)
- **Insight**: [User Sign Ups & Logins](https://us.posthog.com/project/345972/insights/0H3WCMD3) — Daily trend of new registrations and logins
- **Insight**: [Music Engagement Funnel](https://us.posthog.com/project/345972/insights/EHGnnWxO) — Conversion funnel: search → play → like
- **Insight**: [Track Plays Over Time](https://us.posthog.com/project/345972/insights/cRNp5WFz) — Daily track play volume
- **Insight**: [Auth Conversion: Modal to Sign Up](https://us.posthog.com/project/345972/insights/UZgdLjMR) — How many unauthenticated users shown the auth prompt actually convert
- **Insight**: [Playlist Activity](https://us.posthog.com/project/345972/insights/TKLbr5qy) — Playlist creation, track additions, and deletions over time

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
