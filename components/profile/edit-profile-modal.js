'use client'

import { useState, useEffect, useCallback } from 'react'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// 🔧 FIX: Enhanced form schema with better phone validation
const formSchema = z.object({
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  mobile: z.string().optional().refine((val) => {
    if (!val) return true // Optional field
    // French phone number validation (flexible)
    const phoneRegex = /^(?:(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4})$/
    return phoneRegex.test(val.replace(/[\s.-]/g, ''))
  }, {
    message: 'Format de téléphone invalide (ex: 06 12 34 56 78)'
  }),
})

export function EditProfileModal({ open, onOpenChange, profile, onSave }) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      mobile: '',
    },
  })

  // 🔧 FIX: Memoize form reset function to prevent infinite loop dependencies
  const resetFormWithProfile = useCallback((profileData) => {
    if (profileData) {
      form.reset({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        mobile: profileData.mobile || '',
      })
    }
  }, [form.reset]) // Only depend on form.reset, not the whole form object

  // 🔧 FIX: Update form when profile changes - prevent infinite loops
  useEffect(() => {
    if (profile && open) {
      resetFormWithProfile(profile)
    }
  }, [profile, open, resetFormWithProfile])

  // 🔧 FIX: Enhanced submit handler with better error handling
  const onSubmit = async (data) => {
    if (isLoading) return // Prevent double submission
    
    setIsLoading(true)
    try {
      // Validate data before sending
      const validatedData = formSchema.parse(data)
      
      await onSave(validatedData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      
      // Handle validation errors
      if (error.name === 'ZodError') {
        error.errors.forEach(err => {
          form.setError(err.path[0], {
            type: 'manual',
            message: err.message
          })
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 🔧 FIX: Handle modal close properly
  const handleClose = useCallback(() => {
    if (isLoading) return // Don't close while saving
    
    form.clearErrors()
    onOpenChange(false)
  }, [form, isLoading, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
          <DialogDescription>
            Modifiez vos informations personnelles
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Votre prénom" 
                      {...field} 
                      disabled={isLoading}
                      maxLength={50}
                    />
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
                    <Input 
                      placeholder="Votre nom" 
                      {...field} 
                      disabled={isLoading}
                      maxLength={50}
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
                  <FormLabel>Téléphone mobile</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="06 12 34 56 78" 
                      {...field} 
                      disabled={isLoading}
                      type="tel"
                      maxLength={20}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">
                    Format accepté: 06 12 34 56 78 ou +33 6 12 34 56 78
                  </p>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                Enregistrer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}