# Database Setup Guide

Quick guide to set up the Groove database schema in Supabase.

## Prerequisites

1. A Supabase project (create one at https://app.supabase.com)
2. Your project's connection details:
   - Project URL
   - Anon/Public key
   - Service role key (for setup only)

## Quick Setup (5 minutes)

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Run Database Migrations

**Option A: Using Supabase Dashboard (Easiest)**

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Run each migration file in order:
   - Copy content from `backend/migrations/001_initial_schema.sql`
   - Paste into SQL Editor and click **Run**
   - Repeat for `002_rls_policies.sql`
   - Repeat for `003_storage_setup.sql`

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Step 4: Verify Setup

Run this query in the SQL Editor to verify:

```sql
-- Should return 4 tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should return the vinyl-images bucket
SELECT * FROM storage.buckets WHERE id = 'vinyl-images';
```

Expected tables:
- `auth_tokens`
- `error_logs`
- `users`
- `vinyl_designs`

## Database Schema Overview

```
users
├── id (UUID, PK)
├── provider (spotify/apple)
├── provider_id
├── email
└── display_name

auth_tokens
├── id (UUID, PK)
├── user_id (FK → users)
├── access_token
├── refresh_token
└── expires_at

vinyl_designs
├── id (UUID, PK)
├── user_id (FK → users)
├── playlist_id
├── color (hex)
└── custom_image_url

error_logs
├── id (UUID, PK)
├── user_id (FK → users)
├── error_type
├── error_message
└── stack_trace

storage.buckets
└── vinyl-images (4MB limit, JPEG/PNG only)
```

## Security Features

✅ **Row Level Security (RLS)** enabled on all tables
✅ **Users can only access their own data**
✅ **Service role required for admin operations**
✅ **Image uploads limited to 4MB, JPEG/PNG only**
✅ **Automatic token cleanup on user deletion (CASCADE)**

## Testing the Setup

### Test 1: Create a Test User

```sql
INSERT INTO users (provider, provider_id, email, display_name)
VALUES ('spotify', 'test_user_123', 'test@example.com', 'Test User')
RETURNING *;
```

### Test 2: Add Auth Token

```sql
INSERT INTO auth_tokens (user_id, access_token, refresh_token, expires_at)
VALUES (
  (SELECT id FROM users WHERE provider_id = 'test_user_123'),
  'test_access_token',
  'test_refresh_token',
  NOW() + INTERVAL '1 hour'
)
RETURNING *;
```

### Test 3: Create Vinyl Design

```sql
INSERT INTO vinyl_designs (user_id, playlist_id, color)
VALUES (
  (SELECT id FROM users WHERE provider_id = 'test_user_123'),
  'playlist_123',
  '#FF5733'
)
RETURNING *;
```

### Test 4: Upload Test Image

Use the Supabase Storage UI:
1. Go to **Storage** → **vinyl-images**
2. Click **Upload file**
3. Upload a test JPEG or PNG (max 4MB)

## Common Issues

### Issue: "permission denied for table users"
**Solution**: Make sure you're using the service role key for setup operations.

### Issue: "relation 'users' already exists"
**Solution**: Tables already exist. Either drop them first or skip the migration.

### Issue: "bucket 'vinyl-images' already exists"
**Solution**: Bucket already created. You can skip the storage setup migration.

### Issue: RLS policies blocking queries
**Solution**: Ensure you're authenticated or using the service role key for admin operations.

## Next Steps

After database setup is complete:

1. ✅ Database schema created
2. ⏭️ Implement authentication endpoints (`/api/auth/*`)
3. ⏭️ Implement playlist endpoints (`/api/playlists`)
4. ⏭️ Implement playback endpoints (`/api/playback/*`)
5. ⏭️ Test OAuth flow with Spotify/Apple Music

## Need Help?

- 📚 [Supabase Documentation](https://supabase.com/docs)
- 🔐 [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- 💾 [Storage Documentation](https://supabase.com/docs/guides/storage)
