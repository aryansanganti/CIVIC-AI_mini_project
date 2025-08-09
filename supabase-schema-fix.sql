-- Run this to fix the category constraint issue

-- 1. First, drop the existing check constraint
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_category_check;

-- 2. Add the updated constraint with correct categories
ALTER TABLE issues ADD CONSTRAINT issues_category_check 
CHECK (category IN ('Roads', 'Sanitation', 'Electricity', 'Water Supply', 'Public Safety', 'Others'));

-- 3. Update any existing data that might have different category names
UPDATE issues SET category = 'Roads' WHERE category IN ('roads', 'ROADS');
UPDATE issues SET category = 'Sanitation' WHERE category IN ('sanitation', 'SANITATION');
UPDATE issues SET category = 'Electricity' WHERE category IN ('electricity', 'ELECTRICITY');
UPDATE issues SET category = 'Water Supply' WHERE category IN ('water supply', 'WATER SUPPLY', 'water_supply');
UPDATE issues SET category = 'Public Safety' WHERE category IN ('public safety', 'PUBLIC SAFETY', 'public_safety');
UPDATE issues SET category = 'Others' WHERE category IN ('others', 'OTHERS', 'other');

-- 4. Also fix priority constraint
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_priority_check;
ALTER TABLE issues ADD CONSTRAINT issues_priority_check 
CHECK (priority IN ('Low', 'Medium', 'High'));

-- 5. Fix status constraint
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_status_check;
ALTER TABLE issues ADD CONSTRAINT issues_status_check 
CHECK (status IN ('Pending', 'In Progress', 'Resolved'));