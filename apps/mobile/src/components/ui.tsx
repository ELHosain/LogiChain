import React, { useRef, useState } from 'react';
import {
  View, Text, ActivityIndicator, Modal, TextInput, ScrollView,
  StyleSheet, ViewStyle, KeyboardAvoidingView, Platform, Pressable, Animated, Easing,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Typography, Shadows, Sizes, FontWeight, Blur } from '../utils/theme';
import { ItemStatus, ItemCategory } from '../types';
import { STATUS_LABELS, CATEGORY_LABELS } from '../utils/helpers';
import Icon from './Icon';
import GlassCard from './GlassCard';
import AnimatedPressable from './AnimatedPressable';

export { GlassCard, AnimatedPressable, Icon };

// ── ScreenHeader ─────────────────────────────────────────────
export const ScreenHeader = ({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) => (
  <View style={styles.header}>
    <View style={{ flex: 1 }}>
      <Text style={Typography.h1}>{title}</Text>
      {subtitle && <Text style={[Typography.body, { marginTop: 3 }]}>{subtitle}</Text>}
    </View>
    {right}
  </View>
);

export const SectionHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action}
  </View>
);

// ── GlassButton ──────────────────────────────────────────────
interface BtnProps {
  label: string; onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg'; loading?: boolean; disabled?: boolean;
  icon?: string; fullWidth?: boolean; style?: ViewStyle;
}
export const Button = ({ label, onPress, variant = 'primary', size = 'md', loading, disabled, icon, fullWidth, style }: BtnProps) => {
  const heights = { sm: Sizes.buttonSm, md: Sizes.buttonMd, lg: Sizes.buttonLg };
  const fs = { sm: 13, md: 14, lg: 15 };
  const h = heights[size];

  const content = (tint: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {loading ? <ActivityIndicator color={tint} size="small" />
        : <>{icon && <Icon name={icon} size={fs[size] + 4} color={tint} />}
            <Text style={{ color: tint, fontSize: fs[size], fontWeight: FontWeight.bold, letterSpacing: 0.2 }}>{label}</Text></>}
    </View>
  );

  if (variant === 'primary') {
    return (
      <AnimatedPressable onPress={onPress} disabled={disabled || loading} style={[{ height: h, borderRadius: Radius.md, opacity: disabled ? 0.5 : 1 }, fullWidth && { width: '100%' }, Shadows.glow, style]}>
        <LinearGradient colors={[Colors.primary, '#3B82F6']} start={{x:0,y:0}} end={{x:1,y:1}} style={[styles.btnInner, { height: h }]}>
          {content('#fff')}
        </LinearGradient>
      </AnimatedPressable>
    );
  }
  const map = {
    secondary: { bg: Colors.glassStrong, tc: Colors.primary, border: Colors.primary + '30' },
    danger:    { bg: Colors.redDim,      tc: Colors.red,     border: Colors.red + '30' },
    ghost:     { bg: 'transparent',      tc: Colors.textMuted, border: 'transparent' },
  }[variant];
  return (
    <AnimatedPressable onPress={onPress} disabled={disabled || loading} style={[styles.btnInner, { height: h, backgroundColor: map.bg, borderRadius: Radius.md, borderWidth: map.border === 'transparent' ? 0 : 1, borderColor: map.border, opacity: disabled ? 0.5 : 1 }, fullWidth && { width: '100%' }, style]}>
      {content(map.tc)}
    </AnimatedPressable>
  );
};

// ── IconButton ───────────────────────────────────────────────
export const IconButton = ({ icon, onPress, variant = 'default' }: { icon: string; onPress: () => void; variant?: 'default' | 'danger' }) => (
  <AnimatedPressable onPress={onPress} style={[styles.iconBtn, variant === 'danger' && { backgroundColor: Colors.redDim }]}>
    <Icon name={icon} size={17} color={variant === 'danger' ? Colors.red : Colors.textSoft} />
  </AnimatedPressable>
);

// ── FAB ──────────────────────────────────────────────────────
export const FAB = ({ onPress, icon = 'plus' }: { onPress: () => void; icon?: string }) => {
  const insets = useSafeAreaInsets();
  // Sit above the floating tab bar: tab bar (~66) + its bottom padding + gap
  const bottom = (insets.bottom || 10) + Sizes.tabBar + Spacing.md;
  return (
    <AnimatedPressable onPress={onPress} scaleTo={0.9} style={[styles.fab, { bottom }, Shadows.glow]}>
      <LinearGradient colors={[Colors.primary, '#3B82F6']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.fabGrad}>
        <Icon name={icon} size={26} color="#fff" />
      </LinearGradient>
    </AnimatedPressable>
  );
};

