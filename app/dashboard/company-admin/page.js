'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { CompanyAdminDashboard } from '@/components/dashboards/company-admin-dashboard'

export default function CompanyAdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={['2']} showUnauthorized={true}>
      <DashboardLayout>
        <CompanyAdminDashboard />
      </DashboardLayout>
    </RoleGuard>
  )
}