# 📚 Documentation Développeur FERDI

## Vue d'ensemble du projet

FERDI est une application de gestion de flotte d'autocars construite avec **Next.js 14**, **MongoDB**, et une architecture full-stack moderne. Cette documentation vous guide pour comprendre, maintenir et étendre l'application.

## 🏗️ Architecture du projet

### Structure des dossiers
```
/app/
├── app/                          # Application Next.js (App Router)
│   ├── api/[[...path]]/route.js  # Proxy API vers le backend
│   ├── auth/                     # Pages d'authentification
│   │   ├── login/page.js
│   │   ├── register-company/page.js
│   │   ├── register-user/page.js
│   │   └── reset-password/page.js
│   ├── dashboard/               # Tableaux de bord par rôle
│   ├── profile/page.js          # Page profil utilisateur
│   ├── page.js                  # Page d'accueil
│   ├── layout.js                # Layout principal
│   └── globals.css              # Styles globaux
├── components/                   # Composants réutilisables
│   ├── ui/                      # Composants UI (shadcn/ui)
│   ├── auth/                    # Composants d'authentification
│   ├── dashboard/               # Composants dashboard
│   ├── layout/                  # Composants layout
│   └── profile/                 # Composants profil
├── lib/                         # Utilitaires et logique métier
│   ├── api.js                   # Configuration Axios
│   ├── api-client.js            # Clients API typés
│   ├── stores/auth-store.js     # Store d'authentification (Zustand)
│   ├── utils/                   # Utilitaires
│   └── mock-data.js             # Données de démonstration
├── package.json                 # Dépendances et scripts
├── .env                         # Variables d'environnement
└── tailwind.config.js          # Configuration Tailwind CSS
```

## 🔧 Configuration et Installation

### Variables d'environnement (.env)
```bash
# Base de données MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=ferdi_database

# URL du backend FastAPI
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Mode démonstration (true/false)
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Installation
```bash
# Installation des dépendances
yarn install

# Démarrage en développement
yarn dev

# Construction pour production
yarn build
yarn start
```

## 🔐 Système d'authentification

### Architecture
- **Store**: Zustand (`/lib/stores/auth-store.js`)
- **Persistance**: LocalStorage + Cookies
- **Session**: 8 heures d'inactivité
- **JWT**: Stocké dans cookie `ferdi_token`

### Rôles utilisateur
```javascript
'1': 'super_admin'    // Admin FERDI - Accès total multi-entreprises
'2': 'admin'          // Admin entreprise - Gestion complète entreprise
'3': 'dispatch'       // Dispatcheur - Trajets et planning
'4': 'driver'         // Chauffeur - Trajets assignés uniquement
'5': 'internal_support' // Support - Assistance clients
'6': 'accountant'     // Comptable - Facturation et rapports
```

### Exemple d'utilisation
```jsx
import { useAuthStore } from '@/lib/stores/auth-store'

function MonComposant() {
  const { user, hasPermission, logout } = useAuthStore()
  
  if (!hasPermission('routes_manage')) {
    return <div>Accès refusé</div>
  }
  
  return <div>Contenu autorisé</div>
}
```

## 🌐 Gestion des API

### Configuration de base (`/lib/api.js`)
```javascript
export const api = axios.create({
  baseURL: '/api',  // Proxy vers backend via Next.js
  headers: { 'Content-Type': 'application/json' }
})

