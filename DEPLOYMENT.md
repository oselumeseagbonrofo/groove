# Groove Deployment Guide

This guide provides step-by-step instructions for deploying the Groove application to production. The backend Express.js API is deployed to Render, and the Next.js frontend is deployed to Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Spotify Dashboard Configuration](#spotify-dashboard-configuration)
5. [Environment Variables Reference](#environment-variables-reference)
6. [Deployment Verification](#deployment-verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- A [Render](https://render.com) account
- A [Vercel](https://vercel.com) account
- A [Supabase](https://supabase.com) project with production credentials
- A [Spotify Developer](https://developer.spotify.com/dashboard) application
- The Groove repository pushed to GitHub

## Backend Deployment (Render)

### Step 1: Create a New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Select the Groove repository

### Step 2: Configure Service Settings

| Setting | Value |
|---------|-------|
| Name | `groove-api` |
| Region | Oregon (or preferred) |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |

### Step 3: Configure Health Check

- **Health Check Path**: `/health`
- This endpoint returns `{ "status": "ok", "message": "Groove backend is running" }`

### Step 4: Set Environment Variables

Navigate to **Environment** tab and add the following variables:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Set to `production` |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SPOTIFY_CLIENT_ID` | Spotify application Client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify application Client Secret |
| `SPOTIFY_REDIRECT_URI` | `https://<your-service>.onrender.com/api/auth/callback` |
| `FRONTEND_URL` | Your Vercel frontend URL (e.g., `https://groove.vercel.app`) |

> **Note**: `PORT` is automatically set by Render. Do not configure it manually.

### Step 5: Deploy

1. Click **Create Web Service**
2. Wait for the build and deployment to complete
3. Note your service URL (e.g., `https://groove-api.onrender.com`)

### Alternative: Blueprint Deployment

If you prefer automated configuration:

1. The repository includes `backend/render.yaml` with pre-configured settings
2. In Render Dashboard, click **New** → **Blueprint**
3. Connect your repository
4. Render will detect and apply the configuration
5. You still need to manually set secret environment variables

## Frontend Deployment (Vercel)

### Step 1: Import Project

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Select the Groove repository

### Step 2: Configure Project Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js (auto-detected) |
| Root Directory | `frontend` |
| Build Command | `npm run build` (default) |
| Install Command | `npm install` (default) |
| Node.js Version | 20.x |

### Step 3: Set Environment Variables

Add the following environment variables in the **Environment Variables** section:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase public/anon key |
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g., `https://groove-api.onrender.com/api`) |

> **Important**: All `NEXT_PUBLIC_` variables are exposed to the browser. Only use for non-sensitive values.

### Step 4: Deploy

1. Click **Deploy**
2. Wait for the build to complete
3. Note your deployment URL (e.g., `https://groove.vercel.app`)

### Step 5: Update Backend CORS

After obtaining your Vercel URL, update the backend's `FRONTEND_URL` environment variable in Render to match exactly.

## Spotify Dashboard Configuration

### Step 1: Access Your Application

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in and select your Groove application

### Step 2: Add Production Redirect URI

1. Click **Settings**
2. Scroll to **Redirect URIs**
3. Click **Add URI**
4. Enter: `https://<your-render-service>.onrender.com/api/auth/callback`
5. Click **Add**, then **Save**

> **Critical**: The redirect URI must match your `SPOTIFY_REDIRECT_URI` environment variable exactly, including protocol and path.

### Step 3: Retrieve Credentials

From the Settings page, copy:
- **Client ID** → Set as `SPOTIFY_CLIENT_ID` in Render
- **Client Secret** (click "View client secret") → Set as `SPOTIFY_CLIENT_SECRET` in Render

### Step 4: Configure User Access (Development Mode)

While in development mode (before quota extension approval):

1. Go to **User Management**
2. Add Spotify email addresses of test users
3. Maximum 25 users in development mode

### Step 5: Request Extended Quota (Optional)

For public release with more than 25 users:

1. Click **Request Extension** in your app dashboard
2. Complete the quota extension form
3. Provide app description, screenshots, and use case
4. Wait for Spotify approval (typically 1-2 weeks)

## Environment Variables Reference

### Backend (Render)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `PORT` | Auto | Server port (set by Render) | - |
| `SUPABASE_URL` | Yes | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | `eyJhbGc...` |
| `SPOTIFY_CLIENT_ID` | Yes | Spotify app Client ID | `abc123...` |
| `SPOTIFY_CLIENT_SECRET` | Yes | Spotify app Client Secret | `xyz789...` |
| `SPOTIFY_REDIRECT_URI` | Yes | OAuth callback URL | `https://groove-api.onrender.com/api/auth/callback` |
| `FRONTEND_URL` | Yes | Vercel frontend URL | `https://groove.vercel.app` |

### Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase public key | `sb_publishable_...` |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | `https://groove-api.onrender.com/api` |



## Deployment Verification

After deploying both services, verify the deployment is successful using this checklist.

### 1. Health Check Verification

Test the backend health endpoint:

```bash
curl https://<your-render-service>.onrender.com/health
```

**Expected Response**:
```json
{"status":"ok","message":"Groove backend is running"}
```

**Status Code**: 200

If the health check fails:
- Check Render logs for startup errors
- Verify all environment variables are set
- Ensure the service has finished deploying

### 2. CORS Verification

Test that CORS is properly configured:

1. Open your Vercel frontend in a browser
2. Open browser Developer Tools (F12) → Network tab
3. Trigger an API request (e.g., attempt to log in)
4. Check for CORS errors in the Console tab

**Success Indicators**:
- No CORS errors in console
- API requests show proper response headers
- `Access-Control-Allow-Origin` header matches your frontend URL

**If CORS errors occur**:
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Ensure no trailing slash in the URL
- Include the protocol (`https://`)

### 3. OAuth Flow Verification

Test the complete Spotify authentication flow:

1. Navigate to your production frontend
2. Click "Login with Spotify"
3. Verify redirect to Spotify authorization page
4. Authorize the application
5. Verify redirect back to your frontend
6. Confirm you're logged in and can see your profile

**If OAuth fails**:
- Check `SPOTIFY_REDIRECT_URI` matches Spotify Dashboard exactly
- Verify Client ID and Client Secret are correct
- Ensure the user is added to User Management (development mode)
- Check Render logs for detailed error messages

### 4. API Integration Verification

Test that the frontend can communicate with the backend:

1. Log in to the application
2. Navigate to the playlist gallery
3. Verify playlists load from Spotify
4. Test playback controls (play, pause, skip)

**Success Indicators**:
- Playlists display with album artwork
- Playback controls respond correctly
- No network errors in browser console

### 5. Image Loading Verification

Verify Spotify album artwork displays correctly:

1. Browse playlists with album art
2. Check that images load from Spotify CDN
3. Verify no broken image icons

**If images fail to load**:
- Check `next.config.mjs` includes Spotify CDN domains
- Verify the following domains are configured:
  - `mosaic.scdn.co`
  - `i.scdn.co`
  - `image-cdn-ak.spotifycdn.com`

### Quick Verification Commands

```bash
# Test backend health
curl -s https://groove-api.onrender.com/health | jq

# Test CORS headers (replace URLs with your actual URLs)
curl -I -X OPTIONS https://groove-api.onrender.com/api/auth/login \
  -H "Origin: https://groove.vercel.app" \
  -H "Access-Control-Request-Method: GET"

# Check if frontend is accessible
curl -I https://groove.vercel.app
```

## Troubleshooting

### Backend Issues

#### Service Won't Start
- **Cause**: Missing environment variables or build errors
- **Solution**: Check Render logs, verify all required env vars are set

#### Health Check Failing
- **Cause**: Server not binding to correct port
- **Solution**: Ensure `server.js` uses `process.env.PORT`

#### Database Connection Errors
- **Cause**: Invalid Supabase credentials
- **Solution**: Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct

### Frontend Issues

#### Build Failures
- **Cause**: Missing dependencies or syntax errors
- **Solution**: Check Vercel build logs, run `npm run build` locally

#### API Requests Failing
- **Cause**: Incorrect `NEXT_PUBLIC_API_URL`
- **Solution**: Verify URL points to Render backend with `/api` suffix

#### Images Not Loading
- **Cause**: Missing remote patterns in Next.js config
- **Solution**: Verify `next.config.mjs` includes Spotify CDN domains

### Authentication Issues

#### "Invalid redirect URI" from Spotify
- **Cause**: Redirect URI mismatch
- **Solution**: Ensure `SPOTIFY_REDIRECT_URI` exactly matches Spotify Dashboard

#### "User not registered" Error
- **Cause**: User not added in development mode
- **Solution**: Add user's Spotify email to User Management

#### "Invalid client" Error
- **Cause**: Wrong Client ID
- **Solution**: Verify `SPOTIFY_CLIENT_ID` matches Spotify Dashboard

#### OAuth Callback Errors
- **Cause**: Various configuration issues
- **Solution**: Check Render logs for detailed error messages

### CORS Issues

#### "Access-Control-Allow-Origin" Errors
- **Cause**: `FRONTEND_URL` doesn't match Vercel URL
- **Solution**: Update `FRONTEND_URL` to match exactly (no trailing slash)

#### Preflight Request Failures
- **Cause**: CORS middleware not configured correctly
- **Solution**: Verify `credentials: true` is set in CORS config

### Performance Issues

#### Slow Initial Load (Render)
- **Cause**: Free tier services spin down after inactivity
- **Solution**: First request after idle period takes longer; consider paid tier

#### API Timeouts
- **Cause**: Cold start or network issues
- **Solution**: Implement retry logic in frontend, consider upgrading Render plan

## Related Documentation

- [Render Deployment Details](backend/RENDER_DEPLOYMENT.md)
- [Spotify OAuth Setup](backend/SPOTIFY_OAUTH_SETUP.md)
- [Database Setup Checklist](backend/SETUP_CHECKLIST.md)
- [Frontend Configuration](frontend/CONFIGURATION.md)
- [Web Player Setup](WEB_PLAYER_SETUP.md)
