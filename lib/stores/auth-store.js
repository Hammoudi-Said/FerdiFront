import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { api } from '@/lib/api'
import { mockAPI, mockHelpers } from '@/lib/mock-data'
import { getRoleDashboardPath, canRoleAccessPath } from '@/lib/utils/role-redirect'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Enhanced role definitions with specific permissions per role
const ROLE_DEFINITIONS = {
  '1': {
    id: '1',
    name: 'super_admin',
    label: 'Admin Ferdi',
    description: 'Admin éditeur - Accès total multi-entreprises',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    permissions: [
      '*', // All permissions
      'multi_company_access',
      'system_admin',
      'support_all_clients',
      'view_all_companies',
      'manage_all_users',
      'system_settings',
      'audit_logs'
    ],
  },
  '2': {
    id: '2',
    name: 'admin',
    label: 'Client Admin',
    description: 'Administrateur entreprise cliente',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    permissions: [
      'company_manage',           // Gérer sa propre entreprise
      'users_manage',             // Gérer les utilisateurs de son entreprise
      'fleet_manage',             // Gérer la flotte
      'routes_manage',            // Gérer tous les trajets
      'drivers_manage',           // Gérer les chauffeurs
      'schedule_manage',          // Gérer le planning
      'billing_manage',           // Facturation
      'quotes_manage',            // Devis
      'reports_access',           // Rapports
      'company_settings',         // Paramètres entreprise
    ],
  },
  '3': {
    id: '3',
    name: 'dispatch',
    label: 'Dispatcheur',
    description: 'Gestion trajets et chauffeurs',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    permissions: [
      'routes_manage',            // Gérer tous les trajets
      'schedule_manage',          // Gérer le planning complet
      'drivers_assign',           // Assigner des chauffeurs
      'fleet_view',               // Voir la flotte (pas gérer)
      'drivers_view',             // Voir les chauffeurs
      'circulation_data',         // Données de circulation
      'route_optimization',      // Optimisation trajets
    ],
  },
  '4': {
    id: '4',
    name: 'driver',
    label: 'Chauffeur',
    description: 'Accès limité aux trajets assignés',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    permissions: [
      'routes_view_assigned',     // Voir seulement ses trajets
      'schedule_view_assigned',   // Voir seulement son planning
      'vehicle_check',            // Contrôle véhicule assigné
      'trip_status_update',       // Mettre à jour statut trajet
    ],
  },
  '5': {
    id: '5',
    name: 'internal_support',
    label: 'Support Interne',
    description: 'Support clients et assistance',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    permissions: [
      'support_access',           // Accès support
      'users_view',               // Voir utilisateurs (pas gérer)
      'routes_view',              // Voir les trajets (pas gérer)
      'fleet_view',               // Voir la flotte (pas gérer)
      'drivers_view',             // Voir les chauffeurs
      'client_assistance',        // Assistance clients
      'basic_reports',            // Rapports basiques
    ],
  },
  '6': {
    id: '6',
    name: 'accountant',
    label: 'Comptable',
    description: 'Facturation et rapports',
    color: 'bg-teal-500',
    textColor: 'text-teal-700',
    bgColor: 'bg-teal-50',
    permissions: [
      'billing_manage',           // Gérer facturation
      'invoices_manage',          // Gérer factures
      'quotes_view',              // Voir devis (pas créer)
      'reports_access',           // Accès complet rapports
      'financial_reports',        // Rapports financiers
      'exports_access',           // Exports comptables
      'payment_tracking',         // Suivi paiements
    ],
  },
}

