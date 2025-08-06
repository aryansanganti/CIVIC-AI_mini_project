# 🔐 Google Authentication Setup - Civic AI

## 📋 Overview

This guide will help you set up Google OAuth authentication for your Civic AI app using Firebase's built-in Google Auth provider. This approach is more stable and doesn't require additional Expo packages.

---

## 🔑 Step 1: Firebase Console Setup

### 1. Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project: `civicai-e2a83`

### 2. Enable Google Sign-In
1. Go to "Authentication" > "Sign-in method"
2. Click on "Google" provider
3. Click "Enable"
4. Add your project support email
5. Click "Save"

### 3. Configure OAuth Consent Screen (Optional)
If you want to customize the OAuth consent screen:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" > "OAuth consent screen"
4. Configure app name, logo, and scopes

---

## 🔧 Step 2: App Configuration

### 1. Update Environment Variables
Your `.env` file should already have Firebase configuration:
```env
# Firebase Configuration (already configured)
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Gemini AI (already configured)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 2. No Additional Configuration Needed
The authentication system is already configured to use Firebase's Google Auth provider.

---

## 🚀 Step 3: Test Google Authentication

### 1. Development Testing
```bash
# Start the development server
npm start

# Test on device/simulator
# Try signing in with Google
```

### 2. How It Works
- **Web**: Uses popup authentication
- **Mobile**: Redirects to browser for authentication
- **Automatic**: Handles redirect results automatically

---

## 🔧 Step 4: Troubleshooting

### Common Issues

**"Google Sign-In not working"**
- Check Firebase Google provider is enabled
- Verify Firebase project configuration
- Check network connectivity

**"Sign-in popup blocked"**
- Check browser popup settings
- Test on physical device
- Verify Firebase domain configuration

**"Authentication failed"**
- Check Firebase console for errors
- Verify Google provider is enabled
- Check Firebase security rules

### Debug Steps
1. Check Firebase console for authentication errors
2. Verify Firebase project configuration
3. Test on different platforms (web, iOS, Android)
4. Check network connectivity

---

## 📋 Checklist

- [ ] Firebase project configured
- [ ] Google provider enabled in Firebase
- [ ] Firebase configuration in environment variables
- [ ] Development build tested
- [ ] Production build tested

---

## 🎯 Features Available

### After Setup
- ✅ **Google Sign-In**: One-tap authentication
- ✅ **User Profile**: Name, email, photo from Google
- ✅ **Secure Authentication**: Firebase Auth integration
- ✅ **Cross-Platform**: Works on iOS, Android, Web
- ✅ **Persistent Login**: Remembers user session

### User Experience
- **Sign In**: Tap "Continue with Google" button
- **Profile**: Shows user's Google profile picture and name
- **Sign Out**: Secure logout with confirmation
- **Guest Mode**: App works without authentication

---

## 🆘 Need Help?

1. **Firebase Documentation**: [Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin)
2. **Firebase Console**: [Authentication](https://console.firebase.google.com/)
3. **Google Cloud Console**: [OAuth Setup](https://console.cloud.google.com/)

---

## 💡 Pro Tips

- Firebase handles all OAuth complexity automatically
- No need for additional OAuth client IDs
- Works seamlessly across all platforms
- Built-in security and error handling
- Automatic session management

**🎉 Once Firebase Google provider is enabled, users can sign in with their Google accounts seamlessly!**

---

## 🚀 Quick Start

1. **Enable Google provider in Firebase Console**
2. **Start the app**: `npm start`
3. **Test Google Sign-In** on your device/simulator

**That's it! No additional configuration needed.** 