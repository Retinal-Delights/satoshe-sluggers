-- database/check-table-exists.sql
-- Quick SQL to check if the table was created successfully

-- Check if table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'favorites'
ORDER BY ordinal_position;

-- Count rows (should be 0 if table is new)
SELECT COUNT(*) as total_favorites FROM favorites;

