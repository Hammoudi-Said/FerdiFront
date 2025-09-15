'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InvitationsTable } from '@/components/invitations/invitations-table'
import { UserInvitationStatus, INVITATION_STATUS_DEFINITIONS } from '@/lib/constants/enums'
import {
  Mail,
  Search,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

export default function InvitationsDemoPage() {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    expired: 0,
    deleted: 0
  })

  // Mock user pour les tests
  const mockUser = {
    id: 'user-test-001',
    full_name: 'Admin Test',
    email: 'admin@test.fr'
  }

  useEffect(() => {
    loadMockInvitations()
  }, [])

  const loadMockInvitations = () => {
    // Données de test avec TOUS les statuts y compris DELETED
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
        invited_by: mockUser
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
        invited_by: mockUser
      },
      {
        id: 'inv-3',
        email: 'pierre.durand@example.com',
        role: 'ACCOUNTANT',
        first_name: 'Pierre',
        last_name: 'Durand',
        mobile: null,
        personal_message: 'Compétences comptables requises',
        status: UserInvitationStatus.EXPIRED,
        accepted_at: null,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        invited_by: mockUser
      },
      {
        id: 'inv-4',
        email: 'alice.durand@example.com',
        role: 'DRIVER',
        first_name: 'Alice',
        last_name: 'Durand',
        mobile: '0687654329',
        personal_message: 'Invitation annulée manuellement',
        status: UserInvitationStatus.DELETED,
        accepted_at: null,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        invited_by: mockUser
      },
      {
        id: 'inv-5',
        email: 'sophie.bernard@example.com',
        role: 'ADMIN',
        first_name: 'Sophie',
        last_name: 'Bernard',
        mobile: '0612345098',
        personal_message: 'Invitation annulée après acceptation',
        status: UserInvitationStatus.DELETED,
        accepted_at: null,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        invited_by: mockUser
      }
    ]

    setInvitations(mockInvitations)
    calculateStats(mockInvitations)
  }

  const calculateStats = (invitationsList) => {
    const total = invitationsList.length
    let pending = 0, accepted = 0, expired = 0, deleted = 0

    invitationsList.forEach(inv => {
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
    })

    setStats({ total, pending, accepted, expired, deleted })
  }

  const handleResendInvitation = async (invitation) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success(`Invitation renvoyée à ${invitation.email}`)
  }

  const handleCancelInvitation = async (invitation) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update invitation status to DELETED
    setInvitations(prev => prev.map(inv =>
      inv.id === invitation.id
        ? { ...inv, status: UserInvitationStatus.DELETED }
        : inv
    ))
    
    // Recalculate stats
    const updatedInvitations = invitations.map(inv =>
      inv.id === invitation.id
        ? { ...inv, status: UserInvitationStatus.DELETED }
        : inv
    )
    calculateStats(updatedInvitations)
    
    toast.success('Invitation annulée - visible avec status DELETED')
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🧪 Invitations Demo - OpenAPI Status Migration
            </h1>
            <p className="text-gray-600">
              Test de la migration is_active → status avec TOUS les statuts visibles
            </p>
          </div>
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
            <CardDescription>
              ✅ Toutes les invitations sont récupérées, y compris celles avec status DELETED
            </CardDescription>
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

        {/* Demo Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">🔧 Test de la Migration OpenAPI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-blue-800 space-y-2">
              <p><strong>✅ Migration réussie :</strong> is_active → status</p>
              <p><strong>🏷️ Nouveaux badges :</strong> Affichage selon UserInvitationStatus</p>
              <p><strong>🔍 Filtrage avancé :</strong> Dropdown avec tous les statuts OpenAPI</p>
              <p><strong>📊 Statistiques :</strong> Calcul basé sur les nouveaux statuts</p>
              <p><strong>🗑️ DELETED visible :</strong> Les invitations annulées restent visibles avec status DELETED</p>
              <p><strong>👆 Test :</strong> Annulez une invitation pour voir qu'elle reste visible !</p>
            </div>
          </CardContent>
        </Card>

        {/* Invitations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invitations ({filteredInvitations.length})</CardTitle>
            <CardDescription>
              Toutes les invitations sont affichées selon leur status OpenAPI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvitationsTable
              invitations={filteredInvitations}
              onResendInvitation={handleResendInvitation}
              onCancelInvitation={handleCancelInvitation}
              canManage={true}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}