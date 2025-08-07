'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/lib/stores/auth-store'
import { ROLE_DEFINITIONS, UserRole } from '@/lib/constants/enums'
import { Badge } from '@/components/ui/badge'
import { FerdiLogoSidebar } from '@/components/ui/ferdi-logo'
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
  Shield,
  Database,
  LifeBuoy,
  TrendingUp,
  Zap,
  HandHeart,
  FileCheck,
  UserPlus,
  Mail
} from 'lucide-react'

// Navigation simplifiée - sidebar propre avec nouveaux rôles
const navigationItems = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: BarChart3,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DISPATCH, UserRole.DRIVER, UserRole.INTERNAL_SUPPORT, UserRole.ACCOUNTANT],
  },
  
  // ADMIN SECTION
  {
    title: 'Utilisateurs',
    href: '/users',
    icon: Users,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    title: 'Invitations',
    href: '/invitations',
    icon: Mail,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    title: 'Chauffeurs',
    href: '/dashboard/drivers',
    icon: UserCheck,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DISPATCH],
  },
  {
    title: 'Véhicules',
    href: '/dashboard/fleet',
    icon: Bus,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  
  // OPERATIONS SECTION
  {
    title: 'Planning',
    href: '/dashboard/planning',
    icon: Calendar,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DISPATCH, UserRole.DRIVER],
  },
  {
    title: 'Mes trajets',
    href: '/dashboard/my-routes',
    icon: MapPin,
    roles: [UserRole.DRIVER],
  },
  
  // BUSINESS SECTION
  {
    title: 'Devis',
    href: '/dashboard/quotes',
    icon: FileText,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    title: 'Facturation',
    href: '/dashboard/invoices',
    icon: DollarSign,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT],
  },
  {
    title: 'Automatisations',
    href: '/dashboard/automatisations',
    icon: Zap,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    title: 'Sous-traitants',
    href: '/dashboard/subcontractors',
    icon: HandHeart,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DISPATCH],
  },
  {
    title: 'Documents légaux',
    href: '/dashboard/legal-documents',
    icon: FileCheck,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT],
  },
  {
    title: 'Clients',
    href: '/dashboard/clients',
    icon: UserPlus,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INTERNAL_SUPPORT],
  }
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
  const { user, updateActivity } = useAuthStore()

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

  // Filter navigation items based on user role
  const filteredItems = navigationItems.filter(item =>
    item.roles.includes(user?.role)
  )

  const roleData = user?.role ? ROLE_DEFINITIONS[user.role] : null

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed)
    updateActivity()
  }

  // Group items by category for better organization - simplified
  const groupedItems = {
    main: filteredItems.filter(item => item.href === '/dashboard'),
    management: filteredItems.filter(item => ['users', 'drivers', 'fleet', 'invitations'].some(path => item.href.includes(path))),
    operations: filteredItems.filter(item => ['planning', 'my-routes'].some(path => item.href.includes(path))),
    business: filteredItems.filter(item => ['quotes', 'invoices', 'automatisations', 'subcontractors', 'legal-documents', 'clients'].some(path => item.href.includes(path))),
  }

  const renderNavGroup = (items, title = null) => (
    <div className="space-y-1">
      {title && !collapsed && (
        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </div>
      )}
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link key={item.href} href={item.href} onClick={updateActivity}>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200',
                isActive && 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 font-medium',
                collapsed ? 'px-2' : 'px-3'
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className={cn(
                'h-5 w-5',
                !collapsed && 'mr-3',
                isActive ? 'text-blue-600' : 'text-gray-500'
              )} />
              {!collapsed && (
                <span className="font-medium">{item.title}</span>
              )}
            </Button>
          </Link>
        )
      })}
    </div>
  )

  return (
    <div className={cn(
      'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full shadow-sm',
      collapsed ? 'w-16' : 'w-72'
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
        <nav className="space-y-2 px-2">
          {/* Main Dashboard */}
          {groupedItems.main.length > 0 && renderNavGroup(groupedItems.main)}
          
          {/* Management Section */}
          {groupedItems.management.length > 0 && renderNavGroup(groupedItems.management, collapsed ? null : "Gestion")}
          
          {/* Operations Section */}
          {groupedItems.operations.length > 0 && renderNavGroup(groupedItems.operations, collapsed ? null : "Opérations")}
          
          {/* Business Section */}
          {groupedItems.business.length > 0 && renderNavGroup(groupedItems.business, collapsed ? null : "Business")}
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