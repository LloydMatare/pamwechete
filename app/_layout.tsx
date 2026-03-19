import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';
import GeoLockWrapper from '@/components/GeoLockWrapper';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Using system fonts for a neutral look
  });

  const segments = useSegments();
  const router = useRouter();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (segments.length > 0) {
      SplashScreen.hideAsync();
      checkOnboarding();
    }
  }, [segments]);

  const checkOnboarding = async () => {
    const completed = await AsyncStorage.getItem('onboarding_completed');
    // segment[0] can be '(tabs)' or 'onboarding'
    const isInsideTabs = segments[0] === '(tabs)';
    
    if (completed !== 'true' && isInsideTabs) {
      router.replace('/onboarding');
    }
  };

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexClientProvider>
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
      </ConvexClientProvider>
    </GestureHandlerRootView>
  );
}
