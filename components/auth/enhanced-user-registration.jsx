'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/lib/stores/auth-store'
import { UserRole, ROLE_DEFINITIONS, SUBSCRIPTION_PLAN_DEFINITIONS } from '@/lib/constants/enums'
import { companyAPI } from '@/lib/api-client'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle, Building, Users } from 'lucide-react'

// ✅ SCHEMA CONFORME OPENAPI UserRegister
const userSchema = z.object({
  email: z.string().email('Email invalide'),
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(100),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  mobile: z.string().min(10, 'Le téléphone doit contenir au moins 10 caractères').max(20),
  role: z.enum([UserRole.ADMIN, UserRole.DISPATCH, UserRole.DRIVER, UserRole.INTERNAL_SUPPORT, UserRole.ACCOUNTANT]),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(40),
  confirmPassword: z.string(),
  company_code: z.string()
    .length(13, 'Le code entreprise doit contenir exactement 13 caractères')
    .regex(/^[A-Z]{3}-\d{5}-[A-Z0-9]{3}$/, 'Format du code invalide (XXX-YYYYY-ZZZ)'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export function EnhancedUserRegistration({ onSuccess }) {
  const [companyInfo, setCompanyInfo] = useState(null)
  const [companyValidation, setCompanyValidation] = useState({ loading: false, valid: false, error: null })
  const { registerUser, isLoading } = useAuthStore()

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: UserRole.DRIVER,
    },
  })

  const companyCode = form.watch('company_code')

  // ✅ VALIDATION TEMPS RÉEL DU CODE ENTREPRISE
  useEffect(() => {
    const validateCompanyCode = async () => {
      if (!companyCode || companyCode.length !== 13) {
        setCompanyInfo(null)
        setCompanyValidation({ loading: false, valid: false, error: null })
        return
      }

      if (!/^[A-Z]{3}-\d{5}-[A-Z0-9]{3}$/.test(companyCode)) {
        setCompanyValidation({ loading: false, valid: false, error: 'Format invalide' })
        return
      }

      setCompanyValidation({ loading: true, valid: false, error: null })

      try {
        // Appel API selon OpenAPI spec: GET /api/v1/companies/code/{company_code}
        const response = await companyAPI.getCompanyByCode(companyCode)
        setCompanyInfo(response.data)
        setCompanyValidation({ loading: false, valid: true, error: null })
      } catch (error) {
        const errorMsg = error.response?.status === 404 
          ? 'Code entreprise non trouvé' 
          : 'Erreur de vérification'
        setCompanyValidation({ loading: false, valid: false, error: errorMsg })
        setCompanyInfo(null)
      }
    }

    const delayedValidation = setTimeout(validateCompanyCode, 500)
    return () => clearTimeout(delayedValidation)
  }, [companyCode])

  const onSubmit = async (data) => {
    // ✅ VALIDATION FINALE AVANT SOUMISSION
    if (!companyValidation.valid) {
      toast.error('Veuillez saisir un code entreprise valide')
      return
    }

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
      toast.success('Inscription réussie!')
      onSuccess?.()
    } else {
      toast.error(result.error || 'Erreur lors de l\'inscription')
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Rejoindre une entreprise</CardTitle>
        <CardDescription>
          Inscrivez-vous avec le code fourni par votre entreprise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {/* ✅ VALIDATION AMÉLIORÉE DU CODE ENTREPRISE */}
          <div className="space-y-2">
            <Label htmlFor="company_code">Code de l'entreprise *</Label>
            <div className="relative">
              <Input
                id="company_code"
                {...form.register('company_code')}
                placeholder="ABC-12345-XYZ"
                className="font-mono tracking-wider pr-10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {companyValidation.loading && <LoadingSpinner size="sm" />}
                {!companyValidation.loading && companyValidation.valid && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {!companyValidation.loading && companyValidation.error && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            
            {form.formState.errors.company_code && (
              <p className="text-sm text-red-500">{form.formState.errors.company_code.message}</p>
            )}
            
            {companyValidation.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{companyValidation.error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* ✅ INFORMATIONS ENTREPRISE VALIDÉE */}
          {companyInfo && (
            <Alert>
              <Building className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Entreprise trouvée: {companyInfo.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {companyInfo.city} • {companyInfo.postal_code}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {SUBSCRIPTION_PLAN_DEFINITIONS[companyInfo.subscription_plan]?.label}
                    </Badge>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Max {companyInfo.max_users} utilisateurs
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* ✅ RESTE DU FORMULAIRE SELON OPENAPI */}
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

          {/* ✅ RÔLES SELON OPENAPI AVEC DESCRIPTIONS */}
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
                {Object.entries(ROLE_DEFINITIONS)
                  .filter(([roleId]) => roleId !== UserRole.SUPER_ADMIN) // Pas de super admin
                  .map(([roleId, roleData]) => (
                    <SelectItem key={roleId} value={roleId}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${roleData.color}`}></div>
                        <div>
                          <div className="font-medium">{roleData.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {roleData.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
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
            disabled={isLoading || !companyValidation.valid}
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
  )
}