'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuthStore } from '@/lib/stores/auth-store'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Users, Search, UserPlus, Mail, Phone, Calendar } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function UsersPage() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Check if user has permission to view this page
  if (user?.role !== '1' && user?.role !== '2') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Card className="w-96">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Vous n'avez pas les permissions pour accéder à cette page.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/')
      setUsers(response.data.data || [])
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs')
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleName = (role) => {
    const roleNames = {
      '1': 'Super Admin',
      '2': 'Administrateur',
      '3': 'Autocariste',
      '4': 'Chauffeur',
    }
    return roleNames[role] || 'Inconnu'
  }

  const getRoleBadgeVariant = (role) => {
    const variants = {
      '1': 'destructive',
      '2': 'default',
      '3': 'secondary',
      '4': 'outline',
    }
    return variants[role] || 'outline'
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      '1': { variant: 'default', label: 'Actif' },
      '2': { variant: 'secondary', label: 'Inactif' },
      '3': { variant: 'destructive', label: 'Suspendu' },
      '4': { variant: 'outline', label: 'En attente' },
    }
    const config = statusConfig[status] || statusConfig['2']
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const filteredUsers = users.filter(u =>
    u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Users className="mr-3 h-8 w-8" />
              Gestion des utilisateurs
            </h1>
            <p className="text-muted-foreground">
              Gérez les membres de votre équipe
            </p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter un utilisateur
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === '2').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Autocaristes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === '3').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chauffeurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === '4').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs</CardTitle>
            <CardDescription>
              Tous les membres de votre équipe
            </CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {u.full_name || `${u.first_name} ${u.last_name}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {u.id.substring(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            {u.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="mr-1 h-3 w-3" />
                            {u.mobile}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(u.role)}>
                          {getRoleName(u.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(u.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3" />
                          {u.last_login_at ? 
                            new Date(u.last_login_at).toLocaleDateString('fr-FR') : 
                            'Jamais'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(u.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Modifier
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">
                  {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}