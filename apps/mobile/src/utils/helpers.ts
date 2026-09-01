// src/utils/helpers.ts
import { ItemStatus, ItemCategory } from '../types';

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const STATUS_LABELS: Record<ItemStatus, string> = {
  stocké:         'Stocké',
  en_transit:     'En transit',
  livré:          'Livré',
  en_maintenance: 'En maintenance',
  archivé:        'Archivé',
};

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  energie:   'Énergie',
  scene:     'Scène',
  son:       'Son',
  lumiere:   'Lumière',
  securite:  'Sécurité',
  sanitaire: 'Sanitaire',
  autre:     'Autre',
};

export const CATEGORY_ICONS: Record<ItemCategory, string> = {
  energie:   '⚡',
  scene:     '🎪',
  son:       '🔊',
  lumiere:   '💡',
  securite:  '🛡️',
  sanitaire: '🚿',
  autre:     '📦',
};

export const STATUS_NEXT: Record<ItemStatus, ItemStatus[]> = {
  stocké:         ['en_transit'],
  en_transit:     ['livré', 'en_maintenance'],
  livré:          ['archivé'],
  en_maintenance: ['stocké', 'livré'],
  archivé:        [],
};

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
};

export const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
};

export const formatCarbon = (kg: number): string => {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t`;
  return `${kg.toFixed(1)} kg`;
};
