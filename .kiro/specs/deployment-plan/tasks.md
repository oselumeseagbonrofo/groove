# Implementation Plan

- [x] 1. Prepare Backend for Render Deployment
  - [x] 1.1 Verify server uses PORT environment variable
    - Confirm `server.js` uses `process.env.PORT` for binding
    - Ensure fallback to 3001 for local development
    - _Requirements: 1.3_
  - [ ]* 1.2 Write property test for PORT configuration
    - **Property 1: PORT Environment Variable Binding**
    - **Validates: Requirements 1.3**
  - [x] 1.3 Verify health check endpoint
    - Confirm `/health` endpoint returns 200 with expected JSON
    - _Requirements: 1.4_
  - [ ]* 1.4 Write unit test for health check endpoint
    - Test that `/health` returns `{ status: 'ok', message: 'Groove backend is running' }`
    - _Requirements: 1.4_

- [x] 2. Configure CORS for Production
  - [x] 2.1 Verify CORS configuration uses FRONTEND_URL
    - Confirm `server.js` CORS middleware uses `process.env.FRONTEND_URL`
    - Ensure credentials are enabled
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ]* 2.2 Write property test for CORS origin configuration
    - **Property 2: CORS Origin Configuration**
    - **Validates: Requirements 3.1, 3.3**
  - [ ]* 2.3 Write unit test for CORS credentials
    - Verify CORS configuration includes `credentials: true`
    - _Requirements: 3.2_

- [x] 3. Create Render Deployment Configuration
  - [x] 3.1 Create render.yaml configuration file
    - Define web service with Node.js runtime
    - Set build command: `npm install`
    - Set start command: `npm start`
    - Configure health check path: `/health`
    - _Requirements: 1.1, 1.2, 1.4_
  - [x] 3.2 Document required environment variables for Render
    - Create deployment documentation with all required env vars
    - Include SUPABASE_URL, SUPABASE_ANON_KEY, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI, FRONTEND_URL
    - _Requirements: 1.5_

- [x] 4. Prepare Frontend for Vercel Deployment
  - [x] 4.1 Verify Next.js image configuration
    - Confirm `next.config.mjs` includes Spotify CDN domains
    - Verify mosaic.scdn.co, i.scdn.co, image-cdn-ak.spotifycdn.com are configured
    - _Requirements: 7.1, 7.2_
  - [ ]* 4.2 Write unit test for image remote patterns
    - Test that next.config includes required Spotify CDN domains
    - _Requirements: 7.1_
  - [x] 4.3 Document required environment variables for Vercel
    - Document NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_API_URL
    - _Requirements: 2.3, 2.4_

- [x] 5. Create Vercel Deployment Configuration
  - [x] 5.1 Create vercel.json configuration file (if needed)
    - Configure build settings if defaults need override
    - Set Node.js version to 20.x
    - _Requirements: 2.1, 2.2_

- [x] 6. Update Spotify OAuth Configuration
  - [x] 6.1 Document Spotify Developer Dashboard updates
    - Document steps to add production redirect URI
    - Specify URI format: `https://<render-backend-url>/api/auth/callback`
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ]* 6.2 Write unit test for redirect URI pattern validation
    - Test that SPOTIFY_REDIRECT_URI follows expected pattern
    - _Requirements: 4.3_

- [x] 7. Create Deployment Documentation
  - [x] 7.1 Create DEPLOYMENT.md guide
    - Document step-by-step Render deployment process
    - Document step-by-step Vercel deployment process
    - Include environment variable setup instructions
    - Include Spotify Dashboard configuration steps
    - _Requirements: 1.1, 1.5, 2.1, 2.3, 4.1_
  - [x] 7.2 Create deployment verification checklist
    - Health check verification steps
    - CORS verification steps
    - OAuth flow verification steps
    - API integration verification steps
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
