import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polyline, Polygon } from 'react-native-svg';
import { Colors } from '../utils/theme';

interface Props { name: string; size?: number; color?: string; strokeWidth?: number; }

// Minimal line-icon set (Feather-style) drawn with react-native-svg
export default function Icon({ name, size = 24, color = Colors.text, strokeWidth = 2 }: Props) {
  const p = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const icons: Record<string, React.ReactNode> = {
    calendar: <><Rect x="3" y="4" width="18" height="18" rx="2" {...p} /><Line x1="16" y1="2" x2="16" y2="6" {...p} /><Line x1="8" y1="2" x2="8" y2="6" {...p} /><Line x1="3" y1="10" x2="21" y2="10" {...p} /></>,
    grid: <><Rect x="3" y="3" width="7" height="7" rx="1.5" {...p} /><Rect x="14" y="3" width="7" height="7" rx="1.5" {...p} /><Rect x="14" y="14" width="7" height="7" rx="1.5" {...p} /><Rect x="3" y="14" width="7" height="7" rx="1.5" {...p} /></>,
    box: <><Path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" {...p} /><Polyline points="3 8 12 13 21 8" {...p} /><Line x1="12" y1="13" x2="12" y2="21" {...p} /></>,
    alert: <><Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" {...p} /><Line x1="12" y1="9" x2="12" y2="13" {...p} /><Line x1="12" y1="17" x2="12.01" y2="17" {...p} /></>,
    bell: <><Path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" {...p} /><Path d="M13.73 21a2 2 0 01-3.46 0" {...p} /></>,
    camera: <><Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" {...p} /><Circle cx="12" cy="13" r="4" {...p} /></>,
    sync: <><Polyline points="23 4 23 10 17 10" {...p} /><Polyline points="1 20 1 14 7 14" {...p} /><Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" {...p} /></>,
    search: <><Circle cx="11" cy="11" r="8" {...p} /><Line x1="21" y1="21" x2="16.65" y2="16.65" {...p} /></>,
    plus: <><Line x1="12" y1="5" x2="12" y2="19" {...p} /><Line x1="5" y1="12" x2="19" y2="12" {...p} /></>,
    close: <><Line x1="18" y1="6" x2="6" y2="18" {...p} /><Line x1="6" y1="6" x2="18" y2="18" {...p} /></>,
    check: <><Polyline points="20 6 9 17 4 12" {...p} /></>,
    trash: <><Polyline points="3 6 5 6 21 6" {...p} /><Path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" {...p} /></>,
    edit: <><Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" {...p} /><Path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" {...p} /></>,
    mappin: <><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" {...p} /><Circle cx="12" cy="10" r="3" {...p} /></>,
    user: <><Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" {...p} /><Circle cx="12" cy="7" r="4" {...p} /></>,
    leaf: <><Path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" {...p} /><Path d="M2 21c0-3 1.85-5.36 5.08-6" {...p} /></>,
    truck: <><Rect x="1" y="3" width="15" height="13" rx="1" {...p} /><Polygon points="16 8 20 8 23 11 23 16 16 16 16 8" {...p} /><Circle cx="5.5" cy="18.5" r="2.5" {...p} /><Circle cx="18.5" cy="18.5" r="2.5" {...p} /></>,
    wifi: <><Path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0" {...p} /><Line x1="12" y1="20" x2="12.01" y2="20" {...p} /></>,
    wifioff: <><Line x1="1" y1="1" x2="23" y2="23" {...p} /><Path d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.58 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0" {...p} /><Line x1="12" y1="20" x2="12.01" y2="20" {...p} /></>,
    power: <><Path d="M18.36 6.64a9 9 0 11-12.73 0" {...p} /><Line x1="12" y1="2" x2="12" y2="12" {...p} /></>,
    tent: <><Path d="M3.5 21 14 3M20.5 21 10 3M15.5 21 12 15l-3.5 6M2 21h20" {...p} /></>,
    clock: <><Circle cx="12" cy="12" r="10" {...p} /><Polyline points="12 6 12 12 16 14" {...p} /></>,
    eye: <><Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...p} /><Circle cx="12" cy="12" r="3" {...p} /></>,
    eyeoff: <><Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" {...p} /><Line x1="1" y1="1" x2="23" y2="23" {...p} /></>,
    lock: <><Rect x="3" y="11" width="18" height="11" rx="2" {...p} /><Path d="M7 11V7a5 5 0 0110 0v4" {...p} /></>,
    mail: <><Path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" {...p} /><Polyline points="22,6 12,13 2,6" {...p} /></>,
    filter: <><Polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" {...p} /></>,
  };
  return <Svg width={size} height={size} viewBox="0 0 24 24">{icons[name] || icons.box}</Svg>;
}
