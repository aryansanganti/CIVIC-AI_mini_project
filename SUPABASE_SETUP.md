# Supabase Database Setup Guide

This guide will help you set up the Supabase database and storage for the Civic Issue Management system.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project

## Setup Steps

### 1. Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your-project-url
   EXPO_PUBLIC_SUPABASE_KEY=your-anon-public-key
   ```

You can find these values in your Supabase project dashboard under "Settings" > "API".

### 2. Database Schema Setup

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL commands

This will create:
- `issues` table with all required columns
- Indexes for better performance
- Row Level Security (RLS) policies
- Storage bucket for images
- Helper functions and views

### 3. Storage Setup

The SQL script automatically creates the `issue-images` storage bucket. You can verify this by:

1. Going to "Storage" in your Supabase dashboard
2. Confirming the `issue-images` bucket exists
3. Checking the policies are in place

### 4. Authentication Setup (Optional)

If you're using Supabase auth:

1. Go to "Authentication" > "Settings"
2. Configure your preferred authentication providers
3. Update your app's authentication flow

### 5. Real-time Setup (Optional)

To enable real-time updates:

1. Go to "Database" > "Replication"
2. Enable replication for the `issues` table
3. Configure any additional tables you want to replicate

## Testing the Setup

### 1. Test Database Connection

You can test your database connection by running this query in the SQL Editor:

```sql
SELECT COUNT(*) FROM issues;
```

### 2. Test Storage

Upload a test image to verify storage is working:

```sql
-- This should show your storage bucket
SELECT * FROM storage.buckets WHERE name = 'issue-images';
```

### 3. Test RLS Policies

Create a test user and verify they can only access their own data:

```sql
-- This should work when authenticated
INSERT INTO issues (reporter_id, title, description, category, priority, latitude, longitude, address)
VALUES (auth.uid(), 'Test Issue', 'Test Description', 'Roads', 'Medium', 40.7128, -74.0060, 'New York, NY');
```

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Make sure your `.env` file is in the root directory
   - Restart your Expo development server
   - Check that variable names start with `EXPO_PUBLIC_`

2. **Database connection errors**
   - Verify your Supabase URL and API key
   - Check that your project is not paused
   - Ensure you're using the correct API key (anon/public)

3. **RLS policy errors**
   - Make sure users are authenticated before accessing data
   - Check that policies are properly configured
   - Verify auth.uid() returns the correct user ID

4. **Storage upload errors**
   - Check storage policies allow uploads
   - Verify file size limits
   - Ensure correct file paths and naming

### Debugging Tips

1. **Enable verbose logging:**
   ```typescript
   // Add this to your Supabase client configuration
   import { createClient } from '@supabase/supabase-js'
   
   const supabase = createClient(url, key, {
     auth: {
       debug: true
     }
   })
   ```

2. **Check browser network tab for API calls**

3. **Use Supabase dashboard logs:**
   - Go to "Logs" in your dashboard
   - Filter by API or Auth logs
   - Look for error patterns

## API Usage Examples

### Creating an Issue

```typescript
const issue = await SupabaseService.createIssue({
  reporter_id: user.id,
  title: "Pothole on Main Street",
  description: "Large pothole causing traffic issues",
  category: "Roads",
  priority: "High",
  latitude: 40.7128,
  longitude: -74.0060,
  address: "123 Main St, New York, NY",
  image_urls: ["https://example.com/image1.jpg"]
});
```

### Fetching Issues with Filters

```typescript
const issues = await SupabaseService.getIssues({
  category: "Roads",
  status: "Pending",
  priority: "High",
  limit: 10
});
```

### Updating Issue Status

```typescript
const success = await SupabaseService.updateIssueStatus(
  issueId, 
  "In Progress"
);
```

### Uploading Images

```typescript
const imageUrls = await SupabaseService.uploadMultipleImages(
  [imageUri1, imageUri2], 
  issueId
);
```

## Security Considerations

1. **Row Level Security (RLS)** is enabled and configured
2. **Storage policies** prevent unauthorized access
3. **API keys** should never be exposed in client code
4. **File uploads** are validated for type and size
5. **User authentication** is required for all operations

## Performance Optimization

1. **Indexes** are created on frequently queried columns
2. **Pagination** is implemented for large datasets
3. **Image compression** should be done client-side
4. **Caching** can be implemented for read-heavy operations

## Maintenance

### Regular Tasks

1. **Monitor storage usage** and clean up old images
2. **Review and update RLS policies** as needed
3. **Backup database** regularly
4. **Monitor performance** and add indexes as needed
5. **Update Supabase client** library regularly

### Scaling Considerations

1. **Database connection pooling** for high traffic
2. **CDN setup** for image delivery
3. **Read replicas** for read-heavy workloads
4. **Partitioning** for very large datasets

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [React Native Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
