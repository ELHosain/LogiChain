import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Colors, Spacing, Radius, FontWeight } from '../utils/theme';
import Screen from '../components/Screen';
import { GlassCard, StatusBadge, CategoryBadge, EmptyState, NetworkBanner, FAB, Sheet, Button, ScreenHeader, SearchBar, FilterChips, SectionHeader, AnimatedPressable, Icon } from '../components/ui';
import CreateItemSheet from '../components/CreateItemSheet';
import AnomalySheet from '../components/AnomalySheet';
import { useItems } from '../hooks/useItems';
import { useNetwork } from '../hooks/useNetwork';
import { useAlerts } from '../hooks/useAlerts';
import { useQueueStore, useEventStore, useAuthStore } from '../store';
import { canCreateItem, ItemsAPI } from '../services/api';
import { Item, ItemStatus } from '../types';
import { STATUS_LABELS, CATEGORY_LABELS, formatCarbon, formatDateTime } from '../utils/helpers';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

const ALL: ItemStatus[] = ['stocké', 'en_transit', 'livré', 'en_maintenance', 'archivé'];

export default function ItemsScreen() {
  const { selectedEventId } = useEventStore();
  const { user } = useAuthStore();
  const { isOnline } = useNetwork();
  const { pendingCount } = useQueueStore();
  const { alerts } = useAlerts(selectedEventId);
  const [filter, setFilter] = useState<ItemStatus | 'tous'>('tous');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [anomalyItem, setAnomalyItem] = useState<Item | null>(null);
  const queryClient = useQueryClient();
  const { items, isLoading, refetch, scanItem } = useItems(selectedEventId ?? '');

  useEffect(() => {
    const l = alerts[0];
    if (l && l.type === 'ITEM_SCANNED') {
      queryClient.invalidateQueries({ queryKey: ['items', selectedEventId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', selectedEventId] });
    }
  }, [alerts, selectedEventId]);

  const filtered = useMemo(() => {
    let r = filter === 'tous' ? items : items.filter(i => i.status === filter);
    if (search.trim()) { const q = search.toLowerCase().trim(); r = r.filter(i => i.name.toLowerCase().includes(q)); }
    return r;
  }, [items, filter, search]);

  const counts = useMemo(() => { const c: any = { tous: items.length }; ALL.forEach(s => c[s] = items.filter(i => i.status === s).length); return c; }, [items]);
  const filterOptions = [{ value: 'tous' as const, label: 'Tous', count: counts.tous }, ...ALL.map(s => ({ value: s, label: STATUS_LABELS[s], count: counts[s] }))];
  const canCreate = canCreateItem(user?.role);

  if (!selectedEventId) return <Screen><EmptyState icon="box" title="Aucun événement" message="Sélectionnez un événement" /></Screen>;

  const handleChangeStatus = (item: Item, s: ItemStatus) => { scanItem({ item, newStatus: s }); setSelectedItem(null); };
  const handleDelete = (item: Item) => {
    Alert.alert('Supprimer ?', `"${item.name}" sera supprimé.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await ItemsAPI.remove(selectedEventId!, item._id); await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          queryClient.invalidateQueries({ queryKey: ['items', selectedEventId] }); queryClient.invalidateQueries({ queryKey: ['dashboard', selectedEventId] }); setSelectedItem(null);
        } catch (err: any) { Alert.alert('Erreur', err?.response?.data?.error || 'Impossible'); }
      }},
    ]);
  };
  const handleDeclareAnomaly = () => { const it = selectedItem; if (!it) return; setSelectedItem(null); setTimeout(() => setAnomalyItem(it), 350); };

  return (
    <Screen>
      <NetworkBanner isOnline={isOnline} pendingCount={pendingCount} />
      <ScreenHeader title="Items" subtitle={`${items.length} équipement${items.length > 1 ? 's' : ''}`} />
      <View style={{ marginBottom: Spacing.sm }}><SearchBar value={search} onChangeText={setSearch} placeholder="Rechercher un item…" /></View>
      <FilterChips options={filterOptions} value={filter} onChange={setFilter} />
      <FlatList
        data={filtered} keyExtractor={i => i._id}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
        ListEmptyComponent={<EmptyState icon={search ? 'search' : 'box'} message={search ? 'Aucun résultat' : 'Aucun item dans cette catégorie'} />}
        renderItem={({ item }) => (
          <AnimatedPressable onPress={() => setSelectedItem(item)} scaleTo={0.98} style={{ marginBottom: Spacing.md }}>
            <GlassCard strong style={styles.card}>
              <View style={styles.cardHead}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={{ marginTop: 6 }}><CategoryBadge category={item.category} /></View>
                </View>
                <StatusBadge status={item.status} optimistic={item._optimistic} />
              </View>
              <View style={styles.meta}>
                <View style={styles.metaItem}><Text style={styles.metaLabel}>CARBONE</Text><Text style={styles.metaVal}>{formatCarbon(item.carbonKg)}</Text></View>
                <View style={styles.metaDiv} />
                <View style={styles.metaItem}><Text style={styles.metaLabel}>VERSION</Text><Text style={styles.metaVal}>v{item.version}</Text></View>
                <View style={styles.metaDiv} />
                <View style={styles.metaItem}><Text style={styles.metaLabel}>ACTIONS</Text><Text style={styles.metaVal}>{item.history?.length || 0}</Text></View>
              </View>
            </GlassCard>
          </AnimatedPressable>
        )}
      />
      {canCreate && <FAB onPress={() => setShowCreate(true)} />}
      <CreateItemSheet visible={showCreate} onClose={() => setShowCreate(false)} eventId={selectedEventId} />
      <Sheet visible={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem?.name || ''} subtitle={selectedItem ? CATEGORY_LABELS[selectedItem.category] : undefined}>
        {selectedItem && (
          <View>
            <View style={styles.detailGrid}>
              <GlassCard strong style={styles.detailBox}><Text style={styles.detailLabel}>STATUT</Text><View style={{ marginTop: 6 }}><StatusBadge status={selectedItem.status} /></View></GlassCard>
              <GlassCard strong style={styles.detailBox}><Text style={styles.detailLabel}>VERSION</Text><Text style={styles.detailVal}>v{selectedItem.version}</Text></GlassCard>
              <GlassCard strong style={styles.detailBox}><Text style={styles.detailLabel}>CARBONE</Text><Text style={[styles.detailVal, { color: Colors.mint }]}>{formatCarbon(selectedItem.carbonKg)}</Text></GlassCard>
            </View>
            {selectedItem.history && selectedItem.history.length > 0 && (
              <>
                <SectionHeader title={`Historique (${selectedItem.history.length})`} />
                <View style={{ paddingHorizontal: Spacing.xs }}>
                  {selectedItem.history.slice().reverse().map((h: any, idx: number) => (
                    <View key={idx} style={styles.tRow}>
                      <View style={styles.tLeft}>
                        <View style={[styles.tDot, { backgroundColor: Colors.status[h.status as ItemStatus] || Colors.textMuted }]} />
                        {idx < selectedItem.history.length - 1 && <View style={styles.tLine} />}
                      </View>
                      <View style={{ flex: 1, paddingBottom: Spacing.sm }}>
                        <Text style={[styles.tStatus, { color: Colors.status[h.status as ItemStatus] || Colors.text }]}>→ {STATUS_LABELS[h.status as ItemStatus] || h.status}</Text>
                        <Text style={styles.tDate}>{formatDateTime(h.timestamp)}</Text>
                        {h.note && <Text style={styles.tNote}>{h.note}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
            <SectionHeader title="Changer le statut" />
            <View style={styles.statusGrid}>
              {ALL.filter(s => s !== selectedItem.status).map(s => {
                const c = Colors.status[s];
                return (
                  <AnimatedPressable key={s} onPress={() => handleChangeStatus(selectedItem, s)} scaleTo={0.94} style={[styles.statusBtn, { borderColor: c + '55', backgroundColor: c + '14' }]}>
                    <View style={[styles.sDot, { backgroundColor: c }]} /><Text style={[styles.statusBtnText, { color: c }]}>{STATUS_LABELS[s]}</Text>
                  </AnimatedPressable>
                );
              })}
            </View>
            <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
              <Button label="Déclarer une anomalie" icon="alert" variant="secondary" onPress={handleDeclareAnomaly} />
              <Button label="Supprimer cet item" icon="trash" variant="danger" onPress={() => handleDelete(selectedItem)} />
            </View>
          </View>
        )}
      </Sheet>
      <AnomalySheet visible={!!anomalyItem} onClose={() => setAnomalyItem(null)} eventId={selectedEventId} itemId={anomalyItem?._id} itemName={anomalyItem?.name} />
    </Screen>
  );
}
const styles = StyleSheet.create({
  card: { padding: Spacing.md },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  name: { fontSize: 15, fontWeight: FontWeight.bold, color: Colors.text, letterSpacing: -0.2 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.glassLine },
  metaItem: { flex: 1, alignItems: 'center' },
  metaLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: FontWeight.bold, letterSpacing: 0.8, marginBottom: 3 },
  metaVal: { fontSize: 13, color: Colors.text, fontWeight: FontWeight.bold },
  metaDiv: { width: 1, height: 24, backgroundColor: Colors.glassLine },
  detailGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  detailBox: { flex: 1, padding: Spacing.md, alignItems: 'center', gap: 4 },
  detailLabel: { fontSize: 9, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 1 },
  detailVal: { fontSize: 15, fontWeight: FontWeight.bold, color: Colors.text },
  tRow: { flexDirection: 'row', gap: Spacing.sm },
  tLeft: { alignItems: 'center', width: 12 },
  tDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  tLine: { width: 2, flex: 1, backgroundColor: Colors.glassLine, marginTop: 2 },
  tStatus: { fontSize: 12, fontWeight: FontWeight.bold },
  tDate: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },
  tNote: { color: Colors.textSoft, fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statusBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1.5 },
  sDot: { width: 8, height: 8, borderRadius: 4 },
  statusBtnText: { fontSize: 13, fontWeight: FontWeight.bold },
});
