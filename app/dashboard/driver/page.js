'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { DriverDashboard } from '@/components/dashboards/driver-dashboard'
import { UserRole } from '@/lib/constants/enums'

export default function DriverDashboardPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.DRIVER]} showUnauthorized={true}>
      <DashboardLayout>
        <DriverDashboard />
      </DashboardLayout>
    </RoleGuard>
  )
}