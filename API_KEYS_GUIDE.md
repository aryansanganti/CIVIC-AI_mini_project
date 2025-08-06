# 🔑 API Keys Setup Guide - Civic AI

## 📋 Required API Keys

You need to obtain the following API keys to fully enable all features:

1. **Firebase Configuration** (Required)
2. **Gemini AI API Key** (Required for AI features)
3. **Google Maps API Key** (Optional, for enhanced maps)
4. **Apple Maps API Key** (Optional, for iOS maps)

---

## 🔥 1. Firebase Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `civic-ai-platform`
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

### Step 2: Enable Services
1. **Authentication**:
   - Go to "Authentication" in left sidebar
   - Click "Get started"
   - Enable "Email/Password" provider
   - Click "Save"

2. **Firestore Database**:
   - Go to "Firestore Database" in left sidebar
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location (choose closest to your users)
   - Click "Done"

3. **Storage**:
   - Go to "Storage" in left sidebar
   - Click "Get started"
   - Choose "Start in test mode" (for development)
   - Select a location
   - Click "Done"

### Step 3: Get Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and choose "Web"
4. Register app with name: `Civic AI Web`
5. Copy the configuration object

### Step 4: Update Configuration
Update `lib/firebase.ts` with your config:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
}
```

---

## 🤖 2. Gemini AI Setup

### Step 1: Get API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Enable APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to "APIs & Services" > "Library"
4. Search for and enable:
   - **Gemini API**
   - **Vertex AI API**

### Step 3: Update Configuration
Update `lib/gemini.ts`:
```typescript
const genAI = new GoogleGenerativeAI('your_actual_gemini_api_key');
```

---

## 🗺️ 3. Google Maps API (Optional)

### Step 1: Enable Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Library"
4. Search for and enable:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Places API** (for address lookup)

### Step 2: Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated key

### Step 3: Restrict API Key (Recommended)
1. Click on the created API key
2. Under "Application restrictions", select "Android apps" and "iOS apps"
3. Add your app's bundle identifier
4. Under "API restrictions", select the Maps APIs you enabled

### Step 4: Update Configuration
Add to your `.env` file:
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

## 🍎 4. Apple Maps API (Optional - iOS Only)

### Step 1: Get Apple Developer Account
1. Sign up for [Apple Developer Program](https://developer.apple.com/programs/)
2. Pay the annual fee ($99)

### Step 2: Create Maps API Key
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Go to "Keys" section
4. Click "+" to create a new key
5. Enable "Maps" capability
6. Download the key file

### Step 3: Update Configuration
Add to your `.env` file:
```env
APPLE_MAPS_API_KEY=your_apple_maps_api_key_here
```

---

## 📝 5. Create .env File

1. Copy the `env.template` file to `.env`:
```bash
cp env.template .env
```

2. Replace all placeholder values with your actual API keys:
```env
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyC...your_actual_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyC...your_actual_gemini_api_key

# Maps Configuration (Optional)
GOOGLE_MAPS_API_KEY=AIzaSyC...your_actual_google_maps_api_key
APPLE_MAPS_API_KEY=your_actual_apple_maps_api_key

# App Configuration
APP_NAME=Civic AI
APP_VERSION=1.0.0
ENVIRONMENT=development
```

---

## 🔒 6. Security Best Practices

### Environment Variables
- Never commit `.env` file to version control
- Add `.env` to your `.gitignore` file
- Use different API keys for development and production

### API Key Restrictions
- Restrict API keys to specific domains/IPs
- Set up usage quotas and alerts
- Regularly rotate API keys

### Firebase Security Rules
Set up proper Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to issues, authenticated write
    match /issues/{issueId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## ✅ 7. Testing Your Setup

### Test Firebase Connection
```typescript
// Add this to any screen to test
import { auth } from '../lib/firebase';
console.log('Firebase auth initialized:', auth);
```

### Test Gemini AI
```typescript
// Add this to test AI functionality
import { textModel } from '../lib/gemini';
const testResponse = await textModel.generateContent('Hello, Gemini!');
console.log('Gemini response:', testResponse.response.text());
```

### Test Maps
The map should load automatically when you navigate to the Map tab.

---

## 🆘 Troubleshooting

### Common Issues

**Firebase: "Firebase App named '[DEFAULT]' already exists"**
- Solution: Check if Firebase is initialized multiple times

**Gemini: "API key not valid"**
- Solution: Verify API key and ensure APIs are enabled

**Maps: "Map not loading"**
- Solution: Check API key restrictions and billing setup

**Environment Variables: "process.env is undefined"**
- Solution: Restart the development server after adding .env file

### Getting Help
- Check [Firebase Documentation](https://firebase.google.com/docs)
- Visit [Google AI Studio Help](https://ai.google.dev/docs)
- Review [Google Maps Documentation](https://developers.google.com/maps)

---

## 🎉 You're Ready!

Once you've completed this setup:
1. Your app will have full backend functionality
2. AI-powered issue detection will work
3. Maps will display properly
4. User authentication will be enabled

**Next step:** Run `npm start` and test all features! 