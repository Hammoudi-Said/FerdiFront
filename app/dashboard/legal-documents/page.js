'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { ComingSoonPage } from '@/components/common/coming-soon'
import { FileCheck } from 'lucide-react'

export default function LegalDocumentsPage() {
  const features = [
    {
      title: 'Contrats de transport',
      description: 'Modèles conformes à la réglementation française'
    },
    {
      title: 'Conditions générales',
      description: 'CGV personnalisables selon votre activité'
    },
    {
      title: 'Documents RGPD',
      description: 'Conformité protection des données personnelles'
    },
    {
      title: 'Assurances obligatoires',
      description: 'Suivi et gestion des polices d\'assurance'
    },
    {
      title: 'Licences de transport',
      description: 'Gestion des autorisations et renouvellements'
    },
    {
      title: 'Archivage numérique',
      description: 'Stockage sécurisé et indexation intelligente'
    }
  ]

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']} showUnauthorized={true}>
      <DashboardLayout>
        <ComingSoonPage
          title="Documents légaux"
          description="Centralisez tous vos documents légaux et assurez-vous d'être en conformité. Notre module juridique vous accompagne dans le respect des réglementations du transport."
          icon={FileCheck}
          features={features}
          expectedDate="Juillet 2025"
          priority="low"
        />
      </DashboardLayout>
    </RoleGuard>
  )
}