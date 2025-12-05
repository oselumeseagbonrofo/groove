# Requirements Document

## Introduction

This document specifies the requirements for deploying the Groove application to production. The backend Express.js API will be deployed to Render, while the Next.js frontend will be deployed to Vercel. The deployment must ensure secure environment configuration, proper CORS setup, and seamless communication between frontend and backend services.

## Glossary

- **Render**: A cloud platform for hosting web services, APIs, and static sites
- **Vercel**: A cloud platform optimized for Next.js applications with automatic deployments
- **Environment Variables**: Configuration values stored outside the codebase for security
- **CORS**: Cross-Origin Resource Sharing, a security mechanism for controlling cross-domain requests
- **OAuth Redirect URI**: The URL Spotify redirects to after authentication
- **Health Check**: An endpoint that verifies service availability
- **Build Command**: The command executed to compile/prepare the application for production
- **Start Command**: The command executed to run the application in production

## Requirements

### Requirement 1: Backend Deployment to Render

**User Story:** As a developer, I want to deploy the backend API to Render, so that the API is accessible from the production frontend.

#### Acceptance Criteria

1. WHEN the backend is deployed to Render THEN the Deployment System SHALL expose the Express.js server on a public HTTPS URL
2. WHEN Render builds the backend THEN the Deployment System SHALL execute `npm install` followed by `npm start`
3. WHEN the backend starts THEN the Deployment System SHALL use the PORT environment variable provided by Render
4. WHEN the backend is running THEN the Health Check endpoint at `/health` SHALL return a 200 status code
5. WHEN environment variables are configured THEN the Deployment System SHALL securely store SUPABASE_URL, SUPABASE_ANON_KEY, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI, and FRONTEND_URL

### Requirement 2: Frontend Deployment to Vercel

**User Story:** As a developer, I want to deploy the frontend to Vercel, so that users can access the application through a production URL.

#### Acceptance Criteria

1. WHEN the frontend is deployed to Vercel THEN the Deployment System SHALL build the Next.js application using `npm run build`
2. WHEN Vercel deploys the frontend THEN the Deployment System SHALL expose the application on a public HTTPS URL
3. WHEN environment variables are configured THEN the Deployment System SHALL securely store NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and NEXT_PUBLIC_API_URL
4. WHEN the frontend references the backend THEN NEXT_PUBLIC_API_URL SHALL point to the Render backend URL

### Requirement 3: Cross-Origin Communication

**User Story:** As a user, I want the frontend to communicate with the backend without errors, so that I can use all application features.

#### Acceptance Criteria

1. WHEN the frontend makes API requests THEN the Backend SHALL include the Vercel frontend URL in the CORS allowed origins
2. WHEN CORS is configured THEN the Backend SHALL allow credentials in cross-origin requests
3. WHEN the FRONTEND_URL environment variable is set THEN the Backend SHALL use this value for CORS origin validation

### Requirement 4: Spotify OAuth Configuration

**User Story:** As a user, I want to authenticate with Spotify in production, so that I can access my playlists and control playback.

#### Acceptance Criteria

1. WHEN deploying to production THEN the Developer SHALL update the Spotify Developer Dashboard with the production redirect URI
2. WHEN the backend handles OAuth callbacks THEN SPOTIFY_REDIRECT_URI SHALL match the URL registered in the Spotify Developer Dashboard
3. WHEN OAuth is configured THEN the Redirect URI SHALL follow the pattern `https://<render-backend-url>/api/auth/callback`

### Requirement 5: Supabase Production Configuration

**User Story:** As a developer, I want to use the production Supabase instance, so that user data persists correctly in production.

#### Acceptance Criteria

1. WHEN deploying to production THEN the Backend SHALL use production Supabase credentials
2. WHEN deploying to production THEN the Frontend SHALL use production Supabase public credentials
3. WHEN Supabase is configured THEN Row Level Security policies SHALL be enabled for all tables

### Requirement 6: Deployment Verification

**User Story:** As a developer, I want to verify the deployment is successful, so that I can confirm the application works in production.

#### Acceptance Criteria

1. WHEN deployment completes THEN the Developer SHALL verify the health check endpoint returns successfully
2. WHEN deployment completes THEN the Developer SHALL verify Spotify OAuth flow completes without errors
3. WHEN deployment completes THEN the Developer SHALL verify frontend can fetch data from the backend API
4. WHEN deployment completes THEN the Developer SHALL verify playback controls function correctly

### Requirement 7: Image Domain Configuration

**User Story:** As a user, I want to see album artwork and images, so that I have a complete visual experience.

#### Acceptance Criteria

1. WHEN the frontend is deployed THEN the Next.js image configuration SHALL include Spotify CDN domains
2. WHEN images are loaded THEN the Frontend SHALL successfully fetch images from mosaic.scdn.co, i.scdn.co, and image-cdn-ak.spotifycdn.com
