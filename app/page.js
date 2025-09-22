'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { OverviewDashboard } from '@/components/home/overview-dashboard'

/**
 * 🏠 PAGE D'ACCUEIL FERDI - Vue d'ensemble générale
 * Design professionnel avec informations contextuelles selon le rôle
 * Remplace l'ancienne redirection automatique vers /dashboard
 */
export default function HomePage() {
  return (
    <DashboardLayout>
      <OverviewDashboard />
    </DashboardLayout>
  )
}