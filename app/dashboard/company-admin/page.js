'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { CompanyAdminDashboard } from '@/components/dashboards/company-admin-dashboard'
import { UserRole } from '@/lib/constants/enums'

export default function CompanyAdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]} showUnauthorized={true}>
      <DashboardLayout>
        <CompanyAdminDashboard />
      </DashboardLayout>
    </RoleGuard>
  )
}