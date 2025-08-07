'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { ComingSoonPage } from '@/components/common/coming-soon'
import { Zap } from 'lucide-react'

export default function AutomatisationsPage() {
  const features = [
    {
      title: 'Affectation automatique des chauffeurs',
      description: 'Assignation intelligente basée sur la disponibilité et les compétences'
    },
    {
      title: 'Notification automatique des clients',
      description: 'SMS et emails automatiques pour les confirmations et rappels'
    },
    {
      title: 'Gestion des plannings récurrents',
      description: 'Création automatique des missions répétitives'
    },
    {
      title: 'Synchronisation avec calendriers externes',
      description: 'Intégration Google Calendar, Outlook et autres'
    },
    {
      title: 'Alertes maintenance préventive',
      description: 'Notifications automatiques basées sur les kilomètres et dates'
    },
    {
      title: 'Facturation automatisée',
      description: 'Génération et envoi automatique des factures'
    }
  ]

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']} showUnauthorized={true}>
      <DashboardLayout>
        <ComingSoonPage
          title="Automatisations"
          description="Automatisez vos processus de gestion de flotte pour gagner du temps et réduire les erreurs manuelles. Notre système d'automatisation intelligent vous aide à optimiser vos opérations quotidiennes."
          icon={Zap}
          features={features}
          expectedDate="Mars 2025"
          priority="high"
        />
      </DashboardLayout>
    </RoleGuard>
  )
}