'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { ComingSoonPage } from '@/components/common/coming-soon'
import { UserCheck } from 'lucide-react'

export default function DriversPage() {
  const features = [
    {
      title: 'Profils chauffeurs complets',
      description: 'Gestion des permis, qualifications et certifications'
    },
    {
      title: 'Planning individuel',
      description: 'Vue dédiée du planning pour chaque chauffeur'
    },
    {
      title: 'Temps de conduite et repos',
      description: 'Respect automatique de la réglementation européenne'
    },
    {
      title: 'Évaluation performance',
      description: 'Suivi des indicateurs de conduite et satisfaction client'
    },
    {
      title: 'Formation continue',
      description: 'Planification et suivi des formations obligatoires'
    },
    {
      title: 'Application mobile',
      description: 'App dédiée pour les chauffeurs avec toutes les infos missions'
    }
  ]

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'DISPATCH']} showUnauthorized={true}>
      <DashboardLayout>
        <ComingSoonPage
          title="Chauffeurs"
          description="Gérez efficacement votre équipe de chauffeurs. Suivez leurs qualifications, plannings et performances pour optimiser vos opérations de transport."
          icon={UserCheck}
          features={features}
          expectedDate="Mars 2025"
          priority="high"
        />
      </DashboardLayout>
    </RoleGuard>
  )
}