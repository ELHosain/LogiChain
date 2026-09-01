import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../utils/theme';

export default function StatBar({ label, value, max, color = Colors.primary, displayValue }: { label: string; value: number; max: number; color?: string; displayValue?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(w, { toValue: pct, duration: 700, useNativeDriver: false }).start(); }, [pct]);
  const width = w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{displayValue ?? value}</Text>
      </View>
      <View style={styles.track}><Animated.View style={[styles.fill, { width, backgroundColor: color }]} /></View>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection:'row', justifyContent:'space-between', marginBottom: 6 },
  label: { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: FontWeight.medium },
  value: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  track: { height: 8, backgroundColor: Colors.glassLine, borderRadius: Radius.full, overflow: 'hidden' },
  fill: { height: 8, borderRadius: Radius.full },
});
