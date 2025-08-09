import { Session, supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Account({ session }: { session: Session }) {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [website, setWebsite] = useState('');

    useEffect(() => {
        if (session) void getProfile();
    }, [session]);

    async function getProfile() {
        try {
            setLoading(true);
            if (!session?.user) throw new Error('No user on the session!');
            const { data, error, status } = await supabase
                .from('profiles')
                .select('username, website')
                .eq('id', session.user.id)
                .single();
            if (error && status !== 406) throw error;
            if (data) {
                setUsername(data.username ?? '');
                setWebsite(data.website ?? '');
            }
        } catch (e) {
            if (e instanceof Error) Alert.alert(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile() {
        try {
            setLoading(true);
            if (!session?.user) throw new Error('No user on the session!');
            const updates = { id: session.user.id, username, website, updated_at: new Date() };
            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
        } catch (e) {
            if (e instanceof Error) Alert.alert(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ padding: 16, gap: 12 }}>
            <Text>Email</Text>
            <Text style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>{session.user.email}</Text>
            <Text>Username</Text>
            <TextInput value={username} onChangeText={setUsername} style={{ padding: 12, borderWidth: 1, borderRadius: 8 }} />
            <Text>Website</Text>
            <TextInput value={website} onChangeText={setWebsite} style={{ padding: 12, borderWidth: 1, borderRadius: 8 }} />
            <TouchableOpacity onPress={updateProfile} disabled={loading} style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 10, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>{loading ? 'Saving…' : 'Update'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => supabase.auth.signOut()} style={{ backgroundColor: '#ef4444', padding: 14, borderRadius: 10, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}
