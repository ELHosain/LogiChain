# CONTRIBUTING — LogiChain

## Installation locale

```bash
git clone https://github.com/ELHosain/LogiChain.git
cd LogiChain
npm install
npm run install:all       # installe apps/api + apps/mobile
```

### Variables d'environnement

Copier le template et renseigner vos propres valeurs :
```bash
cp apps/api/.env.example apps/api/.env
```

| Variable | Description |
|---|---|
| `PORT` | Port d'écoute de l'API (défaut 3000) |
| `MONGODB_URI` | URI de connexion MongoDB |
| `DB_NAME` | Nom de la base |
| `JWT_SECRET` | Clé secrète de signature des tokens JWT (ne jamais committer une vraie valeur) |
| `JWT_EXPIRES_IN` | Durée de validité des tokens |

### Lancer le projet

```bash
npm run seed   # une seule fois, pour peupler la base
npm run dev    # lance API + mobile en parallèle
```

## Stratégie de branches (Gitflow)

- **`main`** : code de production, toujours stable et déployable. Protégée.
- **`develop`** : branche d'intégration, reçoit les fonctionnalités terminées.
- **`feature/<nom-court>`** : une branche par fonctionnalité, créée depuis `develop`.

```
feature/xxx  →  PR vers develop  →  PR de develop vers main (release)
```

## Règles de Pull Request

- Toute modification passe par une PR — jamais de push direct sur `main` ou `develop`.
- Une PR nécessite **au moins une review approuvée** avant merge.
- La CI (lint + tests) doit être verte avant merge.
- Squash-merge recommandé pour garder un historique propre sur `develop`/`main`.

## Convention de commit (Conventional Commits)

```
<type>(<scope optionnel>): <description courte>
```

Types autorisés : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Exemples :
```
feat(api): ajoute l'endpoint de création d'anomalie
fix(mobile): corrige la synchro offline lors de la perte réseau
docs(readme): met à jour les instructions d'installation
```

## Tests

```bash
cd apps/api
npm test
```

Toute nouvelle route ou service doit être accompagné de tests
(Jest + Supertest) avant merge.
