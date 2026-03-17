import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  SharedValue, 
  useAnimatedStyle, 
  interpolate,
  Extrapolation 
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.7;

interface ExploreCardProps {
  item: any;
  index: number;
  translateX: SharedValue<number>;
  totalCards: number;
}

export default function ExploreCard({ item, index, translateX, totalCards }: ExploreCardProps) {
  // Only the top 3 cards should be visible/animated for performance
  const cardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateX.value,
      [0, width],
      [1 - index * 0.05, 1 - (index - 1) * 0.05],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      translateX.value,
      [0, width],
      [index * -15, (index - 1) * -15],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      translateX.value,
      [-width, 0, width],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    // If it's the top card, follow the horizontal swipe
    const horizontalTranslate = index === 0 ? translateX.value : 0;
    const rotation = index === 0 ? `${interpolate(translateX.value, [-width, width], [-10, 10], Extrapolation.CLAMP)}deg` : '0deg';

    return {
      transform: [
        { translateX: horizontalTranslate },
        { translateY: translateY },
        { scale: scale },
        { rotate: rotation }
      ],
      opacity: opacity,
      zIndex: totalCards - index,
    };
  });

  const likeOpacity = useAnimatedStyle(() => {
    return {
      opacity: index === 0 ? interpolate(translateX.value, [0, width / 4], [0, 1], Extrapolation.CLAMP) : 0,
    };
  });

  const nopeOpacity = useAnimatedStyle(() => {
    return {
      opacity: index === 0 ? interpolate(translateX.value, [-width / 4, 0], [1, 0], Extrapolation.CLAMP) : 0,
    };
  });

  return (
    <Animated.View style={[styles.card, cardStyle]} className="shadow-2xl">
      <View className="flex-1 rounded-[40px] overflow-hidden bg-white border border-gray-100">
        <Image 
          source={{ uri: item.images[0]?.startsWith('http') ? item.images[0] : 'https://placehold.co/600x800' }} 
          className="flex-1"
          resizeMode="cover"
        />
        
        {/* Overlays */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, likeOpacity]}>
          <Text style={styles.overlayText} className="text-secondary border-secondary">LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeOpacity]}>
          <Text style={styles.overlayText} className="text-primary border-primary">NOPE</Text>
        </Animated.View>

        {/* Info Gradient/Container */}
        <View className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/80 to-transparent">
          <View className="flex-row justify-between items-end">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white mb-2">{item.title}</Text>
              <View className="flex-row items-center">
                <View className="bg-white/20 px-3 py-1 rounded-full mr-2">
                  <Text className="text-white text-xs font-bold">{item.category}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="location" size={14} color="white" />
                  <Text className="text-white text-xs ml-1">{item.location?.city || "Zimbabwe"}</Text>
                </View>
              </View>
            </View>
            <View className="bg-primary px-4 py-2 rounded-2xl">
              <Text className="text-white font-black text-xl">{item.estimatedValue || 0} TP</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
    top: height * 0.1,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    borderWidth: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  likeOverlay: {
    left: 40,
    transform: [{ rotate: '-20deg' }],
  },
  nopeOverlay: {
    right: 40,
    transform: [{ rotate: '20deg' }],
  },
  overlayText: {
    fontSize: 42,
    fontWeight: '900',
  }
});
