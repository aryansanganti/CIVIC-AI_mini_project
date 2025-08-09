import { Session, supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
    const [session, setSession] = useState<Session | null>(null);
    const [ready, setReady] = useState(false);
    const [guest, setGuest] = useState(false);

    useEffect(() => {
        Promise.all([
            supabase.auth.getSession(),
            AsyncStorage.getItem('guest'),
        ]).then(([{ data: { session } }, guestFlag]) => {
            setSession(session);
            setGuest(guestFlag === '1');
            setReady(true);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
        return () => { sub.subscription.unsubscribe(); };
    }, []);

    if (!ready) return null;
    return <Redirect href={session?.user || guest ? '/(tabs)' : '/(auth)/sign-in'} />;
}
