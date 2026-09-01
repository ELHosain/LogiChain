import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Animated, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Shadows, FontWeight, Blur } from '../utils/theme';
import Icon from '../components/Icon';

const ICONS: Record<string, string> = {
  Events: 'calendar', Dashboard: 'grid', Items: 'box',
  Anomalies: 'alert', Alerts: 'bell', Scan: 'camera', Sync: 'sync',
};
const LABELS: Record<string, string> = {
  Events: 'Events', Dashboard: 'Stats', Items: 'Items',
  Anomalies: 'Anomalies', Alerts: 'Live', Scan: 'Scan', Sync: 'Sync',
};

function TabItem({ route, focused, onPress }: any) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: focused ? 1 : 0, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
  }, [focused]);
  const pillOpacity = scale.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const iconScale = scale.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  return (
    <Pressable style={styles.item} onPress={() => { Haptics.selectionAsync().catch(()=>{}); onPress(); }}>
      <Animated.View style={[styles.pill, { opacity: pillOpacity }]} />
      <Animated.View style={{ transform: [{ scale: iconScale }], alignItems: 'center' }}>
        <Icon name={ICONS[route.name] || 'box'} size={22} color={focused ? Colors.primary : Colors.textMuted} strokeWidth={focused ? 2.4 : 2} />
      </Animated.View>
      <Text style={[styles.label, { color: focused ? Colors.primary : Colors.textMuted, fontWeight: focused ? FontWeight.bold : FontWeight.medium }]} numberOfLines={1}>
        {LABELS[route.name]}
      </Text>
    </Pressable>
  );
}

export default function GlassTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const Container: any = Platform.OS === 'ios' ? BlurView : View;
  const containerProps = Platform.OS === 'ios' ? { intensity: Blur.strong, tint: 'light' as const } : {};
  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom || 10 }]} pointerEvents="box-none">
      <View style={[styles.barShadow, Shadows.lg]}>
        <Container {...containerProps} style={styles.bar}>
          {Platform.OS !== 'ios' && <View style={styles.androidBg} />}
          {state.routes.map((route: any, i: number) => (
            <TabItem key={route.key} route={route} focused={state.index === i}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (state.index !== i && !event.defaultPrevented) navigation.navigate(route.name);
              }} />
          ))}
        </Container>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12, alignItems: 'center' },
  barShadow: { borderRadius: Radius.xxl, width: '100%' },
  bar: { flexDirection: 'row', borderRadius: Radius.xxl, paddingVertical: 10, paddingHorizontal: 6, overflow: 'hidden', borderWidth: 1, borderColor: Colors.glassBorder },
  androidBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.94)' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, gap: 3 },
  pill: { position: 'absolute', top: 0, width: 46, height: 32, borderRadius: Radius.full, backgroundColor: Colors.primaryDim },
  label: { fontSize: 9.5, letterSpacing: 0.1 },
});
