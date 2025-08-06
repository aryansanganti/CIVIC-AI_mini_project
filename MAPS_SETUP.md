# 🗺️ Google Maps Setup Guide - Civic AI

## 📱 Physical Device Map Issues

If maps work in simulation but not on physical devices, you need to configure Google Maps API keys properly.

---

## 🔑 Step 1: Get Google Maps API Key

### 1. Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for Maps API)

### 2. Enable Required APIs
Go to "APIs & Services" > "Library" and enable:
- **Maps SDK for Android**
- **Maps SDK for iOS**
- **Places API** (for address lookup)
- **Geocoding API** (for reverse geocoding)

### 3. Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

---

## 🔧 Step 2: Configure API Keys

### Update app.json
Replace the placeholder API keys in `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_ACTUAL_IOS_API_KEY"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ACTUAL_ANDROID_API_KEY"
        }
      }
    }
  }
}
```

### Update .env File
Add your API key to `.env`:
```env
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key
```

---

## 🔒 Step 3: Restrict API Keys (Recommended)

### For Android
1. Go to Google Cloud Console > Credentials
2. Click on your API key
3. Under "Application restrictions":
   - Select "Android apps"
   - Add your app's package name: `com.yourcompany.civicai`
   - Add SHA-1 fingerprint (get from Expo)

### For iOS
1. Under "Application restrictions":
   - Select "iOS apps"
   - Add your app's bundle identifier: `com.yourcompany.civicai`

### API Restrictions
Under "API restrictions":
- Select "Restrict key"
- Choose the Maps APIs you enabled

---

## 📱 Step 4: Get App Identifiers

### For Expo Development Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure your project
eas build:configure

# Get your app identifiers
eas credentials
```

### For Standalone App
Check your `app.json`:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.civicai"
    },
    "android": {
      "package": "com.yourcompany.civicai"
    }
  }
}
```

---

## 🚀 Step 5: Build and Test

### Development Build
```bash
# Install dependencies
npm install

# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Install on device
eas build:run
```

### Or Use Expo Go (Limited)
```bash
# Start development server
npm start

# Scan QR code with Expo Go app
# Note: Maps may not work in Expo Go due to API key restrictions
```

---

## 🔧 Step 6: Troubleshooting

### Common Issues

**"Maps not loading on physical device"**
- Check API key restrictions
- Verify bundle identifier/package name
- Ensure billing is enabled

**"API key not valid"**
- Check API key format
- Verify APIs are enabled
- Check API restrictions

**"Location not working"**
- Check location permissions in device settings
- Verify location services are enabled
- Check GPS settings

### Debug Steps
1. Check console logs for API errors
2. Verify API key in Google Cloud Console
3. Test API key in Google Maps API testing tool
4. Check device location settings

---

## 📋 Checklist

- [ ] Google Cloud project created
- [ ] Billing enabled
- [ ] Maps APIs enabled
- [ ] API key created
- [ ] API key restricted to your app
- [ ] app.json updated with API keys
- [ ] Development build created
- [ ] App installed on physical device
- [ ] Location permissions granted
- [ ] Maps loading properly

---

## 🎯 Quick Test

After setup, test these features:
1. **Map Loading**: Should show map with your location
2. **Location Detection**: Should show blue dot for your position
3. **Issue Markers**: Should show sample issues on map
4. **Dark/Light Mode**: Should switch map appearance

---

## 🆘 Still Having Issues?

1. **Check Expo Documentation**: [Maps Setup](https://docs.expo.dev/versions/latest/sdk/map-view/)
2. **Google Maps Documentation**: [Android](https://developers.google.com/maps/documentation/android-sdk/overview) | [iOS](https://developers.google.com/maps/documentation/ios-sdk/overview)
3. **Expo Forums**: [Community Support](https://forums.expo.dev/)

---

## 💡 Pro Tips

- Use different API keys for development and production
- Set up usage quotas to control costs
- Monitor API usage in Google Cloud Console
- Test on multiple devices and OS versions
- Keep API keys secure and never commit them to version control

**🎉 Once configured, your maps will work perfectly on physical devices!** 