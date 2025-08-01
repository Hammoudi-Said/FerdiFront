# 🚌 FERDI - Gestion de Flotte d'Autocars

Une application moderne de gestion de flotte pour autocaristes français, construite avec Next.js, TypeScript et Tailwind CSS.

## 🎯 Aperçu

FERDI est une plateforme SaaS conçue spécifiquement pour les autocaristes français afin de gérer efficacement leur flotte d'autocars, leurs équipes et leurs opérations.

### ✨ Fonctionnalités principales

- **🔐 Système d'authentification avancé**
  - Enregistrement d'entreprise avec création automatique du gérant
  - Inscription des collaborateurs via code entreprise unique
  - Authentification JWT avec gestion des rôles

- **👥 Gestion multi-rôles**
  - **Super Admin (1)** : Gestion globale de la plateforme
  - **Admin (2)** : Administration de l'entreprise
  - **Autocariste (3)** : Gestion opérationnelle
  - **Chauffeur (4)** : Accès limité aux trajets et planning

- **🏢 Gestion d'entreprise**
  - Profil complet de l'entreprise
  - Gestion des utilisateurs et équipes
  - Paramètres et configurations

- **🚌 Fonctionnalités à venir**
  - Gestion de flotte (véhicules, maintenance)
  - Planning et trajets
  - Devis et facturation
  - Rapports et statistiques

## 🚀 Démarrage rapide

### Prérequis

```bash
Node.js 18+ 
npm ou yarn
```

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd ferdi-app
```

2. **Installer les dépendances**
```bash
yarn install
# ou
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env.local
```

Modifier le fichier `.env.local` :
```env
# URL de votre backend FastAPI local
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Configuration de base de données (optionnel pour le frontend)
MONGO_URL=mongodb://localhost:27017
DB_NAME=ferdi_database
```

4. **Lancer l'application**
```bash
yarn dev
# ou
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 🔌 Configuration du Backend

### Connection à votre backend FastAPI

1. **Modifier l'URL du backend**
   
   Dans le fichier `.env.local` :
   ```env
   NEXT_PUBLIC_BASE_URL=http://localhost:8000
   ```

2. **Format des endpoints attendus**
   
   L'application s'attend à trouver ces endpoints sur votre backend :
   ```
   POST /api/v1/companies/register    # Enregistrement entreprise
   POST /api/v1/users/signup         # Inscription utilisateur
   POST /api/v1/login/access-token   # Connexion
   GET  /api/v1/users/me             # Profil utilisateur
   GET  /api/v1/companies/me         # Données entreprise
   GET  /api/v1/users/               # Liste utilisateurs
   ```

3. **Configuration CORS**
   
   Assurez-vous que votre backend FastAPI accepte les requêtes depuis `http://localhost:3000` :
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### Mode développement avec données mock

Si vous voulez tester l'interface sans backend :

1. **Activer le mode mock**
   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```

2. **Les données mock incluent :**
   - Entreprise exemple "Transport Bretagne SARL"
   - Utilisateurs avec différents rôles
   - Code entreprise : `BRE-12345-ABC`

## 📁 Structure du projet

```
/app
├── app/                          # Pages Next.js (App Router)
│   ├── api/[[...path]]/         # Proxy API vers le backend
│   ├── auth/                    # Pages d'authentification
│   │   ├── login/               # Page de connexion
│   │   ├── register-company/    # Enregistrement entreprise
│   │   └── register-user/       # Inscription utilisateur
│   ├── dashboard/               # Pages du tableau de bord
│   │   ├── company/             # Gestion entreprise
│   │   ├── users/               # Gestion utilisateurs
│   │   ├── fleet/               # Gestion flotte (à venir)
│   │   └── routes/              # Gestion trajets (à venir)
│   ├── layout.js                # Layout principal
│   └── page.js                  # Page d'accueil
├── components/                   # Composants réutilisables
│   ├── auth/                    # Composants d'authentification
│   ├── layout/                  # Composants de mise en page
│   └── ui/                      # Composants UI (Shadcn/UI)
├── lib/                         # Utilitaires et configuration
│   ├── stores/                  # Stores Zustand
│   ├── api.js                   # Configuration Axios
│   └── utils.js                 # Utilitaires
└── globals.css                  # Styles globaux
```

## 🎨 Technologies utilisées

- **[Next.js 14](https://nextjs.org/)** - Framework React avec App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique (configuré pour JS aussi)
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitaire
- **[Shadcn/UI](https://ui.shadcn.com/)** - Composants UI modernes
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Gestion d'état global
- **[React Hook Form](https://react-hook-form.com/)** - Gestion des formulaires
- **[Zod](https://zod.dev/)** - Validation des schémas
- **[Axios](https://axios-http.com/)** - Client HTTP
- **[Lucide React](https://lucide.dev/)** - Icônes modernes

## 🔐 Système d'authentification

### Flux d'enregistrement d'entreprise

1. Le gérant remplit le formulaire d'enregistrement d'entreprise
2. Le système crée l'entreprise et le compte gérant
3. Un code entreprise unique est généré (format: `XXX-YYYYY-ZZZ`)
4. Le gérant peut partager ce code avec ses collaborateurs

### Flux d'inscription collaborateur

1. Le collaborateur utilise le code entreprise fourni
2. Il remplit ses informations personnelles
3. Il choisit son rôle (Admin, Autocariste, Chauffeur)
4. Son compte est créé et lié à l'entreprise

### Gestion des tokens JWT

- Les tokens sont stockés dans des cookies sécurisés
- Refresh automatique des tokens
- Déconnexion automatique en cas d'expiration
- Intercepteurs Axios pour l'injection automatique des headers

## 🛠️ Développement

### Commandes disponibles

```bash
# Développement
yarn dev              # Lancer en mode développement
yarn build            # Construire pour la production
yarn start            # Lancer en mode production
yarn lint             # Vérifier le code

