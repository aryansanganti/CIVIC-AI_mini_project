// Test Google OAuth Setup
import { supabase } from './lib/supabase';

console.log('=== TESTING GOOGLE OAUTH SETUP ===');

// Test 1: Check Supabase configuration
console.log('1. Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('2. Supabase Key configured:', !!process.env.EXPO_PUBLIC_SUPABASE_KEY);

// Test 2: Test OAuth provider availability
async function testOAuthProviders() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'civicai://auth-callback',
                skipBrowserRedirect: true,
            },
        });

        console.log('3. OAuth test result:', {
            success: !error,
            hasUrl: !!data?.url,
            error: error?.message
        });

        if (data?.url) {
            console.log('4. Generated OAuth URL:', data.url.substring(0, 100) + '...');
        }
    } catch (e) {
        console.log('3. OAuth test failed:', e.message);
    }
}

// Run test
testOAuthProviders();