// Enhanced storage with cache management and error handling
const customStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null
    
    try {
      const item = localStorage.getItem(name)
      if (!item) return null

      const parsed = JSON.parse(item)

      // Check if data is expired (7 days)
      if (parsed.timestamp && Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(name)
        return null
      }

      return parsed.data
    } catch (error) {
      console.warn('Failed to get from localStorage:', error)
      return null
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return
    
    try {
      const item = {
        data: value,
        timestamp: Date.now(),
      }
      localStorage.setItem(name, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(name)
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
  },
}

// Session management utility
const sessionManager = {
  // Store navigation history for better back navigation
  saveCurrentPath: (path) => {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.setItem('ferdi_current_path', path)
    } catch (error) {
      console.warn('Failed to save current path:', error)
    }
  },
  
  // Get previous path for back navigation
  getCurrentPath: () => {
    if (typeof window === 'undefined') return '/'
    try {
      return sessionStorage.getItem('ferdi_current_path') || '/'
    } catch (error) {
      return '/'
    }
  },
  
  // Save intended path for redirect after login
  saveIntendedPath: (path) => {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.setItem('ferdi_intended_path', path)
    } catch (error) {
      console.warn('Failed to save intended path:', error)
    }
  },
  
  // Get and clear intended path
  getAndClearIntendedPath: () => {
    if (typeof window === 'undefined') return null
    try {
      const path = sessionStorage.getItem('ferdi_intended_path')
      if (path) {
        sessionStorage.removeItem('ferdi_intended_path')
        return path
      }
    } catch (error) {
      console.warn('Failed to get intended path:', error)
    }
    return null
  },
  
  // Clear all session data
  clearAll: () => {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.removeItem('ferdi_user_cache')
      sessionStorage.removeItem('ferdi_company_cache')
      sessionStorage.removeItem('ferdi_current_path')
      sessionStorage.removeItem('ferdi_intended_path')
    } catch (error) {
      console.warn('Failed to clear session storage:', error)
    }
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      company: null,
      isLoading: false,
      error: null,
      lastActivity: Date.now(),
      sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
      isInitialized: false,
      navigationHistory: [],

      // Initialize auth store
      initialize: () => {
        const state = get()
        if (!state.isInitialized) {
          console.log('🔄 Initializing Auth Store...')
          console.log('📊 Use Mock Data:', USE_MOCK_DATA)
          
          // Set up API headers if we have a token
          const token = Cookies.get('ferdi_token')
          if (token && !USE_MOCK_DATA) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          }
          
          set({ isInitialized: true })
        }
      },

      // Enhanced setters with improved error handling
      setUser: (user) => {
        console.log('👤 Setting user:', user?.email || 'null')
        set({ user, lastActivity: Date.now() })
        
        // Cache user data with improved error handling
        if (user && typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('ferdi_user_cache', JSON.stringify({
              user,
              timestamp: Date.now()
            }))
          } catch (error) {
            console.warn('Failed to cache user data:', error)
          }
        }
      },

      setToken: (token) => {
        console.log('🔑 Setting token:', token ? '***' : 'null')
        
        if (token) {
          // Set cookie with improved security
          Cookies.set('ferdi_token', token, {
            expires: 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
          })
          
          // Set API header for non-mock mode
          if (!USE_MOCK_DATA) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          }
        } else {
          // Clear token and related data
          Cookies.remove('ferdi_token', { path: '/' })
          sessionManager.clearAll()
          
          if (!USE_MOCK_DATA) {
            delete api.defaults.headers.common['Authorization']
          }
        }
        
        set({ token, lastActivity: Date.now() })
      },

      setCompany: (company) => {
        console.log('🏢 Setting company:', company?.name || 'null')
        set({ company, lastActivity: Date.now() })
        
        // Cache company data
        if (company && typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('ferdi_company_cache', JSON.stringify({
              company,
              timestamp: Date.now()
            }))
          } catch (error) {
            console.warn('Failed to cache company data:', error)
          }
        }
      },

      setLoading: (isLoading) => {
        console.log('⏳ Loading state:', isLoading)
        set({ isLoading })
      },
      
      setError: (error) => {
        console.log('❌ Error:', error)
        set({ error })
      },

      // Enhanced login with better error handling and session management
      login: async (email, password) => {
        console.log('🔐 Starting login for:', email)
        set({ isLoading: true, error: null })

        try {
          let response, data

          if (USE_MOCK_DATA) {
            console.log('🧪 Using mock data for login')
            response = await mockAPI.login(email, password)
            data = await response.json()

            if (!response.ok) {
              throw new Error(data.detail || 'Erreur de connexion')
            }
          } else {
            console.log('🌐 Using real API for login')
            const params = new URLSearchParams()
            params.append('grant_type', 'password')
            params.append('username', email)
            params.append('password', password)
            params.append('scope', '')
            params.append('client_id', '')
            params.append('client_secret', '')

            response = await fetch('/api/login/access-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
              },
              body: params.toString(),
            })

            if (!response.ok) {
              let errorMessage = 'Erreur de connexion'
              try {
                data = await response.json()
                errorMessage = data.detail || errorMessage
              } catch (jsonError) {
                errorMessage = `HTTP ${response.status}: ${response.statusText || errorMessage}`
              }
              throw new Error(errorMessage)
            }

            data = await response.json()
          }

          const { access_token } = data
          get().setToken(access_token)

          // Get user info with better error handling
          await get().fetchUserData()

          set({ isLoading: false, lastActivity: Date.now() })
          console.log('✅ Login successful')
          
          return { success: true }

        } catch (error) {
          console.error('❌ Login failed:', error)
          set({
            error: error.message || 'Erreur de connexion',
            isLoading: false
          })
          return { success: false, error: error.message }
        }
      },

      // New method to fetch user data
      fetchUserData: async () => {
        const token = get().token
        if (!token) throw new Error('No token available')

        if (USE_MOCK_DATA) {
          console.log('🧪 Fetching user data from mock API')
          
          const userResponse = await mockAPI.getCurrentUser(token)
          const userData = await userResponse.json()
          if (!userResponse.ok) {
            throw new Error(userData.detail || 'Erreur lors de la récupération du profil')
          }

          // Check if user is active
          if (!userData.is_active) {
            throw new Error('Votre compte est en cours de validation par les super administrateurs. Veuillez attendre la validation pour utiliser FERDI.')
          }

          get().setUser(userData)

          const companyResponse = await mockAPI.getCompany(token, userData.role)
          const companyData = await companyResponse.json()
          if (!companyResponse.ok) {
            throw new Error(companyData.detail || 'Erreur lors de la récupération de l\'entreprise')
          }

          get().setCompany(companyData)
        } else {
          console.log('🌐 Fetching user data from real API')
          
          const userResponse = await api.get('/users/me')
          const user = userResponse.data

          // Check if user is active
          if (!user.is_active) {
            throw new Error('Votre compte est en cours de validation par les super administrateurs. Veuillez attendre la validation pour utiliser FERDI.')
          }

          get().setUser(user)

          const companyResponse = await api.get('/companies/me')
          const company = companyResponse.data

          // Check if company is active
          if (!company.is_active) {
            throw new Error('Votre entreprise est en cours de validation par les super administrateurs. Veuillez attendre la validation pour utiliser FERDI.')
          }

          get().setCompany(company)
        }
      },

      // Enhanced logout with complete cleanup
      logout: (reason = 'user_requested') => {
        console.log('🚪 Logging out, reason:', reason)
        
        // Clear token and cookies
        get().setToken(null)
        
        // Clear all session and cached data
        sessionManager.clearAll()
        
        // Reset all state
        set({
          user: null,
          token: null,
          company: null,
          isLoading: false,
          error: null,
          lastActivity: Date.now(),
          navigationHistory: []
        })
        
        console.log('✅ Logout complete')
      },

      // Enhanced checkAuth with improved caching and error handling
      checkAuth: async (skipCache = false) => {
        const token = Cookies.get('ferdi_token')
        console.log('🔍 Checking auth, token exists:', !!token)
        
        if (!token) {
          console.log('❌ No token found')
          set({ isLoading: false })
          return { authenticated: false, reason: 'no_token' }
        }

        // Check session timeout
        const state = get()
        const now = Date.now()
        if (state.lastActivity && (now - state.lastActivity) > state.sessionTimeout) {
          console.log('⏰ Session expired due to inactivity')
          get().logout('session_timeout')
          return { authenticated: false, reason: 'session_timeout' }
        }

        set({ isLoading: true, token })

        // Try to use cached data first (unless skipCache is true)
        if (!skipCache && typeof window !== 'undefined') {
          try {
            const cachedUser = sessionStorage.getItem('ferdi_user_cache')
            const cachedCompany = sessionStorage.getItem('ferdi_company_cache')

            if (cachedUser && cachedCompany) {
              const userCache = JSON.parse(cachedUser)
              const companyCache = JSON.parse(cachedCompany)

              // Check if cache is still valid (30 minutes)
              const cacheExpiry = 30 * 60 * 1000
              if (
                (now - userCache.timestamp) < cacheExpiry &&
                (now - companyCache.timestamp) < cacheExpiry
              ) {
                console.log('💾 Using cached auth data')
                set({
                  user: userCache.user,
                  company: companyCache.company,
                  isLoading: false,
                  lastActivity: now
                })
                return { authenticated: true, reason: 'cache' }
              } else {
                console.log('⏰ Cache expired, fetching fresh data')
              }
            }
          } catch (error) {
            console.warn('Failed to load cached auth data:', error)
          }
        }

        // Fetch fresh data
        try {
          await get().fetchUserData()
          set({ isLoading: false })
          console.log('✅ Auth check successful')
          return { authenticated: true, reason: 'fresh_data' }
        } catch (error) {
          console.error('❌ Auth check failed:', error)
          get().logout('auth_check_failed')
          set({ isLoading: false })
          return { authenticated: false, reason: 'auth_failed', error: error.message }
        }
      },

      // Navigation helpers
      saveCurrentPath: (path) => {
        sessionManager.saveCurrentPath(path)
        // Also add to navigation history
        const history = get().navigationHistory
        const newHistory = [path, ...history.filter(p => p !== path)].slice(0, 10) // Keep last 10 unique paths
        set({ navigationHistory: newHistory })
      },
      
      getIntendedPath: () => sessionManager.getAndClearIntendedPath(),
      
      saveIntendedPath: (path) => sessionManager.saveIntendedPath(path),

      // Activity management
      updateActivity: () => {
        const now = Date.now()
        set({ lastActivity: now })
        
        // Extend cookie expiration on activity
        const token = Cookies.get('ferdi_token')
        if (token) {
          Cookies.set('ferdi_token', token, {
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
          })
        }
      },

      // Company registration with better error handling
      registerCompany: async (payload) => {
        console.log('🏢 Registering company:', payload.company?.name)
        set({ isLoading: true, error: null })

        try {
          let response, data

          if (USE_MOCK_DATA) {
            response = await mockAPI.registerCompany(payload)
            data = await response.json()
          } else {
            response = await fetch('/api/companies/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            })

            data = await response.json()
          }

          if (!response.ok) {
            throw new Error(data.detail || 'Erreur lors de l\'enregistrement')
          }

          set({ isLoading: false })
          console.log('✅ Company registration successful')
          
          return {
            success: true,
            companyCode: data.company_code,
            message: data.message
          }

        } catch (error) {
          console.error('❌ Company registration failed:', error)
          set({
            error: error.message || 'Erreur lors de l\'enregistrement',
            isLoading: false
          })
          return { success: false, error: error.message }
        }
      },

      registerUser: async (userData) => {
        console.log('👤 Registering user:', userData.email)
        set({ isLoading: true, error: null })

        try {
          let response, data

          if (USE_MOCK_DATA) {
            response = await mockAPI.registerUser(userData)
            data = await response.json()
          } else {
            response = await fetch('/api/users/signup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
            })

            data = await response.json()
          }

          if (!response.ok) {
            throw new Error(data.detail || 'Erreur lors de l\'inscription')
          }

          set({ isLoading: false })
          console.log('✅ User registration successful')
          
          return { success: true, user: data }

        } catch (error) {
          console.error('❌ User registration failed:', error)
          set({
            error: error.message || 'Erreur lors de l\'inscription',
            isLoading: false
          })
          return { success: false, error: error.message }
        }
      },

      // Enhanced role and permission methods
      hasRole: (requiredRole) => {
        const { user } = get()
        if (!user) return false
        return user.role === requiredRole
      },

      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false

        const roleData = ROLE_DEFINITIONS[user.role]
        if (!roleData) return false

        // Super admin has all permissions
        if (roleData.permissions.includes('*')) return true

        return roleData.permissions.includes(permission)
      },

      // Access control methods
      canAccessMultiCompany: () => {
        const { user } = get()
        return user?.role === '1' // Only super_admin
      },

      canManageOwnCompany: () => {
        const { user } = get()
        return ['1', '2'].includes(user?.role) // super_admin or admin
      },

      canViewFinancials: () => {
        const { user } = get()
        return ['1', '2', '6'].includes(user?.role) // super_admin, admin, or accountant
      },

      canManageRoutes: () => {
        const { user } = get()
        return ['1', '2', '3'].includes(user?.role) // super_admin, admin, or dispatch
      },

      isRestrictedToAssigned: () => {
        const { user } = get()
        return user?.role === '4' // Only drivers
      },

      getRoleData: () => {
        const { user } = get()
        if (!user) return null
        return ROLE_DEFINITIONS[user.role] || null
      },

      getRoleName: () => {
        const { user } = get()
        if (!user) return 'Inconnu'
        return ROLE_DEFINITIONS[user.role]?.label || 'Inconnu'
      },

      getRoleColor: () => {
        const { user } = get()
        if (!user) return 'bg-gray-500'
        return ROLE_DEFINITIONS[user.role]?.color || 'bg-gray-500'
      },

      // Enhanced user management
      getUsers: async () => {
        const { token, user } = get()
        if (!token || !user) return { success: false, error: 'Non authentifié' }

        // Check permissions
        if (!get().hasPermission('users_view') && !get().hasPermission('users_manage')) {
          return { success: false, error: 'Permissions insuffisantes' }
        }

        try {
          let response, data

          if (USE_MOCK_DATA) {
            response = await mockAPI.getUsers(token, user.role)
            data = await response.json()
          } else {
            const apiResponse = await api.get('/users/')
            data = apiResponse.data
            response = { ok: true }
          }

          if (!response.ok) {
            throw new Error(data.detail || 'Erreur lors de la récupération des utilisateurs')
          }

          return { success: true, users: data.data || data, count: data.count || data.length }

        } catch (error) {
          return { success: false, error: error.message || 'Erreur lors de la récupération des utilisateurs' }
        }
      },

      // Role-based access control methods
      canAccessPath: (path) => {
        const { user } = get()
        if (!user?.role) return false
        return canRoleAccessPath(user.role, path)
      },

      getRoleDashboard: () => {
        const { user } = get()
        if (!user?.role) return '/dashboard'
        return getRoleDashboardPath(user.role)
      },

      // Session management
      isSessionValid: () => {
        const state = get()
        const now = Date.now()
        return state.token && state.lastActivity && (now - state.lastActivity) < state.sessionTimeout
      },

      extendSession: () => {
        set({ lastActivity: Date.now() })
      },

      // Clear all cached data
      clearCache: () => {
        sessionManager.clearAll()
        set({ navigationHistory: [] })
      },

      // Reset error state
      clearError: () => {
        set({ error: null })
      },

      // Get session info
      getSessionInfo: () => {
        const state = get()
        const now = Date.now()
        const remainingTime = state.sessionTimeout - (now - (state.lastActivity || 0))
        
        return {
          isValid: state.isSessionValid(),
          remainingTime: Math.max(0, remainingTime),
          lastActivity: new Date(state.lastActivity || 0),
          expiresAt: new Date((state.lastActivity || 0) + state.sessionTimeout)
        }
      }
    }),
    {
      name: 'ferdi-auth',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        user: state.user,
        company: state.company,
        token: state.token,
        lastActivity: state.lastActivity,
        navigationHistory: state.navigationHistory
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Rehydrating auth store from storage')
        
        // Initialize the store after rehydration
        if (state) {
          // Set up API authorization header if token exists
          if (state.token && !USE_MOCK_DATA) {
            api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
          }
          
          // Mark as initialized
          state.isInitialized = true
          
          console.log('✅ Auth store rehydrated successfully')
        }
      },
    }
  )
)

// Initialize auth store on import
if (typeof window !== 'undefined') {
  // Small delay to ensure all modules are loaded
  setTimeout(() => {
    const store = useAuthStore.getState()
    store.initialize()
  }, 100)
}

// Export role definitions for use in components
export { ROLE_DEFINITIONS }