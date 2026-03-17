import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { isUserInZimbabwe } from '../utils/geo';
import { Stack } from 'expo-router';

export default function GeoLockWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkLocation = async () => {
    setLoading(true);
    setError(null);
    const result = await isUserInZimbabwe();
    if (result.success) {
      setVerified(true);
    } else {
      setError(result.reason || 'Verification failed');
    }
    setLoading(false);
  };

  useEffect(() => {
    checkLocation();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4 text-gray-600">Verifying location...</Text>
      </View>
    );
  }

  if (!verified) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-2xl font-bold text-red-600 mb-4 text-center">
          Access Restricted
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          {error || 'This application is only available within Zimbabwe.'}
        </Text>
        <TouchableOpacity 
          onPress={checkLocation}
          className="bg-black px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Retry Verification</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}
