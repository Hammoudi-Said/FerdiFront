'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export default function HomePage() {
  const router = useRouter()
  const { token, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth()
    }
    initAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading) {
      if (token) {
        router.push('/dashboard')
      } else {
        // If in mock mode, show demo page first
        if (USE_MOCK_DATA) {
          router.push('/demo')
        } else {
          router.push('/auth/login')
        }
      }
    }
  }, [token, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}