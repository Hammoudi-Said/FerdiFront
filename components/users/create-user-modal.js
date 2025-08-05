'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/lib/stores/auth-store'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ROLE_DEFINITIONS } from '@/lib/stores/auth-store'

const formSchema = z.object({
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  mobile: z.string().optional(),
  role: z.string().min(1, 'Le rôle est requis'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
})

export function CreateUserModal({ open, onOpenChange, onSave }) {
  const [isLoading, setIsLoading] = useState(false)
  const { user, hasPermission } = useAuthStore()

  // Only admins and super admins can create users
  if (!hasPermission('users_manage')) {
    return null
  }

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      role: '',
      password: '',
    },
  })

  // Filter roles based on current user's permissions
  const getAvailableRoles = () => {
    const allRoles = Object.entries(ROLE_DEFINITIONS)
    
    // Super admin (role 1) can create any role
    if (user?.role === '1') {
      return allRoles
    }
    
    // Admin (role 2) can create roles 2-6 (cannot create super admin)
    if (user?.role === '2') {
      return allRoles.filter(([roleId]) => roleId !== '1')
    }
    
    // No other role can create users
    return []
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSave(data)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau membre à votre équipe
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" {...field} />
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
                      <Input placeholder="Nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="nom@entreprise.com" {...field} />
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
                  <FormLabel>Téléphone mobile (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="06 12 34 56 78" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ROLE_DEFINITIONS).map(([roleId, roleData]) => (
                        <SelectItem key={roleId} value={roleId}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${roleData.color}`}></div>
                            <span>{roleData.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe temporaire</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mot de passe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note :</strong> L'utilisateur devra changer son mot de passe lors de sa première connexion.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                Créer l'utilisateur
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}