'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { UsersTable } from '@/components/users/users-table'
import { CreateUserModal } from '@/components/users/create-user-modal'
import { EditUserModal } from '@/components/users/edit-user-modal'
import { DeleteUserDialog } from '@/components/users/delete-user-dialog'
import { BulkActionsModal } from '@/components/users/bulk-actions-modal'
import { usersAPI } from '@/lib/api-client'
import { ROLE_DEFINITIONS, UserRole } from '@/lib/constants/enums'
import {
  Users,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Download,
  Mail,
  Settings,
  Eye,
  Trash2,
  Edit3,
  MoreHorizontal,
  Activity,
  UserPlus,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export default function UsersPage() {
  const { user, hasPermission, updateActivity, getUsers } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    locked: 0,
    byRole: {}
  })

  useEffect(() => {
    updateActivity()
    loadUsers()
  }, [updateActivity])

  const calculateStats = useCallback((usersList) => {
    const total = usersList.length
    const active = usersList.filter(u => u.status === 'ACTIVE' || (u.is_active && !u.status)).length
    const inactive = usersList.filter(u => u.status === 'INACTIVE' || (!u.is_active && !u.status)).length
    const pending = usersList.filter(u => u.status === 'PENDING').length
    const locked = usersList.filter(u => u.status === 'LOCKED').length

    const byRole = {}
    usersList.forEach(u => {
      const roleName = ROLE_DEFINITIONS[u.role]?.name || 'unknown'
      byRole[roleName] = (byRole[roleName] || 0) + 1
    })

    setStats({ total, active, inactive, pending, locked, byRole })
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)

      if (USE_MOCK_DATA) {
        const result = await getUsers()
        if (result.success) {
          setUsers(result.users)
          calculateStats(result.users)
        } else {
          toast.error(result.error)
        }
      } else {
        const response = await usersAPI.getUsers()
        const userData = response.data?.data || response.data || []
        setUsers(userData)
        calculateStats(userData)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const fullName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()

      const matchesSearch = !searchTerm ||
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = filterRole === 'all' || user.role === filterRole

      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && (user.status === 'ACTIVE' || (user.is_active && !user.status))) ||
        (filterStatus === 'inactive' && (user.status === 'INACTIVE' || (!user.is_active && !user.status))) ||
        (filterStatus === 'pending' && user.status === 'PENDING') ||
        (filterStatus === 'locked' && user.status === 'LOCKED')

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, filterRole, filterStatus])

  const handleCreateUser = async (userData) => {
    try {
      if (USE_MOCK_DATA) {
        const newUser = {
          id: `user-${Date.now()}`,
          ...userData,
          full_name: `${userData.first_name} ${userData.last_name}`,
          is_active: true,
          created_at: new Date().toISOString(),
          last_login_at: null
        }
        setUsers(prev => [...prev, newUser])
        calculateStats([...users, newUser])
        toast.success('Utilisateur créé avec succès')
      } else {
        await usersAPI.createUser(userData)
        await loadUsers()
        toast.success('Utilisateur créé avec succès')
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      toast.error('Erreur lors de la création de l\'utilisateur')
      throw error
    }
  }

  const handleEditUser = async (userId, userData) => {
    try {
      if (USE_MOCK_DATA) {
        setUsers(prev => prev.map(u =>
          u.id === userId
            ? { ...u, ...userData, full_name: `${userData.first_name} ${userData.last_name}` }
            : u
        ))
        toast.success('Utilisateur modifié avec succès')
      } else {
        await usersAPI.updateUser(userId, userData)
        await loadUsers()
        toast.success('Utilisateur modifié avec succès')
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      toast.error('Erreur lors de la modification de l\'utilisateur')
      throw error
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      if (USE_MOCK_DATA) {
        const updatedUsers = users.filter(u => u.id !== userId)
        setUsers(updatedUsers)
        calculateStats(updatedUsers)
        toast.success('Utilisateur supprimé avec succès')
      } else {
        await usersAPI.deleteUser(userId)
        await loadUsers()
        toast.success('Utilisateur supprimé avec succès')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Erreur lors de la suppression de l\'utilisateur')
      throw error
    }
  }

  const handleBulkAction = async (action, userIds, reason) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock bulk operations
        toast.success(`Opération ${action} effectuée sur ${userIds.length} utilisateur(s)`)
      } else {
        await usersAPI.bulkUserOperation({
          user_ids: userIds,
          operation: action,
          reason
        })
        await loadUsers()
        toast.success(`Opération ${action} effectuée avec succès`)
      }
      setSelectedUsers([])
    } catch (error) {
      console.error('Failed to perform bulk action:', error)
      toast.error('Erreur lors de l\'opération groupée')
      throw error
    }
  }

  const handleEditClick = (user) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  const handleDeleteClick = (user) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const exportUsers = useCallback(() => {
    try {
      if (filteredUsers.length === 0) {
        toast.warning('Aucune donnée à exporter')
        return
      }

      const csvContent = [
        ['Nom', 'Prénom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date de création'].join(','),
        ...filteredUsers.map(user => [
          (user.last_name || '').replace(/,/g, ';'),
          (user.first_name || '').replace(/,/g, ';'),
          (user.email || '').replace(/,/g, ';'),
          (user.mobile || '').replace(/,/g, ';'),
          (ROLE_DEFINITIONS[user.role]?.label || 'Inconnu').replace(/,/g, ';'),
          user.is_active ? 'Actif' : 'Inactif',
          user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'
        ].join(','))
      ].join('\n')

      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`
      a.style.display = 'none'

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      window.URL.revokeObjectURL(url)

      toast.success('Export CSV réussi')
    } catch (error) {
      console.error('Failed to export CSV:', error)
      toast.error('Erreur lors de l\'export CSV')
    }
  }, [filteredUsers])

  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Clean Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900">
                Gestion des utilisateurs
              </h1>
              <p className="text-sm text-gray-600">
                Gérez les membres de votre équipe et leurs permissions
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setBulkModalOpen(true)}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Actions groupées ({selectedUsers.length})
                </Button>
              )}
              <Button
                variant="outline"
                onClick={exportUsers}
                disabled={filteredUsers.length === 0 || loading}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              {hasPermission('users_manage') && (
                <Button 
                  onClick={() => window.location.href = '/invitations'}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Inviter un utilisateur
                </Button>
              )}
            </div>
          </div>

          {/* Modern Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Total utilisateurs</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      +{stats.byRole.admin || 0} admin(s)
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full opacity-20 -mr-10 -mt-10"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">Utilisateurs actifs</p>
                    <p className="text-3xl font-bold text-green-900">{stats.active}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {Math.round((stats.active / stats.total) * 100) || 0}% du total
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-green-700" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full opacity-20 -mr-10 -mt-10"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 mb-1">En attente</p>
                    <p className="text-3xl font-bold text-orange-900">{stats.pending}</p>
                    <p className="text-xs text-orange-600 mt-1">
                      Validation requise
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-200 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-orange-700" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 rounded-full opacity-20 -mr-10 -mt-10"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Inactifs / Bloqués</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.inactive + stats.locked}</p>
                    <p className="text-xs text-purple-600 mt-1">
                      {stats.locked} bloqué(s)
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center">
                    <UserX className="h-6 w-6 text-purple-700" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full opacity-20 -mr-10 -mt-10"></div>
              </CardContent>
            </Card>
          </div>

          {/* Modern Filters */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg text-gray-800">Recherche et filtres</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par nom ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                >
                  <option value="all">🎭 Tous les rôles</option>
                  {Object.entries(ROLE_DEFINITIONS).map(([roleId, roleData]) => (
                    <option key={roleId} value={roleId}>
                      {roleData.icon} {roleData.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                >
                  <option value="all">📊 Tous les statuts</option>
                  <option value="active">✅ Actifs ({stats.active})</option>
                  <option value="inactive">❌ Inactifs ({stats.inactive})</option>
                  <option value="pending">⏳ En attente ({stats.pending})</option>
                  <option value="locked">🔒 Bloqués ({stats.locked})</option>
                </select>
              </div>

              {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
                <div className="mt-4 flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                  <span className="text-sm text-blue-700 font-medium">
                    🔍 {filteredUsers.length} résultat(s) trouvé(s)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setFilterRole('all')
                      setFilterStatus('all')
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  >
                    <Zap className="mr-1 h-4 w-4" />
                    Réinitialiser
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modern Users Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg text-gray-800">
                    Utilisateurs ({filteredUsers.length})
                  </CardTitle>
                </div>
                {hasPermission('users_manage') && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {selectedUsers.length} sélectionné(s)
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <UsersTable
                  users={filteredUsers}
                  selectedUsers={selectedUsers}
                  onSelectionChange={setSelectedUsers}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  canManage={hasPermission('users_manage')}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <CreateUserModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSave={handleCreateUser}
        />

        {selectedUser && (
          <EditUserModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            user={selectedUser}
            onSave={(data) => handleEditUser(selectedUser.id, data)}
          />
        )}

        {selectedUser && (
          <DeleteUserDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            user={selectedUser}
            onConfirm={() => handleDeleteUser(selectedUser.id)}
          />
        )}

        <BulkActionsModal
          open={bulkModalOpen}
          onOpenChange={setBulkModalOpen}
          selectedUsers={selectedUsers.map(id => users.find(u => u.id === id)).filter(Boolean)}
          onConfirm={handleBulkAction}
        />
      </DashboardLayout>
    </RoleGuard>
  )
}