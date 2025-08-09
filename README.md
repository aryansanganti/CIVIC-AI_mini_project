# Civic AI - Mobile Civic Issue Reporting Platform

A mobile-first platform that empowers citizens to report local civic issues using AI-powered detection, Supabase backend, and real-time issue management.

## 🚀 Features

### Current Implementation
- **AI-Powered Issue Detection**: Gemini AI integration for smart category and description detection from images
- **Supabase Backend**: Real-time database, authentication, and file storage
- **Multi-Platform Support**: React Native with Expo for cross-platform mobile development
- **Real-time Updates**: Live issue updates using Supabase real-time subscriptions
- **Officer Dashboard**: Comprehensive issue management interface with filtering and status updates
- **Image Storage**: Secure image upload and management via Supabase Storage
- **Role-based Access**: Citizen and officer roles with appropriate permissions
- **Modern UI/UX**: Dark/light mode support with beautiful, intuitive interface

### Planned Features
- **Multi-Language Support**: Full app support for Indian languages
- **Audio-to-Text**: Voice reporting with multilingual speech recognition
- **Push Notifications**: Real-time updates on issue status
- **Community Mode**: Public comments, upvotes, and status tracking
- **Advanced Analytics**: Heatmaps and insights dashboard
- **Volunteer Mode**: Community moderation and verification

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (Database, Auth, Storage, Real-time)
- **AI**: Google Gemini Vision & Text APIs
- **Maps**: React Native Maps
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router
- **State Management**: React Hooks + Supabase Client
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
   # Gemini AI Configuration
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_public_key
   ```

4. **Set up Supabase**
   Follow the detailed setup guide in [SUPABASE_SETUP.md](SUPABASE_SETUP.md):
   - Create a new Supabase project
   - Run the database schema setup
   - Configure storage and authentication
   - Set up Row Level Security policies

5. **Configure Gemini AI**
   - Get your API key from Google AI Studio
   - Add it to your `.env` file

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
│   ├── supabase.ts        # Supabase client configuration
│   ├── supabase-service.ts # Database service layer
│   └── gemini.ts          # Gemini AI integration
├── types/                 # TypeScript type definitions
│   └── index.ts           # App types and interfaces
├── assets/                # Static assets
├── supabase-schema.sql    # Database setup script
├── SUPABASE_SETUP.md      # Detailed setup guide
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration

### Supabase Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Follow the comprehensive setup guide in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
3. Set up database schema, storage, and authentication
4. Configure Row Level Security policies

### Gemini AI Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Enable Gemini Pro and Gemini Pro Vision APIs

### Maps Configuration
- For iOS: Add your Apple Maps API key
- For Android: Add your Google Maps API key

## 🎯 Key Features Implementation

### Supabase Integration
```typescript
// Create an issue
const issue = await SupabaseService.createIssue({
  reporter_id: user.id,
  title: "Pothole on Main Street",
  description: "Large pothole causing traffic issues",
  category: "Roads",
  priority: "High",
  latitude: 40.7128,
  longitude: -74.0060,
  address: "123 Main St, New York, NY",
  image_urls: imageUrls
});

// Real-time updates
const subscription = SupabaseService.subscribeToIssues((payload) => {
  console.log('Issue updated:', payload);
  loadIssues();
});
```

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

### Civic Issue (Updated for Supabase)
```typescript
interface CivicIssue {
  id: string;
  reporter_id: string;
  title: string;
  description: string;
  category: IssueCategory; // 'Roads' | 'Sanitation' | 'Electricity' | 'Water Supply' | 'Public Safety' | 'Others'
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Resolved';
  latitude: number;
  longitude: number;
  address: string;
  image_urls: string[];
  created_at: Date;
  updated_at: Date;
  assignedTo?: string;
  upvotes?: number;
  comments?: Comment[];
  aiConfidence?: number;
}
```

### Database Schema
The app uses the following Supabase tables:
- `issues` - Main issue tracking
- `issue_comments` - Comments on issues
- `notifications` - User notifications
- Storage bucket: `issue-images` for file uploads

## 🔐 Security & Privacy

- **Row Level Security (RLS)**: Enabled on all Supabase tables
- **User Authentication**: Required for all operations
- **Role-based Access**: Citizens can only access their own issues, officers can access all
- **Secure File Storage**: Images stored in Supabase Storage with proper access policies
- **Data Validation**: Server-side validation and constraints
- **GDPR Compliant**: Proper data handling and user privacy protection

## 🚀 Deployment

### Expo Build
```bash
# Build for production
eas build --platform android
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### Supabase Deployment
- Database migrations are automatically applied
- Environment variables configured in hosting platform
- Storage policies and RLS rules are version controlled

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
