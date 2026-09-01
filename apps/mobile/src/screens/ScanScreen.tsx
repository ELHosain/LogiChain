import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Animated, Easing } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontWeight, Blur } from '../utils/theme';
import Screen from '../components/Screen';
import { Button, StatusBadge, EmptyState, GlassCard, Icon } from '../components/ui';
import { useItems } from '../hooks/useItems';
import { useEventStore } from '../store';
import { Item, ItemStatus } from '../types';
import { STATUS_LABELS, CATEGORY_LABELS } from '../utils/helpers';

const ALL: ItemStatus[] = ['stocké', 'en_transit', 'livré', 'en_maintenance', 'archivé'];

async function playBeep() {
  try { const { Audio } = require('expo-av'); const { sound } = await Audio.Sound.createAsync({ uri: 'https://cdn.pixabay.com/audio/2022/03/24/audio_805cb7fe34.mp3' }); await sound.playAsync(); } catch {}
}

export default function ScanScreen() {
  const { selectedEventId } = useEventStore();
  const { items, scanItem } = useItems(selectedEventId ?? '');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [foundItem, setFoundItem] = useState<Item | null>(null);
  const scanLine = useRef(new Animated.Value(0)).current;

  useEffect(() => { if (!permission?.granted) requestPermission(); }, []);
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scanLine, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(scanLine, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    loop.start(); return () => loop.stop();
  }, []);

  if (!selectedEventId) return <Screen><EmptyState icon="camera" title="Aucun événement" message="Sélectionnez un événement" /></Screen>;

  const handleBarcode = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); playBeep();
    const item = items.find(i => i._id === data || i.name === data);
    if (item) setFoundItem(item);
    else Alert.alert('Item introuvable', 'Aucun équipement ne correspond.', [{ text: 'Réessayer', onPress: () => setScanned(false) }]);
  };

  const handleAction = (next: ItemStatus) => {
    if (!foundItem) return;
    scanItem({ item: foundItem, newStatus: next });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Scan validé', `${foundItem.name} → ${STATUS_LABELS[next]}`, [{ text: 'OK', onPress: () => { setFoundItem(null); setScanned(false); } }]);
  };

  if (!permission) return <Screen />;
  if (!permission.granted) return (
    <Screen><EmptyState icon="camera" title="Accès caméra requis" message="LogiChain a besoin de la caméra pour scanner"
      action={<View style={{ marginTop: Spacing.md }}><Button label="Autoriser" icon="camera" onPress={requestPermission} /></View>} /></Screen>
  );

  if (foundItem) {
    return (
      <Screen>
        <View style={styles.resultWrap}>
          <GlassCard strong style={styles.resultCard}>
            <View style={styles.resultCheck}><Icon name="check" size={32} color={Colors.green} strokeWidth={3} /></View>
            <Text style={styles.resultLabel}>ÉQUIPEMENT SCANNÉ</Text>
            <Text style={styles.resultName}>{foundItem.name}</Text>
            <Text style={styles.resultCat}>{CATEGORY_LABELS[foundItem.category]}</Text>
            <View style={{ marginVertical: Spacing.md }}><StatusBadge status={foundItem.status} /></View>
            <View style={styles.actions}>
              <Text style={styles.actionsLabel}>CHANGER LE STATUT</Text>
              {ALL.filter(s => s !== foundItem.status).map(next => (
                <Button key={next} label={STATUS_LABELS[next]} onPress={() => handleAction(next)} variant="secondary" style={{ marginBottom: Spacing.sm }} />
              ))}
              <Button label="Annuler" variant="ghost" onPress={() => { setFoundItem(null); setScanned(false); }} />
            </View>
          </GlassCard>
        </View>
      </Screen>
    );
  }

  const translateY = scanLine.interpolate({ inputRange: [0, 1], outputRange: [0, 230] });
  return (
    <View style={styles.root}>
      <CameraView style={StyleSheet.absoluteFill} barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'ean13', 'code39'] }} onBarcodeScanned={scanned ? undefined : handleBarcode} />
      <View style={styles.overlay}>
        <BlurView intensity={Blur.medium} tint="dark" style={styles.scanHeader}>
          <Text style={styles.scanTitle}>Scanner un équipement</Text>
          <Text style={styles.scanSub}>Alignez le QR code dans le cadre</Text>
        </BlurView>
        <View style={styles.frameWrap}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.tl]} /><View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} /><View style={[styles.corner, styles.br]} />
            <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
          </View>
        </View>
        <View style={styles.scanFooter}>
          {scanned
            ? <Button label="Scanner à nouveau" icon="sync" onPress={() => setScanned(false)} />
            : <BlurView intensity={Blur.medium} tint="dark" style={styles.hint}><Icon name="camera" size={15} color="#fff" /><Text style={styles.hintText}>Recherche de QR code…</Text></BlurView>}
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', paddingVertical: 80 },
  scanHeader: { alignItems: 'center', marginHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden' },
  scanTitle: { fontSize: 20, fontWeight: FontWeight.bold, color: '#fff' },
  scanSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  frameWrap: { alignItems: 'center', justifyContent: 'center' },
  frame: { width: 250, height: 250 },
  corner: { position: 'absolute', width: 36, height: 36, borderColor: Colors.primary, borderWidth: 4 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 14 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 14 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 14 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 14 },
  scanLine: { position: 'absolute', left: 8, right: 8, height: 2.5, backgroundColor: Colors.primary, borderRadius: 2, shadowColor: Colors.primary, shadowOpacity: 0.8, shadowRadius: 8 },
  scanFooter: { alignItems: 'center', paddingHorizontal: Spacing.lg },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, overflow: 'hidden' },
  hintText: { color: '#fff', fontSize: 13, fontWeight: FontWeight.medium },
  resultWrap: { flex: 1, justifyContent: 'center', padding: Spacing.lg },
  resultCard: { padding: Spacing.lg, alignItems: 'center' },
  resultCheck: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.greenDim, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  resultLabel: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 1.2 },
  resultName: { fontSize: 20, fontWeight: FontWeight.bold, color: Colors.text, marginTop: 4, textAlign: 'center' },
  resultCat: { fontSize: 13, color: Colors.textSoft, marginTop: 4 },
  actions: { width: '100%', marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.glassLine, paddingTop: Spacing.md },
  actionsLabel: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 1.2, marginBottom: Spacing.sm },
});
