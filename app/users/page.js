'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { ModernPageLayout, ModernCard, ModernSection, ModernStats } from '@/components/ui/modern-page-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { UsersTable } from '@/components/users/users-table'
import { CreateUserModal } from '@/components/users/create-user-modal'
import { EditUserModal } from '@/components/users/edit-user-modal'
import { DeleteUserDialog } from '@/components/users/delete-user-dialog'
import { BulkActionsModal } from '@/components/users/bulk-actions-modal'
import { UserDetailsPerfectModal } from '@/components/users/user-details-modal-perfect'
import { usersAPI } from '@/lib/api-client'
import { ROLE_DEFINITIONS, UserRole, UserStatus } from '@/lib/constants/enums'
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
  const [editDetailsModalOpen, setEditDetailsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    locked: 0,
    deleted: 0,
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
    const deleted = usersList.filter(u => u.status === 'DELETED').length

    const byRole = {}
    usersList.forEach(u => {
      const roleName = ROLE_DEFINITIONS[u.role]?.name || 'unknown'
      byRole[roleName] = (byRole[roleName] || 0) + 1
    })

    setStats({ total, active, inactive, pending, locked, deleted, byRole })
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
        // ✅ APPEL API BACKEND SELON OPENAPI SPEC
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

      // Amélioration: utiliser les valeurs d'enum directement
      const userStatus = user.status || (user.is_active ? 'ACTIVE' : 'INACTIVE')
      const matchesStatus = filterStatus === 'all' || userStatus === filterStatus

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
            ? {
              ...u,
              ...userData,
              full_name: `${userData.first_name} ${userData.last_name}`,
              // Handle both is_active and status fields
              is_active: userData.status === 'ACTIVE',
              status: userData.status
            }
            : u
        ))
        // Recalculate stats with updated data
        const updatedUsers = users.map(u =>
          u.id === userId
            ? {
              ...u,
              ...userData,
              full_name: `${userData.first_name} ${userData.last_name}`,
              is_active: userData.status === 'ACTIVE',
              status: userData.status
            }
            : u
        )
        calculateStats(updatedUsers)
        toast.success('Utilisateur modifié avec succès')
      } else {
        // ✅ APPEL API BACKEND: PATCH /api/v1/users/{user_id}
        await usersAPI.updateUser(userId, userData)
        await loadUsers() // Recharger la liste
        toast.success('Utilisateur modifié avec succès')
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la modification de l\'utilisateur'
      toast.error(errorMessage)
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
        // ✅ APPEL API BACKEND: DELETE /api/v1/users/{user_id}
        await usersAPI.deleteUser(userId)
        await loadUsers() // Recharger la liste
        toast.success('Utilisateur supprimé avec succès')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la suppression de l\'utilisateur'
      toast.error(errorMessage)
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

  const handleViewClick = async (user) => {
    try {
      if (USE_MOCK_DATA) {
        setSelectedUser(user)
        setEditDetailsModalOpen(true)
      } else {
        // ✅ APPEL API BACKEND: GET /api/v1/users/{user_id}
        const response = await usersAPI.getUserById(user.id)
        const userData = response.data
        setSelectedUser(userData)
        setEditDetailsModalOpen(true)
      }
    } catch (error) {
      console.error('Failed to load user details:', error)
      const errorMessage = error.response?.data?.detail || 'Erreur lors du chargement des détails de l\'utilisateur'
      toast.error(errorMessage)
      // En cas d'erreur, utiliser les données déjà disponibles
      setSelectedUser(user)
      setEditDetailsModalOpen(true)
    }
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

  // Préparation des statistiques pour le nouveau composant ModernStats
  const modernStats = [
    {
      label: 'Total utilisateurs',
      value: stats.total,
      icon: Users,
      trend: '+12% ce mois'
    },
    {
      label: 'Utilisateurs actifs',
      value: stats.active,
      icon: UserCheck,
      subtitle: `${Math.round((stats.active/stats.total)*100)}% du total`
    },
    {
      label: 'En attente',
      value: stats.pending,
      icon: Activity,
      subtitle: 'Validation requise'
    },
    {
      label: 'Inactifs',
      value: stats.inactive + stats.locked,
      icon: UserX,
      subtitle: 'Accès suspendu'
    }
  ]

  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]} showUnauthorized={true}>
      <DashboardLayout>
        <ModernPageLayout
          title="👥 Gestion des utilisateurs"
          subtitle="Gérez les membres de votre équipe et leurs permissions"
          icon={Users}
          headerGradient="from-blue-600 via-blue-700 to-purple-600"
          actions={
            <div className="flex items-center space-x-3">
              {selectedUsers.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setBulkModalOpen(true)}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                  size="sm"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Actions ({selectedUsers.length})
                </Button>
              )}
              <Button
                variant="outline"
                onClick={exportUsers}
                disabled={filteredUsers.length === 0 || loading}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              {hasPermission('users_manage') && (
                <Button
                  onClick={() => window.location.href = '/invitations'}
                  className="bg-white text-blue-600 hover:bg-white/90 shadow-lg"
                  size="sm"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Inviter un utilisateur
                </Button>
              )}
            </div>
          }
        >
          {/* Statistiques modernes */}
          <ModernStats stats={modernStats} />

          {/* Section recherche et filtres */}
          <ModernSection
            title="🔍 Recherche et filtres"
            subtitle="Trouvez rapidement les utilisateurs que vous cherchez"
            icon={Search}
            iconColor="text-purple-600"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm text-gray-700"
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
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm text-gray-700"
              >
                <option value="all">Tous les statuts</option>
                <option value={UserStatus.ACTIVE}>Actifs ({stats.active})</option>
                <option value={UserStatus.INACTIVE}>Inactifs ({stats.inactive})</option>
                <option value={UserStatus.PENDING}>En attente ({stats.pending})</option>
                <option value={UserStatus.LOCKED}>Bloqués ({stats.locked})</option>
                <option value={UserStatus.DELETED}>Supprimés ({stats.deleted})</option>
              </select>
            </div>

            {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
              <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200/50">
                <span className="text-sm font-medium text-purple-700">
                  ✨ {filteredUsers.length} résultat(s) trouvé(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setFilterRole('all')
                    setFilterStatus('all')
                  }}
                  className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                >
                  Réinitialiser
                </Button>
              </div>
            )}
          </ModernSection>

          {/* Table des utilisateurs */}
          <ModernSection
            title="👤 Liste des utilisateurs"
            subtitle={`${filteredUsers.length} utilisateur(s) affiché(s)`}
            icon={Users}
            iconColor="text-blue-600"
            className="p-0"
          >
            {/* Header avec sélection */}
            {hasPermission('users_manage') && selectedUsers.length > 0 && (
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedUsers.length} utilisateur(s) sélectionné(s)
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setBulkModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Actions groupées
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    <LoadingSpinner size="lg" className="relative z-10" />
                  </div>
                  <p className="text-gray-600 font-medium">Chargement des utilisateurs...</p>
                </div>
              </div>
            ) : (
              <div className="p-0">
                <UsersTable
                  users={filteredUsers}
                  selectedUsers={selectedUsers}
                  onSelectionChange={setSelectedUsers}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onView={handleViewClick}
                  canManage={hasPermission('users_write_company') || hasPermission('users_write_all')}
                />
              </div>
            )}
          </ModernSection>
        </ModernPageLayout>

        {/* Modals - Gardés inchangés */}
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
          <UserDetailsPerfectModal
            open={editDetailsModalOpen}
            onOpenChange={setEditDetailsModalOpen}
            user={selectedUser}
            onSave={(data) => handleEditUser(selectedUser.id, data)}
            onDelete={handleDeleteClick}
            canManage={hasPermission('users_manage')}
          />
        )}
      </DashboardLayout>
    </RoleGuard>
  )
}
