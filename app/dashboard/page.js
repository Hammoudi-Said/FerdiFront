'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore, ROLE_DEFINITIONS } from '@/lib/stores/auth-store'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { 
  Users, 
  Bus, 
  FileText, 
  Receipt, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  Activity,
  DollarSign,
  MapPin,
  Calendar,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react'

const StatCard = ({ title, value, description, icon: Icon, className = '', trend = null, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 text-blue-900 border-blue-200',
    green: 'from-green-50 to-green-100 text-green-900 border-green-200',
    purple: 'from-purple-50 to-purple-100 text-purple-900 border-purple-200',
    orange: 'from-orange-50 to-orange-100 text-orange-900 border-orange-200',
    red: 'from-red-50 to-red-100 text-red-900 border-red-200',
    teal: 'from-teal-50 to-teal-100 text-teal-900 border-teal-200',
  }

  return (
    <Card className={cn(
      'bg-gradient-to-br border shadow-sm hover:shadow-md transition-all duration-200',
      colorClasses[color] || colorClasses.blue,
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium opacity-80">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {trend && (
            <div className={cn(
              'flex items-center text-xs',
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {trend.value}
            </div>
          )}
          <Icon className="h-4 w-4 opacity-70" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs opacity-70 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

const QuickActionCard = ({ title, description, icon: Icon, onClick, color = 'blue', disabled = false }) => {
  const colorClasses = {
    blue: 'hover:bg-blue-50 text-blue-700 border-blue-200',
    green: 'hover:bg-green-50 text-green-700 border-green-200',
    purple: 'hover:bg-purple-50 text-purple-700 border-purple-200',
    orange: 'hover:bg-orange-50 text-orange-700 border-orange-200',
    red: 'hover:bg-red-50 text-red-700 border-red-200',
    teal: 'hover:bg-teal-50 text-teal-700 border-teal-200',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'p-4 border rounded-lg cursor-pointer transition-all duration-200 text-left w-full',
        disabled ? 'opacity-50 cursor-not-allowed' : colorClasses[color] || colorClasses.blue
      )}
    >
      <Icon className="h-8 w-8 mb-2" />
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm opacity-70">{description}</p>
    </button>
  )
}

export default function DashboardPage() {
  const { user, company, getRoleData, hasPermission, updateActivity } = useAuthStore()
  const [stats, setStats] = useState({
    users: 0,
    vehicles: 0,
    activeRoutes: 0,
    monthlyRevenue: 0,
    completedTrips: 0,
    maintenanceAlerts: 0,
  })
  const [loading, setLoading] = useState(true)

  const roleData = getRoleData()

  useEffect(() => {
    updateActivity()
    
    const fetchStats = async () => {
      try {
        // Fetch users count if user has permission
        if (hasPermission('users_view') || hasPermission('users_manage')) {
          try {
            const usersResponse = await api.get('/users/')
            setStats(prev => ({ ...prev, users: usersResponse.data.count }))
          } catch (error) {
            console.error('Error fetching users:', error)
          }
        }

        // Mock data for other stats (would be replaced with real API calls)
        const mockStats = {
          vehicles: Math.floor(Math.random() * 50) + 10,
          activeRoutes: Math.floor(Math.random() * 20) + 5,
          monthlyRevenue: Math.floor(Math.random() * 100000) + 50000,
          completedTrips: Math.floor(Math.random() * 200) + 100,
          maintenanceAlerts: Math.floor(Math.random() * 5),
        }

        setStats(prev => ({ ...prev, ...mockStats }))

      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user, hasPermission, updateActivity])

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const getStatsForRole = () => {
    const allStats = [
      {
        title: 'Utilisateurs actifs',
        value: loading ? '...' : stats.users,
        description: 'Collaborateurs de l\'entreprise',
        icon: Users,
        color: 'green',
        permissions: ['users_view', 'users_manage'],
        trend: { direction: 'up', value: '+2 cette semaine' }
      },
      {
        title: 'Flotte disponible',
        value: loading ? '...' : stats.vehicles,
        description: 'Véhicules opérationnels',
        icon: Bus,
        color: 'blue',
        permissions: ['fleet_manage', 'fleet_view'],
        trend: { direction: 'up', value: '+1 ce mois' }
      },
      {
        title: 'Trajets actifs',
        value: loading ? '...' : stats.activeRoutes,
        description: 'En cours aujourd\'hui',
        icon: MapPin,
        color: 'purple',
        permissions: ['routes_manage', 'routes_view', 'routes_view_assigned'],
      },
      {
        title: 'CA mensuel',
        value: loading ? '...' : `${(stats.monthlyRevenue / 1000).toFixed(0)}k€`,
        description: 'Chiffre d\'affaires du mois',
        icon: DollarSign,
        color: 'teal',
        permissions: ['billing_manage', 'reports_access'],
        trend: { direction: 'up', value: '+12% vs mois dernier' }
      },
      {
        title: 'Trajets terminés',
        value: loading ? '...' : stats.completedTrips,
        description: 'Ce mois-ci',
        icon: CheckCircle2,
        color: 'orange',
        permissions: ['routes_view', 'reports_access'],
        trend: { direction: 'up', value: '+8% vs mois dernier' }
      },
      {
        title: 'Alertes maintenance',
        value: loading ? '...' : stats.maintenanceAlerts,
        description: 'Nécessitent attention',
        icon: AlertTriangle,
        color: stats.maintenanceAlerts > 0 ? 'red' : 'green',
        permissions: ['fleet_manage', 'fleet_view'],
      },
    ]

    return allStats.filter(stat => 
      stat.permissions.length === 0 || 
      stat.permissions.some(permission => hasPermission(permission))
    )
  }

  const getQuickActionsForRole = () => {
    const allActions = [
      {
        title: 'Gérer la flotte',
        description: 'Véhicules et maintenance',
        icon: Bus,
        color: 'blue',
        permissions: ['fleet_manage'],
        onClick: () => window.location.href = '/dashboard/fleet'
      },
      {
        title: 'Planning des trajets',
        description: 'Voir et planifier',
        icon: Calendar,
        color: 'purple',
        permissions: ['schedule_manage', 'routes_view', 'routes_view_assigned'],
        onClick: () => window.location.href = '/dashboard/schedule'
      },
      {
        title: 'Gérer l\'équipe',
        description: 'Utilisateurs et rôles',
        icon: UserCheck,
        color: 'green',
        permissions: ['users_manage'],
        onClick: () => window.location.href = '/dashboard/users'
      },
      {
        title: 'Facturation',
        description: 'Devis et factures',
        icon: Receipt,
        color: 'teal',
        permissions: ['billing_manage', 'invoices_manage'],
        onClick: () => window.location.href = '/dashboard/invoices'
      },
      {
        title: 'Rapports',
        description: 'Analytics et exports',
        icon: TrendingUp,
        color: 'orange',
        permissions: ['reports_access'],
        onClick: () => window.location.href = '/dashboard/reports'
      },
      {
        title: 'Support client',
        description: 'Assistance et tickets',
        icon: Activity,
        color: 'red',
        permissions: ['support_access'],
        onClick: () => window.location.href = '/dashboard/support'
      },
    ]

    return allActions.filter(action => 
      action.permissions.some(permission => hasPermission(permission))
    )
  }

  const getSubscriptionProgress = () => {
    if (!company) return { users: 0, vehicles: 0 }
    
    return {
      users: Math.floor((stats.users / company.max_users) * 100),
      vehicles: Math.floor((stats.vehicles / company.max_vehicles) * 100),
    }
  }

  const subscriptionProgress = getSubscriptionProgress()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section with Role Badge */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {getWelcomeMessage()}, {user?.first_name} !
            </h1>
            <div className="flex items-center space-x-3 mt-2">
              <p className="text-muted-foreground">
                {company?.name}
              </p>
              {roleData && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'border font-medium',
                    roleData.textColor,
                    roleData.bgColor,
                    roleData.color.replace('bg-', 'border-')
                  )}
                >
                  <Zap className="mr-1 h-3 w-3" />
                  {roleData.label}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Dernière activité</p>
            <p className="text-sm font-medium">
              <Clock className="inline h-3 w-3 mr-1" />
              {new Date().toLocaleString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {getStatsForRole().map((stat, index) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Company Information & Usage */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Building2 className="mr-2 h-5 w-5" />
                Informations de l'entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-blue-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium opacity-80">Nom</p>
                  <p className="text-sm font-semibold">{company?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium opacity-80">Code entreprise</p>
                  <p className="text-sm font-mono bg-blue-200 px-2 py-1 rounded">{company?.company_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium opacity-80">Plan</p>
                  <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                    {company?.subscription_plan}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium opacity-80">Statut</p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm capitalize font-medium">{company?.status}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage & Limits */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-900">
                <TrendingUp className="mr-2 h-5 w-5" />
                Utilisation & Limites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-purple-800">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Utilisateurs</span>
                  <span className="font-medium">{stats.users} / {company?.max_users}</span>
                </div>
                <Progress 
                  value={subscriptionProgress.users} 
                  className="h-2 bg-purple-200"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Véhicules</span>
                  <span className="font-medium">{stats.vehicles} / {company?.max_vehicles}</span>
                </div>
                <Progress 
                  value={subscriptionProgress.vehicles} 
                  className="h-2 bg-purple-200"
                />
              </div>
              <div className="pt-2 border-t border-purple-200">
                <p className="text-xs opacity-80">
                  Créé le {new Date(company?.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions (Role-based) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5 text-yellow-500" />
              Actions rapides
            </CardTitle>
            <CardDescription>
              Accès rapide aux fonctionnalités selon vos permissions ({roleData?.label})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {getQuickActionsForRole().map((action, index) => (
                <QuickActionCard
                  key={action.title}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  color={action.color}
                  onClick={() => {
                    updateActivity()
                    action.onClick()
                  }}
                />
              ))}
            </div>
            
            {getQuickActionsForRole().length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune action rapide disponible pour votre rôle</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}