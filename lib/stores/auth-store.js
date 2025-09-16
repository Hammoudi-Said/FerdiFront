import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { authAPI, usersAPI, companyAPI } from '@/lib/api-client'
import { mockAPI, mockHelpers } from '@/lib/mock-data'
import { getRoleDashboardPath, canRoleAccessPath } from '@/lib/utils/role-redirect'
import { ROLE_DEFINITIONS, UserRole, UserStatus, hasPermission as hasPermissionHelper } from '@/lib/constants/enums'
import { hasPermission, canAccessCompany, canModifyCompany, canManageUsers } from '@/lib/utils/permission-manager'

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

// ✅ OPTIMIZED: Smart Cache Manager with intelligent TTL and invalidation
const smartCache = {
  // Default TTL: 15 minutes (reduced from 30 for fresher data)
  DEFAULT_TTL: 15 * 60 * 1000,
  
  // Set cache with intelligent TTL
  set: (key, data, customTTL = null) => {
    if (typeof window === 'undefined') return false
    
    try {
      const ttl = customTTL || smartCache.DEFAULT_TTL
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        ttl,
        version: '2.0' // Version for cache invalidation
      }
      
      sessionStorage.setItem(`ferdi_${key}`, JSON.stringify(cacheEntry))
      console.log(`💾 Cache SET [${key}] TTL: ${Math.round(ttl/1000/60)}min`)
      return true
    } catch (error) {
      console.warn(`Failed to cache [${key}]:`, error)
      return false
    }
  },

  // Get cache with automatic expiry check
  get: (key) => {
    if (typeof window === 'undefined') return null
    
    try {
      const cached = sessionStorage.getItem(`ferdi_${key}`)
      if (!cached) return null
      
      const entry = JSON.parse(cached)
      const now = Date.now()
      const age = now - entry.timestamp
      
      // Check if expired
      if (age > entry.ttl) {
        console.log(`⏰ Cache EXPIRED [${key}] Age: ${Math.round(age/1000/60)}min`)
        smartCache.remove(key)
        return null
      }
      
      // Check cache version compatibility
      if (entry.version !== '2.0') {
        console.log(`🔄 Cache VERSION MISMATCH [${key}] - invalidating`)
        smartCache.remove(key)
        return null
      }
      
      const remainingTTL = entry.ttl - age
      console.log(`💾 Cache HIT [${key}] Remaining: ${Math.round(remainingTTL/1000/60)}min`)
      return entry.data
    } catch (error) {
      console.warn(`Failed to get cache [${key}]:`, error)
      smartCache.remove(key) // Remove corrupted cache
      return null
    }
  },

  // Remove specific cache entry
  remove: (key) => {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.removeItem(`ferdi_${key}`)
      console.log(`🗑️ Cache REMOVED [${key}]`)
    } catch (error) {
      console.warn(`Failed to remove cache [${key}]:`, error)
    }
  },

  // Check if cache is valid without retrieving data
  isValid: (key) => {
    if (typeof window === 'undefined') return false
    
    try {
      const cached = sessionStorage.getItem(`ferdi_${key}`)
      if (!cached) return false
      
      const entry = JSON.parse(cached)
      const age = Date.now() - entry.timestamp
      
      return age <= entry.ttl && entry.version === '2.0'
    } catch (error) {
      return false
    }
  },

  // Get cache statistics
  getStats: () => {
    if (typeof window === 'undefined') return null
    
    const stats = {
      user: smartCache.isValid('user_cache') ? 'HIT' : 'MISS',
      company: smartCache.isValid('company_cache') ? 'HIT' : 'MISS',
      totalEntries: 0
    }
    
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key?.startsWith('ferdi_')) {
          stats.totalEntries++
        }
      }
    } catch (error) {
      console.warn('Failed to get cache stats:', error)
    }
    
    return stats
  },

  // Clear all ferdi cache entries
  clearAll: () => {
    if (typeof window === 'undefined') return
    
    try {
      const keysToRemove = []
      
      // Find all ferdi cache keys
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key?.startsWith('ferdi_')) {
          keysToRemove.push(key)
        }
      }
      
      // Remove all found keys
      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key)
      })
      
      console.log(`🧹 Cache CLEARED ${keysToRemove.length} entries`)
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }
}

