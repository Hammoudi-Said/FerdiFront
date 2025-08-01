# 🤝 Guide de Contribution - FERDI

Merci de votre intérêt pour contribuer à FERDI ! Ce guide vous aidera à comprendre comment participer au développement de l'application.

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Configuration de l'environnement de développement](#configuration-de-lenvironnement-de-développement)
- [Standards de code](#standards-de-code)
- [Workflow de développement](#workflow-de-développement)
- [Tests](#tests)
- [Documentation](#documentation)

## 🌟 Code de conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite. Soyez respectueux, inclusif et professionnel dans toutes vos interactions.

## 🚀 Comment contribuer

### Types de contributions

Nous accueillons tous types de contributions :

- 🐛 **Corrections de bugs** : Résolution de problèmes existants
- ✨ **Nouvelles fonctionnalités** : Ajout de nouvelles capacités
- 📚 **Documentation** : Amélioration de la documentation
- 🎨 **Interface utilisateur** : Améliorations UX/UI
- ⚡ **Performance** : Optimisations de performance
- 🧪 **Tests** : Ajout ou amélioration des tests

### Processus de contribution

1. **Fork** le repository
2. **Créer** une branche pour votre contribution
3. **Développer** votre fonctionnalité ou correction
4. **Tester** vos modifications
5. **Commiter** avec des messages clairs
6. **Créer** une Pull Request

## 🛠️ Configuration de l'environnement de développement

### Prérequis

```bash
Node.js 18+
Yarn (recommandé) ou npm
Git
Un éditeur de code (VS Code recommandé)
```

### Installation

1. **Cloner votre fork**
```bash
git clone https://github.com/VOTRE-USERNAME/ferdi-app.git
cd ferdi-app
```

2. **Installer les dépendances**
```bash
yarn install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env.local
```

4. **Configurer les hooks Git**
```bash
yarn prepare  # Configure Husky pour les pre-commit hooks
```

5. **Lancer l'application**
```bash
yarn dev
```

### Extensions VS Code recommandées

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 📏 Standards de code

### Style de code

Nous utilisons **Prettier** et **ESLint** pour maintenir la cohérence du code :

```bash
# Vérifier le style
yarn lint

# Corriger automatiquement
yarn lint:fix

# Formater le code
yarn format
```

### Conventions de nommage

- **Fichiers** : `kebab-case` (ex: `user-profile.jsx`)
- **Composants** : `PascalCase` (ex: `UserProfile`)
- **Variables/Fonctions** : `camelCase` (ex: `getUserData`)
- **Constantes** : `SCREAMING_SNAKE_CASE` (ex: `API_BASE_URL`)

### Structure des composants

```jsx
'use client' // Si nécessaire (client component)

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ComponentProps {
  // TypeScript interfaces en haut
}

export function MonComposant({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks d'état
  const [state, setState] = useState()
  
  // 2. Hooks personnalisés
  const { data, loading } = useCustomHook()
  
  // 3. Fonctions utilitaires
  const handleClick = () => {
    // logique
  }
  
  // 4. Early returns
  if (loading) return <div>Chargement...</div>
  
  // 5. Rendu principal
  return (
    <div className={cn('base-classes', className)}>
      {/* Contenu */}
    </div>
  )
}

export default MonComposant
```

### Standards CSS (Tailwind)

```jsx
// ✅ Bon - Classes organisées et lisibles
<div className={cn(
  // Layout
  'flex items-center justify-between',
  // Spacing
  'p-4 m-2',
  // Styling
  'bg-white rounded-lg shadow-sm',
  // Responsive
  'md:p-6 lg:p-8',
  // Conditional
  error && 'border-red-500',
  className
)}>

// ❌ Mauvais - Classes mélangées
<div className="bg-white p-4 flex md:p-6 items-center shadow-sm justify-between rounded-lg m-2 lg:p-8">
```

## 🔄 Workflow de développement

### Branches

- `main` : Code de production stable
- `develop` : Code de développement
- `feature/nom-fonctionnalité` : Nouvelles fonctionnalités
- `fix/nom-bug` : Corrections de bugs
- `hotfix/nom-correction` : Corrections urgentes

### Messages de commit

Utilisez la convention **Conventional Commits** :

```
type(scope): description

[body optionnel]

[footer optionnel]
```

**Types :**
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage, point-virgules manquants, etc.
- `refactor` : Refactoring du code
- `test` : Ajout de tests
- `chore` : Maintenance

**Exemples :**
```bash
feat(auth): add company registration form
fix(dashboard): resolve sidebar navigation issue
docs(readme): update installation instructions
style(components): format button component
refactor(api): improve error handling
test(auth): add login flow tests
chore(deps): update dependencies
```

### Pull Requests

#### Template de PR

```markdown
## 📝 Description
Décrivez brièvement les changements apportés.

## 🔄 Type de changement
- [ ] Bug fix (correction non-breaking qui résout un problème)
- [ ] New feature (fonctionnalité non-breaking qui ajoute une capacité)
- [ ] Breaking change (correction ou fonctionnalité qui casserait la fonctionnalité existante)
- [ ] Documentation update (amélioration de la documentation)

## 🧪 Comment a-t-il été testé ?
Décrivez les tests que vous avez effectués.

## 📷 Screenshots (si applicable)
Ajoutez des captures d'écran pour les changements UI.

## ✅ Checklist
- [ ] Mon code suit les guidelines du projet
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai commenté mon code dans les parties difficiles à comprendre
- [ ] J'ai mis à jour la documentation correspondante
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai ajouté des tests qui prouvent que ma correction est efficace ou que ma fonctionnalité fonctionne
- [ ] Les tests unitaires nouveaux et existants passent localement
```

## 🧪 Tests

### Écriture de tests

```jsx
// components/__tests__/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Lancement des tests

```bash
# Tests unitaires
yarn test

# Tests avec coverage
yarn test:coverage

# Tests en mode watch
yarn test:watch

# Tests E2E (si configurés)
yarn test:e2e
```

## 📚 Documentation

### Documentation des composants

```jsx
/**
 * Composant Button réutilisable avec variants et tailles
 * 
 * @param {string} variant - Style du bouton ('default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link')
 * @param {string} size - Taille du bouton ('default' | 'sm' | 'lg' | 'icon')
 * @param {boolean} disabled - État désactivé du bouton
 * @param {ReactNode} children - Contenu du bouton
 * @param {function} onClick - Fonction appelée au clic
 */
export function Button({ 
  variant = 'default', 
  size = 'default',
  disabled = false,
  children,
  onClick,
  ...props 
}) {
  // Implementation
}
```

### Documentation des hooks

```jsx
/**
 * Hook personnalisé pour gérer l'authentification
 * 
 * @returns {Object} Object contenant:
 *   - user: Utilisateur connecté ou null
 *   - isLoading: État de chargement
 *   - login: Fonction de connexion
 *   - logout: Fonction de déconnexion
 *   - hasRole: Fonction pour vérifier les permissions
 * 
 * @example
 * const { user, login, logout, hasRole } = useAuth()
 * 
 * if (hasRole('admin')) {
 *   // Afficher contenu admin
 * }
 */
export function useAuth() {
  // Implementation
}
```

## 🎯 Bonnes pratiques

### Performance

```jsx
// ✅ Bon - Utilisation de useMemo pour les calculs coûteux
const expensiveValue = useMemo(() => {
  return items.reduce((acc, item) => acc + item.value, 0)
}, [items])

// ✅ Bon - Utilisation de useCallback pour les fonctions
const handleClick = useCallback((id) => {
  onItemClick(id)
}, [onItemClick])

// ✅ Bon - Lazy loading des composants
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

### Accessibilité

```jsx
// ✅ Bon - Labels et ARIA appropriés
<button
  aria-label="Fermer la modal"
  aria-expanded={isOpen}
  onClick={onClose}
>
  <X className="h-4 w-4" />
</button>

// ✅ Bon - Navigation au clavier
<div
  tabIndex={0}
  role="button"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
```

### Gestion d'erreurs

```jsx
// ✅ Bon - Error boundaries
function ErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={<div>Une erreur s'est produite</div>}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// ✅ Bon - Gestion d'erreurs async
const fetchData = async () => {
  try {
    setLoading(true)
    const data = await api.getData()
    setData(data)
  } catch (error) {
    setError(error.message)
    toast.error('Erreur lors du chargement des données')
  } finally {
    setLoading(false)
  }
}
```

## 🔍 Review Process

### Critères de review

- **Fonctionnalité** : Le code fait-il ce qu'il est censé faire ?
- **Lisibilité** : Le code est-il facile à comprendre ?
- **Performance** : Y a-t-il des optimisations possibles ?
- **Sécurité** : Y a-t-il des vulnérabilités potentielles ?
- **Tests** : Les tests couvrent-ils les cas d'usage ?
- **Documentation** : La documentation est-elle à jour ?

### Processus de review

1. **Auto-review** : Relisez votre propre code avant de soumettre
2. **Tests automatiques** : Assurez-vous que tous les tests passent
3. **Review par les pairs** : Minimum 1 approbation requise
4. **Tests manuels** : Testez les changements UI manuellement
5. **Merge** : Fusion après approbation et tests réussis

## 🚀 Déploiement

### Processus de release

1. **Feature freeze** : Arrêt des nouvelles fonctionnalités
2. **Tests complets** : Tests manuels et automatiques
3. **Documentation** : Mise à jour du changelog
4. **Tag release** : Création du tag de version
5. **Déploiement** : Déploiement en production
6. **Monitoring** : Surveillance post-déploiement

### Versioning

Nous suivons le **Semantic Versioning** (SemVer) :
- `MAJOR.MINOR.PATCH` (ex: 1.2.3)
- **MAJOR** : Breaking changes
- **MINOR** : Nouvelles fonctionnalités (backward compatible)
- **PATCH** : Bug fixes (backward compatible)

## 📞 Aide et support

### Obtenir de l'aide

- 💬 **Discord** : [discord.gg/ferdi-dev](https://discord.gg/ferdi-dev)
- 📧 **Email** : dev@ferdi-app.fr
- 📝 **Issues** : [GitHub Issues](https://github.com/ferdi-app/issues)
- 📚 **Documentation** : [docs.ferdi-app.fr](https://docs.ferdi-app.fr)

### Ressources utiles

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com/)

---

**Merci de contribuer à FERDI ! 🙏**

Votre participation aide à créer une meilleure expérience pour tous les autocaristes français. Chaque contribution, petite ou grande, est précieuse.