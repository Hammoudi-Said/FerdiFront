'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { SuperAdminDashboard } from '@/components/dashboards/super-admin-dashboard'
import { UserRole } from '@/lib/constants/enums'

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]} showUnauthorized={true}>
      <DashboardLayout>
        <SuperAdminDashboard />
      </DashboardLayout>
    </RoleGuard>
  )
}