// Intercepteur automatique pour JWT
api.interceptors.request.use((config) => {
  const token = Cookies.get('ferdi_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

### Clients API typés (`/lib/api-client.js`)
```javascript
export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  changePassword: (data) => api.patch('/users/me/password', data)
}

export const companyAPI = {
  getCompany: () => api.get('/companies/me'),
  updateCompany: (data) => api.patch('/companies/me', data)
}
```

## 🎨 Système de composants UI

### Shadcn/ui
Tous les composants de base utilisent shadcn/ui dans `/components/ui/`:
- `Button`, `Input`, `Card`, `Dialog`, etc.
- Personnalisables via Tailwind CSS
- Accessibles et typés

### Composants personnalisés
```jsx
// Exemple de composant avec authentification
import { RoleGuard } from '@/components/auth/role-guard'

export function ComposantAdmin() {
  return (
    <RoleGuard allowedRoles={['1', '2']} showUnauthorized={true}>
      <div>Contenu admin</div>
    </RoleGuard>
  )
}
```

## 📋 Guide des tâches courantes

### ➕ Ajouter une nouvelle feature

#### 1. Créer une nouvelle page
```bash
# Créer le dossier et fichier
mkdir -p app/ma-nouvelle-page
touch app/ma-nouvelle-page/page.js
```

```jsx
// app/ma-nouvelle-page/page.js
'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'

export default function MaNouvelleFeature() {
  return (
    <RoleGuard allowedRoles={['1', '2', '3']} showUnauthorized={true}>
      <DashboardLayout>
        <div>
          <h1>Ma nouvelle feature</h1>
          {/* Votre contenu */}
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}
```

#### 2. Ajouter les appels API
```javascript
// Dans /lib/api-client.js
export const maFeatureAPI = {
  getData: (params) => api.get('/ma-feature/', { params }),
  createItem: (data) => api.post('/ma-feature/', data),
  updateItem: (id, data) => api.patch(`/ma-feature/${id}`, data),
  deleteItem: (id) => api.delete(`/ma-feature/${id}`)
}
```

#### 3. Créer les composants
```jsx
// components/ma-feature/ma-feature-table.js
'use client'

import { useState, useEffect } from 'react'
import { maFeatureAPI } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MaFeatureTable() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await maFeatureAPI.getData()
      setData(response.data)
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ma Feature</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Contenu de votre composant */}
      </CardContent>
    </Card>
  )
}
```

#### 4. Ajouter au menu (optionnel)
```jsx
// Dans components/layout/sidebar.js
const menuItems = [
  // ... autres items
  {
    title: 'Ma Feature',
    href: '/ma-nouvelle-page',
    icon: MonIcon,
    roles: ['1', '2', '3'], // Rôles autorisés
    permissions: ['ma_feature_access']
  }
]
```

### 🔌 Ajouter un nouvel endpoint backend

#### 1. Définir l'endpoint dans l'API client
```javascript
// lib/api-client.js
export const monNouveauAPI = {
  // GET /api/mon-endpoint
  getItems: (params = {}) => api.get('/mon-endpoint/', { params }),
  
  // POST /api/mon-endpoint
  createItem: (data) => api.post('/mon-endpoint/', data),
  
  // GET /api/mon-endpoint/{id}
  getItemById: (id) => api.get(`/mon-endpoint/${id}`),
  
  // PATCH /api/mon-endpoint/{id}
  updateItem: (id, data) => api.patch(`/mon-endpoint/${id}`, data),
  
  // DELETE /api/mon-endpoint/{id}
  deleteItem: (id) => api.delete(`/mon-endpoint/${id}`)
}
```

#### 2. Créer le hook personnalisé (optionnel)
```javascript
// lib/hooks/use-mon-endpoint.js
import { useState, useEffect } from 'react'
import { monNouveauAPI } from '@/lib/api-client'

export function useMonEndpoint() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadData = async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await monNouveauAPI.getItems(params)
      setData(response.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const createItem = async (data) => {
    try {
      const response = await monNouveauAPI.createItem(data)
      setData(prev => [...prev, response.data])
      return response.data
    } catch (err) {
      setError(err)
      throw err
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    data,
    loading,
    error,
    loadData,
    createItem,
    updateItem: monNouveauAPI.updateItem,
    deleteItem: monNouveauAPI.deleteItem
  }
}
```

#### 3. Utiliser dans un composant
```jsx
// components/mon-composant.js
import { useMonEndpoint } from '@/lib/hooks/use-mon-endpoint'
import { toast } from 'sonner'

export function MonComposant() {
  const { data, loading, error, createItem } = useMonEndpoint()

  const handleCreate = async (formData) => {
    try {
      await createItem(formData)
      toast.success('Item créé avec succès!')
    } catch (error) {
      toast.error('Erreur lors de la création')
    }
  }

  if (loading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error.message}</div>

  return (
    <div>
      {/* Afficher les données */}
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

### ✏️ Modifier une feature existante

#### 1. Identifier les fichiers à modifier
- **Page principale**: `/app/[feature]/page.js`
- **Composants**: `/components/[feature]/`
- **API client**: `/lib/api-client.js`
- **Store** (si applicable): `/lib/stores/`

#### 2. Exemple: Ajouter un champ au profil utilisateur

```javascript
// 1. Modifier l'API client
export const usersAPI = {
  updateProfile: (data) => api.patch('/users/me', data), // ✅ Déjà correct
  // Ajouter si besoin
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
```

```jsx
// 2. Modifier le composant profil
// app/profile/page.js - Ajouter dans le formulaire
<div className="space-y-2">
  <Label htmlFor="phone">Nouveau champ téléphone</Label>
  <Input
    id="phone"
    {...form.register('phone')}
    placeholder="+33 1 23 45 67 89"
  />
</div>
```

#### 3. Exemple: Modifier une permission
```javascript
// lib/stores/auth-store.js
const ROLE_DEFINITIONS = {
  '2': {
    // ...
    permissions: [
      'company_manage',
      'users_manage',
      // ➕ Ajouter nouvelle permission
      'advanced_reports_access',
      // ... autres permissions
    ]
  }
}
```

### 🔄 Workflow de développement recommandé

#### 1. Planification
- [ ] Définir les besoins utilisateur
- [ ] Concevoir l'API (endpoints, schémas)
- [ ] Créer les maquettes UI
- [ ] Identifier les composants réutilisables

#### 2. Développement Backend d'abord
- [ ] Implémenter les endpoints FastAPI
- [ ] Tester avec des outils comme Postman
- [ ] Documenter l'API (OpenAPI/Swagger)

#### 3. Développement Frontend
- [ ] Créer les clients API
- [ ] Développer les composants UI
- [ ] Implémenter la logique métier
- [ ] Gérer les états de chargement/erreur

#### 4. Tests et validation
- [ ] Tests unitaires (composants)
- [ ] Tests d'intégration (API)
- [ ] Tests utilisateur (UX/UI)
- [ ] Validation accessibilité

## 🚨 Gestion des erreurs

### Intercepteur global
```javascript
// lib/api.js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré - redirection login
      Cookies.remove('ferdi_token')
      window.location.href = '/auth/login'
    }
    
    // Log des erreurs en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.data || error.message)
    }
    
    return Promise.reject(error)
  }
)
```

### Gestion d'erreurs dans les composants
```jsx
import { toast } from 'sonner'

