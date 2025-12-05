-- Add unique constraint on user_id to auth_tokens table
-- This allows upsert operations to work correctly

-- First, remove any duplicate entries (keep the most recent)
DELETE FROM auth_tokens a
USING auth_tokens b
WHERE a.id < b.id
  AND a.user_id = b.user_id;

-- Add unique constraint
ALTER TABLE auth_tokens
ADD CONSTRAINT auth_tokens_user_id_unique UNIQUE (user_id);
