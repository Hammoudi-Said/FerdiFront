'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/lib/stores/auth-store'
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
} from 'lucide-react'

const navigationItems = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: BarChart3,
    roles: ['1', '2', '3', '4'], // All roles
  },
  {
    title: 'Ma société',
    href: '/dashboard/company',
    icon: Building2,
    roles: ['1', '2', '3'], // Not for drivers
  },
  {
    title: 'Utilisateurs',
    href: '/dashboard/users',
    icon: Users,
    roles: ['1', '2'], // Admin and Super Admin only
  },
  {
    title: 'Flotte',
    href: '/dashboard/fleet',
    icon: Bus,
    roles: ['1', '2', '3'], // Not for drivers
  },
  {
    title: 'Chauffeurs',
    href: '/dashboard/drivers',
    icon: UserCheck,
    roles: ['1', '2', '3'], // Not for drivers
  },
  {
    title: 'Trajets',
    href: '/dashboard/routes',
    icon: MapPin,
    roles: ['1', '2', '3', '4'], // All roles
  },
  {
    title: 'Planning',
    href: '/dashboard/schedule',
    icon: Calendar,
    roles: ['1', '2', '3', '4'], // All roles
  },
  {
    title: 'Devis',
    href: '/dashboard/quotes',
    icon: FileText,
    roles: ['1', '2', '3'], // Not for drivers
  },
  {
    title: 'Factures',
    href: '/dashboard/invoices',
    icon: Receipt,
    roles: ['1', '2'], // Admin and Super Admin only
  },
  {
    title: 'Support',
    href: '/dashboard/support',
    icon: Phone,
    roles: ['1', '2', '3', '4'], // All roles
  },
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['1', '2'], // Admin and Super Admin only
  },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, hasRole } = useAuthStore()

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <div className={cn(
      'bg-sidebar border-r border-sidebar-border transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center">
            <div className="bg-sidebar-primary p-2 rounded-lg mr-3">
              <Bus className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">FERDI</h2>
              <p className="text-xs text-sidebar-foreground/70">Gestion de flotte</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {filteredItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                    collapsed && 'px-2'
                  )}
                >
                  <Icon className={cn('h-4 w-4', !collapsed && 'mr-3')} />
                  {!collapsed && item.title}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-sidebar-accent rounded-lg p-3">
            <p className="text-sm font-medium text-sidebar-accent-foreground">
              {user?.full_name || `${user?.first_name} ${user?.last_name}`}
            </p>
            <p className="text-xs text-sidebar-accent-foreground/70">
              {user?.role === '1' && 'Super Admin'}
              {user?.role === '2' && 'Administrateur'}
              {user?.role === '3' && 'Autocariste'}
              {user?.role === '4' && 'Chauffeur'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}