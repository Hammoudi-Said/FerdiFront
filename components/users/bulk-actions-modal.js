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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Settings, 
  UserCheck, 
  UserX, 
  Lock, 
  Unlock,
  AlertTriangle,
  Users
} from 'lucide-react'

const formSchema = z.object({
  operation: z.string().min(1, 'Veuillez sélectionner une opération'),
  reason: z.string().min(10, 'La raison doit contenir au moins 10 caractères'),
})

const BULK_OPERATIONS = {
  activate: {
    label: 'Activer les comptes',
    description: 'Active les comptes utilisateurs sélectionnés',
    icon: UserCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  deactivate: {
    label: 'Désactiver les comptes',
    description: 'Désactive les comptes utilisateurs sélectionnés',
    icon: UserX,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  lock: {
    label: 'Verrouiller les comptes',
    description: 'Verrouille temporairement les comptes utilisateurs',
    icon: Lock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  unlock: {
    label: 'Déverrouiller les comptes',
    description: 'Déverrouille les comptes utilisateurs',
    icon: Unlock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
}

export function BulkActionsModal({ open, onOpenChange, selectedUsers, onConfirm }) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operation: '',
      reason: '',
    },
  })

  const selectedOperation = form.watch('operation')
  const operationConfig = BULK_OPERATIONS[selectedOperation]

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onConfirm(data.operation, selectedUsers.map(u => u.id), data.reason)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error performing bulk action:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || ''
    const last = lastName?.charAt(0)?.toUpperCase() || ''
    return first + last || '?'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Actions groupées</span>
          </DialogTitle>
          <DialogDescription>
            Effectuer une action sur {selectedUsers.length} utilisateur(s) sélectionné(s)
          </DialogDescription>
        </DialogHeader>

        {/* Selected Users Preview */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Utilisateurs sélectionnés ({selectedUsers.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {selectedUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-2 bg-white p-2 rounded-md border">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                    {getInitials(user.first_name, user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">
                  {user.full_name || `${user.first_name} ${user.last_name}`}
                </span>
                <Badge variant="outline" className="text-xs">
                  {user.status || (user.is_active ? 'ACTIVE' : 'INACTIVE')}
                </Badge>
              </div>
            ))}
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="operation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action à effectuer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(BULK_OPERATIONS).map(([key, config]) => {
                        const Icon = config.icon
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center space-x-2">
                              <Icon className={`h-4 w-4 ${config.color}`} />
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {operationConfig && (
              <div className={`p-4 rounded-lg border ${operationConfig.bgColor} ${operationConfig.borderColor}`}>
                <div className="flex items-start space-x-3">
                  <operationConfig.icon className={`h-5 w-5 ${operationConfig.color} flex-shrink-0`} />
                  <div>
                    <h4 className={`font-medium ${operationConfig.color}`}>
                      {operationConfig.label}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {operationConfig.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison de l'action *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Expliquez pourquoi vous effectuez cette action..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800">Attention</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Cette action sera appliquée à tous les utilisateurs sélectionnés.
                    Assurez-vous que c'est bien ce que vous souhaitez faire.
                  </p>
                </div>
              </div>
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
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                Confirmer l'action
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}