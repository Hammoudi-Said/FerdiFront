'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { hasPermission, PERMISSIONS } from '@/lib/utils/permission-manager'
import { UserRole } from '@/lib/constants/enums'
import { 
  Building2, 
  Users, 
  Car, 
  MapPin, 
  Calculator, 
  FileText, 
  TrendingUp,
  Settings,
  Mail,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

/**
 * 🏢 ADMIN DASHBOARD - Gestion complète de l'entreprise
 * Conforme OpenAPI - ADMIN a accès complet à SON entreprise
 */
export function AdminDashboard() {
  const { user, company, getUsers } = useAuthStore()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    totalVehicles: 0,
    activeVehicles: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Charger les statistiques utilisateurs
      const usersResult = await getUsers()
      if (usersResult.success) {
        const users = usersResult.users
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          activeUsers: users.filter(u => u.status === 'ACTIVE').length,
          pendingUsers: users.filter(u => u.status === 'PENDING').length,
        }))
      }
    } catch (error) {
      console.error('Erreur chargement dashboard admin:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!hasPermission(user?.role, PERMISSIONS.COMPANY_WRITE_OWN)) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-semibold">Accès non autorisé</h3>
        <p className="text-muted-foreground">Vous devez être administrateur pour accéder à cette page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrateur</h1>
        <p className="text-muted-foreground">
          Gestion complète de votre entreprise • {company?.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} actifs • {stats.pendingUsers} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Véhicules</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company?.max_vehicles || 0}</div>
            <p className="text-xs text-muted-foreground">
              Limite selon votre plan {company?.subscription_plan}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missions actives</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +20% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA du mois</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€45,231</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Gestion quotidienne de votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/users" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Gérer les utilisateurs
              </Button>
            </Link>

            <Link href="/invitations" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Inviter des collaborateurs
              </Button>
            </Link>

            <Link href="/dashboard/fleet" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Car className="mr-2 h-4 w-4" />
                Gérer la flotte
              </Button>
            </Link>

            <Link href="/dashboard/planning" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                Planning & missions
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Paramètres et configuration de l'entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/dashboard/company" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Informations entreprise
              </Button>
            </Link>

            <Link href="/dashboard/reports" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Rapports & analytics
              </Button>
            </Link>

            <Link href="/dashboard/settings" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres système
              </Button>
            </Link>

            <Link href="/dashboard/invoices" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Calculator className="mr-2 h-4 w-4" />
                Facturation
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Badge variant="outline">Utilisateur</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nouveau chauffeur inscrit</p>
                  <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">Mission</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">Mission Paris-Lyon terminée</p>
                  <p className="text-xs text-muted-foreground">Il y a 4 heures</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">Véhicule</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">Maintenance programmée</p>
                  <p className="text-xs text-muted-foreground">Demain à 9h00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes & notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.pendingUsers > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">
                      {stats.pendingUsers} utilisateur(s) en attente de validation
                    </p>
                    <Link href="/users">
                      <Button variant="link" size="sm" className="p-0 text-yellow-700">
                        Valider maintenant →
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    Performance en hausse ce mois-ci
                  </p>
                  <p className="text-xs text-blue-600">+12% de missions réalisées</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}