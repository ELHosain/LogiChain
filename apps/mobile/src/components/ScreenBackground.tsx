import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../utils/theme';

export default function ScreenBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[Colors.bgGradTop, Colors.bgGradBot]} style={StyleSheet.absoluteFill} />
      {/* Soft decorative blobs */}
      <View style={[styles.blob, { backgroundColor: Colors.primary + '18', top: -60, right: -40 }]} />
      <View style={[styles.blob, { backgroundColor: Colors.teal + '15', top: 180, left: -70, width: 220, height: 220 }]} />
      <View style={[styles.blob, { backgroundColor: Colors.mint + '12', bottom: 40, right: -50, width: 180, height: 180 }]} />
    </View>
  );
}
const styles = StyleSheet.create({
  blob: { position: 'absolute', width: 260, height: 260, borderRadius: 999 },
});
