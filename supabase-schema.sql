-- Civic Issue Management Database Schema
-- Execute these commands in your Supabase SQL editor

-- 1. Create issues table
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Roads', 'Sanitation', 'Electricity', 'Water Supply', 'Public Safety', 'Others')),
    priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    address TEXT NOT NULL,
    image_urls TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_issues_reporter_id ON issues(reporter_id);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);
CREATE INDEX IF NOT EXISTS idx_issues_location ON issues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_issues_anonymous ON issues(is_anonymous);

-- 3. Create updated_at trigger function (replace if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
CREATE TRIGGER update_issues_updated_at 
    BEFORE UPDATE ON issues 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('issue-images', 'issue-images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Set up Row Level Security (RLS) policies

-- Enable RLS on issues table
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Citizens can create issues" ON issues;
DROP POLICY IF EXISTS "Citizens can view own issues" ON issues;
DROP POLICY IF EXISTS "Authenticated users can view all issues" ON issues;
DROP POLICY IF EXISTS "Authenticated users can update issues" ON issues;
DROP POLICY IF EXISTS "Anonymous can create issues" ON issues;
DROP POLICY IF EXISTS "Public can view non-sensitive issues" ON issues;

-- Citizens and anonymous users can insert issues
CREATE POLICY "Citizens can create issues" ON issues
    FOR INSERT WITH CHECK (
        (auth.uid() = reporter_id) OR 
        (is_anonymous = true AND reporter_id IS NULL)
    );

-- Citizens can view their own issues
CREATE POLICY "Citizens can view own issues" ON issues
    FOR SELECT USING (auth.uid() = reporter_id);

-- Public can view anonymous issues (for officers dashboard)
CREATE POLICY "Public can view anonymous issues" ON issues
    FOR SELECT USING (is_anonymous = true);

-- Authenticated users can view all issues (for officers)
CREATE POLICY "Officers can view all issues" ON issues
    FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can update all issues (for officers)
CREATE POLICY "Officers can update issues" ON issues
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Storage policies for issue-images bucket

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload issue images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view issue images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own issue images" ON storage.objects;

-- Users can upload images (both authenticated and anonymous)
CREATE POLICY "Users can upload issue images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'issue-images' AND (
            auth.role() = 'authenticated' OR
            auth.role() = 'anon'
        )
    );

-- Public can view all issue images
CREATE POLICY "Public can view issue images" ON storage.objects
    FOR SELECT USING (bucket_id = 'issue-images');

-- Authenticated users can delete issue images
CREATE POLICY "Users can delete issue images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'issue-images' AND
        auth.role() = 'authenticated'
    );

-- 7. Create or replace view for issue statistics
CREATE OR REPLACE VIEW issue_stats AS
SELECT 
    COUNT(*) as total_issues,
    COUNT(*) FILTER (WHERE status = 'Pending') as pending_issues,
    COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress_issues,
    COUNT(*) FILTER (WHERE status = 'Resolved') as resolved_issues,
    COUNT(*) FILTER (WHERE priority = 'High') as high_priority_issues,
    COUNT(*) FILTER (WHERE priority = 'Medium') as medium_priority_issues,
    COUNT(*) FILTER (WHERE priority = 'Low') as low_priority_issues,
    COUNT(*) FILTER (WHERE category = 'Roads') as roads_issues,
    COUNT(*) FILTER (WHERE category = 'Sanitation') as sanitation_issues,
    COUNT(*) FILTER (WHERE category = 'Electricity') as electricity_issues,
    COUNT(*) FILTER (WHERE category = 'Water Supply') as water_supply_issues,
    COUNT(*) FILTER (WHERE category = 'Public Safety') as public_safety_issues,
    COUNT(*) FILTER (WHERE category = 'Others') as other_issues,
    COUNT(*) FILTER (WHERE is_anonymous = true) as anonymous_issues,
    COUNT(*) FILTER (WHERE is_anonymous = false) as registered_issues
FROM issues;

-- 8. Create or replace function to get nearby issues
CREATE OR REPLACE FUNCTION get_nearby_issues(
    user_lat FLOAT,
    user_lng FLOAT,
    radius_km FLOAT DEFAULT 5.0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    category TEXT,
    priority TEXT,
    status TEXT,
    is_anonymous BOOLEAN,
    distance_km FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.title,
        i.category,
        i.priority,
        i.status,
        i.is_anonymous,
        (6371 * acos(cos(radians(user_lat)) * cos(radians(i.latitude)) * 
         cos(radians(i.longitude) - radians(user_lng)) + 
         sin(radians(user_lat)) * sin(radians(i.latitude))))::FLOAT as distance_km
    FROM issues i
    WHERE (6371 * acos(cos(radians(user_lat)) * cos(radians(i.latitude)) * 
           cos(radians(i.longitude) - radians(user_lng)) + 
           sin(radians(user_lat)) * sin(radians(i.latitude)))) <= radius_km
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- 9. Create comments table (optional - for future use)
CREATE TABLE IF NOT EXISTS issue_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_official BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON issue_comments(created_at);

-- Enable RLS on comments
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing comment policies
DROP POLICY IF EXISTS "Users can create comments" ON issue_comments;
DROP POLICY IF EXISTS "Users can view comments" ON issue_comments;

-- Comments policies
CREATE POLICY "Users can create comments" ON issue_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view comments" ON issue_comments
    FOR SELECT USING (true); -- Public read access to comments

-- 10. Create notifications table (optional)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL,
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing notification policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Insert some sample data for testing (optional)
-- Uncomment the following lines if you want sample data

/*
INSERT INTO issues (title, description, category, priority, latitude, longitude, address, is_anonymous, status) VALUES
('Pothole on Main Street', 'Large pothole causing traffic issues', 'Roads', 'High', 40.7128, -74.0060, '123 Main Street, New York, NY', false, 'Pending'),
('Broken Streetlight', 'Streetlight not working for past week', 'Electricity', 'Medium', 40.7589, -73.9851, '456 Broadway, New York, NY', true, 'Pending'),
('Garbage Collection Issue', 'Garbage not collected for 3 days', 'Sanitation', 'High', 40.7505, -73.9934, '789 5th Avenue, New York, NY', false, 'In Progress');
*/
