import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CivicIssue, IssueStatus } from '../../types';

export default function IssueDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [issue, setIssue] = useState<CivicIssue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    // Mock data - in real app, fetch from Firebase
    const mockIssue: CivicIssue = {
      id: id as string,
      title: 'Pothole on Main Street',
      description: 'Large pothole causing traffic issues and potential damage to vehicles.',
      category: 'Roads & Infrastructure',
      urgency: 'high',
      status: 'in-progress',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: '123 Main Street, San Francisco, CA'
      },
      reportedBy: 'user123',
      reportedAt: new Date('2024-01-15T10:30:00Z'),
      updatedAt: new Date('2024-01-16T14:20:00Z'),
      images: ['https://via.placeholder.com/400x300'],
      tags: ['pothole', 'traffic', 'safety'],
      assignedOfficer: 'officer456',
      comments: [
        {
          id: 'comment1',
          text: 'Issue has been reported to the maintenance team.',
          author: 'officer456',
          createdAt: new Date('2024-01-16T14:20:00Z')
        }
      ],
      upvotes: 15,
      downvotes: 2
    };

    setIssue(mockIssue);
    setIsLoading(false);
  }, [id]);

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case 'open':
        return isDark ? '#ef4444' : '#dc2626';
      case 'in-progress':
        return isDark ? '#f59e0b' : '#d97706';
      case 'resolved':
        return isDark ? '#10b981' : '#059669';
      case 'closed':
        return isDark ? '#6b7280' : '#4b5563';
      default:
        return isDark ? '#6b7280' : '#4b5563';
    }
  };

  const getStatusText = (status: IssueStatus) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in-progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: isDark ? '#ffffff' : '#111827' }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!issue) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: isDark ? '#ffffff' : '#111827' }}>Issue not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Ionicons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#111827'} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? '#ffffff' : '#111827' }}>
              Issue Details
            </Text>
          </View>

          {/* Issue Image */}
          {issue.images && issue.images.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Image
                source={{ uri: issue.images[0] }}
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 12,
                  backgroundColor: isDark ? '#374151' : '#f3f4f6'
                }}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Issue Info Card */}
          <View style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: isDark ? '#ffffff' : '#111827' }}>
                {issue.title}
              </Text>
              <View style={{
                backgroundColor: getStatusColor(issue.status),
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 8,
              }}>
                <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                  {getStatusText(issue.status)}
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 16, color: isDark ? '#9ca3af' : '#6b7280', marginBottom: 16 }}>
              {issue.description}
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {issue.tags.map((tag, index) => (
                <View key={index} style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}>
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, marginLeft: 4 }}>
                  {issue.location.address}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14, marginLeft: 4 }}>
                  {issue.reportedAt.toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Card */}
          <View style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? '#ffffff' : '#111827', marginBottom: 16 }}>
              Community Response
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: isDark ? '#10b981' : '#059669' }}>
                  {issue.upvotes}
                </Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14 }}>
                  Upvotes
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: isDark ? '#ef4444' : '#dc2626' }}>
                  {issue.downvotes}
                </Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14 }}>
                  Downvotes
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: isDark ? '#3b82f6' : '#3b82f6' }}>
                  {issue.comments.length}
                </Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14 }}>
                  Comments
                </Text>
              </View>
            </View>
          </View>

          {/* Comments */}
          <View style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: 12,
            padding: 20,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? '#ffffff' : '#111827', marginBottom: 16 }}>
              Comments ({issue.comments.length})
            </Text>
            {issue.comments.map((comment) => (
              <View key={comment.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#f3f4f6' }}>
                <Text style={{ color: isDark ? '#ffffff' : '#111827', fontSize: 16, marginBottom: 8 }}>
                  {comment.text}
                </Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>
                  {comment.createdAt.toLocaleDateString()} at {comment.createdAt.toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 