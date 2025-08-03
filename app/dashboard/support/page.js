'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { SupportDashboard } from '@/components/dashboards/support-dashboard'

export default function SupportDashboardPage() {
  return (
    <RoleGuard allowedRoles={['5']} showUnauthorized={true}>
      <DashboardLayout>
        <SupportDashboard />
      </DashboardLayout>
    </RoleGuard>
  )
}