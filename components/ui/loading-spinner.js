'use client'

import { cn } from '@/lib/utils'

const LoadingSpinner = ({ size = 'default', className }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-blue-600", sizeClasses[size], className)}>
      <span className="sr-only">Chargement...</span>
    </div>
  )
}

LoadingSpinner.displayName = 'LoadingSpinner'

export { LoadingSpinner }