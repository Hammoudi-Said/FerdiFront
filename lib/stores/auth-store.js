import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { authAPI, usersAPI, companyAPI } from '@/lib/api-client'
import { mockAPI, mockHelpers } from '@/lib/mock-data'
import { getRoleDashboardPath, canRoleAccessPath } from '@/lib/utils/role-redirect'
import { ROLE_DEFINITIONS, UserRole, UserStatus, hasPermission as hasPermissionHelper } from '@/lib/constants/enums'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

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
        } else {
          // Clear token and related data
          Cookies.remove('ferdi_token', { path: '/' })
          sessionManager.clearAll()
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

      // Enhanced login with OpenAPI-compliant authentication
      login: async (email, password) => {
        console.log('🔐 Starting login for:', email)
        set({ isLoading: true, error: null })

        try {
          let data

          if (USE_MOCK_DATA) {
            console.log('🧪 Using mock data for login')
            const response = await mockAPI.login(email, password)
            data = await response.json()

            if (!response.ok) {
              throw new Error(data.detail || 'Erreur de connexion')
            }
          } else {
            console.log('🌐 Using real API for login')
            // Use the OpenAPI-compliant login endpoint
            const response = await authAPI.login(email, password)
            data = response.data
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
          
          // Handle specific authentication errors according to OpenAPI spec
          let errorMessage = 'Erreur de connexion'
          if (error.response?.status === 400) {
            // Bad Request - Invalid credentials or inactive account/company
            const detail = error.response.data?.detail
            if (detail?.includes('inactive')) {
              errorMessage = 'Votre compte ou entreprise est en cours de validation par l\'équipe Ferdi.'
            } else {
              errorMessage = 'Email ou mot de passe incorrect.'
            }
          } else if (error.response?.status === 401) {
            errorMessage = 'Identifiants incorrects.'
          } else if (error.response?.status === 403) {
            errorMessage = 'Accès refusé. Contactez votre administrateur.'
          } else {
            errorMessage = error.message || 'Erreur de connexion au serveur'
          }
          
          set({
            error: errorMessage,
            isLoading: false
          })
          return { success: false, error: errorMessage }
        }
      },

      // Fetch user data using OpenAPI endpoints
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
          
          // Use OpenAPI-compliant endpoints
          const userResponse = await usersAPI.getProfile()
          const user = userResponse.data

          // Check if user is active
          if (!user.is_active) {
            throw new Error('Votre compte est en cours de validation par les super administrateurs. Veuillez attendre la validation pour utiliser FERDI.')
          }

          get().setUser(user)

          const companyResponse = await companyAPI.getMyCompany()
          const company = companyResponse.data

          // Check if company is active (status should be ACTIVE according to OpenAPI)
          if (company.status !== 'ACTIVE') {
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

      // Company registration with OpenAPI endpoints
      registerCompany: async (payload) => {
        console.log('🏢 Registering company:', payload.company?.name)
        set({ isLoading: true, error: null })

        try {
          let data

          if (USE_MOCK_DATA) {
            const response = await mockAPI.registerCompany(payload)
            data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.detail || 'Erreur lors de l\'enregistrement')
            }
          } else {
            // Use OpenAPI-compliant company registration endpoint
            const response = await companyAPI.register(payload)
            data = response.data
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
          
          let errorMessage = 'Erreur lors de l\'enregistrement'
          if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail
          }
          
          set({
            error: errorMessage,
            isLoading: false
          })
          return { success: false, error: errorMessage }
        }
      },

      // User registration with OpenAPI endpoints
      registerUser: async (userData) => {
        console.log('👤 Registering user:', userData.email)
        set({ isLoading: true, error: null })

        try {
          let data

          if (USE_MOCK_DATA) {
            const response = await mockAPI.registerUser(userData)
            data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.detail || 'Erreur lors de l\'inscription')
            }
          } else {
            // Use OpenAPI-compliant user signup endpoint
            const response = await usersAPI.signup(userData)
            data = response.data
          }

          set({ isLoading: false })
          console.log('✅ User registration successful')
          
          return { success: true, user: data }

        } catch (error) {
          console.error('❌ User registration failed:', error)
          
          let errorMessage = 'Erreur lors de l\'inscription'
          if (error.response?.status === 400) {
            errorMessage = 'Email déjà utilisé par un autre compte'
          } else if (error.response?.status === 403) {
            errorMessage = 'Limite d\'utilisateurs atteinte pour cette entreprise'
          } else if (error.response?.status === 404) {
            errorMessage = 'Code entreprise invalide'
          } else if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail
          }
          
          set({
            error: errorMessage,
            isLoading: false
          })
          return { success: false, error: errorMessage }
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
        return hasPermissionHelper(user.role, permission)
      },

      // Access control methods
      canAccessMultiCompany: () => {
        const { user } = get()
        return user?.role === UserRole.SUPER_ADMIN
      },

      canManageOwnCompany: () => {
        const { user } = get()
        return [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user?.role)
      },

      canViewFinancials: () => {
        const { user } = get()
        return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT].includes(user?.role)
      },

      canManageRoutes: () => {
        const { user } = get()
        return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DISPATCH].includes(user?.role)
      },

      isRestrictedToAssigned: () => {
        const { user } = get()
        return user?.role === UserRole.DRIVER
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

      // Enhanced user management using OpenAPI endpoints
      getUsers: async () => {
        const { token, user } = get()
        if (!token || !user) return { success: false, error: 'Non authentifié' }

        // Check permissions
        if (!get().hasPermission('users_view') && !get().hasPermission('users_manage')) {
          return { success: false, error: 'Permissions insuffisantes' }
        }

        try {
          let data

          if (USE_MOCK_DATA) {
            const response = await mockAPI.getUsers(token, user.role)
            data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.detail || 'Erreur lors de la récupération des utilisateurs')
            }
          } else {
            // Use OpenAPI-compliant users list endpoint
            const response = await usersAPI.getUsers()
            data = response.data
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