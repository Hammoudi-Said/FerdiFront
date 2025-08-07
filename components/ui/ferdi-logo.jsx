'use client'

import { cn } from '@/lib/utils'

/**
 * Composant Logo Ferdi - Version adaptable
 * Utilise les assets fournis par l'utilisateur
 */
export function FerdiLogo({ 
  variant = 'full', // 'full', 'icon', 'text'
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  className,
  darkMode = false,
  onClick,
  ...props 
}) {
  // URLs des logos fournis par l'utilisateur
  const LOGO_URLS = {
    darkMode: 'https://customer-assets.emergentagent.com/job_d1e3b8ee-3fda-4b8d-b6a2-7813133537a7/artifacts/ysi1i7b7_favicon-dark-mode-V2%20%281%29.png',
    lightMode: 'https://customer-assets.emergentagent.com/job_d1e3b8ee-3fda-4b8d-b6a2-7813133537a7/artifacts/bsn2eheb_favicon-light-mode-V5.png',
    withText: 'https://customer-assets.emergentagent.com/job_d1e3b8ee-3fda-4b8d-b6a2-7813133537a7/artifacts/7g2dybqr_ferdi-logo-bg-transparent-black-text.png'
  }

  // Tailles disponibles
  const sizes = {
    sm: {
      icon: 'w-6 h-6',
      full: 'h-8',
      text: 'h-6'
    },
    md: {
      icon: 'w-8 h-8',
      full: 'h-10',
      text: 'h-8'
    },
    lg: {
      icon: 'w-12 h-12', 
      full: 'h-16',
      text: 'h-12'
    },
    xl: {
      icon: 'w-16 h-16',
      full: 'h-20',
      text: 'h-16'
    }
  }

  // Sélection du logo approprié
  const getLogoUrl = () => {
    if (variant === 'text') {
      return LOGO_URLS.withText
    }
    return darkMode ? LOGO_URLS.darkMode : LOGO_URLS.lightMode
  }

  // Classes de taille selon le variant
  const sizeClass = sizes[size]?.[variant] || sizes.md[variant]

  return (
    <div 
      className={cn(
        'flex items-center',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {/* Logo Icon uniquement */}
      {variant === 'icon' && (
        <img
          src={getLogoUrl()}
          alt="Ferdi"
          className={cn('object-contain', sizeClass)}
          loading="lazy"
        />
      )}

      {/* Logo avec texte complet */}
      {variant === 'full' && (
        <img
          src={LOGO_URLS.withText}
          alt="Ferdi - Gestion d'autocars"
          className={cn('object-contain', sizeClass)}
          loading="lazy"
        />
      )}

      {/* Variante texte seulement */}
      {variant === 'text' && (
        <div className="flex items-center space-x-2">
          <img
            src={getLogoUrl()}
            alt="Ferdi"
            className={cn('object-contain', sizes[size]?.icon || 'w-8 h-8')}
            loading="lazy"
          />
          <span className={cn(
            'font-bold text-gray-900',
            size === 'sm' && 'text-lg',
            size === 'md' && 'text-xl',
            size === 'lg' && 'text-2xl',
            size === 'xl' && 'text-3xl'
          )}>
            FERDI
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Logo Ferdi simplifié pour la sidebar
 */
export function FerdiLogoSidebar({ collapsed = false, className, onClick }) {
  return (
    <FerdiLogo
      variant={collapsed ? 'icon' : 'text'}
      size={collapsed ? 'md' : 'md'}
      className={cn('transition-all duration-300', className)}
      onClick={onClick}
    />
  )
}

/**
 * Logo Ferdi pour les pages d'authentification
 */
export function FerdiLogoAuth({ size = 'lg', className }) {
  return (
    <FerdiLogo
      variant="full"
      size={size}
      className={cn('mx-auto', className)}
    />
  )
}

/**
 * Logo Ferdi pour le header
 */
export function FerdiLogoHeader({ className, onClick }) {
  return (
    <FerdiLogo
      variant="text"
      size="sm"
      className={cn('', className)}
      onClick={onClick}
    />
  )
}

/**
 * Logo Ferdi pour la page de chargement
 */
export function FerdiLogoLoading({ size = 'xl', animated = true, className }) {
  return (
    <div className={cn(
      'relative',
      animated && 'animate-pulse',
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-20"></div>
      <FerdiLogo
        variant="full"
        size={size}
        className="relative z-10"
      />
    </div>
  )
}

export default FerdiLogo