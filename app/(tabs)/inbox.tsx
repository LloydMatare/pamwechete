import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export default function InboxScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<Id<"users"> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('user_id').then((id) => {
      if (id) setUserId(id as Id<"users">);
    });
  }, []);

  const trades = useQuery(api.trades.getForUser, { userId: userId || undefined });

  if (!userId) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-gray-500 text-center">Please complete onboarding to view your messages.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="pt-16 pb-4 px-6 border-b border-gray-50">
        <Text className="text-3xl font-bold text-black tracking-tight">Messages</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {trades === undefined ? (
          <View className="p-10 items-center">
            <ActivityIndicator color="#FF4C29" />
          </View>
        ) : trades.length === 0 ? (
          <View className="p-10 items-center">
            <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="chatbubbles-outline" size={32} color="#ABB3BB" />
            </View>
            <Text className="text-gray-500 font-semibold">No messages yet</Text>
            <Text className="text-gray-400 text-center mt-2 px-6">Start a trade from the shop to begin chatting with other traders.</Text>
          </View>
        ) : (
          trades.map((trade: any) => (
            <TouchableOpacity
              key={trade._id}
              onPress={() => router.push(`/chat/${trade._id}`)}
              className="px-6 py-5 border-b border-gray-50 flex-row items-center"
            >
              <View className="w-16 h-16 rounded-2xl bg-gray-100 items-center justify-center overflow-hidden border border-gray-50">
                {trade.otherUser?.profile.avatar ? (
                  <Image source={{ uri: trade.otherUser.profile.avatar }} className="w-full h-full" />
                ) : (
                  <Ionicons name="person" size={30} color="#ABB3BB" />
                )}
              </View>
              <View className="ml-4 flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-lg font-bold text-gray-800">{trade.otherUser?.profile.name || "Unknown User"}</Text>
                  <Text className="text-xs text-gray-400">
                    {trade.status === 'pending' ? 'Offer' : trade.status}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm" numberOfLines={1}>
                  {trade.status === 'pending' ? 'Proposed a new trade' : 'Ongoing negotiation'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#F2F3F2" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
