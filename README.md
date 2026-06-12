# Application web de suivis de Stagiaires

![Aperçu du Projet](/public/logoo-ofppt.png) <!-- Assurez-vous d'avoir un logo ou remplacez par un screenshot -->

## 📝 Description du Projet
**Application web de suivis de Stagiaires** est une plateforme de gestion pédagogique complète développée pour digitaliser et centraliser l'administration au sein d'un établissement de formation (type OFPPT). 

L'application résout les problèmes liés à la gestion manuelle (papier, fichiers Excel dispersés) en offrant un écosystème unifié, sécurisé et accessible en temps réel. Elle connecte trois acteurs principaux : l'administration, les formateurs et les stagiaires.

---

## ✨ Fonctionnalités Détaillées par Profil

### 🛡️ 1. Espace Administrateur (Scolarité)
L'administrateur a le contrôle total sur la structure pédagogique de l'établissement :
* **Tableau de bord (Dashboard)** : Vue d'ensemble avec statistiques clés (effectifs, moyennes, graphiques de présences).
* **Gestion des Référentiels (CRUD)** :
  * **Années Scolaires** : Création et gestion des périodes académiques.
  * **Filières & Modules** : Structuration des spécialités et des matières avec leurs coefficients.
  * **Groupes** : Création des classes et assignation à des filières.
* **Gestion des Utilisateurs** :
  * Ajout, modification et suppression des **Formateurs** et des **Stagiaires**.
  * Import/Export en masse des données via des fichiers Excel (CSV).
* **Planification (Affectations)** : Attribution des modules et des groupes aux formateurs pour une année scolaire donnée.
* **Supervision Pédagogique** : Consultation globale et validation finale des relevés de notes et de l'historique des présences.

### 👨‍🏫 2. Espace Formateur
Le formateur dispose d'un espace de travail focalisé sur ses classes :
* **Espace de travail (Workspace)** : Liste de ses groupes affectés et modules enseignés.
* **Saisie des Présences** : Interface optimisée pour faire l'appel rapidement (Présent, Absent, Retard, Justifié).
* **Saisie des Notes** : Grille d'évaluation permettant la saisie des notes des contrôles continus (C1 à C5) et de l'Examen de Fin de Module (EFM).
* **Calcul automatique** : Calcul de la moyenne finale du module basé sur les notes saisies.

### 🎓 3. Espace Stagiaire
Le stagiaire suit sa progression de manière transparente :
* **Tableau de bord Personnel** :
  * Statistiques visuelles : Graphique circulaire de son assiduité.
  * Résumé des performances : Nombre de modules évalués, moyenne générale.
* **Mon Bulletin** : 
  * Relevé de notes détaillé par module avec le détail de chaque contrôle.
* **Historique des présences** : Journal complet indiquant la date, le statut (Absent/Présent) et les éventuelles remarques (ex: retard).
* **Filtrage** : Possibilité de filtrer ses résultats et présences par année scolaire.

---

## 🛠️ Architecture et Technologies

Ce projet adopte une architecture **Client-Serveur découplée** pour garantir performance, sécurité et évolutivité.

### Frontend (Client)
* **React 18** : Création d'une SPA (Single Page Application) réactive.
* **TypeScript** : Typage statique garantissant la robustesse du code.
* **Vite** : Bundler ultra-rapide pour le développement.
* **Tailwind CSS & shadcn/ui** : Conception d'une interface utilisateur moderne, accessible et entièrement responsive.
* **React Query (@tanstack/react-query)** : Gestion avancée du cache, des états de chargement et de la synchronisation des données avec le serveur.
* **Recharts** : Intégration de graphiques statistiques interactifs.
* **React Router Dom** : Gestion de la navigation et protection des routes par rôles.

### Backend (Serveur / API)
* **Laravel 11 (PHP 8.3)** : Framework robuste pour la construction de l'API RESTful.
* **MySQL** : Base de données relationnelle structurée (10+ tables avec clés étrangères strictes).
* **Eloquent ORM** : Interaction fluide avec la base de données et gestion des relations complexes.
* **Laravel Sanctum** : Système d'authentification par Token (Stateless) sécurisé pour l'API.

---

## 🚀 Installation et Lancement Local

### Prérequis
* **PHP 8.3+** et **Composer** installés.
* **Node.js** (v18+) et **npm**.
* Un serveur de base de données **MySQL** (ex: XAMPP, Laragon, WAMP).

### 1. Configuration du Backend (API Laravel)
Ouvrez un terminal et exécutez les commandes suivantes :

```bash
# Se déplacer dans le dossier backend
cd backend

# Installer les dépendances PHP
composer install

# Créer le fichier d'environnement
cp .env.example .env

# Générer la clé de l'application
php artisan key:generate
```

⚠️ **Configuration de la Base de données** :
Ouvrez le fichier `backend/.env` et configurez vos accès MySQL :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=votre_nom_de_base_de_donnees
DB_USERNAME=root
DB_PASSWORD=
```

```bash
# Créer les tables et insérer les données de test (seeders)
php artisan migrate:fresh --seed

# Lancer le serveur de développement Laravel
php artisan serve
```
L'API backend est maintenant active sur `http://localhost:8000`.

### 2. Configuration du Frontend (React)
Ouvrez un **nouveau terminal** à la racine du projet (dossier principal) :

```bash
# Installer les dépendances Node.js
npm install

# Lancer le serveur de développement Vite
npm run dev
```
L'application web est maintenant accessible depuis votre navigateur à l'adresse `http://localhost:5173` (ou 5174).

---

## 🔑 Comptes de Test (Seeders)

Lors de l'exécution de la commande `php artisan migrate:fresh --seed`, des données fictives complètes sont générées (filières, groupes, formateurs, notes, etc.).

Utilisez ces identifiants pour tester les différentes interfaces :

| Profil | Email | Mot de passe |
| :--- | :--- | :--- |
| **Administrateur** | `admin@ofppt.ma` | `password123` |
| **Formateur** | `form@ofppt.ma` | `password123` |
| **Stagiaire** | `stagiaire@ofppt.ma` | `password123` |

---

## 🔒 Sécurité et Bonnes Pratiques
* **Protection des routes** : Côté client (React) via un système de composants protégés (HOC), et côté serveur via des Middlewares Laravel bloquant les requêtes non autorisées.
* **Hashage des mots de passe** : Tous les mots de passe sont cryptés en base de données à l'aide de l'algorithme **Bcrypt**.
* **Protection contre les failles** : Utilisation d'Eloquent empêchant les injections SQL, et protection XSS native offerte par React.
* **Optimisation des requêtes** : Utilisation du "Eager Loading" (méthode `with()`) dans Laravel pour éviter le problème de performance des requêtes N+1.

---
*Projet de Synthèse - Application web développée dans le cadre de la soutenance de fin de formation.*
