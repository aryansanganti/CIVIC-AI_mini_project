# Google OAuth Complete Setup Guide

## Step 1: Google Cloud Console Setup

### Create 3 OAuth Clients:

#### 1. Web Application Client
- **Type**: Web application
- **Name**: Civic AI Web
- **Authorized JavaScript origins**:
  ```
  http://localhost:8081
  http://localhost:8082
  http://localhost:19006
  http://localhost:3000
  https://yourdomain.com
  ```
- **Authorized redirect URIs**:
  ```
  http://localhost:8081/auth-callback
  http://localhost:8082/auth-callback
  http://localhost:19006/auth-callback
  http://localhost:3000/auth-callback
  https://yourdomain.com/auth-callback
  ```

#### 2. Android Client
- **Type**: Android
- **Name**: Civic AI Android
- **Package name**: `com.civicai.app`
- **SHA-1 fingerprint**: `D0:FA:29:13:1F:1C:3A:9A:B1:F0:88:E2:44:A9:44:FA:41:5C:70:9B`

#### 3. iOS Client
- **Type**: iOS
- **Name**: Civic AI iOS
- **Bundle ID**: `com.civicai.app`

## Step 2: Supabase Configuration

In your Supabase project dashboard:

### Authentication → URL Configuration
**Redirect URLs** (add all these):
```
civicai://auth-callback
http://localhost:8081/auth-callback
http://localhost:8082/auth-callback
http://localhost:19006/auth-callback
http://localhost:3000/auth-callback
https://yourdomain.com/auth-callback
```

### Authentication → Providers → Google
- Enable Google provider
- Add your Google OAuth **Web Client ID** (from step 1.1)
- Add your Google OAuth **Web Client Secret**

## Step 3: Environment Variables

Create/update your `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=https://dnbrbpallquktorvzmap.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
```

## Step 4: Testing

### Development URLs to test:
- **Expo Go**: Use QR code - `civicai://auth-callback`
- **Web Dev**: `http://localhost:8081` - redirects to `/auth-callback`
- **Android Emulator**: Uses `civicai://auth-callback`
- **iOS Simulator**: Uses `civicai://auth-callback`

## Common Ports Used by Expo:
- `8081` - Default Metro/Expo port
- `8082` - Alternative when 8081 is busy
- `19006` - Expo Web fallback
- `3000` - Common web dev port

## Production Setup:
Replace `yourdomain.com` with your actual domain when deploying.
