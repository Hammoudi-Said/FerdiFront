'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore, ROLE_DEFINITIONS } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function UsersPage() {
  const { user, hasPermission, getUsers, updateActivity } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    updateActivity()
    
    // Check if user has permission to view users
    if (!hasPermission('users_view') && !hasPermission('users_manage')) {
      toast.error('Accès refusé', {
        description: 'Vous n\'avez pas les permissions pour voir cette page'
      })
      return
    }

    loadUsers()
  }, [hasPermission, updateActivity])

  const loadUsers = async () => {
    setLoading(true)
    const result = await getUsers()
    
    if (result.success) {
      setUsers(result.users)
    } else {
      toast.error('Erreur', {
        description: result.error
      })
    }
    setLoading(false)
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || u.role === filterRole
    
    return matchesSearch && matchesRole
  })

  const getStatusBadge = (userStatus, isActive) => {
    if (!isActive) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Inactif</Badge>
    }
    
    switch(userStatus) {
      case '1':
        return <Badge variant="secondary" className="bg-green-100 text-green-600">Actif</Badge>
      case '2':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-600">En attente</Badge>
      case '3':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-600">Suspendu</Badge>
      case '4':
        return <Badge variant="secondary" className="bg-red-100 text-red-600">Bloqué</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'Jamais'
    return new Date(lastLogin).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUserStats = () => {
    const stats = {
      total: users.length,
      active: users.filter(u => u.is_active && u.status === '1').length,
      inactive: users.filter(u => !u.is_active || u.status !== '1').length,
      byRole: {}
    }

    // Count by role
    Object.keys(ROLE_DEFINITIONS).forEach(roleId => {
      stats.byRole[roleId] = users.filter(u => u.role === roleId).length
    })

    return stats
  }

  const stats = getUserStats()

  if (!hasPermission('users_view') && !hasPermission('users_manage')) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à cette section.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
            <p className="text-gray-600">Gérez les membres de votre équipe</p>
          </div>
          
          {hasPermission('users_manage') && (
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => updateActivity()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un utilisateur
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-800">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-800">Actifs</p>
                  <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <UserX className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-800">Inactifs</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-800">Admins</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {(stats.byRole['1'] || 0) + (stats.byRole['2'] || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Tous les rôles</option>
                {Object.entries(ROLE_DEFINITIONS).map(([roleId, roleData]) => (
                  <option key={roleId} value={roleId}>
                    {roleData.label} ({stats.byRole[roleId] || 0})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Liste des membres de votre équipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((u) => {
                  const roleData = ROLE_DEFINITIONS[u.role]
                  
                  return (
                    <Card key={u.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Avatar */}
                          <div className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold',
                            roleData?.color || 'bg-gray-500'
                          )}>
                            {`${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase()}
                          </div>
                          
                          {/* User Info */}
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold">{u.full_name}</h3>
                              {getStatusBadge(u.status, u.is_active)}
                              {roleData && (
                                <Badge 
                                  variant="secondary" 
                                  className={cn(
                                    'text-xs',
                                    roleData.textColor,
                                    roleData.bgColor
                                  )}
                                >
                                  {roleData.label}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {u.email}
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {u.mobile}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatLastLogin(u.last_login_at)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        {hasPermission('users_manage') && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => updateActivity()}>
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateActivity()}>
                                {u.is_active ? 'Désactiver' : 'Activer'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => updateActivity()}
                              >
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}