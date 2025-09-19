'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ROLE_DEFINITIONS } from '@/lib/constants/enums'
import {
  Users,
  Building2,
  Bus,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3,
  Settings,
  UserPlus,
  FileText
} from 'lucide-react'
import Link from 'next/link'

/**
 * 🏠 OVERVIEW DASHBOARD - Page d'accueil avec vue d'ensemble
 * Design professionnel sobre, informations contextuelles selon le rôle
 */
export function OverviewDashboard() {
  const { user, company, updateActivity } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, pending: 0 },
    fleet: { total: 0, active: 0, maintenance: 0 },
    missions: { today: 0, thisWeek: 0, completed: 0 },
    alerts: []
  })

  useEffect(() => {
    updateActivity()
    loadOverviewData()
  }, [updateActivity])

  const loadOverviewData = async () => {
    try {
      // Simuler le chargement des données générales
      setStats({
        users: { total: 28, active: 26, pending: 2 },
        fleet: { total: 18, active: 16, maintenance: 2 },
        missions: { today: 5, thisWeek: 23, completed: 156 },
        alerts: [
          {
            id: 1,
            type: 'maintenance',
            message: '2 véhicules en maintenance programmée',
            priority: 'medium'
          },
          {
            id: 2,
            type: 'users',
            message: '2 utilisateurs en attente de validation',
            priority: 'high'
          }
        ]
      })
    } catch (error) {
      console.error('Erreur chargement overview:', error)
    } finally {
      setLoading(false)
    }
  }

  const roleData = user?.role ? ROLE_DEFINITIONS[user.role] : null

  // Actions rapides selon le rôle
  const getQuickActions = () => {
    const actions = []
    
    if (user?.role === 'SUPER_ADMIN') {
      actions.push(
        { title: 'Gérer toutes les entreprises', href: '/admin/companies', icon: Building2 },
        { title: 'Utilisateurs système', href: '/admin/users', icon: Users },
        { title: 'Analytics globales', href: '/admin/analytics', icon: BarChart3 }
      )
    } else if (user?.role === 'ADMIN') {
      actions.push(
        { title: 'Gérer les utilisateurs', href: '/users', icon: Users },
        { title: 'Inviter des collaborateurs', href: '/invitations', icon: UserPlus },
        { title: 'Gérer la flotte', href: '/dashboard/fleet', icon: Bus },
        { title: 'Planning & missions', href: '/dashboard/planning', icon: Calendar }
      )
    } else if (user?.role === 'DISPATCH') {
      actions.push(
        { title: 'Planning du jour', href: '/dashboard/planning', icon: Calendar },
        { title: 'Assigner les chauffeurs', href: '/dashboard/drivers', icon: Users },
        { title: 'État des véhicules', href: '/dashboard/fleet', icon: Bus }
      )
    } else if (user?.role === 'DRIVER') {
      actions.push(
        { title: 'Mes missions', href: '/dashboard/my-routes', icon: Calendar },
        { title: 'Véhicules', href: '/dashboard/fleet', icon: Bus }
      )
    }

    return actions
  }

  return (
    <div className="space-y-6">
      {/* Header d'accueil */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Bienvenue sur Ferdi
            </h1>
            <p className="text-gray-600 mt-1">
              {company?.name && `${company.name} • `}
              {roleData?.label || 'Utilisateur'} • Tableau de bord général
            </p>
          </div>
          <Link href="/dashboard">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <BarChart3 className="mr-2 h-4 w-4" />
              Accéder au dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Équipe</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{stats.users.total}</div>
            <p className="text-xs text-gray-500">
              {stats.users.active} actifs • {stats.users.pending} en attente
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Flotte</CardTitle>
            <Bus className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{stats.fleet.total}</div>
            <p className="text-xs text-gray-500">
              {stats.fleet.active} opérationnels • {stats.fleet.maintenance} maintenance
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Missions</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{stats.missions.today}</div>
            <p className="text-xs text-gray-500">
              Aujourd'hui • {stats.missions.thisWeek} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{stats.missions.completed}</div>
            <p className="text-xs text-gray-500">
              Missions terminées • +12% ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides et alertes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Actions rapides */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {getQuickActions().map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={index} href={action.href}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    >
                      <Icon className="mr-3 h-4 w-4 text-gray-500" />
                      {action.title}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alertes et notifications */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.alerts.length > 0 ? (
                stats.alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      {alert.priority === 'high' ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <Badge 
                        variant="outline" 
                        className={`mt-1 text-xs ${
                          alert.priority === 'high' 
                            ? 'border-orange-200 text-orange-700' 
                            : 'border-blue-200 text-blue-700'
                        }`}
                      >
                        {alert.priority === 'high' ? 'Priorité haute' : 'Information'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-3 p-3 text-center text-gray-500">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Aucune alerte active</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vue d'ensemble de l'entreprise (pour ADMIN et SUPER_ADMIN) */}
      {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && company && (
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-gray-500" />
              Informations entreprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Nom de l'entreprise</p>
                <p className="text-base text-gray-900">{company.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Plan d'abonnement</p>
                <Badge variant="outline" className="mt-1">
                  {company.subscription_plan || 'Standard'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <Badge className="mt-1 bg-green-100 text-green-800">
                  Actif
                </Badge>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link href="/dashboard/company">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Gérer l'entreprise
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}