'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { DispatcherDashboard } from '@/components/dashboards/dispatcher-dashboard'

export default function DispatcherDashboardPage() {
  return (
    <RoleGuard allowedRoles={['3']} showUnauthorized={true}>
      <DashboardLayout>
        <DispatcherDashboard />
      </DashboardLayout>
    </RoleGuard>
  )
}