'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { FerdiLogoLoading } from '@/components/ui/ferdi-logo'
import { Bus, Zap, Users } from 'lucide-react'

// ✅ OPTIMIZED: Simple loading screen - AuthGuard handles all auth logic
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div className="text-center space-y-6">
      <div className="relative">
        {/* Logo Ferdi animé */}
        <FerdiLogoLoading size="xl" className="mb-6" />
        <p className="text-gray-600 mt-4 font-medium">Gestion de flotte d'autocars</p>
      </div>
      
      <div className="space-y-3">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="text-sm text-gray-500">Redirection vers votre tableau de bord...</p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-xs text-gray-600">Gestion d'équipe</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Bus className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-xs text-gray-600">Flotte complète</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-xs text-gray-600">En temps réel</p>
        </div>
      </div>
    </div>
  </div>
)

// ✅ OPTIMIZED: HomePage now delegates ALL auth logic to AuthGuard
// No more duplicate auth checks - eliminates 2-3 API calls per page load
export default function HomePage() {
  const router = useRouter()
  const { user, getRoleDashboard, updateActivity } = useAuthStore()

  // ✅ OPTIMIZED: Simple redirect logic - AuthGuard ensures user is authenticated
  useEffect(() => {
    if (user) {
      console.log('🔄 HomePage: User authenticated, redirecting to dashboard...')
      
      // Update activity for session management
      updateActivity()
      
      // Get role-based dashboard path
      const dashboardPath = getRoleDashboard()
      
      // Small delay to ensure smooth transition
      setTimeout(() => {
        router.push(dashboardPath)
      }, 500)
    }
  }, [user, router, getRoleDashboard, updateActivity])

  // ✅ OPTIMIZED: Simple loading screen while redirect happens
  // AuthGuard handles all auth complexity
  return <LoadingScreen />
}