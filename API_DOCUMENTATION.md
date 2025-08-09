# API Documentation - Civic AI

This document provides comprehensive API documentation for the Supabase integration in the Civic AI application.

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Issue Management](#issue-management)
- [Image Storage](#image-storage)
- [Real-time Updates](#real-time-updates)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## 🌟 Overview

The Civic AI application uses Supabase as its backend service, providing:
- PostgreSQL database with Row Level Security (RLS)
- Real-time subscriptions
- File storage with access policies
- Authentication and authorization

### Base Configuration

```typescript
import { supabase } from './lib/supabase';
import SupabaseService from './lib/supabase-service';
```

## 🔐 Authentication

### Get Current User

```typescript
const { data: { user }, error } = await supabase.auth.getUser();
```

### Check Authentication Status

```typescript
const { data: { session } } = await supabase.auth.getSession();
const isAuthenticated = !!session;
```

## 📝 Issue Management

### Create Issue

Creates a new civic issue in the database.

```typescript
const issueData: IssueInsert = {
  reporter_id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: 'Low' | 'Medium' | 'High';
  latitude: number;
  longitude: number;
  address: string;
  image_urls?: string[];
};

const issue = await SupabaseService.createIssue(issueData);
```

**Parameters:**
- `reporter_id` (required): User ID from auth.users
- `title` (required): Issue title (max 100 characters)
- `description` (required): Issue description (max 500 characters)
- `category` (required): One of: 'Roads', 'Sanitation', 'Electricity', 'Water Supply', 'Public Safety', 'Others'
- `priority` (required): 'Low', 'Medium', or 'High'
- `latitude` (required): GPS latitude coordinate
- `longitude` (required): GPS longitude coordinate
- `address` (required): Human-readable address
- `image_urls` (optional): Array of image URLs from storage

**Returns:** `CivicIssue | null`

### Get Issues with Filters

Retrieves issues with optional filtering and pagination.

```typescript
const filters = {
  category?: IssueCategory;
  priority?: 'Low' | 'Medium' | 'High';
  status?: IssueStatus;
  limit?: number;
  offset?: number;
};

const issues = await SupabaseService.getIssues(filters);
```

**Example Usage:**
```typescript
// Get all high priority road issues
const roadIssues = await SupabaseService.getIssues({
  category: 'Roads',
  priority: 'High',
  limit: 20
});

// Get pending issues with pagination
const pendingIssues = await SupabaseService.getIssues({
  status: 'Pending',
  limit: 10,
  offset: 20
});
```

**Returns:** `CivicIssue[]`

### Get Issue by ID

Retrieves a single issue by its UUID.

```typescript
const issue = await SupabaseService.getIssueById(issueId);
```

**Parameters:**
- `issueId` (required): UUID of the issue

**Returns:** `CivicIssue | null`

### Update Issue

Updates an existing issue (typically used by officers).

```typescript
const updates: IssueUpdate = {
  title?: string;
  description?: string;
  category?: IssueCategory;
  priority?: 'Low' | 'Medium' | 'High';
  status?: IssueStatus;
};

const updatedIssue = await SupabaseService.updateIssue(issueId, updates);
```

**Returns:** `CivicIssue | null`

### Update Issue Status

Quick status update for issues.

```typescript
const success = await SupabaseService.updateIssueStatus(issueId, 'In Progress');
```

**Parameters:**
- `issueId` (required): UUID of the issue
- `status` (required): 'Pending', 'In Progress', or 'Resolved'

**Returns:** `boolean`

### Get Issues by Reporter

Retrieves all issues reported by a specific user.

```typescript
const userIssues = await SupabaseService.getIssuesByReporter(userId);
```

**Returns:** `CivicIssue[]`

## 📸 Image Storage

### Upload Single Image

Uploads an image to Supabase Storage and returns the public URL.

```typescript
const imageUrl = await SupabaseService.uploadImage(
  imageUri,     // Local image URI
  issueId,      // Issue UUID for folder organization
  fileName      // Unique filename
);
```

**Parameters:**
- `imageUri` (required): Local file URI from image picker
- `issueId` (required): Issue UUID for folder structure
- `fileName` (required): Unique filename for the image

**Storage Structure:** `issue-images/{issueId}/{fileName}`

**Returns:** `string | null` (public URL)

### Upload Multiple Images

Uploads multiple images for a single issue.

```typescript
const imageUrls = await SupabaseService.uploadMultipleImages(
  [imageUri1, imageUri2],  // Array of local image URIs
  issueId                  // Issue UUID
);
```

**Returns:** `string[]` (array of public URLs)

### Delete Image

Removes an image from storage.

```typescript
const success = await SupabaseService.deleteImage(imageUrl);
```

**Returns:** `boolean`

## 📊 Analytics & Statistics

### Get Issue Statistics

Retrieves comprehensive statistics for dashboard display.

```typescript
const stats = await SupabaseService.getIssueStats();
```

**Returns:**
```typescript
{
  total: number;
  byStatus: {
    'Pending': number;
    'In Progress': number;
    'Resolved': number;
  };
  byCategory: {
    'Roads': number;
    'Sanitation': number;
    'Electricity': number;
    'Water Supply': number;
    'Public Safety': number;
    'Others': number;
  };
  byPriority: {
    'Low': number;
    'Medium': number;
    'High': number;
  };
}
```

## 🔄 Real-time Updates

### Subscribe to All Issues

Listen for real-time changes to the issues table.

```typescript
const subscription = SupabaseService.subscribeToIssues((payload) => {
  console.log('Change detected:', payload.eventType);
  console.log('New data:', payload.new);
  console.log('Old data:', payload.old);
  
  // Reload issues or update local state
  loadIssues();
});

// Cleanup
subscription.unsubscribe();
```

**Payload Events:**
- `INSERT`: New issue created
- `UPDATE`: Issue updated
- `DELETE`: Issue deleted

### Subscribe to User-Specific Issues

Listen for changes to issues reported by a specific user.

```typescript
const subscription = SupabaseService.subscribeToUserIssues(userId, (payload) => {
  // Handle status updates for user's issues
  if (payload.eventType === 'UPDATE') {
    showNotification(`Your issue status changed to: ${payload.new.status}`);
  }
});
```

## ⚠️ Error Handling

### Common Error Patterns

```typescript
try {
  const issue = await SupabaseService.createIssue(issueData);
  if (!issue) {
    throw new Error('Failed to create issue');
  }
} catch (error) {
  if (error.message.includes('auth')) {
    // Handle authentication errors
    Alert.alert('Authentication Error', 'Please sign in to continue');
  } else if (error.message.includes('network')) {
    // Handle network errors
    Alert.alert('Network Error', 'Please check your connection');
  } else {
    // Handle other errors
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }
}
```

### Supabase Error Codes

Common Supabase error codes and their meanings:

- `PGRST116`: No rows found (empty result)
- `23505`: Unique constraint violation
- `23503`: Foreign key constraint violation
- `42501`: Insufficient privileges (RLS policy issue)
- `08000`: Connection failure

## 🚦 Rate Limiting

### Built-in Limits

Supabase provides built-in rate limiting:
- API requests: 200 requests per minute per user
- Storage uploads: 100MB per hour per user
- Real-time connections: 200 concurrent connections

### Best Practices

```typescript
// Implement client-side debouncing for search
const debouncedSearch = useCallback(
  debounce((query: string) => {
    SupabaseService.getIssues({ /* search filters */ });
  }, 300),
  []
);

// Batch operations when possible
const uploadPromises = imageUris.map(uri => 
  SupabaseService.uploadImage(uri, issueId, generateFileName())
);
const imageUrls = await Promise.all(uploadPromises);
```

## 🔍 Advanced Queries

### Geospatial Queries

Get nearby issues using the built-in function:

```typescript
// This would require a custom function in Supabase
const { data: nearbyIssues } = await supabase
  .rpc('get_nearby_issues', {
    user_lat: userLocation.latitude,
    user_lng: user_location.longitude,
    radius_km: 5.0
  });
```

### Full-text Search

Search issues by text content:

```typescript
const { data: searchResults } = await supabase
  .from('issues')
  .select('*')
  .textSearch('title,description', searchQuery);
```

### Complex Filtering

```typescript
const { data: complexQuery } = await supabase
  .from('issues')
  .select('*')
  .eq('category', 'Roads')
  .eq('priority', 'High')
  .in('status', ['Pending', 'In Progress'])
  .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  .order('created_at', { ascending: false })
  .limit(20);
```

## 📱 Mobile-Specific Considerations

### Image Optimization

```typescript
// Optimize images before upload
const optimizedUri = await ImageManipulator.manipulateAsync(
  originalUri,
  [{ resize: { width: 800 } }],
  { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
);

const imageUrl = await SupabaseService.uploadImage(optimizedUri, issueId, fileName);
```

### Offline Support

```typescript
// Check network connectivity
import NetInfo from '@react-native-async-storage/async-storage';

const handleOfflineUpload = async () => {
  const networkState = await NetInfo.fetch();
  
  if (!networkState.isConnected) {
    // Queue for later upload
    await AsyncStorage.setItem('pendingIssues', JSON.stringify(issueData));
    return;
  }
  
  // Upload immediately
  await SupabaseService.createIssue(issueData);
};
```

## 🛡️ Security Best Practices

### Row Level Security Policies

The application implements these RLS policies:

```sql
-- Citizens can only create issues for themselves
CREATE POLICY "Citizens can create issues" ON issues
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Citizens can view their own issues
CREATE POLICY "Citizens can view own issues" ON issues
    FOR SELECT USING (auth.uid() = reporter_id);

-- Officers can view all issues
CREATE POLICY "Officers can view all issues" ON issues
    FOR SELECT USING (auth.role() = 'authenticated');
```

### Input Validation

```typescript
const validateIssueData = (data: IssueInsert): boolean => {
  if (!data.title || data.title.length > 100) return false;
  if (!data.description || data.description.length > 500) return false;
  if (!['Roads', 'Sanitation', 'Electricity', 'Water Supply', 'Public Safety', 'Others'].includes(data.category)) return false;
  if (!['Low', 'Medium', 'High'].includes(data.priority)) return false;
  if (!data.latitude || !data.longitude) return false;
  return true;
};
```

## 📈 Performance Optimization

### Pagination Implementation

```typescript
const usePaginatedIssues = (pageSize = 10) => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const newIssues = await SupabaseService.getIssues({
      limit: pageSize,
      offset: issues.length
    });
    
    setIssues(prev => [...prev, ...newIssues]);
    setHasMore(newIssues.length === pageSize);
    setLoading(false);
  };

  return { issues, loading, hasMore, loadMore };
};
```

### Caching Strategies

```typescript
// Simple in-memory cache
const issueCache = new Map<string, CivicIssue>();

const getCachedIssue = async (issueId: string): Promise<CivicIssue | null> => {
  if (issueCache.has(issueId)) {
    return issueCache.get(issueId)!;
  }
  
  const issue = await SupabaseService.getIssueById(issueId);
  if (issue) {
    issueCache.set(issueId, issue);
  }
  
  return issue;
};
```

This API documentation provides a comprehensive guide to using the Supabase integration in the Civic AI application. For additional support, refer to the [Supabase documentation](https://supabase.com/docs) or create an issue in the repository.
