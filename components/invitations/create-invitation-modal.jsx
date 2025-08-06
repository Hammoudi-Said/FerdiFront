'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/lib/stores/auth-store'
import { invitationsAPI } from '@/lib/api-client'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ROLE_DEFINITIONS } from '@/lib/stores/auth-store'
import { Mail, UserPlus, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export function CreateInvitationModal({ open, onOpenChange, onInvitationCreated }) {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors: formErrors }
  } = useForm({
    defaultValues: {
      email: '',
      role: 'driver',
      first_name: '',
      last_name: '',
      mobile: '',
      personal_message: ''
    }
  })

  const watchedRole = watch('role')

  // Filter available roles based on current user's role
  const getAvailableRoles = () => {
    if (user?.role === '1') {
      // Super admin can invite anyone
      return Object.entries(ROLE_DEFINITIONS)
    } else if (user?.role === '2') {
      // Admin cannot create super_admin
      return Object.entries(ROLE_DEFINITIONS).filter(([roleId]) => roleId !== '1')
    }
    return []
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setErrors({})

    try {
      if (USE_MOCK_DATA) {
        // Mock invitation creation
        const mockInvitation = {
          id: `inv-${Date.now()}`,
          email: data.email,
          role: data.role,
          first_name: data.first_name,
          last_name: data.last_name,
          mobile: data.mobile,
          personal_message: data.personal_message,
          is_active: true,
          accepted: false,
          accepted_at: null,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          invited_by: {
            id: user.id,
            full_name: user.full_name,
            email: user.email
          }
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        toast.success(`Invitation envoyée à ${data.email}`)
        reset()
        onInvitationCreated?.(mockInvitation)
        onOpenChange(false)
      } else {
        const response = await invitationsAPI.createInvitation(data)
        toast.success(`Invitation envoyée à ${data.email}`)
        reset()
        onInvitationCreated?.(response.data)
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error creating invitation:', error)
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'object') {
          setErrors(error.response.data.detail)
        } else {
          toast.error(error.response.data.detail)
        }
      } else {
        toast.error('Erreur lors de l\'envoi de l\'invitation')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Inviter un nouvel utilisateur
          </DialogTitle>
          <DialogDescription>
            Envoyer une invitation par email pour créer un compte utilisateur dans votre entreprise.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="inline h-4 w-4 mr-1" />
              Adresse email *
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email', {
                required: 'L\'adresse email est requise',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Adresse email invalide'
                }
              })}
              disabled={loading}
              placeholder="utilisateur@exemple.com"
            />
            {formErrors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {formErrors.email.message}
              </p>
            )}
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label>Rôle *</Label>
            <Select value={watchedRole} onValueChange={(value) => setValue('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableRoles().map(([roleId, roleData]) => (
                  <SelectItem key={roleId} value={roleId}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${roleData.color}`} />
                      <span>{roleData.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.role && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {formErrors.role.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                {...register('first_name', {
                  maxLength: { value: 100, message: 'Maximum 100 caractères' }
                })}
                disabled={loading}
                placeholder="Jean"
              />
              {formErrors.first_name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.first_name.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                {...register('last_name', {
                  maxLength: { value: 100, message: 'Maximum 100 caractères' }
                })}
                disabled={loading}
                placeholder="Dupont"
              />
              {formErrors.last_name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <Label htmlFor="mobile">Téléphone mobile</Label>
            <Input
              id="mobile"
              type="tel"
              {...register('mobile', {
                maxLength: { value: 20, message: 'Maximum 20 caractères' }
              })}
              disabled={loading}
              placeholder="06 12 34 56 78"
            />
            {formErrors.mobile && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {formErrors.mobile.message}
              </p>
            )}
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="personal_message">Message personnel (optionnel)</Label>
            <Textarea
              id="personal_message"
              {...register('personal_message', {
                maxLength: { value: 500, message: 'Maximum 500 caractères' }
              })}
              disabled={loading}
              placeholder="Message d'accueil personnalisé pour cet utilisateur..."
              rows={3}
            />
            {formErrors.personal_message && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {formErrors.personal_message.message}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Information</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Un email d'invitation sera envoyé à cette adresse avec un lien pour créer le compte. 
                  L'invitation expire dans 7 jours.
                </p>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Envoyer l'invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}