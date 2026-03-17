import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { TouchableOpacity } from 'react-native';
import { View, Text } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AccountScreen() {
  const seed = useMutation(api.items.seed);

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-2xl font-bold mb-8">Account</Text>
      
      <TouchableOpacity 
        onPress={async () => {
          try {
            await seed();
            alert("Database seeded successfully!");
          } catch (e: any) {
            alert(e.message);
          }
        }}
        className="bg-primary p-4 rounded-xl w-full items-center"
      >
        <Text className="text-white font-bold">Seed Sample Trade Data</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={async () => {
          await AsyncStorage.removeItem('onboarding_completed');
          alert("Onboarding flag reset! Restart the app to see the onboarding screen.");
        }}
        className="mt-4 border border-red-500 p-4 rounded-xl w-full items-center"
      >
        <Text className="text-red-500 font-bold">Reset Onboarding Flag</Text>
      </TouchableOpacity>
    </View>
  );
}
