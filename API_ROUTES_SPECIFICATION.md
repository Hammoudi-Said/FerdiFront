# 📋 FERDI - Spécifications des Routes API Backend

## 🔗 Base URL
```
http://localhost:8000/api/v1
```

---

## 🔐 1. AUTHENTICATION & USERS

### POST /companies/register
**Description**: Inscription d'une nouvelle entreprise avec manager
**Input**:
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
    "website": "https://www.transport-bretagne.fr"
  },
  "manager_email": "manager@transport-bretagne.fr",
  "manager_password": "SecurePass123!",
  "manager_first_name": "Jean",
  "manager_last_name": "Dupont",
  "manager_mobile": "0612345678"
}
```
**Output**:
```json
{
  "company": {
    "id": "comp-12345-67890",
    "name": "Transport Bretagne SARL",
    "company_code": "BRE-12345-ABC",
    "siret": "12345678901234",
    "address": "15 Rue de la Gare",
    "city": "Quimper", 
    "postal_code": "29000",
    "country": "France",
    "phone": "0298554433",
    "email": "contact@transport-bretagne.fr",
    "website": "https://www.transport-bretagne.fr",
    "status": "active",
    "subscription_plan": "2",
    "max_users": 20,
    "max_vehicles": 20,
    "created_at": "2024-01-15T10:00:00Z"
  },
  "company_code": "BRE-12345-ABC",
  "manager_id": "user-admin-001",
  "message": "Entreprise créée avec succès. Votre code entreprise est BRE-12345-ABC"
}
```

### POST /users/signup
**Description**: Inscription d'un nouvel utilisateur dans une entreprise
**Input**:
```json
{
  "first_name": "Pierre",
  "last_name": "Bernard", 
  "email": "pierre.bernard@transport-bretagne.fr",
  "mobile": "0698765432",
  "password": "UserPass123!",
  "company_code": "BRE-12345-ABC",
  "role": "4"
}
```
**Output**:
```json
{
  "id": "user-new-001",
  "email": "pierre.bernard@transport-bretagne.fr",
  "first_name": "Pierre",
  "last_name": "Bernard", 
  "full_name": "Pierre Bernard",
  "mobile": "0698765432",
  "role": "4",
  "status": "1",
  "is_active": true,
  "created_at": "2024-12-15T10:00:00Z",
  "last_login_at": null
}
```

### POST /login/access-token
**Description**: Connexion utilisateur (OAuth2 Password Flow)
**Headers**: `Content-Type: application/x-www-form-urlencoded`
**Input (Form Data)**:
```
grant_type=password
username=manager@transport-bretagne.fr
password=SecurePass123!
scope=
client_id=
client_secret=
```
**Output**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

### GET /users/me
**Description**: Récupérer le profil de l'utilisateur actuel
**Headers**: `Authorization: Bearer {access_token}`
**Output**:
```json
{
  "id": "user-admin-001",
  "email": "manager@transport-bretagne.fr",
  "first_name": "Jean",
  "last_name": "Dupont",
  "full_name": "Jean Dupont", 
  "mobile": "0612345678",
  "role": "2",
  "status": "1",
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "last_login_at": "2024-12-15T09:30:00Z"
}
```

### PUT /users/me
**Description**: Modifier le profil de l'utilisateur actuel
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "mobile": "0612345678"
}
```
**Output**: Même structure que GET /users/me

### PUT /users/me/password
**Description**: Changer le mot de passe de l'utilisateur actuel
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "current_password": "SecurePass123!",
  "new_password": "NewSecurePass456!"
}
```
**Output**:
```json
{
  "message": "Mot de passe modifié avec succès"
}
```

### GET /companies/me
**Description**: Récupérer les données de l'entreprise de l'utilisateur
**Headers**: `Authorization: Bearer {access_token}`
**Output**:
```json
{
  "id": "comp-12345-67890",
  "name": "Transport Bretagne SARL",
  "company_code": "BRE-12345-ABC",
  "siret": "12345678901234",
  "address": "15 Rue de la Gare",
  "city": "Quimper",
  "postal_code": "29000", 
  "country": "France",
  "phone": "0298554433",
  "email": "contact@transport-bretagne.fr",
  "website": "https://www.transport-bretagne.fr",
  "status": "active",
  "subscription_plan": "2",
  "max_users": 20,
  "max_vehicles": 20,
  "created_at": "2024-01-15T10:00:00Z"
}
```

### PUT /companies/me
**Description**: Modifier les données de l'entreprise
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "name": "Transport Bretagne SARL",
  "address": "15 Rue de la Gare",
  "city": "Quimper",
  "postal_code": "29000",
  "phone": "0298554433",
  "email": "contact@transport-bretagne.fr",
  "website": "https://www.transport-bretagne.fr"
}
```
**Output**: Même structure que GET /companies/me

