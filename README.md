# Gestion Boutique — version complète

Application web en français pour gérer les ventes, dépenses, produits et stocks en FCFA. Compatible ordinateur et Android via navigateur/PWA.

## Installation sur GitHub Pages
1. Fais d'abord une sauvegarde JSON depuis **Paramètres → Exporter la sauvegarde** sur chaque appareil contenant des données.
2. Ouvre ton dépôt GitHub.
3. Remplace les fichiers du dépôt par TOUS les fichiers de ce dossier, à la racine : `index.html`, `style.css`, `app.js`, `manifest.json`, `sw.js`, `icon.svg`, `README.md`.
4. Clique sur **Commit changes**.
5. Dans **Settings → Pages**, vérifie `Deploy from a branch`, branche `main`, dossier `/ (root)`.
6. Attends la publication, puis ouvre l'adresse GitHub Pages de ton dépôt.
7. Sur l'application, fais `Ctrl + F5` sur PC. Sur Android, ferme complètement l'application installée puis rouvre-la. Si l'ancienne version reste, ouvre le site dans Chrome et actualise.

## Fonctions
- Tableau de bord : ventes, dépenses, solde et valeur d'achat du stock.
- Filtres : jour, semaine, mois, semestre, année et tout l'historique.
- Ventes : choix du produit, quantité décimale, unité, prix et mode de paiement.
- Dépenses : catégorie, date, paiement et note.
- Stock : création/modification/suppression, réapprovisionnement, recherche et seuil d'alerte.
- Catalogue de départ : bouton **Ajouter produits courants** avec des produits usuels de boutique.
- Unités : kg/g/mg, L/cl/ml et pièce, paquet, sachet, carton, bouteille, bidon, boîte, douzaine, sac.
- Conversion automatique des unités de poids et volume. Exemple : un stock de 5 kg permet une vente de 500 g et le stock restant devient 4,5 kg.
- Historique filtrable, export CSV, sauvegarde et restauration JSON.
- Installation PWA et fonctionnement hors ligne après première visite.

## Données et synchronisation
GitHub Pages héberge les fichiers de l'application mais ne synchronise pas les données. Les ventes, dépenses et stocks sont enregistrés localement dans le navigateur de chaque appareil. Pour transférer les données : exporter un JSON depuis l'appareil source, puis l'importer sur l'autre appareil. L'import remplace les données locales de destination.

**Important :** garde tes sauvegardes JSON en lieu sûr et ne les dépose pas dans un dépôt GitHub public. La version conserve la clé locale `gestionBoutiqueData_v1` pour retrouver les données de la version précédente sur le même navigateur.

## Calcul du solde
Le solde affiché est : ventes enregistrées moins dépenses enregistrées. Pour tenir compte du coût des marchandises, saisis les achats de marchandises dans les dépenses. Ne saisis pas deux fois le même achat.
