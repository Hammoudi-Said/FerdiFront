'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/lib/stores/auth-store'
import { toast } from 'sonner'
import { Bus, LogIn, Eye, EyeOff, Building2, Users } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, token, updateActivity } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    updateActivity()
    
    if (token) {
      // Redirect to intended page or dashboard
      const intendedPath = sessionStorage.getItem('ferdi_intended_path')
      if (intendedPath) {
        sessionStorage.removeItem('ferdi_intended_path')
        router.push(intendedPath)
      } else {
        router.push('/dashboard')
      }
    }
  }, [token, router, updateActivity])

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password)
    
    if (result.success) {
      toast.success('Connexion réussie !', {
        description: 'Redirection vers votre tableau de bord...'
      })
      
      // Store last successful login
      if (rememberMe) {
        localStorage.setItem('ferdi_last_email', data.email)
      }
      
      // Redirect with animation delay
      setTimeout(() => {
        const intendedPath = sessionStorage.getItem('ferdi_intended_path')
        if (intendedPath) {
          sessionStorage.removeItem('ferdi_intended_path')
          router.push(intendedPath)
        } else {
          router.push('/dashboard')
        }
      }, 500)
    } else {
      toast.error('Erreur de connexion', {
        description: result.error || 'Vérifiez vos identifiants'
      })
    }
  }

  // Load remembered email
  useEffect(() => {
    const lastEmail = localStorage.getItem('ferdi_last_email')
    if (lastEmail && rememberMe) {
      form.setValue('email', lastEmail)
    }
  }, [form, rememberMe])

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
          <p className="text-gray-600 mt-2 font-medium">Gestion de flotte d'autocars</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold">Connexion</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous à votre compte pour accéder au tableau de bord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email professionnel
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="votre@email.fr"
                  disabled={isLoading}
                  className="h-11 bg-white/50"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...form.register('password')}
                    placeholder="••••••••"
                    disabled={isLoading}
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
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Se souvenir de moi
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 px-2 text-gray-500">Nouveau sur FERDI ?</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/auth/register-company">
                  <Button variant="outline" className="w-full h-11 bg-white/50 hover:bg-white/80 border border-gray-200">
                    <Building2 className="mr-2 h-4 w-4" />
                    Créer entreprise
                  </Button>
                </Link>
                
                <Link href="/auth/register-user">
                  <Button variant="outline" className="w-full h-11 bg-white/50 hover:bg-white/80 border border-gray-200">
                    <Users className="mr-2 h-4 w-4" />
                    Rejoindre équipe
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600">
          Besoin d'aide ? Contactez notre{' '}
          <a href="#" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
            support technique
          </a>
        </p>
      </div>
    </div>
  )
}