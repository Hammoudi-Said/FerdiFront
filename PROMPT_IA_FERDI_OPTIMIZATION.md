# 🤖 PROMPT IA - OPTIMISATION FERDI FRONTEND

## 🎯 CONTEXTE & MISSION

Tu es un **expert développeur React/Next.js** spécialisé dans l'optimisation des applications web. Je travaille sur **FERDI**, une application de gestion d'autocars pour autocaristes français.

### 🔴 PROBLÈME CRITIQUE À RÉSOUDRE
L'authentification génère **4-6 appels API simultanés** au lieu de 1-2 optimaux, causant:
- 🐌 Lenteur de connexion (3-5s → objectif: <2s)
- 🚫 Surcharge serveur inutile  
- 😤 Expérience utilisateur dégradée
- 💸 Coûts d'infrastructure élevés

## 📊 ARCHITECTURE TECHNIQUE ACTUELLE

### 🏗️ Stack Technologique
```yaml
Frontend: Next.js 14.2.31
State Management: Zustand + Persist
UI Framework: TailwindCSS + Radix UI
Authentication: JWT + Cookies + SessionStorage
API Layer: Axios + Interceptors
Mock System: Complet pour développement
```

### 🔄 Flux d'Authentification Problématique
```
1. 👤 User submits login → POST /auth/login 
2. ✅ Token received → login() success
3. 🔄 login() calls fetchUserData()
4. 📡 fetchUserData() → GET /users/me (call #1)
5. 📡 fetchUserData() → GET /companies/me (call #2)
6. 🛡️ AuthGuard triggers → checkAuth()
7. 💾 checkAuth() validates cache → FAILS
8. 🔄 checkAuth() calls fetchUserData() AGAIN
9. 📡 GET /users/me (call #3 - DUPLICATE)
10. 📡 GET /companies/me (call #4 - DUPLICATE)
11. 🏠 HomePage triggers → checkAuth() AGAIN
12. 📡 Potentially 2 more duplicate calls (#5-6)
```

## 📁 FICHIERS CRITIQUES À OPTIMISER

### 🔥 **auth-store.js** (Le plus critique - 743 lignes)
```javascript
// PROBLÈMES IDENTIFIÉS:
- fetchUserData() fait 2 appels systématiques (lignes 273-324)
- checkAuth() logique cache complexe (lignes 362-428) 
- login() appelle fetchUserData après auth (ligne 236)
- Cache sessionStorage mal optimisé
- Multiples points d'entrée pour l'auth

// STRUCTURE ACTUELLE:
export const useAuthStore = create(persist(
  (set, get) => ({
    // 124 propriétés et méthodes - TROP COMPLEXE
    login: async (email, password) => { /* 60 lignes */ },
    fetchUserData: async () => { /* 51 lignes - 2 API calls */ },
    checkAuth: async (skipCache) => { /* 66 lignes */ },
    // + 20 autres méthodes...
  })
))
```

### 🛡️ **auth-guard.jsx** (281 lignes)
```javascript
// PROBLÈME: Auth check en doublon avec HomePage
useEffect(() => {
  const performAuthCheck = async () => {
    // Appelle checkAuth() qui peut déclencher fetchUserData()
    const result = await checkAuth()
    // Logic complexe de redirection
  }
  performAuthCheck()
}, [pathname, isInitialized, checkAuth, ...deps])
```

### 🏠 **page.js** (HomePage - 234 lignes)  
```javascript
// PROBLÈME: Second auth check simultané
useEffect(() => {
  const initializeAuth = async () => {
    const result = await checkAuth() // DUPLICATE avec AuthGuard
    // Plus de logique de redirection
  }
  initializeAuth()
}, [checkAuth, isSessionValid, updateActivity])
```

## 🎯 MISSION SPÉCIFIQUE

### ✅ OBJECTIFS PRINCIPAUX
1. **Réduire à 1-2 appels API maximum** lors du login
2. **Implémenter un cache intelligent** avec TTL optimisé
3. **Unifier les auth guards** en single provider
4. **Maintenir la sécurité** et les 6 rôles utilisateurs
5. **Préserver l'UI/UX** existante (très bien conçue)
6. **Garder compatibilité** avec le système de mock data exceptionnel

### 🔧 CONTRAINTES TECHNIQUES
- ✅ Utiliser **Zustand** (ne pas changer pour Redux/Context)
- ✅ Conserver **système de rôles** (super_admin, admin, dispatcher, driver, internal_support, accountant)
- ✅ Maintenir **mock API** pour développement
- ✅ Garder **TailwindCSS** design system (excellent)
- ✅ Préserver **session management** (8h timeout)
- ✅ Supporter **offline mode** existant

## 🚀 LIVRABLES ATTENDUS

### 1. 🔧 **Code Refactorisé** 
```javascript
// auth-store-optimized.js
// - Méthode unique authenticateUser()
// - Cache intelligent unifié  
// - Réduction de 743 → ~300 lignes
// - Single API call strategy
```

### 2. 🛡️ **AuthProvider Unifié**
```javascript
// auth-provider.jsx
// - Remplace AuthGuard + HomePage auth logic
// - Single source of truth
// - Optimized re-renders
```

