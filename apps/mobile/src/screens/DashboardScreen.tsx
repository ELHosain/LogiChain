import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, Typography, Shadows, FontWeight } from '../utils/theme';
import Screen from '../components/Screen';
import Avatar from '../components/Avatar';
import StatBar from '../components/StatBar';
import { GlassCard, KpiCard, EmptyState, SectionHeader, Skeleton, Icon } from '../components/ui';
import { useDashboard } from '../hooks/useDashboard';
import { useAuthStore, useEventStore } from '../store';
import { formatCarbon, STATUS_LABELS } from '../utils/helpers';
import { ItemStatus } from '../types';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { selectedEventId } = useEventStore();
  const { data: kpi, isLoading, refetch } = useDashboard(selectedEventId ?? '');

  if (!selectedEventId) return <Screen><EmptyState icon="grid" title="Aucun événement" message="Choisissez un événement dans l'onglet Événements" /></Screen>;

  const level = kpi && kpi.bottleneck > 3 ? 'high' : kpi && kpi.bottleneck > 1 ? 'medium' : 'low';
  const bColor = level === 'high' ? Colors.red : level === 'medium' ? Colors.orange : Colors.green;

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greet}>Bonjour, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.subGreet}>État de l'événement en direct</Text>
          </View>
          <Avatar name={user?.name} size="md" />
        </View>

        {isLoading && !kpi ? (
          <View style={{ paddingHorizontal: Spacing.lg }}>
            <Skeleton height={150} /><View style={{ flexDirection: 'row', gap: Spacing.sm }}><Skeleton height={100} style={{ flex: 1 }} /><Skeleton height={100} style={{ flex: 1 }} /></View>
          </View>
        ) : kpi ? (
          <>
            <View style={{ paddingHorizontal: Spacing.lg }}>
              <View style={[styles.hero, Shadows.glow]}>
                <LinearGradient colors={['#2563EB', '#3B82F6', '#0EA5C4']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.heroGrad}>
                  <View style={styles.heroTop}>
                    <View style={styles.heroIcon}><Icon name="leaf" size={22} color="#fff" /></View>
                    <Text style={styles.heroLabel}>EMPREINTE CARBONE</Text>
                  </View>
                  <Text style={styles.heroValue}>{kpi.totalCarbon.toFixed(1)}<Text style={styles.heroUnit}> kg CO₂</Text></Text>
                  <Text style={styles.heroSub}>Sur {kpi.totalItems} équipement{kpi.totalItems > 1 ? 's' : ''} suivis en temps réel</Text>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.kpiRow}>
              <KpiCard label="Total items" value={kpi.totalItems} color={Colors.primary} icon="box" />
              <View style={{ width: Spacing.sm }} />
              <KpiCard label="En transit" value={kpi.bottleneck} color={bColor} icon="truck" trend={level === 'high' ? 'Goulot' : level === 'medium' ? 'Modéré' : 'Fluide'} />
            </View>

            <SectionHeader title="Répartition des stocks" />
            <GlassCard style={styles.section}>
              {kpi.stock.map(s => <StatBar key={s._id} label={STATUS_LABELS[s._id as ItemStatus] || s._id} value={s.count} max={kpi.totalItems} color={Colors.status[s._id as ItemStatus] || Colors.textMuted} />)}
            </GlassCard>

            <SectionHeader title="Empreinte par catégorie" />
            <GlassCard style={styles.section}>
              {kpi.carbonByCategory.map((c, idx) => (
                <View key={c._id}>
                  {idx > 0 && <View style={styles.divider} />}
                  <View style={styles.carbonRow}>
                    <View style={[styles.carbonDot, { backgroundColor: Colors.category[c._id as keyof typeof Colors.category] || Colors.textMuted }]} />
                    <Text style={styles.carbonName}>{c._id}</Text>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.carbonVal}>{formatCarbon(c.totalCarbon)}</Text>
                      <Text style={styles.carbonCount}>{c.count} item{c.count > 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </GlassCard>

            {kpi.bottleneck > 2 && (
              <View style={{ paddingHorizontal: Spacing.lg, marginTop: Spacing.md }}>
                <GlassCard style={[styles.warn, { borderColor: Colors.orange + '40' }] as any}>
                  <View style={styles.warnIcon}><Icon name="alert" size={20} color={Colors.orange} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.warnTitle}>Goulot d'étranglement</Text>
                    <Text style={styles.warnText}>{kpi.bottleneck} items bloqués en transit</Text>
                  </View>
                </GlassCard>
              </View>
            )}
          </>
        ) : <EmptyState icon="grid" message="Chargement…" />}
      </ScrollView>
    </Screen>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.md },
  greet: { ...Typography.h1 }, subGreet: { ...Typography.body, marginTop: 2 },
  hero: { borderRadius: Radius.lg, overflow: 'hidden' },
  heroGrad: { padding: Spacing.lg },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  heroIcon: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroLabel: { fontSize: 10, fontWeight: FontWeight.black, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.3 },
  heroValue: { fontSize: 42, fontWeight: FontWeight.black, color: '#fff', letterSpacing: -1.5 },
  heroUnit: { fontSize: 16, fontWeight: FontWeight.regular, color: 'rgba(255,255,255,0.8)' },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  kpiRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginTop: Spacing.md },
  section: { marginHorizontal: Spacing.lg, padding: Spacing.md },
  divider: { height: 1, backgroundColor: Colors.glassLine, marginVertical: 4 },
  carbonRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10 },
  carbonDot: { width: 10, height: 10, borderRadius: 5 },
  carbonName: { flex: 1, fontSize: 13, color: Colors.textSoft, textTransform: 'capitalize', fontWeight: FontWeight.medium },
  carbonVal: { fontSize: 14, fontWeight: FontWeight.bold, color: Colors.mint },
  carbonCount: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  warn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, backgroundColor: Colors.orangeDim },
  warnIcon: { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.orange + '20', alignItems: 'center', justifyContent: 'center' },
  warnTitle: { fontSize: 13, fontWeight: FontWeight.bold, color: Colors.orange },
  warnText: { fontSize: 11, color: Colors.textSoft, marginTop: 2 },
});
