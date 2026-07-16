-- Migration: Add ai_score column to products table
-- This stores pre-calculated AI scores for better performance

-- Add the column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS ai_score INTEGER DEFAULT 0;

-- Add index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_products_ai_score ON products(ai_score DESC);

-- Add index for category + score filtering
CREATE INDEX IF NOT EXISTS idx_products_category_score ON products(category, ai_score DESC);

-- Comment explaining the column
COMMENT ON COLUMN products.ai_score IS 'Pre-calculated AI performance score (0-100). Updated weekly by GitHub Actions.';