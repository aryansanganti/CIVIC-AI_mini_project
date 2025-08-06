import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { analyzeCivicIssue, generateIssueDescription } from '../lib/gemini';
import { IssueCategory } from '../types';

export default function ReportScreen() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Other');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  const isDark = colorScheme === 'dark';

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to report issues');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const address = addressResponse[0];
        const addressString = [
          address.street,
          address.city,
          address.region,
          address.country,
        ].filter(Boolean).join(', ');
        setLocation(prev => ({ ...prev!, address: addressString }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImages = [...images, result.assets[0].uri];
        setImages(newImages);
        
        // Analyze the first image with AI
        if (newImages.length === 1) {
          analyzeImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImages = [...images, result.assets[0].uri];
        setImages(newImages);
        
        // Analyze the first image with AI
        if (newImages.length === 1) {
          analyzeImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    try {
      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        
        const analysis = await analyzeCivicIssue(base64Data);
        
        if (analysis.confidence > 30) {
          setCategory(analysis.category as IssueCategory);
          setDescription(analysis.description);
          setUrgency(analysis.urgency);
          setTitle(`Issue: ${analysis.category}`);
          setAiConfidence(analysis.confidence);
          
          Alert.alert(
            'AI Analysis Complete',
            `Detected: ${analysis.category}\nConfidence: ${analysis.confidence}%\n\nAI has automatically filled the form based on the image. You can edit the details if needed.`,
            [{ text: 'OK' }]
          );
        } else {
          setAiConfidence(analysis.confidence);
          Alert.alert(
            'AI Analysis',
            'The image doesn\'t appear to show a clear civic issue. Please fill in the details manually.',
            [{ text: 'OK' }]
          );
        }
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image with AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeText = async (userText: string) => {
    if (!userText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await generateIssueDescription(userText);
      setCategory(analysis.category as IssueCategory);
      setDescription(analysis.description);
      setUrgency(analysis.urgency);
      setTitle(`Issue: ${analysis.category}`);
      
      Alert.alert(
        'AI Analysis Complete',
        `Based on your description, AI suggests:\nCategory: ${analysis.category}\nUrgency: ${analysis.urgency}\n\nAI has updated the form. You can edit if needed.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error analyzing text:', error);
      Alert.alert('Error', 'Failed to analyze text with AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (newImages.length === 0) {
      setAiConfidence(null);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location is required');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Submit to Firebase
      console.log('Submitting issue:', {
        title,
        description,
        category,
        urgency,
        location,
        images,
        isAnonymous,
        aiConfidence,
      });
      
      Alert.alert(
        'Success',
        'Issue reported successfully! Our AI will help route this to the appropriate department.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error submitting issue:', error);
      Alert.alert('Error', 'Failed to submit issue');
    } finally {
      setIsLoading(false);
    }
  };

  const categories: IssueCategory[] = [
    'Road Damage',
    'Street Light',
    'Garbage',
    'Water Leak',
    'Traffic Signal',
    'Pothole',
    'Street Sign',
    'Other',
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Ionicons name="close" size={24} color={isDark ? '#ffffff' : '#111827'} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? '#ffffff' : '#111827' }}>
              Report Issue
            </Text>
          </View>

          {/* AI Status */}
          {aiConfidence !== null && (
            <View style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              borderLeftWidth: 4,
              borderLeftColor: aiConfidence > 50 ? '#10b981' : '#f59e0b',
            }}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: isDark ? '#ffffff' : '#111827',
                marginBottom: 4 
              }}>
                🤖 AI Analysis
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: isDark ? '#9ca3af' : '#6b7280' 
              }}>
                Confidence: {aiConfidence}% • Form auto-filled by AI
              </Text>
            </View>
          )}

          {/* Image Capture */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: isDark ? '#ffffff' : '#111827',
              marginBottom: 12 
            }}>
              📸 Photos (AI will analyze automatically)
            </Text>
            
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  borderRadius: 8,
                  padding: 12,
                  marginRight: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: isDark ? '#374151' : '#e5e7eb',
                }}
              >
                <Ionicons name="images-outline" size={24} color={isDark ? '#60a5fa' : '#3b82f6'} />
                <Text style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
                  Gallery
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={takePhoto}
                style={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: isDark ? '#374151' : '#e5e7eb',
                }}
              >
                <Ionicons name="camera-outline" size={24} color={isDark ? '#60a5fa' : '#3b82f6'} />
                <Text style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
                  Camera
                </Text>
              </TouchableOpacity>
            </View>

            {isAnalyzing && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
              }}>
                <ActivityIndicator size="small" color={isDark ? '#60a5fa' : '#3b82f6'} />
                <Text style={{ 
                  marginLeft: 8, 
                  fontSize: 14, 
                  color: isDark ? '#9ca3af' : '#6b7280' 
                }}>
                  🤖 AI is analyzing your image...
                </Text>
              </View>
            )}

            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((image, index) => (
                  <View key={index} style={{ marginRight: 8 }}>
                    <Image source={{ uri: image }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: '#ef4444',
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="close" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Title */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: isDark ? '#ffffff' : '#111827',
              marginBottom: 8 
            }}>
              Title *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Brief description of the issue"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              style={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: isDark ? '#ffffff' : '#111827',
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#e5e7eb',
              }}
            />
          </View>

          {/* Description */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: isDark ? '#ffffff' : '#111827',
              marginBottom: 8 
            }}>
              Description *
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the issue in detail (AI will analyze and suggest improvements)"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: isDark ? '#ffffff' : '#111827',
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#e5e7eb',
                textAlignVertical: 'top',
              }}
            />
            <TouchableOpacity
              onPress={() => analyzeText(description)}
              disabled={!description.trim() || isAnalyzing}
              style={{
                backgroundColor: isDark ? '#3b82f6' : '#3b82f6',
                borderRadius: 8,
                padding: 8,
                alignItems: 'center',
                marginTop: 8,
                opacity: !description.trim() || isAnalyzing ? 0.5 : 1,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '500' }}>
                🤖 Analyze with AI
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: isDark ? '#ffffff' : '#111827',
              marginBottom: 8 
            }}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={{
                    backgroundColor: category === cat ? (isDark ? '#3b82f6' : '#3b82f6') : (isDark ? '#1f2937' : '#ffffff'),
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                  }}
                >
                  <Text style={{ 
                    color: category === cat ? '#ffffff' : (isDark ? '#9ca3af' : '#6b7280'),
                    fontSize: 14,
                    fontWeight: '500',
                  }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Urgency */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: isDark ? '#ffffff' : '#111827',
              marginBottom: 8 
            }}>
              Urgency
            </Text>
            <View style={{ flexDirection: 'row' }}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setUrgency(level)}
                  style={{
                    flex: 1,
                    backgroundColor: urgency === level ? (isDark ? '#3b82f6' : '#3b82f6') : (isDark ? '#1f2937' : '#ffffff'),
                    paddingVertical: 12,
                    marginHorizontal: 4,
                    borderRadius: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                  }}
                >
                  <Text style={{ 
                    color: urgency === level ? '#ffffff' : (isDark ? '#9ca3af' : '#6b7280'),
                    fontSize: 14,
                    fontWeight: '500',
                    textTransform: 'capitalize',
                  }}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: isDark ? '#ffffff' : '#111827',
              marginBottom: 8 
            }}>
              📍 Location
            </Text>
            <View style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: isDark ? '#374151' : '#e5e7eb',
            }}>
              {location ? (
                <View>
                  <Text style={{ 
                    fontSize: 14, 
                    color: isDark ? '#9ca3af' : '#6b7280',
                    marginBottom: 4 
                  }}>
                    {location.address || 'Current Location'}
                  </Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: isDark ? '#6b7280' : '#9ca3af' 
                  }}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Text>
                </View>
              ) : (
                <Text style={{ 
                  fontSize: 14, 
                  color: isDark ? '#6b7280' : '#9ca3af' 
                }}>
                  Getting location...
                </Text>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? (isDark ? '#6b7280' : '#9ca3af') : (isDark ? '#3b82f6' : '#3b82f6'),
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginTop: 20,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                🤖 Submit with AI Analysis
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 