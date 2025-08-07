'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { ComingSoonPage } from '@/components/common/coming-soon'
import { Calendar } from 'lucide-react'

export default function PlanningPage() {
  const features = [
    {
      title: 'Vue calendrier interactive',
      description: 'Planification visuelle avec glisser-déposer'
    },
    {
      title: 'Gestion des disponibilités',
      description: 'Suivi des disponibilités chauffeurs et véhicules en temps réel'
    },
    {
      title: 'Optimisation des trajets',
      description: 'Algorithme d\'optimisation pour réduire les coûts et temps'
    },
    {
      title: 'Planification récurrente',
      description: 'Création facile de missions régulières et répétitives'
    },
    {
      title: 'Conflits et alertes',
      description: 'Détection automatique des conflits de planning'
    },
    {
      title: 'Export et partage',
      description: 'Export PDF, Excel et partage avec l\'équipe'
    }
  ]

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'DISPATCH', 'DRIVER']} showUnauthorized={true}>
      <DashboardLayout>
        <ComingSoonPage
          title="Planning"
          description="Gérez efficacement vos plannings de transport avec notre interface intuitive. Planifiez, organisez et optimisez vos missions en quelques clics."
          icon={Calendar}
          features={features}
          expectedDate="Février 2025"
          priority="high"
        />
      </DashboardLayout>
    </RoleGuard>
  )
}