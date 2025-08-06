import AsyncStorage from '@react-native-async-storage/async-storage';
import { CivicIssue, IssueCategory, IssueStatus } from '../types';

// Officer names pool for random assignment
const OFFICER_NAMES = [
    'Officer Sarah Johnson',
    'Officer Michael Chen',
    'Officer Emily Rodriguez',
    'Officer David Kumar',
    'Officer Lisa Thompson'
];

// Keys for AsyncStorage
const ISSUES_KEY = '@civic_issues';
const ISSUE_COUNTER_KEY = '@issue_counter';

export class DatabaseService {
    // Generate unique ID for issues
    private static async generateIssueId(): Promise<string> {
        try {
            const counterStr = await AsyncStorage.getItem(ISSUE_COUNTER_KEY);
            const counter = counterStr ? parseInt(counterStr) : 1000;
            const newCounter = counter + 1;
            await AsyncStorage.setItem(ISSUE_COUNTER_KEY, newCounter.toString());
            return `CIV-${newCounter}`;
        } catch (error) {
            console.error('Error generating issue ID:', error);
            return `CIV-${Date.now()}`;
        }
    }

    // Get random officer name
    private static getRandomOfficer(): string {
        const randomIndex = Math.floor(Math.random() * OFFICER_NAMES.length);
        return OFFICER_NAMES[randomIndex];
    }

    // Save a new issue
    static async saveIssue(issueData: {
        title: string;
        description: string;
        category: IssueCategory;
        urgency: 'low' | 'medium' | 'high';
        location: {
            latitude: number;
            longitude: number;
            address?: string;
        };
        images: string[];
        isAnonymous: boolean;
        aiConfidence?: number;
    }): Promise<CivicIssue> {
        try {
            const issueId = await this.generateIssueId();
            const assignedOfficer = this.getRandomOfficer();

            const newIssue: CivicIssue = {
                id: issueId,
                title: issueData.title,
                description: issueData.description,
                category: issueData.category,
                urgency: issueData.urgency,
                status: 'assigned' as IssueStatus,
                location: issueData.location,
                images: issueData.images,
                reportedBy: issueData.isAnonymous ? 'Anonymous' : 'Citizen User',
                assignedTo: assignedOfficer,
                createdAt: new Date(),
                updatedAt: new Date(),
                upvotes: 0,
                comments: [],
                aiConfidence: issueData.aiConfidence,
                tags: []
            };

            // Get existing issues
            const existingIssues = await this.getAllIssues();

            // Add new issue
            const updatedIssues = [newIssue, ...existingIssues];

            // Save to storage
            await AsyncStorage.setItem(ISSUES_KEY, JSON.stringify(updatedIssues, (key, value) => {
                if (key === 'createdAt' || key === 'updatedAt' || key === 'resolvedAt') {
                    return value instanceof Date ? value.toISOString() : value;
                }
                return value;
            }));

            console.log('Issue saved successfully:', newIssue);
            return newIssue;
        } catch (error) {
            console.error('Error saving issue:', error);
            throw error;
        }
    }

    // Get all issues
    static async getAllIssues(): Promise<CivicIssue[]> {
        try {
            const issuesStr = await AsyncStorage.getItem(ISSUES_KEY);
            if (!issuesStr) return [];

            const issues = JSON.parse(issuesStr);
            // Convert date strings back to Date objects
            return issues.map((issue: any) => ({
                ...issue,
                createdAt: new Date(issue.createdAt),
                updatedAt: new Date(issue.updatedAt),
                resolvedAt: issue.resolvedAt ? new Date(issue.resolvedAt) : undefined,
                comments: issue.comments.map((comment: any) => ({
                    ...comment,
                    createdAt: new Date(comment.createdAt)
                }))
            }));
        } catch (error) {
            console.error('Error getting issues:', error);
            return [];
        }
    }

    // Get issues assigned to officers
    static async getOfficerIssues(): Promise<CivicIssue[]> {
        try {
            const allIssues = await this.getAllIssues();
            return allIssues.filter(issue =>
                issue.status === 'assigned' ||
                issue.status === 'in_progress' ||
                issue.status === 'resolved'
            );
        } catch (error) {
            console.error('Error getting officer issues:', error);
            return [];
        }
    }

    // Update issue status
    static async updateIssueStatus(issueId: string, newStatus: IssueStatus): Promise<boolean> {
        try {
            const allIssues = await this.getAllIssues();
            const issueIndex = allIssues.findIndex(issue => issue.id === issueId);

            if (issueIndex === -1) {
                throw new Error('Issue not found');
            }

            allIssues[issueIndex].status = newStatus;
            allIssues[issueIndex].updatedAt = new Date();

            if (newStatus === 'resolved') {
                allIssues[issueIndex].resolvedAt = new Date();
            }

            await AsyncStorage.setItem(ISSUES_KEY, JSON.stringify(allIssues, (key, value) => {
                if (key === 'createdAt' || key === 'updatedAt' || key === 'resolvedAt') {
                    return value instanceof Date ? value.toISOString() : value;
                }
                return value;
            }));
            return true;
        } catch (error) {
            console.error('Error updating issue status:', error);
            return false;
        }
    }

    // Create sample data for testing
    static async createSampleData(): Promise<void> {
        try {
            const existingIssues = await this.getAllIssues();
            if (existingIssues.length > 0) {
                return; // Don't create sample data if issues already exist
            }

            const sampleIssuesData = [
                {
                    title: 'Pothole on Main Street',
                    description: 'Large pothole causing traffic issues near the intersection',
                    category: 'Pothole' as IssueCategory,
                    urgency: 'high' as const,
                    location: { latitude: 19.0760, longitude: 72.8777, address: 'Main Street, Mumbai' },
                    images: [],
                    isAnonymous: false,
                    aiConfidence: 85
                },
                {
                    title: 'Broken Street Light',
                    description: 'Street light not working for past 3 days',
                    category: 'Street Light' as IssueCategory,
                    urgency: 'medium' as const,
                    location: { latitude: 19.0760, longitude: 72.8777, address: 'Park Avenue, Mumbai' },
                    images: [],
                    isAnonymous: true,
                    aiConfidence: 92
                },
                {
                    title: 'Garbage Overflow',
                    description: 'Garbage bin overflowing, causing hygiene issues',
                    category: 'Garbage' as IssueCategory,
                    urgency: 'high' as const,
                    location: { latitude: 19.0760, longitude: 72.8777, address: 'Market Street, Mumbai' },
                    images: [],
                    isAnonymous: false,
                    aiConfidence: 78
                }
            ];

            for (const sampleData of sampleIssuesData) {
                await this.saveIssue(sampleData);
                // Add a small delay to ensure different timestamps
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log('Sample data created successfully');
        } catch (error) {
            console.error('Error creating sample data:', error);
        }
    }

    // Clear all data (for testing)
    static async clearAllData(): Promise<void> {
        try {
            await AsyncStorage.removeItem(ISSUES_KEY);
            await AsyncStorage.removeItem(ISSUE_COUNTER_KEY);
            console.log('All data cleared');
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    }
}
