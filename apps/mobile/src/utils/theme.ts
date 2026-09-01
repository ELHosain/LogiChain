// src/utils/theme.ts — Liquid Glass Light Theme
import { Platform, ViewStyle } from 'react-native';

export const Colors = {
  // Light backgrounds
  bg:          '#EEF2F8',     // soft gray-blue app background
  bgGradTop:   '#F5F8FC',
  bgGradBot:   '#E3EAF4',
  bgSolid:     '#F0F4FA',

  // Glass surfaces (semi-transparent whites)
  glass:       'rgba(255,255,255,0.65)',
  glassStrong: 'rgba(255,255,255,0.82)',
  glassSoft:   'rgba(255,255,255,0.45)',
  glassBorder: 'rgba(255,255,255,0.7)',
  glassLine:   'rgba(17,40,75,0.08)',

  // Brand (from logo)
  primary:     '#2563EB',
  primaryDim:  'rgba(37,99,235,0.12)',
  primaryDeep: '#1E3A8A',
  teal:        '#0EA5C4',
  tealDim:     'rgba(14,165,196,0.12)',
  mint:        '#10B9A6',

  // Text (dark on light)
  text:        '#0F1E33',
  textSoft:    '#3A5170',
  textMuted:   '#7089A5',
  textFaint:   '#9DB0C6',

  // Status
  green:    '#10B981', greenDim: 'rgba(16,185,129,0.14)',
  red:      '#EF4455', redDim:   'rgba(239,68,85,0.14)',
  orange:   '#F59E0B', orangeDim:'rgba(245,158,11,0.14)',
  purple:   '#8B5CF6', purpleDim:'rgba(139,92,246,0.14)',

  // Item statuses
  status: {
    stocké:         '#0EA5C4',
    en_transit:     '#F59E0B',
    livré:          '#10B981',
    en_maintenance: '#8B5CF6',
    archivé:        '#7089A5',
  },
  // Categories
  category: {
    energie:'#F59E0B', scene:'#0EA5C4', son:'#8B5CF6', lumiere:'#EAB308',
    securite:'#EF4455', sanitaire:'#10B981', autre:'#7089A5',
  },

  white: '#FFFFFF',
  shadow: '#1E3A5F',
};

export const Spacing = { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48, xxxl:64 };
export const Radius  = { sm:10, md:16, lg:22, xl:28, xxl:36, full:999 };
export const FontSize = { xs:10, sm:12, base:14, md:15, lg:17, xl:20, xxl:26, display:34 };
export const FontWeight = {
  regular:'400' as const, medium:'500' as const, semibold:'600' as const,
  bold:'700' as const, black:'800' as const,
};

export const Typography = {
  display: { fontSize:FontSize.display, fontWeight:FontWeight.black, color:Colors.text, letterSpacing:-1 },
  h1: { fontSize:FontSize.xxl, fontWeight:FontWeight.black, color:Colors.text, letterSpacing:-0.6 },
  h2: { fontSize:FontSize.xl,  fontWeight:FontWeight.bold,  color:Colors.text, letterSpacing:-0.4 },
  h3: { fontSize:FontSize.lg,  fontWeight:FontWeight.bold,  color:Colors.text },
  body: { fontSize:FontSize.base, fontWeight:FontWeight.regular, color:Colors.textSoft },
  bodyStrong: { fontSize:FontSize.base, fontWeight:FontWeight.semibold, color:Colors.text },
  small: { fontSize:FontSize.sm, fontWeight:FontWeight.regular, color:Colors.textMuted },
  label: { fontSize:FontSize.xs, fontWeight:FontWeight.bold, color:Colors.textMuted, letterSpacing:1.2 },
  mono: { fontSize:FontSize.sm, fontFamily:Platform.select({ios:'Menlo',android:'monospace'}), color:Colors.textSoft },
};

// Soft glass shadows (blue tint, light)
export const Shadows: { sm: ViewStyle; md: ViewStyle; lg: ViewStyle; glow: ViewStyle } = {
  sm: { shadowColor:Colors.shadow, shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:8, elevation:2 },
  md: { shadowColor:Colors.shadow, shadowOffset:{width:0,height:8}, shadowOpacity:0.12, shadowRadius:20, elevation:6 },
  lg: { shadowColor:Colors.shadow, shadowOffset:{width:0,height:16},shadowOpacity:0.16, shadowRadius:32, elevation:12 },
  glow: { shadowColor:Colors.primary, shadowOffset:{width:0,height:6}, shadowOpacity:0.35, shadowRadius:16, elevation:8 },
};

export const Sizes = {
  header:56, tabBar:66, fab:60, input:52,
  buttonSm:38, buttonMd:46, buttonLg:54,
  avatarSm:30, avatarMd:42, avatarLg:60, iconBox:46,
};
export const Durations = { fast:150, base:250, slow:400 };

// Blur intensities (expo-blur)
export const Blur = { light:24, medium:40, strong:60 };
