'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { invitationsAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ROLE_DEFINITIONS } from '@/lib/constants/enums'
import { 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Mail,
  Phone,
  Lock,
  Shield,
  Clock
} from 'lucide-react'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export function InvitationAcceptForm({ token, onSuccess, onError }) {
  const [loading, setLoading] = useState(false)
  const [loadingInvitation, setLoadingInvitation] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [invitation, setInvitation] = useState(null)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  // Load invitation details when component mounts
  useEffect(() => {
    const loadInvitationDetails = async () => {
      try {
        setLoadingInvitation(true)
        
        if (USE_MOCK_DATA) {
          // Mock invitation data
          const mockInvitation = {
            id: 'inv-mock',
            email: 'nouveau.employe@transport-bretagne.fr',
            role: 'DRIVER',
            first_name: 'Nouveau',
            last_name: 'Employé',
            mobile: '',
            personal_message: 'Bienvenue dans notre équipe de chauffeurs !',
            company_name: 'Transport Bretagne SARL',
            invited_by: {
              full_name: 'Administrateur Demo',
              email: 'admin@transport-bretagne.fr'
            },
            expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          }
          
          // Simulate loading delay
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          setInvitation(mockInvitation)
          
          // Pre-fill form with invitation data
          if (mockInvitation.first_name) setValue('first_name', mockInvitation.first_name)
          if (mockInvitation.last_name) setValue('last_name', mockInvitation.last_name)
          if (mockInvitation.mobile) setValue('mobile', mockInvitation.mobile)
          
        } else {
          const response = await invitationsAPI.getInvitationByToken(token)
          const invitationData = response.data
          
          setInvitation(invitationData)
          
          // Pre-fill form with invitation data
          if (invitationData.first_name) setValue('first_name', invitationData.first_name)
          if (invitationData.last_name) setValue('last_name', invitationData.last_name)
          if (invitationData.mobile) setValue('mobile', invitationData.mobile)
        }
      } catch (error) {
        console.error('Error loading invitation:', error)
        onError?.('Invitation non trouvée, expirée ou invalide')
      } finally {
        setLoadingInvitation(false)
      }
    }

    if (token) {
      loadInvitationDetails()
    }
  }, [token, setValue, onError])

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
          email: invitation.email,
          first_name: data.first_name,
          last_name: data.last_name,
          full_name: `${data.first_name} ${data.last_name}`,
          mobile: data.mobile,
          role: invitation.role,
          status: 'ACTIVE',
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

  // Show loading state while fetching invitation details
  if (loadingInvitation) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Chargement des détails de l'invitation...</p>
        </CardContent>
      </Card>
    )
  }

  // Show error if invitation not found
  if (!invitation) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">Invitation non trouvée</CardTitle>
          <CardDescription>
            Cette invitation n'existe pas, a expiré ou a déjà été utilisée.
          </CardDescription>
        </CardHeader>
      </Card>
    )
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
            Votre compte a été créé avec le rôle <strong>{ROLE_DEFINITIONS[invitation.role]?.label}</strong>. 
            Vous pouvez maintenant vous connecter avec vos identifiants.
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

  const roleInfo = ROLE_DEFINITIONS[invitation.role]
  const isExpired = new Date(invitation.expires_at) < new Date()

  if (isExpired) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <Clock className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">Invitation expirée</CardTitle>
          <CardDescription>
            Cette invitation a expiré. Contactez votre administrateur pour recevoir une nouvelle invitation.
          </CardDescription>
        </CardHeader>
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
          Vous avez été invité à rejoindre <strong>{invitation.company_name}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Invitation Details */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Email:</span>
            <span className="text-sm text-gray-900">{invitation.email}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Rôle assigné:</span>
            <Badge className={`${roleInfo?.bgColor} ${roleInfo?.textColor} ${roleInfo?.borderColor} border`}>
              <Shield className="w-3 h-3 mr-1" />
              {roleInfo?.label || invitation.role}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Invité par:</span>
            <span className="text-sm text-gray-900">{invitation.invited_by?.full_name}</span>
          </div>
          
          {invitation.personal_message && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">
                "{invitation.personal_message}"
              </p>
            </div>
          )}
        </div>

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
                pattern: {
                  value: /^(?:(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4})$/,
                  message: 'Format invalide (ex: 06 12 34 56 78)'
                }
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
                  maxLength: { value: 40, message: 'Maximum 40 caractères' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Doit contenir au moins 1 minuscule, 1 majuscule et 1 chiffre'
                  }
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

          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Rôle assigné: {roleInfo?.label}</strong><br />
              {roleInfo?.description}. Ce rôle a été défini par votre administrateur et ne peut pas être modifié.
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
                Créer mon compte avec le rôle {roleInfo?.label}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}