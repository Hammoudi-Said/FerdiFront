'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/stores/auth-store'
import { UserRole } from '@/lib/constants/enums'
import { 
  Building2, 
  Users, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  MoreHorizontal,
  Settings,
  Database,
  Shield
} from 'lucide-react'

export default function SystemAdminPage() {
  const { user } = useAuthStore()
  const [companies, setCompanies] = useState([])
  const [systemStats, setSystemStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    activeCompanies: 0,
    pendingApprovals: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSystemData()
  }, [])

  const loadSystemData = async () => {
    try {
      // Simuler le chargement des données système
      const mockCompanies = [
        {
          id: 'comp-001',
          name: 'Transport Bretagne SARL',
          code: 'BRE-12345-ABC',
          status: 'ACTIVE',
          subscription: 'STANDARD',
          userCount: 8,
          createdAt: '2024-01-15',
          lastActivity: '2024-08-29'
        },
        {
          id: 'comp-002',
          name: 'Cars Normandie',
          code: 'NOR-67890-DEF',
          status: 'PENDING',
          subscription: 'PREMIUM',
          userCount: 0,
          createdAt: '2024-08-28',
          lastActivity: null
        },
        {
          id: 'comp-003',
          name: 'Transport Occitanie',
          code: 'OCC-11111-GHI',
          status: 'SUSPENDED',
          subscription: 'ESSENTIAL',
          userCount: 5,
          createdAt: '2024-03-10',
          lastActivity: '2024-08-20'
        }
      ]

      setCompanies(mockCompanies)
      setSystemStats({
        totalCompanies: mockCompanies.length,
        totalUsers: mockCompanies.reduce((sum, comp) => sum + comp.userCount, 0),
        activeCompanies: mockCompanies.filter(comp => comp.status === 'ACTIVE').length,
        pendingApprovals: mockCompanies.filter(comp => comp.status === 'PENDING').length
      })
    } catch (error) {
      console.error('Erreur chargement données système:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Actif</Badge>
      case 'PENDING':
        return <Badge className="bg-orange-500">En attente</Badge>
      case 'SUSPENDED':
        return <Badge className="bg-red-500">Suspendu</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary">Inactif</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSubscriptionBadge = (plan) => {
    const colors = {
      FREETRIAL: 'bg-gray-500',
      ESSENTIAL: 'bg-blue-500',
      STANDARD: 'bg-purple-500',
      PREMIUM: 'bg-yellow-500'
    }
    return <Badge className={colors[plan] || 'bg-gray-500'}>{plan}</Badge>
  }

  const handleApproveCompany = async (companyId) => {
    // Logique d'approbation
    console.log('Approuver entreprise:', companyId)
  }

  const handleSuspendCompany = async (companyId) => {
    // Logique de suspension
    console.log('Suspendre entreprise:', companyId)
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administration Système</h1>
            <p className="text-muted-foreground">
              Gestion globale du système FERDI • {user?.full_name}
            </p>
          </div>

          {/* Métriques système */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entreprises</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalCompanies}</div>
                <p className="text-xs text-muted-foreground">
                  dont {systemStats.activeCompanies} actives
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">tous rôles confondus</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approb. en attente</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{systemStats.pendingApprovals}</div>
                <p className="text-xs text-muted-foreground">nécessitent validation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Santé Système</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">98%</div>
                <p className="text-xs text-muted-foreground">disponibilité</p>
              </CardContent>
            </Card>
          </div>

          {/* Gestion des entreprises */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Gestion des Entreprises
              </CardTitle>
              <CardDescription>
                Vue d'ensemble et gestion des entreprises clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Barre de recherche */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou code entreprise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button>
                  <Building2 className="mr-2 h-4 w-4" />
                  Nouvelle entreprise
                </Button>
              </div>

              {/* Liste des entreprises */}
              <div className="space-y-3">
                {filteredCompanies.map((company) => (
                  <div key={company.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(company.status)}
                          {getSubscriptionBadge(company.subscription)}
                          <span className="font-medium">{company.name}</span>
                        </div>
                        
                        <div className="grid gap-2 md:grid-cols-3">
                          <div>
                            <p className="text-sm font-medium">Code</p>
                            <p className="text-sm text-muted-foreground">{company.code}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Utilisateurs</p>
                            <p className="text-sm text-muted-foreground">{company.userCount} actifs</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Dernière activité</p>
                            <p className="text-sm text-muted-foreground">
                              {company.lastActivity 
                                ? new Date(company.lastActivity).toLocaleDateString('fr-FR')
                                : 'Aucune'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {company.status === 'PENDING' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600"
                            onClick={() => handleApproveCompany(company.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approuver
                          </Button>
                        )}
                        {company.status === 'ACTIVE' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSuspendCompany(company.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Suspendre
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="mr-2 h-4 w-4" />
                          Gérer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions administratives */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Maintenance Système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Sauvegarde de la base de données
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Nettoyer les logs système
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuration globale
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Sécurité & Audit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Logs d'accès
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Alertes sécurité
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Gestion des permissions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}