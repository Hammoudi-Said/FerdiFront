'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ROLE_DEFINITIONS } from '@/lib/constants/enums'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  Shield,
  Clock,
  MapPin,
  Edit3,
  Trash2
} from 'lucide-react'

export function UserDetailsModal({ open, onOpenChange, user, onEdit, onDelete, canManage }) {
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

  const getStatusBadge = (user) => {
    const status = user.status || (user.is_active ? 'ACTIVE' : 'INACTIVE')
    
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-600" />
            <span>Détails de l'utilisateur</span>
          </DialogTitle>
          <DialogDescription>
            Informations complètes sur l'utilisateur sélectionné
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Profile Section */}
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url} alt={getUserDisplayName(user)} />
              <AvatarFallback className="text-lg bg-gray-200 text-gray-700 font-semibold">
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
                {getStatusBadge(user)}
              </div>
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
              
              {user.mobile && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Téléphone</label>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{user.mobile}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Role and Status Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Rôle et permissions</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Rôle</label>
                <div className="p-2 bg-gray-50 rounded">
                  {getRoleBadge(user.role)}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Statut</label>
                <div className="p-2 bg-gray-50 rounded">
                  {getStatusBadge(user)}
                </div>
              </div>
            </div>

            {ROLE_DEFINITIONS[user.role]?.description && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description du rôle</label>
                <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {ROLE_DEFINITIONS[user.role].description}
                </p>
              </div>
            )}
          </div>

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
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(user.created_at)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Dernière connexion</label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(user.last_login_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {canManage && (
            <>
              <Separator />
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false)
                    onEdit && onEdit(user)
                  }}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false)
                    onDelete && onDelete(user)
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}