'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore, ROLE_DEFINITIONS } from '@/lib/stores/auth-store'
import { Users, Plus, Edit, Trash2, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function UsersPage() {
  const { getUsers, user, company, updateActivity } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updateActivity()
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const result = await getUsers()
      if (result.success) {
        setUsers(result.users)
      } else {
        toast.error('Erreur', {
          description: result.error
        })
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs')
    }
    setLoading(false)
  }

  const getRoleBadge = (roleId) => {
    const roleData = ROLE_DEFINITIONS[roleId]
    if (!roleData) return <Badge variant="secondary">Inconnu</Badge>
    
    return (
      <Badge 
        className={`${roleData.textColor} ${roleData.bgColor} border-0`}
      >
        {roleData.label}
      </Badge>
    )
  }

  return (
    <RoleGuard allowedRoles={['1', '2']} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 h-6 w-6 text-blue-600" />
                Gestion des Utilisateurs
              </h1>
              <p className="text-gray-600">
                {user?.role === '1' 
                  ? 'Gestion globale de tous les utilisateurs'
                  : `Équipe de ${company?.name}`
                }
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Utilisateurs</CardTitle>
              <CardDescription>
                {loading ? 'Chargement...' : `${users.length} utilisateur(s) trouvé(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center p-8">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur</h3>
                  <p className="text-gray-600">Commencez par ajouter des utilisateurs à votre équipe.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Utilisateur</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Rôle</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                        {user?.role === '1' && (
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Entreprise</th>
                        )}
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Dernière connexion</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{user.full_name || `${user.first_name} ${user.last_name}`}</p>
                                <p className="text-xs text-gray-500">{user.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{user.email}</td>
                          <td className="py-3 px-4">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                            >
                              {user.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          {user?.role === '1' && (
                            <td className="py-3 px-4 text-gray-600">{user.company?.name || 'N/A'}</td>
                          )}
                          <td className="py-3 px-4 text-gray-600">
                            {user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" className="p-2">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="p-2 text-red-600 hover:text-red-800">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}