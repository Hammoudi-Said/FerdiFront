'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { DashboardRouter } from '@/components/dashboard/dashboard-router'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <RoleGuard>
        <DashboardRouter />
      </RoleGuard>
    </DashboardLayout>
  )
}