// src/components/CreateEventSheet.tsx
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Sheet, Field, Button } from './ui';
import { useCreateEvent } from '../hooks/useEvents';
import { Spacing } from '../utils/theme';

interface Props { visible: boolean; onClose: () => void; onCreated?: () => void; }

export default function CreateEventSheet({ visible, onClose, onCreated }: Props) {
  const [name, setName]           = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const createEvent = useCreateEvent();

  const reset = () => { setName(''); setStartDate(''); setEndDate(''); setErrors({}); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Le nom est obligatoire";
    if (!startDate.match(/^\d{4}-\d{2}-\d{2}$/)) e.startDate = "Format YYYY-MM-DD attendu";
    if (!endDate.match(/^\d{4}-\d{2}-\d{2}$/)) e.endDate = "Format YYYY-MM-DD attendu";
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) e.endDate = "La date de fin doit être après le début";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createEvent.mutate(
      { name: name.trim(), startDate, endDate },
      {
        onSuccess: () => { Alert.alert('Événement créé', `${name} a été ajouté.`); reset(); onCreated?.(); onClose(); },
        onError: (err: any) => Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de créer l\'événement'),
      }
    );
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Nouvel événement">
      <Field label="Nom de l'événement" value={name} onChangeText={setName} placeholder="Ex: Festival EcoSound 2026" autoCapitalize="sentences" error={errors.name} icon="tent" />
      <Field label="Date de début" value={startDate} onChangeText={setStartDate} placeholder="2026-07-15" helper="Format : AAAA-MM-JJ" error={errors.startDate} icon="calendar" />
      <Field label="Date de fin" value={endDate} onChangeText={setEndDate} placeholder="2026-07-18" helper="Format : AAAA-MM-JJ" error={errors.endDate} icon="calendar" />
      <View style={{ marginTop: Spacing.md, flexDirection: 'row', gap: Spacing.sm }}>
        <Button label="Annuler" variant="ghost" onPress={() => { reset(); onClose(); }} style={{ flex: 1 }} />
        <Button label="Créer" icon="plus" onPress={handleSubmit} loading={createEvent.isPending} style={{ flex: 2 }} />
      </View>
    </Sheet>
  );
}
