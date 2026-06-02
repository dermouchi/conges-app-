# GestionCongés — Application de gestion des congés

## Installation et lancement

### Étape 1 — Ouvrir le dossier dans VSCode
- Ouvrez VSCode
- Cliquez sur "File" > "Open Folder"
- Sélectionnez le dossier `conges-app`

### Étape 2 — Ouvrir le terminal dans VSCode
- Dans VSCode : menu "Terminal" > "New Terminal"

### Étape 3 — Installer les dépendances (une seule fois)
Tapez cette commande et appuyez sur Entrée :
```
npm install
```
Attendez que l'installation se termine (1-2 minutes).

### Étape 4 — Lancer l'application
```
npm run dev
```
Puis ouvrez votre navigateur à l'adresse : http://localhost:5173

---

## Comptes de test
| Email | Mot de passe | Rôle |
|-------|-------------|------|
| ahmed@company.com | 1234 | Manager |
| sara@company.com | 1234 | Responsable d'Équipe |
| karim@company.com | 1234 | Collaborateur |

---

## Fonctionnalités incluses
- ✅ Authentification avec rôles (Manager / Responsable / Collaborateur)
- ✅ Planning visuel mensuel des congés par équipe
- ✅ Saisie de demande de congé (CP / RTT) avec vérification des soldes et règles
- ✅ Modification et annulation de demandes
- ✅ Validation / Rejet des demandes (Manager & Lead)
- ✅ Gestion des équipes (ajout, suppression, réaffectation)
- ✅ Règles d'absences par équipe (max absents simultanés)
- ✅ Gestion des compteurs CP/RTT avec réinitialisation
- ✅ Reporting et statistiques
