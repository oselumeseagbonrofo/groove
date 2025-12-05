# Spotify OAuth Configuration for Production

This guide documents the steps to configure Spotify OAuth for production deployment of the Groove application.

## Prerequisites

- A Spotify account (free or premium)
- Access to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- Your Render backend URL (e.g., `https://groove-api.onrender.com`)

## Step 1: Access Your Spotify Application

1. Navigate to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Select your existing Groove application (or create one if needed)

## Step 2: Add Production Redirect URI

The redirect URI is where Spotify sends users after authentication. For production, this must point to your Render backend.

### URI Format

```
https://<render-backend-url>/api/auth/callback
```

### Example URIs

| Environment | Redirect URI |
|-------------|--------------|
| Local Development | `http://localhost:3001/api/auth/callback` |
| Production (Render) | `https://groove-api.onrender.com/api/auth/callback` |

### Adding the Redirect URI

1. In your Spotify application, click **Settings**
2. Scroll to the **Redirect URIs** section
3. Click **Add URI**
4. Enter your production redirect URI:
   ```
   https://<your-render-service-name>.onrender.com/api/auth/callback
   ```
5. Click **Add**
6. Click **Save** at the bottom of the page

> **Important**: The redirect URI must match EXACTLY what you configure in your `SPOTIFY_REDIRECT_URI` environment variable on Render. This includes:
> - Protocol (`https://`)
> - Domain name
> - Path (`/api/auth/callback`)
> - No trailing slash

## Step 3: Verify Application Settings

Ensure your Spotify application has the correct settings:

### Basic Information
- **App Name**: Groove (or your chosen name)
- **App Description**: A vinyl-themed music player
- **Website**: Your Vercel frontend URL (optional)

### APIs Used
Ensure the following APIs are enabled:
- Web API
- Web Playback SDK (for premium users)

### User Management (Development Mode)
While in development mode, you must add test users:

1. Go to **User Management** in your app settings
2. Add the Spotify email addresses of users who need access
3. Maximum 25 users in development mode

### Requesting Extended Quota (Production)
For public release with more than 25 users:

1. Click **Request Extension** in your app dashboard
2. Complete the quota extension request form
3. Provide app description, screenshots, and use case details
4. Wait for Spotify approval (typically 1-2 weeks)

## Step 4: Retrieve Credentials

You'll need these credentials for your Render environment variables:

### Client ID
1. In your app's **Settings** page
2. Copy the **Client ID** value
3. Set as `SPOTIFY_CLIENT_ID` in Render

### Client Secret
1. In your app's **Settings** page
2. Click **View client secret**
3. Copy the secret value
4. Set as `SPOTIFY_CLIENT_SECRET` in Render

> **Security Note**: Never commit your Client Secret to version control. Always use environment variables.

## Step 5: Configure Render Environment Variables

Set these Spotify-related environment variables in your Render service:

| Variable | Value |
|----------|-------|
| `SPOTIFY_CLIENT_ID` | Your Spotify application Client ID |
| `SPOTIFY_CLIENT_SECRET` | Your Spotify application Client Secret |
| `SPOTIFY_REDIRECT_URI` | `https://<your-render-service>.onrender.com/api/auth/callback` |

## Verification Checklist

After configuration, verify the following:

- [ ] Production redirect URI added to Spotify Dashboard
- [ ] Redirect URI matches `SPOTIFY_REDIRECT_URI` environment variable exactly
- [ ] Client ID and Client Secret are set in Render
- [ ] Test users added (if in development mode)
- [ ] OAuth flow completes successfully from production frontend

## Testing the OAuth Flow

1. Navigate to your production frontend (Vercel URL)
2. Click "Login with Spotify"
3. You should be redirected to Spotify's authorization page
4. After authorizing, you should be redirected back to your frontend
5. Verify you can access your playlists and control playback

## Troubleshooting

### "Invalid redirect URI" Error
- Verify the redirect URI in Spotify Dashboard matches exactly
- Check for typos, extra slashes, or protocol mismatches
- Ensure you clicked "Save" after adding the URI

### "User not registered" Error (Development Mode)
- Add the user's Spotify email to User Management
- Wait a few minutes for changes to propagate

### "Invalid client" Error
- Verify `SPOTIFY_CLIENT_ID` is correct
- Ensure no extra whitespace in the environment variable

### "Invalid client secret" Error
- Verify `SPOTIFY_CLIENT_SECRET` is correct
- Regenerate the secret if needed (update in both places)

### OAuth Callback Returns Error
- Check Render logs for detailed error messages
- Verify `FRONTEND_URL` is set correctly for post-auth redirect
- Ensure Supabase is configured to store auth tokens

## Related Documentation

- [Render Deployment Guide](./RENDER_DEPLOYMENT.md)
- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization)
