import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View, Dimensions, Alert } from 'react-native';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const itemId = id as Id<"items">;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const user = useQuery(api.users.current);
  const item = useQuery(api.items.get, { id: itemId });
  const createTrade = useMutation(api.trades.create);
  
  const isFavorite = useQuery(api.favorites.isFavorite, { itemId });
  const toggleFavorite = useMutation(api.favorites.toggle);
  const owner = useQuery(api.users.get, { id: item?.ownerId });
  const similarItems = useQuery(api.items.getSimilar, { 
    itemId, 
    category: item?.category || '', 
    limit: 6 
  });

  const handleToggleFavorite = async () => {
    if (!user) {
      router.replace('/onboarding');
      return;
    }
    await toggleFavorite({ itemId });
  };
  
  const handleProposeTrade = async () => {
    if (!user) {
      router.replace('/onboarding');
      return;
    }
    if (!item) return;
    if (item.ownerId === user._id) {
      Alert.alert("Error", "You cannot trade with yourself.");
      return;
    }

    setLoading(true);
    try {
      const tradeId = await createTrade({
        initiatorId: user._id,
        receiverId: item.ownerId,
        initiatorItems: [],
        receiverItems: [item._id],
      });
      router.push(`/chat/${tradeId}`);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#FF4C29" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          className="h-[400px]"
        >
          {item.images.map((img: string, index: number) => (
            <View key={index} style={{ width, height: 400 }} className="bg-gray-100 items-center justify-center">
              <Image 
                source={{ uri: img }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
          ))}
          {item.images.length === 0 && (
            <View style={{ width, height: 400 }} className="bg-gray-100 items-center justify-center">
              <Ionicons name="image-outline" size={60} color="#ABB3BB" />
            </View>
          )}
        </ScrollView>

        {/* Header Actions */}
        <View className="absolute top-12 left-6 right-6 flex-row justify-between">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-12 h-12 bg-white/80 rounded-2xl items-center justify-center shadow-sm"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleToggleFavorite}
            className="w-12 h-12 bg-white/80 rounded-2xl items-center justify-center shadow-sm"
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#FF4C29" : "black"} 
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-6 pt-8 pb-32">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-3xl font-bold text-gray-900 mb-2">{item.title}</Text>
              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="#FF4C29" />
                <Text className="text-gray-500 ml-1">{item.location.city}</Text>
              </View>
            </View>
            <View className="bg-secondary px-4 py-2 rounded-2xl">
              <Text className="text-white font-black text-xl">{item.estimatedValue || 0} TP</Text>
            </View>
          </View>

          <View className="h-[1] bg-gray-100 my-6" />

          {/* Condition & Category */}
          <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-gray-50 p-4 rounded-3xl items-center">
              <Ionicons name="shield-checkmark" size={24} color="#7C7C7C" />
              <Text className="text-xs text-gray-400 font-bold uppercase mt-2">Condition</Text>
              <Text className="text-base font-bold text-gray-800">{item.condition}</Text>
            </View>
            <View className="flex-1 bg-gray-50 p-4 rounded-3xl items-center">
              <Ionicons name="apps" size={24} color="#7C7C7C" />
              <Text className="text-xs text-gray-400 font-bold uppercase mt-2">Category</Text>
              <Text className="text-base font-bold text-gray-800">{item.category}</Text>
            </View>
          </View>

          {/* Seller Section */}
          <View className="mb-8 p-6 bg-gray-50 rounded-[32px] border border-gray-100">
            <Text className="text-xs text-gray-400 font-bold uppercase mb-4 tracking-widest">About the Seller</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                  <Text className="text-primary font-bold text-lg">{owner?.name?.charAt(0) || 'U'}</Text>
                </View>
                <View className="ml-4">
                  <Text className="font-bold text-lg text-gray-900">{owner?.name || "User"}</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={14} color="#FFB000" />
                    <Text className="text-gray-500 text-sm ml-1 font-semibold">{owner?.profile?.rating || 5.0} • {owner?.profile?.tradesCompleted || 0} trades</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity className="bg-white px-4 py-2 rounded-xl border border-gray-100">
                <Text className="text-gray-900 font-bold">View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <Text className="text-xl font-bold mb-3">Description</Text>
          <Text className="text-gray-500 leading-6 mb-8">
            {item.description || "No description provided for this item."}
          </Text>

          {/* Wants */}
          <Text className="text-xl font-bold mb-3">Trading Preferences</Text>
          <View className="flex-row flex-wrap gap-2 mb-10">
            {item.wants.map((want: string, i: number) => (
              <View key={i} className="bg-[#FF4C29]/5 px-4 py-2 rounded-xl">
                <Text className="text-primary font-bold">#{want}</Text>
              </View>
            ))}
            {item.wants.length === 0 && (
              <Text className="text-gray-400 italic">No specific preferences mentioned.</Text>
            )}
          </View>

          {/* Similar Items */}
          {similarItems && similarItems.length > 0 && (
            <View>
              <Text className="text-xl font-bold mb-4">Similar Items</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {similarItems.map((similar) => (
                  <TouchableOpacity 
                    key={similar._id}
                    onPress={() => router.push(`/listing/${similar._id}`)}
                    className="mr-4 w-40 p-4 bg-white border border-gray-100 rounded-3xl"
                  >
                    <View className="w-full h-24 bg-gray-50 rounded-2xl overflow-hidden mb-3 p-2 items-center justify-center">
                      <Image 
                        source={{ uri: similar.images[0]?.startsWith('http') ? similar.images[0] : 'https://placehold.co/400x400' }} 
                        className="w-full h-full"
                        resizeMode="contain"
                      />
                    </View>
                    <Text className="font-bold text-sm text-gray-900" numberOfLines={1}>{similar.title}</Text>
                    <Text className="text-primary font-black text-sm mt-1">{similar.estimatedValue || 0} TP</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Propose Button */}
      <View className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-gray-50 flex-row gap-4">
        <TouchableOpacity 
          onPress={handleProposeTrade}
          className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100"
        >
           <Ionicons name="chatbubble-outline" size={24} color="#7C7C7C" />
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-1 bg-primary rounded-2xl h-16 flex-row items-center justify-center shadow-lg shadow-primary/30"
          onPress={handleProposeTrade}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="swap-horizontal" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Propose Trade</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
