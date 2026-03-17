import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import ExploreCard from '@/components/ExploreCard';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

export default function ExploreScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('user_id').then((id) => {
      if (id) setUserId(id as Id<"users">);
    });
  }, []);

  const items = useQuery(api.items.getItems, { limit: 50 });
  const createTrade = useMutation(api.trades.create);
  
  const translateX = useSharedValue(0);

  const filteredItems = items?.filter(item => item.ownerId !== userId) || [];
  const currentItems = filteredItems.slice(currentIndex, currentIndex + 5);

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    const item = currentItems[0];
    if (direction === 'right' && item && userId) {
      proposeTrade(item);
    }
    
    translateX.value = 0;
    setCurrentIndex(prev => prev + 1);
  };

  const proposeTrade = async (targetItem: any) => {
    try {
      const tradeId = await createTrade({
        initiatorId: userId!,
        receiverId: targetItem.ownerId,
        initiatorItems: [],
        receiverItems: [targetItem._id],
      });
      router.push(`/chat/${tradeId}`);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        // Swipe success
        const direction = event.translationX > 0 ? 'right' : 'left';
        translateX.value = withSpring(direction === 'right' ? width * 1.5 : -width * 1.5, {}, () => {
          runOnJS(handleSwipeComplete)(direction);
        });
      } else {
        // Snap back
        translateX.value = withSpring(0);
      }
    });

  if (!items) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#FF4C29" size="large" />
      </View>
    );
  }

  if (currentIndex >= filteredItems.length) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-10">
        <View className="w-24 h-24 bg-gray-50 rounded-full items-center justify-center mb-6">
          <Ionicons name="refresh" size={40} color="#FF4C29" />
        </View>
        <Text className="text-2xl font-bold text-gray-800 text-center">No more items!</Text>
        <Text className="text-gray-400 text-center mt-2 mb-8">Check back later for new items being traded in your area.</Text>
        <TouchableOpacity 
          onPress={() => setCurrentIndex(0)}
          className="bg-primary px-8 py-4 rounded-2xl shadow-lg"
        >
          <Text className="text-white font-bold text-lg">Start Over</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-16 pb-4 px-8">
        <Text className="text-4xl font-black text-black">Trade</Text>
        <Text className="text-gray-400 font-medium">Find your next perfect deal</Text>
      </View>

      <GestureDetector gesture={gesture}>
        <View style={styles.container}>
          {currentItems.reverse().map((item, index) => {
            // Because we reversed it for rendering order, the actual index of the top card is currentItems.length - 1
            // But for animation logic, we want the top card to be index 0
            const animIndex = currentItems.length - 1 - index;
            return (
              <ExploreCard 
                key={item._id} 
                item={item} 
                index={animIndex} 
                translateX={translateX}
                totalCards={currentItems.length}
              />
            );
          })}
        </View>
      </GestureDetector>

      {/* Action Buttons */}
      <View className="flex-row justify-center gap-6 absolute bottom-12 left-0 right-0">
        <TouchableOpacity 
           onPress={() => {
             translateX.value = withSpring(-width * 1.5, {}, () => runOnJS(handleSwipeComplete)('left'));
           }}
           className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg border border-gray-100"
        >
          <Ionicons name="close" size={30} color="#FF4C29" />
        </TouchableOpacity>
        
        <TouchableOpacity 
           onPress={() => {
             translateX.value = withSpring(width * 1.5, {}, () => runOnJS(handleSwipeComplete)('right'));
           }}
           className="w-20 h-20 bg-secondary rounded-full items-center justify-center shadow-xl -mt-2"
        >
          <Ionicons name="swap-horizontal" size={36} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
           className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg border border-gray-100"
        >
          <Ionicons name="star" size={26} color="#4CD964" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  }
});
