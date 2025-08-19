import axios from 'axios'
import Cookies from 'js-cookie'

// Create axios instance with improved configuration
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: true, // Include cookies in requests
})

// 🔧 FIX: Prevent circular dependency with auth store
let authStoreRef = null

// Helper to safely get auth store
const getAuthStore = () => {
  if (!authStoreRef && typeof window !== 'undefined') {
    try {
      const { useAuthStore } = require('@/lib/stores/auth-store')
      authStoreRef = useAuthStore.getState
    } catch (error) {
      console.warn('Could not load auth store:', error)
    }
  }
  return authStoreRef
}

// Request interceptor to add auth token and activity tracking
api.interceptors.request.use(
  (config) => {
    // Add auth token from cookies
    const token = Cookies.get('ferdi_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request ID for tracking
    config.metadata = { 
      startTime: new Date(),
      requestId: Math.random().toString(36).substr(2, 9)
    }
    
    console.log(`🌐 API Request [${config.metadata.requestId}]:`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasAuth: !!token
    })
    
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors and logging
api.interceptors.response.use(
  (response) => {
    // Log successful response
    const duration = new Date() - response.config.metadata.startTime
    console.log(`✅ API Response [${response.config.metadata.requestId}]:`, {
      status: response.status,
      duration: `${duration}ms`,
      url: response.config.url
    })
    
    // 🔧 FIX: Safe activity update to prevent circular dependency
    if (typeof window !== 'undefined') {
      try {
        const getStore = getAuthStore()
        if (getStore) {
          const store = getStore()
          if (store.updateActivity && typeof store.updateActivity === 'function') {
            store.updateActivity()
          }
        }
      } catch (error) {
        // Silently fail if store is not available
        console.debug('Could not update activity from API response:', error)
      }
    }
    
    return response
  },
  async (error) => {
    const duration = error.config?.metadata ? 
      new Date() - error.config.metadata.startTime : 'unknown'
    
    console.error(`❌ API Error [${error.config?.metadata?.requestId || 'unknown'}]:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      duration: `${duration}ms`,
      url: error.config?.url,
      message: error.message
    })
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('🔐 Authentication error detected, logging out user')
      
      // Clear auth data immediately
      Cookies.remove('ferdi_token', { path: '/' })
      
      // 🔧 FIX: Safe logout to prevent circular dependency
      if (typeof window !== 'undefined') {
        try {
          // Clear session storage
          sessionStorage.removeItem('ferdi_user_cache')
          sessionStorage.removeItem('ferdi_company_cache')
          
          // Save intended path for redirect after login
          const currentPath = window.location.pathname
          if (currentPath !== '/auth/login' && currentPath !== '/') {
            sessionStorage.setItem('ferdi_intended_path', currentPath)
          }
          
          // Try to logout user through store if available
          const getStore = getAuthStore()
          if (getStore) {
            const store = getStore()
            if (store.logout && typeof store.logout === 'function') {
              store.logout('authentication_error')
            }
          } else {
            // Fallback: direct redirect if store not available
            setTimeout(() => {
              window.location.href = '/auth/login'
            }, 100)
          }
        } catch (storeError) {
          console.warn('Could not access auth store for logout, redirecting directly:', storeError)
          // Fallback redirect
          window.location.href = '/auth/login'
        }
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error or server unreachable:', error.message)
      
      // Create a custom error response for network errors
      const networkError = new Error('Erreur de connexion au serveur')
      networkError.isNetworkError = true
      networkError.originalError = error
      return Promise.reject(networkError)
    }
    
    // Handle other HTTP errors
    if (error.response?.status >= 500) {
      console.error('🔥 Server error detected:', error.response.status)
      
      const serverError = new Error('Erreur serveur, veuillez réessayer plus tard')
      serverError.isServerError = true
      serverError.status = error.response.status
      serverError.originalError = error
      return Promise.reject(serverError)
    }
    
    return Promise.reject(error)
  }
)

// Helper function to check if an error is a network error
export const isNetworkError = (error) => {
  return error?.isNetworkError === true || !error?.response
}

// Helper function to check if an error is a server error
export const isServerError = (error) => {
  return error?.isServerError === true || error?.response?.status >= 500
}

// Helper function to check if an error is an authentication error
export const isAuthError = (error) => {
  return error?.response?.status === 401
}

// Helper function to format API errors for user display
export const formatApiError = (error) => {
  if (isNetworkError(error)) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion internet.'
  }
  
  if (isServerError(error)) {
    return 'Le serveur rencontre des difficultés. Veuillez réessayer dans quelques minutes.'
  }
  
  if (isAuthError(error)) {
    return 'Votre session a expiré. Veuillez vous reconnecter.'
  }
  
  // Try to get error message from response
  const message = error?.response?.data?.detail || 
                 error?.response?.data?.message || 
                 error?.message || 
                 'Une erreur inattendue s\'est produite'
  
  return message
}

export default api