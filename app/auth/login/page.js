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
import { Bus, Shield } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, token } = useAuthStore()
  
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (token) {
      router.push('/dashboard')
    }
  }, [token, router])

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password)
    
    if (result.success) {
      toast.success('Connexion réussie!')
      router.push('/dashboard')
    } else {
      toast.error(result.error || 'Erreur de connexion')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Bus className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FERDI</h1>
          <p className="text-gray-600 mt-2">Gestion de flotte d'autocars</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous à votre compte pour accéder au tableau de bord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="votre@email.fr"
                  disabled={isLoading}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register('password')}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link href="/auth/register-company">
                  <Button variant="outline" className="w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    Créer une entreprise
                  </Button>
                </Link>
                
                <Link href="/auth/register-user">
                  <Button variant="outline" className="w-full">
                    Rejoindre une entreprise
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600">
          Besoin d'aide? Contactez notre{' '}
          <a href="#" className="text-primary hover:underline">
            support technique
          </a>
        </p>
      </div>
    </div>
  )
}