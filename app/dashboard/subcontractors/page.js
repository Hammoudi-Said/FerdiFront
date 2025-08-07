'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { ComingSoonPage } from '@/components/common/coming-soon'
import { HandHeart } from 'lucide-react'

export default function SubcontractorsPage() {
  const features = [
    {
      title: 'Réseau de partenaires',
      description: 'Gestion centralisée de vos transporteurs partenaires'
    },
    {
      title: 'Affectation intelligente',
      description: 'Attribution automatique selon disponibilité et compétences'
    },
    {
      title: 'Suivi qualité',
      description: 'Évaluation et notation de vos sous-traitants'
    },
    {
      title: 'Gestion contractuelle',
      description: 'Suivi des contrats et conditions tarifaires'
    },
    {
      title: 'Facturation partenaires',
      description: 'Système de facturation automatisée pour sous-traitants'
    },
    {
      title: 'Communication intégrée',
      description: 'Messagerie et notifications automatiques'
    }
  ]

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'DISPATCH']} showUnauthorized={true}>
      <DashboardLayout>
        <ComingSoonPage
          title="Sous-traitants"
          description="Développez votre réseau de partenaires et gérez vos sous-traitants efficacement. Optimisez vos capacités de transport grâce à un écosystème de confiance."
          icon={HandHeart}
          features={features}
          expectedDate="Juin 2025"
          priority="medium"
        />
      </DashboardLayout>
    </RoleGuard>
  )
}