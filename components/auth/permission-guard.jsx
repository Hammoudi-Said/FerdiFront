'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { hasPermission, canAccessCompany, canModifyCompany } from '@/lib/utils/permission-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, AlertCircle, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * 🛡️ PERMISSION GUARD - Contrôle d'accès granulaire
 * Conforme OpenAPI - Gestion fine des permissions par action
 */
export function PermissionGuard({
  children,
  permission = null,
  companyId = null,
  requireModifyAccess = false,
  fallbackPath = '/dashboard',
  showUnauthorized = true,
  className = ""
}) {
  const router = useRouter()
  const { user } = useAuthStore()

  // Vérifier les permissions
  const hasRequiredPermission = permission ? hasPermission(user?.role, permission) : true
  const hasCompanyAccess = companyId ? canAccessCompany(user, companyId) : true
  const hasModifyAccess = requireModifyAccess && companyId 
    ? canModifyCompany(user, companyId) 
    : true

  const isAuthorized = hasRequiredPermission && hasCompanyAccess && hasModifyAccess

  if (!isAuthorized && !showUnauthorized) {
    router.push(fallbackPath)
    return null
  }

  if (!isAuthorized && showUnauthorized) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-800">Permission requise</CardTitle>
            <CardDescription className="text-red-600">
              Vous n'avez pas les permissions nécessaires pour cette action.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Accès refusé
                  </p>
                  <p className="text-xs text-red-600">
                    {!hasRequiredPermission && `Permission "${permission}" manquante`}
                    {!hasCompanyAccess && "Accès entreprise non autorisé"}
                    {!hasModifyAccess && "Permission de modification requise"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                onClick={() => router.push(fallbackPath)}
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <div className={className}>{children}</div>
}

/**
 * Hook pour vérifier les permissions dans les composants
 */
export function usePermissionCheck() {
  const { user } = useAuthStore()

  return {
    hasPermission: (permission) => hasPermission(user?.role, permission),
    canAccessCompany: (companyId) => canAccessCompany(user, companyId),
    canModifyCompany: (companyId) => canModifyCompany(user, companyId),
    user,
  }
}

/**
 * HOC pour wrapper les composants avec protection permission
 */
export function withPermissionGuard(WrappedComponent, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <PermissionGuard {...options}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    )
  }
}