import React from 'react';
import { ScrollView, TextInput, TouchableOpacity, Image, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  { id: '1', title: 'Pulses', color: '#F8E8EE', icon: 'leaf-outline' },
  { id: '2', title: 'Rice', color: '#E8F5E9', icon: 'nutrition-outline' },
  { id: '3', title: 'Cooking Oil', color: '#FFF3E0', icon: 'water-outline' },
  { id: '4', title: 'Meat', color: '#E3F2FD', icon: 'restaurant-outline' },
];

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function TabOneScreen() {
  const items = useQuery(api.items.getLatest, { limit: 10 });
  
  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="pt-14 pb-4 px-6 items-center">
        <Ionicons name="location" size={20} color="#FF4C29" />
        <Text className="text-lg font-bold">Harare, Zimbabwe</Text>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-6">
        <View className="flex-row items-center bg-[#F2F3F2] rounded-2xl px-4 py-3">
          <Ionicons name="search" size={20} color="#7C7C7C" />
          <TextInput 
            className="flex-1 ml-2 text-base"
            placeholder="Search Store"
            placeholderTextColor="#7C7C7C"
          />
        </View>
      </View>

      {/* Banner */}
      <View className="px-6 mb-8">
        <View className="bg-[#FF4C29]/10 rounded-3xl p-6 flex-row items-center justify-between border border-[#FF4C29]/20">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-[#FF4C29]">Referral & Earn</Text>
            <Text className="text-sm text-gray-500 mt-1">Get 20% OFF your next trade</Text>
          </View>
          <TouchableOpacity className="bg-[#FF4C29] px-4 py-2 rounded-xl">
            <Text className="text-white font-bold">Refer Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Exclusive Offer / Latest Items */}
      <View className="px-6 mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold">Latest Listings</Text>
          <TouchableOpacity><Text className="text-[#FF4C29] font-semibold">See all</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {items?.map((item) => (
            <View key={item._id} className="mr-4 p-4 border border-gray-100 rounded-3xl w-44">
              <View className="items-center mb-3">
                <Image 
                  source={{ uri: item.images[0]?.startsWith('http') ? item.images[0] : 'https://placehold.co/400x400/png?text=Item' }} 
                  className="w-24 h-24 rounded-2xl" 
                  resizeMode="cover" 
                />
              </View>
              <Text className="font-bold text-lg" numberOfLines={1}>{item.title}</Text>
              <Text className="text-gray-400 text-sm mb-3">{item.category}</Text>
              <View className="flex-row justify-between items-center">
                <Text className="font-bold text-lg">{item.estimatedValue || 0} TP</Text>
                <TouchableOpacity className="bg-[#FF4C29] w-10 h-10 rounded-xl items-center justify-center">
                  <Ionicons name="swap-horizontal" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {(!items || items.length === 0) && (
            <View className="py-10 items-center w-full">
              <Text className="text-gray-400">No items found. Complete onboarding to seed data!</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Categories */}
      <View className="px-6 mb-10">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold">Categories</Text>
          <TouchableOpacity><Text className="text-[#FF4C29] font-semibold">See all</Text></TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap justify-between">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={{ backgroundColor: cat.color }}
              className="w-[48%] p-6 rounded-3xl items-center mb-4 border border-black/5 shadow-sm"
            >
              <Ionicons name={cat.icon as any} size={40} color="black" />
              <Text className="font-bold mt-3 text-lg">{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