### GET /companies/me/stats
**Description**: Statistiques de l'entreprise
**Headers**: `Authorization: Bearer {access_token}`
**Output**:
```json
{
  "users_count": 15,
  "vehicles_count": 8,
  "missions_count": 125,
  "active_missions_count": 5,
  "monthly_revenue": 45000.00,
  "monthly_missions": 28
}
```

---

## 👥 2. USER MANAGEMENT

### GET /users/
**Description**: Liste des utilisateurs de l'entreprise
**Headers**: `Authorization: Bearer {access_token}`
**Query Parameters**: `page=1&limit=50&role=all&status=all&search=`
**Output**:
```json
{
  "data": [
    {
      "id": "user-admin-001",
      "email": "manager@transport-bretagne.fr",
      "first_name": "Jean",
      "last_name": "Dupont",
      "full_name": "Jean Dupont",
      "mobile": "0612345678",
      "role": "2",
      "status": "1", 
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z",
      "last_login_at": "2024-12-15T09:30:00Z"
    }
  ],
  "count": 15,
  "page": 1,
  "limit": 50,
  "total_pages": 1
}
```

### POST /users/
**Description**: Créer un nouvel utilisateur
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "first_name": "Marie",
  "last_name": "Martin",
  "email": "marie.martin@transport-bretagne.fr",
  "mobile": "0687654321", 
  "role": "3",
  "password": "TempPass123!"
}
```
**Output**: Structure utilisateur comme GET /users/me

### GET /users/{user_id}
**Description**: Détails d'un utilisateur spécifique
**Headers**: `Authorization: Bearer {access_token}`
**Output**: Structure utilisateur comme GET /users/me

### PUT /users/{user_id}
**Description**: Modifier un utilisateur
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "first_name": "Marie",
  "last_name": "Martin",
  "mobile": "0687654321",
  "role": "3",
  "is_active": true
}
```
**Output**: Structure utilisateur comme GET /users/me

### DELETE /users/{user_id}
**Description**: Supprimer un utilisateur
**Headers**: `Authorization: Bearer {access_token}`
**Output**:
```json
{
  "message": "Utilisateur supprimé avec succès"
}
```

---

## 🚛 3. VEHICLE FLEET MANAGEMENT

### GET /vehicles/
**Description**: Liste des véhicules de la flotte
**Headers**: `Authorization: Bearer {access_token}`
**Query Parameters**: `page=1&limit=50&status=all&vehicle_type=all&search=`
**Output**:
```json
{
  "data": [
    {
      "id": "vehicle-001",
      "license_plate": "AB-123-CD",
      "brand": "Mercedes",
      "model": "Travego", 
      "vehicle_type": "autocar",
      "capacity": 55,
      "year": 2020,
      "color": "Blanc",
      "status": "available",
      "mileage": 125000,
      "fuel_type": "diesel",
      "insurance_expiry": "2025-12-31T00:00:00Z",
      "technical_control_expiry": "2025-06-30T00:00:00Z",
      "created_at": "2024-01-15T10:00:00Z",
      "last_maintenance": "2024-11-01T00:00:00Z"
    }
  ],
  "count": 8,
  "page": 1,
  "limit": 50,
  "total_pages": 1
}
```

