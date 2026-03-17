import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const tradeId = id as Id<"trades">;
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [message, setMessage] = useState('');

  const trade = useQuery(api.trades.get, { id: tradeId });
  const messages = useQuery(api.messages.getByTrade, { tradeId });
  const sendMessage = useMutation(api.messages.send);
  const updateStatus = useMutation(api.trades.updateStatus);

  useEffect(() => {
    AsyncStorage.getItem('user_id').then((id) => {
      if (id) setUserId(id as Id<"users">);
    });
  }, []);

  const handleSend = async () => {
    if (!message.trim() || !userId) return;
    await sendMessage({
      tradeId,
      senderId: userId,
      content: message,
    });
    setMessage('');
  };

  if (!trade || !messages || !userId) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#FF4C29" />
      </View>
    );
  }

  const otherUser = trade.initiatorId === userId ? trade.receiver : trade.initiator;
  const isInitiator = trade.initiatorId === userId;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="pt-14 pb-4 px-6 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden mr-3">
          {otherUser?.profile.avatar ? (
             <Image source={{ uri: otherUser.profile.avatar }} className="w-full h-full" />
          ) : (
            <View className="items-center justify-center flex-1"><Ionicons name="person" size={20} color="#7C7C7C" /></View>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold">{otherUser?.profile.name}</Text>
          <Text className="text-xs text-secondary font-bold uppercase">{trade.status}</Text>
        </View>
        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-vertical" size={20} color="#7C7C7C" />
        </TouchableOpacity>
      </View>

      {/* Trade Summary Bar */}
      <View className="bg-gray-50 px-6 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
            <Ionicons name="swap-horizontal" size={16} color="#FF4C29" />
            <Text className="ml-2 text-xs font-semibold text-gray-500 uppercase">Trade Negotiation</Text>
        </View>
        <View className="flex-row gap-2">
            {trade.status === 'pending' && !isInitiator && (
                <>
                    <TouchableOpacity 
                        onPress={() => updateStatus({ id: tradeId, status: 'accepted' })}
                        className="bg-secondary px-3 py-1 rounded-lg"
                    >
                        <Text className="text-white font-bold text-xs">Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                         onPress={() => updateStatus({ id: tradeId, status: 'cancelled' })}
                         className="bg-gray-200 px-3 py-1 rounded-lg"
                    >
                        <Text className="text-gray-600 font-bold text-xs">Reject</Text>
                    </TouchableOpacity>
                </>
            )}
            {trade.status === 'accepted' && (
                <TouchableOpacity 
                    onPress={() => updateStatus({ id: tradeId, status: 'completed' })}
                    className="bg-primary px-3 py-1 rounded-lg"
                >
                    <Text className="text-white font-bold text-xs">Complete Trade</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-6 pt-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Preview */}
        <View className="bg-white border border-gray-100 rounded-3xl p-4 mb-8 flex-row items-center shadow-sm">
           <Image source={{ uri: (isInitiator ? trade.receiverItems[0]?.images[0] : trade.initiatorItems[0]?.images[0]) || 'https://placehold.co/100x100' }} className="w-16 h-16 rounded-xl" />
           <View className="ml-4 flex-1">
              <Text className="text-xs text-gray-400 font-bold uppercase">Trading for</Text>
              <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
                {isInitiator ? trade.receiverItems[0]?.title : trade.initiatorItems[0]?.title}
              </Text>
           </View>
           <View className="bg-secondary/10 px-3 py-1 rounded-lg">
                <Text className="text-secondary font-bold text-xs">
                    {isInitiator ? trade.receiverItems[0]?.estimatedValue : trade.initiatorItems[0]?.estimatedValue} TP
                </Text>
           </View>
        </View>

        {messages.map((msg: any) => (
          <View 
            key={msg._id} 
            className={`mb-4 flex-row ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <View 
              className={`max-w-[80%] px-5 py-3 rounded-2xl ${
                msg.senderId === userId 
                  ? 'bg-primary rounded-tr-none' 
                  : 'bg-gray-100 rounded-tl-none'
              }`}
            >
              <Text className={`text-base ${msg.senderId === userId ? 'text-white' : 'text-gray-800'}`}>
                {msg.content}
              </Text>
              <Text className={`text-[10px] mt-1 ${msg.senderId === userId ? 'text-white/60' : 'text-gray-400'}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}
        <View className="h-10" />
      </ScrollView>

      {/* Input */}
      <View className="p-6 pt-2 border-t border-gray-50 flex-row gap-3 items-center">
        <TouchableOpacity className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center">
            <Ionicons name="add" size={24} color="#7C7C7C" />
        </TouchableOpacity>
        <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-3">
          <TextInput
            placeholder="Write a message"
            className="text-base"
            value={message}
            onChangeText={setMessage}
            multiline
          />
        </View>
        <TouchableOpacity 
            onPress={handleSend}
            disabled={!message.trim()}
            className={`w-12 h-12 rounded-2xl items-center justify-center ${message.trim() ? 'bg-primary' : 'bg-gray-200'}`}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
