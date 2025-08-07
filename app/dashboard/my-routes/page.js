'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { ComingSoonPage } from '@/components/common/coming-soon'
import { MapPin } from 'lucide-react'

export default function MyRoutesPage() {
  const features = [
    {
      title: 'Planning personnel',
      description: 'Vue dédiée de vos missions assignées'
    },
    {
      title: 'Détails des trajets',
      description: 'Informations complètes : horaires, clients, itinéraires'
    },
    {
      title: 'Navigation intégrée',
      description: 'GPS optimisé pour véhicules de transport en commun'
    },
    {
      title: 'Rapport de mission',
      description: 'Saisie rapide des informations de fin de mission'
    },
    {
      title: 'Communication dispatcher',
      description: 'Messagerie directe avec votre équipe de planification'
    },
    {
      title: 'Historique personnel',
      description: 'Suivi de vos performances et statistiques'
    }
  ]

  return (
    <RoleGuard allowedRoles={['DRIVER']} showUnauthorized={true}>
      <DashboardLayout>
        <ComingSoonPage
          title="Mes trajets"
          description="Consultez vos missions assignées et gérez votre planning personnel. Interface dédiée aux chauffeurs pour optimiser l'exécution des transports."
          icon={MapPin}
          features={features}
          expectedDate="Mars 2025"
          priority="high"
        />
      </DashboardLayout>
    </RoleGuard>
  )
}