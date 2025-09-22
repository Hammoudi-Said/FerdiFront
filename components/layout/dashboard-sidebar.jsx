'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/lib/stores/auth-store'
import { ROLE_DEFINITIONS, UserRole } from '@/lib/constants/enums'
import { Badge } from '@/components/ui/badge'
import { FerdiLogoSidebar } from '@/components/ui/ferdi-logo'
import { FERDI_GRADIENTS, DATA_COLORS, ROLE_COLORS, ANIMATIONS } from '@/lib/constants/colors'
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
  // 🔧 FIX: Prevent hydration mismatch by initializing with false and loading from localStorage after mount
  const [collapsed, setCollapsed] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  const pathname = usePathname()
  const { user, updateActivity } = useAuthStore()

  // 🔧 FIX: Load saved state after component mounts to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
    
    // Load saved collapsed state from localStorage
    try {
      const stored = localStorage.getItem('ferdi_sidebar_collapsed')
      if (stored) {
        setCollapsed(JSON.parse(stored))
      }
    } catch (error) {
      console.warn('Failed to load sidebar state:', error)
      setCollapsed(false) // Safe fallback
    }
  }, [])

  // Update activity on navigation
  useEffect(() => {
    updateActivity()
  }, [pathname, updateActivity])

  // 🔧 FIX: Persist sidebar state safely with error handling
  useEffect(() => {
    if (!isClient) return // Don't save during SSR
    
    try {
      localStorage.setItem('ferdi_sidebar_collapsed', JSON.stringify(collapsed))
    } catch (error) {
      console.warn('Failed to save sidebar state:', error)
    }
  }, [collapsed, isClient])

  // 🔧 FIX: Memoize filtered items to prevent unnecessary recalculations
  const filteredItems = useCallback(() => {
    if (!user?.role) return []
    return navigationItems.filter(item => item.roles.includes(user.role))
  }, [user?.role])

  const roleData = user?.role ? ROLE_DEFINITIONS[user.role] : null

  const handleToggleCollapse = useCallback(() => {
    setCollapsed(prev => !prev)
    updateActivity()
  }, [updateActivity])

  // 🔧 FIX: Memoize grouped items to prevent recalculation on every render
  const groupedItems = useCallback(() => {
    const items = filteredItems()
    return {
      main: items.filter(item => item.href === '/dashboard'),
      management: items.filter(item => ['users', 'drivers', 'fleet', 'invitations'].some(path => item.href.includes(path))),
      operations: items.filter(item => ['planning', 'my-routes'].some(path => item.href.includes(path))),
      business: items.filter(item => ['quotes', 'invoices', 'automatisations', 'subcontractors', 'legal-documents', 'clients'].some(path => item.href.includes(path))),
    }
  }, [filteredItems])

  const renderNavGroup = useCallback((items, title = null) => (
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
  ), [collapsed, pathname, updateActivity])

  // 🔧 FIX: Helper function to get user display name safely
  const getUserDisplayName = useCallback(() => {
    if (!user) return ''
    
    // Try full_name first, then construct from parts, then fallback to email
    return user.full_name || 
           `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
           user.email ||
           'Utilisateur'
  }, [user])

  const getUserInitials = useCallback(() => {
    if (!user) return 'U'
    
    if (user.first_name || user.last_name) {
      return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    }
    
    // Fallback to email first letter
    return (user.email?.[0] || 'U').toUpperCase()
  }, [user])

  const groups = groupedItems()

  return (
    <div className={cn(
      'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 transition-all duration-300 flex flex-col h-full shadow-2xl',
      collapsed ? 'w-16' : 'w-72'
    )}>
      {/* Header moderne avec logo Ferdi */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700/50 bg-slate-900/50">
        {!collapsed && (
          <div className="flex items-center">
            <FerdiLogoSidebar collapsed={collapsed} className="mr-2" />
            <div className="ml-2">
              <h1 className="text-white font-bold text-lg">FERDI</h1>
              <p className="text-xs text-slate-400">Gestion de flotte</p>
            </div>
          </div>
        )}
        
        {collapsed && (
          <div className="flex justify-center w-full">
            <FerdiLogoSidebar collapsed={collapsed} />
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleCollapse}
          className="text-slate-400 hover:bg-slate-800 hover:text-white flex-shrink-0 transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Badge rôle utilisateur moderne */}
      {!collapsed && roleData && (
        <div className="p-4 border-b border-slate-700/50">
          <div className={cn(
            'rounded-xl p-4 border-l-4 bg-gradient-to-r from-slate-800/50 to-slate-700/30 backdrop-blur-sm',
            ROLE_COLORS[user?.role]?.border || 'border-blue-500'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  {roleData.label}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  {roleData.description}
                </p>
              </div>
              <Badge 
                className={cn(
                  'text-xs font-medium border-0 shadow-lg',
                  ROLE_COLORS[user?.role]?.bg || 'bg-blue-600'
                )}
              >
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-3 px-3">
          {/* Dashboard principal */}
          {groups.main.length > 0 && renderNavGroup(groups.main)}
          
          {/* Section Gestion */}
          {groups.management.length > 0 && renderNavGroup(groups.management, collapsed ? null : "🔧 GESTION")}
          
          {/* Section Opérations */}
          {groups.operations.length > 0 && renderNavGroup(groups.operations, collapsed ? null : "🚛 OPÉRATIONS")}
          
          {/* Section Business */}
          {groups.business.length > 0 && renderNavGroup(groups.business, collapsed ? null : "💼 BUSINESS")}
        </nav>
      </ScrollArea>

      {/* Profil utilisateur moderne */}
      {!collapsed && user && (
        <div className="p-4 border-t border-slate-700/50 mt-auto bg-slate-900/50">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/60 rounded-xl p-4 border border-slate-600/30 backdrop-blur-sm">
            <div className="flex items-center">
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3 shadow-lg',
                ROLE_COLORS[user?.role]?.bg || 'bg-blue-600',
                'ring-2 ring-slate-500/30'
              )}>
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-slate-300 truncate">
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