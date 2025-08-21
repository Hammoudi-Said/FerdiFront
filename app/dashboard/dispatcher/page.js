'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { DispatcherDashboard } from '@/components/dashboards/dispatcher-dashboard'
import { UserRole } from '@/lib/constants/enums'

export default function DispatcherDashboardPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.DISPATCH]} showUnauthorized={true}>
      <DashboardLayout>
        <DispatcherDashboard />
      </DashboardLayout>
    </RoleGuard>
  )
}