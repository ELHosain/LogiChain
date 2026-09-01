import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontWeight } from '../utils/theme';
import Screen from '../components/Screen';
import Avatar from '../components/Avatar';
import { GlassCard, EmptyState, Sheet, Button, ScreenHeader, FilterChips, Badge, AnimatedPressable, Icon, FAB } from '../components/ui';
import AnomalySheet from '../components/AnomalySheet';
import AnomalyMap from '../components/AnomalyMap';
import { AnomaliesAPI } from '../services/api';
import { useEventStore } from '../store';
import { useAlerts } from '../hooks/useAlerts';
import { formatDateTime } from '../utils/helpers';

type F = 'toutes' | 'ouverte' | 'resolue';

export default function AnomaliesScreen() {
  const { selectedEventId } = useEventStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<F>('toutes');
  const [selected, setSelected] = useState<any>(null);
  const [showDeclare, setShowDeclare] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { alerts } = useAlerts(selectedEventId);
  const { data: anomalies = [], isLoading, refetch } = useQuery({
    queryKey: ['anomalies', selectedEventId], queryFn: () => AnomaliesAPI.getByEvent(selectedEventId!), enabled: !!selectedEventId,
  });

  useEffect(() => { const l = alerts[0]; if (l && l.type === 'ANOMALY_CREATED') queryClient.invalidateQueries({ queryKey: ['anomalies', selectedEventId] }); }, [alerts, selectedEventId]);

  const filtered = filter === 'toutes' ? anomalies : anomalies.filter((a: any) => a.status === filter);
  const openCount = anomalies.filter((a: any) => a.status === 'ouverte').length;
  const filterOptions: Array<{ value: F; label: string; count: number }> = [
    { value: 'toutes', label: 'Toutes', count: anomalies.length },
    { value: 'ouverte', label: 'Ouvertes', count: openCount },
    { value: 'resolue', label: 'Résolues', count: anomalies.length - openCount },
  ];

  const handleResolve = async (id: string) => {
    try { await AnomaliesAPI.resolve(selectedEventId!, id); await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['anomalies', selectedEventId] }); setSelected(null);
    } catch (e: any) { Alert.alert('Erreur', e?.response?.data?.error || 'Impossible'); }
  };
  const handleDelete = (id: string) => {
    Alert.alert('Supprimer ?', 'Action irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await AnomaliesAPI.remove(selectedEventId!, id); await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          queryClient.invalidateQueries({ queryKey: ['anomalies', selectedEventId] }); setSelected(null);
        } catch (e: any) { Alert.alert('Erreur', e?.response?.data?.error || 'Impossible'); }
      }},
    ]);
  };

  if (!selectedEventId) return <Screen><EmptyState icon="alert" title="Aucun événement" message="Sélectionnez un événement" /></Screen>;

  return (
    <Screen>
      <ScreenHeader
        title="Anomalies"
        subtitle={`${openCount} ouverte(s) sur ${anomalies.length}`}
        right={
          <AnimatedPressable onPress={() => setViewMode(m => m === 'list' ? 'map' : 'list')} style={styles.toggle}>
            <Icon name={viewMode === 'list' ? 'mappin' : 'grid'} size={18} color={Colors.primary} />
          </AnimatedPressable>
        }
      />
      {viewMode === 'map' ? (
        <AnomalyMap anomalies={anomalies} />
      ) : (
      <>
      <FilterChips options={filterOptions} value={filter} onChange={setFilter} />
      <FlatList
        data={filtered} keyExtractor={(a: any) => a._id}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
        ListEmptyComponent={<EmptyState icon="check" title="Aucune anomalie" message={filter === 'toutes' ? 'Tout va bien sur ce site' : `Aucune ${filter}`} />}
        renderItem={({ item }) => {
          const isOpen = item.status === 'ouverte';
          const c = isOpen ? Colors.orange : Colors.green;
          return (
            <AnimatedPressable onPress={() => setSelected(item)} scaleTo={0.98} style={{ marginBottom: Spacing.md }}>
              <GlassCard strong style={styles.card}>
                <View style={[styles.leftBar, { backgroundColor: c }]} />
                <View style={styles.head}>
                  <View style={[styles.icon, { backgroundColor: c + '1E' }]}><Icon name={isOpen ? 'alert' : 'check'} size={18} color={c} /></View>
                  <View style={{ flex: 1 }}>
                    {item.itemName && <View style={styles.pill}><Icon name="box" size={11} color={Colors.primary} /><Text style={styles.pillText}>{item.itemName}</Text></View>}
                    <Text style={styles.desc}>{item.description}</Text>
                  </View>
                  <Badge label={isOpen ? 'OUVERTE' : 'RÉSOLUE'} color={c} small />
                </View>
                <View style={styles.metaRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <Avatar name={item.agentName} size="sm" />
                    <View><Text style={styles.agent}>{item.agentName}</Text><Text style={styles.time}>{formatDateTime(item.createdAt)}</Text></View>
                  </View>
                  {item.location?.coordinates && <View style={styles.geo}><Icon name="mappin" size={10} color={Colors.mint} /><Text style={styles.geoText}>{item.location.coordinates[1].toFixed(2)}, {item.location.coordinates[0].toFixed(2)}</Text></View>}
                </View>
              </GlassCard>
            </AnimatedPressable>
          );
        }}
      />
      </>
      )}
      <FAB onPress={() => setShowDeclare(true)} icon="alert" />
      <AnomalySheet visible={showDeclare} onClose={() => setShowDeclare(false)} eventId={selectedEventId} />
      <Sheet visible={!!selected} onClose={() => setSelected(null)} title="Détails de l'anomalie">
        {selected && (
          <View>
            {selected.itemName && (
              <GlassCard strong style={styles.itemBig}>
                <View style={styles.itemBigIcon}><Icon name="box" size={22} color={Colors.primary} /></View>
                <View style={{ flex: 1 }}><Text style={styles.itemBigLabel}>ÉQUIPEMENT</Text><Text style={styles.itemBigName}>{selected.itemName}</Text></View>
              </GlassCard>
            )}
            <GlassCard style={styles.box}><Text style={styles.label}>DESCRIPTION</Text><Text style={styles.val}>{selected.description}</Text></GlassCard>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
              <GlassCard style={[styles.box, { flex: 1 }] as any}>
                <Text style={styles.label}>DÉCLARÉE PAR</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}><Avatar name={selected.agentName} size="sm" /><Text style={styles.val}>{selected.agentName}</Text></View>
                <Text style={styles.sub}>{formatDateTime(selected.createdAt)}</Text>
              </GlassCard>
              <GlassCard style={[styles.box, { flex: 1 }] as any}>
                <Text style={styles.label}>STATUT</Text>
                <View style={{ marginTop: 8 }}><Badge label={selected.status === 'ouverte' ? 'OUVERTE' : 'RÉSOLUE'} color={selected.status === 'ouverte' ? Colors.orange : Colors.green} /></View>
              </GlassCard>
            </View>
            {selected.location?.coordinates && (
              <GlassCard style={[styles.box, { marginTop: Spacing.sm, backgroundColor: Colors.mint + '10' }] as any}>
                <Text style={styles.label}>GÉOLOCALISATION</Text>
                <Text style={styles.geoCoords}>{selected.location.coordinates[1].toFixed(5)}, {selected.location.coordinates[0].toFixed(5)}</Text>
              </GlassCard>
            )}
            <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
              {selected.status === 'ouverte' && <Button label="Marquer comme résolu" icon="check" onPress={() => handleResolve(selected._id)} />}
              <Button label="Supprimer" icon="trash" variant="danger" onPress={() => handleDelete(selected._id)} />
            </View>
          </View>
        )}
      </Sheet>
    </Screen>
  );
}
const styles = StyleSheet.create({
  toggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryDim, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary + '30' },
  card: { padding: Spacing.md, paddingLeft: Spacing.md + 4 },
  leftBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: Radius.lg, borderBottomLeftRadius: Radius.lg },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  icon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryDim, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.sm, marginBottom: 6 },
  pillText: { color: Colors.primary, fontSize: 11, fontWeight: FontWeight.bold },
  desc: { color: Colors.text, fontSize: 14, fontWeight: FontWeight.semibold, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.glassLine },
  agent: { fontSize: 12, color: Colors.text, fontWeight: FontWeight.semibold },
  time: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  geo: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.mint + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
  geoText: { color: Colors.mint, fontSize: 10, fontFamily: 'monospace' },
  itemBig: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, marginBottom: Spacing.md },
  itemBigIcon: { width: 46, height: 46, borderRadius: Radius.md, backgroundColor: Colors.primaryDim, alignItems: 'center', justifyContent: 'center' },
  itemBigLabel: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.primary, letterSpacing: 1.2 },
  itemBigName: { fontSize: 16, fontWeight: FontWeight.bold, color: Colors.text, marginTop: 2 },
  box: { padding: Spacing.md },
  label: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 1.2 },
  val: { fontSize: 14, color: Colors.text, marginTop: 6, fontWeight: FontWeight.semibold },
  sub: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },
  geoCoords: { fontSize: 13, color: Colors.mint, fontFamily: 'monospace', marginTop: 6, fontWeight: FontWeight.bold },
});