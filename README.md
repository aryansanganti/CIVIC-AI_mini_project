# Civic AI - Mobile Civic Issue Reporting Platform

A mobile-first platform that empowers citizens to report local civic issues using AI-powered detection, multi-language support, and real-time issue mapping.

## 🚀 Features

### Phase 1 (Current Implementation)
- **AI-Powered Issue Detection**: Gemini AI integration for smart category and description detection from images
- **Multi-Platform Support**: React Native with Expo for cross-platform mobile development
- **Real-time Map View**: Interactive map showing reported issues with filtering capabilities
- **Officer Dashboard**: Role-based interface for civic officials to manage assigned issues
- **Anonymous Reporting**: Submit issues without account creation
- **Modern UI/UX**: Dark/light mode support with beautiful, intuitive interface

### Planned Features (Phase 2 & 3)
- **Multi-Language Support**: Full app support for Indian languages
- **Audio-to-Text**: Voice reporting with multilingual speech recognition
- **Push Notifications**: Real-time updates on issue status
- **Community Mode**: Public comments, upvotes, and status tracking
- **Advanced Analytics**: Heatmaps and insights dashboard
- **Volunteer Mode**: Community moderation and verification

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Google Gemini Vision & Text APIs
- **Maps**: React Native Maps
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router
- **State Management**: React Hooks
- **TypeScript**: Full type safety

## 📱 Screenshots

The app includes the following main screens:
- **Home**: Dashboard with quick stats and reporting options
- **Map**: Interactive map view of all reported issues
- **Officer Dashboard**: Issue management for civic officials
- **Profile**: User settings and authentication
- **Report Issue**: AI-powered issue reporting form
- **Authentication**: Sign in/sign up modal

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Civic-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Configure Firebase**
   - Create a new Firebase project
   - Enable Authentication, Firestore, and Storage
   - Update the Firebase configuration in `lib/firebase.ts`

5. **Configure Gemini AI**
   - Get your API key from Google AI Studio
   - Update the API key in `lib/gemini.ts`

6. **Start the development server**
   ```bash
   npm start
   ```

7. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📁 Project Structure

```
Civic-AI/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── map.tsx        # Map view
│   │   ├── officer.tsx    # Officer dashboard
│   │   └── profile.tsx    # Profile screen
│   ├── report.tsx         # Issue reporting
│   ├── auth.tsx           # Authentication
│   └── _layout.tsx        # Root layout
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase configuration
│   └── gemini.ts          # Gemini AI integration
├── types/                 # TypeScript type definitions
│   └── index.ts           # App types and interfaces
├── assets/                # Static assets
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Enable Storage
5. Set up security rules

### Gemini AI Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Enable Gemini Pro and Gemini Pro Vision APIs

### Maps Configuration
- For iOS: Add your Apple Maps API key
- For Android: Add your Google Maps API key

## 🎯 Key Features Implementation

### AI-Powered Issue Detection
```typescript
// Example usage in report.tsx
const analysis = await analyzeCivicIssue(imageBase64);
setCategory(analysis.category);
setDescription(analysis.description);
setUrgency(analysis.urgency);
```

### Real-time Map Integration
```typescript
// Example usage in map.tsx
<MapView
  region={region}
  showsUserLocation={true}
  mapType={isDark ? 'dark' : 'standard'}
>
  {issues.map((issue) => (
    <Marker
      key={issue.id}
      coordinate={issue.location}
      pinColor={getUrgencyColor(issue.urgency)}
    />
  ))}
</MapView>
```

## 📊 Data Models

### Civic Issue
```typescript
interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  urgency: 'low' | 'medium' | 'high';
  status: IssueStatus;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images: string[];
  reportedBy: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  comments: Comment[];
  aiConfidence?: number;
}
```

## 🔐 Security & Privacy

- All reports are anonymized unless user chooses to share data
- Geo and EXIF data stored securely
- Officers see verified user reports only
- Firebase Auth & Firestore Rules manage role access
- GDPR compliant data handling

## 🚀 Deployment

### Expo Build
```bash
# Build for production
expo build:android
expo build:ios

# Submit to stores
expo submit:android
expo submit:ios
```

### Firebase Deployment
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy functions
firebase deploy --only functions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@civicai.com or create an issue in the repository.

## 🗺️ Roadmap

### Phase 2 (Q2 2024)
- [ ] Multi-language UI & voice support
- [ ] Community Mode with comments and upvotes
- [ ] Push notifications
- [ ] Image noise correction
- [ ] Officer auto-routing

### Phase 3 (Q3 2024)
- [ ] Volunteer login system
- [ ] Admin analytics dashboard
- [ ] Issue heatmaps
- [ ] Smart escalation flow
- [ ] Advanced reporting features

---

**Built with ❤️ for better civic engagement**
