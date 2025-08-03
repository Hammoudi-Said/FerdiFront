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
import { Bus, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

const resetPasswordSchema = z.object({
  new_password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(40, 'Le mot de passe ne peut pas dépasser 40 caractères'),
  confirm_password: z.string().min(1, 'Confirmation requise'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
})

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState('')
  const [success, setSuccess] = useState(false)

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: '',
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
      toast.error('Token de réinitialisation manquant', {
        description: 'Le lien de réinitialisation est invalide ou expiré'
      })
      router.push('/auth/login')
    }
  }, [searchParams, router])

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Token manquant', {
        description: 'Impossible de procéder à la réinitialisation'
      })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          new_password: data.new_password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || 'Erreur lors de la réinitialisation')
      }

      setSuccess(true)
      toast.success('Mot de passe réinitialisé !', {
        description: 'Votre mot de passe a été modifié avec succès'
      })
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)

    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('Erreur de réinitialisation', {
        description: error.message || 'Impossible de réinitialiser le mot de passe'
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
              Succès !
            </h1>
            <p className="text-gray-600 mt-2 font-medium">Mot de passe réinitialisé</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 font-medium">
                    Votre mot de passe a été réinitialisé avec succès !
                  </p>
                  <p className="text-green-700 text-sm mt-2">
                    Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
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
          <p className="text-gray-600 mt-2 font-medium">Réinitialisation du mot de passe</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold flex items-center justify-center">
              <Lock className="mr-2 h-6 w-6 text-blue-600" />
              Nouveau mot de passe
            </CardTitle>
            <CardDescription className="text-center">
              Choisissez un nouveau mot de passe sécurisé pour votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!token && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800 text-sm">
                    Token de réinitialisation manquant ou invalide
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_password" className="text-sm font-medium">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showPassword ? 'text' : 'password'}
                    {...form.register('new_password')}
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
                {form.formState.errors.new_password && (
                  <p className="text-sm text-red-500">{form.formState.errors.new_password.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Le mot de passe doit contenir entre 8 et 40 caractères
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
                    Réinitialisation...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Réinitialiser le mot de passe
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-500 hover:underline transition-colors">
                ← Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}