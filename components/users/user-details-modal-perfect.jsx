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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROLE_DEFINITIONS, UserStatus, STATUS_DEFINITIONS } from '@/lib/constants/enums'
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
  Key,
  X,
  CheckCircle,
  AlertCircle,
  Crown,
  MapPin,
  Building,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

// Enhanced form schema with comprehensive validation
const formSchema = z.object({
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z.string().email('Email invalide').max(255, 'L\'email ne peut pas dépasser 255 caractères'),
  mobile: z.string().regex(/^(\+33|0)[1-9](\d{8})$/, 'Format de téléphone invalide (ex: 06 12 34 56 78)').optional().or(z.literal('')),
  role: z.string().min(1, 'Le rôle est requis'),
  status: z.string().min(1, 'Le statut est requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(40, 'Le mot de passe ne peut pas dépasser 40 caractères').optional().or(z.literal('')),
})

export function UserDetailsPerfectModal({ open, onOpenChange, user, onSave, onDelete, canManage }) {
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

  // 🎯 PERMISSIONS FERDI CORRECTES - Seuls ADMIN et SUPER_ADMIN peuvent éditer
  const isDeleted = user?.status === 'DELETED'
  const canEdit = !isDeleted && (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN')
  const canDelete = !isDeleted && (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN')

  // Update form when user changes
  useEffect(() => {
    if (user) {
      const status = user.status || (user.is_active ? UserStatus.ACTIVE : UserStatus.INACTIVE)
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

  const formatPhoneNumber = (phone) => {
    if (!phone) return null
    // Format French phone number
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return cleaned.replace(/(.{2})(.{2})(.{2})(.{2})(.{2})/, '$1 $2 $3 $4 $5')
    }
    return phone
  }

  const getRoleBadge = (roleId) => {
    const role = ROLE_DEFINITIONS[roleId]
    if (!role) return <Badge variant="secondary" className="text-gray-600">Inconnu</Badge>

    const colorMap = {
      SUPER_ADMIN: 'bg-red-500 text-white border border-red-100 shadow-sm',
      ADMIN: 'bg-purple-500 text-white border border-purple-100 shadow-sm',
      DISPATCH: 'bg-blue-500 text-white border border-blue-100 shadow-sm',
      DRIVER: 'bg-green-500 text-white border border-green-100 shadow-sm',
      INTERNAL_SUPPORT: 'bg-orange-500 text-white border border-orange-100 shadow-sm',
      ACCOUNTANT: 'bg-teal-500 text-white border border-teal-100 shadow-sm'
    }

    const IconComponent = roleId === 'SUPER_ADMIN' ? Crown : Shield

    return (
      <Badge className={`${colorMap[roleId] || 'bg-gray-100 text-gray-700'} font-semibold px-3 py-1 text-sm`}>
        <IconComponent className="mr-2 h-4 w-4" />
        {role.label}
      </Badge>
    )
  }

  const getStatusBadge = (userStatus) => {
    const status = userStatus || (user.is_active ? UserStatus.ACTIVE : UserStatus.INACTIVE)
    const statusDef = STATUS_DEFINITIONS[status]

    if (!statusDef) {
      return <Badge variant="secondary" className="text-gray-600">Inconnu</Badge>
    }

    const statusConfig = {
      ACTIVE: {
        icon: CheckCircle,
        class: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md'
      },
      INACTIVE: {
        icon: X,
        class: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-md'
      },
      PENDING: {
        icon: Clock,
        class: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-md'
      },
      LOCKED: {
        icon: AlertCircle,
        class: 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-md'
      }
    }

    const config = statusConfig[status] || statusConfig.INACTIVE
    const StatusIcon = config.icon

    return (
      <Badge className={`${config.class} font-semibold px-3 py-1 text-sm`}>
        <StatusIcon className="mr-2 h-4 w-4" />
        {statusDef.label}
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

      // Clean mobile field
      if (submitData.mobile && submitData.mobile.trim() === '') {
        delete submitData.mobile
      }

      await onSave(submitData)
      setIsEditing(false)
      setIsChangingPassword(false)
      toast.success('Utilisateur modifié avec succès')
    } catch (error) {
      console.error('Error updating user:', error)
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la modification'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    onOpenChange(false)
    onDelete && onDelete(user)
  }

  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing - reset form
      const status = user.status || (user.is_active ? UserStatus.ACTIVE : UserStatus.INACTIVE)
      form.reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        role: user.role || '',
        status: status,
        password: '',
      })
      setIsChangingPassword(false)
    }
    setIsEditing(!isEditing)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b border-gray-100 pb-6">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500 rounded-lg shadow-sm border border-blue-100">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Profil utilisateur</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isDeleted ? 'Utilisateur supprimé - Consultation uniquement' : 'Informations détaillées et gestion'}
                </p>
              </div>
            </div>
            {canEdit && (
              <div className="flex items-center space-x-3">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleEditMode}
                    className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleEditMode}
                    className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                )}
              </div>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isDeleted
              ? 'Cet utilisateur a été supprimé. Aucune modification n\'est possible.'
              : isEditing
                ? 'Modifiez les informations de l\'utilisateur ci-dessous'
                : 'Consultez les informations détaillées de l\'utilisateur'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-6">

            {/* 🎨 HEADER UTILISATEUR AVEC DESIGN MODERNE */}
            <div className="relative">
              <div className={`absolute inset-0 ${isDeleted ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} rounded-2xl transform rotate-1`}></div>
              <Card className="relative bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
                <div className={`${isDeleted ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} px-8 py-6`}>
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      <Avatar className={`h-24 w-24 border-4 border-white shadow-lg ${isDeleted ? 'grayscale' : ''}`}>
                        <AvatarImage src={user.avatar_url} alt={getUserDisplayName(user)} />
                        <AvatarFallback className="text-2xl bg-white text-blue-600 font-bold">
                          {getInitials(user.first_name, user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 text-white">
                      <h3 className="text-3xl font-bold mb-2">
                        {getUserDisplayName(user)}
                        {isDeleted && <span className="text-xl ml-3 opacity-75">(Supprimé)</span>}
                      </h3>
                      <p className="text-blue-100 mb-4 flex items-center text-lg">
                        <Mail className="h-5 w-5 mr-3" />
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-4">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status || (user.is_active ? UserStatus.ACTIVE : UserStatus.INACTIVE))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 🏗️ INFORMATIONS PRINCIPALES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* INFORMATIONS PERSONNELLES */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-4">
                  <CardTitle className="flex items-center space-x-3 text-gray-800">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold">Informations personnelles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Prénom</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Prénom"
                              {...field}
                              disabled={!isEditing || !canEdit}
                              className={`transition-all duration-200 ${(!isEditing || !canEdit) ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200'} rounded-lg h-12`}
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
                          <FormLabel className="text-gray-700 font-medium">Nom de famille</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nom de famille"
                              {...field}
                              disabled={!isEditing || !canEdit}
                              className={`transition-all duration-200 ${(!isEditing || !canEdit) ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200'} rounded-lg h-12`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Adresse email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              {...field}
                              disabled={!isEditing || !canEdit}
                              className={`transition-all duration-200 ${(!isEditing || !canEdit) ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200'} rounded-lg h-12`}
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
                          <FormLabel className="text-gray-700 font-medium">Téléphone mobile</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="06 12 34 56 78"
                              {...field}
                              disabled={!isEditing || !canEdit}
                              className={`transition-all duration-200 ${(!isEditing || !canEdit) ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200'} rounded-lg h-12`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* RÔLES ET SÉCURITÉ */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-4">
                  <CardTitle className="flex items-center space-x-3 text-gray-800">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold">Rôle et sécurité</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Rôle</FormLabel>
                        {isEditing && canEdit ? (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:border-blue-500">
                                <SelectValue placeholder="Sélectionnez un rôle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(ROLE_DEFINITIONS).map(([roleId, roleData]) => (
                                <SelectItem key={roleId} value={roleId}>
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${roleData.color}`}></div>
                                    <span>{roleData.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            {getRoleBadge(field.value)}
                          </div>
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
                        <FormLabel className="text-gray-700 font-medium">Statut</FormLabel>
                        {isEditing && canEdit ? (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:border-blue-500">
                                <SelectValue placeholder="Sélectionnez un statut" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(STATUS_DEFINITIONS).map(([statusId, statusData]) => (
                                <SelectItem key={statusId} value={statusId}>
                                  <div className="flex items-center space-x-3">
                                    <span>{statusData.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            {getStatusBadge(field.value)}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Changement de mot de passe */}
                  {isEditing && canEdit && (
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={isChangingPassword}
                          onCheckedChange={setIsChangingPassword}
                          className="data-[state=checked]:bg-blue-600"
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
                              <FormLabel className="text-gray-700 font-medium">Nouveau mot de passe</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Nouveau mot de passe (8-40 caractères)..."
                                    {...field}
                                    className="h-12 rounded-lg border-gray-300 focus:border-blue-500 pr-12"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
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
                              <p className="text-xs text-gray-500">
                                Le mot de passe doit contenir entre 8 et 40 caractères
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 📊 INFORMATIONS D'ACTIVITÉ */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-4">
                <CardTitle className="flex items-center space-x-3 text-gray-800">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold">Activité et historique</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Date de création</label>
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">{formatDate(user.created_at)}</span>
                        <p className="text-xs text-gray-600">Membre depuis</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Dernière connexion</label>
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">{formatDate(user.last_login_at)}</span>
                        <p className="text-xs text-gray-600">Dernière activité</p>
                      </div>
                    </div>
                  </div>
                </div>

                {user.mobile && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Phone className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Téléphone</span>
                        <p className="text-base font-semibold text-gray-900">{formatPhoneNumber(user.mobile)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 🎯 BOUTONS D'ACTION */}
            <Separator className="bg-gray-200" />
            <div className="flex justify-between items-center pt-4">
              <div>
                {canDelete && onDelete && currentUser?.id !== user?.id && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 shadow-sm h-12 px-6"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer l'utilisateur
                  </Button>
                )}
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm h-12 px-8"
                >
                  Fermer
                </Button>
                {isEditing && (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 px-8 shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer
                      </>
                    )}
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
