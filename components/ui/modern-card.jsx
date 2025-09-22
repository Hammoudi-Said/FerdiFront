/**
 * 🎨 Modern Card Component - Designed for FERDI
 * Modern card with gradients and hover effects
 */

import { cn } from '@/lib/utils'

export function ModernCard({ 
  children, 
  className, 
  gradient = "from-white to-gray-50",
  hover = true,
  ...props 
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br border-0 shadow-xl rounded-xl",
        gradient,
        hover && "transition-all duration-300 hover:scale-105 hover:shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModernCardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between space-y-0 pb-2 relative z-10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModernCardContent({ children, className, ...props }) {
  return (
    <div
      className={cn("relative z-10", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModernCardTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn(
        "text-sm font-bold tracking-wide uppercase",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}