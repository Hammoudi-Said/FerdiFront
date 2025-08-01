import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { api } from '@/lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      company: null,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (token) {
          Cookies.set('token', token, { expires: 7 })
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } else {
          Cookies.remove('token')
          delete api.defaults.headers.common['Authorization']
        }
        set({ token })
      },
      setCompany: (company) => set({ company }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Auth methods
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        
        try {
          const formData = new FormData()
          formData.append('username', email)
          formData.append('password', password)
          
          const response = await fetch('/api/login/access-token', {
            method: 'POST',
            body: formData,
          })
          
          const data = await response.json()
          
          if (!response.ok) {
            throw new Error(data.detail || 'Erreur de connexion')
          }
          
          const { access_token } = data
          get().setToken(access_token)
          
          // Get user info
          const userResponse = await api.get('/users/me')
          const user = userResponse.data
          set({ user })
          
          // Get company info
          const companyResponse = await api.get('/companies/me')
          const company = companyResponse.data
          set({ company })
          
          set({ isLoading: false })
          return { success: true }
          
        } catch (error) {
          set({ 
            error: error.message || 'Erreur de connexion',
            isLoading: false 
          })
          return { success: false, error: error.message }
        }
      },

      logout: () => {
        get().setToken(null)
        set({ 
          user: null, 
          company: null, 
          token: null,
          error: null 
        })
      },

      checkAuth: async () => {
        const token = Cookies.get('token')
        if (!token) {
          set({ isLoading: false })
          return
        }
        
        set({ isLoading: true, token })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        try {
          const userResponse = await api.get('/users/me')
          const user = userResponse.data
          
          const companyResponse = await api.get('/companies/me')
          const company = companyResponse.data
          
          set({ 
            user, 
            company,
            isLoading: false 
          })
        } catch (error) {
          console.error('Auth check failed:', error)
          get().logout()
          set({ isLoading: false })
        }
      },

      registerCompany: async (companyData, managerData) => {
        set({ isLoading: true, error: null })
        
        try {
          const payload = {
            company: companyData,
            manager_email: managerData.email,
            manager_password: managerData.password,
            manager_first_name: managerData.firstName,
            manager_last_name: managerData.lastName,
            manager_phone: managerData.phone,
          }
          
          const response = await fetch('/api/companies/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })
          
          const data = await response.json()
          
          if (!response.ok) {
            throw new Error(data.detail || 'Erreur lors de l\'enregistrement')
          }
          
          set({ isLoading: false })
          return { 
            success: true, 
            companyCode: data.company_code,
            message: data.message 
          }
          
        } catch (error) {
          set({ 
            error: error.message || 'Erreur lors de l\'enregistrement',
            isLoading: false 
          })
          return { success: false, error: error.message }
        }
      },

      registerUser: async (userData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/users/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })
          
          const data = await response.json()
          
          if (!response.ok) {
            throw new Error(data.detail || 'Erreur lors de l\'inscription')
          }
          
          set({ isLoading: false })
          return { success: true, user: data }
          
        } catch (error) {
          set({ 
            error: error.message || 'Erreur lors de l\'inscription',
            isLoading: false 
          })
          return { success: false, error: error.message }
        }
      },

      // Utility methods
      hasRole: (requiredRole) => {
        const { user } = get()
        if (!user) return false
        
        const roleHierarchy = {
          '1': 4, // SUPERADMIN
          '2': 3, // ADMIN  
          '3': 2, // AUTOCARISTE
          '4': 1, // CHAUFFEUR
        }
        
        return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
      },

      getRoleName: () => {
        const { user } = get()
        if (!user) return 'Inconnu'
        
        const roleNames = {
          '1': 'Super Admin',
          '2': 'Administrateur',
          '3': 'Autocariste',
          '4': 'Chauffeur',
        }
        
        return roleNames[user.role] || 'Inconnu'
      },
    }),
    {
      name: 'ferdi-auth',
      partialize: (state) => ({ 
        user: state.user, 
        company: state.company,
        token: state.token 
      }),
    }
  )
)