// ── Badges ───────────────────────────────────────────────────
export const Badge = ({ label, color, small }: { label: string; color: string; small?: boolean }) => (
  <View style={[styles.badge, { backgroundColor: color + '1E', borderColor: color + '40' }, small && { paddingVertical: 2, paddingHorizontal: 8 }]}>
    <Text style={[styles.badgeText, { color, fontSize: small ? 10 : 11 }]}>{label}</Text>
  </View>
);
export const StatusBadge = ({ status, optimistic }: { status: ItemStatus; optimistic?: boolean }) => {
  const color = Colors.status[status] || Colors.textMuted;
  return (
    <View style={[styles.badge, { backgroundColor: color + '1E', borderColor: color + '40' }]}>
      {optimistic && <ActivityIndicator size={9} color={color} style={{ marginRight: 5 }} />}
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
};
export const CategoryBadge = ({ category }: { category: ItemCategory }) => {
  const color = Colors.category[category] || Colors.textMuted;
  return (
    <View style={[styles.badge, { backgroundColor: color + '16', borderColor: color + '30' }]}>
      <Text style={[styles.badgeText, { color }]}>{CATEGORY_LABELS[category]}</Text>
    </View>
  );
};

// ── LiveDot ──────────────────────────────────────────────────
export const LiveDot = ({ connected }: { connected: boolean }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    if (connected) {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]));
      loop.start(); return () => loop.stop();
    }
  }, [connected]);
  const c = connected ? Colors.green : Colors.red;
  return (
    <View style={[styles.live, { backgroundColor: c + '18', borderColor: c + '40' }]}>
      <Animated.View style={[styles.liveDot, { backgroundColor: c, opacity: connected ? pulse : 1 }]} />
      <Text style={[styles.liveText, { color: c }]}>{connected ? 'LIVE' : 'OFF'}</Text>
    </View>
  );
};

// ── NetworkBanner ────────────────────────────────────────────
export const NetworkBanner = ({ isOnline, pendingCount }: { isOnline: boolean; pendingCount: number }) => {
  if (isOnline && pendingCount === 0) return null;
  const offline = !isOnline;
  const c = offline ? Colors.orange : Colors.teal;
  return (
    <View style={[styles.banner, { backgroundColor: c + '18', borderColor: c + '35' }]}>
      <Icon name={offline ? 'wifioff' : 'sync'} size={14} color={c} />
      <Text style={[styles.bannerText, { color: c }]}>
        {offline ? `Hors-ligne — ${pendingCount} en attente` : `Synchronisation de ${pendingCount}…`}
      </Text>
    </View>
  );
};

// ── KpiCard ──────────────────────────────────────────────────
export const KpiCard = ({ label, value, unit, color = Colors.primary, icon, trend }: { label: string; value: string | number; unit?: string; color?: string; icon?: string; trend?: string }) => (
  <GlassCard style={styles.kpi}>
    <View style={styles.kpiHead}>
      {icon && <View style={[styles.kpiIcon, { backgroundColor: color + '18' }]}><Icon name={icon} size={16} color={color} /></View>}
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
    <Text style={styles.kpiValue}><Text style={{ color }}>{value}</Text>{unit && <Text style={styles.kpiUnit}> {unit}</Text>}</Text>
    {trend && <Text style={[styles.kpiTrend, { color }]}>{trend}</Text>}
  </GlassCard>
);

// ── EmptyState ───────────────────────────────────────────────
export const EmptyState = ({ icon, title, message, action }: { icon: string; title?: string; message: string; action?: React.ReactNode }) => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}><Icon name={icon} size={34} color={Colors.textFaint} /></View>
    {title && <Text style={styles.emptyTitle}>{title}</Text>}
    <Text style={styles.emptyMsg}>{message}</Text>
    {action}
  </View>
);

