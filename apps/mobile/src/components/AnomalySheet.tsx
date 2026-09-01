import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { Sheet, Field, Button } from './ui';
import { AnomaliesAPI } from '../services/api';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontWeight } from '../utils/theme';

interface Props { visible: boolean; onClose: () => void; eventId: string; itemId?: string; itemName?: string; }

export default function AnomalySheet({ visible, onClose, eventId, itemId, itemName }: Props) {
  const [description, setDescription] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('Localisation…');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (visible) { setDescription(''); setCoords(null); setGpsStatus('Localisation…'); captureLocation(); }
  }, [visible]);

  const captureLocation = async () => {
    setGpsStatus('Localisation…');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setGpsStatus('GPS refusé — anomalie enregistrée sans position'); return; }

      // Try last-known first (instant), then a fresh fix with a timeout so the
      // UI never hangs on "Localisation…" (common on emulators without a mock位置).
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        setCoords({ lat: lastKnown.coords.latitude, lng: lastKnown.coords.longitude });
        setGpsStatus('Position capturée');
      }

      const fresh = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
      ]);

      if (fresh) {
        setCoords({ lat: fresh.coords.latitude, lng: fresh.coords.longitude });
        setGpsStatus('Position capturée');
      } else if (!lastKnown) {
        setGpsStatus('GPS indisponible — vérifiez la localisation de l\'émulateur');
      }
    } catch {
      setGpsStatus('GPS indisponible');
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) { Alert.alert('Description requise', 'Veuillez décrire l\'anomalie.'); return; }
    setLoading(true);
    try {
      await AnomaliesAPI.create(eventId, {
        description: description.trim(),
        itemId: itemId || undefined,
        itemName: itemName || undefined,
        location: coords ? { type: 'Point', coordinates: [coords.lng, coords.lat] } : undefined,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Anomalie déclarée', 'L\'anomalie a été enregistrée.');
      queryClient.invalidateQueries({ queryKey: ['anomalies', eventId] });
      onClose();
    } catch (e: any) { Alert.alert('Erreur', e?.response?.data?.error || 'Impossible'); }
    finally { setLoading(false); }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Déclarer une anomalie" subtitle={itemName}>
      {itemName && (
        <View style={styles.itemBox}>
          <Text style={styles.itemLabel}>ÉQUIPEMENT CONCERNÉ</Text>
          <Text style={styles.itemName}>{itemName}</Text>
        </View>
      )}
      <Field label="Description de l'anomalie" value={description} onChangeText={setDescription}
        placeholder="Ex: Câble endommagé, boîtier fissuré…" autoCapitalize="sentences" multiline icon="alert" />
      <View style={styles.gpsBox}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.gpsLabel}>GÉOLOCALISATION</Text>
          <Text style={styles.gpsRetry} onPress={captureLocation}>Réessayer</Text>
        </View>
        <Text style={styles.gpsStatus}>{gpsStatus}</Text>
        {coords && <Text style={styles.gpsCoords}>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</Text>}
      </View>
      <View style={{ marginTop: Spacing.md, flexDirection: 'row', gap: Spacing.sm }}>
        <Button label="Annuler" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
        <Button label="Déclarer" variant="danger" onPress={handleSubmit} loading={loading} style={{ flex: 2 }} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  itemBox: { padding: Spacing.md, backgroundColor: Colors.primaryDim, borderRadius: Radius.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '30' },
  itemLabel: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.primary, letterSpacing: 1.2 },
  itemName: { fontSize: 15, fontWeight: FontWeight.bold, color: Colors.text, marginTop: 4 },
  gpsBox: { padding: Spacing.md, backgroundColor: Colors.mint + '12', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.mint + '30' },
  gpsLabel: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 1.2 },
  gpsRetry: { fontSize: 11, fontWeight: FontWeight.bold, color: Colors.primary },
  gpsStatus: { fontSize: 12, color: Colors.teal, marginTop: 4, fontWeight: FontWeight.semibold },
  gpsCoords: { fontSize: 12, color: Colors.teal, fontFamily: 'monospace', marginTop: 2 },
});
