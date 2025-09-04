'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ROLE_DEFINITIONS } from '@/lib/stores/auth-store'
import { Edit3, Trash2, Mail, Phone } from 'lucide-react'

export function UsersTable({ users, onEdit, onDelete, canManage }) {
  // 🔧 FIX: Safe helper function to get user initials
  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || ''
    const last = lastName?.charAt(0)?.toUpperCase() || ''
    return first + last || '?'
  }

  // 🔧 FIX: Enhanced date formatting with error handling
  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais'

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Date invalide'

      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      console.warn('Invalid date format:', dateString)
      return 'Date invalide'
    }
  }

  const getRoleBadge = (roleId) => {
    const role = ROLE_DEFINITIONS[roleId]
    if (!role) return <Badge variant="secondary">Inconnu</Badge>

    return (
      <Badge className={`${role.textColor} ${role.bgColor} hover:${role.bgColor}`}>
        {role.label}
      </Badge>
    )
  }



  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Actif' },
      INACTIVE: { color: 'bg-gray-100 text-gray-800', label: 'Inactif' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente d\'activation' },
      LOCKED: { color: 'bg-red-100 text-red-800', label: 'Verrouillé' },
    }
    const config = statusConfig[status] || statusConfig.INACTIVE
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  // 🔧 FIX: Safe helper function to get user display name
  const getUserDisplayName = (user) => {
    if (user.full_name) return user.full_name

    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    const fullName = `${firstName} ${lastName}`.trim()

    return fullName || user.email || 'Utilisateur inconnu'
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-5.055A2.25 2.25 0 0021 15V6.75A2.25 2.25 0 0018.75 4.5h-2.25A2.25 2.25 0 0014.25 6.75V15A2.25 2.25 0 0016.5 17.25h2.25A2.25 2.25 0 0021 15V6.75z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
        <p className="text-gray-500">Aucun utilisateur ne correspond à vos critères de recherche.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière connexion</TableHead>
            {canManage && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} alt={getUserDisplayName(user)} />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                      {getInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">
                      {getUserDisplayName(user)}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {user.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                  {user.mobile && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>{user.mobile}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {getRoleBadge(user.role)}
              </TableCell>
              <TableCell>
                {getStatusBadge(user.status)}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDate(user.last_login_at)}
              </TableCell>
              {canManage && (
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                      title="Modifier l'utilisateur"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(user)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Supprimer l'utilisateur"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
