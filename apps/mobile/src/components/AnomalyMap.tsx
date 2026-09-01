import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Spacing, Radius, FontWeight } from '../utils/theme';
import { EmptyState } from './ui';

interface Anomaly {
  _id: string;
  description: string;
  itemName?: string;
  status: string;
  agentName?: string;
  location?: { type: string; coordinates: [number, number] };
}

// Spread markers that share (nearly) the same coordinates so they don't overlap.
// Groups points rounded to ~5 decimals (~1m) and fans duplicates out in a small circle.
function spreadOverlapping(points: Array<{ lat: number; lng: number; a: Anomaly }>) {
  const groups: Record<string, typeof points> = {};
  points.forEach(p => {
    const key = `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
    (groups[key] = groups[key] || []).push(p);
  });
  const out: typeof points = [];
  Object.values(groups).forEach(group => {
    if (group.length === 1) { out.push(group[0]); return; }
    // Fan out around the shared center, radius grows a bit with count
    const radius = 0.0004 + group.length * 0.00006; // ~40m base
    group.forEach((p, i) => {
      const angle = (2 * Math.PI * i) / group.length;
      out.push({
        ...p,
        lat: p.lat + radius * Math.cos(angle),
        lng: p.lng + radius * Math.sin(angle),
      });
    });
  });
  return out;
}

export default function AnomalyMap({ anomalies }: { anomalies: Anomaly[] }) {
  const geoAnomalies = useMemo(
    () => anomalies.filter(a => a.location?.coordinates && a.location.coordinates.length === 2),
    [anomalies]
  );

  const points = useMemo(() => {
    const raw = geoAnomalies.map(a => ({ lat: a.location!.coordinates[1], lng: a.location!.coordinates[0], a }));
    return spreadOverlapping(raw);
  }, [geoAnomalies]);

  const html = useMemo(() => {
    const markers = points.map(p => {
      const open = p.a.status === 'ouverte';
      const color = open ? '#F59E0B' : '#10B981';
      const title = (p.a.itemName || 'Anomalie').replace(/'/g, "\\'");
      const desc = (p.a.description || '').replace(/'/g, "\\'");
      return `
        L.circleMarker([${p.lat}, ${p.lng}], {
          radius: 10, color: '#fff', weight: 2, fillColor: '${color}', fillOpacity: 1
        }).addTo(map).bindPopup('<b>${title}</b><br/>${desc}');`;
    }).join('\n');

    let centerLat = 48.8566, centerLng = 2.3522, zoom = 5;
    if (points.length > 0) {
      centerLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
      centerLng = points.reduce((s, p) => s + p.lng, 0) / points.length;
      zoom = points.length === 1 ? 13 : 14;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #EEF2F8; }
    .leaflet-container { font-family: -apple-system, system-ui, sans-serif; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([${centerLat}, ${centerLng}], ${zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);
    ${markers}
    var pts = [${points.map(p => `[${p.lat}, ${p.lng}]`).join(',')}];
    if (pts.length > 1) { map.fitBounds(pts, { padding: [50, 50], maxZoom: 16 }); }
  </script>
</body>
</html>`;
  }, [points]);

  if (geoAnomalies.length === 0) {
    return <EmptyState icon="mappin" title="Aucune position" message="Aucune anomalie géolocalisée pour le moment" />;
  }

  return (
    <View style={styles.wrap}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        scrollEnabled={false}
      />
      <View style={styles.legend}>
        <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: Colors.orange }]} /><Text style={styles.legendText}>Ouverte</Text></View>
        <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: Colors.green }]} /><Text style={styles.legendText}>Résolue</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, borderRadius: Radius.lg, overflow: 'hidden', margin: Spacing.lg, marginBottom: 140, borderWidth: 1, borderColor: Colors.glassBorder },
  web: { flex: 1, backgroundColor: '#EEF2F8' },
  legend: { position: 'absolute', bottom: Spacing.md, left: Spacing.md, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: Radius.md, padding: Spacing.sm, gap: 4, borderWidth: 1, borderColor: Colors.glassBorder },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: Colors.text, fontWeight: FontWeight.semibold },
});