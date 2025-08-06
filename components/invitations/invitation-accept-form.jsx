'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { invitationsAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Mail,
  Phone,
  Lock
} from 'lucide-react'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export function InvitationAcceptForm({ token, onSuccess, onError }) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      mobile: '',
      password: '',
      confirmPassword: ''
    }
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)

    try {
      // Remove confirmPassword from data
      const { confirmPassword, ...submitData } = data
      
      const payload = {
        invitation_token: token,
        ...submitData
      }

      if (USE_MOCK_DATA) {
        // Mock invitation acceptance
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Mock success response
        const mockResponse = {
          id: `user-${Date.now()}`,
          email: 'invitation@example.com',
          first_name: data.first_name,
          last_name: data.last_name,
          full_name: `${data.first_name} ${data.last_name}`,
          mobile: data.mobile,
          role: 'driver',
          status: 'active',
          is_active: true,
          created_at: new Date().toISOString()
        }
        
        setSuccess(true)
        onSuccess?.(mockResponse)
      } else {
        const response = await invitationsAPI.acceptInvitation(payload)
        setSuccess(true)
        onSuccess?.(response.data)
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      
      let errorMessage = 'Erreur lors de l\'acceptation de l\'invitation'
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.message) {
        errorMessage = error.message
      }
      
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-900">Compte créé avec succès!</CardTitle>
          <CardDescription>
            Votre compte a été créé. Vous pouvez maintenant vous connecter avec vos identifiants.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={() => window.location.href = '/auth/login'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Se connecter
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
          <UserPlus className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>Accepter l'invitation</CardTitle>
        <CardDescription>
          Complétez vos informations pour créer votre compte
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom *</Label>
              <Input
                id="first_name"
                {...register('first_name', {
                  required: 'Le prénom est requis',
                  maxLength: { value: 100, message: 'Maximum 100 caractères' }
                })}
                disabled={loading}
                placeholder="Jean"
              />
              {errors.first_name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.first_name.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom *</Label>
              <Input
                id="last_name"
                {...register('last_name', {
                  required: 'Le nom est requis',
                  maxLength: { value: 100, message: 'Maximum 100 caractères' }
                })}
                disabled={loading}
                placeholder="Dupont"
              />
              {errors.last_name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <Label htmlFor="mobile">
              <Phone className="inline h-4 w-4 mr-1" />
              Téléphone mobile *
            </Label>
            <Input
              id="mobile"
              type="tel"
              {...register('mobile', {
                required: 'Le numéro de téléphone est requis',
                maxLength: { value: 20, message: 'Maximum 20 caractères' }
              })}
              disabled={loading}
              placeholder="06 12 34 56 78"
            />
            {errors.mobile && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.mobile.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              <Lock className="inline h-4 w-4 mr-1" />
              Mot de passe *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Le mot de passe est requis',
                  minLength: { value: 8, message: 'Minimum 8 caractères' },
                  maxLength: { value: 40, message: 'Maximum 40 caractères' }
                })}
                disabled={loading}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', {
                required: 'La confirmation du mot de passe est requise',
                validate: value => value === password || 'Les mots de passe ne correspondent pas'
              })}
              disabled={loading}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Une fois votre compte créé, vous recevrez un email de confirmation et pourrez vous connecter immédiatement.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
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
      </CardContent>
    </Card>
  )
}