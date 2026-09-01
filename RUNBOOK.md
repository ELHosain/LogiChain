# RUNBOOK — LogiChain Production Operations

Guide opérationnel synthétique pour l'équipe d'exploitation.

## 1. Architecture de déploiement

- **Serveur** : Ubuntu, provisionné intégralement via Ansible (`ansible/site.yml`)
- **API** : Node.js/Express, supervisée par PM2 (process `logichain-api`)
- **Base de données** : MongoDB (localhost only, auth activée)
- **Reverse proxy** : Nginx (port 80/443 → 127.0.0.1:3000)
- **CI/CD** : GitHub Actions — tests sur chaque push/PR, déploiement auto sur push vers `main`

## 2. Déploiement initial (serveur vierge)

```bash
# Depuis votre machine, avec la clé SSH et le mot de passe vault en main
cd ansible
ansible-playbook -i inventory.ini site.yml --ask-vault-pass
```

Ce playbook est **idempotent** : il peut être relancé autant de fois que
nécessaire sans effet de bord, et reconstruit l'intégralité du serveur
(système, sécurité, MongoDB, Nginx, API) en une seule commande.

## 3. Déploiement d'une mise à jour de code

Automatique : tout push validé sur `main` déclenche le déploiement via
GitHub Actions (voir `.github/workflows/ci-cd.yml`).

Manuel si besoin :
```bash
ssh deploy@<server-ip>
cd /opt/logichain
git pull origin main
cd apps/api && npm ci --production
pm2 restart logichain-api
```

## 4. Rollback

Si une version déployée pose problème :

```bash
ssh deploy@<server-ip>
cd /opt/logichain
git log --oneline -5          # identifier le dernier commit stable
git checkout <commit-hash-stable>
cd apps/api && npm ci --production
pm2 restart logichain-api
```

Pour revenir définitivement en arrière sur `main`, préférez un `git revert`
sur la branche (via PR) plutôt qu'un `checkout` local permanent, afin de
garder l'historique Git cohérent avec ce qui tourne en prod.

## 5. Sauvegarde et restauration MongoDB

**Sauvegarde manuelle :**
```bash
mongodump --uri="mongodb://logichain_app:<password>@127.0.0.1:27017/logichain" \
  --out=/opt/backups/logichain-$(date +%Y%m%d-%H%M%S)
```

**Sauvegarde automatique (cron quotidien recommandé) :**
```bash
# /etc/cron.d/logichain-backup
0 3 * * * deploy mongodump --uri="mongodb://logichain_app:<password>@127.0.0.1:27017/logichain" --out=/opt/backups/logichain-$(date +\%Y\%m\%d)
```

**Restauration :**
```bash
mongorestore --uri="mongodb://logichain_app:<password>@127.0.0.1:27017/logichain" \
  --drop /opt/backups/logichain-<date>/logichain
```

## 6. Vérifier l'état du système

```bash
pm2 status                        # statut du process API
pm2 logs logichain-api --lines 100
systemctl status mongod
systemctl status nginx
curl http://localhost:3000/health # doit renvoyer {"status":"ok",...}
```

## 7. Gestion des secrets

- Tous les secrets (JWT_SECRET, mots de passe MongoDB) vivent dans
  `ansible/group_vars/vault.yml`, chiffré avec `ansible-vault`.
- Le mot de passe du vault et la clé SSH de déploiement sont stockés
  dans les **GitHub Actions Secrets** du repository (jamais en clair
  dans le code) : `ANSIBLE_VAULT_PASSWORD`, `DEPLOY_SSH_KEY`, `DEPLOY_SERVER_IP`.
- Ne jamais committer `.env`, `vault.yml` (non chiffré), ou toute clé privée.
