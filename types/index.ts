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
  reporter_id: string | null; // User ID or null for anonymous
  title: string;
  description: string;
  category: IssueCategory;
  priority: 'Low' | 'Medium' | 'High'; // Updated to match PRD
  status: IssueStatus;
  latitude: number;
  longitude: number;
  address: string;
  image_urls: string[]; // Array of image URLs from Supabase Storage
  is_anonymous: boolean; // Whether the report is anonymous
  assignedTo?: string; // Officer ID
  created_at: Date;
  updated_at: Date;
  resolvedAt?: Date;
  upvotes?: number;
  comments?: Comment[];
  aiConfidence?: number; // AI detection confidence score
  tags?: string[];
}

// Updated categories to match PRD specification
export type IssueCategory =
  | 'Roads'
  | 'Sanitation'
  | 'Electricity'
  | 'Water Supply'
  | 'Public Safety'
  | 'Others';

// Updated to match PRD specification
export type IssueStatus =
  | 'Pending'
  | 'In Progress'
  | 'Resolved';

// Database-specific type for insert operations
export interface IssueInsert {
  reporter_id: string | null; // Can be null for anonymous reports
  title: string;
  description: string;
  category: IssueCategory;
  priority: 'Low' | 'Medium' | 'High';
  latitude: number;
  longitude: number;
  address: string;
  image_urls?: string[];
  is_anonymous?: boolean;
  status?: IssueStatus;
}

// Database-specific type for update operations
export interface IssueUpdate {
  title?: string;
  description?: string;
  category?: IssueCategory;
  priority?: 'Low' | 'Medium' | 'High';
  status?: IssueStatus;
  updated_at?: string;
}

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