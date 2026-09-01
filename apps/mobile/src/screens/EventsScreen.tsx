import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Colors, Spacing, Radius, FontWeight } from '../utils/theme';
import Screen from '../components/Screen';
import { GlassCard, EmptyState, FAB, Sheet, Field, Button, IconButton, ScreenHeader, AnimatedPressable, Icon, Badge } from '../components/ui';
import CreateEventSheet from '../components/CreateEventSheet';
import { useEvents, useUpdateEvent } from '../hooks/useEvents';
import { useAuthStore, useEventStore } from '../store';
import { canCreateEvent, canEditEvent, canDeleteEvent, EventsAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Event } from '../types';

export default function EventsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { selectedEventId, setSelectedEventId } = useEventStore();
  const { data: events = [], isLoading, refetch } = useEvents();
  const [showCreate, setShowCreate] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [editName, setEditName] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [saving, setSaving] = useState(false);
  const updateEvent = useUpdateEvent();
  const queryClient = useQueryClient();

  const canCreate = canCreateEvent(user?.role);
  const canEdit = canEditEvent(user?.role);
  const canDelete = canDeleteEvent(user?.role);

  const openEdit = (ev: Event) => { setEditEvent(ev); setEditName(ev.name); setEditStart(ev.startDate?.split('T')[0]||''); setEditEnd(ev.endDate?.split('T')[0]||''); };

  const handleSaveEdit = () => {
    if (!editEvent || !editName.trim()) return;
    setSaving(true);
    updateEvent.mutate({ id: editEvent._id, data: { name: editName.trim(), startDate: editStart, endDate: editEnd } }, {
      onSuccess: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setEditEvent(null); setSaving(false); },
      onError: (err: any) => { Alert.alert('Erreur', err?.response?.data?.error || 'Impossible'); setSaving(false); },
    });
  };

  const handleDelete = (ev: Event) => {
    Alert.alert('Supprimer ?', `"${ev.name}" sera supprimé.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await EventsAPI.remove(ev._id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (selectedEventId === ev._id) setSelectedEventId(null);
          queryClient.invalidateQueries({ queryKey: ['events'] });
        } catch (err: any) { Alert.alert('Erreur', err?.response?.data?.error || 'Impossible'); }
      }},
    ]);
  };

  return (
    <Screen>
      <ScreenHeader title="Événements" subtitle={canCreate ? 'Gérez vos événements' : 'Sélectionnez un événement'} />
      <FlatList
        data={events} keyExtractor={e => e._id}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
        ListEmptyComponent={<EmptyState icon="tent" title="Aucun événement" message={canCreate ? 'Créez votre premier événement' : 'Aucun événement disponible'} />}
        renderItem={({ item }) => {
          const selected = item._id === selectedEventId;
          return (
            <AnimatedPressable onPress={() => { setSelectedEventId(item._id); navigation?.navigate?.('Dashboard'); }} scaleTo={0.98} style={{ marginBottom: Spacing.md }}>
              <GlassCard strong style={[styles.card, selected && styles.cardSelected] as any}>
                <View style={styles.cardHead}>
                  <View style={styles.iconBox}><Icon name="tent" size={22} color={Colors.primary} /></View>
                  <View style={styles.actions}>
                    {canEdit && <IconButton icon="edit" onPress={() => openEdit(item)} />}
                    {canDelete && <IconButton icon="trash" variant="danger" onPress={() => handleDelete(item)} />}
                    {selected && <View style={styles.check}><Icon name="check" size={15} color="#fff" strokeWidth={3} /></View>}
                  </View>
                </View>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.dateRow}>
                  <Icon name="calendar" size={13} color={Colors.textMuted} />
                  <Text style={styles.date}>{formatDate(item.startDate)} → {formatDate(item.endDate)}</Text>
                </View>
                <View style={styles.stats}>
                  <View style={styles.chip}><Icon name="mappin" size={12} color={Colors.textSoft} /><Text style={styles.chipText}>{item.zones?.length ?? 0} zone(s)</Text></View>
                  <View style={styles.chip}><Icon name="leaf" size={12} color={Colors.mint} /><Text style={[styles.chipText, { color: Colors.mint }]}>{item.carbonFootprint?.toFixed(0) ?? 0} kg</Text></View>
                </View>
              </GlassCard>
            </AnimatedPressable>
          );
        }}
      />
      {canCreate && <FAB onPress={() => setShowCreate(true)} />}
      <CreateEventSheet visible={showCreate} onClose={() => setShowCreate(false)} onCreated={refetch} />
      <Sheet visible={!!editEvent} onClose={() => setEditEvent(null)} title="Modifier l'événement">
        <Field label="Nom" value={editName} onChangeText={setEditName} autoCapitalize="sentences" icon="tent" />
        <Field label="Date de début" value={editStart} onChangeText={setEditStart} placeholder="2026-07-15" helper="AAAA-MM-JJ" icon="calendar" />
        <Field label="Date de fin" value={editEnd} onChangeText={setEditEnd} placeholder="2026-07-18" helper="AAAA-MM-JJ" icon="calendar" />
        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
          <Button label="Annuler" variant="ghost" onPress={() => setEditEvent(null)} style={{ flex: 1 }} />
          <Button label="Enregistrer" onPress={handleSaveEdit} loading={saving} style={{ flex: 2 }} />
        </View>
      </Sheet>
    </Screen>
  );
}
const styles = StyleSheet.create({
  card: { padding: Spacing.md },
  cardSelected: { borderColor: Colors.primary, borderWidth: 2 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: { width: 46, height: 46, borderRadius: Radius.md, backgroundColor: Colors.primaryDim, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' },
  check: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 17, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing.sm },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  date: { fontSize: 12, color: Colors.textMuted },
  stats: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.glassSoft, paddingHorizontal: 11, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.glassLine },
  chipText: { fontSize: 11, color: Colors.textSoft, fontWeight: FontWeight.semibold },
});
