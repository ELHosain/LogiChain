import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Shadows, Blur } from '../utils/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  strong?: boolean;
  noShadow?: boolean;
}

// Two-layer card:
//  - OUTER view carries margins + shadow, NO overflow clipping (prevents the
//    iOS "white square" artifact caused by shadow + overflow:hidden together).
//  - INNER view clips the blur/tint/border/content with the border radius, and
//    keeps ALL the caller's styling (padding, custom border, etc.) so absolutely
//    positioned children (like a colored left bar) still align to the card edge.
export default function GlassCard({ children, style, intensity = Blur.medium, strong, noShadow }: Props) {
  const flat = StyleSheet.flatten(style) || {};
  const {
    margin, marginTop, marginBottom, marginLeft, marginRight,
    marginHorizontal, marginVertical, flex, alignSelf,
    ...surface
  } = flat as any;

  const radius = (surface as any).borderRadius ?? Radius.lg;
  const outer: ViewStyle = {
    margin, marginTop, marginBottom, marginLeft, marginRight,
    marginHorizontal, marginVertical, flex, alignSelf,
  };

  const bg = strong ? Colors.glassStrong : (Platform.OS === 'ios' ? Colors.glass : 'rgba(255,255,255,0.92)');

  return (
    <View style={[outer, !noShadow && (Platform.OS === 'ios' ? Shadows.md : Shadows.sm)]}>
      <View style={[styles.clip, flex != null && { flex: 1 }, { borderRadius: radius }, surface]}>
        {Platform.OS === 'ios' && <BlurView intensity={intensity} tint="light" style={StyleSheet.absoluteFill} />}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: bg }]} pointerEvents="none" />
        <View style={[StyleSheet.absoluteFillObject, { borderRadius: radius, borderWidth: 1, borderColor: Colors.glassBorder }]} pointerEvents="none" />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});
