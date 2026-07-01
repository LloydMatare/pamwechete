import { useEffect, useRef } from 'react';
import { Animated, Image, View } from 'react-native';

export default function AnimatedSplashScreen({ onFinish }: { onFinish: () => void }) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const subtitleSlide = useRef(new Animated.Value(20)).current;
  const taglineSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(800),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
          width: 110,
          height: 110,
          borderRadius: 28,
          backgroundColor: '#FF4C29',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#FF4C29',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 20,
          elevation: 12,
        }}
      >
        <Image
          source={require('../assets/images/icon.png')}
          style={{ width: 60, height: 60, tintColor: 'white' }}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text
        style={{
          fontSize: 36,
          fontWeight: '800',
          color: '#1A1A1A',
          marginTop: 28,
          letterSpacing: -0.5,
          opacity: titleOpacity,
          transform: [{ translateY: subtitleSlide }],
        }}
      >
        Pamwechete
      </Animated.Text>

      <Animated.Text
        style={{
          fontSize: 16,
          color: '#8E8E93',
          marginTop: 8,
          letterSpacing: 0.3,
          opacity: taglineOpacity,
          transform: [{ translateY: taglineSlide }],
        }}
      >
        Trade anything, anytime.
      </Animated.Text>
    </View>
  );
}
