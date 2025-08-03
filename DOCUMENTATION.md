# Documentation FERDI - Guide Développeur

## Vue d'ensemble

FERDI est une application de gestion de flotte d'autocars construite avec **Next.js 14** (frontend) et **FastAPI** (backend) avec **PostgreSQL**. Cette documentation vous guide pour comprendre, modifier et étendre l'application.

---

## Table des matières

1. [Architecture Générale](#architecture-générale)
2. [Système d'Authentification](#système-dauthentification)
3. [Gestion des Rôles et Permissions](#gestion-des-rôles-et-permissions)
4. [Ajout de Nouvelles Features](#ajout-de-nouvelles-features)
5. [Modification de Features Existantes](#modification-de-features-existantes)
6. [Suppression de Features](#suppression-de-features)
7. [Composants UI](#composants-ui)
8. [API Integration](#api-integration)
9. [Déploiement](#déploiement)

---

## Architecture Générale

```
/app
├── app/                          # Next.js App Router
│   ├── api/[[...path]]/route.js  # Proxy API vers FastAPI
│   ├── auth/                     # Pages d'authentification
│   ├── dashboard/               # Pages du tableau de bord
│   └── layout.js               # Layout principal
├── components/                   # Composants React réutilisables
│   ├── layout/                  # Layouts (sidebar, header)
│   └── ui/                     # Composants UI de base
├── lib/                        # Utilitaires et logique métier
│   ├── stores/                 # State management (Zustand)
│   ├── api.js                 # Client API Axios
│   └── utils.js               # Utilitaires généraux
└── .env                       # Variables d'environnement
```

### Configuration Backend

```env
# .env
NEXT_PUBLIC_BASE_URL=http://localhost:8000  # URL de votre backend FastAPI
NEXT_PUBLIC_USE_MOCK_DATA=false            # Mode démo (true) ou backend réel (false)
MONGO_URL=mongodb://localhost:27017         # MongoDB (legacy, non utilisé avec PostgreSQL)
```

---

## Système d'Authentification

### Configuration dans `lib/stores/auth-store.js`

L'authentification utilise **Zustand** avec persistance localStorage et gestion des sessions.

#### État principal :
```javascript
{
  user: null,           // Données utilisateur courantes
  token: null,          // JWT token
  company: null,        // Données entreprise
  isLoading: false,     // État de chargement
  lastActivity: Date.now(), // Dernière activité (gestion timeout)
  sessionTimeout: 8 * 60 * 60 * 1000 // 8 heures
}
```

#### Méthodes principales :
- `login(email, password)` - Connexion utilisateur
- `logout()` - Déconnexion et nettoyage
- `checkAuth()` - Vérification de session au démarrage
- `hasPermission(permission)` - Vérification des permissions
- `updateActivity()` - Mise à jour dernière activité

---

## Gestion des Rôles et Permissions

### Définition des rôles dans `ROLE_DEFINITIONS`

```javascript
const ROLE_DEFINITIONS = {
  '1': {
    name: 'super_admin',
    label: 'Admin Ferdi', 
    permissions: ['*'], // Toutes permissions
    color: 'bg-red-500'
  },
  '2': {
    name: 'admin',
    label: 'Administrateur',
    permissions: ['users_manage', 'company_manage', 'fleet_manage', 'routes_manage', 'billing_manage'],
    color: 'bg-purple-500'
  },
  '3': {
    name: 'dispatch',
    label: 'Dispatcheur',
    permissions: ['routes_manage', 'drivers_assign', 'fleet_view', 'schedule_manage'],
    color: 'bg-blue-500'
  },
  '4': {
    name: 'driver',
    label: 'Chauffeur', 
    permissions: ['routes_view_assigned', 'schedule_view_assigned'],
    color: 'bg-green-500'
  },
  '5': {
    name: 'internal_support',
    label: 'Support Interne',
    permissions: ['support_access', 'users_view', 'routes_view', 'fleet_view'],
    color: 'bg-orange-500'
  },
  '6': {
    name: 'accountant',
    label: 'Comptable',
    permissions: ['billing_manage', 'reports_access', 'invoices_manage'],
    color: 'bg-teal-500'
  }
}
```

### Utilisation des permissions

```javascript
// Dans un composant
const { hasPermission } = useAuthStore()

if (hasPermission('users_manage')) {
  // Afficher bouton "Gérer utilisateurs"
}
```

---

## Ajout de Nouvelles Features

### 1. Créer une nouvelle page

```bash
# Créer le fichier page
touch app/dashboard/ma-nouvelle-feature/page.js
```

```javascript
// app/dashboard/ma-nouvelle-feature/page.js
'use client'

import { useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function MaNouvelleFeaturePage() {
  const { hasPermission, updateActivity } = useAuthStore()

  useEffect(() => {
    updateActivity() // Important : tracker l'activité
  }, [updateActivity])

  // Vérifier les permissions
  if (!hasPermission('ma_nouvelle_permission')) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2>Accès refusé</h2>
          <p>Permissions insuffisantes</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Ma Nouvelle Feature</h1>
        {/* Contenu de votre feature */}
      </div>
    </DashboardLayout>
  )
}
```

### 2. Ajouter dans la navigation

```javascript
// components/layout/dashboard-sidebar.jsx
const navigationItems = [
  // ... items existants
  {
    title: 'Ma Nouvelle Feature',
    href: '/dashboard/ma-nouvelle-feature',
    icon: MonNouvelIcon,
    permissions: ['ma_nouvelle_permission'], // Définir les permissions requises
  },
]
```

### 3. Ajouter la permission au système de rôles

```javascript
// lib/stores/auth-store.js - Modifier ROLE_DEFINITIONS
'2': {
  // ...
  permissions: [...existing, 'ma_nouvelle_permission'],
},
```

### 4. Créer l'endpoint API backend

```python
# Côté FastAPI backend
@router.get("/ma-nouvelle-feature/")
async def get_ma_nouvelle_feature(
    current_user: User = Depends(get_current_user)
):
    # Vérifier permissions côté backend aussi
    if not has_permission(current_user, 'ma_nouvelle_permission'):
        raise HTTPException(status_code=403, detail="Permissions insuffisantes")
    
    return {"data": "mes données"}
```

### 5. Intégrer l'API côté frontend

```javascript
// Dans votre composant
const [data, setData] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await api.get('/ma-nouvelle-feature/')
      setData(response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement')
    }
  }
  
  fetchData()
}, [])
```

---

## Modification de Features Existantes

### 1. Identifier les fichiers concernés

Pour modifier la page utilisateurs par exemple :
- Interface : `app/dashboard/users/page.js`
- Style : Modifier directement dans le composant (Tailwind CSS)
- Logique métier : `lib/stores/auth-store.js` (méthode `getUsers`)
- API : Backend FastAPI endpoint `/users/`

### 2. Modification d'une interface existante

```javascript
// Exemple : Ajouter une colonne dans le tableau des utilisateurs
// app/dashboard/users/page.js

// Ajouter dans la structure de données
const columns = [
  // ... colonnes existantes
  {
    title: 'Nouvelle Colonne',
    dataIndex: 'nouveau_champ',
    render: (value) => <span>{value}</span>
  }
]
```

### 3. Modification des styles

Les styles utilisent **Tailwind CSS**. Modifiez directement les classes :

```javascript
// Ancien
<Card className="bg-white">

// Nouveau  
<Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
```

### 4. Modification des permissions

```javascript
// Ajouter une nouvelle permission à un rôle existant
// lib/stores/auth-store.js
'3': {
  // ...
  permissions: [
    ...existing_permissions, 
    'nouvelle_permission'
  ],
}
```

---

## Suppression de Features

### 1. Supprimer la navigation

```javascript
// components/layout/dashboard-sidebar.jsx
const navigationItems = [
  // Commenter ou supprimer l'item
  // {
  //   title: 'Feature à supprimer',
  //   href: '/dashboard/feature-obsolete',
  //   ...
  // },
]
```

### 2. Supprimer la page

```bash
rm -rf app/dashboard/feature-obsolete/
```

### 3. Nettoyer les permissions

```javascript
// lib/stores/auth-store.js
// Retirer les permissions obsolètes des rôles
'2': {
  permissions: [
    'users_manage',
    // 'permission_obsolete', // Supprimer
  ],
}
```

### 4. Supprimer l'endpoint API

Côté backend, supprimer ou désactiver l'endpoint correspondant.

---

## Composants UI

### Structure des composants

```
components/
├── ui/                 # Composants de base (shadcn/ui)
│   ├── button.jsx
│   ├── card.jsx
│   ├── input.jsx
│   └── ...
├── layout/            # Layouts spécifiques
│   ├── dashboard-layout.jsx
│   ├── dashboard-sidebar.jsx
│   └── dashboard-header.jsx
└── auth/             # Composants d'authentification
```

### Créer un nouveau composant

```javascript
// components/ui/ma-composant.jsx
'use client'

import { cn } from '@/lib/utils'

export function MonComposant({ 
  children, 
  className, 
  variant = 'default',
  ...props 
}) {
  return (
    <div 
      className={cn(
        'base-styles',
        variant === 'primary' && 'primary-styles',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

### Utilisation

```javascript
import { MonComposant } from '@/components/ui/mon-composant'

<MonComposant variant="primary" className="additional-classes">
  Contenu
</MonComposant>
```

---

## API Integration

### Configuration du client API

```javascript
// lib/api.js
import axios from 'axios'

export const api = axios.create({
  baseURL: '/api', // Proxy vers FastAPI
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteurs pour JWT et gestion d'erreurs
api.interceptors.request.use(config => {
  const token = Cookies.get('ferdi_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Appels API dans les composants

```javascript
// Pattern recommandé
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/endpoint')
      setData(response.data)
    } catch (err) {
      setError(err.message)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [])
```

### Gestion des erreurs

```javascript
// Intercepteur global pour les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expirée
      logout()
      router.push('/auth/login')
    }
    return Promise.reject(error)
  }
)
```

---

## Cache et Performance

### Stratégies de cache implémentées

1. **localStorage avec timestamp** : Cache persistant avec expiration
2. **sessionStorage** : Cache temporaire pour la session
3. **Zustand persist** : State persistant avec sérialisation custom

### Gestion du cache

```javascript
// lib/stores/auth-store.js
const customStorage = {
  getItem: (name) => {
    const item = localStorage.getItem(name)
    const parsed = JSON.parse(item)
    
    // Vérifier expiration (7 jours)
    if (Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(name)
      return null
    }
    
    return parsed.data
  },
  setItem: (name, value) => {
    const item = {
      data: value,
      timestamp: Date.now(),
    }
    localStorage.setItem(name, JSON.stringify(item))
  }
}
```

### Optimisation des re-renders

```javascript
// Utiliser useCallback pour les fonctions
const handleClick = useCallback(() => {
  // logique
}, [dependencies])

// Utiliser useMemo pour les calculs coûteux
const processedData = useMemo(() => {
  return data.map(item => processItem(item))
}, [data])
```

---

## Déploiement

### Variables d'environnement

```env
# Production
NEXT_PUBLIC_BASE_URL=https://api.mondomaine.com
NEXT_PUBLIC_USE_MOCK_DATA=false
MONGO_URL=mongodb://prod-mongodb:27017
```

### Build et démarrage

```bash
# Development
yarn dev

# Production
yarn build
yarn start
```

### Docker (optionnel)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

EXPOSE 3000
CMD ["yarn", "start"]
```

---

## Bonnes Pratiques

### 1. Sécurité
- Toujours vérifier les permissions côté frontend ET backend
- Utiliser `updateActivity()` sur les actions importantes
- Valider les données d'entrée

### 2. Performance  
- Utiliser `useCallback` et `useMemo` judicieusement
- Implémenter le lazy loading pour les pages lourdes
- Optimiser les images avec Next.js Image

### 3. UX
- Toujours afficher des états de chargement
- Gérer les erreurs avec des messages explicites
- Maintenir la cohérence visuelle

### 4. Code
- Utiliser TypeScript pour les nouveaux composants
- Respecter la structure de dossiers
- Commenter le code complexe

---

## Aide et Support

### Debugging

```bash
# Logs Next.js
tail -f /var/log/supervisor/nextjs.*.log

# Vérifier l'état des services
sudo supervisorctl status

# Redémarrer les services
sudo supervisorctl restart nextjs
```

### Ressources utiles

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [shadcn/ui](https://ui.shadcn.com/)

---

Cette documentation couvre les aspects essentiels pour développer sur FERDI. N'hésitez pas à l'enrichir au fur et à mesure de l'évolution du projet.