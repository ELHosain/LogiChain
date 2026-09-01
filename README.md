# LogiChain 

Plateforme logistique événementielle. Design clair "liquid glass" inspiré iOS 2026.

```
LogiChain/
├── apps/
│   ├── api/        ← Back-end Node.js + Express + MongoDB
│   └── mobile/     ← App React Native (Expo) 
├── package.json    ← scripts racine (npm run dev)
└── README.md
```

## 🚀 Installation (une seule fois)

```bash
# À la racine LogiChain/
npm install                 # installe concurrently
npm run install:all         # installe API + mobile
```

Ou manuellement :
```bash
cd apps/api && npm install
cd ../mobile && npm install
```

## ▶️ Lancer

### Tout en même temps (recommandé)
```bash
# 1. D'abord seed la base (une fois)
npm run seed

# 2. Lancer API + Mobile ensemble
npm run dev
```

### Ou séparément
```bash
npm run api          # API seule
npm run mobile       # Mobile seul (puis 'a' pour Android)
```

## ⚠️ Configuration

1. **API** : `apps/api/.env` (copier depuis `.env.example`)
2. **Mobile** : dans `apps/mobile/src/services/api.ts` :
   ```ts
   export const API_BASE_URL = 'http://10.0.2.2:3000/api/v1';  // émulateur Android
   ```

## 👥 Comptes

| Email | Mot de passe | Rôle |
|---|---|---|
| admin@logichain.fr | password123 | admin |
| sophie@logichain.fr | password123 | responsable |
| marc@logichain.fr | password123 | agent |

## 📦 Logo

Place ton logo dans `apps/mobile/assets/logo.png` — il sera utilisé automatiquement sur le login, le splash et le header. Sinon un fallback s'affiche.

## ✅ Fonctionnalités (100% conservées)

Auth JWT · Offline SQLite · Optimistic UI + verrouillage optimiste · Scan QR haptique/sonore · Dashboard KPI · Anomalies GPS · Alertes SSE temps réel · Permissions par rôle · Historique · Recherche · Filtres.

## 📱 Dépendances natives

Si un module manque au 1er lancement :
```bash
cd apps/mobile
npx expo install react-native-sse expo-av expo-location expo-blur expo-linear-gradient react-native-svg
```
