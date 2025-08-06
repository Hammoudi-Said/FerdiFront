'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { InvitationAcceptForm } from '@/components/invitations/invitation-accept-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, Mail } from 'lucide-react'

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams()
  const [token, setToken] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const invitationToken = searchParams.get('token')
    
    if (!invitationToken) {
      setError('Token d\'invitation manquant ou invalide')
      return
    }
    
    setToken(invitationToken)
  }, [searchParams])

  const handleSuccess = (userData) => {
    setSuccess(true)
    console.log('User created successfully:', userData)
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
  }

  if (error && !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-900">Invitation invalide</CardTitle>
              <CardDescription>
                Le lien d'invitation n'est pas valide ou a expiré.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Si vous avez reçu ce lien récemment, contactez votre administrateur pour qu'il vous renvoie une nouvelle invitation.
                </p>
                <a 
                  href="/auth/login" 
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Retour à la connexion
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <div className="flex justify-center">
          <Mail className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900">
          FERDI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Système de gestion d'autocars
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {error && !success ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        ) : null}

        {success ? (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-900">Compte créé avec succès!</CardTitle>
              <CardDescription>
                Votre compte a été créé et activé. Vous pouvez maintenant vous connecter.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <a 
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
              >
                Se connecter maintenant
              </a>
            </CardContent>
          </Card>
        ) : (
          token && (
            <InvitationAcceptForm
              token={token}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )
        )}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          En créant votre compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
        </p>
      </div>
    </div>
  )
}