// ── GlassInput / Field ───────────────────────────────────────
interface FieldProps {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: 'default' | 'email-address' | 'numeric';
  secureTextEntry?: boolean; helper?: string; error?: string;
  autoCapitalize?: 'none' | 'sentences'; icon?: string; multiline?: boolean;
}
export const Field = ({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, helper, error, autoCapitalize, icon, multiline }: FieldProps) => {
  const [focused, setFocused] = useState(false);
  const [hide, setHide] = useState(!!secureTextEntry);
  return (
    <View style={{ marginBottom: Spacing.md }}>
      {!!label && <Text style={styles.fieldLabel}>{label}</Text>}
      <View style={[styles.inputWrap, focused && styles.inputFocus, error && { borderColor: Colors.red }]}>
        {icon && <Icon name={icon} size={17} color={focused ? Colors.primary : Colors.textMuted} />}
        <TextInput
          style={[styles.input, multiline && { minHeight: 76, textAlignVertical: 'top' }]}
          value={value} onChangeText={onChangeText} placeholder={placeholder}
          placeholderTextColor={Colors.textFaint} keyboardType={keyboardType}
          secureTextEntry={hide} autoCapitalize={autoCapitalize} autoCorrect={false} multiline={multiline}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setHide(h => !h)} hitSlop={10}>
            <Icon name={hide ? 'eye' : 'eyeoff'} size={17} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.fieldError}>{error}</Text>}
      {helper && !error && <Text style={styles.fieldHelper}>{helper}</Text>}
    </View>
  );
};

// ── SelectField ──────────────────────────────────────────────
export const SelectField = ({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string; color?: string }>; onChange: (v: string) => void }) => (
  <View style={{ marginBottom: Spacing.md }}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.chipRow}>
      {options.map(opt => {
        const sel = opt.value === value; const c = opt.color || Colors.primary;
        return (
          <AnimatedPressable key={opt.value} onPress={() => onChange(opt.value)} scaleTo={0.94}
            style={[styles.selectChip, sel && { backgroundColor: c + '1E', borderColor: c }]}>
            <Text style={[styles.selectChipText, sel && { color: c, fontWeight: FontWeight.bold }]}>{opt.label}</Text>
          </AnimatedPressable>
        );
      })}
    </View>
  </View>
);

// ── SearchBar ────────────────────────────────────────────────
export const SearchBar = ({ value, onChangeText, placeholder = 'Rechercher…' }: { value: string; onChangeText: (v: string) => void; placeholder?: string }) => {
  const [focused, setFocused] = useState(false);
  return (
    <GlassCard strong style={[styles.search, focused && { borderColor: Colors.primary }] as any} noShadow>
      <Icon name="search" size={17} color={focused ? Colors.primary : Colors.textMuted} />
      <TextInput style={styles.searchInput} value={value} onChangeText={onChangeText}
        placeholder={placeholder} placeholderTextColor={Colors.textFaint}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      {value.length > 0 && <Pressable onPress={() => onChangeText('')} hitSlop={10}><Icon name="close" size={16} color={Colors.textMuted} /></Pressable>}
    </GlassCard>
  );
};

// ── FilterChips ──────────────────────────────────────────────
export function FilterChips<T extends string>({ options, value, onChange }: { options: Array<{ value: T; label: string; count?: number }>; value: T; onChange: (v: T) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <AnimatedPressable key={opt.value} onPress={() => onChange(opt.value)} scaleTo={0.93}
            style={[styles.filterChip, active && styles.filterChipActive]}>
            <Text style={[styles.filterText, active && { color: '#fff' }]}>{opt.label}</Text>
            {opt.count !== undefined && (
              <View style={[styles.filterCount, active && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                <Text style={[styles.filterCountText, active && { color: '#fff' }]}>{opt.count}</Text>
              </View>
            )}
          </AnimatedPressable>
        );
      })}
    </ScrollView>
  );
}

// ── Sheet (glass bottom sheet) ───────────────────────────────
export const Sheet = ({ visible, onClose, title, subtitle, children }: { visible: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode }) => {
  const slide = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(slide, { toValue: visible ? 1 : 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [visible]);
  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.sheetBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.sheetAnim, { transform: [{ translateY }] }]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {Platform.OS === 'ios'
              ? <BlurView intensity={Blur.strong} tint="light" style={styles.sheet}><SheetBody title={title} subtitle={subtitle} onClose={onClose}>{children}</SheetBody></BlurView>
              : <View style={[styles.sheet, { backgroundColor: '#F4F7FB' }]}><SheetBody title={title} subtitle={subtitle} onClose={onClose}>{children}</SheetBody></View>}
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};
const SheetBody = ({ title, subtitle, onClose, children }: any) => (
  <>
    <View style={styles.sheetHandle} />
    <View style={styles.sheetHead}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sheetTitle}>{title}</Text>
        {subtitle && <Text style={styles.sheetSub}>{subtitle}</Text>}
      </View>
      <Pressable onPress={onClose} style={styles.sheetClose} hitSlop={10}><Icon name="close" size={18} color={Colors.textSoft} /></Pressable>
    </View>
    <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xxl }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  </>
);

