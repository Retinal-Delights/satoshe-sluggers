-- database/create-favorites-table-safe.sql
-- Safe SQL migration that handles existing objects

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS update_favorites_updated_at ON favorites;

-- Drop function if it exists (optional - only if you want to recreate it)
-- Uncomment the next line if you want to recreate the function
-- DROP FUNCTION IF EXISTS update_updated_at_column();

-- Create the favorites table (IF NOT EXISTS handles existing table)
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) NOT NULL, -- Ethereum address (0x...)
  token_id VARCHAR(50) NOT NULL,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  rarity TEXT NOT NULL,
  rank TEXT NOT NULL,
  rarity_percent TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one wallet can only favorite a token once
  UNIQUE(wallet_address, token_id)
);

-- Create index for fast lookups by wallet address
CREATE INDEX IF NOT EXISTS idx_favorites_wallet_address ON favorites(wallet_address);

-- Create index for fast lookups by token_id (optional, but helpful for analytics)
CREATE INDEX IF NOT EXISTS idx_favorites_token_id ON favorites(token_id);

-- Create or replace the function (handles existing function)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger (DROP IF EXISTS handles existing trigger)
CREATE TRIGGER update_favorites_updated_at BEFORE UPDATE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

