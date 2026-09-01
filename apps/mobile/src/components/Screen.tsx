import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';
import ScreenBackground from './ScreenBackground';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom')[];
  noBackground?: boolean;
}

export default function Screen({ children, style, edges = ['top'], noBackground }: Props) {
  const insets = useSafeAreaInsets();
  const paddingTop = edges.includes('top') ? insets.top : 0;
  const paddingBottom = edges.includes('bottom') ? insets.bottom : 0;
  return (
    <View style={[styles.root, style]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {!noBackground && <ScreenBackground />}
      <View style={{ flex: 1, paddingTop, paddingBottom }}>{children}</View>
    </View>
  );
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: Colors.bg } });
