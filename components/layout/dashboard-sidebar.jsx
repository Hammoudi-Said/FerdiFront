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
  Shield,
  Database,
  LifeBuoy,
  TrendingUp,
  Zap,
  HandHeart,
  FileCheck,
  UserPlus
} from 'lucide-react'

// Navigation with role-specific access control
const navigationItems = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: BarChart3,
    roles: ['1', '2', '3', '4', '5', '6'], // All roles
    description: 'Vue d\'ensemble'
  },
  
  // SUPER ADMIN ONLY - Multi-company management
  {
    title: 'Toutes les entreprises',
    href: '/dashboard/all-companies',
    icon: Database,
    roles: ['1'], // Only super_admin
    description: 'Gestion multi-entreprises'
  },
  {
    title: 'Support global',
    href: '/dashboard/global-support',
    icon: Shield,
    roles: ['1'], // Only super_admin
    description: 'Support tous clients'
  },

  // ADMIN & CLIENT ADMIN - Company management
  {
    title: 'Ma société',
    href: '/dashboard/company',
    icon: Building2,
    roles: ['1', '2'], // super_admin, admin
    description: 'Gestion entreprise'
  },
  {
    title: 'Utilisateurs',
    href: '/dashboard/users',
    icon: Users,
    roles: ['1', '2'], // super_admin, admin
    description: 'Gestion équipe'
  },
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['1', '2'], // super_admin, admin
    description: 'Configuration'
  },

  // FLEET MANAGEMENT - Admin & Dispatch
  {
    title: 'Flotte',
    href: '/dashboard/fleet',
    icon: Bus,
    roles: ['1', '2'], // super_admin, admin (full management)
    description: 'Gestion véhicules'
  },
  {
    title: 'Véhicules (consultation)',
    href: '/dashboard/fleet-view',
    icon: Bus,
    roles: ['3', '5'], // dispatch, internal_support (view only)
    description: 'Consultation flotte'
  },

  // ROUTES & SCHEDULING - Admin, Dispatch
  {
    title: 'Trajets',
    href: '/dashboard/routes',
    icon: MapPin,
    roles: ['1', '2', '3'], // super_admin, admin, dispatch
    description: 'Gestion trajets'
  },
  {
    title: 'Planning',
    href: '/dashboard/schedule',
    icon: Calendar,
    roles: ['1', '2', '3'], // super_admin, admin, dispatch
    description: 'Planification'
  },
  {
    title: 'Mes trajets',
    href: '/dashboard/my-routes',
    icon: MapPin,
    roles: ['4'], // driver only - their assigned routes
    description: 'Trajets assignés'
  },
  {
    title: 'Mon planning',
    href: '/dashboard/my-schedule',
    icon: Calendar,
    roles: ['4'], // driver only - their schedule
    description: 'Mon emploi du temps'
  },

  // DRIVERS MANAGEMENT - Admin, Dispatch, Support
  {
    title: 'Chauffeurs',
    href: '/dashboard/drivers',
    icon: UserCheck,
    roles: ['1', '2', '3'], // super_admin, admin, dispatch
    description: 'Gestion chauffeurs'
  },
  {
    title: 'Équipe (consultation)',
    href: '/dashboard/drivers-view',
    icon: UserCheck,
    roles: ['5'], // internal_support (view only)
    description: 'Consultation équipe'
  },

  // FINANCIAL - Admin, Accountant
  {
    title: 'Devis',
    href: '/dashboard/quotes',
    icon: FileText,
    roles: ['1', '2'], // super_admin, admin (can create/manage)
    description: 'Gestion devis'
  },
  {
    title: 'Devis (consultation)',
    href: '/dashboard/quotes-view',
    icon: FileText,
    roles: ['6'], // accountant (view only)
    description: 'Consultation devis'
  },
  {
    title: 'Factures',
    href: '/dashboard/invoices',
    icon: Receipt,
    roles: ['1', '2', '6'], // super_admin, admin, accountant
    description: 'Facturation'
  },
  {
    title: 'Rapports',
    href: '/dashboard/reports',
    icon: TrendingUp,
    roles: ['1', '2', '6'], // super_admin, admin, accountant
    description: 'Analyses & exports'
  },

  // NEW SECTIONS - Requested by client
  {
    title: 'Automatisations',
    href: '/dashboard/automatisations',
    icon: Zap,
    roles: ['1', '2'], // super_admin, admin
    description: 'Processus automatisés'
  },
  {
    title: 'Sous traitants',
    href: '/dashboard/subcontractors',
    icon: HandHeart,
    roles: ['1', '2', '3'], // super_admin, admin, dispatch
    description: 'Partenaires externes'
  },
  {
    title: 'Documents légaux',
    href: '/dashboard/legal-documents',
    icon: FileCheck,
    roles: ['1', '2', '6'], // super_admin, admin, accountant
    description: 'Conformité légale'
  },
  {
    title: 'Planning',
    href: '/dashboard/planning',
    icon: Calendar,
    roles: ['1', '2', '3', '4'], // super_admin, admin, dispatch, driver
    description: 'Planification générale'
  },
  {
    title: 'Clients',
    href: '/dashboard/clients',
    icon: UserPlus,
    roles: ['1', '2', '5'], // super_admin, admin, internal_support
    description: 'Gestion clientèle'
  },

  // SUPPORT - All roles (different access levels)
  {
    title: 'Support',
    href: '/dashboard/support',
    icon: Phone,
    roles: ['1', '2', '3', '4', '5', '6'], // All roles
    description: 'Assistance'
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

  // Group items by category for better organization
  const groupedItems = {
    main: filteredItems.filter(item => ['dashboard'].some(path => item.href.includes(path))),
    admin: filteredItems.filter(item => ['companies', 'users', 'settings'].some(path => item.href.includes(path))),
    operations: filteredItems.filter(item => ['fleet', 'routes', 'schedule', 'drivers', 'my-', 'planning'].some(path => item.href.includes(path))),
    business: filteredItems.filter(item => ['automatisations', 'subcontractors', 'clients'].some(path => item.href.includes(path))),
    documents: filteredItems.filter(item => ['legal-documents'].some(path => item.href.includes(path))),
    financial: filteredItems.filter(item => ['quotes', 'invoices', 'reports'].some(path => item.href.includes(path))),
    support: filteredItems.filter(item => ['support'].some(path => item.href.includes(path))),
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
                collapsed && 'px-2'
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className={cn(
                'h-4 w-4',
                !collapsed && 'mr-3',
                isActive ? 'text-blue-600' : 'text-gray-500'
              )} />
              {!collapsed && (
                <div>
                  <div className="font-medium">{item.title}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500">{item.description}</div>
                  )}
                </div>
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
        <nav className="space-y-6 px-2">
          {/* Main Dashboard */}
          {groupedItems.main.length > 0 && renderNavGroup(groupedItems.main)}
          
          {/* Admin Functions */}
          {groupedItems.admin.length > 0 && renderNavGroup(groupedItems.admin, collapsed ? null : "Administration")}
          
          {/* Operations */}
          {groupedItems.operations.length > 0 && renderNavGroup(groupedItems.operations, collapsed ? null : "Opérations")}
          
          {/* Business Management */}
          {groupedItems.business.length > 0 && renderNavGroup(groupedItems.business, collapsed ? null : "Gestion")}
          
          {/* Legal Documents */}
          {groupedItems.documents.length > 0 && renderNavGroup(groupedItems.documents, collapsed ? null : "Légal")}
          
          {/* Financial */}
          {groupedItems.financial.length > 0 && renderNavGroup(groupedItems.financial, collapsed ? null : "Financier")}
          
          {/* Support */}
          {groupedItems.support.length > 0 && renderNavGroup(groupedItems.support, collapsed ? null : "Support")}
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