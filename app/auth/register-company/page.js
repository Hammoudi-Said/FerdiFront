'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CompanyRegistrationForm } from '@/components/auth/company-registration-form'
import { Bus, ArrowLeft } from 'lucide-react'

export default function RegisterCompanyPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Button>
          </Link>
          
          <div className="flex items-center">
            <div className="bg-primary p-2 rounded-full mr-3">
              <Bus className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FERDI</h1>
              <p className="text-sm text-gray-600">Gestion de flotte</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <CompanyRegistrationForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}