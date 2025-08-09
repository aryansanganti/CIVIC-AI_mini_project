import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                console.log('🔄 Auth callback processing...');

                // Wait for the session to be established via deep link
                let attempts = 0;
                const maxAttempts = 10;

                while (attempts < maxAttempts) {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    console.log(`🔄 Session check attempt ${attempts + 1}:`, session ? 'Found' : 'Not found');

                    if (session) {
                        console.log('✅ Authentication successful, user data:', {
                            email: session.user.email,
                            name: session.user.user_metadata?.full_name,
                            avatar: session.user.user_metadata?.avatar_url,
                        });

                        // Clear guest mode
                        await AsyncStorage.removeItem('guest');

                        // Redirect to main app
                        router.replace('/(tabs)');
                        return;
                    }

                    if (error) {
                        console.error('Auth callback error:', error);
                        break;
                    }

                    // Wait before next attempt
                    await new Promise(resolve => setTimeout(resolve, 500));
                    attempts++;
                }

                // If we get here, authentication failed or timed out
                console.log('❌ Authentication failed or timed out, redirecting to sign in');
                router.replace('/(auth)/sign-in');

            } catch (error) {
                console.error('Auth callback error:', error);
                router.replace('/(auth)/sign-in');
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <ActivityIndicator size="large" color="#2563eb" style={{ marginBottom: 20 }} />
            <Text style={{ fontSize: 18, marginBottom: 10, textAlign: 'center' }}>
                Completing sign in...
            </Text>
            <Text style={{ color: '#666', textAlign: 'center' }}>
                Please wait while we finish setting up your account
            </Text>
        </View>
    );
}
