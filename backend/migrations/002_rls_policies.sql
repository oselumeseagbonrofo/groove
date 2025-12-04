-- Groove Vinyl Spotify Player - Row Level Security Policies
-- This migration sets up RLS policies to ensure users can only access their own data

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE vinyl_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can read their own user record
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can update their own user record
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Service role can insert users (for OAuth flow)
CREATE POLICY "Service role can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Auth tokens table policies
-- Users can read their own tokens
CREATE POLICY "Users can view their own tokens"
  ON auth_tokens
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Service role can manage tokens (for OAuth and refresh flows)
CREATE POLICY "Service role can insert tokens"
  ON auth_tokens
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update tokens"
  ON auth_tokens
  FOR UPDATE
  USING (true);

CREATE POLICY "Service role can delete tokens"
  ON auth_tokens
  FOR DELETE
  USING (true);

-- Vinyl designs table policies
-- Users can view their own vinyl designs
CREATE POLICY "Users can view their own vinyl designs"
  ON vinyl_designs
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Users can insert their own vinyl designs
CREATE POLICY "Users can create their own vinyl designs"
  ON vinyl_designs
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own vinyl designs
CREATE POLICY "Users can update their own vinyl designs"
  ON vinyl_designs
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Users can delete their own vinyl designs
CREATE POLICY "Users can delete their own vinyl designs"
  ON vinyl_designs
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Error logs table policies
-- Users can view their own error logs
CREATE POLICY "Users can view their own error logs"
  ON error_logs
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Service role can insert error logs
CREATE POLICY "Service role can insert error logs"
  ON error_logs
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all error logs (optional - requires admin role setup)
-- CREATE POLICY "Admins can view all error logs"
--   ON error_logs
--   FOR SELECT
--   USING (auth.jwt() ->> 'role' = 'admin');
