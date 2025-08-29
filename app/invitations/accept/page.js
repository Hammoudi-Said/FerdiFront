'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { Bus, UserPlus, Eye, EyeOff, CheckCircle, AlertCircle, Mail, Phone, User, Lock } from 'lucide-react'

const acceptInvitationSchema = z.object({
  first_name: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
  last_name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  mobile: z.string()
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 caractères')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .regex(/^(?:(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4})$/, 'Format invalide (ex: 06 12 34 56 78)'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(40, 'Le mot de passe ne peut pas dépasser 40 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Doit contenir au moins 1 minuscule, 1 majuscule et 1 chiffre'),
  confirm_password: z.string().min(1, 'Confirmation requise'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
})

export default function AcceptInvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState('')
  const [success, setSuccess] = useState(false)

  const form = useForm({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      mobile: '',
      password: '',
      confirm_password: '',
    },
  })

  useEffect(() => {
    // Get token from URL parameters
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      // If no token in URL, redirect to login with error
      toast.error('Token d\'invitation manquant', {
        description: 'Le lien d\'invitation est invalide ou expiré'
      })
      router.push('/auth/login')
    }
  }, [searchParams, router])

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Token manquant', {
        description: 'Impossible de procéder à l\'acceptation de l\'invitation'
      })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitation_token: token,
          first_name: data.first_name,
          last_name: data.last_name,
          mobile: data.mobile,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle specific error cases from OpenAPI spec
        if (response.status === 404) {
          throw new Error('Cette invitation n\'existe pas ou a déjà été utilisée')
        } else if (response.status === 400) {
          throw new Error('Données invalides. Veuillez vérifier votre saisie.')
        } else if (response.status === 410) {
          throw new Error('Cette invitation a expiré')
        } else if (response.status === 409) {
          throw new Error('Un compte avec cet email existe déjà')
        }
        throw new Error(result.detail || 'Erreur lors de l\'acceptation de l\'invitation')
      }

      setSuccess(true)
      toast.success('Compte créé avec succès !', {
        description: 'Votre compte a été créé et activé. Vous pouvez maintenant vous connecter.'
      })
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)

    } catch (error) {
      console.error('Invitation acceptance error:', error)
      toast.error('Erreur d\'acceptation', {
        description: error.message || 'Impossible d\'accepter l\'invitation'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 p-4 rounded-full shadow-lg">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Bienvenue !
            </h1>
            <p className="text-gray-600 mt-2 font-medium">Compte créé avec succès</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 font-medium">
                    Votre compte FERDI a été créé avec succès !
                  </p>
                  <p className="text-green-700 text-sm mt-2">
                    Vous pouvez maintenant vous connecter et commencer à utiliser l'application.
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    🔄 Redirection automatique vers la connexion dans 3 secondes...
                  </p>
                </div>

                <Link href="/auth/login">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Se connecter maintenant
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 p-4 rounded-full shadow-lg">
                <Bus className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FERDI
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Accepter l'invitation</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold flex items-center justify-center">
              <UserPlus className="mr-2 h-6 w-6 text-blue-600" />
              Créer votre compte
            </CardTitle>
            <CardDescription className="text-center">
              Complétez vos informations pour rejoindre votre équipe FERDI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!token && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800 text-sm">
                    Token d'invitation manquant ou invalide
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium flex items-center">
                    <User className="mr-1 h-4 w-4" />
                    Prénom
                  </Label>
                  <Input
                    id="first_name"
                    type="text"
                    {...form.register('first_name')}
                    placeholder="Jean"
                    disabled={isLoading || !token}
                    className="h-11 bg-white/50"
                  />
                  {form.formState.errors.first_name && (
                    <p className="text-sm text-red-500">{form.formState.errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium flex items-center">
                    <User className="mr-1 h-4 w-4" />
                    Nom
                  </Label>
                  <Input
                    id="last_name"
                    type="text"
                    {...form.register('last_name')}
                    placeholder="Dupont"
                    disabled={isLoading || !token}
                    className="h-11 bg-white/50"
                  />
                  {form.formState.errors.last_name && (
                    <p className="text-sm text-red-500">{form.formState.errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-sm font-medium flex items-center">
                  <Phone className="mr-1 h-4 w-4" />
                  Téléphone mobile
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  {...form.register('mobile')}
                  placeholder="06 12 34 56 78"
                  disabled={isLoading || !token}
                  className="h-11 bg-white/50"
                />
                {form.formState.errors.mobile && (
                  <p className="text-sm text-red-500">{form.formState.errors.mobile.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center">
                  <Lock className="mr-1 h-4 w-4" />
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...form.register('password')}
                    placeholder="••••••••"
                    disabled={isLoading || !token}
                    className="h-11 bg-white/50 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  8-40 caractères avec au moins 1 minuscule, 1 majuscule et 1 chiffre
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-sm font-medium">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...form.register('confirm_password')}
                    placeholder="••••••••"
                    disabled={isLoading || !token}
                    className="h-11 bg-white/50 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.confirm_password && (
                  <p className="text-sm text-red-500">{form.formState.errors.confirm_password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-200" 
                disabled={isLoading || !token}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Créer mon compte
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-500 hover:underline transition-colors">
                ← Retour à la connexion
              </Link>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                En créant votre compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}