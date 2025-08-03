/**
 * Role-based dashboard redirect utility
 * Determines where users should be redirected based on their role
 */

export const ROLE_DASHBOARD_PATHS = {
  '1': '/dashboard/admin', // super_admin - Global Admin Dashboard
  '2': '/dashboard/company-admin', // admin - Company Management Dashboard  
  '3': '/dashboard/dispatcher', // dispatcher - Planning View
  '4': '/dashboard/driver', // driver - Personal Schedule View
  '5': '/dashboard/support', // internal_support - Support Dashboard
  '6': '/dashboard/accountant', // accountant - Financial Dashboard
}

export const DEFAULT_DASHBOARD = '/dashboard'

/**
 * Get the appropriate dashboard path for a user role
 * @param {string} role - User role ID
 * @returns {string} - Dashboard path for the role
 */
export function getRoleDashboardPath(role) {
  return ROLE_DASHBOARD_PATHS[role] || DEFAULT_DASHBOARD
}

/**
 * Check if a path is a role-specific dashboard
 * @param {string} path - Path to check
 * @returns {boolean} - Whether the path is a role-specific dashboard
 */
export function isRoleDashboard(path) {
  return Object.values(ROLE_DASHBOARD_PATHS).includes(path)
}

/**
 * Get allowed paths for a specific role
 * @param {string} role - User role ID
 * @returns {string[]} - Array of allowed paths for the role
 */
export function getRoleAllowedPaths(role) {
  const basePaths = ['/dashboard', '/dashboard/profile']
  
  switch(role) {
    case '1': // super_admin
      return ['*'] // All paths allowed
    
    case '2': // admin  
      return [
        ...basePaths,
        '/dashboard/admin',
        '/dashboard/company-admin',
        '/dashboard/company',
        '/dashboard/users', 
        '/dashboard/fleet',
        '/dashboard/routes',
        '/dashboard/schedule',
        '/dashboard/drivers',
        '/dashboard/quotes',
        '/dashboard/invoices',
        '/dashboard/reports',
        '/dashboard/automatisations',
        '/dashboard/subcontractors',
        '/dashboard/legal-documents',
        '/dashboard/planning',
        '/dashboard/clients',
        '/dashboard/settings',
        '/dashboard/support'
      ]
    
    case '3': // dispatcher
      return [
        ...basePaths,
        '/dashboard/dispatcher', 
        '/dashboard/routes',
        '/dashboard/schedule',
        '/dashboard/planning',
        '/dashboard/fleet-view',
        '/dashboard/drivers-view',
        '/dashboard/subcontractors',
        '/dashboard/support'
      ]
    
    case '4': // driver
      return [
        ...basePaths,
        '/dashboard/driver',
        '/dashboard/my-routes', 
        '/dashboard/my-schedule',
        '/dashboard/planning',
        '/dashboard/support'
      ]
    
    case '5': // internal_support
      return [
        ...basePaths,
        '/dashboard/support',
        '/dashboard/clients',
        '/dashboard/fleet-view',
        '/dashboard/drivers-view',
        '/dashboard/routes',
        '/dashboard/users'
      ]
    
    case '6': // accountant
      return [
        ...basePaths,
        '/dashboard/accountant',
        '/dashboard/quotes-view',
        '/dashboard/invoices', 
        '/dashboard/reports',
        '/dashboard/legal-documents',
        '/dashboard/support'
      ]
    
    default:
      return basePaths
  }
}

/**
 * Check if a user role can access a specific path
 * @param {string} role - User role ID
 * @param {string} path - Path to check
 * @returns {boolean} - Whether the role can access the path
 */
export function canRoleAccessPath(role, path) {
  const allowedPaths = getRoleAllowedPaths(role)
  
  // Super admin can access everything
  if (allowedPaths.includes('*')) return true
  
  // Check exact match
  if (allowedPaths.includes(path)) return true
  
  // Check if path starts with any allowed path
  return allowedPaths.some(allowedPath => 
    path.startsWith(allowedPath) || allowedPath.startsWith(path)
  )
}