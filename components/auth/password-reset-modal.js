'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

const emailSchema = z.object({
  email: z.string().email('Email invalide'),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  new_password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(40, 'Le mot de passe ne peut pas dépasser 40 caractères'),
  confirm_password: z.string().min(1, 'Confirmation requise'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
})

export function PasswordResetModal({ open, onOpenChange }) {
  const [step, setStep] = useState('email') // 'email', 'success', 'reset'
  const [isLoading, setIsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  })

  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: '',
      new_password: '',
      confirm_password: '',
    },
  })

  const handleClose = () => {
    setStep('email')
    emailForm.reset()
    resetForm.reset()
    setUserEmail('')
    onOpenChange(false)
  }

  const onEmailSubmit = async (data) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/password-recovery/${encodeURIComponent(data.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || 'Erreur lors de l\'envoi du mail')
      }

      setUserEmail(data.email)
      setStep('success')
      toast.success('Email envoyé !', {
        description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe'
      })

    } catch (error) {
      console.error('Password recovery error:', error)
      toast.error('Erreur', {
        description: error.message || 'Impossible d\'envoyer l\'email de récupération'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onResetSubmit = async (data) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: data.token,
          new_password: data.new_password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || 'Erreur lors de la réinitialisation')
      }

      toast.success('Mot de passe réinitialisé !', {
        description: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe'
      })

      handleClose()

    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('Erreur', {
        description: error.message || 'Impossible de réinitialiser le mot de passe'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'email' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-blue-600" />
                Mot de passe oublié
              </DialogTitle>
              <DialogDescription>
                Saisissez votre adresse email pour recevoir un lien de réinitialisation
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Adresse email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  {...emailForm.register('email')}
                  placeholder="votre@email.fr"
                  disabled={isLoading}
                  className="bg-white/50"
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Envoi...
                    </>
                  ) : (
                    'Envoyer le lien'
                  )}
                </Button>
              </div>
            </form>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-green-600">
                <CheckCircle className="mr-2 h-5 w-5" />
                Email envoyé
              </DialogTitle>
              <DialogDescription>
                Un email de réinitialisation a été envoyé à{' '}
                <span className="font-medium">{userEmail}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  📧 Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
                  Le lien vous mènera à une page dédiée pour saisir votre nouveau mot de passe.
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  N'oubliez pas de regarder dans vos spams !
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleClose}>
                  Fermer
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'reset' && (
          <>
            <DialogHeader>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2 p-1"
                  onClick={() => setStep('success')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle>Nouveau mot de passe</DialogTitle>
                  <DialogDescription>
                    Saisissez le token reçu par email et votre nouveau mot de passe
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Token de réinitialisation</Label>
                <Input
                  id="token"
                  type="text"
                  {...resetForm.register('token')}
                  placeholder="Token reçu par email"
                  disabled={isLoading}
                  className="bg-white/50 font-mono text-sm"
                />
                {resetForm.formState.errors.token && (
                  <p className="text-sm text-red-500">{resetForm.formState.errors.token.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  {...resetForm.register('new_password')}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="bg-white/50"
                />
                {resetForm.formState.errors.new_password && (
                  <p className="text-sm text-red-500">{resetForm.formState.errors.new_password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  {...resetForm.register('confirm_password')}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="bg-white/50"
                />
                {resetForm.formState.errors.confirm_password && (
                  <p className="text-sm text-red-500">{resetForm.formState.errors.confirm_password.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('success')}
                  disabled={isLoading}
                >
                  Retour
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Réinitialisation...
                    </>
                  ) : (
                    'Réinitialiser'
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
