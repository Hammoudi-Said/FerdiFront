'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { AccountantDashboard } from '@/components/dashboards/accountant-dashboard'
import { UserRole } from '@/lib/constants/enums'

export default function AccountantDashboardPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.ACCOUNTANT]} showUnauthorized={true}>
      <DashboardLayout>
        <AccountantDashboard />
      </DashboardLayout>
    </RoleGuard>
  )
}