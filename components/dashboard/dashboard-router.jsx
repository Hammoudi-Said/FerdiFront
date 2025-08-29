'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { UserRole } from '@/lib/constants/enums'
import { AdminDashboard } from './role-specific/admin-dashboard'
import { DriverDashboard } from './role-specific/driver-dashboard'
import { SuperAdminDashboard } from './role-specific/super-admin-dashboard'
import { DispatchDashboard } from './role-specific/dispatch-dashboard'
import { AccountantDashboard } from './role-specific/accountant-dashboard'
import { SupportDashboard } from './role-specific/support-dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertCircle } from 'lucide-react'

/**
 * 🎯 DASHBOARD ROUTER - Route vers le bon dashboard selon le rôle
 * Conforme OpenAPI - Gestion centralisée des dashboards par rôle
 */
export function DashboardRouter() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Chargement de votre dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user?.role) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold">Erreur d'authentification</h3>
            <p className="text-muted-foreground">Impossible de déterminer votre rôle utilisateur.</p>
          </div>
        </div>
      </div>
    )
  }

  // ✅ ROUTAGE SELON RÔLE OPENAPI
  switch (user.role) {
    case UserRole.SUPER_ADMIN:
      return <SuperAdminDashboard />
      
    case UserRole.ADMIN:
      return <AdminDashboard />
      
    case UserRole.DISPATCH:
      return <DispatchDashboard />
      
    case UserRole.DRIVER:
      return <DriverDashboard />
      
    case UserRole.INTERNAL_SUPPORT:
      return <SupportDashboard />
      
    case UserRole.ACCOUNTANT:
      // Dashboard comptable (à créer si nécessaire)
      return (
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold">Dashboard Comptable</h2>
          <p className="text-muted-foreground">À venir - Gestion financière et facturation</p>
        </div>
      )
      
    default:
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-orange-500" />
            <div>
              <h3 className="text-lg font-semibold">Rôle non reconnu</h3>
              <p className="text-muted-foreground">
                Le rôle "{user.role}" n'a pas de dashboard configuré.
              </p>
            </div>
          </div>
        </div>
      )
  }
}