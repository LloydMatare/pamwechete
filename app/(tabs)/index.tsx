import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import React, { useState, useEffect } from 'react';
import { Image, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';

const CATEGORIES = [
  { id: '1', title: 'Agriculture', color: '#F8E8EE', icon: 'leaf-outline' },
  { id: '2', title: 'Electronics', color: '#E8F5E9', icon: 'phone-portrait-outline' },
  { id: '3', title: 'Clothing', color: '#FFF3E0', icon: 'shirt-outline' },
  { id: '4', title: 'Livestock', color: '#E3F2FD', icon: 'paw-outline' },
];

export default function TabOneScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();
  const user = useQuery(api.users.current);

  const items = useQuery(api.items.getItems, {
    limit: 10,
    searchQuery: searchQuery || undefined,
    category: selectedCategory || undefined
  });

  const createTrade = useMutation(api.trades.create);
  
  const handleAddToCart = async (item: any) => {
    try {
      const cartData = await AsyncStorage.getItem('trade_cart');
      const cart = cartData ? JSON.parse(cartData) : [];
      if (!cart.includes(item._id)) {
        cart.push(item._id);
        await AsyncStorage.setItem('trade_cart', JSON.stringify(cart));
        alert('Added to Trade Cart! 🛒');
      } else {
        alert('Already in Cart');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleProposeTrade = async (targetItem: any) => {
    if (!user) {
       router.replace('/onboarding');
       return;
    }
    if (targetItem.ownerId === user._id) return;

    try {
        const tradeId = await createTrade({
            initiatorId: user._id,
            receiverId: targetItem.ownerId,
            initiatorItems: [], 
            receiverItems: [targetItem._id],
        });
        router.push(`/chat/${tradeId}`);
    } catch (e: any) {
        alert(e.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="pt-14 pb-4 px-6 flex-row items-center justify-between">
        <Image 
          source={require('../../assets/images/icon.png')} 
          className="w-10 h-10 rounded-xl"
          resizeMode="contain"
        />
        <View className="flex-row items-center">
          <Ionicons name="location" size={20} color="#FF4C29" />
          <Text className="text-lg font-bold ml-1">Harare, Zimbabwe</Text>
        </View>
        <View className="w-10" /> 
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-6">
        <View className="flex-row items-center bg-[#F2F3F2] rounded-2xl px-4 py-3">
          <Ionicons name="search" size={20} color="#7C7C7C" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search Store"
            placeholderTextColor="#7C7C7C"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#7C7C7C" />
            </TouchableOpacity>
          ) : null}
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
          <Text className="text-2xl font-bold">
            {selectedCategory ? `${selectedCategory} Listings` : 'Latest Listings'}
          </Text>
          <TouchableOpacity onPress={() => {
            setSelectedCategory(null);
            setSearchQuery('');
          }}>
            <Text className="text-[#FF4C29] font-semibold">View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {items?.map((item) => (
            <TouchableOpacity 
              key={item._id} 
              onPress={() => router.push(`/listing/${item._id}`)}
              className="mr-4 p-4 border border-gray-100 rounded-3xl w-44"
            >
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
                <View className="flex-row gap-2">
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                    className="bg-gray-100 w-9 h-9 rounded-xl items-center justify-center border border-gray-100"
                  >
                    <Ionicons name="cart-outline" size={18} color="#7C7C7C" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleProposeTrade(item);
                    }}
                    className="bg-[#FF4C29] w-9 h-9 rounded-xl items-center justify-center"
                  >
                    <Ionicons name="swap-horizontal" size={18} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {items && items.length === 0 && (
            <View className="py-10 items-center justify-center w-full">
              <Text className="text-gray-400">No items match your search.</Text>
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
              onPress={() => setSelectedCategory(selectedCategory === cat.title ? null : cat.title)}
              style={{
                backgroundColor: cat.color,
                borderWidth: selectedCategory === cat.title ? 2 : 1,
                borderColor: selectedCategory === cat.title ? '#FF4C29' : 'rgba(0,0,0,0.05)'
              }}
              className="w-[48%] p-6 rounded-3xl items-center mb-4 shadow-sm"
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
