# Spotify Web Player Integration

## Problem

Spotify's API requires an active device (desktop app, mobile app, or web player) to control playback. Without one, you get a "No active device found" error.

## Solution

Integrated **Spotify Web Playback SDK** to create a browser-based player, eliminating the need for external Spotify apps.

## What Changed

### 1. Added Streaming Scope

**File:** `backend/routes/auth.js`

- Added `streaming` scope to Spotify OAuth permissions
- **Action Required:** Users must re-authenticate to get the new permission

### 2. Created Web Player Hook

**File:** `frontend/app/hooks/useSpotifyPlayer.js`

- Loads Spotify Web Playback SDK
- Creates a virtual device named "Groove Web Player"
- Provides `deviceId` for playback control

### 3. Created Access Token Hook

**File:** `frontend/app/hooks/useAccessToken.js`

- Fetches and refreshes Spotify access tokens
- Required for Web Playback SDK authentication

### 4. Added Token Endpoint

**File:** `backend/routes/auth.js`

- Added `GET /api/auth/token/:userId` endpoint
- Returns access token for client-side Web Playback SDK

### 5. Updated Playback Route

**File:** `backend/routes/playback.js`

- Added `deviceId` parameter support
- Routes playback to specific device (web player or external)
- Added `/devices` endpoint to list available devices

### 6. Updated Now Playing Page

**File:** `frontend/app/now-playing/page.js`

- Integrates web player
- Auto-transfers playback to web player when ready
- Shows status indicator when web player is active

### 7. Added SDK Script

**File:** `frontend/app/layout.js`

- Added Spotify Web Playback SDK script to HTML head
- Loads asynchronously for better performance

## How It Works

1. **User authenticates** → Gets `streaming` permission
2. **Page loads** → Web Playback SDK script loads
3. **SDK initializes** → Creates "Groove Web Player" device
4. **Player ready** → Device ID available for playback
5. **User plays music** → Automatically uses web player device
6. **No external app needed** → Music plays in browser

## User Experience

### Before

- ❌ "No active device found" error
- ❌ Must have Spotify app open
- ❌ Manual device switching

### After

- ✅ Works immediately in browser
- ✅ No external app required
- ✅ Automatic device selection
- ✅ Green status indicator when ready

## Testing

### 1. Clear Existing Auth (to get new permissions)

Existing users need to re-authenticate to get the `streaming` scope:

```bash
# In browser: Log out from Groove, then log back in
# Or clear localStorage and re-authenticate
```

### 2. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Test Web Player

1. Navigate to `http://localhost:3000`
2. Authenticate with Spotify (Premium account required)
3. Go to Now Playing page
4. Look for green banner: "✓ Web player ready - No Spotify app needed!"
5. Play a playlist - music should play in browser
6. Check browser console for "Spotify player ready with device ID: ..."

### 4. Verify No External App Needed

- Close Spotify desktop/mobile app completely
- Try playing music in Groove
- Should work without any "device not found" errors

## Fallback Behavior

If web player fails to initialize:

- Falls back to external Spotify devices
- Shows helpful error messages
- Suggests opening Spotify app

## Premium Requirement

⚠️ **Spotify Premium Required**: Web Playback SDK only works with Spotify Premium accounts. Free accounts will still need the Spotify app open.

## Troubleshooting

### "Authentication error" or "Account error"

- Ensure you're using a Spotify Premium account
- Re-authenticate to get the `streaming` scope

### Web player not initializing

- Check browser console for errors
- Ensure SDK script loaded: `window.Spotify` should be defined
- Verify access token is valid

### Music not playing

- Check if device ID is set (green banner should show)
- Verify playback is transferred to web player
- Check browser console for playback errors

## Next Steps (Optional)

1. **Device Selector UI**: Let users choose between web player and other devices
2. **Volume Control**: Add volume slider for web player
3. **Error Recovery**: Auto-retry web player initialization on failure
4. **Offline Detection**: Detect when user goes offline and show appropriate message