### POST /vehicles/
**Description**: Ajouter un nouveau véhicule
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "license_plate": "AB-123-CD",
  "brand": "Mercedes",
  "model": "Travego",
  "vehicle_type": "autocar",
  "capacity": 55,
  "year": 2020,
  "color": "Blanc", 
  "fuel_type": "diesel",
  "insurance_expiry": "2025-12-31T00:00:00Z",
  "technical_control_expiry": "2025-06-30T00:00:00Z"
}
```
**Output**: Structure véhicule comme GET /vehicles/

### GET /vehicles/{vehicle_id}
**Description**: Détails d'un véhicule spécifique
**Headers**: `Authorization: Bearer {access_token}`
**Output**: Structure véhicule comme dans GET /vehicles/

### PUT /vehicles/{vehicle_id}
**Description**: Modifier un véhicule
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "brand": "Mercedes",
  "model": "Travego",
  "vehicle_type": "autocar",
  "capacity": 55,
  "year": 2020,
  "color": "Blanc",
  "fuel_type": "diesel",
  "mileage": 127000,
  "insurance_expiry": "2025-12-31T00:00:00Z",
  "technical_control_expiry": "2025-06-30T00:00:00Z"
}
```
**Output**: Structure véhicule comme GET /vehicles/

### DELETE /vehicles/{vehicle_id}
**Description**: Supprimer un véhicule
**Headers**: `Authorization: Bearer {access_token}`
**Output**:
```json
{
  "message": "Véhicule supprimé avec succès"
}
```

### PUT /vehicles/{vehicle_id}/status
**Description**: Changer le statut d'un véhicule
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "status": "maintenance"
}
```
**Output**: Structure véhicule comme GET /vehicles/

### GET /vehicles/{vehicle_id}/maintenance
**Description**: Historique de maintenance d'un véhicule
**Headers**: `Authorization: Bearer {access_token}`  
**Output**:
```json
{
  "data": [
    {
      "id": "maint-001",
      "vehicle_id": "vehicle-001",  
      "date": "2024-12-01T10:00:00Z",
      "type": "Révision complète",
      "description": "Révision des 120 000 km avec changement filtres et huile",
      "cost": 850.00,
      "mileage": 120000,
      "status": "completed",
      "next_maintenance_mileage": 140000,
      "created_at": "2024-12-01T10:00:00Z"
    }
  ],
  "count": 5
}
```

### POST /vehicles/{vehicle_id}/maintenance
**Description**: Ajouter un record de maintenance
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "date": "2024-12-15T14:00:00Z",
  "type": "Révision complète",
  "description": "Révision des 120 000 km avec changement filtres et huile",
  "cost": 850.00, 
  "mileage": 120000,
  "next_maintenance_mileage": 140000
}
```
**Output**: Structure maintenance comme GET /vehicles/{vehicle_id}/maintenance

---

## 🗺️ 4. MISSION MANAGEMENT

### GET /missions/
**Description**: Liste des missions
**Headers**: `Authorization: Bearer {access_token}`
**Query Parameters**: `page=1&limit=50&status=all&driver_id=&vehicle_id=&start_date=&end_date=&search=`
**Output**:
```json
{
  "data": [
    {
      "id": "mission-001",
      "mission_number": "MSN-2025-001",
      "title": "Transport scolaire Lyon - Paris",
      "departure_location": "Lyon, Place Bellecour",
      "destination": "Paris, Gare de Lyon", 
      "departure_date": "2025-01-15T08:00:00Z",
      "return_date": "2025-01-15T20:00:00Z",
      "passenger_count": 45,
      "status": "confirmed",
      "vehicle_id": "vehicle-001",
      "driver_id": "user-driver-001",
      "client_name": "Lycée Jean Moulin",
      "client_phone": "04 78 12 34 56",
      "client_email": "contact@lycee-moulin.fr",
      "special_instructions": "Arrêt prévu à Mâcon pour pause déjeuner",
      "estimated_cost": 1250.00,
      "created_at": "2024-12-01T10:00:00Z",
      "vehicle": {
        "license_plate": "AB-123-CD",
        "brand": "Mercedes", 
        "model": "Travego"
      },
      "driver": {
        "first_name": "Pierre",
        "last_name": "Bernard"
      }
    }
  ],
  "count": 125,
  "page": 1,
  "limit": 50,
  "total_pages": 3
}
```

