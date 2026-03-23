import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../../convex/_generated/api';

export default function SavedScreen() {
  const router = useRouter();
  const savedItems = useQuery(api.favorites.list);

  if (savedItems === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#FF4C29" size="large" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/listing/${item._id}`)}
      className="flex-row p-4 mb-4 bg-white rounded-3xl border border-gray-100 shadow-sm items-center"
    >
      <View className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden p-2 items-center justify-center">
        <Image 
          source={{ uri: item.images[0]?.startsWith('http') ? item.images[0] : 'https://placehold.co/400x400' }} 
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>{item.title}</Text>
        <Text className="text-gray-400 text-sm mb-2">{item.category} • {item.condition}</Text>
        <Text className="text-primary font-black text-lg">{item.estimatedValue || 0} TP</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ABB3BB" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="pt-16 pb-4 px-6 border-b border-gray-50 flex-row justify-between items-center">
        <Text className="text-3xl font-black text-black tracking-tight">Saved Items</Text>
        <View className="bg-primary/10 px-3 py-1 rounded-full">
          <Text className="text-primary font-bold">{savedItems.length}</Text>
        </View>
      </View>

      {savedItems.length === 0 ? (
        <View className="flex-1 items-center justify-center p-10">
          <View className="w-24 h-24 bg-gray-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="heart-outline" size={40} color="#ABB3BB" />
          </View>
          <Text className="text-xl font-bold text-gray-800">No saved items yet</Text>
          <Text className="text-gray-400 text-center mt-2">
            Tap the heart icon on any listing to save it for later.
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/')}
            className="mt-8 bg-primary px-8 py-4 rounded-2xl"
          >
            <Text className="text-white font-bold">Explore Listings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedItems}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
