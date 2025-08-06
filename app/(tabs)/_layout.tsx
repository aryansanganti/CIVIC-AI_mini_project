import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#60a5fa' : '#3b82f6',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#6b7280' : '#9ca3af',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
        },
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'map' : 'map-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="officer"
        options={{
          title: 'Officer',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'shield' : 'shield-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
} 