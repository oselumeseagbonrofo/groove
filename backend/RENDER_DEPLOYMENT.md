# Render Deployment Guide

This guide covers deploying the Groove backend API to Render.

## Prerequisites

- A [Render](https://render.com) account
- A configured Supabase project with production credentials
- A Spotify Developer application with OAuth configured

## Deployment Methods

### Option 1: Blueprint Deployment (Recommended)

1. Push the `render.yaml` file to your repository
2. In Render Dashboard, click "New" → "Blueprint"
3. Connect your repository
4. Render will automatically detect the configuration

### Option 2: Manual Web Service

1. In Render Dashboard, click "New" → "Web Service"
2. Connect your repository
3. Configure the following settings:
   - **Name**: `groove-api`
   - **Region**: Oregon (or your preferred region)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

## Required Environment Variables

Configure these environment variables in the Render Dashboard under your service's "Environment" tab:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (auto-set by Render) | Leave blank - Render sets this automatically |
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIs...` |
| `SPOTIFY_CLIENT_ID` | Spotify application client ID | `abc123def456...` |
| `SPOTIFY_CLIENT_SECRET` | Spotify application client secret | `xyz789ghi012...` |
| `SPOTIFY_REDIRECT_URI` | OAuth callback URL (must match Spotify Dashboard) | `https://groove-api.onrender.com/api/auth/callback` |
| `FRONTEND_URL` | Vercel frontend URL for CORS | `https://groove.vercel.app` |

### Environment Variable Details

#### SUPABASE_URL
- Found in Supabase Dashboard → Settings → API
- Use your production Supabase project URL

#### SUPABASE_ANON_KEY
- Found in Supabase Dashboard → Settings → API → Project API keys
- Use the `anon` / `public` key (not the service role key)

#### SPOTIFY_CLIENT_ID & SPOTIFY_CLIENT_SECRET
- Found in [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- Navigate to your application → Settings

#### SPOTIFY_REDIRECT_URI
- Must exactly match a URI registered in Spotify Developer Dashboard
- Format: `https://<your-render-service-name>.onrender.com/api/auth/callback`
- Add this URI to Spotify Dashboard → Your App → Settings → Redirect URIs

#### FRONTEND_URL
- Your Vercel deployment URL
- Used for CORS origin validation
- Example: `https://groove.vercel.app` or `https://your-app.vercel.app`

## Health Check Configuration

The service includes a health check endpoint:

- **Path**: `/health`
- **Expected Response**: `{ "status": "ok", "message": "Groove backend is running" }`
- **Status Code**: 200

Render will automatically monitor this endpoint to ensure service availability.

## Post-Deployment Verification

After deployment, verify the service is running correctly:

1. **Health Check**:
   ```bash
   curl https://your-service.onrender.com/health
   ```
   Expected: `{"status":"ok","message":"Groove backend is running"}`

2. **Check Render Logs**: Monitor the Render Dashboard logs for any startup errors

3. **Test OAuth Flow**: Attempt to authenticate via the frontend to verify Spotify integration

## Troubleshooting

### Service Won't Start
- Verify all required environment variables are set
- Check Render logs for missing dependencies or configuration errors

### CORS Errors
- Ensure `FRONTEND_URL` exactly matches your Vercel deployment URL
- Include the protocol (`https://`) but no trailing slash

### OAuth Redirect Mismatch
- Verify `SPOTIFY_REDIRECT_URI` exactly matches the URI in Spotify Developer Dashboard
- URIs are case-sensitive and must match exactly

### Database Connection Issues
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Ensure Supabase project is accessible from Render's IP ranges
