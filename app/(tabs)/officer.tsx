import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CivicIssue, IssueStatus } from '../../types';

export default function OfficerScreen() {
  const colorScheme = useColorScheme();
  const [assignedIssues, setAssignedIssues] = useState<CivicIssue[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<IssueStatus | 'all'>('all');

  const isDark = colorScheme === 'dark';

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch assigned issues
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getStatusColor = (status: IssueStatus) => {
    const colors = {
      reported: isDark ? '#6b7280' : '#9ca3af',
      assigned: isDark ? '#3b82f6' : '#3b82f6',
      in_progress: isDark ? '#f59e0b' : '#d97706',
      resolved: isDark ? '#10b981' : '#059669',
      closed: isDark ? '#6b7280' : '#9ca3af',
      escalated: isDark ? '#ef4444' : '#dc2626',
    };
    return colors[status] || colors.reported;
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      low: isDark ? '#10b981' : '#059669',
      medium: isDark ? '#f59e0b' : '#d97706',
      high: isDark ? '#ef4444' : '#dc2626',
    };
    return colors[urgency as keyof typeof colors] || colors.medium;
  };

  const filters: { key: IssueStatus | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'assigned', label: 'Assigned', icon: 'person' },
    { key: 'in_progress', label: 'In Progress', icon: 'time' },
    { key: 'resolved', label: 'Resolved', icon: 'checkmark-circle' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ padding: 20 }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: isDark ? '#ffffff' : '#111827',
            marginBottom: 8 
          }}>
            Officer Dashboard
          </Text>
          <Text style={{ 
            fontSize: 16, 
            color: isDark ? '#9ca3af' : '#6b7280',
            marginBottom: 20 
          }}>
            Manage assigned civic issues
          </Text>

          {/* Stats Cards */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            marginBottom: 20 
          }}>
            <View style={{ 
              flex: 1, 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderRadius: 12,
              padding: 16,
              marginRight: 8,
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? '#3b82f6' : '#3b82f6' }}>
                {assignedIssues.filter(i => i.status === 'assigned').length}
              </Text>
              <Text style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280' }}>
                Assigned
              </Text>
            </View>
            <View style={{ 
              flex: 1, 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderRadius: 12,
              padding: 16,
              marginLeft: 8,
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? '#f59e0b' : '#d97706' }}>
                {assignedIssues.filter(i => i.status === 'in_progress').length}
              </Text>
              <Text style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280' }}>
                In Progress
              </Text>
            </View>
          </View>

          {/* Filter Tabs */}
          <View style={{ 
            flexDirection: 'row', 
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
          }}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setSelectedFilter(filter.key)}
                style={{
                  flex: 1,
                  backgroundColor: selectedFilter === filter.key 
                    ? (isDark ? '#3b82f6' : '#3b82f6') 
                    : 'transparent',
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Ionicons 
                  name={filter.icon as any} 
                  size={16} 
                  color={selectedFilter === filter.key ? '#ffffff' : (isDark ? '#9ca3af' : '#6b7280')} 
                  style={{ marginRight: 4 }}
                />
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: '500',
                  color: selectedFilter === filter.key ? '#ffffff' : (isDark ? '#9ca3af' : '#6b7280') 
                }}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Issues List */}
          {assignedIssues.length === 0 ? (
            <View style={{ 
              alignItems: 'center', 
              padding: 40,
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderRadius: 12,
            }}>
              <Ionicons 
                name="shield-outline" 
                size={48} 
                color={isDark ? '#6b7280' : '#9ca3af'} 
              />
              <Text style={{ 
                marginTop: 16, 
                fontSize: 16, 
                color: isDark ? '#9ca3af' : '#6b7280',
                textAlign: 'center'
              }}>
                No assigned issues
              </Text>
              <Text style={{ 
                marginTop: 8, 
                fontSize: 14, 
                color: isDark ? '#6b7280' : '#9ca3af',
                textAlign: 'center'
              }}>
                Issues will appear here when assigned to you
              </Text>
            </View>
          ) : (
            assignedIssues
              .filter(issue => selectedFilter === 'all' || issue.status === selectedFilter)
              .map((issue) => (
                <TouchableOpacity
                  key={issue.id}
                  style={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: '600', 
                      color: isDark ? '#ffffff' : '#111827',
                      flex: 1
                    }}>
                      {issue.title}
                    </Text>
                    <View style={{
                      backgroundColor: getUrgencyColor(issue.urgency),
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      marginLeft: 8,
                    }}>
                      <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '500' }}>
                        {issue.urgency.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={{ 
                    fontSize: 14, 
                    color: isDark ? '#9ca3af' : '#6b7280',
                    marginBottom: 8,
                    lineHeight: 20
                  }}>
                    {issue.description}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        backgroundColor: getStatusColor(issue.status),
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                      }}>
                        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '500' }}>
                          {issue.status.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: isDark ? '#6b7280' : '#9ca3af' }}>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 