'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { CompanyCodeValidator } from './company-code-validator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { UserRole, ROLE_DEFINITIONS } from '@/lib/constants/enums'
import { Building, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

const signupSchema = z.object({
  company_code: z.string().min(3, 'Code entreprise requis'),
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  mobile: z.string().optional(),
  role: z.string().min(1, 'Le rôle est requis'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

/**
 * 📝 ENHANCED SIGNUP FORM - Inscription avec validation temps réel
 */
export function EnhancedSignupForm() {
  const router = useRouter()
  const { registerUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [companyCode, setCompanyCode] = useState('')
  const [isCompanyValid, setIsCompanyValid] = useState(false)
  const [companyInfo, setCompanyInfo] = useState(null)

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      company_code: '',
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      role: '',
      password: '',
      confirmPassword: ''
    }
  })

  const handleCompanyValidation = (isValid, company) => {
    setIsCompanyValid(isValid)
    setCompanyInfo(company)
    
    if (isValid && company) {
      form.setValue('company_code', companyCode)
    }
  }

  const onSubmit = async (values) => {
    if (!isCompanyValid) {
      toast.error('Code entreprise invalide')
      return
    }

    setIsLoading(true)

    try {
      const userData = {
        ...values,
        company_code: companyCode,
        full_name: `${values.first_name} ${values.last_name}`
      }

      const result = await registerUser(userData)
      
      if (result.success) {
        toast.success('Inscription réussie !', {
          description: 'Votre compte a été créé avec succès'
        })
        router.push('/auth/login?registered=true')
      } else {
        toast.error('Erreur lors de l\'inscription', {
          description: result.error || 'Une erreur est survenue'
        })
      }
    } catch (error) {
      console.error('Erreur inscription:', error)
      toast.error('Erreur lors de l\'inscription', {
        description: 'Une erreur inattendue est survenue'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Rôles disponibles pour l'inscription (pas de SUPER_ADMIN)
  const availableRoles = Object.entries(ROLE_DEFINITIONS)
    .filter(([key]) => key !== UserRole.SUPER_ADMIN)
    .map(([key, definition]) => ({ value: key, label: definition.label, priority: definition.priority }))
    .sort((a, b) => a.priority - b.priority)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Rejoindre votre équipe</CardTitle>
          <CardDescription>
            Créez votre compte pour accéder au système FERDI de votre entreprise
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Code entreprise avec validation temps réel */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Building className="mr-2 h-4 w-4" />
                  Code entreprise
                </label>
                <CompanyCodeValidator
                  value={companyCode}
                  onChange={setCompanyCode}
                  onValidation={handleCompanyValidation}
                  placeholder="Entrez le code fourni par votre administrateur"
                  required
                />
              </div>

              {/* Informations personnelles */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Prénom
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Jean" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Dupont" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Email professionnel
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="jean.dupont@entreprise.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        Téléphone (optionnel)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="06 12 34 56 78" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Rôle */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle dans l'entreprise</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center space-x-2">
                              <span>{role.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mots de passe */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Lock className="mr-2 h-4 w-4" />
                        Mot de passe
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !isCompanyValid}
              >
                {isLoading && <LoadingSpinner className="mr-2" />}
                Créer mon compte
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}