const handleAction = async () => {
  try {
    await monAPI.action()
    toast.success('Action réussie!')
  } catch (error) {
    const message = error.response?.data?.detail || 'Une erreur est survenue'
    toast.error('Erreur', { description: message })
    console.error('Action failed:', error)
  }
}
```

## 📊 Gestion des états

### Store principal (Zustand)
```javascript
// lib/stores/auth-store.js
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // État
      user: null,
      token: null,
      isLoading: false,
      
      // Actions
      login: async (email, password) => { /* ... */ },
      logout: () => { /* ... */ },
      
      // Sélecteurs
      hasPermission: (permission) => { /* ... */ }
    }),
    {
      name: 'ferdi-auth',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
```

### État local (useState)
```jsx
function MonComposant() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Gestion d'état avec useReducer pour logique complexe
  const [state, dispatch] = useReducer(reducer, initialState)
  
  return <div>...</div>
}
```

## 🎯 Bonnes pratiques

### Sécurité
- ✅ Toujours valider les permissions côté frontend ET backend
- ✅ Utiliser HTTPS en production
- ✅ Nettoyer les inputs utilisateur
- ✅ Gérer l'expiration des sessions

### Performance
- ✅ Utiliser `useCallback` et `useMemo` pour optimiser
- ✅ Implémenter la pagination pour les listes
- ✅ Mettre en cache les données fréquemment utilisées
- ✅ Optimiser les images (Next.js Image)

### Code quality
- ✅ Composants petits et réutilisables
- ✅ Nommage explicite des variables/fonctions
- ✅ Comments pour la logique complexe
- ✅ Gestion d'erreurs cohérente

### UX/UI
- ✅ États de chargement visibles
- ✅ Messages d'erreur explicites
- ✅ Interface responsive (mobile-first)
- ✅ Feedback utilisateur (toasts, confirmations)

## 📧 Configuration du reset password

### URL de réinitialisation
Quand l'utilisateur clique sur le lien dans l'email, il doit être redirigé vers:
```
https://votre-domaine.com/auth/reset-password?token=ABC123XYZ
```

### Configuration email backend
```python
# Dans votre backend FastAPI
email_content = f"""
Bonjour,

Cliquez sur ce lien pour réinitialiser votre mot de passe :
{FRONTEND_URL}/auth/reset-password?token={reset_token}

Ce lien expire dans 24 heures.

L'équipe FERDI
"""
```

### Flow complet
1. **Utilisateur**: Clique "Mot de passe oublié" → Modal s'ouvre
2. **Frontend**: Appelle `POST /api/password-recovery/{email}`
3. **Backend**: Génère token + envoie email avec lien
4. **Utilisateur**: Clique lien email → Redirigé vers `/auth/reset-password?token=...`
5. **Frontend**: Affiche formulaire nouveau mot de passe
6. **Frontend**: Appelle `POST /api/reset-password/` avec token + nouveau mot de passe
7. **Backend**: Valide token + met à jour mot de passe
8. **Frontend**: Affiche succès + redirection login

## 🛠️ Outils de développement

### Extensions VS Code recommandées
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Prettier - Code formatter
- ESLint

### Commandes utiles
```bash
# Générer un composant shadcn/ui
npx shadcn-ui@latest add button

# Analyser le bundle
npm run build && npm run analyze

# Vérifier les types
npm run type-check

# Linter
npm run lint
```

## 📞 Support et contribution

### Structure des commits
```bash
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(profile): correct API call method"
git commit -m "docs(readme): update installation guide"
```

### Signalement de bugs
Créer une issue avec:
- Description claire du problème
- Étapes de reproduction
- Comportement attendu vs observé
- Screenshots si applicable
- Informations environnement (navigateur, OS)

---

Cette documentation est maintenue par l'équipe de développement FERDI.
Dernière mise à jour: Janvier 2025