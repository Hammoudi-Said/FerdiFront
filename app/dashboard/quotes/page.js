'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { ComingSoonPage } from '@/components/common/coming-soon'
import { FileText } from 'lucide-react'

export default function QuotesPage() {
  const features = [
    {
      title: 'Générateur de devis intelligent',
      description: 'Calcul automatique basé sur la distance, durée et type de véhicule'
    },
    {
      title: 'Modèles personnalisables',
      description: 'Créez vos propres modèles de devis avec votre branding'
    },
    {
      title: 'Tarification dynamique',
      description: 'Ajustement automatique selon la demande et disponibilité'
    },
    {
      title: 'Suivi des devis',
      description: 'Tableau de bord pour suivre les devis envoyés et acceptés'
    },
    {
      title: 'Signature électronique',
      description: 'Validation et signature numérique des devis'
    },
    {
      title: 'Conversion en commande',
      description: 'Transformation automatique des devis acceptés en missions'
    }
  ]

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']} showUnauthorized={true}>
      <DashboardLayout>
        <ComingSoonPage
          title="Devis"
          description="Créez et gérez vos devis de transport en toute simplicité. Notre système de devis intelligent vous aide à proposer des tarifs compétitifs rapidement."
          icon={FileText}
          features={features}
          expectedDate="Avril 2025"
          priority="medium"
        />
      </DashboardLayout>
    </RoleGuard>
  )
}