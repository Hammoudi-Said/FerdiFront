/**
 * 🔐 PERMISSION MANAGER - Conforme OpenAPI FERDI
 * Gestion centralisée des permissions selon la spécification
 */

import { UserRole, ROLE_DEFINITIONS } from '@/lib/constants/enums'

// ✅ PERMISSIONS SELON OPENAPI SPECIFICATION
export const PERMISSIONS = {
  // 🏢 Company Management
  COMPANY_READ_OWN: 'company_read_own',
  COMPANY_WRITE_OWN: 'company_write_own',
  COMPANY_READ_ALL: 'company_read_all',
  COMPANY_WRITE_ALL: 'company_write_all',
  
  // 👥 User Management  
  USERS_READ_COMPANY: 'users_read_company',
  USERS_WRITE_COMPANY: 'users_write_company',
  USERS_READ_ALL: 'users_read_all',
  USERS_WRITE_ALL: 'users_write_all',
  
  // 📧 Invitations
  INVITATIONS_CREATE: 'invitations_create',
  INVITATIONS_MANAGE: 'invitations_manage',
  
  // 🚗 Fleet Management
  FLEET_READ: 'fleet_read',
  FLEET_WRITE: 'fleet_write',
  FLEET_READ_ASSIGNED: 'fleet_read_assigned',
  
  // 🛣️ Routes & Planning
  ROUTES_READ: 'routes_read',
  ROUTES_WRITE: 'routes_write',
  ROUTES_READ_ASSIGNED: 'routes_read_assigned',
  PLANNING_FULL: 'planning_full',
  PLANNING_READ_ASSIGNED: 'planning_read_assigned',
  
  // 📊 Reports & Analytics
  REPORTS_COMPANY: 'reports_company',
  REPORTS_SYSTEM: 'reports_system',
  AUDIT_LOGS: 'audit_logs',
  
  // ⚙️ System Administration
  SYSTEM_ADMIN: 'system_admin',
  MULTI_COMPANY: 'multi_company',
  
  // 💰 Billing & Finance
  BILLING_READ: 'billing_read',
  BILLING_WRITE: 'billing_write',
}

// ✅ MATRICE DES PERMISSIONS PAR RÔLE SELON OPENAPI
export const ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: [
    // Toutes les permissions système
    PERMISSIONS.SYSTEM_ADMIN,
    PERMISSIONS.MULTI_COMPANY,
    PERMISSIONS.COMPANY_READ_ALL,
    PERMISSIONS.COMPANY_WRITE_ALL,
    PERMISSIONS.USERS_READ_ALL,
    PERMISSIONS.USERS_WRITE_ALL,
    PERMISSIONS.AUDIT_LOGS,
    PERMISSIONS.REPORTS_SYSTEM,
    // + toutes les autres permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [UserRole.ADMIN]: [
    // Administration de SON entreprise uniquement
    PERMISSIONS.COMPANY_READ_OWN,
    PERMISSIONS.COMPANY_WRITE_OWN,
    PERMISSIONS.USERS_READ_COMPANY,
    PERMISSIONS.USERS_WRITE_COMPANY,
    PERMISSIONS.INVITATIONS_CREATE,
    PERMISSIONS.INVITATIONS_MANAGE,
    PERMISSIONS.FLEET_READ,
    PERMISSIONS.FLEET_WRITE,
    PERMISSIONS.ROUTES_READ,
    PERMISSIONS.ROUTES_WRITE,
    PERMISSIONS.PLANNING_FULL,
    PERMISSIONS.REPORTS_COMPANY,
    PERMISSIONS.BILLING_READ,
    PERMISSIONS.BILLING_WRITE,
  ],
  
  [UserRole.DISPATCH]: [
    // Gestion opérationnelle
    PERMISSIONS.COMPANY_READ_OWN,
    PERMISSIONS.USERS_READ_COMPANY,
    PERMISSIONS.FLEET_READ,
    PERMISSIONS.ROUTES_READ,
    PERMISSIONS.ROUTES_WRITE,
    PERMISSIONS.PLANNING_FULL,
    PERMISSIONS.REPORTS_COMPANY,
  ],
  
  [UserRole.DRIVER]: [
    // Accès limité aux missions assignées
    PERMISSIONS.COMPANY_READ_OWN,
    PERMISSIONS.FLEET_READ_ASSIGNED,
    PERMISSIONS.ROUTES_READ_ASSIGNED,
    PERMISSIONS.PLANNING_READ_ASSIGNED,
  ],
  
  [UserRole.INTERNAL_SUPPORT]: [
    // Support client multi-entreprise en lecture
    PERMISSIONS.COMPANY_READ_ALL,
    PERMISSIONS.USERS_READ_ALL,
    PERMISSIONS.FLEET_READ,
    PERMISSIONS.ROUTES_READ,
    PERMISSIONS.REPORTS_COMPANY,
  ],
  
  [UserRole.ACCOUNTANT]: [
    // Gestion financière
    PERMISSIONS.COMPANY_READ_OWN,
    PERMISSIONS.BILLING_READ,
    PERMISSIONS.BILLING_WRITE,
    PERMISSIONS.REPORTS_COMPANY,
  ],
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 * @param {string} userRole - Rôle de l'utilisateur (enum OpenAPI)
 * @param {string} permission - Permission à vérifier
 * @returns {boolean}
 */
