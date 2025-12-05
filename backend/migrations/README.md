# Database Migrations

This directory contains SQL migration files for setting up the Groove Vinyl Spotify Player database schema in Supabase.

## Overview

The database schema includes:
- **users**: User accounts from Spotify
- **auth_tokens**: OAuth access and refresh tokens
- **vinyl_designs**: Custom vinyl record designs for playlists
- **error_logs**: Application error logging
- **vinyl-images**: Storage bucket for custom vinyl label images

## Migration Files

Run these migrations in order:

1. **001_initial_schema.sql** - Creates core tables and indexes
2. **002_rls_policies.sql** - Sets up Row Level Security policies
3. **003_storage_setup.sql** - Creates storage bucket for vinyl images
4. **004_add_auth_tokens_unique_constraint.sql** - Adds unique constraint on auth_tokens.user_id

## Setup Methods

### Method 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file content in order
4. Click **Run** for each migration

### Method 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Initialize Supabase in your project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Method 3: Migration Script (Recommended for new migrations)

Run the Node.js migration script:

```bash
# Run all pending migrations
npm run db:migrate

# Run a specific migration
npm run db:migrate 004
```

The script will:
- Track which migrations have been applied
- Show you the SQL to run in Supabase dashboard
- Guide you through the process

**Note**: You'll need to manually execute the SQL in Supabase dashboard and then mark it as applied.

### Method 4: Setup Script

Run the Node.js setup script (requires service role key):

```bash
# Add SUPABASE_SERVICE_ROLE_KEY to your .env file
# Then run:
node scripts/setup-database.js
```

**Note**: The script validates migration files but you'll still need to run them via the dashboard or CLI.

## Environment Variables Required

Add these to your `.env` file:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Only for setup
```

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Users Table
- Users can view and update their own profile
- Service role can create users (OAuth flow)

### Auth Tokens Table
- Users can view their own tokens
- Service role manages all token operations

### Vinyl Designs Table
- Users have full CRUD access to their own designs
- Designs are isolated by user_id

### Error Logs Table
- Users can view their own error logs
- Service role can insert error logs

### Storage (vinyl-images bucket)
- Authenticated users can upload images (max 4MB, JPEG/PNG only)
- All users can view images (public bucket)
- Users can update/delete their own images

## Verification

After running migrations, verify the setup:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'vinyl-images';
```

## Rollback

If you need to rollback the migrations:

```sql
-- Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS error_logs CASCADE;
DROP TABLE IF EXISTS vinyl_designs CASCADE;
DROP TABLE IF EXISTS auth_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Remove storage bucket
DELETE FROM storage.buckets WHERE id = 'vinyl-images';
```

## Troubleshooting

### "relation already exists" errors
- Tables already exist. Either drop them first or skip that migration.

### RLS policy errors
- Ensure you're using the service role key for setup
- Check that auth.uid() is available in your Supabase project

### Storage bucket errors
- Verify the storage.buckets table exists
- Ensure you have the correct permissions

## Next Steps

After setting up the database:

1. Verify all tables are created
2. Test RLS policies with a test user
3. Upload a test image to the vinyl-images bucket
4. Configure your backend API to use these tables
5. Set up authentication endpoints to populate the users and auth_tokens tables
