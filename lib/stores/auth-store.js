import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { api } from '@/lib/api'
import { mockAPI, mockHelpers } from '@/lib/mock-data'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

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
          if (!USE_MOCK_DATA) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          }
        } else {
          Cookies.remove('token')
          if (!USE_MOCK_DATA) {
            delete api.defaults.headers.common['Authorization']
          }
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
          let response, data

          if (USE_MOCK_DATA) {
            // Use mock API
            response = await mockAPI.login(email, password)
            data = await response.json()

            if (!response.ok) {
              throw new Error(data.detail || 'Erreur de connexion')
            }
          } else {
            // Use real API
            const params = new URLSearchParams()
            params.append('grant_type', 'password')
            params.append('username', email)
            params.append('password', password)
            params.append('scope', '')
            params.append('client_id', '')
            params.append('client_secret', '')

            console.log('Form data for login:', params.toString())

            response = await fetch('/api/login/access-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
              },
              body: params.toString(),

            })
            console.log('Login response:', response)

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

          // Get user info
          if (USE_MOCK_DATA) {
            const userResponse = await mockAPI.getCurrentUser(access_token)
            const userData = await userResponse.json()
            if (!userResponse.ok) {
              throw new Error(userData.detail || 'Erreur lors de la récupération du profil')
            }
            set({ user: userData })

            // Get company info
            const companyResponse = await mockAPI.getCompany(access_token)
            const companyData = await companyResponse.json()
            if (!companyResponse.ok) {
              throw new Error(companyData.detail || 'Erreur lors de la récupération de l\'entreprise')
            }
            set({ company: companyData })
          } else {
            const userResponse = await api.get('/users/me')
            const user = userResponse.data
            set({ user })

            // Get company info
            const companyResponse = await api.get('/companies/me')
            const company = companyResponse.data
            set({ company })
          }

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
          token: null,
          company: null,
          isLoading: false,
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

        if (USE_MOCK_DATA) {
          try {
            const userResponse = await mockAPI.getCurrentUser(token)
            const userData = await userResponse.json()

            if (!userResponse.ok) {
              throw new Error('Token invalide')
            }

            const companyResponse = await mockAPI.getCompany(token)
            const companyData = await companyResponse.json()

            if (!companyResponse.ok) {
              throw new Error('Impossible de récupérer les données de l\'entreprise')
            }

            set({
              user: userData,
              company: companyData,
              isLoading: false
            })
          } catch (error) {
            console.error('Auth check failed:', error)
            get().logout()
            set({ isLoading: false })
          }
        } else {
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
        }
      },

      registerCompany: async (payload) => {
        set({ isLoading: true, error: null })

        try {
          let response, data

          if (USE_MOCK_DATA) {
            response = await mockAPI.registerCompany(payload)
            data = await response.json()
          } else {
            console.log('Sending payload:', JSON.stringify(payload, null, 2))
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

      // Get users list (for admin/super admin)
      getUsers: async () => {
        const { token, user } = get()
        if (!token || !user) return { success: false, error: 'Non authentifié' }

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
