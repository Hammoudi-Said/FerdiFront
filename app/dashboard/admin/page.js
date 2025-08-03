'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { SuperAdminDashboard } from '@/components/dashboards/super-admin-dashboard'

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={['1']} showUnauthorized={true}>
      <DashboardLayout>
        <SuperAdminDashboard />
      </DashboardLayout>
    </RoleGuard>
  )
}