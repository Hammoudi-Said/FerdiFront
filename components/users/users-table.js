'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROLE_DEFINITIONS } from '@/lib/stores/auth-store'
import { 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  MoreHorizontal, 
  Eye,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Calendar,
  Activity
} from 'lucide-react'

export function UsersTable({ 
  users, 
  selectedUsers = [], 
  onSelectionChange, 
  onEdit, 
  onDelete, 
  canManage 
}) {
  const [hoveredRow, setHoveredRow] = useState(null)

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
        year: 'numeric'
      })
    } catch (error) {
      console.warn('Invalid date format:', dateString)
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
        {role.label}
      </Badge>
    )
  }

  const getStatusBadge = (user) => {
    const status = user.status || (user.is_active ? 'ACTIVE' : 'INACTIVE')
    
    const statusConfig = {
      ACTIVE: { 
        color: 'bg-green-50 text-green-700 border-green-200', 
        label: 'Actif'
      },
      INACTIVE: { 
        color: 'bg-gray-50 text-gray-700 border-gray-200', 
        label: 'Inactif'
      },
      PENDING: { 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
        label: 'En attente'
      },
      LOCKED: { 
        color: 'bg-red-50 text-red-700 border-red-200', 
        label: 'Verrouillé'
      },
    }
    
    const config = statusConfig[status] || statusConfig.INACTIVE
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getUserDisplayName = (user) => {
    if (user.full_name) return user.full_name

    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    const fullName = `${firstName} ${lastName}`.trim()

    return fullName || user.email || 'Utilisateur inconnu'
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(users.map(u => u.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      onSelectionChange([...selectedUsers, userId])
    } else {
      onSelectionChange(selectedUsers.filter(id => id !== userId))
    }
  }

  const isAllSelected = users.length > 0 && selectedUsers.length === users.length
  const isPartiallySelected = selectedUsers.length > 0 && selectedUsers.length < users.length

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Aucun utilisateur ne correspond à vos critères de recherche. 
          Essayez de modifier les filtres.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-gray-50/80 border-gray-200">
            {canManage && (
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className="border-gray-400"
                  ref={(el) => {
                    if (el) el.indeterminate = isPartiallySelected
                  }}
                />
              </TableHead>
            )}
            <TableHead className="font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Utilisateur</span>
              </div>
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Contact</span>
              </div>
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4" />
                <span>Rôle</span>
              </div>
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Statut</span>
              </div>
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Dernière connexion</span>
              </div>
            </TableHead>
            {canManage && (
              <TableHead className="w-24 font-semibold text-gray-700">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id}
              className={`
                hover:bg-blue-50/50 transition-all duration-200 border-gray-100
                ${selectedUsers.includes(user.id) ? 'bg-blue-50/30 border-blue-200' : ''}
                ${hoveredRow === user.id ? 'shadow-sm' : ''}
              `}
              onMouseEnter={() => setHoveredRow(user.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {canManage && (
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => handleSelectUser(user.id, checked)}
                    className="border-gray-400"
                  />
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10 ring-2 ring-gray-100 ring-offset-1">
                    <AvatarImage src={user.avatar_url} alt={getUserDisplayName(user)} />
                    <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {getInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {getUserDisplayName(user)}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  {user.email && (
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      <Mail className="h-3 w-3 mr-2 flex-shrink-0 text-blue-500" />
                      <span className="truncate font-mono text-xs">{user.email}</span>
                    </div>
                  )}
                  {user.mobile && (
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      <Phone className="h-3 w-3 mr-2 flex-shrink-0 text-green-500" />
                      <span className="font-mono text-xs">{user.mobile}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {getRoleBadge(user.role)}
              </TableCell>
              <TableCell>
                {getStatusBadge(user)}
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600 flex items-center">
                  <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                  {formatDate(user.last_login_at)}
                </div>
              </TableCell>
              {canManage && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onEdit(user)}
                        className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-gray-600 hover:text-gray-700 hover:bg-gray-50">
                        <Eye className="mr-2 h-4 w-4" />
                        Voir le profil
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(user)}
                        className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}