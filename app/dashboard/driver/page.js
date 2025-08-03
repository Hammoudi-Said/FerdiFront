'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { DriverDashboard } from '@/components/dashboards/driver-dashboard'

export default function DriverDashboardPage() {
  return (
    <RoleGuard allowedRoles={['4']} showUnauthorized={true}>
      <DashboardLayout>
        <DriverDashboard />
      </DashboardLayout>
    </RoleGuard>
  )
}