import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, Typography, FontWeight } from '../utils/theme';
import Screen from '../components/Screen';
import Avatar from '../components/Avatar';
import { GlassCard, Button, EmptyState, SectionHeader, Badge, Icon } from '../components/ui';
import { db } from '../services/database';
import { syncService } from '../services/sync';
import { useNetworkStore, useQueueStore, useAuthStore } from '../store';
import { QueuedAction } from '../types';
import { formatDateTime } from '../utils/helpers';

export default function SyncScreen() {
  const { isOnline } = useNetworkStore();
  const { pendingCount, isSyncing, setPendingCount, setIsSyncing } = useQueueStore();
  const { user, clearAuth } = useAuthStore();
  const [queue, setQueue] = useState<QueuedAction[]>([]);

  const loadQueue = useCallback(async () => { const q = await db.getPendingQueue(); setQueue(q); setPendingCount(q.length); }, []);
  useEffect(() => { loadQueue(); }, []);

  const forceSync = async () => { if (!isOnline()) return; setIsSyncing(true); await syncService.syncPendingActions(); setIsSyncing(false); await loadQueue(); };
  const online = isOnline();
  const synced = pendingCount === 0;

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={loadQueue} tintColor={Colors.primary} />} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={Typography.h1}>Synchronisation</Text></View>
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <View style={styles.statusCard}>
            <LinearGradient colors={online ? ['#10B981', '#0EA5C4'] : ['#F59E0B', '#EF4455']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.statusGrad}>
              <View style={styles.statusIcon}><Icon name={online ? 'wifi' : 'wifioff'} size={26} color="#fff" /></View>
              <Text style={styles.statusTitle}>{online ? 'Connecté' : 'Hors-ligne'}</Text>
              <Text style={styles.statusSub}>{synced ? 'Tout est synchronisé' : `${pendingCount} action(s) en attente`}</Text>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: synced ? '100%' : '35%' }]} /></View>
            </LinearGradient>
          </View>
        </View>

        {pendingCount > 0 && (
          <View style={{ paddingHorizontal: Spacing.lg, marginTop: Spacing.md }}>
            <Button label={isSyncing ? 'Synchronisation…' : `Forcer la sync (${pendingCount})`} icon="sync" onPress={forceSync} loading={isSyncing} disabled={!online} fullWidth />
          </View>
        )}

        <SectionHeader title={`File d'attente (${queue.length})`} />
        {queue.length === 0 ? (
          <EmptyState icon="check" title="File vide" message="Toutes vos actions sont synchronisées" />
        ) : (
          <View style={{ paddingHorizontal: Spacing.lg }}>
            {queue.map(a => (
              <GlassCard key={a.id} strong style={styles.qCard}>
                <View style={styles.qIcon}><Icon name={a.type === 'SCAN_ITEM' ? 'camera' : 'alert'} size={18} color={Colors.primary} /></View>
                <View style={{ flex: 1 }}><Text style={styles.qType}>{a.type === 'SCAN_ITEM' ? 'Scan équipement' : 'Anomalie'}</Text><Text style={styles.qTime}>{formatDateTime(a.createdAt)}</Text></View>
                <Badge label={a.retryCount > 0 ? `${a.retryCount} essai(s)` : 'En attente'} color={a.retryCount > 0 ? Colors.orange : Colors.textMuted} small />
              </GlassCard>
            ))}
          </View>
        )}

        <SectionHeader title="Session" />
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <GlassCard strong style={styles.userCard}>
            <View style={styles.userRow}>
              <Avatar name={user?.name} size="lg" />
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={{ marginTop: 6 }}><Badge label={(user?.role || '').toUpperCase()} color={Colors.primary} small /></View>
              </View>
            </View>
            <View style={{ marginTop: Spacing.md }}><Button label="Se déconnecter" icon="power" variant="danger" onPress={clearAuth} fullWidth /></View>
          </GlassCard>
        </View>
      </ScrollView>
    </Screen>
  );
}
const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  statusCard: { borderRadius: Radius.lg, overflow: 'hidden' },
  statusGrad: { padding: Spacing.lg, alignItems: 'center' },
  statusIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  statusTitle: { fontSize: 18, fontWeight: FontWeight.bold, color: '#fff' },
  statusSub: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  progressTrack: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: Radius.full, overflow: 'hidden', marginTop: Spacing.md },
  progressFill: { height: 6, borderRadius: Radius.full, backgroundColor: '#fff' },
  qCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, marginBottom: Spacing.sm },
  qIcon: { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.primaryDim, alignItems: 'center', justifyContent: 'center' },
  qType: { fontSize: 14, fontWeight: FontWeight.semibold, color: Colors.text },
  qTime: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  userCard: { padding: Spacing.md },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  userName: { fontSize: 16, fontWeight: FontWeight.bold, color: Colors.text },
  userEmail: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
});
