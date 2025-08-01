'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

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
        router.push('/auth/login')
      }
    }
  }, [token, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}