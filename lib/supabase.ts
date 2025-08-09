import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';

// Simple and reliable SecureStore wrapper for Supabase
class SimpleSecureStore {
    private cleanKey(key: string): string {
        // Handle empty or null keys
        if (!key || typeof key !== 'string') {
            console.warn('Invalid key provided to SecureStore:', key);
            return 'supabase_default';
        }

        // Convert Supabase's default keys to safe format
        // "supabase/auth/session" -> "supabase_auth_session"
        // "sb-xxx-auth-token" -> "sb_xxx_auth_token"
        let cleaned = key
            .replace(/\//g, '_')        // Replace slashes with underscores
            .replace(/[^a-zA-Z0-9\-_.]/g, '_')  // Replace invalid chars with underscores
            .replace(/_{2,}/g, '_')     // Replace multiple underscores with single
            .replace(/^_+|_+$/g, '');   // Remove leading/trailing underscores

        // Ensure key is not empty after cleaning
        if (!cleaned) {
            cleaned = 'supabase_session';
        }

        return cleaned;
    }

    async getItem(key: string): Promise<string | null> {
        try {
            if (!key) {
                console.warn('Empty key provided to SecureStore.getItem');
                return null;
            }
            const cleanKey = this.cleanKey(key);
            console.log(`🔑 SecureStore.getItem: "${key}" -> "${cleanKey}"`);
            const item = await SecureStore.getItemAsync(cleanKey);
            return item;
        } catch (error) {
            console.error('SecureStore getItem error:', error);
            // Fallback to AsyncStorage if SecureStore fails
            try {
                return await AsyncStorage.getItem(key);
            } catch (fallbackError) {
                console.error('AsyncStorage fallback error:', fallbackError);
                return null;
            }
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        try {
            if (!key) {
                console.warn('Empty key provided to SecureStore.setItem');
                return;
            }
            const cleanKey = this.cleanKey(key);
            console.log(`🔑 SecureStore.setItem: "${key}" -> "${cleanKey}"`);
            await SecureStore.setItemAsync(cleanKey, value);
        } catch (error) {
            console.error('SecureStore setItem error:', error);
            // Fallback to AsyncStorage if SecureStore fails
            try {
                await AsyncStorage.setItem(key, value);
            } catch (fallbackError) {
                console.error('AsyncStorage fallback error:', fallbackError);
            }
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            if (!key) {
                console.warn('Empty key provided to SecureStore.removeItem');
                return;
            }
            const cleanKey = this.cleanKey(key);
            console.log(`🔑 SecureStore.removeItem: "${key}" -> "${cleanKey}"`);
            await SecureStore.deleteItemAsync(cleanKey);
        } catch (error) {
            console.error('SecureStore removeItem error:', error);
            // Fallback to AsyncStorage if SecureStore fails
            try {
                await AsyncStorage.removeItem(key);
            } catch (fallbackError) {
                console.error('AsyncStorage fallback error:', fallbackError);
            }
        }
    }
}

// Pull from Expo public env. Define EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn('Supabase env not set: EXPO_PUBLIC_SUPABASE_URL/EXPO_PUBLIC_SUPABASE_KEY');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
    auth: {
        storage: new SimpleSecureStore() as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

export type { Session } from '@supabase/supabase-js';
