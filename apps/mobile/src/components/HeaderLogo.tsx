import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Spacing, FontWeight } from '../utils/theme';

const DIM = { sm: 26, md: 34, lg: 76 };
const FS = { sm: 15, md: 18, lg: 30 };

// Uses assets/logo.png if present; else gradient box fallback
export default function HeaderLogo({ size = 'md', showText = true }: { size?: 'sm'|'md'|'lg'; showText?: boolean }) {
  const dim = DIM[size];
  let logoSource: any = null;
  try { logoSource = require('../../assets/logo.png'); } catch {}
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
      {logoSource
        ? <Image source={logoSource} style={{ width: dim, height: dim }} resizeMode="contain" />
        : <View style={[styles.box, { width: dim, height: dim, borderRadius: dim/4 }]}><Text style={{ fontSize: dim*0.5 }}>📦</Text></View>}
      {showText && <Text style={[styles.text, { fontSize: FS[size] }]}>Logi<Text style={{ color: Colors.primary }}>Chain</Text></Text>}
    </View>
  );
}
const styles = StyleSheet.create({
  box: { backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  text: { color: Colors.text, fontWeight: FontWeight.black, letterSpacing: -0.4 },
});