### POST /missions/
**Description**: Créer une nouvelle mission
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "title": "Transport scolaire Lyon - Paris",
  "departure_location": "Lyon, Place Bellecour",
  "destination": "Paris, Gare de Lyon",
  "departure_date": "2025-01-15T08:00:00Z",
  "return_date": "2025-01-15T20:00:00Z", 
  "passenger_count": 45,
  "client_name": "Lycée Jean Moulin",
  "client_phone": "04 78 12 34 56",
  "client_email": "contact@lycee-moulin.fr",
  "special_instructions": "Arrêt prévu à Mâcon pour pause déjeuner",
  "estimated_cost": 1250.00
}
```
**Output**: Structure mission comme GET /missions/

### GET /missions/{mission_id}
**Description**: Détails d'une mission spécifique  
**Headers**: `Authorization: Bearer {access_token}`
**Output**: Structure mission comme dans GET /missions/

### PUT /missions/{mission_id}
**Description**: Modifier une mission
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "title": "Transport scolaire Lyon - Paris",
  "departure_location": "Lyon, Place Bellecour", 
  "destination": "Paris, Gare de Lyon",
  "departure_date": "2025-01-15T08:00:00Z",
  "return_date": "2025-01-15T20:00:00Z",
  "passenger_count": 45,
  "client_name": "Lycée Jean Moulin",
  "client_phone": "04 78 12 34 56",
  "client_email": "contact@lycee-moulin.fr", 
  "special_instructions": "Arrêt prévu à Mâcon pour pause déjeuner",
  "estimated_cost": 1250.00
}
```
**Output**: Structure mission comme GET /missions/

### DELETE /missions/{mission_id}
**Description**: Supprimer une mission
**Headers**: `Authorization: Bearer {access_token}`
**Output**:
```json
{
  "message": "Mission supprimée avec succès"
}
```

### PUT /missions/{mission_id}/status
**Description**: Changer le statut d'une mission
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "status": "confirmed"
}
```
**Output**: Structure mission comme GET /missions/

### PUT /missions/{mission_id}/assign-driver
**Description**: Assigner un chauffeur à une mission
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "driver_id": "user-driver-001"
}
```
**Output**: Structure mission comme GET /missions/

