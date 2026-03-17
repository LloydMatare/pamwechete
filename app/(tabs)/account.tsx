import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const seed = useMutation(api.items.seed);

  useEffect(() => {
    AsyncStorage.getItem('user_id').then((id) => {
      if (id) setUserId(id as Id<"users">);
    });
  }, []);

  const user = useQuery(api.users.get, { id: userId || undefined });
  const userItems = useQuery(api.items.getByUser, { userId: userId || undefined });

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <ActivityIndicator size="large" color="#FF4C29" />
        <Text className="mt-4 text-gray-500">Loading your profile...</Text>
        <TouchableOpacity 
          onPress={async () => {
            await AsyncStorage.removeItem('onboarding_completed');
            await AsyncStorage.removeItem('user_id');
            alert("Reset complete. Restart the app.");
          }}
          className="mt-10 border border-red-500 p-4 rounded-xl w-full items-center"
        >
          <Text className="text-red-500 font-bold">Reset All Data (Dev)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View className="pt-16 pb-8 px-6 bg-[#FF4C29]">
        <View className="flex-row items-center">
          <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center border-4 border-white/30 overflow-hidden">
            {user.profile.avatar ? (
              <Image source={{ uri: user.profile.avatar }} className="w-full h-full" />
            ) : (
              <Ionicons name="person" size={40} color="white" />
            )}
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-2xl font-bold text-white tracking-tight">{user.profile.name}</Text>
            <Text className="text-white/80 text-base">{user.profile.email || user.phoneNumber}</Text>
            <View className="flex-row items-center mt-1">
              <View className="bg-white/20 px-2 py-0.5 rounded-md mr-2">
                <Text className="text-white text-xs font-bold uppercase">{user.verificationLevel}</Text>
              </View>
              <Text className="text-white/80 text-xs">Member since {new Date(user.profile.memberSince).getFullYear()}</Text>
            </View>
          </View>
          <TouchableOpacity className="p-2 bg-white/20 rounded-xl">
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row justify-between mt-8 bg-white/10 rounded-3xl p-6">
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-xl">{user.profile.tradesCompleted}</Text>
            <Text className="text-white/60 text-xs font-semibold uppercase mt-1">Trades</Text>
          </View>
          <View className="w-[1] bg-white/20 h-full" />
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-xl">{user.profile.rating}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="star" size={12} color="white" />
              <Text className="text-white/60 text-xs font-semibold uppercase ml-0.5">Rating</Text>
            </View>
          </View>
          <View className="w-[1] bg-white/20 h-full" />
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-xl">{userItems?.length || 0}</Text>
            <Text className="text-white/60 text-xs font-semibold uppercase mt-1">Listings</Text>
          </View>
        </View>
      </View>

      <View className="px-6 -mt-6">
        <View className="bg-white rounded-t-[40px] pt-10 min-h-[500px]">
          {/* Actions */}
          <View className="flex-row justify-between mb-8">
            <Text className="text-2xl font-bold">My Trading Items</Text>
            <TouchableOpacity 
              onPress={() => router.push('/create-listing')}
              className="flex-row items-center bg-primary/10 px-4 py-2 rounded-xl"
            >
              <Ionicons name="add" size={18} color="#FF4C29" className="mr-1" />
              <Text className="text-primary font-bold">New</Text>
            </TouchableOpacity>
          </View>

          {/* Current Listings */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-6 px-6">
            {userItems?.map((item) => (
              <TouchableOpacity 
                key={item._id} 
                onPress={() => router.push(`/listing/${item._id}`)}
                className="mr-4 p-4 border border-gray-100 rounded-3xl w-48 bg-white shadow-sm"
              >
                <Image 
                   source={{ uri: item.images[0]?.startsWith('http') ? item.images[0] : (item.images[0] ? `https://placehold.co/400x400` : 'https://placehold.co/400x400') }} 
                   className="w-full h-32 rounded-2xl mb-3" 
                   resizeMode="cover" 
                />
                <Text className="font-bold text-lg" numberOfLines={1}>{item.title}</Text>
                <Text className="text-gray-400 text-sm mb-2">{item.category}</Text>
                <View className="bg-primary/5 p-2 rounded-xl">
                  <Text className="text-primary font-bold text-center">{item.estimatedValue || 0} TP</Text>
                </View>
              </TouchableOpacity>
            ))}
            {userItems?.length === 0 && (
              <TouchableOpacity 
                onPress={() => router.push('/create-listing')}
                className="w-48 h-48 border-2 border-dashed border-gray-100 rounded-3xl items-center justify-center"
              >
                <Ionicons name="add-circle-outline" size={32} color="#ABB3BB" />
                <Text className="text-gray-400 font-bold mt-2">Add Listing</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Account Links */}
          <View className="mt-12 mb-10">
            <Text className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-widest">Account Details</Text>
            
            {[
              { icon: 'wallet-outline', label: 'Trade Balance', value: '450 TP' },
              { icon: 'shield-checkmark-outline', label: 'Verification Status', value: user.verificationLevel },
              { icon: 'location-outline', label: 'Delivery Address', value: user.location.city }
            ].map((link, i) => (
              <TouchableOpacity key={i} className="flex-row items-center justify-between py-5 border-b border-gray-50">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4">
                    <Ionicons name={link.icon as any} size={20} color="#7C7C7C" />
                  </View>
                  <Text className="text-lg font-semibold text-gray-700">{link.label}</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-400 mr-2">{link.value}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#ABB3BB" />
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              onPress={() => seed({})}
              className="mt-10 bg-black p-5 rounded-2xl items-center flex-row justify-center"
            >
              <Ionicons name="beaker-outline" size={20} color="white" className="mr-2" />
              <Text className="text-white font-bold text-lg">Seed Sample Trade Data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={async () => {
                await AsyncStorage.removeItem('onboarding_completed');
                await AsyncStorage.removeItem('user_id');
                alert("Reset complete. Please restart.");
              }}
              className="mt-4 border border-red-500 p-5 rounded-2xl items-center"
            >
              <Text className="text-red-500 font-bold text-lg">Logout & Reset (Dev)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
