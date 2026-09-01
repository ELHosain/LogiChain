import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontWeight } from '../utils/theme';
import Screen from '../components/Screen';
import Avatar from '../components/Avatar';
import { GlassCard, EmptyState, ScreenHeader, LiveDot, AnimatedPressable, Icon } from '../components/ui';
import { useEventStore } from '../store';
import { useAlerts } from '../hooks/useAlerts';

export default function AlertsScreen() {
  const { selectedEventId } = useEventStore();
  const { alerts, connected, clearAlerts } = useAlerts(selectedEventId);

  if (!selectedEventId) return <Screen><EmptyState icon="bell" title="Aucun événement" message="Sélectionnez un événement" /></Screen>;

  const meta = (t: string) => t === 'ITEM_SCANNED' ? { icon: 'camera', color: Colors.teal, label: 'Scan' }
    : t === 'ANOMALY_CREATED' ? { icon: 'alert', color: Colors.orange, label: 'Anomalie' }
    : { icon: 'bell', color: Colors.textMuted, label: 'Info' };

  return (
    <Screen>
      <ScreenHeader title="Alertes" subtitle={`${alerts.length} notification${alerts.length > 1 ? 's' : ''} en direct`} right={<LiveDot connected={connected} />} />
      {alerts.length > 0 && (
        <AnimatedPressable onPress={clearAlerts} style={styles.clear}><Text style={styles.clearText}>Effacer tout</Text></AnimatedPressable>
      )}
      <FlatList
        data={alerts} keyExtractor={a => String(a.id)}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 140 }}
        ListEmptyComponent={<EmptyState icon="bell" title="En attente d'activité" message="Les scans et anomalies apparaîtront ici instantanément" />}
        renderItem={({ item }) => {
          const m = meta(item.type);
          return (
            <GlassCard strong style={styles.card}>
              <View style={[styles.bar, { backgroundColor: m.color }]} />
              <View style={[styles.icon, { backgroundColor: m.color + '1E' }]}><Icon name={m.icon} size={18} color={m.color} /></View>
              <View style={{ flex: 1 }}>
                <View style={styles.top}>
                  <View style={[styles.tag, { backgroundColor: m.color + '16' }]}><Text style={[styles.tagText, { color: m.color }]}>{m.label}</Text></View>
                  <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text style={styles.msg}>{item.message}</Text>
                {item.agent && <View style={styles.agentRow}><Avatar name={item.agent} size="sm" /><Text style={styles.agent}>{item.agent}</Text></View>}
              </View>
            </GlassCard>
          );
        }}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  clear: { alignSelf: 'flex-end', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  clearText: { color: Colors.textMuted, fontSize: 12, fontWeight: FontWeight.semibold },
  card: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md, paddingLeft: Spacing.md + 4, marginBottom: Spacing.md },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: Radius.lg, borderBottomLeftRadius: Radius.lg },
  icon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.sm },
  tagText: { fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5 },
  time: { fontSize: 11, color: Colors.textMuted },
  msg: { color: Colors.text, fontSize: 13, fontWeight: FontWeight.semibold, lineHeight: 18 },
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  agent: { fontSize: 11, color: Colors.textSoft, fontWeight: FontWeight.medium },
});
