'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ModernPageLayout, ModernStats, ModernSection } from '@/components/ui/modern-page-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Users,
  Bus,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  MapPin,
  UserPlus,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { user, company, updateActivity } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    users: { total: 28, active: 26, pending: 2 },
    fleet: { total: 18, active: 16, maintenance: 2 },
    missions: { today: 5, thisWeek: 23, completed: 156 },
    alerts: []
  })

  useEffect(() => {
    updateActivity()
    loadDashboardData()
  }, [updateActivity])

  const loadDashboardData = async () => {
    try {
      // Simuler le chargement des données
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
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const modernStats = [
    {
      label: 'Équipe',
      value: stats.users.total,
      icon: Users,
      trend: `${stats.users.active} actifs`,
      subtitle: `${stats.users.pending} en attente`
    },
    {
      label: 'Flotte',
      value: stats.fleet.total,
      icon: Bus,
      trend: `${stats.fleet.active} opérationnels`,
      subtitle: `${stats.fleet.maintenance} en maintenance`
    },
    {
      label: 'Missions',
      value: stats.missions.today,
      icon: Calendar,
      trend: 'Aujourd\'hui',
      subtitle: `${stats.missions.thisWeek} cette semaine`
    },
    {
      label: 'Performance',
      value: stats.missions.completed,
      icon: TrendingUp,
      trend: '+12% ce mois',
      subtitle: 'Missions terminées'
    }
  ]

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
        { title: 'Nouvelle mission', href: '/missions', icon: MapPin },
        { title: 'État des véhicules', href: '/dashboard/fleet', icon: Bus }
      )
    } else if (user?.role === 'DRIVER') {
      actions.push(
        { title: 'Mes missions', href: '/dashboard/my-routes', icon: MapPin },
        { title: 'Mon planning', href: '/dashboard/planning', icon: Calendar }
      )
    }

    return actions
  }

  return (
    <DashboardLayout>
      <ModernPageLayout
        title="📊 Tableau de bord FERDI"
        subtitle={`${company?.name} • ${user?.role ? user.role.replace('_', ' ').toLowerCase() : 'Utilisateur'}`}
        icon={BarChart3}
        headerGradient="from-indigo-600 via-purple-700 to-pink-600"
        actions={
          <Button
            onClick={() => toast.info('Vue d\'ensemble actualisée')}
            className="bg-white text-indigo-600 hover:bg-white/90 shadow-lg"
            size="sm"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        }
      >
        {/* Statistiques principales */}
        <ModernStats stats={modernStats} />

        {/* Actions rapides et alertes */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Actions rapides */}
          <ModernSection
            title="⚡ Actions rapides"
            subtitle="Accédez rapidement aux fonctionnalités importantes"
            icon={ArrowRight}
            iconColor="text-indigo-600"
          >
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
          </ModernSection>

          {/* Alertes et notifications */}
          <ModernSection
            title="🔔 Notifications"
            subtitle="Alertes et informations importantes"
            icon={AlertTriangle}
            iconColor="text-orange-600"
          >
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
          </ModernSection>
        </div>

        {/* Raccourcis par rôle */}
        <ModernSection
          title="🚀 Raccourcis personnalisés"
          subtitle="Fonctionnalités adaptées à votre rôle"
          icon={Users}
          iconColor="text-purple-600"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user?.role === 'ADMIN' && (
              <>
                <Link href="/users">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">Utilisateurs</h3>
                        <p className="text-sm text-blue-600">{stats.users.total} membres</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/fleet">
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <Bus className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-orange-900">Flotte</h3>
                        <p className="text-sm text-orange-600">{stats.fleet.total} véhicules</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/planning">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-900">Planning</h3>
                        <p className="text-sm text-green-600">{stats.missions.today} missions aujourd'hui</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </>
            )}

            {user?.role === 'DRIVER' && (
              <Link href="/dashboard/my-routes">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900">Mes trajets</h3>
                      <p className="text-sm text-purple-600">Missions assignées</p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </ModernSection>
      </ModernPageLayout>
    </DashboardLayout>
  )
}