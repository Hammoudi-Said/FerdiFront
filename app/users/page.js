'use client'

import { useState, useEffect } from 'react'
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
import { usersAPI } from '@/lib/api-client'
import { ROLE_DEFINITIONS } from '@/lib/stores/auth-store'
import {
  Users,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Download
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
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {}
  })

  useEffect(() => {
    updateActivity()
    loadUsers()
  }, [updateActivity])

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
        setUsers(response.data.data || response.data)
        calculateStats(response.data.data || response.data)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (usersList) => {
    const total = usersList.length
    const active = usersList.filter(u => u.is_active).length
    const inactive = total - active
    
    const byRole = {}
    usersList.forEach(u => {
      const roleName = ROLE_DEFINITIONS[u.role]?.name || 'unknown'
      byRole[roleName] = (byRole[roleName] || 0) + 1
    })

    setStats({ total, active, inactive, byRole })
  }

  const handleCreateUser = async (userData) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock user creation
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
        const response = await usersAPI.createUser(userData)
        await loadUsers() // Refresh the list
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
        // Mock user update
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, ...userData, full_name: `${userData.first_name} ${userData.last_name}` }
            : u
        ))
        toast.success('Utilisateur modifié avec succès')
      } else {
        await usersAPI.updateUser(userId, userData)
        await loadUsers() // Refresh the list
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
        // Mock user deletion
        const updatedUsers = users.filter(u => u.id !== userId)
        setUsers(updatedUsers)
        calculateStats(updatedUsers)
        toast.success('Utilisateur supprimé avec succès')
      } else {
        await usersAPI.deleteUser(userId)
        await loadUsers() // Refresh the list
        toast.success('Utilisateur supprimé avec succès')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Erreur lors de la suppression de l\'utilisateur')
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

  const exportUsers = () => {
    const csvContent = [
      ['Nom', 'Prénom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date de création'].join(','),
      ...filteredUsers.map(user => [
        user.last_name,
        user.first_name,
        user.email,
        user.mobile || '',
        ROLE_DEFINITIONS[user.role]?.label || 'Inconnu',
        user.is_active ? 'Actif' : 'Inactif',
        new Date(user.created_at).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Filter users based on search term, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || user.role === filterRole
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <RoleGuard allowedRoles={['1', '2']} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
              <p className="text-gray-600">Gérez les membres de votre équipe</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={exportUsers}
                disabled={filteredUsers.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Exporter CSV
              </Button>
              {hasPermission('users_manage') && (
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvel utilisateur
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Actifs</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inactifs</p>
                    <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                  </div>
                  <UserX className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Par rôle</p>
                  <div className="space-y-1">
                    {Object.entries(stats.byRole).map(([role, count]) => (
                      <div key={role} className="flex justify-between text-xs">
                        <span className="capitalize">{role}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtres et recherche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par nom ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Tous les rôles</option>
                  {Object.entries(ROLE_DEFINITIONS).map(([roleId, roleData]) => (
                    <option key={roleId} value={roleId}>{roleData.label}</option>
                  ))}
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              
              {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {filteredUsers.length} utilisateur(s) trouvé(s)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setFilterRole('all')
                      setFilterStatus('all')
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <UsersTable
                  users={filteredUsers}
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
      </DashboardLayout>
    </RoleGuard>
  )
}