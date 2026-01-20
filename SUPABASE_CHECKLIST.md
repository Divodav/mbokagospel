# ✅ Checklist de Migration Supabase - Mboka Gospel

## 📋 Étapes de Migration

### Phase 1: Préparation ✅
- [x] Nouvelles credentials Supabase reçues
- [x] Credentials mises à jour dans `src/integrations/supabase/client.ts`
- [x] Scripts SQL créés (CLEANUP + SETUP)
- [x] Documentation créée

### Phase 2: Nettoyage du Projet Supabase ⏳
- [ ] Se connecter au projet Supabase: https://supabase.com/dashboard
- [ ] Ouvrir le projet `toeveqifqzdevwxzjgao`
- [ ] Aller dans **SQL Editor**
- [ ] Créer une **New Query**
- [ ] Copier/coller le contenu de `SUPABASE_CLEANUP.sql`
- [ ] Cliquer sur **Run** pour exécuter
- [ ] Vérifier qu'il n'y a pas d'erreurs

### Phase 3: Suppression des Buckets ⏳
- [ ] Aller dans **Storage** dans le menu latéral
- [ ] Supprimer le bucket `songs` (s'il existe)
- [ ] Supprimer le bucket `covers` (s'il existe)
- [ ] Supprimer le bucket `avatars` (s'il existe)

### Phase 4: Configuration de la Base de Données ⏳
- [ ] Retourner dans **SQL Editor**
- [ ] Créer une **New Query**
- [ ] Copier/coller le contenu de `SUPABASE_FULL_SETUP.sql`
- [ ] Cliquer sur **Run** pour exécuter
- [ ] Vérifier qu'il n'y a pas d'erreurs
- [ ] Aller dans **Table Editor** pour vérifier que les tables sont créées

### Phase 5: Création des Buckets de Storage ⏳
- [ ] Aller dans **Storage**
- [ ] Cliquer sur **New bucket**
- [ ] Créer le bucket `songs`:
  - Nom: `songs`
  - Public: ✅ Coché
  - Cliquer sur **Create bucket**
- [ ] Créer le bucket `covers`:
  - Nom: `covers`
  - Public: ✅ Coché
  - Cliquer sur **Create bucket**
- [ ] Créer le bucket `avatars`:
  - Nom: `avatars`
  - Public: ✅ Coché
  - Cliquer sur **Create bucket**

### Phase 6: Vérification ⏳
- [ ] Vérifier que toutes les tables sont présentes:
  - [ ] profiles
  - [ ] songs
  - [ ] albums
  - [ ] playlists
  - [ ] playlist_songs
  - [ ] song_likes
  - [ ] song_plays
  - [ ] follows
  - [ ] song_comments
- [ ] Vérifier que les 3 buckets sont créés et publics
- [ ] Vérifier qu'il n'y a pas d'erreurs dans les logs Supabase

### Phase 7: Test de l'Application ⏳
- [ ] Installer les dépendances: `pnpm install`
- [ ] Démarrer l'application: `pnpm dev`
- [ ] Ouvrir l'application dans le navigateur
- [ ] Tester la connexion (inscription/connexion)
- [ ] Vérifier que le profil est créé automatiquement
- [ ] Tester l'upload d'une chanson (si vous êtes artiste)

---

## 🎯 Résumé des Fichiers Créés

| Fichier | Description | Statut |
|---------|-------------|--------|
| `SUPABASE_CLEANUP.sql` | Script de nettoyage complet | ✅ Créé |
| `SUPABASE_FULL_SETUP.sql` | Script de configuration complète | ✅ Créé |
| `SUPABASE_SETUP_GUIDE.md` | Guide détaillé étape par étape | ✅ Créé |
| `SUPABASE_MIGRATION.md` | Résumé de la migration | ✅ Créé |
| `SUPABASE_CHECKLIST.md` | Cette checklist | ✅ Créé |
| `verify-supabase.js` | Script de vérification | ✅ Créé |
| `src/integrations/supabase/client.ts` | Client Supabase mis à jour | ✅ Mis à jour |

---

## 🚨 Points d'Attention

### ⚠️ Avant de commencer:
- Le script de nettoyage **supprime TOUTES les données**
- Assurez-vous d'avoir sauvegardé vos données importantes
- Vérifiez que vous êtes sur le bon projet Supabase

### ✅ Après la migration:
- Testez toutes les fonctionnalités principales
- Vérifiez que l'authentification fonctionne
- Testez l'upload de fichiers (songs, covers, avatars)
- Vérifiez les permissions RLS

---

## 📞 Support

Si vous rencontrez des problèmes:

1. **Erreurs SQL:**
   - Vérifiez les logs dans l'éditeur SQL de Supabase
   - Assurez-vous que les scripts sont exécutés dans le bon ordre

2. **Erreurs de connexion:**
   - Vérifiez les credentials dans `src/integrations/supabase/client.ts`
   - Vérifiez que l'URL et la clé sont correctes

3. **Erreurs de permissions:**
   - Vérifiez que RLS est bien configuré
   - Vérifiez les policies dans **Authentication > Policies**

4. **Erreurs de storage:**
   - Vérifiez que les buckets sont bien créés et **publics**
   - Vérifiez les policies de storage

---

## 🎉 Félicitations!

Une fois toutes les cases cochées, votre migration est terminée! 🎊

Vous pouvez maintenant utiliser votre application avec le nouveau projet Supabase.

---

**Date de migration:** 2026-01-20  
**Projet:** Mboka Gospel  
**Nouveau projet Supabase:** toeveqifqzdevwxzjgao
