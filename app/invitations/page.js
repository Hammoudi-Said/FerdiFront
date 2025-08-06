'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { invitationsAPI } from '@/lib/api-client'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CreateInvitationModal } from '@/components/invitations/create-invitation-modal'
import { InvitationsTable } from '@/components/invitations/invitations-table'
import {
  Mail,
  Plus,
  Search,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export default function InvitationsPage() {
  const { user, hasPermission, updateActivity } = useAuthStore()
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    expired: 0,
    cancelled: 0
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
            role: 'driver',
            first_name: 'Jean',
            last_name: 'Dupont',
            mobile: '0601234567',
            personal_message: 'Bienvenue dans l\'équipe!',
            is_active: true,
            accepted: false,
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
            role: 'dispatch',
            first_name: 'Marie',
            last_name: 'Martin',
            mobile: '0607654321',
            personal_message: null,
            is_active: true,
            accepted: true,
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
            role: 'accountant',
            first_name: 'Pierre',
            last_name: 'Durand',
            mobile: null,
            personal_message: 'Nous avons besoin de vos compétences comptables',
            is_active: true,
            accepted: false,
            accepted_at: null,
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            expires_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Expired
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
        const response = await invitationsAPI.getInvitations({
          active_only: showActiveOnly
        })
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
    let pending = 0, accepted = 0, expired = 0, cancelled = 0
    const now = new Date()

    invitationsList.forEach(inv => {
      if (inv.accepted) {
        accepted++
      } else if (!inv.is_active) {
        cancelled++
      } else if (new Date(inv.expires_at) < now) {
        expired++
      } else {
        pending++
      }
    })

    setStats({ total, pending, accepted, expired, cancelled })
  }

  const handleCreateInvitation = (newInvitation) => {
    setInvitations(prev => [newInvitation, ...prev])
    calculateStats([newInvitation, ...invitations])
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
        // Mock cancel
        await new Promise(resolve => setTimeout(resolve, 1000))
        setInvitations(prev => prev.map(inv => 
          inv.id === invitation.id 
            ? { ...inv, is_active: false }
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

  // Filter invitations based on search term and active only setting
  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = !searchTerm || 
      invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${invitation.first_name || ''} ${invitation.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesActiveFilter = !showActiveOnly || invitation.is_active
    
    return matchesSearch && matchesActiveFilter
  })

  const canManage = hasPermission('users_manage')

  return (
    <RoleGuard allowedRoles={['1', '2']} showUnauthorized={true}>
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
                    <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-gray-600" />
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
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="activeOnly"
                    checked={showActiveOnly}
                    onChange={(e) => setShowActiveOnly(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="activeOnly" className="text-sm text-gray-600">
                    Seulement les invitations actives
                  </label>
                </div>
              </div>
              
              {(searchTerm || !showActiveOnly) && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {filteredInvitations.length} invitation(s) trouvée(s)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setShowActiveOnly(true)
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