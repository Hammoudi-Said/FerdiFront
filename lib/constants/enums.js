// FERDI Application Enums - Based on OpenAPI Specification
// Utilise les valeurs exactes de la spécification API

/**
 * User Roles Enum - Rôles des utilisateurs
 * Basé sur l'enum UserRole de l'API OpenAPI
 */
export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN', 
  DISPATCH: 'DISPATCH',
  DRIVER: 'DRIVER',
  INTERNAL_SUPPORT: 'INTERNAL_SUPPORT',
  ACCOUNTANT: 'ACCOUNTANT'
}

/**
 * User Status Enum - Statuts des utilisateurs
 * Basé sur l'enum UserStatus de l'API OpenAPI
 */
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE', 
  PENDING: 'PENDING',
  LOCKED: 'LOCKED'
}

/**
 * Company Status Enum - Statuts des entreprises
 * Basé sur l'enum CompanyStatus de l'API OpenAPI
 */
export const CompanyStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
}

/**
 * Subscription Plan Enum - Plans d'abonnement
 * Basé sur l'enum SubscriptionPlan de l'API OpenAPI
 */
export const SubscriptionPlan = {
  FREETRIAL: 'FREETRIAL',
  ESSENTIAL: 'ESSENTIAL', 
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM'
}

/**
 * Access Log Actions Enum - Actions pour les logs d'accès
 * Basé sur l'enum AccessLogAction de l'API OpenAPI
 */
export const AccessLogAction = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET: 'PASSWORD_RESET',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  PERMISSION_GRANTED: 'PERMISSION_GRANTED',
  PERMISSION_REVOKED: 'PERMISSION_REVOKED',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  COMPANY_CREATED: 'COMPANY_CREATED',
  COMPANY_UPDATED: 'COMPANY_UPDATED',
  ROLE_CHANGED: 'ROLE_CHANGED',
  DATA_ACCESS: 'DATA_ACCESS',
  DATA_EXPORT: 'DATA_EXPORT',
  SYSTEM_ACCESS: 'SYSTEM_ACCESS'
}

// Définitions étendues des rôles avec permissions et métadonnées
export const ROLE_DEFINITIONS = {
  [UserRole.SUPER_ADMIN]: {
    id: UserRole.SUPER_ADMIN,
    name: UserRole.SUPER_ADMIN,
    label: 'Admin Ferdi',
    description: 'Administrateur système - Accès total multi-entreprises',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    priority: 1,
    permissions: [
      '*', // All permissions
      'multi_company_access',
      'system_admin',
      'support_all_clients',
      'view_all_companies',
      'manage_all_users',
      'system_settings',
      'audit_logs'
    ],
  },
  [UserRole.ADMIN]: {
    id: UserRole.ADMIN,
    name: UserRole.ADMIN,
    label: 'Administrateur',
    description: 'Administrateur entreprise - Gestion complète',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    priority: 2,
    permissions: [
      'company_manage',
      'users_manage',
      'fleet_manage',
      'routes_manage',
      'drivers_manage',
      'schedule_manage',
      'billing_manage',
      'quotes_manage',
      'reports_access',
      'company_settings',
      'invitations_manage'
    ],
  },
  [UserRole.DISPATCH]: {
    id: UserRole.DISPATCH,
    name: UserRole.DISPATCH,
    label: 'Dispatcheur',
    description: 'Gestionnaire opérations - Planning et affectations',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    priority: 3,
    permissions: [
      'routes_manage',
      'schedule_manage',
      'drivers_assign',
      'fleet_view',
      'drivers_view',
      'circulation_data',
      'route_optimization',
      'planning_full'
    ],
  },
  [UserRole.DRIVER]: {
    id: UserRole.DRIVER,
    name: UserRole.DRIVER,
    label: 'Chauffeur',
    description: 'Chauffeur - Accès limité aux missions assignées',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    priority: 4,
    permissions: [
      'routes_view_assigned',
      'schedule_view_assigned',
      'vehicle_check',
      'trip_status_update',
      'profile_manage'
    ],
  },
  [UserRole.INTERNAL_SUPPORT]: {
    id: UserRole.INTERNAL_SUPPORT,
    name: UserRole.INTERNAL_SUPPORT,
    label: 'Support Interne',
    description: 'Support client - Assistance et consultation',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    priority: 5,
    permissions: [
      'support_access',
      'users_view',
      'routes_view',
      'fleet_view',
      'drivers_view',
      'client_assistance',
      'basic_reports'
    ],
  },
  [UserRole.ACCOUNTANT]: {
    id: UserRole.ACCOUNTANT,
    name: UserRole.ACCOUNTANT,
    label: 'Comptable',
    description: 'Comptabilité - Facturation et rapports financiers',
    color: 'bg-teal-500',
    textColor: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-300',
    priority: 6,
    permissions: [
      'billing_manage',
      'invoices_manage',
      'quotes_view',
      'reports_access',
      'financial_reports',
      'exports_access',
      'payment_tracking'
    ],
  }
}

