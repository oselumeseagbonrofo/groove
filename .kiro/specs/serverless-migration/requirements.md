# Requirements Document

## Introduction

This specification defines the migration of the Groove backend from a standalone Express.js server to Next.js API Routes (serverless functions). The migration consolidates the frontend and backend into a single deployable unit, enabling free-tier deployment on Vercel while maintaining all existing functionality. The migration must preserve API compatibility, handle OAuth state management in a stateless environment, and ensure proper error handling and rate limiting work within serverless constraints.

## Glossary

- **API Route**: A Next.js App Router file that exports HTTP method handlers (GET, POST, etc.) as serverless functions
- **Serverless Function**: A stateless, event-driven function that executes on-demand without persistent server infrastructure
- **OAuth State**: A cryptographic token used to prevent CSRF attacks during OAuth authentication flows
- **Cold Start**: The initialization delay when a serverless function is invoked after being idle
- **Route Handler**: An exported async function in a Next.js API route file that handles a specific HTTP method
- **Supabase**: The PostgreSQL database and authentication service used for data persistence
- **Web API Request/Response**: The standard browser APIs (Request, Response) used by Next.js API routes instead of Express req/res objects

## Requirements

### Requirement 1: Shared Library Infrastructure

**User Story:** As a developer, I want shared utility code organized in a lib folder, so that API routes can reuse common functionality without duplication.

#### Acceptance Criteria

1. WHEN the migration is complete THEN the System SHALL have a `frontend/lib/` directory containing shared utilities for Supabase client, Spotify API helpers, and error handling
2. WHEN an API route needs database access THEN the System SHALL import the Supabase client from `lib/supabase.js`
3. WHEN an API route needs Spotify API functionality THEN the System SHALL import helpers from `lib/spotify.js`
4. WHEN an API route needs error handling THEN the System SHALL import utilities from `lib/errors.js`

### Requirement 2: Authentication Routes Migration

**User Story:** As a user, I want to authenticate with Spotify through the new serverless API, so that I can access my playlists and control playback.

#### Acceptance Criteria

1. WHEN a user initiates Spotify OAuth THEN the System SHALL generate an OAuth state, store it in Supabase with a timestamp, and return the authorization URL via `POST /api/auth/spotify`
2. WHEN Spotify redirects back with an authorization code THEN the System SHALL validate the state from Supabase, exchange the code for tokens, create or update the user record, store tokens, and redirect to the frontend via `GET /api/auth/callback`
3. WHEN a user requests token refresh THEN the System SHALL check token expiration, refresh if needed, update stored tokens, and return the new access token via `POST /api/auth/refresh`
4. WHEN a user logs out THEN the System SHALL delete the user's tokens from Supabase via `POST /api/auth/logout`
5. WHEN a client requests an access token THEN the System SHALL return the token if valid and not expired via `GET /api/auth/token/[userId]`
6. WHEN a client checks authentication status THEN the System SHALL return user info and token validity via `GET /api/auth/status/[userId]`

### Requirement 3: OAuth State Persistence

**User Story:** As a developer, I want OAuth states stored in Supabase instead of in-memory, so that the stateless serverless environment can validate OAuth callbacks.

#### Acceptance Criteria

1. WHEN an OAuth flow is initiated THEN the System SHALL store the state token in a Supabase `oauth_states` table with provider, timestamp, and expiration
2. WHEN an OAuth callback is received THEN the System SHALL query Supabase to validate the state exists and has not expired
3. WHEN a state is validated THEN the System SHALL delete the state record from Supabase to prevent reuse
4. WHEN states older than 10 minutes exist THEN the System SHALL consider them expired and reject validation attempts

### Requirement 4: Playlist Routes Migration

**User Story:** As a user, I want to browse and create playlists through the new serverless API, so that I can manage my music collection.

#### Acceptance Criteria

