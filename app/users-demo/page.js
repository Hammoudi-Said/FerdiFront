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
    id: 'user-dispatcher-001',
    email: 'marie.martin@transport-bretagne.fr',
    first_name: 'Marie',
    last_name: 'Martin',
    full_name: 'Marie Martin',
    mobile: '0687654321',
    role: UserRole.DISPATCH,
    status: 'ACTIVE',
    is_active: true,
    created_at: '2024-01-20T14:00:00Z',
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
    created_at: '2024-02-01T08:00:00Z',
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
    created_at: '2024-11-01T10:00:00Z',
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
    created_at: '2024-03-15T12:00:00Z',
    last_login_at: '2024-12-12T11:30:00Z',
  },
  {
    id: 'user-accountant-001',
    email: 'comptable@transport-bretagne.fr',
    first_name: 'Catherine',
    last_name: 'Petit',
    full_name: 'Catherine Petit',
    mobile: '0698456789',
    role: UserRole.ACCOUNTANT,
    status: 'LOCKED',
    is_active: false,
    created_at: '2024-01-10T09:00:00Z',
    last_login_at: '2024-11-20T14:15:00Z',
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
  const [selectedUser, setSelectedUser] = useState(null)

  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter(u => u.status === 'ACTIVE' || (u.is_active && !u.status)).length
    const inactive = users.filter(u => u.status === 'INACTIVE' || (!u.is_active && !u.status)).length
    const pending = users.filter(u => u.status === 'PENDING').length
    const locked = users.filter(u => u.status === 'LOCKED').length

    const byRole = {}
    users.forEach(u => {
      const roleName = ROLE_DEFINITIONS[u.role]?.name || 'unknown'
      byRole[roleName] = (byRole[roleName] || 0) + 1
    })

    return { total, active, inactive, pending, locked, byRole }
  }, [users])

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
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      full_name: `${userData.first_name} ${userData.last_name}`,
      is_active: true,
      created_at: new Date().toISOString(),
      last_login_at: null
    }
    setUsers(prev => [...prev, newUser])
    toast.success('Utilisateur créé avec succès (mode démo)')
  }

  const handleEditUser = async (userId, userData) => {
    setUsers(prev => prev.map(u =>
      u.id === userId
        ? { ...u, ...userData, full_name: `${userData.first_name} ${userData.last_name}` }
        : u
    ))
    toast.success('Utilisateur modifié avec succès (mode démo)')
  }

  const handleDeleteUser = async (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId))
    toast.success('Utilisateur supprimé avec succès (mode démo)')
  }

  const handleBulkAction = async (action, userIds, reason) => {
    toast.success(`Opération ${action} effectuée sur ${userIds.length} utilisateur(s) (mode démo)`)
    setSelectedUsers([])
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

    toast.success('Export CSV réussi (mode démo)')
  }, [filteredUsers])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Demo Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg">
          <h1 className="text-2xl font-bold">🚌 FERDI - Page Utilisateurs (Mode Démo)</h1>
          <p className="text-blue-100">Interface modernisée pour la gestion des utilisateurs</p>
        </div>

        {/* Modern Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gestion des utilisateurs
            </h2>
            <p className="text-gray-600">
              Gérez les membres de votre équipe et leurs permissions
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedUsers.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setBulkModalOpen(true)}
                className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
              >
                <Settings className="mr-2 h-4 w-4" />
                Actions groupées ({selectedUsers.length})
              </Button>
            )}
            <Button
              variant="outline"
              onClick={exportUsers}
              disabled={filteredUsers.length === 0 || loading}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV ({filteredUsers.length})
            </Button>
            <Button
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Mail className="mr-2 h-4 w-4" />
              Invitations
            </Button>
            <Button 
              onClick={() => setCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Button>
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
                    +{stats.byRole.ADMIN || 0} admin(s)
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
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {selectedUsers.length} sélectionné(s)
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <UsersTable
              users={filteredUsers}
              selectedUsers={selectedUsers}
              onSelectionChange={setSelectedUsers}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              canManage={true}
            />
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
    </div>
  )
}