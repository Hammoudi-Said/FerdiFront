'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Role Guard Component - Protects pages based on user roles and permissions
 */
export function RoleGuard({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  fallbackPath = '/dashboard',
  showUnauthorized = true
}) {
  const router = useRouter()
  const { user, token, isLoading, checkAuth, hasRole, hasPermission, getRoleData } = useAuthStore()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuthorization = async () => {
      // If no token, redirect to login
      if (!token) {
        router.push('/auth/login')
        return
      }

      // Ensure user data is fetched before proceeding
      if (!user) {
        await checkAuth()
      }

      // Re-check user after fetching
      const updatedUser = useAuthStore.getState().user

      // Check role authorization
      const roleAuthorized = allowedRoles.length === 0 || allowedRoles.some(role => hasRole(role))

      // Check permission authorization
      const permissionAuthorized = requiredPermissions.length === 0 ||
        requiredPermissions.some(permission => hasPermission(permission))

      const authorized = roleAuthorized && permissionAuthorized

      setIsAuthorized(authorized)
      setIsCheckingAuth(false)

      // If not authorized and not showing unauthorized page, redirect
      if (!authorized && !showUnauthorized) {
        router.push(fallbackPath)
      }
    }

    if (!isLoading) {
      checkAuthorization()
    }
  }, [user, token, isLoading, allowedRoles, requiredPermissions, hasRole, hasPermission, checkAuth, router, fallbackPath, showUnauthorized])

  // Show loading while checking auth
  if (isLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Vérification des autorisations</h3>
            <p className="text-sm text-gray-600 mt-1">Contrôle d'accès en cours...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show unauthorized page if not authorized and showUnauthorized is true
  if (!isAuthorized && showUnauthorized) {
    const roleData = getRoleData()

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-800">Accès non autorisé</CardTitle>
            <CardDescription className="text-red-600">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roleData && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Rôle actuel: {roleData.label}
                    </p>
                    <p className="text-xs text-red-600">
                      {roleData.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Cette page nécessite :
              </p>
              {allowedRoles.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium">Rôles autorisés:</span> {allowedRoles.join(', ')}
                </div>
              )}
              {requiredPermissions.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium">Permissions requises:</span> {requiredPermissions.join(', ')}
                </div>
              )}
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

  // Render children if authorized
  return isAuthorized ? children : null
}

/**
 * HOC for role-based page protection
 */
export function withRoleGuard(WrappedComponent, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <RoleGuard {...options}>
        <WrappedComponent {...props} />
      </RoleGuard>
    )
  }
}
