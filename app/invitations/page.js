'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { invitationsAPI } from '@/lib/api-client'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { ModernPageLayout, ModernCard, ModernSection, ModernStats } from '@/components/ui/modern-page-layout'
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
  Trash2,
  Download,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export default function InvitationsPage() {
  const { user, hasPermission, updateActivity } = useAuthStore()
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
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
        // Mock invitations data with new status field - INCLUDING DELETED
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
            expires_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
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
          },
          {
            id: 'inv-5',
            email: 'sophie.bernard@example.com',
            role: 'ADMIN',
            first_name: 'Sophie',
            last_name: 'Bernard',
            mobile: '0612345098',
            personal_message: 'Une autre invitation annulée',
            status: UserInvitationStatus.DELETED,
            accepted_at: null,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
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
        await new Promise(resolve => setTimeout(resolve, 1000))
        setInvitations(prev => prev.map(inv =>
          inv.id === invitation.id
            ? { ...inv, status: UserInvitationStatus.DELETED }
            : inv
        ))
        toast.success('Invitation annulée')
      } else {
        await invitationsAPI.cancelInvitation(invitation.id)
        await loadInvitations()
        toast.success('Invitation annulée')
      }
    } catch (error) {
      console.error('Failed to cancel invitation:', error)
      toast.error('Erreur lors de l\'annulation de l\'invitation')
    }
  }

  // Filter invitations based on search term and status filter
  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = !searchTerm ||
      invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${invitation.first_name || ''} ${invitation.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatusFilter = statusFilter === 'all' || 
      (invitation.status && invitation.status === statusFilter)

    return matchesSearch && matchesStatusFilter
  })

  const canManage = hasPermission('invitations_manage')

  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* ✅ HEADER UNIFIÉ - Style Users appliqué */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                Gestion des invitations
              </h1>
              <p className="text-sm text-gray-600">
                Invitez de nouveaux membres à rejoindre votre équipe d'autocaristes
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {/* Export CSV functionality */}}
                disabled={filteredInvitations.length === 0 || loading}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              {canManage && (
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  size="sm"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Nouvelle invitation
                </Button>
              )}
            </div>
          </div>

          {/* ✅ STATS CARDS UNIFIÉES - Style Users avec 5 couleurs + hover */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total invitations</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Acceptées</p>
                    <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center border border-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expirées</p>
                    <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center border border-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Annulées</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.deleted}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                    <Trash2 className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ✅ FILTRES UNIFIÉS - Style Users appliqué */}
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
                      placeholder="Rechercher par email ou nom..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                    />
                  </div>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-gray-900 focus:ring-gray-900 bg-white text-gray-700"
                >
                  <option value="all">Tous les statuts</option>
                  {Object.entries(INVITATION_STATUS_DEFINITIONS).map(([value, def]) => (
                    <option key={value} value={value}>
                      {def.label} ({stats[value.toLowerCase()] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {(searchTerm || statusFilter !== 'all') && (
                <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <span className="text-sm text-gray-700">
                    {filteredInvitations.length} résultat(s) trouvé(s)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                    }}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Réinitialiser
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ✅ TABLE UNIFIÉE - Style Users appliqué */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <CardTitle className="text-base font-medium text-gray-900">
                    Invitations ({filteredInvitations.length})
                  </CardTitle>
                </div>
              </div>
              <CardDescription>
                Les invitations expirent automatiquement après 7 jours
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
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