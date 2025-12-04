# Database Setup Checklist

Use this checklist to ensure your Supabase database is properly configured for Groove.

## Pre-Setup

- [ ] Created a Supabase project at https://app.supabase.com
- [ ] Copied project URL and API keys
- [ ] Created `.env` file from `.env.example`
- [ ] Added `SUPABASE_URL` to `.env`
- [ ] Added `SUPABASE_ANON_KEY` to `.env`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to `.env` (for setup only)

## Database Schema Setup

- [ ] Opened Supabase Dashboard → SQL Editor
- [ ] Ran `001_initial_schema.sql` migration
  - [ ] Verified 4 tables created (users, auth_tokens, vinyl_designs, error_logs)
  - [ ] Verified indexes created
  - [ ] Verified triggers created
- [ ] Ran `002_rls_policies.sql` migration
  - [ ] Verified RLS enabled on all tables
  - [ ] Verified policies created
- [ ] Ran `003_storage_setup.sql` migration
  - [ ] Verified vinyl-images bucket created
  - [ ] Verified storage policies created

## Verification

- [ ] Ran `npm run db:verify` successfully
- [ ] All tables exist and are accessible
- [ ] Storage bucket is configured
- [ ] CRUD operations work

## Testing

- [ ] Created a test user record
- [ ] Created a test auth token
- [ ] Created a test vinyl design
- [ ] Uploaded a test image to vinyl-images bucket
- [ ] Verified RLS policies (can only see own data)
- [ ] Deleted test records

## Configuration

- [ ] Removed `SUPABASE_SERVICE_ROLE_KEY` from `.env` (keep it secure!)
- [ ] Verified `SUPABASE_ANON_KEY` is set for application use
- [ ] Configured Spotify OAuth credentials
- [ ] Configured Apple Music credentials (if using)

## Documentation Review

- [ ] Read `DATABASE_SETUP.md` for detailed instructions
- [ ] Reviewed `SCHEMA_DIAGRAM.md` to understand relationships
- [ ] Read `migrations/README.md` for migration details

## Next Steps

- [ ] Implement authentication endpoints (`/api/auth/*`)
- [ ] Implement playlist endpoints (`/api/playlists`)
- [ ] Implement playback endpoints (`/api/playback/*`)
- [ ] Test OAuth flow with Spotify
- [ ] Test OAuth flow with Apple Music (if using)

## Troubleshooting

If you encounter issues:

1. Check Supabase Dashboard → Database → Tables
2. Check Supabase Dashboard → Storage → Buckets
3. Review error messages in SQL Editor
4. Verify environment variables are correct
5. Ensure you're using service role key for setup
6. Check RLS policies aren't blocking operations

## Quick Commands

```bash
# Verify database setup
npm run db:verify

# Check if tables exist
# Run in Supabase SQL Editor:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

# Check if RLS is enabled
# Run in Supabase SQL Editor:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

# Check storage bucket
# Run in Supabase SQL Editor:
SELECT * FROM storage.buckets WHERE id = 'vinyl-images';
```

## Success Criteria

✅ All checkboxes above are checked
✅ `npm run db:verify` passes all checks
✅ Can create, read, update, and delete test records
✅ Storage bucket accepts image uploads
✅ RLS policies properly restrict access

---

**Setup Complete!** 🎉

You're ready to start building the Groove application.
