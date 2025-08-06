import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import * as Location from 'expo-location';
import { CivicIssue, IssueCategory } from '../../types';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [region, setRegion] = useState({
    latitude: 19.0760, // Mumbai coordinates as default
    longitude: 72.8777,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDark = colorScheme === 'dark';

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to show your position on the map and nearby civic issues.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        setIsLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setRegion(newRegion);
      setUserLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

             // TODO: Fetch issues near this location
       // For now, we'll use mock data
       setIssues([
         {
           id: '1',
           title: 'Pothole on Main Street',
           description: 'Large pothole causing traffic issues',
           category: 'Pothole',
           urgency: 'high',
           status: 'reported',
           location: {
             latitude: currentLocation.coords.latitude + 0.001,
             longitude: currentLocation.coords.longitude + 0.001,
           },
           images: [],
           reportedBy: 'anonymous',
           createdAt: new Date(),
           updatedAt: new Date(),
           upvotes: 5,
           comments: [],
           tags: ['road', 'traffic'],
         },
         {
           id: '2',
           title: 'Broken Street Light',
           description: 'Street light not working for 3 days',
           category: 'Street Light',
           urgency: 'medium',
           status: 'assigned',
           location: {
             latitude: currentLocation.coords.latitude - 0.001,
             longitude: currentLocation.coords.longitude - 0.001,
           },
           images: [],
           reportedBy: 'anonymous',
           createdAt: new Date(),
           updatedAt: new Date(),
           upvotes: 3,
           comments: [],
           tags: ['lighting', 'safety'],
         },
       ]);

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your GPS settings.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: IssueCategory) => {
    const icons = {
      'Road Damage': 'car',
      'Street Light': 'bulb',
      'Garbage': 'trash',
      'Water Leak': 'water',
      'Traffic Signal': 'traffic-light',
      'Pothole': 'alert-circle',
      'Street Sign': 'navigate',
      'Other': 'help-circle',
    };
    return icons[category] || 'help-circle';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
    };
    return colors[urgency as keyof typeof colors] || colors.medium;
  };

  const handleMapError = (error: any) => {
    console.error('Map error:', error);
    setMapError('Unable to load map. Please check your internet connection.');
  };

  const retryMap = () => {
    setMapError(null);
    getCurrentLocation();
  };

  if (mapError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
        <View style={styles.errorContainer}>
          <Ionicons 
            name="map-outline" 
            size={64} 
            color={isDark ? '#6b7280' : '#9ca3af'} 
          />
          <Text style={[styles.errorTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
            Map Unavailable
          </Text>
          <Text style={[styles.errorMessage, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            {mapError}
          </Text>
          <TouchableOpacity
            onPress={retryMap}
            style={[styles.retryButton, { backgroundColor: isDark ? '#3b82f6' : '#3b82f6' }]}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          provider={PROVIDER_GOOGLE}
          mapType={isDark ? 'satellite' : 'standard'}
          loadingEnabled={true}
          loadingIndicatorColor={isDark ? '#60a5fa' : '#3b82f6'}
          loadingBackgroundColor={isDark ? '#1f2937' : '#ffffff'}
        >
          {issues.map((issue) => (
            <Marker
              key={issue.id}
              coordinate={{
                latitude: issue.location.latitude,
                longitude: issue.location.longitude,
              }}
              pinColor={getUrgencyColor(issue.urgency)}
            >
              <Callout>
                <View style={styles.callout}>
                  <View style={styles.calloutHeader}>
                    <Ionicons 
                      name={getCategoryIcon(issue.category) as any} 
                      size={16} 
                      color={getUrgencyColor(issue.urgency)} 
                    />
                    <Text style={styles.calloutTitle}>{issue.title}</Text>
                  </View>
                  <Text style={styles.calloutDescription}>{issue.description}</Text>
                  <View style={styles.calloutFooter}>
                    <Text style={styles.calloutUrgency}>{issue.urgency.toUpperCase()}</Text>
                    <Text style={styles.calloutDate}>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        <View style={[styles.legend, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }]}>
          <Text style={[styles.legendTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
            Issue Types
          </Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={[styles.legendText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                Low Priority
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={[styles.legendText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                Medium Priority
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
              <Text style={[styles.legendText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                High Priority
              </Text>
            </View>
          </View>
        </View>

        {isLoading && (
          <View style={[styles.loadingOverlay, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }]}>
            <Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#111827' }]}>
              Loading map...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  callout: {
    width: 200,
    padding: 8,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
    flex: 1,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  calloutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calloutUrgency: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  calloutDate: {
    fontSize: 10,
    color: '#9ca3af',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 