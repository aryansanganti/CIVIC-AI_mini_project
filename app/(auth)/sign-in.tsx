import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, AppState, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto refresh while app is foregrounded
    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') supabase.auth.startAutoRefresh();
            else supabase.auth.stopAutoRefresh();
        });
        return () => sub.remove();
    }, []);

    async function signInWithEmail() {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            router.replace('/(tabs)');
        } catch (e) {
            if (e instanceof Error) Alert.alert(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function signUpWithEmail() {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            if (!data.session) Alert.alert('Check your inbox to verify your email');
        } catch (e) {
            if (e instanceof Error) Alert.alert(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function signInWithGoogle() {
        try {
            setLoading(true);

            // DEBUG: Log the redirect URI
            console.log('🔍 Platform:', Platform.OS);
            console.log('🔍 Environment:', __DEV__ ? 'development' : 'production');

            if (Platform.OS === 'web') {
                // Web platform - let Supabase handle in-window
                const redirectTo = makeRedirectUri({ scheme: 'civicai', path: 'auth-callback' });
                console.log('🔍 Web redirect URI:', redirectTo);

                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo,
                        queryParams: { access_type: 'offline', prompt: 'consent' },
                    },
                });
                if (error) throw error;
            } else {
                // Mobile platform - use WebBrowser with deep linking
                const redirectTo = 'civicai://auth-callback';
                console.log('🔍 Mobile redirect URI:', redirectTo);

                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo,
                        skipBrowserRedirect: true,
                        queryParams: { access_type: 'offline', prompt: 'consent' },
                    },
                });

                if (error) throw error;
                if (!data?.url) throw new Error('Failed to get auth URL');

                console.log('🔍 Opening auth URL:', data.url);

                // Use WebBrowser to open the OAuth URL
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    redirectTo,
                    {
                        // Additional options for better compatibility
                        showInRecents: true,
                    }
                );

                console.log('🔍 WebBrowser result:', result);

                if (result.type === 'success') {
                    console.log('🔍 Auth success, callback URL:', result.url);

                    // Parse the callback URL to extract tokens
                    if (result.url && result.url.includes('access_token')) {
                        // Extract tokens from the callback URL
                        const urlObj = new URL(result.url.replace('civicai://', 'https://dummy.com/'));
                        const hash = urlObj.hash.substring(1);
                        const hashParams = new URLSearchParams(hash);
                        const searchParams = new URLSearchParams(urlObj.search);

                        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
                        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');

                        console.log('🔍 Extracted tokens:', {
                            hasAccessToken: !!accessToken,
                            hasRefreshToken: !!refreshToken
                        });

                        if (accessToken && refreshToken) {
                            // Set the session directly
                            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken,
                            });

                            if (!sessionError && sessionData.session) {
                                console.log('🔍 Session set successfully');
                                // Session will be automatically saved by the auth state change handler
                                await AsyncStorage.removeItem('guest');
                                router.replace('/(tabs)');
                                return;
                            } else {
                                console.error('🔍 Error setting session:', sessionError);
                                throw new Error('Failed to set session');
                            }
                        } else {
                            throw new Error('Missing authentication tokens');
                        }
                    } else {
                        // Navigate to auth callback page to handle the deep link
                        router.push('/auth-callback');
                    }
                } else if (result.type === 'cancel') {
                    console.log('🔍 Auth cancelled by user');
                    Alert.alert('Sign-in Cancelled', 'Google sign-in was cancelled');
                } else if (result.type === 'dismiss') {
                    console.log('🔍 Auth dismissed by user');
                    Alert.alert('Sign-in Dismissed', 'Google sign-in was dismissed');
                } else {
                    console.log('🔍 Auth failed with result:', result);
                    Alert.alert('Sign-in Failed', 'Unable to complete Google sign-in');
                }
            }
        } catch (e) {
            console.error('🔍 Google sign-in error:', e);
            if (e instanceof Error) Alert.alert('Sign-in Error', e.message);
        } finally {
            setLoading(false);
        }
    }

    async function continueAsGuest() {
        await AsyncStorage.setItem('guest', '1');
        router.replace('/(tabs)');
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
            <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>Welcome</Text>
            <Text style={{ color: '#6b7280', marginBottom: 16 }}>Sign in to continue</Text>

            <Text>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12 }}
            />

            <Text>Password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12 }}
            />

            <TouchableOpacity onPress={signInWithEmail} disabled={loading} style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>{loading ? 'Signing in…' : 'Sign In'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={signUpWithEmail} disabled={loading} style={{ backgroundColor: '#111827', padding: 14, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>{loading ? 'Please wait…' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 }} />

            <TouchableOpacity onPress={signInWithGoogle} disabled={loading} style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db', padding: 14, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ color: '#111827', fontWeight: '600' }}>Sign in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={continueAsGuest} style={{ padding: 14, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ color: '#6b7280', fontWeight: '600' }}>Continue as guest</Text>
            </TouchableOpacity>
        </View>
    );
}

// end
