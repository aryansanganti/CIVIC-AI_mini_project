// Temporary script to clear SecureStore data
import * as SecureStore from 'expo-secure-store';

const clearSecureStore = async () => {
    try {
        // Common Supabase keys that might exist
        const possibleKeys = [
            'supabase/auth/session',
            'supabase_auth_session',
            'sb-auth-token',
            'sb_auth_token',
            'supabase-auth-token',
            'supabase_session',
            'default_key'
        ];

        for (const key of possibleKeys) {
            try {
                await SecureStore.deleteItemAsync(key);
                console.log(`Cleared: ${key}`);
            } catch (error) {
                // Key probably doesn't exist, which is fine
            }
        }

        console.log('SecureStore cleared successfully');
    } catch (error) {
        console.error('Error clearing SecureStore:', error);
    }
};

clearSecureStore();
