-- Add roasts column to photos table
ALTER TABLE photos ADD COLUMN IF NOT EXISTS roasts INTEGER DEFAULT 0;
