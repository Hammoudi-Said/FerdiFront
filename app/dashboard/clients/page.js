'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { ComingSoonPage } from '@/components/common/coming-soon'
import { UserPlus } from 'lucide-react'

export default function ClientsPage() {
  const features = [
    {
      title: 'CRM intégré',
      description: 'Gestion complète de la relation client'
    },
    {
      title: 'Historique des missions',
      description: 'Suivi complet des transports effectués par client'
    },
    {
      title: 'Tarification personnalisée',
      description: 'Grilles tarifaires adaptées à chaque client'
    },
    {
      title: 'Communication automatisée',
      description: 'Envoi automatique de confirmations et notifications'
    },
    {
      title: 'Satisfaction client',
      description: 'Enquêtes de satisfaction et suivi qualité'
    },
    {
      title: 'Portail client',
      description: 'Accès dédié pour vos clients avec suivi temps réel'
    }
  ]

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'INTERNAL_SUPPORT']} showUnauthorized={true}>
      <DashboardLayout>
        <ComingSoonPage
          title="Clients"
          description="Développez et fidélisez votre clientèle avec notre module CRM spécialisé transport. Offrez un service client exceptionnel et optimisez vos relations commerciales."
          icon={UserPlus}
          features={features}
          expectedDate="Août 2025"
          priority="low"
        />
      </DashboardLayout>
    </RoleGuard>
  )
}