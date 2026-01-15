import * as FileSystem from 'expo-file-system';
import { CivicIssue, IssueCategory, IssueInsert, IssueStatus, IssueUpdate } from '../types';
import { supabase } from './supabase';

export class SupabaseService {
    // --- Enum mapping helpers ---
    private static mapPriorityForDb(p?: 'Low' | 'Medium' | 'High'): 'low' | 'medium' | 'high' {
        if (!p) return 'medium';
        return p.toLowerCase() as 'low' | 'medium' | 'high';
    }

    private static mapStatusForDb(s?: IssueStatus): 'open' | 'in_progress' | 'resolved' {
        switch (s) {
            case 'In Progress':
                return 'in_progress';
            case 'Resolved':
                return 'resolved';
            case 'Pending':
            default:
                return 'open';
        }
    }

    private static mapDbStatusToApp(db?: string): IssueStatus {
        switch (db) {
            case 'in_progress':
                return 'In Progress';
            case 'resolved':
            case 'closed':
                return 'Resolved';
            case 'open':
            case 'acknowledged':
            case 'duplicate':
            default:
                return 'Pending';
        }
    }

    private static mapDbPriorityToApp(db?: string): 'Low' | 'Medium' | 'High' {
        switch ((db || '').toLowerCase()) {
            case 'low':
                return 'Low';
            case 'high':
                return 'High';
            case 'medium':
            default:
                return 'Medium';
        }
    }

    // ISSUE MANAGEMENT

