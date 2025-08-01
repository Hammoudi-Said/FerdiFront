# 🚀 Guide de Configuration FERDI

Ce guide vous accompagne pas à pas pour configurer et utiliser l'application FERDI avec votre backend FastAPI.

## 📋 Checklist de configuration

### ✅ 1. Installation de base

```bash
# Cloner le projet
git clone <votre-repository>
cd ferdi-app

# Installer les dépendances
yarn install

# Copier la configuration
cp .env.example .env.local
```

### ✅ 2. Configuration de l'environnement

Éditez le fichier `.env.local` :

```env
# Pour utiliser votre backend FastAPI local
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_DATA=false

# Pour tester avec des données mock
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### ✅ 3. Configuration CORS sur votre backend FastAPI

Assurez-vous que votre backend accepte les requêtes depuis Next.js :

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "https://votre-domaine-production.com"  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### ✅ 4. Vérification des endpoints backend

Votre backend FastAPI doit exposer ces endpoints :

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/v1/companies/register` | POST | Enregistrement entreprise |
| `/api/v1/users/signup` | POST | Inscription utilisateur |
| `/api/v1/login/access-token` | POST | Connexion (form-data) |
| `/api/v1/users/me` | GET | Profil utilisateur actuel |
| `/api/v1/companies/me` | GET | Données entreprise |
| `/api/v1/users/` | GET | Liste des utilisateurs |

### ✅ 5. Format des données attendues

#### Enregistrement d'entreprise (`POST /api/v1/companies/register`)

```json
{
  "company": {
    "name": "Transport Bretagne SARL",
    "siret": "12345678901234",
    "address": "15 Rue de la Gare",
    "city": "Quimper",
    "postal_code": "29000",
    "country": "France",
    "phone": "0298554433",
    "email": "contact@transport-bretagne.fr",
    "website": "https://www.transport-bretagne.fr",
    "subscription_plan": "2"
  },
  "manager_email": "manager@transport-bretagne.fr",
  "manager_password": "SecurePass123!",
  "manager_first_name": "Jean",
  "manager_last_name": "Dupont",
  "manager_phone": "0612345678"
}
```

**Réponse attendue :**
```json
{
  "company": { /* données entreprise */ },
  "company_code": "BRE-12345-ABC",
  "manager_id": "uuid-manager",
  "message": "Entreprise créée avec succès"
}
```

#### Inscription utilisateur (`POST /api/v1/users/signup`)

```json
{
  "email": "employee@transport-bretagne.fr",
  "first_name": "Pierre",
  "last_name": "Martin",
  "mobile": "0687654321",
  "role": "4",
  "password": "EmployeePass123!",
  "company_code": "BRE-12345-ABC"
}
```

#### Connexion (`POST /api/v1/login/access-token`)

**Format form-data :**
```
username: email@exemple.fr
password: motdepasse123
```

**Réponse attendue :**
```json
{
  "access_token": "jwt-token-here",
  "token_type": "bearer"
}
```

### ✅ 6. Test de connectivité

1. **Démarrer votre backend FastAPI**
   ```bash
   # Dans votre projet backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Démarrer le frontend FERDI**
   ```bash
   # Dans le projet FERDI
   yarn dev
   ```

3. **Tester la connexion**
   - Ouvrir `http://localhost:3000`
   - Vérifier que l'application se charge correctement
   - Tester l'enregistrement d'une entreprise
   - Tester la connexion avec les identifiants créés

### ✅ 7. Mode démonstration (optionnel)

Pour tester l'interface sans backend :

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Comptes de test disponibles :
- **Admin** : `manager@transport-bretagne.fr` / `SecurePass123!`
- **Autocariste** : `marie.martin@transport-bretagne.fr` / `DispatcherPass123!`
- **Chauffeur** : `pierre.bernard@transport-bretagne.fr` / `DriverPass123!`

Code entreprise de test : `BRE-12345-ABC`

## 🔍 Résolution des problèmes courants

### Problème : CORS Error
```
Access to fetch at 'http://localhost:8000/api/v1/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution :** Vérifiez la configuration CORS dans votre backend FastAPI.

### Problème : 502 Bad Gateway
```
POST /api/login/access-token 502 (Bad Gateway)
```

**Solution :** Votre backend FastAPI n'est pas démarré ou n'écoute pas sur le bon port.

### Problème : 404 Not Found
```
POST /api/v1/companies/register 404 (Not Found)
```

**Solution :** L'endpoint n'existe pas dans votre backend. Vérifiez les routes.

### Problème : Token invalide
```
GET /api/users/me 401 (Unauthorized)
```

**Solution :** Vérifiez que votre backend gère correctement les tokens JWT Bearer.

### Problème : Format de données
```
422 Unprocessable Entity
```

**Solution :** Vérifiez que les données envoyées correspondent aux schémas Pydantic de votre backend.

## 🧪 Tests recommandés

1. **Test complet d'enregistrement d'entreprise**
   - Créer une nouvelle entreprise
   - Vérifier la génération du code entreprise
   - Tester la connexion du gérant

2. **Test d'inscription d'employé**
   - Utiliser le code entreprise généré
   - Tester différents rôles (Admin, Autocariste, Chauffeur)
   - Vérifier les permissions

3. **Test de navigation basée sur les rôles**
   - Se connecter avec différents rôles
   - Vérifier l'accès aux pages appropriées
   - Tester les restrictions d'accès

4. **Test de gestion des erreurs**
   - Tester avec des identifiants incorrects
   - Tester avec un code entreprise invalide
   - Vérifier la gestion des erreurs réseau

## 📚 Ressources utiles

- **Documentation Next.js** : https://nextjs.org/docs
- **Documentation FastAPI** : https://fastapi.tiangolo.com/
- **Guide CORS FastAPI** : https://fastapi.tiangolo.com/tutorial/cors/
- **JWT avec FastAPI** : https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/

## 🆘 Support

Si vous rencontrez des problèmes :

1. Consultez les logs du navigateur (F12 → Console)
2. Vérifiez les logs de votre backend FastAPI
3. Consultez le fichier `README.md` pour plus de détails
4. Créez une issue avec les détails de l'erreur

---

**Bonne configuration ! 🚀**