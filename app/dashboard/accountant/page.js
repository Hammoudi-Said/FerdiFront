'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { AccountantDashboard } from '@/components/dashboards/accountant-dashboard'

export default function AccountantDashboardPage() {
  return (
    <RoleGuard allowedRoles={['6']} showUnauthorized={true}>
      <DashboardLayout>
        <AccountantDashboard />
      </DashboardLayout>
    </RoleGuard>
  )
}