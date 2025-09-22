/**
 * 🎨 FERDI Design System - Palette de couleurs moderne
 * Inspirée des couleurs professionnelles du transport français
 */

export const FERDI_COLORS = {
  // 🔵 Bleu Principal - Professionnel et fiable
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Bleu principal
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },

  // 🟠 Orange Dynamique - Énergie et transport
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Orange principal
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407'
  },

  // 🟢 Vert Success - États positifs
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Vert principal
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },

  // 🔴 Rouge Warning/Error - États négatifs
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Rouge principal
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },

  // 🟡 Jaune Warning - Attention
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Jaune principal
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },

  // ⚫ Neutrals - Textes et fonds
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  }
}

// 🎨 Gradients FERDI
export const FERDI_GRADIENTS = {
  primary: 'bg-gradient-to-r from-blue-600 to-blue-700',
  accent: 'bg-gradient-to-r from-orange-500 to-orange-600',
  success: 'bg-gradient-to-r from-green-500 to-green-600',
  danger: 'bg-gradient-to-r from-red-500 to-red-600',
  warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
  hero: 'bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600',
  card: 'bg-gradient-to-br from-white to-gray-50',
  sidebar: 'bg-gradient-to-b from-slate-900 to-slate-800'
}

// 🌈 Couleurs par type de données
export const DATA_COLORS = {
  users: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  fleet: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    icon: 'text-orange-600',
    gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
  },
  missions: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-600',
    gradient: 'bg-gradient-to-br from-green-500 to-green-600'
  },
  performance: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: 'text-purple-600',
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
  },
  finance: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
    gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
  },
  maintenance: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-600',
    gradient: 'bg-gradient-to-br from-amber-500 to-amber-600'
  }
}

// 🎭 Animations et transitions
export const ANIMATIONS = {
  hover: 'transition-all duration-200 ease-in-out',
  slide: 'transition-transform duration-300 ease-in-out',
  fade: 'transition-opacity duration-200 ease-in-out',
  bounce: 'hover:scale-105 transition-transform duration-200',
  glow: 'hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300'
}

// 🎨 Couleurs par rôle utilisateur
export const ROLE_COLORS = {
  SUPER_ADMIN: {
    bg: 'bg-gradient-to-r from-purple-600 to-purple-700',
    text: 'text-purple-700',
    border: 'border-purple-500',
    light: 'bg-purple-50'
  },
  ADMIN: {
    bg: 'bg-gradient-to-r from-blue-600 to-blue-700',
    text: 'text-blue-700',
    border: 'border-blue-500',
    light: 'bg-blue-50'
  },
  DISPATCH: {
    bg: 'bg-gradient-to-r from-orange-600 to-orange-700',
    text: 'text-orange-700',
    border: 'border-orange-500',
    light: 'bg-orange-50'
  },
  DRIVER: {
    bg: 'bg-gradient-to-r from-green-600 to-green-700',
    text: 'text-green-700',
    border: 'border-green-500',
    light: 'bg-green-50'
  },
  INTERNAL_SUPPORT: {
    bg: 'bg-gradient-to-r from-teal-600 to-teal-700',
    text: 'text-teal-700',
    border: 'border-teal-500',
    light: 'bg-teal-50'
  },
  ACCOUNTANT: {
    bg: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
    text: 'text-emerald-700',
    border: 'border-emerald-500',
    light: 'bg-emerald-50'
  }
}