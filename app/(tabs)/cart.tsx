import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);
  const [selectedOfferItems, setSelectedOfferItems] = useState<Id<"items">[]>([]);

  // Load user and cart on mount
  useEffect(() => {
    const init = async () => {
      const id = await AsyncStorage.getItem('user_id');
      if (id) setUserId(id as Id<"users">);
      
      const cartData = await AsyncStorage.getItem('trade_cart');
      if (cartData) setCartItemIds(JSON.parse(cartData));
    };
    init();
  }, []);

  // Fetch all items from cart (Note: This is a bit inefficient to fetch all, but works for MVP)
  const allItems = useQuery(api.items.getItems, { limit: 100 });
  const myItems = useQuery(api.items.getByUser, { userId: userId || undefined });
  const createTrade = useMutation(api.trades.create);

  const cartItems = useMemo(() => {
    if (!allItems) return [];
    return allItems.filter(item => cartItemIds.includes(item._id));
  }, [allItems, cartItemIds]);

  // Group items by owner
  const groups = useMemo(() => {
    const g: Record<string, { owner: any, items: any[] }> = {};
    cartItems.forEach(item => {
      // We don't have owner info in getItems, so we'll just group by ownerId for now
      // This is a limitation of the current getItems query
      const oid = item.ownerId;
      if (!g[oid]) g[oid] = { owner: { id: oid }, items: [] };
      g[oid].items.push(item);
    });
    return Object.values(g);
  }, [cartItems]);

  const removeFromCart = async (itemId: string) => {
    const newCart = cartItemIds.filter(id => id !== itemId);
    setCartItemIds(newCart);
    await AsyncStorage.setItem('trade_cart', JSON.stringify(newCart));
  };

  const handleCreateTrade = async (receiverId: Id<"users">, receiverItems: Id<"items">[]) => {
    if (!userId) return;
    
    try {
      const tradeId = await createTrade({
        initiatorId: userId,
        receiverId,
        initiatorItems: selectedOfferItems,
        receiverItems,
      });

      // Clear these items from cart
      const newCart = cartItemIds.filter(id => !receiverItems.includes(id as any));
      setCartItemIds(newCart);
      await AsyncStorage.setItem('trade_cart', JSON.stringify(newCart));
      
      router.push(`/chat/${tradeId}`);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const toggleOfferItem = (itemId: Id<"items">) => {
    setSelectedOfferItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  if (!allItems) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#FF4C29" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="pt-16 pb-4 px-6 border-b border-gray-50 flex-row justify-between items-center">
        <Text className="text-3xl font-black text-black tracking-tight">Trade Cart</Text>
        <TouchableOpacity onPress={async () => {
          setCartItemIds([]);
          await AsyncStorage.removeItem('trade_cart');
        }}>
          <Text className="text-primary font-bold">Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {groups.length === 0 ? (
          <View className="p-20 items-center justify-center">
            <View className="w-24 h-24 bg-gray-50 rounded-full items-center justify-center mb-6">
              <Ionicons name="cart-outline" size={40} color="#ABB3BB" />
            </View>
            <Text className="text-xl font-bold text-gray-800">Your cart is empty</Text>
            <Text className="text-gray-400 text-center mt-2 px-6">Add items from the shop to start building a trade proposal.</Text>
            <TouchableOpacity 
              onPress={() => router.push('/')}
              className="mt-8 bg-primary px-8 py-4 rounded-2xl"
            >
              <Text className="text-white font-bold">Go Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* My Items Selection */}
            <View className="p-6 bg-gray-50/50">
               <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">What you're offering</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                  {myItems?.map(item => (
                    <TouchableOpacity 
                      key={item._id}
                      onPress={() => toggleOfferItem(item._id)}
                      className={`mr-3 p-2 rounded-2xl border-2 ${selectedOfferItems.includes(item._id) ? 'border-primary bg-primary/5' : 'border-transparent bg-white shadow-sm'}`}
                    >
                      <Image source={{ uri: item.images[0] || 'https://placehold.co/100x100' }} className="w-16 h-16 rounded-xl mb-2" />
                      <Text className="text-[10px] font-bold text-center w-16" numberOfLines={1}>{item.title}</Text>
                      {selectedOfferItems.includes(item._id) && (
                        <View className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                           <Ionicons name="checkmark" size={10} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                  {(!myItems || myItems.length === 0) && (
                    <TouchableOpacity 
                      onPress={() => router.push('/(tabs)/account')}
                      className="border-2 border-dashed border-gray-200 rounded-2xl p-4 items-center justify-center w-20 h-20"
                    >
                      <Ionicons name="add" size={24} color="#ABB3BB" />
                    </TouchableOpacity>
                  )}
               </ScrollView>
            </View>

            {/* Cart Groups */}
            <View className="p-6">
              {groups.map((group, idx) => {
                const totalValue = group.items.reduce((acc, item) => acc + (item.estimatedValue || 0), 0);
                return (
                  <View key={idx} className="mb-10 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <View className="flex-row justify-between items-center mb-6">
                      <View>
                        <Text className="text-xs text-gray-400 font-bold uppercase">Trading with</Text>
                        <Text className="text-lg font-bold text-gray-800">@{group.owner.id.substring(0, 8)}...</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs text-gray-400 font-bold uppercase">Total Value</Text>
                        <Text className="text-xl font-black text-secondary">{totalValue} TP</Text>
                      </View>
                    </View>

                    {group.items.map(item => (
                      <View key={item._id} className="flex-row items-center mb-4 bg-gray-50/50 p-3 rounded-2xl">
                        <Image source={{ uri: item.images[0] || 'https://placehold.co/100x100' }} className="w-14 h-14 rounded-xl" />
                        <View className="ml-4 flex-1">
                          <Text className="font-bold text-gray-800" numberOfLines={1}>{item.title}</Text>
                          <Text className="text-secondary font-bold text-xs">{item.estimatedValue || 0} TP</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeFromCart(item._id)} className="p-2">
                          <Ionicons name="trash-outline" size={20} color="#FF4C29" />
                        </TouchableOpacity>
                      </View>
                    ))}

                    <TouchableOpacity 
                      onPress={() => handleCreateTrade(group.owner.id, group.items.map(i => i._id))}
                      className="mt-4 bg-primary rounded-2xl py-4 flex-row items-center justify-center shadow-lg shadow-primary/30"
                    >
                      <Ionicons name="swap-horizontal" size={20} color="white" className="mr-2" />
                      <Text className="text-white font-bold ml-2">Propose Trade</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
