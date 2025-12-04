# Groove Backend

Express.js backend service for the Groove vinyl Spotify player application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your configuration:
```bash
cp .env.example .env
```

3. Configure your environment variables:
   - Supabase URL and API key
   - Spotify OAuth credentials
   - Apple Music credentials (optional)

4. Set up the database schema:
   - See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions
   - Run migrations in `migrations/` directory via Supabase Dashboard or CLI
   - This creates tables for users, auth tokens, vinyl designs, and error logs

## Development

Start the development server with auto-reload:
```bash
npm run dev
```

## Production

Start the production server:
```bash
npm start
```

## Code Quality

Run ESLint:
```bash
npm run lint
```

Format code with Prettier:
```bash
npm run format
```

## Database Setup

Before running the application, you need to set up the database schema:

1. **Quick Start**: Follow [DATABASE_SETUP.md](./DATABASE_SETUP.md)
2. **Checklist**: Use [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) to track progress
3. **Schema Details**: See [migrations/SCHEMA_DIAGRAM.md](./migrations/SCHEMA_DIAGRAM.md)

```bash
# Verify database setup
npm run db:verify
```

## Project Structure

```
backend/
├── config/          # Configuration files (Supabase, etc.)
├── migrations/      # Database schema migrations
├── routes/          # API route handlers
├── scripts/         # Setup and utility scripts
├── services/        # Business logic and external API integrations
├── middleware/      # Custom middleware functions
├── server.js        # Main application entry point
└── package.json     # Dependencies and scripts
```

## API Endpoints

### Health Check
- `GET /health` - Check if the server is running

### Authentication (to be implemented)
- `POST /api/auth/spotify` - Initiate Spotify OAuth
- `POST /api/auth/apple` - Initiate Apple Music OAuth
- `POST /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Clear session

### Playlists (to be implemented)
- `GET /api/playlists` - Fetch user playlists
- `POST /api/playlists` - Create new playlist
- `PUT /api/playlists/:id/cover` - Update playlist cover

### Playback (to be implemented)
- `POST /api/playback/play` - Start playback
- `POST /api/playback/pause` - Pause playback
- `POST /api/playback/seek` - Seek to position
- `POST /api/playback/skip` - Skip forward/backward
- `GET /api/playback/state` - Get current playback state
