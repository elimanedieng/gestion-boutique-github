# Gestion Boutique

Application web progressive (PWA) en français pour suivre les ventes, dépenses et stocks. Elle fonctionne sur GitHub Pages et peut être installée sur Android et ordinateur.

## Fonctionnalités
- Ventes avec quantité, prix, date et moyen de paiement.
- Déduction automatique du stock après une vente.
- Dépenses avec catégories.
- Produits, prix d'achat, prix de vente, quantités et seuil d'alerte.
- Bilans : jour, semaine, mois, semestre, année et historique complet.
- Historique filtrable et export CSV.
- Export/import JSON pour sauvegarder et transférer les données.
- Interface adaptée aux petits écrans et cache hors connexion.

## Déploiement sur GitHub Pages
1. Connecte-toi à https://github.com et crée un dépôt public nommé `gestion-boutique`.
2. Sur la page du dépôt, clique **Add file → Upload files**.
3. Envoie les fichiers `index.html`, `style.css`, `app.js`, `manifest.json`, `sw.js`, `icon.svg` et `README.md` à la racine du dépôt.
4. Clique **Commit changes**.
5. Ouvre **Settings → Pages**.
6. Dans **Build and deployment**, choisis **Deploy from a branch**.
7. Sélectionne la branche `main` et le dossier `/ (root)`, puis clique **Save**.
8. Attends la publication. L’adresse sera du type `https://TON-PSEUDO.github.io/gestion-boutique/`.

## Installation
- **Android (Chrome)** : ouvre l'adresse HTTPS publiée, menu ⋮ → **Installer l'application** ou **Ajouter à l'écran d'accueil**.
- **PC (Chrome ou Edge)** : ouvre l'adresse, puis utilise l'icône d'installation dans la barre d'adresse ou le menu du navigateur.

## Sauvegarde et synchronisation
Cette version utilise le stockage local du navigateur (`localStorage`). **GitHub Pages héberge les fichiers, mais ne synchronise pas les données de caisse entre appareils.**
Pour transférer les données : sur le premier appareil, ouvre **Paramètres → Exporter la sauvegarde** ; transfère le fichier JSON au second appareil ; ouvre la même application sur celui-ci et choisis **Paramètres → Choisir un fichier JSON**.

Import important : l'import remplace les données déjà présentes sur l'appareil de destination. Fais d'abord une sauvegarde de sécurité. Ne publie jamais de sauvegarde contenant des données privées dans un dépôt GitHub public.

## Limites
- Pas de compte utilisateur ni de synchronisation automatique entre plusieurs appareils.
- Les données restent dans le navigateur de l'appareil. Effacer les données du navigateur peut les supprimer.
- Le résultat affiché correspond aux ventes moins les dépenses saisies. Pour connaître un bénéfice net exact, enregistre aussi les achats de marchandises comme dépenses et évite de compter deux fois un même achat.
- Les produits sont des articles simples, sans variantes ni gestion de lots.
