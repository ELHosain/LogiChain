import React, { useRef } from 'react';
import { Animated, Pressable, ViewStyle, PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  haptic?: boolean;
  scaleTo?: number;
}

export default function AnimatedPressable({ children, style, haptic = true, scaleTo = 0.96, onPress, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={(e) => { if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{}); onPress?.(e); }}
      {...rest}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style as any]}>{children}</Animated.View>
    </Pressable>
  );
}