1. WHEN a user requests their playlists THEN the System SHALL fetch playlists from Spotify, merge with vinyl design metadata from Supabase, and return the enriched list via `GET /api/playlists`
2. WHEN a user requests a specific playlist THEN the System SHALL fetch playlist details and tracks from Spotify, merge with vinyl design, and return via `GET /api/playlists/[playlistId]`
3. WHEN a user creates a playlist THEN the System SHALL create the playlist in Spotify, optionally store vinyl design metadata in Supabase, and return the new playlist via `POST /api/playlists`

### Requirement 5: Playback Routes Migration

**User Story:** As a user, I want to control music playback through the new serverless API, so that I can play, pause, seek, and skip tracks.

#### Acceptance Criteria

1. WHEN a user starts playback THEN the System SHALL call Spotify's play endpoint with optional playlist, track, and device parameters via `POST /api/playback/play`
2. WHEN a user pauses playback THEN the System SHALL call Spotify's pause endpoint via `POST /api/playback/pause`
3. WHEN a user seeks to a position THEN the System SHALL validate the position and call Spotify's seek endpoint via `POST /api/playback/seek`
4. WHEN a user skips forward or backward THEN the System SHALL call the appropriate Spotify skip endpoint via `POST /api/playback/skip`
5. WHEN a user requests playback state THEN the System SHALL fetch and return current track, position, and device info via `GET /api/playback/state`
6. WHEN a user requests available devices THEN the System SHALL fetch and return Spotify devices via `GET /api/playback/devices`

### Requirement 6: Error Handling Migration

**User Story:** As a developer, I want consistent error handling across all serverless API routes, so that errors are logged and users receive appropriate error responses.

#### Acceptance Criteria

1. WHEN an error occurs in any API route THEN the System SHALL log the error to Supabase's `error_logs` table with user ID, error type, message, and request path
2. WHEN an error response is returned THEN the System SHALL include a structured error object with message, code, retryable flag, and optional retryAfter value
3. WHEN a route is not found THEN the System SHALL return a 404 response with appropriate error structure
4. WHEN an internal error occurs THEN the System SHALL return a 500 response without exposing internal details

### Requirement 7: Rate Limiting Migration

**User Story:** As a developer, I want rate limiting that works in a serverless environment, so that the API is protected from abuse.

#### Acceptance Criteria

1. WHEN rate limiting is needed THEN the System SHALL use Supabase to track request counts per user or IP within time windows
2. WHEN a request exceeds the rate limit THEN the System SHALL return a 429 response with Retry-After header and log the event
3. WHEN rate limit headers are set THEN the System SHALL include X-RateLimit-Limit and X-RateLimit-Remaining headers

### Requirement 8: Frontend Integration Update

**User Story:** As a developer, I want the frontend to use relative API paths, so that it works seamlessly with the co-located serverless API.

#### Acceptance Criteria

1. WHEN the migration is complete THEN the Frontend SHALL use relative `/api/*` paths instead of `NEXT_PUBLIC_API_URL` environment variable
2. WHEN API calls are made THEN the Frontend SHALL continue to receive the same response structure as before migration
3. WHEN environment variables are configured THEN the System SHALL only require Supabase and Spotify credentials, not a separate API URL

### Requirement 9: Request/Response Transformation

**User Story:** As a developer, I want API routes to use Web API standards, so that they are compatible with Next.js serverless functions.

#### Acceptance Criteria

1. WHEN handling request bodies THEN the Route Handler SHALL use `await request.json()` instead of `req.body`
2. WHEN handling query parameters THEN the Route Handler SHALL use `request.nextUrl.searchParams` instead of `req.query`
3. WHEN handling URL parameters THEN the Route Handler SHALL use the `params` argument from the route handler
4. WHEN returning responses THEN the Route Handler SHALL use `Response.json()` or `new Response()` instead of `res.json()`
5. WHEN redirecting THEN the Route Handler SHALL use `Response.redirect()` instead of `res.redirect()`
