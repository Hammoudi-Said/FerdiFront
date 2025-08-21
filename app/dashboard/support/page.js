'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { SupportDashboard } from '@/components/dashboards/support-dashboard'
import { UserRole } from '@/lib/constants/enums'

export default function SupportDashboardPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.INTERNAL_SUPPORT]} showUnauthorized={true}>
      <DashboardLayout>
        <SupportDashboard />
      </DashboardLayout>
    </RoleGuard>
  )
}