    /**
     * Create a new civic issue (supports anonymous reporting)
     */
    static async createIssue(issueData: IssueInsert): Promise<CivicIssue | null> {
        try {
            // Map client values to DB format
            const dbIssue: any = {
                ...issueData,
                // Map to DB enum values
                priority: SupabaseService.mapPriorityForDb(issueData.priority),
                status: SupabaseService.mapStatusForDb(issueData.status),
                address: issueData.address || '',
            };
            // Also send lat/lng to leverage compatibility trigger
            if (issueData.latitude && issueData.longitude) {
                dbIssue.latitude = issueData.latitude;
                dbIssue.longitude = issueData.longitude;
            }

            const { data, error } = await supabase
                .from('issues')
                .insert([dbIssue])
                .select()
                .single();

            if (error) {
                console.log('Error creating issue:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.log('Failed to create issue:', error);
            return null;
        }
    }

    /**
     * Create an anonymous issue (no authentication required)
     */
    static async createAnonymousIssue(issueData: Omit<IssueInsert, 'reporter_id' | 'is_anonymous'>): Promise<CivicIssue | null> {
        try {
            const anonymousIssueData: any = {
                ...issueData,
                reporter_id: null,
                is_anonymous: true,
                priority: SupabaseService.mapPriorityForDb(issueData.priority),
                status: SupabaseService.mapStatusForDb(issueData.status),
                address: issueData.address || '',
            };
            if (issueData.latitude && issueData.longitude) {
                anonymousIssueData.latitude = issueData.latitude;
                anonymousIssueData.longitude = issueData.longitude;
            }

            // Debug: Log the data being sent
            console.log('Anonymous issue data being sent:', JSON.stringify(anonymousIssueData, null, 2));
            console.log('Category value:', `"${anonymousIssueData.category}"`);
            console.log('Category type:', typeof anonymousIssueData.category);

            const { data, error } = await supabase
                .from('issues')
                .insert([anonymousIssueData])
                .select()
                .single();

            if (error) {
                console.log('Error creating anonymous issue:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.log('Failed to create anonymous issue:', error);
            return null;
        }
    }

    /**
     * Get all issues with optional filters
     */
    static async getIssues(filters?: {
        category?: IssueCategory;
        priority?: 'Low' | 'Medium' | 'High';
        status?: IssueStatus;
        limit?: number;
        offset?: number;
    }): Promise<CivicIssue[]> {
        try {
            let query = supabase
                .from('issues')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters?.category) {
                query = query.eq('category', filters.category);
            }
            if (filters?.priority) {
                query = query.eq('priority', SupabaseService.mapPriorityForDb(filters.priority));
            }
            if (filters?.status) {
                query = query.eq('status', SupabaseService.mapStatusForDb(filters.status));
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }
            if (filters?.offset) {
                query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
            }

            const { data, error } = await query;

            if (error) {
                console.log('Error fetching issues:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.log('Failed to fetch issues:', error);
            return [];
        }
    }

    /**
     * Get a single issue by ID
     */
    static async getIssueById(issueId: string): Promise<CivicIssue | null> {
        try {
            const { data, error } = await supabase
                .from('issues')
                .select('*')
                .eq('id', issueId)
                .single();

            if (error) {
                console.log('Error fetching issue:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.log('Failed to fetch issue:', error);
            return null;
        }
    }

    /**
     * Update an issue (for officers)
     */
    static async updateIssue(issueId: string, updates: IssueUpdate): Promise<CivicIssue | null> {
        try {
            const updateData: any = {
                ...updates,
                updated_at: new Date().toISOString(),
            };
            if (updates.status) updateData.status = SupabaseService.mapStatusForDb(updates.status);
            if (updates.priority) updateData.priority = SupabaseService.mapPriorityForDb(updates.priority);

            const { data, error } = await supabase
                .from('issues')
                .update(updateData)
                .eq('id', issueId)
                .select()
                .single();

            if (error) {
                console.log('Error updating issue:', error);
                throw error;
            }

            // Notify the reporter if status changed
            if (updates.status && data?.reporter_id) {
                // Notification service integration removed
                console.log(`Issue ${issueId} status changed to ${updates.status} for reporter ${data.reporter_id}`);
            }

            return data;
        } catch (error) {
            console.log('Failed to update issue:', error);
            return null;
        }
    }

    /**
     * Update issue status (for officers)
     */
    static async updateIssueStatus(issueId: string, status: IssueStatus): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('issues')
                .update({
                    status: SupabaseService.mapStatusForDb(status),
                    updated_at: new Date().toISOString()
                })
                .eq('id', issueId);

            if (error) {
                console.log('Error updating issue status:', error);
                throw error;
            }
            // Look up reporter and notify
            const { data: issue } = await supabase
                .from('issues')
                .select('reporter_id')
                .eq('id', issueId)
                .single();

            if (issue?.reporter_id) {
                // Notification service integration removed
                console.log(`Issue ${issueId} status changed to ${status} for reporter ${issue.reporter_id}`);
            }

            return true;
        } catch (error) {
            console.log('Failed to update issue status:', error);
            return false;
        }
    }

    /**
     * Get issues by reporter (for citizens to see their reports)
     * Only returns authenticated user's issues, not anonymous ones
     */
    static async getIssuesByReporter(reporterId: string): Promise<CivicIssue[]> {
        try {
            const { data, error } = await supabase
                .from('issues')
                .select('*')
                .eq('reporter_id', reporterId)
                .eq('is_anonymous', false)
                .order('created_at', { ascending: false });

            if (error) {
                console.log('Error fetching user issues:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.log('Failed to fetch user issues:', error);
            return [];
        }
    }

    /**
     * Get all public issues (includes anonymous reports for public viewing)
     */
    static async getPublicIssues(filters?: {
        category?: IssueCategory;
        priority?: 'Low' | 'Medium' | 'High';
        status?: IssueStatus;
        limit?: number;
        offset?: number;
    }): Promise<CivicIssue[]> {
        try {
            let query = supabase
                .from('issues')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters?.category) {
                query = query.eq('category', filters.category);
            }
            if (filters?.priority) {
                query = query.eq('priority', SupabaseService.mapPriorityForDb(filters.priority));
            }
            if (filters?.status) {
                query = query.eq('status', SupabaseService.mapStatusForDb(filters.status));
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }
            if (filters?.offset) {
                query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
            }

            const { data, error } = await query;

            if (error) {
                console.log('Error fetching public issues:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.log('Failed to fetch public issues:', error);
            return [];
        }
    }

    // IMAGE STORAGE

    /**
     * Upload an image to Supabase Storage
     */
    /**
     * Helper to convert base64 to ArrayBuffer
     */
    private static decodeBase64(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Upload an image to Supabase Storage
     */
    static async uploadImage(imageUri: string, issueId: string, fileName: string): Promise<string | null> {
        try {
            console.log(`Uploading image:`, fileName);

            // Read file as base64 using Expo FileSystem
            const base64 = await FileSystem.readAsStringAsync(imageUri, {
                encoding: 'base64',
            });

            // Convert to ArrayBuffer
            const arrayBuffer = SupabaseService.decodeBase64(base64);

            // Determine MIME type
            const lower = (imageUri.split('?')[0] || '').toLowerCase();
            const ext = lower.substring(lower.lastIndexOf('.') + 1);
            const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'heic' ? 'image/heic' : 'image/jpeg';

            // Create file path
            const filePath = `${issueId}/${fileName}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('issue-images')
                .upload(filePath, arrayBuffer, {
                    contentType: mime,
                    upsert: false
                });

            if (error) {
                console.log(`Upload failed:`, error);
                throw error;
            }

            console.log('Image uploaded successfully:', data);

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('issue-images')
                .getPublicUrl(filePath);

            console.log('Public URL generated:', urlData.publicUrl);
            return urlData.publicUrl;

        } catch (error) {
            console.log(`Upload failed:`, error);
            // Don't retry blindly, just fail so user isn't stuck waiting
            return null;
        }
    }

    /**
     * Upload multiple images for an issue
     */
    static async uploadMultipleImages(
        imageUris: string[],
        issueId: string
    ): Promise<string[]> {
        const uploadPromises = imageUris.map(async (uri, index) => {
            const fileName = `image_${index + 1}_${Date.now()}.jpg`;
            return this.uploadImage(uri, issueId, fileName);
        });

        try {
            const results = await Promise.all(uploadPromises);
            return results.filter(url => url !== null) as string[];
        } catch (error) {
            console.log('Failed to upload multiple images:', error);
            return [];
        }
    }

    // COMMUNITY IMAGE STORAGE

    /**
     * Upload a community image to Supabase Storage (community-images bucket)
     * Path: {user_id}/{filename}
     */
    static async uploadCommunityImage(imageUri: string, fileName: string): Promise<string | null> {
        try {
            console.log(`Uploading community image:`, fileName);

            // Ensure we have a user id for pathing and RLS
            const { data: auth } = await supabase.auth.getUser();
            const userId = auth?.user?.id;
            if (!userId) {
                console.log('uploadCommunityImage: No authenticated user');
                return null;
            }

            // Read file as base64 using Expo FileSystem
            const base64 = await FileSystem.readAsStringAsync(imageUri, {
                encoding: 'base64',
            });

            // Convert to ArrayBuffer
            const arrayBuffer = SupabaseService.decodeBase64(base64);

            // Determine MIME type
            const lower = (imageUri.split('?')[0] || '').toLowerCase();
            const ext = lower.substring(lower.lastIndexOf('.') + 1);
            const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'heic' ? 'image/heic' : 'image/jpeg';

            // Create file path
            const filePath = `${userId}/${fileName}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('community-images')
                .upload(filePath, arrayBuffer, {
                    contentType: mime,
                    upsert: false,
                });

            if (error) {
                console.log(`Community upload failed:`, error);

                // Fallback attempt
                if (error.message?.includes('bucket') || error.message?.includes('not found')) {
                    console.log('Attempting fallback to issue-images bucket...');
                    const fallbackPath = `community/${userId}/${fileName}`;
                    const { data: fallbackData } = await supabase.storage
                        .from('issue-images')
                        .upload(fallbackPath, arrayBuffer, {
                            contentType: mime,
                            upsert: false,
                        });

                    if (fallbackData) {
                        const { data: urlData } = supabase.storage
                            .from('issue-images')
                            .getPublicUrl(fallbackPath);
                        return urlData.publicUrl;
                    }
                }
                throw error;
            }

            console.log('Community image uploaded successfully:', data);

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('community-images')
                .getPublicUrl(filePath);

            console.log('Community image public URL generated:', urlData.publicUrl);
            return urlData.publicUrl;

        } catch (error) {
            console.log(`Community upload failed:`, error);
            return null;
        }
    }

    /**
     * Upload multiple community images
     */
    static async uploadMultipleCommunityImages(imageUris: string[]): Promise<string[]> {
        const uploadPromises = imageUris.map(async (uri, index) => {
            const fileName = `post_${index + 1}_${Date.now()}.jpg`;
            return this.uploadCommunityImage(uri, fileName);
        });

        try {
            const results = await Promise.all(uploadPromises);
            return results.filter((url): url is string => !!url);
        } catch (error) {
            console.log('Failed to upload multiple community images:', error);
            return [];
        }
    }

    /**
     * Delete an image from storage
     */
    static async deleteImage(imageUrl: string): Promise<boolean> {
        try {
            // Extract file path from URL
            const url = new URL(imageUrl);
            const pathSegments = url.pathname.split('/');
            const filePath = pathSegments.slice(-2).join('/'); // Get last two segments (issueId/filename)

            const { error } = await supabase.storage
                .from('issue-images')
                .remove([filePath]);

            if (error) {
                console.log('Error deleting image:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.log('Failed to delete image:', error);
            return false;
        }
    }

    // ANALYTICS & STATISTICS

    /**
     * Get issue statistics for dashboard
     */
    static async getIssueStats(): Promise<{
        total: number;
        byStatus: Record<IssueStatus, number>;
        byCategory: Record<IssueCategory, number>;
        byPriority: Record<string, number>;
    }> {
        try {
            const { data, error } = await supabase
                .from('issues')
                .select('status, category, priority');

            if (error) {
                console.log('Error fetching issue stats:', error);
                throw error;
            }

            const total = data?.length || 0;
            const byStatus: Record<IssueStatus, number> = {
                'Pending': 0,
                'In Progress': 0,
                'Resolved': 0,
            };
            const byCategory: Record<IssueCategory, number> = {
                'Roads': 0,
                'Sanitation': 0,
                'Electricity': 0,
                'Water Supply': 0,
                'Public Safety': 0,
                'Others': 0,
            };
            const byPriority: Record<string, number> = {
                'Low': 0,
                'Medium': 0,
                'High': 0,
            };

            data?.forEach(issue => {
                const appStatus = SupabaseService.mapDbStatusToApp(issue.status);
                const appPriority = SupabaseService.mapDbPriorityToApp(issue.priority);
                byStatus[appStatus] = (byStatus[appStatus] ?? 0) + 1;
                if ((issue.category as IssueCategory) in byCategory) {
                    byCategory[issue.category as IssueCategory] = (byCategory[issue.category as IssueCategory] ?? 0) + 1;
                }
                byPriority[appPriority] = (byPriority[appPriority] ?? 0) + 1;
            });

            return { total, byStatus, byCategory, byPriority };
        } catch (error) {
            console.log('Failed to fetch issue stats:', error);
            return {
                total: 0,
                byStatus: { 'Pending': 0, 'In Progress': 0, 'Resolved': 0 },
                byCategory: { 'Roads': 0, 'Sanitation': 0, 'Electricity': 0, 'Water Supply': 0, 'Public Safety': 0, 'Others': 0 },
                byPriority: { 'Low': 0, 'Medium': 0, 'High': 0 },
            };
        }
    }

    // REAL-TIME SUBSCRIPTIONS

    /**
     * Subscribe to new issues (for officer dashboard)
     */
    static subscribeToIssues(callback: (payload: any) => void) {
        return supabase
            .channel('issues')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'issues',
                },
                callback
            )
            .subscribe();
    }

    /**
     * Subscribe to issue status updates for a specific user
     */
    static subscribeToUserIssues(userId: string, callback: (payload: any) => void) {
        return supabase
            .channel(`user_issues_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'issues',
                    filter: `reporter_id=eq.${userId}`,
                },
                callback
            )
            .subscribe();
    }
}

export default SupabaseService;
