'use client'

import React, { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ROLE_DEFINITIONS, UserStatus } from '@/lib/constants/enums'
import { useAuthStore } from '@/lib/stores/auth-store'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  Shield,
  Clock,
  Edit3,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Key
} from 'lucide-react'
import { toast } from 'sonner'

// Enhanced form schema with more fields for ADMIN
const formSchema = z.object({
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide').optional(),
  mobile: z.string().optional(),
  role: z.string().min(1, 'Le rôle est requis'),
  status: z.string().min(1, 'Le statut est requis'),
  password: z.string().optional(),
})

export function UserEditDetailsModal({ open, onOpenChange, user, onSave, onDelete, canManage }) {
  const { user: currentUser, hasPermission } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      role: '',
      status: '',
      password: '',
    },
  })

  // Enhanced permissions for ADMIN
  const canEditEmail = hasPermission('users_manage') || currentUser?.role === 'SUPER_ADMIN'
  const canEditRole = hasPermission('users_manage') || currentUser?.role === 'SUPER_ADMIN'
  const canEditStatus = hasPermission('users_manage') || currentUser?.role === 'SUPER_ADMIN'
  const canChangePassword = hasPermission('users_manage') || currentUser?.role === 'SUPER_ADMIN'

  // Update form when user changes
  useEffect(() => {
    if (user) {
      const status = user.status || (user.is_active ? 'ACTIVE' : 'INACTIVE')
      form.reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        role: user.role || '',
        status: status,
        password: '',
      })
      setIsEditing(false)
      setIsChangingPassword(false)
    }
  }, [user, form])

  if (!user) return null

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || ''
    const last = lastName?.charAt(0)?.toUpperCase() || ''
    return first + last || '?'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Date invalide'
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Date invalide'
    }
  }

  const getRoleBadge = (roleId) => {
    const role = ROLE_DEFINITIONS[roleId]
    if (!role) return <Badge variant="secondary" className="text-gray-600">Inconnu</Badge>

    const colorMap = {
      SUPER_ADMIN: 'bg-red-50 text-red-700 border-red-200',
      ADMIN: 'bg-purple-50 text-purple-700 border-purple-200', 
      DISPATCH: 'bg-blue-50 text-blue-700 border-blue-200',
      DRIVER: 'bg-green-50 text-green-700 border-green-200',
      INTERNAL_SUPPORT: 'bg-orange-50 text-orange-700 border-orange-200',
      ACCOUNTANT: 'bg-teal-50 text-teal-700 border-teal-200'
    }

    return (
      <Badge className={`${colorMap[roleId] || 'bg-gray-50 text-gray-700 border-gray-200'} font-medium border`}>
        <Shield className="mr-1 h-3 w-3" />
        {role.label}
      </Badge>
    )
  }

  const getStatusBadge = (userStatus) => {
    const status = userStatus || (user.is_active ? 'ACTIVE' : 'INACTIVE')
    
    const statusConfig = {
      ACTIVE: { 
        color: 'bg-green-50 text-green-700 border-green-200', 
        label: 'Actif',
        icon: Activity
      },
      INACTIVE: { 
        color: 'bg-gray-50 text-gray-700 border-gray-200', 
        label: 'Inactif',
        icon: Activity
      },
      PENDING: { 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
        label: 'En attente',
        icon: Clock
      },
      LOCKED: { 
        color: 'bg-red-50 text-red-700 border-red-200', 
        label: 'Verrouillé',
        icon: Activity
      },
    }
    
    const config = statusConfig[status] || statusConfig.INACTIVE
    const StatusIcon = config.icon
    
    return (
      <Badge className={`${config.color} font-medium border`}>
        <StatusIcon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getUserDisplayName = (user) => {
    if (user.full_name) return user.full_name
    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || user.email || 'Utilisateur inconnu'
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Transform data for API - remove empty password if not changing
      const submitData = { ...data }
      if (!isChangingPassword || !submitData.password) {
        delete submitData.password
      }
      
      await onSave(submitData)
      setIsEditing(false)
      setIsChangingPassword(false)
      toast.success('Utilisateur modifié avec succès')
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Erreur lors de la modification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    onOpenChange(false)
    onDelete && onDelete(user)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-600" />
              <span>Profil utilisateur</span>
            </div>
            {canManage && (
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setIsChangingPassword(false)
                      form.reset()
                    }}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    Annuler
                  </Button>
                )}
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifiez les informations de l\'utilisateur' : 'Consultez et modifiez les informations de l\'utilisateur'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* User Profile Section */}
            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <Avatar className="h-16 w-16 ring-2 ring-blue-200">
                <AvatarImage src={user.avatar_url} alt={getUserDisplayName(user)} />
                <AvatarFallback className="text-lg bg-blue-100 text-blue-700 font-semibold">
                  {getInitials(user.first_name, user.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {getUserDisplayName(user)}
                </h3>
                <p className="text-gray-600 mt-1">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status || (user.is_active ? 'ACTIVE' : 'INACTIVE'))}
                </div>
              </div>
            </div>

            <Separator />
            
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Informations personnelles</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Prénom" 
                          {...field} 
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
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
                          placeholder="Nom" 
                          {...field} 
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Informations de contact</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="email@example.com" 
                          {...field} 
                          disabled={!isEditing || !canEditEmail}
                          className={(!isEditing || !canEditEmail) ? 'bg-gray-50' : ''}
                        />
                      </FormControl>
                      {!canEditEmail && (
                        <p className="text-xs text-gray-500">Modification restreinte</p>
                      )}
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
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Role and Status */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Rôle et permissions</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      {isEditing && canEditRole ? (
                        <Select onValueChange={field.onChange} value={field.value}>
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
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          {getRoleBadge(field.value)}
                        </div>
                      )}
                      {!canEditRole && isEditing && (
                        <p className="text-xs text-gray-500">Modification restreinte</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      {isEditing && canEditStatus ? (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Actif</SelectItem>
                            <SelectItem value="INACTIVE">Inactif</SelectItem>
                            <SelectItem value="PENDING">En attente</SelectItem>
                            <SelectItem value="LOCKED">Verrouillé</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          {getStatusBadge(field.value)}
                        </div>
                      )}
                      {!canEditStatus && isEditing && (
                        <p className="text-xs text-gray-500">Modification restreinte</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {ROLE_DEFINITIONS[user.role]?.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description du rôle</label>
                  <p className="text-sm text-gray-600 p-3 bg-blue-50 border border-blue-200 rounded">
                    {ROLE_DEFINITIONS[user.role].description}
                  </p>
                </div>
              )}
            </div>

            {/* Password Section - Only for editing */}
            {isEditing && canChangePassword && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>Sécurité</span>
                  </h4>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isChangingPassword}
                      onCheckedChange={setIsChangingPassword}
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Changer le mot de passe
                    </label>
                  </div>
                  
                  {isChangingPassword && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nouveau mot de passe</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Nouveau mot de passe..."
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* Activity Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Activité</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date de création</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded border">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDate(user.created_at)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Dernière connexion</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded border">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDate(user.last_login_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <Separator />
            <div className="flex justify-between items-center pt-2">
              <div>
                {canManage && onDelete && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer l'utilisateur
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Fermer
                </Button>
                {isEditing && (
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}