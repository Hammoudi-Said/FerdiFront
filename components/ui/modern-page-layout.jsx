/**
 * 🎨 Modern Page Layout - Layout moderne pour toutes les pages FERDI
 * Design cohérent avec gradients et éléments visuels modernes
 */

import { cn } from '@/lib/utils'

export function ModernPageLayout({ 
  children, 
  title, 
  subtitle, 
  icon: Icon,
  gradient = "from-slate-50 to-blue-50/30",
  headerGradient = "from-blue-600 via-blue-700 to-purple-600",
  className,
  actions,
  ...props 
}) {
  return (
    <div className={cn("min-h-full", className)} {...props}>
      {/* Background moderne avec gradient */}
      <div className={cn("min-h-full bg-gradient-to-br p-6 -m-6", gradient)}>
        
        {/* Header moderne de la page */}
        {title && (
          <div className={cn(
            "relative overflow-hidden rounded-2xl shadow-2xl p-6 mb-8 text-white",
            `bg-gradient-to-br ${headerGradient}`
          )}>
            {/* Éléments décoratifs */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {Icon && (
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-md">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-blue-100 text-lg font-medium mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Actions dans le header */}
              {actions && (
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Contenu principal */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export function ModernCard({ 
  children, 
  className, 
  gradient = "from-white to-gray-50/50",
  hover = true,
  ...props 
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-0 shadow-xl rounded-xl backdrop-blur-sm",
        `bg-gradient-to-br ${gradient}`,
        hover && "transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModernSection({ 
  title, 
  subtitle, 
  children, 
  className, 
  icon: Icon,
  iconColor = "text-blue-600",
  ...props 
}) {
  return (
    <ModernCard className={cn("p-6", className)} {...props}>
      {/* Header de section */}
      {title && (
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            {Icon && (
              <div className={cn("p-2 rounded-lg", `bg-${iconColor.split('-')[1]}-100`)}>
                <Icon className={cn("h-5 w-5", iconColor)} />
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-gray-600 font-medium">{subtitle}</p>
          )}
        </div>
      )}
      
      {children}
    </ModernCard>
  )
}

export function ModernStats({ stats, className }) {
  const colors = [
    { bg: 'from-blue-500 to-blue-600', light: 'blue-100', text: 'blue-700' },
    { bg: 'from-orange-500 to-orange-600', light: 'orange-100', text: 'orange-700' },
    { bg: 'from-green-500 to-green-600', light: 'green-100', text: 'green-700' },
    { bg: 'from-purple-500 to-purple-600', light: 'purple-100', text: 'purple-700' },
    { bg: 'from-emerald-500 to-emerald-600', light: 'emerald-100', text: 'emerald-700' },
    { bg: 'from-pink-500 to-pink-600', light: 'pink-100', text: 'pink-700' }
  ]

  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, index) => {
        const color = colors[index % colors.length]
        const Icon = stat.icon
        
        return (
          <ModernCard
            key={stat.label}
            className={`bg-gradient-to-br ${color.bg} text-white group relative overflow-hidden`}
            hover={true}
          >
            {/* Élément décoratif */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
            
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                {stat.trend && (
                  <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {stat.trend}
                  </div>
                )}
              </div>
              
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              
              <p className="text-white/80 text-sm font-medium">
                {stat.label}
              </p>
              
              {stat.subtitle && (
                <p className="text-white/60 text-xs mt-1">
                  {stat.subtitle}
                </p>
              )}
            </div>
          </ModernCard>
        )
      })}
    </div>
  )
}