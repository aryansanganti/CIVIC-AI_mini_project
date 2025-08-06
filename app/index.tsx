import { Redirect } from 'expo-router';

export default function Index() {
  // For now, we'll always redirect to the tabs since we removed auth
  return <Redirect href="/(tabs)" />;
}
