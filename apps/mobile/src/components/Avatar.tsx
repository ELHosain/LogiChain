import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Sizes, FontWeight } from '../utils/theme';

const SIZE = { sm: Sizes.avatarSm, md: Sizes.avatarMd, lg: Sizes.avatarLg };
const FONT = { sm: 11, md: 15, lg: 20 };

export default function Avatar({ name = '?', size = 'md', style }: { name?: string; size?: 'sm'|'md'|'lg'; color?: string; style?: ViewStyle }) {
  const initials = name.split(' ').filter(Boolean).slice(0,2).map(w => w[0]?.toUpperCase()||'').join('') || '?';
  const dim = SIZE[size];
  return (
    <LinearGradient colors={[Colors.primary, '#3B82F6']} start={{x:0,y:0}} end={{x:1,y:1}}
      style={[{ width: dim, height: dim, borderRadius: dim/2, alignItems:'center', justifyContent:'center' }, style]}>
      <Text style={{ color:'#fff', fontSize: FONT[size], fontWeight: FontWeight.bold }}>{initials}</Text>
    </LinearGradient>
  );
}
