'use client'

import { EnhancedSignupForm } from '@/components/auth/enhanced-signup-form'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <EnhancedSignupForm />
      
      {/* Lien vers la connexion */}
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          Vous avez déjà un compte ?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}