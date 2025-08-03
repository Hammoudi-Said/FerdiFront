'use client'

import { useState } from 'react'
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
import pl from 'zod/v4/locales/pl.cjs'

const companySchema = z.object({
  // Company info
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères').max(255),
  siret: z.string().regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères').max(500),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères').max(100),
  postal_code: z.string().min(4, 'Le code postal doit contenir au moins 4 caractères').max(10),
  country: z.string().default('France'),
  phone: z.string().min(10, 'Le téléphone doit contenir au moins 10 caractères').max(20),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  subscription_plan: z.enum(['FREETRIAL', 'ESSENTIAL', 'STANDARD', 'PREMIUM']),

  // Manager info
  manager_firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(100),
  manager_lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  manager_email: z.string().email('Email invalide'),
  manager_phone: z.string().min(10, 'Le téléphone doit contenir au moins 10 caractères').max(20),
  manager_password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(40),
  confirmPassword: z.string(),
}).refine((data) => data.manager_password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export function CompanyRegistrationForm({ onSuccess }) {
  const [step, setStep] = useState(1)
  const [companyCode, setCompanyCode] = useState('')
  const { registerCompany, isLoading } = useAuthStore()

  const form = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      country: 'France',
      subscription_plan: 'ESSENTIAL',
      email: '',
      website: '',
    },
  })

  const onSubmit = async (data) => {
    const payload = {
      company: {
        name: data.name,
        siret: data.siret,
        address: data.address,
        city: data.city,
        postal_code: data.postal_code,
        country: data.country,
        phone: data.phone,
        email: data.email || null,
        website: data.website || null,
        subscription_plan: data.subscription_plan,
      },
      manager_email: data.manager_email,
      manager_password: data.manager_password,
      manager_first_name: data.manager_firstName,
      manager_last_name: data.manager_lastName,
      manager_phone: data.manager_phone,
    }

    const result = await registerCompany(payload)

    if (result.success) {
      setCompanyCode(result.companyCode)
      setStep(2)
      toast.success('Entreprise enregistrée avec succès!')
    } else {
      toast.error(result.error || 'Erreur lors de l\'enregistrement')
    }
  }

  if (step === 2) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">Enregistrement réussi!</CardTitle>
          <CardDescription>
            Votre entreprise a été créée avec succès
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold mb-2">Code de votre entreprise:</h3>
            <div className="text-2xl font-mono font-bold text-green-700 bg-white p-3 rounded border-2 border-green-300">
              {companyCode}
            </div>
            <p className="text-sm text-green-600 mt-2">
              Communiquez ce code à vos collaborateurs pour qu'ils puissent s'inscrire
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Prochaines étapes:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Notez bien ce code entreprise</li>
              <li>Partagez-le avec vos collaborateurs</li>
              <li>Ils pourront s'inscrire avec ce code</li>
              <li>Connectez-vous maintenant avec vos identifiants</li>
            </ul>
          </div>

          <Button
            onClick={() => onSuccess?.()}
            className="w-full"
          >
            Continuer vers la connexion
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Enregistrement d'entreprise</CardTitle>
        <CardDescription>
          Créez votre compte entreprise et votre profil gestionnaire
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations de l'entreprise</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Transport Dupont"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="siret">SIRET *</Label>
                <Input
                  id="siret"
                  {...form.register('siret')}
                  placeholder="12345678901234"
                  maxLength={14}
                />
                {form.formState.errors.siret && (
                  <p className="text-sm text-red-500">{form.formState.errors.siret.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                {...form.register('address')}
                placeholder="123 Rue des Transports"
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  {...form.register('city')}
                  placeholder="Paris"
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-red-500">{form.formState.errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Code postal *</Label>
                <Input
                  id="postal_code"
                  {...form.register('postal_code')}
                  placeholder="75001"
                />
                {form.formState.errors.postal_code && (
                  <p className="text-sm text-red-500">{form.formState.errors.postal_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  {...form.register('country')}
                  placeholder="France"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  {...form.register('phone')}
                  placeholder="0123456789"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (optionnel)</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="contact@transport-dupont.fr"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Site web (optionnel)</Label>
                <Input
                  id="website"
                  {...form.register('website')}
                  placeholder="https://www.transport-dupont.fr"
                />
                {form.formState.errors.website && (
                  <p className="text-sm text-red-500">{form.formState.errors.website.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription_plan">Plan d'abonnement *</Label>
                <Select
                  value={form.watch('subscription_plan')}
                  onValueChange={(value) => form.setValue('subscription_plan', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREETRIAL">FREETRIAL - Jusqu'à 5 véhicules</SelectItem>
                    <SelectItem value="ESSENTIAL">ESSENTIAL - Jusqu'à 20 véhicules</SelectItem>
                    <SelectItem value="STANDARD">STANDARD - Jusqu'à 50 véhicules</SelectItem>
                    <SelectItem value="PREMIUM">PREMIUM - Illimité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Manager Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations du gestionnaire</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager_firstName">Prénom *</Label>
                <Input
                  id="manager_firstName"
                  {...form.register('manager_firstName')}
                  placeholder="Jean"
                />
                {form.formState.errors.manager_firstName && (
                  <p className="text-sm text-red-500">{form.formState.errors.manager_firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager_lastName">Nom *</Label>
                <Input
                  id="manager_lastName"
                  {...form.register('manager_lastName')}
                  placeholder="Dupont"
                />
                {form.formState.errors.manager_lastName && (
                  <p className="text-sm text-red-500">{form.formState.errors.manager_lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager_email">Email *</Label>
                <Input
                  id="manager_email"
                  type="email"
                  {...form.register('manager_email')}
                  placeholder="jean.dupont@transport-dupont.fr"
                />
                {form.formState.errors.manager_email && (
                  <p className="text-sm text-red-500">{form.formState.errors.manager_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager_phone">Téléphone *</Label>
                <Input
                  id="manager_phone"
                  {...form.register('manager_phone')}
                  placeholder="0123456789"
                />
                {form.formState.errors.manager_phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.manager_phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager_password">Mot de passe *</Label>
                <Input
                  id="manager_password"
                  type="password"
                  {...form.register('manager_password')}
                  placeholder="••••••••"
                />
                {form.formState.errors.manager_password && (
                  <p className="text-sm text-red-500">{form.formState.errors.manager_password.message}</p>
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
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Enregistrement en cours...
              </>
            ) : (
              'Créer l\'entreprise'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
