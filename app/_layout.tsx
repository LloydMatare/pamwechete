import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import 'react-native-reanimated';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';
import GeoLockWrapper from '@/components/GeoLockWrapper';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

import { useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';

export default function RootLayout() {
  const [loaded, error] = useFonts({});
  const [showSplash, setShowSplash] = useState(true);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (segments.length > 0) {
      SplashScreen.hideAsync();
      checkOnboarding();
    }
  }, [segments]);

  const checkOnboarding = useCallback(async () => {
    const completed = await AsyncStorage.getItem('onboarding_completed');
    if (completed === 'true') {
      setShowSplash(false);
    }
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
    router.replace('/onboarding');
  }, [router]);

  if (!loaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <RootLayoutNav />
      {showSplash && <AnimatedSplashScreen onFinish={handleSplashFinish} />}
    </View>
  );
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexClientProvider>
        <KeyboardProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <GeoLockWrapper>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                <Stack.Screen name="create-listing" options={{ headerShown: false }} />
                <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="edit-listing/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                <Stack.Screen name="chat/[id]" options={{ presentation: 'modal', headerShown: false }} />
              </Stack>
            </GeoLockWrapper>
          </ThemeProvider>
        </KeyboardProvider>
      </ConvexClientProvider>
    </GestureHandlerRootView>
  );
}