// ── Skeleton loader ──────────────────────────────────────────
export const Skeleton = ({ height = 80, style }: { height?: number; style?: ViewStyle }) => {
  const shimmer = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const loop = Animated.loop(Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }));
    loop.start(); return () => loop.stop();
  }, []);
  const opacity = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.8, 0.4] });
  return <Animated.View style={[{ height, borderRadius: Radius.md, backgroundColor: Colors.glassSoft, opacity, marginBottom: Spacing.sm }, style]} />;
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: 11, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 1.3, textTransform: 'uppercase' },

  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg, borderRadius: Radius.md },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.glassStrong, borderWidth: 1, borderColor: Colors.glassBorder, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: Spacing.lg, width: Sizes.fab, height: Sizes.fab, borderRadius: Sizes.fab / 2 },
  fabGrad: { width: '100%', height: '100%', borderRadius: Sizes.fab / 2, alignItems: 'center', justifyContent: 'center' },

  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.2 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },

  live: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1.5 },

  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: Spacing.md, marginTop: Spacing.sm, paddingVertical: 9, borderRadius: Radius.md, borderWidth: 1 },
  bannerText: { fontSize: 12, fontWeight: FontWeight.bold },

  kpi: { flex: 1, padding: Spacing.md },
  kpiHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  kpiIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  kpiLabel: { flex: 1, fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  kpiValue: { fontSize: 26, fontWeight: FontWeight.black, color: Colors.text, letterSpacing: -0.5 },
  kpiUnit: { fontSize: 12, fontWeight: FontWeight.medium, color: Colors.textMuted },
  kpiTrend: { fontSize: 11, fontWeight: FontWeight.semibold, marginTop: 4 },

  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: Colors.glassStrong, borderWidth: 1, borderColor: Colors.glassBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { ...Typography.h3, textAlign: 'center' },
  emptyMsg: { ...Typography.body, textAlign: 'center', maxWidth: 280 },

  fieldLabel: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 7 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.glassStrong, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.glassLine, paddingHorizontal: Spacing.md, minHeight: Sizes.input },
  inputFocus: { borderColor: Colors.primary, backgroundColor: '#fff' },
  input: { flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 13 },
  fieldError: { color: Colors.red, fontSize: 11, marginTop: 5, fontWeight: FontWeight.medium },
  fieldHelper: { color: Colors.textMuted, fontSize: 11, marginTop: 5 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.full, backgroundColor: Colors.glassStrong, borderWidth: 1.5, borderColor: Colors.glassLine },
  selectChipText: { color: Colors.textSoft, fontSize: 12, fontWeight: FontWeight.semibold },

  search: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: Spacing.md, height: Sizes.input, marginHorizontal: Spacing.lg, borderRadius: Radius.md },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15 },

  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: Spacing.lg, gap: 8, paddingVertical: 6, alignItems: 'center' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 38, borderRadius: Radius.full, backgroundColor: Colors.glassStrong, borderWidth: 1, borderColor: Colors.glassBorder },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textSoft, fontSize: 12.5, fontWeight: FontWeight.semibold },
  filterCount: { minWidth: 20, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 10, backgroundColor: Colors.primaryDim, alignItems: 'center', justifyContent: 'center' },
  filterCountText: { color: Colors.primary, fontSize: 10, fontWeight: FontWeight.bold },

  sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,30,51,0.35)' },
  sheetAnim: { maxHeight: '90%' },
  sheet: { borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, overflow: 'hidden' },
  sheetHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.textFaint, alignSelf: 'center', marginVertical: Spacing.sm, opacity: 0.5 },
  sheetHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.md, marginTop: 4 },
  sheetTitle: { ...Typography.h2 },
  sheetSub: { ...Typography.small, marginTop: 2 },
  sheetClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.glassStrong, borderWidth: 1, borderColor: Colors.glassBorder, alignItems: 'center', justifyContent: 'center' },
});
