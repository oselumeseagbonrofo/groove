# Deployment Verification Checklist

Use this checklist to verify your Groove deployment is working correctly after deploying to Render (backend) and Vercel (frontend).

## Pre-Verification

Before running verification steps, ensure:

- [ ] Backend is deployed to Render and shows "Live" status
- [ ] Frontend is deployed to Vercel and shows "Ready" status
- [ ] All environment variables are configured in both services
- [ ] Spotify Developer Dashboard has production redirect URI

---

## 1. Health Check Verification

**Validates: Requirement 6.1** - Verify the health check endpoint returns successfully

### Steps

1. Open a terminal
2. Run the health check command:
   ```bash
   curl https://<your-render-service>.onrender.com/health
   ```
3. Verify the response

### Expected Result

```json
{"status":"ok","message":"Groove backend is running"}
```

### Checklist

- [ ] Health endpoint returns HTTP 200 status code
- [ ] Response body contains `"status": "ok"`
- [ ] Response body contains `"message": "Groove backend is running"`
- [ ] Response time is under 5 seconds (first request may be slower due to cold start)

### If Failed

- Check Render Dashboard for service status
- Review Render logs for startup errors
- Verify `PORT` environment variable is not manually set (Render sets it automatically)
- Ensure `npm start` command works locally

---

## 2. CORS Verification

**Validates: Requirement 6.3** - Verify frontend can fetch data from the backend API

### Steps

1. Open your production frontend URL in a browser
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to the **Console** tab
4. Go to the **Network** tab
5. Attempt to log in or trigger any API request
6. Check for CORS-related errors

### Expected Result

- No CORS errors in the Console
- API requests in Network tab show successful responses
- Response headers include `Access-Control-Allow-Origin`

### Checklist

- [ ] No "Access-Control-Allow-Origin" errors in console
- [ ] No "CORS policy" errors in console
- [ ] API requests return expected data (not blocked)
- [ ] Preflight OPTIONS requests succeed (if applicable)

### Verification Command

```bash
# Test CORS headers directly
curl -I -X OPTIONS https://<your-render-service>.onrender.com/api/auth/login \
  -H "Origin: https://<your-vercel-app>.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```

### If Failed

- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Ensure no trailing slash in `FRONTEND_URL`
- Confirm protocol is included (`https://`)
- Check that CORS middleware is configured with `credentials: true`

---

## 3. OAuth Flow Verification

**Validates: Requirement 6.2** - Verify Spotify OAuth flow completes without errors

### Steps

1. Open your production frontend in a new browser window (or incognito)
2. Click "Login with Spotify"
3. Observe the redirect to Spotify's authorization page
4. Log in with a Spotify account (must be in User Management if in dev mode)
5. Click "Agree" to authorize the application
6. Observe the redirect back to your frontend
7. Verify you're logged in

### Expected Result

- Smooth redirect to Spotify
- Successful authorization
- Redirect back to frontend with authenticated session
- User profile/data accessible

### Checklist

- [ ] "Login with Spotify" button redirects to Spotify
- [ ] Spotify authorization page displays correctly
- [ ] After authorization, redirects back to frontend
- [ ] No "Invalid redirect URI" error from Spotify
- [ ] No "User not registered" error (development mode)
- [ ] User session is established after redirect
- [ ] User profile information is accessible

### If Failed

**"Invalid redirect URI" error:**
- Verify `SPOTIFY_REDIRECT_URI` matches Spotify Dashboard exactly
- Check for typos, extra slashes, or protocol mismatches
- Ensure you saved changes in Spotify Dashboard

**"User not registered" error:**
- Add user's Spotify email to User Management in Spotify Dashboard
- Wait a few minutes for changes to propagate

**Redirect fails silently:**
- Check Render logs for error details
- Verify `FRONTEND_URL` is set correctly for post-auth redirect
- Ensure Supabase is configured to store auth tokens

---

## 4. API Integration Verification

**Validates: Requirement 6.3, 6.4** - Verify frontend can fetch data and playback controls function

### Steps

1. Log in to the application (complete OAuth flow first)
2. Navigate to the playlist gallery or home page
3. Verify playlists load from Spotify
4. Select a playlist and view tracks
5. Test playback controls (requires Spotify Premium for Web Playback SDK)

### Expected Result

- Playlists display with names and artwork
- Track lists load correctly
- Playback controls respond (Premium users)

### Checklist

- [ ] Playlists load and display correctly
- [ ] Album artwork images display (no broken images)
- [ ] Track information shows (name, artist, duration)
- [ ] Play button initiates playback (Premium users)
- [ ] Pause button pauses playback
- [ ] Skip/Previous buttons work correctly
- [ ] No network errors in browser console
- [ ] No 401/403 errors (authentication working)

### If Failed

**Playlists don't load:**
- Check Network tab for failed API requests
- Verify `NEXT_PUBLIC_API_URL` points to correct backend URL
- Check Render logs for backend errors

**Playback doesn't work:**
- Verify user has Spotify Premium (required for Web Playback SDK)
- Check that Spotify app is open on another device (for device transfer)
- Review browser console for SDK errors

---

## 5. Image Loading Verification

**Validates: Requirement 7.1, 7.2** - Verify Spotify album artwork displays correctly

### Steps

1. Navigate to any page with album artwork (playlists, now playing)
2. Inspect images in the browser
3. Check Network tab for image requests

### Expected Result

- All album artwork loads correctly
- Images load from Spotify CDN domains
- No broken image placeholders

### Checklist

- [ ] Album artwork displays on playlist cards
- [ ] Album artwork displays on now playing screen
- [ ] No broken image icons visible
- [ ] Images load from `mosaic.scdn.co`
- [ ] Images load from `i.scdn.co`
- [ ] Images load from `image-cdn-ak.spotifycdn.com`
- [ ] No 403 errors for image requests

### If Failed

- Verify `next.config.mjs` includes all Spotify CDN domains in `remotePatterns`
- Redeploy frontend after config changes
- Check browser console for image-related errors

---

## Quick Verification Summary

Run these commands for a quick status check:

```bash
# 1. Health Check
echo "=== Health Check ==="
curl -s https://<your-render-service>.onrender.com/health | jq

# 2. CORS Headers
echo "=== CORS Headers ==="
curl -s -I -X OPTIONS https://<your-render-service>.onrender.com/api/auth/login \
  -H "Origin: https://<your-vercel-app>.vercel.app" \
  -H "Access-Control-Request-Method: GET" | grep -i "access-control"

# 3. Frontend Accessibility
echo "=== Frontend Status ==="
curl -s -I https://<your-vercel-app>.vercel.app | head -1
```

---

## Final Verification Checklist

Complete all sections above, then confirm:

- [ ] **Health Check**: Backend responds with status "ok"
- [ ] **CORS**: No cross-origin errors in browser console
- [ ] **OAuth**: Complete login flow works end-to-end
- [ ] **API Integration**: Playlists load and playback works
- [ ] **Images**: Album artwork displays correctly

---

## Post-Verification

After successful verification:

- [ ] Document your production URLs for team reference
- [ ] Set up monitoring/alerts in Render Dashboard (optional)
- [ ] Configure custom domain if desired
- [ ] Test with multiple users (if in development mode, add them first)
- [ ] Consider upgrading from free tier for production use

## Troubleshooting Reference

For detailed troubleshooting steps, see:
- [DEPLOYMENT.md - Troubleshooting Section](DEPLOYMENT.md#troubleshooting)
- [Render Deployment Guide](backend/RENDER_DEPLOYMENT.md)
- [Spotify OAuth Setup](backend/SPOTIFY_OAUTH_SETUP.md)
