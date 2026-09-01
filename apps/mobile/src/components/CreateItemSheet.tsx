// src/components/CreateItemSheet.tsx
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Sheet, Field, Button, SelectField } from './ui';
import { ItemsAPI } from '../services/api';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Spacing, Colors } from '../utils/theme';

interface Props { visible: boolean; onClose: () => void; eventId: string; }

const CATEGORY_OPTIONS = [
  { value: 'energie',   label: 'Énergie',   color: Colors.category.energie },
  { value: 'scene',     label: 'Scène',     color: Colors.category.scene },
  { value: 'son',       label: 'Son',       color: Colors.category.son },
  { value: 'lumiere',   label: 'Lumière',   color: Colors.category.lumiere },
  { value: 'securite',  label: 'Sécurité',  color: Colors.category.securite },
  { value: 'sanitaire', label: 'Sanitaire', color: Colors.category.sanitaire },
  { value: 'autre',     label: 'Autre',     color: Colors.category.autre },
];

export default function CreateItemSheet({ visible, onClose, eventId }: Props) {
  const [name, setName]         = useState('');
  const [category, setCategory] = useState('son');
  const [carbon, setCarbon]     = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);
  const queryClient = useQueryClient();

  const reset = () => { setName(''); setCategory('son'); setCarbon(''); setErrors({}); };

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Le nom est obligatoire";
    if (carbon && isNaN(parseFloat(carbon))) e.carbon = "Doit être un nombre";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      await ItemsAPI.create(eventId, { name: name.trim(), category, carbonKg: parseFloat(carbon) || 0 });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Item créé', `${name} a été ajouté avec succès.`);
      queryClient.invalidateQueries({ queryKey: ['items', eventId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', eventId] });
      reset();
      onClose();
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de créer l\'item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Nouvel équipement">
      <Field label="Nom de l'équipement" value={name} onChangeText={setName} placeholder="Ex: Console son Yamaha" autoCapitalize="sentences" error={errors.name} icon="box" />
      <SelectField label="Catégorie" value={category} options={CATEGORY_OPTIONS} onChange={setCategory} />
      <Field label="Empreinte carbone (kg CO₂)" value={carbon} onChangeText={setCarbon} placeholder="12.5" keyboardType="numeric" helper="Laisser vide si inconnu" error={errors.carbon} icon="leaf" />
      <View style={{ marginTop: Spacing.md, flexDirection: 'row', gap: Spacing.sm }}>
        <Button label="Annuler" variant="ghost" onPress={() => { reset(); onClose(); }} style={{ flex: 1 }} />
        <Button label="Créer l'item" icon="plus" onPress={handleSubmit} loading={loading} style={{ flex: 2 }} />
      </View>
    </Sheet>
  );
}
