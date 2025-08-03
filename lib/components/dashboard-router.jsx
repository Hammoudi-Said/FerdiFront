'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { SuperAdminDashboard } from '@/components/dashboards/super-admin-dashboard'
import { CompanyAdminDashboard } from '@/components/dashboards/company-admin-dashboard'
import { DispatcherDashboard } from '@/components/dashboards/dispatcher-dashboard'
import { DriverDashboard } from '@/components/dashboards/driver-dashboard'
import { SupportDashboard } from '@/components/dashboards/support-dashboard'
import { AccountantDashboard } from '@/components/dashboards/accountant-dashboard'

/**
 * Dashboard Router Component - Routes users to appropriate dashboard based on role
 */
export function DashboardRouter() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement...</h2>
          <p className="text-gray-600">Récupération des données utilisateur</p>
        </div>
      </div>
    )
  }

  // Route to appropriate dashboard based on user role
  switch(user.role) {
    case '1': // super_admin
      return <SuperAdminDashboard />
    
    case '2': // admin
      return <CompanyAdminDashboard />
    
    case '3': // dispatcher
      return <DispatcherDashboard />
    
    case '4': // driver
      return <DriverDashboard />
    
    case '5': // internal_support
      return <SupportDashboard />
    
    case '6': // accountant
      return <AccountantDashboard />
    
    default:
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Rôle non reconnu</h2>
            <p className="text-gray-600">
              Le rôle utilisateur "{user.role}" n'est pas configuré.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Contactez l'administrateur système pour résoudre ce problème.
            </p>
          </div>
        </div>
      )
  }
}