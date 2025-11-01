-- database/create-favorites-table.sql
-- SQL migration to create the favorites table in Supabase

-- Create the favorites table
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

-- Add updated_at trigger (automatically update updated_at on row changes)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_favorites_updated_at BEFORE UPDATE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Note: Since we're using wallet signature verification in the API,
-- we can restrict RLS or allow API to bypass it using service role key.
-- The service role key (used in API routes) bypasses RLS automatically.
-- If you want extra security, you can add policies here, but our signature
-- verification in the API layer provides sufficient protection.

