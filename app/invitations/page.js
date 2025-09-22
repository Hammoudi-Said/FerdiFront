'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { invitationsAPI } from '@/lib/api-client'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { ModernPageLayout, ModernStats, ModernSection } from '@/components/ui/modern-page-layout'
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
        // Mock invitations data
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
          }
        ]
        setInvitations(mockInvitations)
        calculateStats(mockInvitations)
      } else {
        const response = await invitationsAPI.getInvitations()
        const invitationsData = response.data?.data || response.data || []
        setInvitations(invitationsData)
        calculateStats(invitationsData)
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
    const pending = invitationsList.filter(inv => inv.status === UserInvitationStatus.PENDING).length
    const accepted = invitationsList.filter(inv => inv.status === UserInvitationStatus.ACCEPTED).length
    const expired = invitationsList.filter(inv => inv.status === UserInvitationStatus.EXPIRED).length
    const deleted = invitationsList.filter(inv => inv.status === UserInvitationStatus.DELETED).length

    setStats({ total, pending, accepted, expired, deleted })
  }

  const modernStats = [
    {
      label: 'Total invitations',
      value: stats.total,
      icon: Mail,
      trend: '+3 ce mois'
    },
    {
      label: 'En attente',
      value: stats.pending,
      icon: Clock,
      subtitle: 'Attendent une réponse'
    },
    {
      label: 'Acceptées',
      value: stats.accepted,
      icon: CheckCircle,
      subtitle: 'Utilisateurs créés'
    },
    {
      label: 'Expirées',
      value: stats.expired,
      icon: AlertTriangle,
      subtitle: 'À renvoyer'
    }
  ]

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = !searchTerm ||
      invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.last_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]} showUnauthorized={true}>
      <DashboardLayout>
        <ModernPageLayout
          title="📧 Gestion des invitations"
          subtitle="Invitez de nouveaux collaborateurs à rejoindre votre équipe"
          icon={Mail}
          headerGradient="from-pink-600 via-rose-700 to-orange-600"
          actions={
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-white text-pink-600 hover:bg-white/90 shadow-lg"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle invitation
            </Button>
          }
        >
          <ModernStats stats={modernStats} />

          <ModernSection
            title="🔍 Recherche et filtres"
            subtitle="Trouvez rapidement les invitations que vous cherchez"
            icon={Search}
            iconColor="text-pink-600"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par email ou nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-pink-500 focus:ring-pink-500/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-pink-500 focus:ring-pink-500/20 bg-white/80 backdrop-blur-sm text-gray-700"
              >
                <option value="all">Tous les statuts</option>
                <option value={UserInvitationStatus.PENDING}>En attente ({stats.pending})</option>
                <option value={UserInvitationStatus.ACCEPTED}>Acceptées ({stats.accepted})</option>
                <option value={UserInvitationStatus.EXPIRED}>Expirées ({stats.expired})</option>
                <option value={UserInvitationStatus.DELETED}>Annulées ({stats.deleted})</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== 'all') && (
              <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-200/50">
                <span className="text-sm font-medium text-pink-700">
                  ✨ {filteredInvitations.length} invitation(s) trouvée(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                  }}
                  className="text-pink-600 hover:text-pink-800 hover:bg-pink-100"
                >
                  Réinitialiser
                </Button>
              </div>
            )}
          </ModernSection>

          <ModernSection
            title="📨 Liste des invitations"
            subtitle={`${filteredInvitations.length} invitation(s) affichée(s)`}
            icon={UserPlus}
            iconColor="text-pink-600"
            className="p-0"
          >
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse"></div>
                    <LoadingSpinner size="lg" className="relative z-10" />
                  </div>
                  <p className="text-gray-600 font-medium">Chargement des invitations...</p>
                </div>
              </div>
            ) : (
              <div className="p-0">
                <InvitationsTable
                  invitations={filteredInvitations}
                  onResend={async (invitation) => {
                    try {
                      if (USE_MOCK_DATA) {
                        toast.success('Invitation renvoyée avec succès')
                      } else {
                        await invitationsAPI.resendInvitation(invitation.id)
                        toast.success('Invitation renvoyée avec succès')
                      }
                    } catch (error) {
                      toast.error('Erreur lors du renvoi de l\'invitation')
                    }
                  }}
                  onCancel={async (invitation) => {
                    try {
                      if (USE_MOCK_DATA) {
                        setInvitations(prev => prev.filter(inv => inv.id !== invitation.id))
                        toast.success('Invitation annulée avec succès')
                      } else {
                        await invitationsAPI.cancelInvitation(invitation.id)
                        await loadInvitations()
                        toast.success('Invitation annulée avec succès')
                      }
                    } catch (error) {
                      toast.error('Erreur lors de l\'annulation de l\'invitation')
                    }
                  }}
                  canManage={hasPermission('invitations_manage')}
                />
              </div>
            )}
          </ModernSection>
        </ModernPageLayout>

        <CreateInvitationModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSave={async (data) => {
            try {
              if (USE_MOCK_DATA) {
                const newInvitation = {
                  id: `inv-${Date.now()}`,
                  ...data,
                  status: UserInvitationStatus.PENDING,
                  created_at: new Date().toISOString(),
                  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  invited_by: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email
                  }
                }
                setInvitations(prev => [...prev, newInvitation])
                calculateStats([...invitations, newInvitation])
                toast.success('Invitation envoyée avec succès')
              } else {
                await invitationsAPI.createInvitation(data)
                await loadInvitations()
                toast.success('Invitation envoyée avec succès')
              }
            } catch (error) {
              console.error('Failed to create invitation:', error)
              toast.error('Erreur lors de l\'envoi de l\'invitation')
              throw error
            }
          }}
        />
      </DashboardLayout>
    </RoleGuard>
  )
}