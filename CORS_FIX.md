# CORS Fix for Production Deployment

## Problem
CORS error: Backend sends `https://groove-inky.vercel.app/` (with trailing slash) but browser requests from `https://groove-inky.vercel.app` (without trailing slash).

## Solution Applied

### 1. Backend Code Fixed ✅
Updated `backend/server.js` to handle origins with or without trailing slashes.

### 2. Update Render Environment Variables

Go to your Render dashboard and update these environment variables:

**FRONTEND_URL:**
```
https://groove-inky.vercel.app
```
⚠️ **Remove the trailing slash if it exists!**

**SPOTIFY_REDIRECT_URI:**
```
https://groove-api-ek96.onrender.com/api/auth/callback
```

### 3. Redeploy Backend

After updating environment variables:
1. Go to Render dashboard → groove-api service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete (~2-3 minutes)

### 4. Update Spotify Dashboard

Go to https://developer.spotify.com/dashboard and ensure your Redirect URIs include:

**Development:**
- `http://127.0.0.1:3001/api/auth/callback`
- `http://localhost:3001/api/auth/callback`

**Production:**
- `https://groove-api-ek96.onrender.com/api/auth/callback`

### 5. Verify Fix

After redeployment, test:
```bash
# Check CORS headers
curl -I -X OPTIONS \
  -H "Origin: https://groove-inky.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  https://groove-api-ek96.onrender.com/api/auth/spotify
```

Should return:
```
Access-Control-Allow-Origin: https://groove-inky.vercel.app
Access-Control-Allow-Credentials: true
```

## Quick Checklist

- [ ] Updated `backend/server.js` CORS config (already done)
- [ ] Removed trailing slash from `FRONTEND_URL` in Render
- [ ] Redeployed backend on Render
- [ ] Verified Spotify Dashboard redirect URIs
- [ ] Tested login flow on production site

## Common Issues

**If still getting CORS errors:**
1. Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
2. Check Render logs for CORS errors
3. Verify environment variables are saved (no trailing spaces)
4. Ensure backend redeployed after env var changes
