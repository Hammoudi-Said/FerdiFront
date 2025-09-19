'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { hasPermission } from '@/lib/utils/permission-manager'
import { PERMISSIONS } from '@/lib/constants/enums'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  Database,
  Activity,
  Globe,
  Settings,
  FileText,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

/**
 * 🛡️ SUPER ADMIN DASHBOARD - Vue globale multi-tenant
 * Conforme OpenAPI - SUPER_ADMIN accès complet multi-entreprises
 */
export function SuperAdminDashboard() {
  const { user } = useAuthStore()
  const [globalStats, setGlobalStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    systemAlerts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGlobalData()
  }, [])

  const loadGlobalData = async () => {
    try {
      // Simuler le chargement des stats globales
      // En réalité, cela viendrait des endpoints SUPER_ADMIN
      setGlobalStats({
        totalCompanies: 47,
        activeCompanies: 43,
        totalUsers: 312,
        activeUsers: 298,
        totalRevenue: 125430,
        systemAlerts: 3
      })
    } catch (error) {
      console.error('Erreur chargement dashboard super admin:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!hasPermission(user?.role, PERMISSIONS.SYSTEM_ADMIN)) {
    return (
      <div className="p-6 text-center">
        <Shield className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-semibold">Accès système requis</h3>
        <p className="text-muted-foreground">Cette page nécessite les droits Super Administrateur.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ferdi - Administration Système</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble globale de la plateforme • Super Administrateur
        </p>
      </div>

      {/* Alertes système */}
      {globalStats.systemAlerts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Alertes système ({globalStats.systemAlerts})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Entreprises avec trial expiré</span>
                <Badge variant="outline" className="text-orange-700">2</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Connexions échouées suspectes</span>
                <Badge variant="outline" className="text-orange-700">1</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats globales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entreprises</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              {globalStats.activeCompanies} actives • {globalStats.totalCompanies - globalStats.activeCompanies} inactives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {globalStats.activeUsers} actifs • Taux: {Math.round((globalStats.activeUsers/globalStats.totalUsers)*100)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{globalStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Système</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">
              Uptime • 2 incidents ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions système */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Gestion des entreprises
            </CardTitle>
            <CardDescription>
              Administration multi-tenant
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/dashboard/company" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Globe className="mr-2 h-4 w-4" />
                Gestion des entreprises
              </Button>
            </Link>

            <Link href="/users" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Gestion utilisateurs
              </Button>
            </Link>

            <Link href="/dashboard/settings" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Configuration système
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Gestion des utilisateurs
            </CardTitle>
            <CardDescription>
              Administration globale des comptes
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/users" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Tous les utilisateurs
              </Button>
            </Link>

            <Link href="/invitations" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Gestion des invitations
              </Button>
            </Link>

            <Link href="/dashboard/settings" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                Paramètres système
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Administration système
            </CardTitle>
            <CardDescription>
              Configuration et monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/dashboard/admin/audit" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Logs d'audit
              </Button>
            </Link>

            <Link href="/dashboard/admin/system" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" />
                Système & performance
              </Button>
            </Link>

            <Link href="/dashboard/admin/analytics" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics globales
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Tableau de bord temps réel */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nouvelles entreprises (30 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Transport Dubois', date: '2025-01-18', plan: 'ESSENTIAL' },
                { name: 'Cars de Normandie', date: '2025-01-15', plan: 'STANDARD' },
                { name: 'Autocaristes Réunis', date: '2025-01-12', plan: 'FREETRIAL' },
                { name: 'Express Voyages', date: '2025-01-10', plan: 'PREMIUM' },
              ].map((company, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium text-sm">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.date}</p>
                  </div>
                  <Badge variant="outline">{company.plan}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métriques système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU Usage</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded">
                    <div className="w-1/3 h-2 bg-green-500 rounded"></div>
                  </div>
                  <span className="text-sm">32%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded">
                    <div className="w-1/2 h-2 bg-blue-500 rounded"></div>
                  </div>
                  <span className="text-sm">48%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Load</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded">
                    <div className="w-1/4 h-2 bg-yellow-500 rounded"></div>
                  </div>
                  <span className="text-sm">23%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}