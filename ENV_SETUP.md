# Environment Variables Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your actual API keys:
- Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- If using Firebase, get your keys from [Firebase Console](https://console.firebase.google.com/)

3. Never commit your `.env` file - it's already in .gitignore

The following environment variables are required:
- `EXPO_PUBLIC_GEMINI_API_KEY`: Your Gemini AI API key

Optional Firebase variables (if using Firebase):
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`