# Gestion des dépendances
yarn add <package>    # Ajouter une dépendance
yarn remove <package> # Supprimer une dépendance
```

### Personnalisation des couleurs

Modifier les couleurs dans `globals.css` :

```css
:root {
  --primary: 222.2 47.4% 11.2%;        # Couleur principale
  --secondary: 210 40% 96.1%;          # Couleur secondaire
  --accent: 210 40% 96.1%;             # Couleur d'accent
  /* ... autres variables */
}
```

### Ajout de nouvelles pages

1. Créer le fichier dans `app/dashboard/nouvelle-page/page.js`
2. Utiliser le composant `DashboardLayout`
3. Ajouter la route dans `components/layout/dashboard-sidebar.jsx`

Exemple :
```jsx
// app/dashboard/nouvelle-page/page.js
'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function NouvellePage() {
  return (
    <DashboardLayout>
      <div>
        <h1>Ma nouvelle page</h1>
      </div>
    </DashboardLayout>
  )
}
```

## 🧪 Tests

### Test du frontend

L'application inclut un système de test pour vérifier :
- La connectivité avec le backend
- Les flux d'authentification
- La gestion des erreurs
- Les permissions par rôle

### Données de test

Utilisez ces données pour tester l'application :

**Entreprise exemple :**
```json
{
  "name": "Transport Bretagne SARL",
  "siret": "12345678901234",
  "address": "15 Rue de la Gare",
  "city": "Quimper",
  "postal_code": "29000",
  "phone": "0298554433"
}
```

**Gérant :**
- Email: `manager@transport-bretagne.fr`
- Mot de passe: `SecurePass123!`

**Code entreprise :** `BRE-12345-ABC`

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- 📱 Mobile (320px+)
- 📱 Tablette (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🔧 Configuration avancée

### Variables d'environnement

```env
# Backend Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:8000    # URL de votre backend
NEXT_PUBLIC_USE_MOCK_DATA=false              # Activer les données mock

# Database (optionnel pour le frontend)
MONGO_URL=mongodb://localhost:27017
DB_NAME=ferdi_database

# Development
NODE_ENV=development
```

### Proxy API personnalisé

Le fichier `app/api/[[...path]]/route.js` peut être modifié pour :
- Ajouter des headers personnalisés
- Modifier la logique de routage
- Ajouter du logging des requêtes
- Gérer l'authentification côté serveur

## 🚀 Déploiement

### Vercel (recommandé)

```bash
# Installation de Vercel CLI
npm i -g vercel

# Déploiement
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Contribuer

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines de contribution.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- 📧 Email : support@ferdi-app.fr
- 📖 Documentation : [docs.ferdi-app.fr](https://docs.ferdi-app.fr)
- 🐛 Issues : [GitHub Issues](https://github.com/ferdi-app/issues)

---

**Développé avec ❤️ pour les autocaristes français**