'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { invitationsAPI } from '@/lib/api-client'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CreateInvitationModal } from '@/components/invitations/create-invitation-modal'
import { InvitationsTable } from '@/components/invitations/invitations-table'
import { UserRole, UserInvitationStatus, INVITATION_STATUS_DEFINITIONS } from '@/lib/constants/enums'
import {
  Mail,
  Plus,
  Search,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export default function InvitationsPage() {
  const { user, hasPermission, updateActivity } = useAuthStore()
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // New status filter
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    expired: 0,
    deleted: 0
  })

  useEffect(() => {
    updateActivity()
    loadInvitations()
  }, [updateActivity])

  const loadInvitations = async () => {
    try {
      setLoading(true)

      if (USE_MOCK_DATA) {
        // Mock invitations data with new status field
        const mockInvitations = [
          {
            id: 'inv-1',
            email: 'jean.dupont@example.com',
            role: 'DRIVER',
            first_name: 'Jean',
            last_name: 'Dupont',
            mobile: '0601234567',
            personal_message: 'Bienvenue dans l\'équipe!',
            status: UserInvitationStatus.PENDING,
            accepted_at: null,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            invited_by: {
              id: user.id,
              full_name: user.full_name,
              email: user.email
            }
          },
          {
            id: 'inv-2',
            email: 'marie.martin@example.com',
            role: 'DISPATCH',
            first_name: 'Marie',
            last_name: 'Martin',
            mobile: '0607654321',
            personal_message: null,
            status: UserInvitationStatus.ACCEPTED,
            accepted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            invited_by: {
              id: user.id,
              full_name: user.full_name,
              email: user.email
            }
          },
          {
            id: 'inv-3',
            email: 'pierre.durand@example.com',
            role: 'ACCOUNTANT',
            first_name: 'Pierre',
            last_name: 'Durand',
            mobile: null,
            personal_message: 'Nous avons besoin de vos compétences comptables',
            status: UserInvitationStatus.EXPIRED,
            accepted_at: null,
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            expires_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Expired
            invited_by: {
              id: user.id,
              full_name: user.full_name,
              email: user.email
            }
          },
          {
            id: 'inv-4',
            email: 'alice.durand@example.com',
            role: 'DRIVER',
            first_name: 'Alice',
            last_name: 'Durand',
            mobile: '0687654329',
            personal_message: 'Invitation annulée',
            status: UserInvitationStatus.DELETED,
            accepted_at: null,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            invited_by: {
              id: user.id,
              full_name: user.full_name,
              email: user.email
            }
          }
        ]

        setInvitations(mockInvitations)
        calculateStats(mockInvitations)
      } else {
        // Always get ALL invitations regardless of status filter
        // The filtering will be done client-side
        const response = await invitationsAPI.getInvitations()
        setInvitations(response.data || [])
        calculateStats(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load invitations:', error)
      toast.error('Erreur lors du chargement des invitations')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (invitationsList) => {
    const total = invitationsList.length
    let pending = 0, accepted = 0, expired = 0, deleted = 0

    invitationsList.forEach(inv => {
      // Use new status field if available
      if (inv.status) {
        switch (inv.status) {
          case UserInvitationStatus.PENDING:
            pending++
            break
          case UserInvitationStatus.ACCEPTED:
            accepted++
            break
          case UserInvitationStatus.EXPIRED:
            expired++
            break
          case UserInvitationStatus.DELETED:
            deleted++
            break
        }
      } else {
        // Legacy support for old format
        const now = new Date()
        if (inv.accepted) {
          accepted++
        } else if (inv.is_active === false) {
          deleted++
        } else if (new Date(inv.expires_at) < now) {
          expired++
        } else {
          pending++
        }
      }
    })

    setStats({ total, pending, accepted, expired, deleted })
  }

  const handleCreateInvitation = (newInvitation) => {
    // Ensure new invitation has status field
    const invitationWithStatus = {
      ...newInvitation,
      status: UserInvitationStatus.PENDING
    }
    
    setInvitations(prev => [invitationWithStatus, ...prev])
    calculateStats([invitationWithStatus, ...invitations])
    toast.success('Invitation créée avec succès')
  }

  const handleResendInvitation = async (invitation) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock resend
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success(`Invitation renvoyée à ${invitation.email}`)
      } else {
        await invitationsAPI.resendInvitation(invitation.id)
        toast.success(`Invitation renvoyée à ${invitation.email}`)
      }
    } catch (error) {
      console.error('Failed to resend invitation:', error)
      toast.error('Erreur lors du renvoi de l\'invitation')
    }
  }

  const handleCancelInvitation = async (invitation) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock cancel - update status to DELETED
        await new Promise(resolve => setTimeout(resolve, 1000))
        setInvitations(prev => prev.map(inv =>
          inv.id === invitation.id
            ? { ...inv, status: UserInvitationStatus.DELETED }
            : inv
        ))
        toast.success('Invitation annulée')
      } else {
        await invitationsAPI.cancelInvitation(invitation.id)
        await loadInvitations() // Refresh the list
        toast.success('Invitation annulée')
      }
    } catch (error) {
      console.error('Failed to cancel invitation:', error)
      toast.error('Erreur lors de l\'annulation de l\'invitation')
    }
  }

  // Reload invitations when status filter changes
  useEffect(() => {
    if (!loading) {
      loadInvitations()
    }
  }, [statusFilter])

  // Filter invitations based on search term and status filter
  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = !searchTerm ||
      invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${invitation.first_name || ''} ${invitation.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatusFilter = statusFilter === 'all' || 
      (invitation.status ? invitation.status === statusFilter : 
       // Legacy support
       (statusFilter === UserInvitationStatus.ACCEPTED && invitation.accepted) ||
       (statusFilter === UserInvitationStatus.DELETED && invitation.is_active === false) ||
       (statusFilter === UserInvitationStatus.PENDING && !invitation.accepted && invitation.is_active !== false))

    return matchesSearch && matchesStatusFilter
  })

  const canManage = hasPermission('invitations_manage')

  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
              <p className="text-gray-600">Gérez les invitations des nouveaux utilisateurs</p>
            </div>
            {canManage && (
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle invitation
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-5">
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
                    <p className="text-sm font-medium text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Acceptées</p>
                    <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expirées</p>
                    <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Annulées</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.deleted}</p>
                  </div>
                  <Trash2 className="h-8 w-8 text-gray-600" />
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
                      placeholder="Rechercher par email ou nom..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="statusFilter" className="text-sm text-gray-600 whitespace-nowrap">
                      Statut :
                    </label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        {Object.entries(INVITATION_STATUS_DEFINITIONS).map(([value, def]) => (
                          <SelectItem key={value} value={value}>
                            {def.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {(searchTerm || statusFilter !== 'all') && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {filteredInvitations.length} invitation(s) trouvée(s)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invitations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Invitations ({filteredInvitations.length})</CardTitle>
              <CardDescription>
                Les invitations expirent automatiquement après 7 jours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <InvitationsTable
                  invitations={filteredInvitations}
                  onResendInvitation={handleResendInvitation}
                  onCancelInvitation={handleCancelInvitation}
                  canManage={canManage}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create Invitation Modal */}
        <CreateInvitationModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onInvitationCreated={handleCreateInvitation}
        />
      </DashboardLayout>
    </RoleGuard>
  )
}