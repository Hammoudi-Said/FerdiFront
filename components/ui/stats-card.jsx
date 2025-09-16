'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * ✅ CORRECTION CRITIQUE 2.2: Composant StatsCard Unifié
 * Élimine la duplication entre Users et Invitations
 * GAIN: Code DRY + maintenance centralisée + cohérence visuelle
 */

const STAT_THEMES = {
  primary: {
    border: 'border-blue-200',
    bg: 'bg-blue-100', 
    text: 'text-blue-600',
    hover: 'hover:shadow-blue-100',
    iconBg: 'bg-blue-100'
  },
  success: {
    border: 'border-green-200',
    bg: 'bg-green-100',
    text: 'text-green-600', 
    hover: 'hover:shadow-green-100',
    iconBg: 'bg-green-100'
  },
  warning: {
    border: 'border-amber-200',
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    hover: 'hover:shadow-amber-100',
    iconBg: 'bg-amber-100'
  },
  danger: {
    border: 'border-red-200', 
    bg: 'bg-red-100',
    text: 'text-red-600',
    hover: 'hover:shadow-red-100',
    iconBg: 'bg-red-100'
  },
  info: {
    border: 'border-gray-200',
    bg: 'bg-gray-100', 
    text: 'text-gray-600',
    hover: 'hover:shadow-gray-100',
    iconBg: 'bg-gray-100'
  },
  orange: {
    border: 'border-orange-200',
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    hover: 'hover:shadow-orange-100',
    iconBg: 'bg-orange-100'
  }
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon,
  theme = 'primary',
  subtitle,
  className,
  ...props 
}) {
  const themeStyles = STAT_THEMES[theme] || STAT_THEMES.primary
  
  return (
    <Card className={cn(
      // ✅ Style unifié Users/Invitations: hover + scale + shadow + borders colorées
      'border bg-white transition-all duration-200 hover:scale-105 hover:shadow-lg',
      themeStyles.border,
      themeStyles.hover,
      className
    )} {...props}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={cn('text-2xl font-bold', themeStyles.text)}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className={cn(
              // ✅ Icônes dans backgrounds colorés comme Users
              'h-12 w-12 rounded-xl flex items-center justify-center shadow-sm',
              themeStyles.iconBg
            )}>
              <Icon className={cn('h-6 w-6', themeStyles.text)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * ✅ Composant StatsGrid pour layout responsive unifié
 */
export function StatsGrid({ children, className, ...props }) {
  return (
    <div 
      className={cn(
        // ✅ Layout responsive unifié Users style
        'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * ✅ Presets pour Users et Invitations
 */
export const STATS_THEMES = {
  // Users stats themes
  USERS_TOTAL: 'primary',
  USERS_ACTIVE: 'success', 
  USERS_PENDING: 'warning',
  USERS_INACTIVE: 'orange',
  USERS_DELETED: 'danger',
  
  // Invitations stats themes  
  INVITATIONS_TOTAL: 'primary',
  INVITATIONS_PENDING: 'warning',
  INVITATIONS_ACCEPTED: 'success',
  INVITATIONS_EXPIRED: 'danger',
  INVITATIONS_CANCELLED: 'info'
}