// ✅ OPTIMIZED: Session management utility with smart cache integration
const sessionManager = {
  // Store navigation history
  saveCurrentPath: (path) => {
    smartCache.set('current_path', path, 24 * 60 * 60 * 1000) // 24h TTL for navigation
  },

  getCurrentPath: () => {
    return smartCache.get('current_path') || '/'
  },

  // Save intended path for redirect after login
  saveIntendedPath: (path) => {
    smartCache.set('intended_path', path, 10 * 60 * 1000) // 10min TTL for login redirect
  },

  // Get and clear intended path
  getAndClearIntendedPath: () => {
    const path = smartCache.get('intended_path')
    if (path) {
      smartCache.remove('intended_path')
      return path
    }
    return null
  },

  // Clear all session data
  clearAll: () => {
    smartCache.clearAll()
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
      
      // 🚀 NEW: Optimized auth state management
      authState: 'idle', // idle, checking, authenticated, unauthenticated
      authPromise: null, // Store current auth promise to prevent concurrent calls

      // Initialize auth store
      initialize: () => {
        const state = get()
        if (!state.isInitialized) {
          console.log('🔄 Initializing Auth Store...')
          console.log('📊 Use Mock Data:', USE_MOCK_DATA)
          set({ isInitialized: true })
        }
      },

      // ✅ OPTIMIZED: Enhanced setters with smart cache integration
      setUser: (user) => {
        console.log('👤 Setting user:', user?.email || 'null')
        set({ user, lastActivity: Date.now() })

        // Cache user data with smart cache
        if (user) {
          smartCache.set('user_cache', user)
        } else {
          smartCache.remove('user_cache')
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

        // Cache company data with smart cache
        if (company) {
          smartCache.set('company_cache', company)
        } else {
          smartCache.remove('company_cache')
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
      // 🚀 OPTIMIZED: Simplified login using unified authenticateUser method
      login: async (email, password) => {
        console.log('🔐 Starting optimized login for:', email)
        
        try {
          // Use the unified authentication method
          const result = await get().authenticateUser({ email, password }, true) // Skip cache for fresh login
          
          if (result.authenticated) {
            console.log('✅ Login successful')
            return { success: true }
          } else {
            return { success: false, error: result.error }
          }
        } catch (error) {
          console.error('❌ Login failed:', error)
          return { success: false, error: error.message || 'Erreur de connexion' }
        }
      },

      // 🚀 OPTIMIZED: Unified authentication method - ELIMINATES ALL DUPLICATE API CALLS
      authenticateUser: async (credentials = null, skipCache = false) => {
        const state = get()
        
        // ❌ CRITICAL: Prevent multiple simultaneous authentication calls
        if (state.authState === 'checking') {
          console.log('🛡️ Auth already in progress, returning existing promise...')
          return state.authPromise
        }

        // Set auth state to checking
        set({ authState: 'checking', isLoading: true, error: null })

        // Create authentication promise
        const authPromise = (async () => {
          try {
            let token = state.token

            // 1️⃣ Handle login if credentials provided
            if (credentials) {
              console.log('🔐 Starting login for:', credentials.email)
              
              let loginData
              if (USE_MOCK_DATA) {
                console.log('🧪 Using mock data for login')
                const response = await mockAPI.login(credentials.email, credentials.password)
                loginData = await response.json()
                if (!response.ok) {
                  throw new Error(loginData.detail || 'Erreur de connexion')
                }
              } else {
                console.log('🌐 Using real API for login')
                const response = await authAPI.login(credentials.email, credentials.password)
                loginData = response.data
              }

              token = loginData.access_token
              get().setToken(token)
            }

            // Check if token exists
            if (!token) {
              set({ authState: 'unauthenticated', isLoading: false })
              return { authenticated: false, reason: 'no_token' }
            }

            // 2️⃣ SMART CACHE CHECK - Use new cache system
            if (!skipCache) {
              const cachedUser = smartCache.get('user_cache')
              const cachedCompany = smartCache.get('company_cache')

              if (cachedUser && cachedCompany) {
                console.log('💾 Using smart cached auth data - NO API CALLS!')
                
                set({
                  user: cachedUser,
                  company: cachedCompany,
                  authState: 'authenticated',
                  isLoading: false,
                  lastActivity: Date.now()
                })
                
                return { authenticated: true, reason: 'smart_cache' }
              } else {
                console.log('⏰ Smart cache miss - fetching fresh data')
              }
            }

            // 3️⃣ SINGLE API CALL STRATEGY - Fetch both user and company data
            console.log('🌐 Fetching fresh auth data with optimized calls...')
            
            if (USE_MOCK_DATA) {
              console.log('🧪 Fetching optimized data from mock API')

              // Make calls in parallel for better performance
              const [userResponse, companyResponsePromise] = await Promise.all([
                mockAPI.getCurrentUser(token),
                // Company call needs user data, so we'll do it after user
                Promise.resolve(null)
              ])

              const userData = await userResponse.json()
              if (!userResponse.ok) {
                throw new Error(userData.detail || 'Erreur lors de la récupération du profil')
              }

              // Check if user is active
              if (userData.status !== UserStatus.ACTIVE) {
                throw new Error('Votre compte est en cours de validation par les super administrateurs. Veuillez attendre la validation pour utiliser FERDI.')
              }

              // Now fetch company data with user context
              const companyResponse = await mockAPI.getCompany(token, userData.role)
              const companyData = await companyResponse.json()
              if (!companyResponse.ok) {
                throw new Error(companyData.detail || 'Erreur lors de la récupération de l\'entreprise')
              }

              // Update state and cache in one go
              set({
                user: userData,
                company: companyData,
                authState: 'authenticated',
                isLoading: false,
                lastActivity: Date.now()
              })

              // Cache both data sets with smart cache
              smartCache.set('user_cache', userData)
              smartCache.set('company_cache', companyData)

            } else {
              console.log('🌐 Fetching optimized data from real API')

              // Use Promise.all for parallel API calls - FASTER!
              const [userResponse, companyResponse] = await Promise.all([
                usersAPI.getProfile(),
                companyAPI.getMyCompany()
              ])

              const user = userResponse.data
              const company = companyResponse.data

              // Check if user is active  
              if (user.status !== UserStatus.ACTIVE) {
                throw new Error('Votre compte est en cours de validation par les super administrateurs. Veuillez attendre la validation pour utiliser FERDI.')
              }

              // Check if company is active
              if (company.status !== 'ACTIVE') {
                throw new Error('Votre entreprise est en cours de validation par les super administrateurs. Veuillez attendre la validation pour utiliser FERDI.')
              }

              // Update state and cache in one go
              set({
                user: user,
                company: company,
                authState: 'authenticated',
                isLoading: false,
                lastActivity: Date.now()
              })

              // Cache both data sets with smart cache
              smartCache.set('user_cache', user)
              smartCache.set('company_cache', company)
            }

            console.log('✅ Optimized authentication successful')
            
            // Log cache statistics
            const cacheStats = smartCache.getStats()
            console.log('📊 Cache Stats:', cacheStats)
            
            return { authenticated: true, reason: 'fresh_data' }

          } catch (error) {
            console.error('❌ Authentication failed:', error)
            
            // Handle specific authentication errors
            let errorMessage = 'Erreur de connexion'
            if (error.response?.status === 400) {
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
              authState: 'unauthenticated',
              isLoading: false,
              error: errorMessage
            })
            
            // Clear cache and logout on auth failure
            smartCache.clearAll()
            get().logout('auth_failed')
            return { authenticated: false, reason: 'auth_failed', error: errorMessage }
          }
        })()

        // Store promise to prevent concurrent calls
        set({ authPromise })
        return authPromise
      },

      // 🚨 DEPRECATED: Keep for backward compatibility, but use authenticateUser instead
      fetchUserData: async () => {
        console.warn('⚠️ fetchUserData is DEPRECATED, use authenticateUser() instead for better performance')
        const result = await get().authenticateUser(null, true) // Skip cache for direct fetch
        if (!result.authenticated) {
          throw new Error(result.error || 'Failed to fetch user data')
        }
      },

      // ✅ NEW: Performance monitoring method
      getAuthPerformanceStats: () => {
        const cacheStats = smartCache.getStats()
        const state = get()
        
        return {
          cacheStats,
          authState: state.authState,
          isAuthenticated: !!state.user,
          sessionValid: state.isSessionValid(),
          lastActivity: state.lastActivity ? new Date(state.lastActivity) : null,
          sessionRemaining: state.getSessionInfo()?.remainingTime || 0
        }
      },

      // ✅ OPTIMIZED: Enhanced logout with smart cache clearing
      logout: async (reason = 'user_requested') => {
        console.log('🚪 Logging out, reason:', reason)

        try {
          // Try to call logout endpoint to invalidate token on server
          if (get().token && !USE_MOCK_DATA) {
            await authAPI.logout()
            console.log('✅ Server logout successful')
          }
        } catch (error) {
          console.warn('⚠️ Server logout failed, continuing with local logout:', error.message)
          // Continue with local logout even if server logout fails
        }

        // Clear token and cookies
        get().setToken(null)

        // Clear all session and cached data with smart cache
        smartCache.clearAll()

        // Reset all state
        set({
          user: null,
          token: null,
          company: null,
          isLoading: false,
          error: null,
          lastActivity: Date.now(),
          navigationHistory: [],
          authState: 'idle',
          authPromise: null
        })

        console.log('✅ Logout complete')
      },

      // 🚀 OPTIMIZED: Simplified checkAuth using unified authenticateUser method
      checkAuth: async (skipCache = false) => {
        console.log('🔍 Starting optimized auth check...')
        
        const token = Cookies.get('ferdi_token')
        if (!token) {
          console.log('❌ No token found')
          set({ isLoading: false, authState: 'unauthenticated' })
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

        // Set token if not already set
        if (!state.token) {
          set({ token })
        }

        // Use the unified authentication method
        return await get().authenticateUser(null, skipCache)
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
            // Use OpenAPI-compliant user registration endpoint
            const response = await authAPI.register(userData)
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

      // ✅ ENHANCED PERMISSIONS USING PERMISSION MANAGER
      hasRole: (requiredRole) => {
        const { user } = get()
        if (!user) return false
        return user.role === requiredRole
      },

      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false
        return hasPermission(user.role, permission)
      },

      // ✅ MULTI-TENANT ACCESS CONTROL
      canAccessCompany: (companyId) => {
        const { user } = get()
        return canAccessCompany(user, companyId)
      },

      canModifyCompany: (companyId) => {
        const { user } = get()
        return canModifyCompany(user, companyId)
      },

      canManageUsers: (targetUser = null) => {
        const { user } = get()
        return canManageUsers(user, targetUser)
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
        if (!get().hasPermission('users_read_company') && !get().hasPermission('users_read_all')) {
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

      // ✅ OPTIMIZED: Clear all cached data using smart cache
      clearCache: () => {
        smartCache.clearAll()
        set({ navigationHistory: [] })
        console.log('🧹 All cache cleared')
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
