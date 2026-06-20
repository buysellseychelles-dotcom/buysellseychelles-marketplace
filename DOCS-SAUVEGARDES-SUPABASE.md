# Sauvegardes de la base de données Supabase

Ce document explique comment **vérifier**, **activer** et (si besoin) **restaurer** les
sauvegardes de la base Supabase de BuySellSeychelles.

---

## 1. Vérifier la politique de sauvegarde actuelle

1. Connectez-vous au [dashboard Supabase](https://supabase.com/dashboard).
2. Ouvrez le projet `sywutvsmoccbmylbocex`.
3. Allez dans **Database → Backups** (menu de gauche).

Ce que vous y verrez **dépend de votre plan** :

| Plan Supabase | Sauvegardes automatiques | Rétention | Restauration |
|---------------|--------------------------|-----------|--------------|
| **Free** | ❌ Aucune sauvegarde automatique | — | ❌ Impossible depuis le dashboard |
| **Pro** (25 $/mois) | ✅ Quotidiennes automatiques | 7 jours | ✅ En 1 clic |
| **Pro + PITR** (add-on) | ✅ Point-in-Time Recovery | jusqu'à 28 jours | ✅ À la seconde près |

> ⚠️ **Important** : sur le plan **gratuit**, Supabase **ne fait aucune sauvegarde
> automatique** et **ne permet aucune restauration**. Si la base est corrompue ou
> supprimée, les données sont **définitivement perdues**.

### Comment savoir sur quel plan vous êtes
**Settings → Subscription / Billing** indique le plan actif.

---

## 2. Activer les sauvegardes automatiques (recommandé)

### Option A — Plan Pro (la plus simple, ~25 $/mois)
1. **Settings → Subscription → Upgrade to Pro**.
2. Une fois Pro actif, les sauvegardes **quotidiennes** sont activées
   automatiquement (rien d'autre à faire), avec 7 jours de rétention.
3. (Optionnel) Activez **Point-in-Time Recovery** dans **Database → Backups**
   pour restaurer à n'importe quel instant des 28 derniers jours.

### Option B — Rester en gratuit + sauvegarde externe automatique (0 €)
Si vous restez sur le plan gratuit, **vous devez gérer vos propres sauvegardes**.
Une solution gratuite et automatique est fournie dans ce dépôt :
[`.github/workflows/db-backup.yml`](.github/workflows/db-backup.yml).

Elle lance `pg_dump` **tous les jours** via GitHub Actions et stocke le dump
compressé comme *artifact* GitHub (rétention 30 jours, gratuit).

#### Mise en place (2 minutes)
1. Récupérez la **connection string** dans Supabase :
   **Settings → Database → Connection string → URI** (cochez *Use connection pooling* = **off**,
   prenez le mode **Session**). Elle ressemble à :
   ```
   postgresql://postgres:[VOTRE-MOT-DE-PASSE]@db.sywutvsmoccbmylbocex.supabase.co:5432/postgres
   ```
2. Dans GitHub : **Settings → Secrets and variables → Actions → New repository secret**.
   - Nom : `SUPABASE_DB_URL`
   - Valeur : la connection string complète ci-dessus.
3. C'est tout. Le workflow tourne chaque nuit. Vous pouvez aussi le lancer
   manuellement (onglet **Actions → DB Backup → Run workflow**).

#### Télécharger / restaurer un backup
- **Télécharger** : onglet **Actions**, ouvrez un run, section *Artifacts*,
  téléchargez `db-backup-AAAA-MM-JJ.sql.gz`.
- **Restaurer** (en local ou vers un nouveau projet) :
  ```bash
  gunzip db-backup-2026-06-19.sql.gz
  psql "postgresql://postgres:[MDP]@db.xxxx.supabase.co:5432/postgres" < db-backup-2026-06-19.sql
  ```

---

## 3. Bonnes pratiques

- **Testez une restauration** au moins une fois (sur un projet Supabase de test)
  pour confirmer que le dump est exploitable — un backup jamais testé n'est pas un backup.
- Conservez **au moins un backup hors-ligne** (téléchargé sur votre disque) en plus
  des artifacts GitHub.
- Le Storage (images des annonces) **n'est pas inclus** dans `pg_dump` (ce sont des
  fichiers, pas des lignes SQL). Pour les sauvegarder, utilisez le bucket Supabase
  Storage → option d'export, ou conservez les URLs sources.