export function hasPermission(userRole, permission) {
  if (!userRole || !permission) return false
  
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.includes(permission)
}

/**
 * Vérifie si un utilisateur peut accéder à une entreprise
 * @param {object} user - Utilisateur actuel
 * @param {string} targetCompanyId - ID de l'entreprise cible
 * @returns {boolean}
 */
export function canAccessCompany(user, targetCompanyId) {
  if (!user || !targetCompanyId) return false
  
  // Super admin peut accéder à toutes les entreprises
  if (user.role === UserRole.SUPER_ADMIN) return true
  
  // Support interne peut voir toutes les entreprises (lecture seule)
  if (user.role === UserRole.INTERNAL_SUPPORT) return true
  
  // Autres rôles : seulement leur propre entreprise
  return user.company_id === targetCompanyId
}

/**
 * Vérifie si un utilisateur peut modifier une entreprise
 * @param {object} user - Utilisateur actuel  
 * @param {string} targetCompanyId - ID de l'entreprise cible
 * @returns {boolean}
 */
export function canModifyCompany(user, targetCompanyId) {
  if (!user || !targetCompanyId) return false
  
  // Super admin peut modifier toutes les entreprises
  if (user.role === UserRole.SUPER_ADMIN) return true
  
  // Admin peut modifier seulement SON entreprise
  if (user.role === UserRole.ADMIN && user.company_id === targetCompanyId) return true
  
  return false
}

/**
 * Vérifie si un utilisateur peut gérer d'autres utilisateurs
 * @param {object} user - Utilisateur actuel
 * @param {object} targetUser - Utilisateur cible (optionnel)
 * @returns {boolean}
 */
export function canManageUsers(user, targetUser = null) {
  if (!user) return false
  
  // Super admin peut gérer tous les utilisateurs
  if (user.role === UserRole.SUPER_ADMIN) return true
  
  // Admin peut gérer les utilisateurs de SON entreprise
  if (user.role === UserRole.ADMIN) {
    if (!targetUser) return true // Peut voir la liste
    return user.company_id === targetUser.company_id
  }
  
  return false
}

/**
 * Filtre les rôles que l'utilisateur peut assigner
 * @param {string} userRole - Rôle de l'utilisateur actuel
 * @returns {string[]} - Liste des rôles assignables
 */
export function getAssignableRoles(userRole) {
  switch (userRole) {
    case UserRole.SUPER_ADMIN:
      // Peut assigner tous les rôles
      return Object.values(UserRole)
      
    case UserRole.ADMIN:
      // Peut assigner tous sauf SUPER_ADMIN
      return Object.values(UserRole).filter(role => role !== UserRole.SUPER_ADMIN)
      
    default:
      return []
  }
}

/**
 * Génère un objet de permissions pour l'utilisateur actuel
 * @param {object} user - Utilisateur actuel
 * @returns {object} - Objet avec toutes les permissions booléennes
 */
export function getUserPermissions(user) {
  if (!user?.role) return {}
  
  const permissions = {}
  Object.values(PERMISSIONS).forEach(permission => {
    permissions[permission] = hasPermission(user.role, permission)
  })
  
  return permissions
}

/**
 * Hook React pour les permissions (à utiliser dans les composants)
 */
export function usePermissions(user) {
  const permissions = getUserPermissions(user)
  
  return {
    ...permissions,
    hasPermission: (permission) => hasPermission(user?.role, permission),
    canAccessCompany: (companyId) => canAccessCompany(user, companyId),
    canModifyCompany: (companyId) => canModifyCompany(user, companyId),
    canManageUsers: (targetUser) => canManageUsers(user, targetUser),
    getAssignableRoles: () => getAssignableRoles(user?.role),
  }
}

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  canAccessCompany,
  canModifyCompany,
  canManageUsers,
  getAssignableRoles,
  getUserPermissions,
  usePermissions,
}