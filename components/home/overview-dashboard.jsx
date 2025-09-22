'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ROLE_DEFINITIONS } from '@/lib/constants/enums'
import { DATA_COLORS, FERDI_GRADIENTS, ANIMATIONS } from '@/lib/constants/colors'
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
    <div className="space-y-8 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-full p-6 -m-6">
      {/* Header d'accueil moderne avec gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600 rounded-2xl shadow-2xl shadow-blue-500/20 p-8 text-white">
        {/* Éléments décoratifs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-md">
              🚌 Bienvenue sur FERDI
            </h1>
            <p className="text-blue-100 text-lg font-medium">
              {company?.name && `${company.name} • `}
              {roleData?.label || 'Utilisateur'} • Tableau de bord général
            </p>
            <div className="flex items-center mt-4 space-x-3">
              <Badge className="bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                ✨ Interface moderne
              </Badge>
              <Badge className="bg-orange-500/80 text-white border-0">
                🔥 Optimisé pour vous
              </Badge>
            </div>
          </div>
          <Link href="/dashboard">
            <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg">
              <BarChart3 className="mr-2 h-5 w-5" />
              Accéder au dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistiques modernes avec couleurs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Carte Équipe - Bleu */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-500 to-blue-600 text-white group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-12 translate-x-12"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-blue-100">👥 ÉQUIPE</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white mb-1">{stats.users.total}</div>
            <p className="text-blue-100 text-sm">
              {stats.users.active} actifs • {stats.users.pending} en attente
            </p>
            <div className="mt-2 h-1 bg-white/20 rounded-full">
              <div className="h-1 bg-white/60 rounded-full" style={{width: `${(stats.users.active/stats.users.total)*100}%`}}></div>
            </div>
          </CardContent>
        </Card>

        {/* Carte Flotte - Orange */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-500 to-orange-600 text-white group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-12 translate-x-12"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-orange-100">🚛 FLOTTE</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Bus className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white mb-1">{stats.fleet.total}</div>
            <p className="text-orange-100 text-sm">
              {stats.fleet.active} opérationnels • {stats.fleet.maintenance} maintenance
            </p>
            <div className="mt-2 h-1 bg-white/20 rounded-full">
              <div className="h-1 bg-white/60 rounded-full" style={{width: `${(stats.fleet.active/stats.fleet.total)*100}%`}}></div>
            </div>
          </CardContent>
        </Card>

        {/* Carte Missions - Vert */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-500 to-green-600 text-white group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-12 translate-x-12"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-green-100">📅 MISSIONS</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white mb-1">{stats.missions.today}</div>
            <p className="text-green-100 text-sm">
              Aujourd'hui • {stats.missions.thisWeek} cette semaine
            </p>
            <div className="mt-2 flex items-center text-green-100">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-xs">+15% vs. hier</span>
            </div>
          </CardContent>
        </Card>

        {/* Carte Performance - Violet */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-500 to-purple-600 text-white group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-12 translate-x-12"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-purple-100">📊 PERFORMANCE</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white mb-1">{stats.missions.completed}</div>
            <p className="text-purple-100 text-sm">
              Missions terminées • +12% ce mois
            </p>
            <div className="mt-2 flex items-center text-purple-100">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">Excellent</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides et alertes modernisées */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Actions rapides */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-3">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {getQuickActions().map((action, index) => {
                const Icon = action.icon
                const colors = [
                  'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                  'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
                  'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
                  'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                ]
                const colorClass = colors[index % colors.length]
                
                return (
                  <Link key={index} href={action.href}>
                    <Button 
                      className={`w-full justify-start bg-gradient-to-r ${colorClass} text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {action.title}
                      <ArrowRight className="ml-auto h-4 w-4" />
                    </Button>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notifications modernisées */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg mr-3">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.alerts.length > 0 ? (
                stats.alerts.map((alert) => (
                  <div key={alert.id} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                        {alert.priority === 'high' ? (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{alert.message}</p>
                        <Badge 
                          className={`mt-2 text-xs border-0 ${
                            alert.priority === 'high' 
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          }`}
                        >
                          {alert.priority === 'high' ? '🔥 Priorité haute' : 'ℹ️ Information'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-sm font-medium text-green-700">✨ Aucune alerte active - Tout va bien !</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vue d'ensemble entreprise modernisée */}
      {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && company && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg mr-3">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              Informations entreprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-blue-600 mb-2">🏢 Nom de l'entreprise</p>
                <p className="text-lg font-bold text-blue-900">{company.name}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <p className="text-sm font-semibold text-purple-600 mb-2">💎 Plan d'abonnement</p>
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  {company.subscription_plan || 'Standard'}
                </Badge>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <p className="text-sm font-semibold text-green-600 mb-2">✅ Statut</p>
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  🟢 Actif
                </Badge>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link href="/dashboard/company">
                <Button className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Settings className="mr-2 h-4 w-4" />
                  Gérer l'entreprise
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}