// Status definitions avec styles
export const STATUS_DEFINITIONS = {
  [UserStatus.ACTIVE]: {
    label: 'Actif',
    description: 'Utilisateur actif et opérationnel',
    color: 'bg-green-500',
    textColor: 'text-green-700', 
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300'
  },
  [UserStatus.INACTIVE]: {
    label: 'Inactif',
    description: 'Utilisateur temporairement désactivé',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50', 
    borderColor: 'border-gray-300'
  },
  [UserStatus.PENDING]: {
    label: 'En attente',
    description: 'En attente de validation',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300' 
  },
  [UserStatus.LOCKED]: {
    label: 'Verrouillé',
    description: 'Compte verrouillé pour raisons de sécurité',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300'
  }
}

// Company status definitions
export const COMPANY_STATUS_DEFINITIONS = {
  [CompanyStatus.ACTIVE]: {
    label: 'Active',
    description: 'Entreprise active et opérationnelle',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300'
  },
  [CompanyStatus.INACTIVE]: {
    label: 'Inactive', 
    description: 'Entreprise temporairement inactive',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300'
  },
  [CompanyStatus.SUSPENDED]: {
    label: 'Suspendue',
    description: 'Entreprise suspendue par l\'administration',
    color: 'bg-red-500', 
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300'
  }
}

// Subscription plan definitions 
export const SUBSCRIPTION_PLAN_DEFINITIONS = {
  [SubscriptionPlan.FREETRIAL]: {
    label: 'Essai Gratuit',
    description: 'Période d\'essai gratuite - Fonctionnalités limitées',
    maxUsers: 1,
    maxVehicles: 3,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300'
  },
  [SubscriptionPlan.ESSENTIAL]: {
    label: 'Essentiel',
    description: 'Plan de base pour petites entreprises',
    maxUsers: 5,
    maxVehicles: 10,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-300'
  },
  [SubscriptionPlan.STANDARD]: {
    label: 'Standard',
    description: 'Plan complet pour entreprises moyennes',
    maxUsers: 25,
    maxVehicles: 50,
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300'
  },
  [SubscriptionPlan.PREMIUM]: {
    label: 'Premium',
    description: 'Plan illimité pour grandes entreprises',
    maxUsers: -1, // Unlimited
    maxVehicles: -1, // Unlimited
    color: 'bg-gold-500',
    textColor: 'text-gold-700', 
    bgColor: 'bg-gold-50',
    borderColor: 'border-gold-300'
  }
}

// Utility functions
export const getRoleDefinition = (role) => ROLE_DEFINITIONS[role] || null
export const getStatusDefinition = (status) => STATUS_DEFINITIONS[status] || null
export const getCompanyStatusDefinition = (status) => COMPANY_STATUS_DEFINITIONS[status] || null
export const getSubscriptionPlanDefinition = (plan) => SUBSCRIPTION_PLAN_DEFINITIONS[plan] || null

// Role hierarchy helpers
export const getRolePriority = (role) => ROLE_DEFINITIONS[role]?.priority || 999
export const isRoleHigherOrEqual = (userRole, requiredRole) => {
  const userPriority = getRolePriority(userRole)
  const requiredPriority = getRolePriority(requiredRole)
  return userPriority <= requiredPriority
}

// Permission helpers
export const hasPermission = (userRole, permission) => {
  const roleData = ROLE_DEFINITIONS[userRole]
  if (!roleData) return false
  
  // Super admin has all permissions
  if (roleData.permissions.includes('*')) return true
  
  return roleData.permissions.includes(permission)
}

// Status helpers
export const isActiveStatus = (status) => status === UserStatus.ACTIVE
export const isPendingStatus = (status) => status === UserStatus.PENDING
export const isLockedStatus = (status) => status === UserStatus.LOCKED
export const isInactiveStatus = (status) => status === UserStatus.INACTIVE

// Company status helpers  
export const isActiveCompany = (status) => status === CompanyStatus.ACTIVE
export const isInactiveCompany = (status) => status === CompanyStatus.INACTIVE
export const isSuspendedCompany = (status) => status === CompanyStatus.SUSPENDED

// Export all enums as a single object for convenience
export const FERDI_ENUMS = {
  UserRole,
  UserStatus, 
  CompanyStatus,
  SubscriptionPlan,
  AccessLogAction
}

export default FERDI_ENUMS