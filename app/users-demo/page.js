'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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
import { UserEditDetailsModal } from '@/components/users/user-edit-details-modal'
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
  Zap,
  ArrowLeft,
  Home
} from 'lucide-react'
import { toast } from 'sonner'

// Mock data for demonstration
const DEMO_USERS = [
  {
    id: 'user-admin-001',
    email: 'manager@transport-bretagne.fr',
    first_name: 'Jean',
    last_name: 'Dupont',
    full_name: 'Jean Dupont',
    mobile: '0612345678',
    role: UserRole.ADMIN,
    status: 'ACTIVE',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    last_login_at: '2024-12-15T09:30:00Z',
  },
  {
    id: 'user-dispatch-001',
    email: 'marie.martin@transport-bretagne.fr',
    first_name: 'Marie',
    last_name: 'Martin',
    full_name: 'Marie Martin',
    mobile: '0687654321',
    role: UserRole.DISPATCH,
    status: 'ACTIVE',
    is_active: true,
    created_at: '2024-01-20T14:30:00Z',
    last_login_at: '2024-12-14T16:45:00Z',
  },
  {
    id: 'user-driver-001',
    email: 'pierre.durand@transport-bretagne.fr',
    first_name: 'Pierre',
    last_name: 'Durand',
    full_name: 'Pierre Durand',
    mobile: '0698765432',
    role: UserRole.DRIVER,
    status: 'ACTIVE',
    is_active: true,
    created_at: '2024-02-01T08:15:00Z',
    last_login_at: '2024-12-13T07:20:00Z',
  },
  {
    id: 'user-driver-002',
    email: 'sophie.bernard@transport-bretagne.fr',
    first_name: 'Sophie',
    last_name: 'Bernard',
    full_name: 'Sophie Bernard',
    mobile: '0612987654',
    role: UserRole.DRIVER,
    status: 'PENDING',
    is_active: false,
    created_at: '2024-11-15T12:00:00Z',
    last_login_at: null,
  },
  {
    id: 'user-support-001',
    email: 'support@transport-bretagne.fr',
    first_name: 'Lucas',
    last_name: 'Moreau',
    full_name: 'Lucas Moreau',
    mobile: '0687123456',
    role: UserRole.INTERNAL_SUPPORT,
    status: 'ACTIVE',
    is_active: true,
    created_at: '2024-03-10T11:20:00Z',
    last_login_at: '2024-12-12T13:10:00Z',
  },
  {
    id: 'user-accountant-001',
    email: 'comptabilite@transport-bretagne.fr',
    first_name: 'Catherine',
    last_name: 'Petit',
    full_name: 'Catherine Petit',
    mobile: '0698458789',
    role: UserRole.ACCOUNTANT,
    status: 'LOCKED',
    is_active: false,
    created_at: '2024-01-25T16:45:00Z',
    last_login_at: '2024-11-20T10:30:00Z',
  }
]

export default function UsersDemoPage() {
  const [users, setUsers] = useState(DEMO_USERS)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [editDetailsModalOpen, setEditDetailsModalOpen] = useState(false)
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
    calculateStats(users)
  }, [users])

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
      const newUser = {
        id: `user-${Date.now()}`,
        ...userData,
        full_name: `${userData.first_name} ${userData.last_name}`,
        is_active: true,
        created_at: new Date().toISOString(),
        last_login_at: null
      }
      setUsers(prev => [...prev, newUser])
      toast.success('Utilisateur créé avec succès')
    } catch (error) {
      console.error('Failed to create user:', error)
      toast.error('Erreur lors de la création de l\'utilisateur')
      throw error
    }
  }

  const handleEditUser = async (userId, userData) => {
    try {
      setUsers(prev => prev.map(u =>
        u.id === userId
          ? { ...u, ...userData, full_name: `${userData.first_name} ${userData.last_name}` }
          : u
      ))
      toast.success('Utilisateur modifié avec succès')
    } catch (error) {
      console.error('Failed to update user:', error)
      toast.error('Erreur lors de la modification de l\'utilisateur')
      throw error
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const updatedUsers = users.filter(u => u.id !== userId)
      setUsers(updatedUsers)
      toast.success('Utilisateur supprimé avec succès')
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Erreur lors de la suppression de l\'utilisateur')
      throw error
    }
  }

  const handleBulkAction = async (action, userIds, reason) => {
    try {
      toast.success(`Opération ${action} effectuée sur ${userIds.length} utilisateur(s)`)
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

  const handleViewClick = (user) => {
    setSelectedUser(user)
    setEditDetailsModalOpen(true)
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
      a.download = `utilisateurs_demo_${new Date().toISOString().split('T')[0]}.csv`
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
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-lg font-medium text-gray-900">FERDI - Page Utilisateurs (Mode Démo)</h1>
              <p className="text-sm text-gray-600">Interface modernisée pour la gestion des utilisateurs</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            <Home className="mr-2 h-4 w-4" />
            Accueil
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Clean Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-1">
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
                size="sm"
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
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV ({filteredUsers.length})
            </Button>
            <Button
              onClick={() => window.location.href = '/invitations'}
              className="bg-gray-900 hover:bg-gray-800 text-white"
              size="sm"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Inviter un utilisateur
            </Button>
            <Button
              onClick={() => setCreateModalOpen(true)}
              variant="outline"
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </div>
        </div>

        {/* Clean Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total utilisateurs</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactifs / Bloqués</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.inactive + stats.locked}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
                  <UserX className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clean Filters */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-base font-medium text-gray-900">Recherche et filtres</CardTitle>
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
                    className="pl-10 border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                  />
                </div>
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-gray-900 focus:ring-gray-900 bg-white text-gray-700"
              >
                <option value="all">Tous les rôles</option>
                {Object.entries(ROLE_DEFINITIONS).map(([roleId, roleData]) => (
                  <option key={roleId} value={roleId}>
                    {roleData.label}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-gray-900 focus:ring-gray-900 bg-white text-gray-700"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs ({stats.active})</option>
                <option value="inactive">Inactifs ({stats.inactive})</option>
                <option value="pending">En attente ({stats.pending})</option>
                <option value="locked">Bloqués ({stats.locked})</option>
              </select>
            </div>

            {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
              <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <span className="text-sm text-gray-700">
                  {filteredUsers.length} résultat(s) trouvé(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setFilterRole('all')
                    setFilterStatus('all')
                  }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  Réinitialiser
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clean Users Table */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <CardTitle className="text-base font-medium text-gray-900">
                  Utilisateurs ({filteredUsers.length})
                </CardTitle>
              </div>
              {selectedUsers.length > 0 && (
                <Badge variant="outline" className="text-gray-700 border-gray-300">
                  {selectedUsers.length} sélectionné(s)
                </Badge>
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
                onView={handleViewClick}
                canManage={true}
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

      {selectedUser && (
        <UserDetailsModal
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          user={selectedUser}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          canManage={true}
        />
      )}
    </div>
  )
}