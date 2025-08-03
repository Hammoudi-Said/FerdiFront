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
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Ma société',
    href: '/dashboard/company',
    icon: Building2,
    permissions: ['company_manage', 'users_view'],
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Utilisateurs',
    href: '/dashboard/users',
    icon: Users,
    permissions: ['users_manage', 'users_view'],
    color: 'text-green-600 dark:text-green-400',
  },
  {
    title: 'Flotte',
    href: '/dashboard/fleet',
    icon: Bus,
    permissions: ['fleet_manage', 'fleet_view'],
    color: 'text-orange-600 dark:text-orange-400',
  },
  {
    title: 'Chauffeurs',
    href: '/dashboard/drivers',
    icon: UserCheck,
    permissions: ['drivers_assign', 'users_view'],
    color: 'text-teal-600 dark:text-teal-400',
  },
  {
    title: 'Trajets',
    href: '/dashboard/routes',
    icon: MapPin,
    permissions: ['routes_manage', 'routes_view', 'routes_view_assigned'],
    color: 'text-red-600 dark:text-red-400',
  },
  {
    title: 'Planning',
    href: '/dashboard/schedule',
    icon: Calendar,
    permissions: ['schedule_manage', 'schedule_view_assigned'],
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    title: 'Devis',
    href: '/dashboard/quotes',
    icon: FileText,
    permissions: ['billing_manage'],
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    title: 'Factures',
    href: '/dashboard/invoices',
    icon: Receipt,
    permissions: ['billing_manage', 'invoices_manage'],
    color: 'text-pink-600 dark:text-pink-400',
  },
  {
    title: 'Rapports',
    href: '/dashboard/reports',
    icon: DollarSign,
    permissions: ['reports_access'],
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Support',
    href: '/dashboard/support',
    icon: Phone,
    permissions: ['support_access'],
    color: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
    permissions: ['users_manage', '*'],
    color: 'text-gray-600 dark:text-gray-400',
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
      'bg-gradient-to-b from-sidebar-background to-sidebar-background/95 border-r border-sidebar-border transition-all duration-300 flex flex-col h-full shadow-lg',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border/50 bg-gradient-to-r from-blue-500 to-purple-600">
        {!collapsed && (
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-lg mr-3 backdrop-blur-sm">
              <Bus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">FERDI</h2>
              <p className="text-xs text-white/80">Gestion de flotte</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleCollapse}
          className="text-white hover:bg-white/20 hover:text-white"
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
        <div className="p-4 border-b border-sidebar-border/50">
          <div className={cn(
            'rounded-lg p-3 border-l-4',
            roleData.bgColor,
            roleData.color.replace('bg-', 'border-')
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm font-medium', roleData.textColor)}>
                  {roleData.label}
                </p>
                <p className={cn('text-xs opacity-80', roleData.textColor)}>
                  {roleData.description}
                </p>
              </div>
              <Badge variant="secondary" className={cn('text-xs', roleData.textColor)}>
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
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all duration-200',
                    isActive && 'bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 text-sidebar-accent-foreground shadow-sm border-l-4 border-blue-500',
                    collapsed && 'px-2'
                  )}
                >
                  <Icon className={cn(
                    'h-4 w-4',
                    !collapsed && 'mr-3',
                    isActive ? item.color.replace('text-', 'text-') : item.color
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
        <div className="p-4 border-t border-sidebar-border/50 mt-auto">
          <div className="bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 rounded-lg p-3 border border-sidebar-border/30">
            <div className="flex items-center">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3',
                roleData?.color || 'bg-gray-500'
              )}>
                {`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                  {user?.full_name || `${user?.first_name} ${user?.last_name}`}
                </p>
                <p className="text-xs text-sidebar-accent-foreground/70 truncate">
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