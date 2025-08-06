import { Redirect } from 'expo-router';

export default function Index() {
    // Since we removed auth, we'll redirect directly to tabs
    return <Redirect href="/(tabs)" />;
}
