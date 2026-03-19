import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthActions } from "@convex-dev/auth/react";
import CustomModal from '@/components/CustomModal';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'info'>('info');

  const router = useRouter();
  const { signIn } = useAuthActions();

  const handleLogin = async () => {
    if (!email || !password) {
      setModalTitle('Missing Info');
      setModalMessage('Please enter both email and password.');
      setModalType('error');
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
        await signIn("password", { email, password, flow: "signIn" });
        router.replace('/(tabs)');
    } catch (error: any) {
        console.error(error);
        setModalTitle('Login Failed');
        setModalMessage('Invalid email or password. Please try again.');
        setModalType('error');
        setModalVisible(true);
    } finally {
        setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 p-6 justify-center">
        <Image 
          source={require('../../assets/images/icon.png')} 
          className="w-20 h-20 mb-6 rounded-2xl"
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold mb-2">Pamwechete</Text>
        <Text className="text-gray-500 mb-8">Peer-to-peer barter trading in Zimbabwe</Text>

        <Text className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-widest">Email Address</Text>
        <TextInput
          className="border border-gray-200 rounded-2xl p-4 mb-6 bg-gray-50 text-black"
          value={email}
          onChangeText={setEmail}
          placeholder="e.g. john@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-widest">Password</Text>
        <TextInput
          className="border border-gray-200 rounded-2xl p-4 mb-8 bg-gray-50 text-black"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <TouchableOpacity 
          onPress={handleLogin}
          disabled={loading}
          className={`bg-primary p-5 rounded-2xl items-center shadow-lg shadow-primary/30 ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? (
              <ActivityIndicator color="white" />
          ) : (
              <Text className="text-white font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/onboarding')}
          className="mt-6 py-2 items-center"
        >
          <Text className="text-gray-500 text-base">
            Don't have an account? <Text className="text-primary font-bold">Register</Text>
          </Text>
        </TouchableOpacity>

        <Text className="mt-12 text-center text-gray-400 text-xs">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
      <CustomModal 
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
