'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { ComingSoonPage } from '@/components/common/coming-soon'
import { Bus } from 'lucide-react'

export default function FleetPage() {
  const features = [
    {
      title: 'Gestion complète des véhicules',
      description: 'Carnet de bord numérique avec toutes les informations véhicules'
    },
    {
      title: 'Suivi maintenance préventive',
      description: 'Planification automatique des révisions et contrôles techniques'
    },
    {
      title: 'Géolocalisation en temps réel',
      description: 'Suivi GPS de votre flotte avec historiques des trajets'
    },
    {
      title: 'Gestion des assurances',
      description: 'Suivi des polices d\'assurance et alertes d\'échéance'
    },
    {
      title: 'Consommation et coûts',
      description: 'Analyse détaillée des consommations et coûts d\'exploitation'
    },
    {
      title: 'Documents véhicules',
      description: 'Stockage numérique de tous les documents officiels'
    }
  ]

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']} showUnauthorized={true}>
      <DashboardLayout>
        <ComingSoonPage
          title="Véhicules"
          description="Gérez votre flotte de véhicules avec notre système complet. Suivez l'état, la maintenance et l'utilisation de tous vos autocars et minibus."
          icon={Bus}
          features={features}
          expectedDate="Février 2025"
          priority="high"
        />
      </DashboardLayout>
    </RoleGuard>
  )
}