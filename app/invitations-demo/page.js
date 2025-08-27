'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CreateInvitationModal } from '@/components/invitations/create-invitation-modal'
import { InvitationsTable } from '@/components/invitations/invitations-table'
import { UserRole } from '@/lib/constants/enums'
import {
  Mail,
  Plus,
  Search,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

// Mock user data for demo
const mockUser = {
  id: 'user-admin-demo',
  email: 'admin@demo.com',
  role: UserRole.ADMIN,
  full_name: 'Administrateur Démo',
  first_name: 'Administrateur',
  last_name: 'Démo',
  is_active: true,
  company_id: 'company-demo'
}

export default function InvitationsDemoPage() {
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
    loadMockInvitations()
  }, [])

  const loadMockInvitations = () => {
    // Mock invitations data for demonstration
    const mockInvitations = [
      {
        id: 'inv-1',
        email: 'jean.dupont@example.com',
        role: 'DRIVER',
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
          id: mockUser.id,
          full_name: mockUser.full_name,
          email: mockUser.email
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
        is_active: true,
        accepted: true,
        accepted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        invited_by: {
          id: mockUser.id,
          full_name: mockUser.full_name,
          email: mockUser.email
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
        is_active: true,
        accepted: false,
        accepted_at: null,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Expired
        invited_by: {
          id: mockUser.id,
          full_name: mockUser.full_name,
          email: mockUser.email
        }
      },
      {
        id: 'inv-4',
        email: 'support@example.com',
        role: 'INTERNAL_SUPPORT',
        first_name: 'Sophie',
        last_name: 'Bernard',
        mobile: '0612345678',
        personal_message: 'Rejoignez notre équipe support!',
        is_active: false,
        accepted: false,
        accepted_at: null,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        invited_by: {
          id: mockUser.id,
          full_name: mockUser.full_name,
          email: mockUser.email
        }
      }
    ]
    
    setInvitations(mockInvitations)
    calculateStats(mockInvitations)
    setLoading(false)
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
    const invitation = {
      ...newInvitation,
      id: `inv-${Date.now()}`,
      is_active: true,
      accepted: false,
      accepted_at: null,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      invited_by: {
        id: mockUser.id,
        full_name: mockUser.full_name,
        email: mockUser.email
      }
    }
    
    setInvitations(prev => [invitation, ...prev])
    calculateStats([invitation, ...invitations])
    toast.success('Invitation créée avec succès')
  }

  const handleResendInvitation = async (invitation) => {
    toast.success(`Invitation renvoyée à ${invitation.email}`)
  }

  const handleCancelInvitation = async (invitation) => {
    setInvitations(prev => prev.map(inv => 
      inv.id === invitation.id 
        ? { ...inv, is_active: false }
        : inv
    ))
    toast.success('Invitation annulée')
  }

  // Filter invitations based on search term and active only setting
  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = !searchTerm || 
      invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${invitation.first_name || ''} ${invitation.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesActiveFilter = !showActiveOnly || invitation.is_active
    
    return matchesSearch && matchesActiveFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Demo Header */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-blue-900">Système d'Invitations FERDI - Démonstration</h1>
                  <p className="text-blue-700 text-sm">Vue complète du système d'invitation pour les administrateurs</p>
                </div>
              </div>
              <Link href="/demo">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la démo
                </Button>
              </Link>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
              <p className="text-gray-600">Gérez les invitations des nouveaux utilisateurs</p>
            </div>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle invitation
            </Button>
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
              <InvitationsTable
                invitations={filteredInvitations}
                onResendInvitation={handleResendInvitation}
                onCancelInvitation={handleCancelInvitation}
                canManage={true}
                loading={loading}
              />
            </CardContent>
          </Card>

          {/* Feature Explanation */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900">Système d'Invitations Fonctionnel</h3>
                  <p className="text-sm text-green-800 mt-1">
                    Ce système d'invitations est <strong>déjà entièrement implémenté</strong> dans l'application FERDI. 
                    Il comprend la création d'invitations, la gestion des permissions par rôle, 
                    l'envoi et le renvoi d'invitations, ainsi que la gestion des expirations.
                  </p>
                  <div className="mt-2 text-sm text-green-800">
                    <strong>Fonctionnalités incluses :</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Création d'invitations avec validation des rôles</li>
                      <li>Interface de gestion complète avec statistiques</li>
                      <li>Système de permissions (Admin et Super Admin uniquement)</li>
                      <li>Recherche et filtrage des invitations</li>
                      <li>Actions de renvoi et d'annulation</li>
                      <li>Gestion des expirations automatiques</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Invitation Modal */}
        <CreateInvitationModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onInvitationCreated={handleCreateInvitation}
        />
      </div>
    </div>
  )
}