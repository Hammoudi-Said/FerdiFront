'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/lib/stores/auth-store'
import { toast } from 'sonner'
import { Bus, ArrowLeft, CheckCircle } from 'lucide-react'

const userSchema = z.object({
  email: z.string().email('Email invalide'),
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(100),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  mobile: z.string().min(10, 'Le téléphone doit contenir au moins 10 caractères').max(20),
  role: z.enum(['2', '3', '4']),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(40),
  confirmPassword: z.string(),
  company_code: z.string()
    .length(13, 'Le code entreprise doit contenir exactement 13 caractères')
    .regex(/^[A-Z]{3}-\d{5}-[A-Z0-9]{3}$/, 'Format du code invalide (XXX-YYYYY-ZZZ)'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export default function RegisterUserPage() {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const { registerUser, isLoading } = useAuthStore()
  
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: '4', // Default to CHAUFFEUR
    },
  })

  const onSubmit = async (data) => {
    const userData = {
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      mobile: data.mobile,
      role: data.role,
      password: data.password,
      company_code: data.company_code,
    }

    const result = await registerUser(userData)
    
    if (result.success) {
      setSuccess(true)
      toast.success('Inscription réussie!')
    } else {
      toast.error(result.error || 'Erreur lors de l\'inscription')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">Inscription réussie!</CardTitle>
            <CardDescription>
              Votre compte a été créé avec succès
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                Vous pouvez maintenant vous connecter avec vos identifiants
              </p>
            </div>
            
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              Aller à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Rejoindre une entreprise</CardTitle>
            <CardDescription>
              Inscrivez-vous avec le code fourni par votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_code">Code de l'entreprise *</Label>
                <Input
                  id="company_code"
                  {...form.register('company_code')}
                  placeholder="ABC-12345-XYZ"
                  className="font-mono tracking-wider"
                />
                <p className="text-xs text-muted-foreground">
                  Format: 3 lettres - 5 chiffres - 3 caractères
                </p>
                {form.formState.errors.company_code && (
                  <p className="text-sm text-red-500">{form.formState.errors.company_code.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom *</Label>
                  <Input
                    id="first_name"
                    {...form.register('first_name')}
                    placeholder="Jean"
                  />
                  {form.formState.errors.first_name && (
                    <p className="text-sm text-red-500">{form.formState.errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom *</Label>
                  <Input
                    id="last_name"
                    {...form.register('last_name')}
                    placeholder="Dupont"
                  />
                  {form.formState.errors.last_name && (
                    <p className="text-sm text-red-500">{form.formState.errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="jean.dupont@example.fr"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Téléphone *</Label>
                  <Input
                    id="mobile"
                    {...form.register('mobile')}
                    placeholder="0123456789"
                  />
                  {form.formState.errors.mobile && (
                    <p className="text-sm text-red-500">{form.formState.errors.mobile.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle *</Label>
                <Select
                  value={form.watch('role')}
                  onValueChange={(value) => form.setValue('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir votre rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Administrateur</SelectItem>
                    <SelectItem value="3">Autocariste / Dispatcher</SelectItem>
                    <SelectItem value="4">Chauffeur</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-sm text-red-500">{form.formState.errors.role.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register('password')}
                    placeholder="••••••••"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...form.register('confirmPassword')}
                    placeholder="••••••••"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Inscription en cours...
                  </>
                ) : (
                  'S\'inscrire'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}