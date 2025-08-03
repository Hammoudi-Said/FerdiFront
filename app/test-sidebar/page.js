'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useEffect } from 'react'

export default function TestSidebar() {
  const { setUser, setCompany, setToken } = useAuthStore()

  // Simulate login for testing
  useEffect(() => {
    // Set mock user data
    const mockUser = {
      id: 'user-admin-001',
      email: 'manager@transport-bretagne.fr',
      first_name: 'Jean',
      last_name: 'Dupont',
      full_name: 'Jean Dupont',
      role: '2', // ADMIN role to see all sections
      status: '1',
      is_active: true,
    }

    const mockCompany = {
      id: 'comp-12345-67890',
      name: 'Transport Bretagne SARL',
      company_code: 'BRE-12345-ABC',
    }

    setUser(mockUser)
    setCompany(mockCompany) 
    setToken('mock-token-123')
  }, [setUser, setCompany, setToken])

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Test des nouvelles sections sidebar</h1>
        <p className="text-gray-600">
          Cette page permet de tester les nouvelles sections ajoutées dans la sidebar :
        </p>
        <ul className="mt-4 list-disc list-inside space-y-2">
          <li><strong>Automatisations</strong> - Processus automatisés</li>
          <li><strong>Sous traitants</strong> - Partenaires externes</li>
          <li><strong>Documents légaux</strong> - Conformité légale</li>
          <li><strong>Planning</strong> - Planification générale</li>
          <li><strong>Clients</strong> - Gestion clientèle</li>
        </ul>
        
        <p className="mt-4 text-sm text-gray-500">
          Connecté en tant qu'Admin (rôle 2) pour voir toutes les sections disponibles.
        </p>
      </div>
    </DashboardLayout>
  )
}