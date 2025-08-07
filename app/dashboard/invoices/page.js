'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { ComingSoonPage } from '@/components/common/coming-soon'
import { DollarSign } from 'lucide-react'

export default function InvoicesPage() {
  const features = [
    {
      title: 'Facturation automatisée',
      description: 'Génération automatique des factures après completion des missions'
    },
    {
      title: 'Modèles de factures',
      description: 'Modèles personnalisables conformes à la réglementation française'
    },
    {
      title: 'Suivi des paiements',
      description: 'Tableau de bord des factures payées, en attente et en retard'
    },
    {
      title: 'Relances automatiques',
      description: 'Système de relances automatiques pour les factures impayées'
    },
    {
      title: 'Export comptable',
      description: 'Export vers les logiciels comptables (Sage, Ciel, EBP)'
    },
    {
      title: 'Rapports financiers',
      description: 'Analyses et rapports détaillés sur votre chiffre d\'affaires'
    }
  ]

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']} showUnauthorized={true}>
      <DashboardLayout>
        <ComingSoonPage
          title="Facturation"
          description="Gérez votre facturation et suivez vos paiements avec notre module comptable intégré. Simplifiez votre gestion financière et optimisez votre trésorerie."
          icon={DollarSign}
          features={features}
          expectedDate="Mai 2025"
          priority="medium"
        />
      </DashboardLayout>
    </RoleGuard>
  )
}