### PUT /missions/{mission_id}/assign-vehicle
**Description**: Assigner un véhicule à une mission  
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "vehicle_id": "vehicle-001"
}
```
**Output**: Structure mission comme GET /missions/

### GET /missions/date-range
**Description**: Missions dans une période donnée
**Headers**: `Authorization: Bearer {access_token}`
**Query Parameters**: `start_date=2025-01-01&end_date=2025-01-31&status=all&driver_id=&vehicle_id=`
**Output**: Même structure que GET /missions/

### GET /drivers/{driver_id}/missions
**Description**: Missions assignées à un chauffeur
**Headers**: `Authorization: Bearer {access_token}`
**Query Parameters**: `page=1&limit=50&status=all&start_date=&end_date=`
**Output**: Même structure que GET /missions/

---

## 📅 5. PLANNING & SCHEDULING

### GET /planning/
**Description**: Planning général avec missions, véhicules et chauffeurs
**Headers**: `Authorization: Bearer {access_token}`
**Query Parameters**: `start_date=2025-01-01&end_date=2025-01-31&view=week`
**Output**:
```json
{
  "missions": [
    {
      "id": "mission-001",
      "mission_number": "MSN-2025-001", 
      "title": "Transport scolaire Lyon - Paris",
      "departure_date": "2025-01-15T08:00:00Z",
      "return_date": "2025-01-15T20:00:00Z",
      "status": "confirmed",
      "vehicle_id": "vehicle-001",
      "driver_id": "user-driver-001",
      "vehicle": {
        "license_plate": "AB-123-CD",
        "brand": "Mercedes",
        "model": "Travego"
      },
      "driver": {  
        "first_name": "Pierre",
        "last_name": "Bernard"
      }
    }
  ],
  "vehicles": [
    {
      "id": "vehicle-001",
      "license_plate": "AB-123-CD",
      "brand": "Mercedes",
      "model": "Travego",
      "status": "in_use",
      "current_mission_id": "mission-001"
    }
  ],
  "drivers": [
    {
      "id": "user-driver-001", 
      "first_name": "Pierre",
      "last_name": "Bernard",
      "status": "assigned",
      "current_mission_id": "mission-001"
    }
  ]
}
```

### PUT /planning/
**Description**: Mettre à jour le planning (réassignations multiples)
**Headers**: `Authorization: Bearer {access_token}`
**Input**:
```json
{
  "updates": [
    {
      "mission_id": "mission-001",
      "driver_id": "user-driver-002",
      "vehicle_id": "vehicle-002"
    },
    {
      "mission_id": "mission-002", 
      "driver_id": "user-driver-001",
      "vehicle_id": "vehicle-001"
    }
  ]
}
```
**Output**:
```json
{
  "message": "Planning mis à jour avec succès",
  "updated_missions": 2
}
```

### GET /planning/drivers/{driver_id}/availability
**Description**: Disponibilité d'un chauffeur sur une période
**Headers**: `Authorization: Bearer {access_token}`
**Query Parameters**: `start_date=2025-01-01&end_date=2025-01-31`
**Output**:
```json
{
  "driver_id": "user-driver-001",
  "availability": [
    {
      "date": "2025-01-15",
      "status": "occupied",
      "mission_id": "mission-001",
      "time_slots": [
        {
          "start": "08:00",
          "end": "20:00", 
          "status": "occupied"
        }
      ]
    },
    {
      "date": "2025-01-16",
      "status": "available",
      "time_slots": [
        {
          "start": "00:00",
          "end": "23:59",
          "status": "available"
        }
      ]
    }
  ]
}
```

### GET /planning/vehicles/{vehicle_id}/availability
**Description**: Disponibilité d'un véhicule sur une période
**Headers**: `Authorization: Bearer {access_token}`
**Query Parameters**: `start_date=2025-01-01&end_date=2025-01-31`
**Output**:
```json
{
  "vehicle_id": "vehicle-001",
  "availability": [
    {
      "date": "2025-01-15",
      "status": "occupied",
      "mission_id": "mission-001",
      "time_slots": [
        {
          "start": "08:00",
          "end": "20:00",
          "status": "occupied"
        }
      ]
    },
    {
      "date": "2025-01-16", 
      "status": "available",
      "time_slots": [
        {
          "start": "00:00",
          "end": "23:59",
          "status": "available"
        }
      ]
    }
  ]
}
```

---

## 📊 6. DASHBOARD & STATISTICS

### GET /dashboard/stats
**Description**: Statistiques générales pour le tableau de bord
**Headers**: `Authorization: Bearer {access_token}`
**Output**:
```json
{
  "missions": {
    "total": 125,
    "confirmed": 45,
    "pending": 15,
    "completed": 60,
    "cancelled": 5
  },
  "vehicles": {
    "total": 8,
    "available": 5,
    "in_use": 2, 
    "maintenance": 1,
    "out_of_service": 0
  },
  "drivers": {
    "total": 12,
    "available": 8,
    "assigned": 3,
    "inactive": 1
  },
  "revenue": {
    "monthly": 45000.00,
    "yearly": 485000.00,
    "missions_this_month": 28
  }
}
```

### GET /dashboard/upcoming-missions
**Description**: Prochaines missions à venir
**Headers**: `Authorization: Bearer {access_token}`
**Query Parameters**: `limit=10`
**Output**:
```json
{
  "data": [
    {
      "id": "mission-001",
      "mission_number": "MSN-2025-001",
      "title": "Transport scolaire Lyon - Paris",
      "departure_date": "2025-01-15T08:00:00Z",
      "departure_location": "Lyon, Place Bellecour",
      "destination": "Paris, Gare de Lyon",
      "status": "confirmed",
      "passenger_count": 45,
      "vehicle": {
        "license_plate": "AB-123-CD",
        "brand": "Mercedes",
        "model": "Travego"
      },
      "driver": {
        "first_name": "Pierre", 
        "last_name": "Bernard"
      }
    }
  ],
  "count": 5
}
```

### GET /dashboard/available-vehicles
**Description**: Véhicules actuellement disponibles
**Headers**: `Authorization: Bearer {access_token}`
**Output**:
```json
{
  "data": [
    {
      "id": "vehicle-002",
      "license_plate": "EF-456-GH", 
      "brand": "Setra",
      "model": "S515HD",
      "vehicle_type": "autocar",
      "capacity": 50,
      "status": "available",
      "last_maintenance": "2024-10-15T00:00:00Z"
    }
  ],
  "count": 5
}
```

### GET /dashboard/available-drivers
**Description**: Chauffeurs actuellement disponibles
**Headers**: `Authorization: Bearer {access_token}`
**Output**:
```json
{
  "data": [
    {
      "id": "user-driver-003",
      "first_name": "Marie",
      "last_name": "Dubois", 
      "full_name": "Marie Dubois",
      "mobile": "0634567890",
      "status": "available",
      "last_mission_date": "2024-12-10T00:00:00Z"
    }
  ],
  "count": 8
}
```

### GET /dashboard/activities
**Description**: Activités récentes de l'entreprise
**Headers**: `Authorization: Bearer {access_token}`
**Query Parameters**: `limit=20`
**Output**:
```json
{
  "data": [
    {
      "id": "activity-001",
      "type": "mission_created",
      "title": "Nouvelle mission créée",
      "description": "Mission MSN-2025-001 créée par Jean Dupont",
      "user_id": "user-admin-001",
      "user_name": "Jean Dupont",
      "created_at": "2024-12-15T10:30:00Z",
      "metadata": {
        "mission_id": "mission-001",
        "mission_number": "MSN-2025-001"
      }
    },
    {
      "id": "activity-002", 
      "type": "vehicle_maintenance",
      "title": "Maintenance programmée",
      "description": "Véhicule AB-123-CD envoyé en maintenance",
      "user_id": "user-admin-001",
      "user_name": "Jean Dupont", 
      "created_at": "2024-12-15T09:15:00Z",
      "metadata": {
        "vehicle_id": "vehicle-001",
        "license_plate": "AB-123-CD"
      }
    }
  ],
  "count": 20
}
```

---

## 🔧 Status Codes & Error Handling

### Success Codes
- `200` - OK (GET, PUT requests)
- `201` - Created (POST requests)
- `204` - No Content (DELETE requests)

### Error Codes
- `400` - Bad Request (Invalid input data)
- `401` - Unauthorized (Invalid or missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource doesn't exist)
- `409` - Conflict (Duplicate data, e.g., email already exists)
- `422` - Unprocessable Entity (Validation errors)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "detail": "Description of the error",
  "field_errors": {
    "email": ["This email is already registered"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

---

## 🔑 Role-Based Access Control

### Roles
1. **Super Admin** (role: "1") - Accès total multi-entreprises
2. **Admin** (role: "2") - Administrateur entreprise cliente  
3. **Dispatcher** (role: "3") - Gestion trajets et chauffeurs
4. **Driver** (role: "4") - Accès limité aux trajets assignés
5. **Internal Support** (role: "5") - Support clients et assistance
6. **Accountant** (role: "6") - Facturation et rapports

### Access Matrix
| Endpoint | Super Admin | Admin | Dispatcher | Driver | Support | Accountant |
|----------|-------------|-------|------------|--------|---------|------------|
| User Management | ✅ | ✅ | ❌ | ❌ | View Only | ❌ |
| Vehicle Management | ✅ | ✅ | View Only | ❌ | View Only | ❌ |
| Mission Management | ✅ | ✅ | ✅ | View Assigned | View Only | ❌ |
| Planning | ✅ | ✅ | ✅ | View Assigned | View Only | ❌ |
| Dashboard Stats | ✅ | ✅ | ✅ | Limited | ✅ | ✅ |

---

## 📝 Notes d'implémentation

1. **Authentication**: Utiliser JWT tokens avec expiration
2. **Pagination**: Implémenter pagination pour toutes les listes
3. **Validation**: Valider toutes les entrées côté serveur
4. **Logging**: Logger toutes les actions importantes
5. **Rate Limiting**: Implémenter rate limiting pour les APIs
6. **CORS**: Configurer CORS approprié pour le frontend
7. **Database**: Utiliser MongoDB avec des collections appropriées
8. **Indexes**: Créer des indexes pour les requêtes fréquentes
9. **Transactions**: Utiliser des transactions pour les opérations critiques
10. **Backup**: Implémenter une stratégie de sauvegarde

---

*Cette documentation couvre toutes les routes nécessaires pour l'application FERDI. Implémentez ces routes en respectant les structures de données spécifiées.*