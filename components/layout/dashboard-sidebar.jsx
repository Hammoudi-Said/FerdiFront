'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore, ROLE_DEFINITIONS } from '@/lib/stores/auth-store'
import { Badge } from '@/components/ui/badge'
import {
  Bus,
  Users,
  Building2,
  FileText,
  Receipt,
  UserCheck,
  MapPin,
  Settings,
  BarChart3,
  Calendar,
  Phone,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  HelpCircle,
  Truck,
  Navigation
} from 'lucide-react'

// Enhanced navigation with permission-based access
const navigationItems = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: BarChart3,
    permissions: [], // Available to all authenticated users
  },
  {
    title: 'Ma société',
    href: '/dashboard/company',
    icon: Building2,
    permissions: ['company_manage', 'users_view'],
  },
  {
    title: 'Utilisateurs',
    href: '/dashboard/users',
    icon: Users,
    permissions: ['users_manage', 'users_view'],
  },
  {
    title: 'Flotte',
    href: '/dashboard/fleet',
    icon: Bus,
    permissions: ['fleet_manage', 'fleet_view'],
  },
  {
    title: 'Chauffeurs',
    href: '/dashboard/drivers',
    icon: UserCheck,
    permissions: ['drivers_assign', 'users_view'],
  },
  {
    title: 'Trajets',
    href: '/dashboard/routes',
    icon: MapPin,
    permissions: ['routes_manage', 'routes_view', 'routes_view_assigned'],
  },
  {
    title: 'Planning',
    href: '/dashboard/schedule',
    icon: Calendar,
    permissions: ['schedule_manage', 'schedule_view_assigned'],
  },
  {
    title: 'Devis',
    href: '/dashboard/quotes',
    icon: FileText,
    permissions: ['billing_manage'],
  },
  {
    title: 'Factures',
    href: '/dashboard/invoices',
    icon: Receipt,
    permissions: ['billing_manage', 'invoices_manage'],
  },
  {
    title: 'Rapports',
    href: '/dashboard/reports',
    icon: DollarSign,
    permissions: ['reports_access'],
  },
  {
    title: 'Support',
    href: '/dashboard/support',
    icon: Phone,
    permissions: ['support_access'],
  },
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
    permissions: ['users_manage', '*'],
  },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    // Get initial state from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ferdi_sidebar_collapsed')
      return stored ? JSON.parse(stored) : false
    }
    return false
  })
  
  const pathname = usePathname()
  const { user, hasPermission, getRoleData, updateActivity } = useAuthStore()

  // Update activity on navigation
  useEffect(() => {
    updateActivity()
  }, [pathname, updateActivity])

  // Persist sidebar state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ferdi_sidebar_collapsed', JSON.stringify(collapsed))
    }
  }, [collapsed])

  const filteredItems = navigationItems.filter(item => {
    // If no permissions required, show to all users
    if (item.permissions.length === 0) return true
    
    // Check if user has any of the required permissions
    return item.permissions.some(permission => hasPermission(permission))
  })

  const roleData = getRoleData()

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed)
    updateActivity()
  }

  return (
    <div className={cn(
      'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full shadow-sm',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <Bus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">FERDI</h2>
              <p className="text-xs text-gray-500">Gestion de flotte</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleCollapse}
          className="text-gray-600 hover:bg-gray-100"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Role Badge */}
      {!collapsed && roleData && (
        <div className="p-4 border-b border-gray-200">
          <div className={cn(
            'rounded-lg p-3 border-l-4 bg-gray-50',
            roleData.color.replace('bg-', 'border-')
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {roleData.label}
                </p>
                <p className="text-xs text-gray-600">
                  {roleData.description}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs bg-white text-gray-700 border">
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {filteredItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href} onClick={updateActivity}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200',
                    isActive && 'bg-blue-50 text-blue-700 border-r-2 border-blue-600',
                    collapsed && 'px-2'
                  )}
                >
                  <Icon className={cn(
                    'h-4 w-4',
                    !collapsed && 'mr-3',
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  )} />
                  {!collapsed && (
                    <span className="font-medium">
                      {item.title}
                    </span>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Profile Section */}
      {!collapsed && user && (
        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="flex items-center">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3',
                roleData?.color || 'bg-gray-500'
              )}>
                {`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || `${user?.first_name} ${user?.last_name}`}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {roleData?.label || 'Utilisateur'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}