### 3. ⚡ **Cache System Intelligent**
```javascript
// smart-cache.js
// - TTL unifié et configurable
// - Invalidation intelligente
// - Fallback strategies
```

### 4. 🧪 **Strategy de Tests**
```javascript
// auth.test.js  
// - Tests unitaires pour chaque scénario
// - Mock API integration tests
// - Performance benchmarks
```

### 5. 📊 **Métriques de Performance**
```javascript
// performance-monitor.js
// - API calls tracking
// - Load time measurement  
// - User experience metrics
```

## 🔍 ANALYSE DES APPELS DOUBLÉS

### 📊 **Scénarios Problématiques Identifiés**

#### Scénario A: Login Standard
```
❌ ACTUEL: 6 appels
POST /auth/login → GET /users/me → GET /companies/me → 
GET /users/me (duplicate) → GET /companies/me (duplicate) → 
potential 2 more...

✅ OBJECTIF: 2 appels  
POST /auth/login → GET /auth/profile (combined endpoint)
```

#### Scénario B: Page Refresh  
```
❌ ACTUEL: 4 appels
checkAuth() → cache miss → GET /users/me → GET /companies/me → 
AuthGuard checkAuth() → cache validation fails → duplicates...

✅ OBJECTIF: 1 appel ou cache hit
Smart cache → GET /auth/profile (if needed)
```

### 🎯 **Points d'Optimisation Prioritaires**

1. **Créer endpoint unique** `/auth/profile` qui retourne user + company
2. **Implémenter smart cache** avec invalidation intelligente  
3. **Unifier auth guards** en single provider pattern
4. **Optimiser re-renders** avec React.memo et callbacks
5. **Lazy load** non-critical components

## 💡 APPROCHE RECOMMANDÉE

### Phase 1: Auth Store Optimization
```javascript
// Créé une méthode unique qui remplace login + fetchUserData + checkAuth
const authenticateUser = async (credentials?, skipCache = false) => {
  // Single point of entry pour toute auth
  // Smart cache check first
  // Single API call strategy
  // Unified error handling
}
```

### Phase 2: Provider Pattern
```javascript
// AuthProvider qui wrap toute l'app
// Remplace AuthGuard + HomePage auth logic  
// Context optimisé pour éviter re-renders
```

### Phase 3: Performance Monitoring
```javascript
// Tracking des appels API
// Métriques temps de réponse
// Alertes si degradation
```

## 🔎 DÉTAILS D'IMPLÉMENTATION

### 🎯 **Mock API Compatibility**
Le système de mock data est **excellent** (mock-data.js), preserve:
- `mockAPI.login()` functionality
- `mockAPI.getCurrentUser()` & `mockAPI.getCompany()` 
- All test credentials and company codes
- Error simulation capabilities

### 🛡️ **Security Requirements**
- JWT token validation
- Session timeout (8h)  
- Role-based access control (6 roles)
- Company data isolation
- Activity tracking pour session extend

### ⚡ **Performance Targets**
- Login time: 3-5s → <2s (**-60%**)
- API calls: 4-6 → 1-2 (**-75%**)  
- Bundle size: maintenir <500kb
- Cache hit rate: >80%

## 🤔 QUESTIONS À ADRESSER

1. **Comment structurer le nouveau cache** pour maximiser hit rate?
2. **Quel pattern utiliser** pour éviter race conditions entre AuthGuard/HomePage?
3. **Comment optimiser les re-renders** sans casser l'UI actuelle?
4. **Quelle stratégie d'invalidation** pour le cache lors des updates user/company?
5. **Comment maintenir offline support** avec la nouvelle architecture?

## 📈 SUCCESS CRITERIA

### ✅ **Métriques Quantifiables**
- [ ] Login API calls ≤ 2 (actuellement 4-6)
- [ ] Login time ≤ 2s (actuellement 3-5s)  
- [ ] Cache hit rate ≥ 80%
- [ ] Bundle size unchanged
- [ ] Zero breaking changes UI/UX
- [ ] All 6 roles fonctionnels
- [ ] Mock API fully compatible

### ✅ **Métriques Qualitatives**  
- [ ] Code plus maintenable (moins de lignes)
- [ ] Architecture plus simple
- [ ] Meilleure developer experience
- [ ] Documentation claire
- [ ] Tests coverage ≥ 80%

---

## 🚀 ACTION DEMANDÉE

**Génère une solution complète** incluant:

1. **Code refactorisé complet** pour auth-store.js optimisé
2. **AuthProvider pattern** pour remplacer multiple guards  
3. **Smart cache implementation** avec TTL et invalidation
4. **Performance monitoring** hooks et utilities
5. **Migration plan** étape par étape avec rollback strategy
6. **Tests unitaires** pour valider les optimisations
7. **Documentation** technique pour la maintenance

**Focus spécial sur**:
- 🎯 Élimination complète des appels doublés
- ⚡ Cache intelligent avec hit rate optimisé  
- 🛡️ Sécurité maintenue (JWT, roles, sessions)
- 🎨 Zero breaking changes sur l'excellente UI existante
- 🧪 Compatibilité totale avec le système mock

**Donne-moi du code prêt à implémenter** avec explanations détaillées pour chaque optimisation proposée.