export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  role: 'citizen' | 'officer' | 'volunteer' | 'admin';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  assignedArea?: string; // For officers
  createdAt: Date;
  lastActive: Date;
}

export interface CivicIssue {
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
  images: string[]; // URLs to stored images
  audioUrl?: string; // URL to stored audio
  reportedBy: string; // User ID or 'anonymous'
  assignedTo?: string; // Officer ID
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  upvotes: number;
  comments: Comment[];
  aiConfidence?: number; // AI detection confidence score
  tags: string[];
}

export type IssueCategory = 
  | 'Road Damage'
  | 'Street Light'
  | 'Garbage'
  | 'Water Leak'
  | 'Traffic Signal'
  | 'Pothole'
  | 'Street Sign'
  | 'Other';

export type IssueStatus = 
  | 'reported'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'escalated';

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  isOfficial?: boolean; // If comment is from an officer
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'issue_update' | 'assignment' | 'resolution' | 'general';
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp: Date;
}

export interface AIAnalysisResult {
  category: IssueCategory;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface ReportFormData {
  title: string;
  description: string;
  category: IssueCategory;
  urgency: 'low' | 'medium' | 'high';
  location: LocationData;
  images: string[];
  audioUrl?: string;
  isAnonymous: boolean;
}

export interface FilterOptions {
  category?: IssueCategory;
  status?: IssueStatus;
  urgency?: 'low' | 'medium' | 'high';
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
}

export interface MapViewState {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  selectedIssue?: CivicIssue;
  filters: FilterOptions;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentLocation: LocationData | null;
  notifications: Notification[];
  language: string;
  theme: 'light' | 'dark';
} 