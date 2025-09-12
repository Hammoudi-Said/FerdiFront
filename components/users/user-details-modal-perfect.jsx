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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
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
  Info,
  Settings,
  History,
  MapPin,
  Building,
  Crown
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
  const [activeTab, setActiveTab] = useState('overview')

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

  // Enhanced permissions for different actions
  const canEditProfile = hasPermission('users_manage') || currentUser?.role === 'SUPER_ADMIN' || currentUser?.id === user?.id
  const canEditEmail = hasPermission('users_manage') || currentUser?.role === 'SUPER_ADMIN'
  const canEditRole = hasPermission('users_manage') || currentUser?.role === 'SUPER_ADMIN'
  const canEditStatus = hasPermission('users_manage') || currentUser?.role === 'SUPER_ADMIN'
  const canChangePassword = hasPermission('users_manage') || currentUser?.role === 'SUPER_ADMIN'
  const canDeleteUser = hasPermission('users_manage') || currentUser?.role === 'SUPER_ADMIN'

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
      setActiveTab('overview')
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
      SUPER_ADMIN: 'bg-red-50 text-red-700 border-red-200',
      ADMIN: 'bg-purple-50 text-purple-700 border-purple-200', 
      DISPATCH: 'bg-blue-50 text-blue-700 border-blue-200',
      DRIVER: 'bg-green-50 text-green-700 border-green-200',
      INTERNAL_SUPPORT: 'bg-orange-50 text-orange-700 border-orange-200',
      ACCOUNTANT: 'bg-teal-50 text-teal-700 border-teal-200'
    }

    const IconComponent = roleId === 'SUPER_ADMIN' ? Crown : Shield

    return (
      <Badge className={`${colorMap[roleId] || 'bg-gray-50 text-gray-700 border-gray-200'} font-medium border`}>
        <IconComponent className="mr-1 h-3 w-3" />
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

    const statusIcons = {
      ACTIVE: CheckCircle,
      INACTIVE: X,
      PENDING: Clock,
      LOCKED: AlertCircle,
    }
    
    const StatusIcon = statusIcons[status] || Activity
    
    return (
      <Badge className={`${statusDef.bgColor} ${statusDef.textColor} ${statusDef.borderColor} font-medium border`}>
        <StatusIcon className="mr-1 h-3 w-3" />
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
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-semibold">Profil utilisateur</span>
            </div>
            {canEditProfile && (
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleEditMode}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleEditMode}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                )}
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifiez les informations de l\'utilisateur' : 'Consultez les informations détaillées de l\'utilisateur'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* User Profile Header */}
            <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-20 w-20 ring-4 ring-blue-200 shadow-lg">
                    <AvatarImage src={user.avatar_url} alt={getUserDisplayName(user)} />
                    <AvatarFallback className="text-xl bg-blue-100 text-blue-700 font-bold">
                      {getInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {getUserDisplayName(user)}
                    </h3>
                    <p className="text-gray-600 mb-3 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-3">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status || (user.is_active ? UserStatus.ACTIVE : UserStatus.INACTIVE))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for different sections */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <Info className="h-4 w-4" />
                  <span>Vue d'ensemble</span>
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Détails</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Sécurité</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Activité</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Quick Info Cards */}
                  <Card className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{user.email}</p>
                        {user.mobile && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Phone className="h-3 w-3 mr-2" />
                            {formatPhoneNumber(user.mobile)}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Rôle & Permissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {getRoleBadge(user.role)}
                        {ROLE_DEFINITIONS[user.role]?.description && (
                          <p className="text-xs text-gray-600 mt-2">
                            {ROLE_DEFINITIONS[user.role].description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        Statut & Activité
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {getStatusBadge(user.status || (user.is_active ? UserStatus.ACTIVE : UserStatus.INACTIVE))}
                        <p className="text-xs text-gray-600 mt-2">
                          Dernière connexion: {formatDate(user.last_login_at)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                {/* Personal Information */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Informations personnelles</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                                disabled={!isEditing || !canEditProfile}
                                className={(!isEditing || !canEditProfile) ? 'bg-gray-50' : ''}
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
                                disabled={!isEditing || !canEditProfile}
                                className={(!isEditing || !canEditProfile) ? 'bg-gray-50' : ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>Informations de contact</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                            {!canEditEmail && isEditing && (
                              <p className="text-xs text-gray-500">Modification restreinte aux administrateurs</p>
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
                                disabled={!isEditing || !canEditProfile}
                                className={(!isEditing || !canEditProfile) ? 'bg-gray-50' : ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                {/* Role and Status */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Rôle et permissions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                              <div className="p-3 bg-gray-50 rounded border">
                                {getRoleBadge(field.value)}
                              </div>
                            )}
                            {!canEditRole && isEditing && (
                              <p className="text-xs text-gray-500">Modification restreinte aux administrateurs</p>
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
                                  {Object.entries(STATUS_DEFINITIONS).map(([statusId, statusData]) => (
                                    <SelectItem key={statusId} value={statusId}>
                                      <div className="flex items-center space-x-2">
                                        <span>{statusData.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="p-3 bg-gray-50 rounded border">
                                {getStatusBadge(field.value)}
                              </div>
                            )}
                            {!canEditStatus && isEditing && (
                              <p className="text-xs text-gray-500">Modification restreinte aux administrateurs</p>
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
                  </CardContent>
                </Card>

                {/* Password Section - Only for editing */}
                {isEditing && canChangePassword && (
                  <Card className="border border-red-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-red-700">
                        <Key className="h-5 w-5" />
                        <span>Gestion du mot de passe</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                    placeholder="Nouveau mot de passe (8-40 caractères)..."
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
                              <p className="text-xs text-gray-500">
                                Le mot de passe doit contenir entre 8 et 40 caractères
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <History className="h-5 w-5" />
                      <span>Historique d'activité</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Date de création</label>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded border">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-sm font-medium">{formatDate(user.created_at)}</span>
                            <p className="text-xs text-gray-500">Membre depuis</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Dernière connexion</label>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded border">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-sm font-medium">{formatDate(user.last_login_at)}</span>
                            <p className="text-xs text-gray-500">Dernière activité</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <Separator />
            <div className="flex justify-between items-center pt-4">
              <div>
                {canDeleteUser && onDelete && (
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
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  Fermer
                </Button>
                {isEditing && (
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
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