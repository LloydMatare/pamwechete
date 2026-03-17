import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuthActions } from "@convex-dev/auth/react";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('+263');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthActions();

  const handleLogin = async () => {
    // Basic Zimbabwe phone validation
    const zimPhoneRegex = /^\+2637\d{8}$/;
    if (!zimPhoneRegex.test(phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid Zimbabwean phone number (e.g., +263771234567)');
      return;
    }

    setLoading(false);
    // In a real scenario, this would trigger the phone OTP flow
    // For now, we'll simulate or use the provider
    try {
        setLoading(true);
        // await signIn("phone", { phone: phoneNumber });
        Alert.alert('Login', 'Phone secondary auth is being configured. Please verify terminal logs.');
    } catch (error) {
        Alert.alert('Error', 'Failed to sign in');
    } finally {
        setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-3xl font-bold mb-2">Pamwechete</Text>
      <Text className="text-gray-500 mb-8">Peer-to-peer barter trading in Zimbabwe</Text>

      <Text className="text-sm font-semibold text-gray-700 mb-2">Phone Number</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-4 mb-6"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="+2637..."
        keyboardType="phone-pad"
      />

      <TouchableOpacity 
        onPress={handleLogin}
        disabled={loading}
        className={`bg-black p-4 rounded-lg items-center ${loading ? 'opacity-50' : ''}`}
      >
        <Text className="text-white font-bold text-lg">
          {loading ? 'Processing...' : 'Verify Number'}
        </Text>
      </TouchableOpacity>
      
      <Text className="mt-6 text-center text-gray-400 text-xs">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </View>
  );
}
