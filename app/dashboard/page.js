'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/lib/stores/auth-store'
import { api } from '@/lib/api'
import { Users, Bus, FileText, Receipt, Building2, TrendingUp } from 'lucide-react'

const StatCard = ({ title, value, description, icon: Icon, className = '' }) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

export default function DashboardPage() {
  const { user, company, getRoleName } = useAuthStore()
  const [stats, setStats] = useState({
    users: 0,
    vehicles: 0,
    activeRoutes: 0,
    monthlyRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // For now, we'll use mock data since fleet endpoints aren't available
        // In the future, these would be real API calls
        
        // Fetch users count (available)
        if (user?.role === '1' || user?.role === '2') {
          try {
            const usersResponse = await api.get('/users/')
            setStats(prev => ({ ...prev, users: usersResponse.data.count }))
          } catch (error) {
            console.error('Error fetching users:', error)
          }
        }

        // Mock data for other stats (would be replaced with real API calls)
        setStats(prev => ({
          ...prev,
          vehicles: Math.floor(Math.random() * 50) + 10,
          activeRoutes: Math.floor(Math.random() * 20) + 5,
          monthlyRevenue: Math.floor(Math.random() * 100000) + 50000,
        }))
        
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const getStatsForRole = () => {
    const allStats = [
      {
        title: 'Utilisateurs',
        value: loading ? '...' : stats.users,
        description: 'Total des collaborateurs',
        icon: Users,
        roles: ['1', '2'],
      },
      {
        title: 'Véhicules',
        value: loading ? '...' : stats.vehicles,
        description: 'Flotte totale',
        icon: Bus,
        roles: ['1', '2', '3'],
      },
      {
        title: 'Trajets actifs',
        value: loading ? '...' : stats.activeRoutes,
        description: 'En cours aujourd\'hui',
        icon: FileText,
        roles: ['1', '2', '3', '4'],
      },
      {
        title: 'CA mensuel',
        value: loading ? '...' : `${(stats.monthlyRevenue / 1000).toFixed(0)}k€`,
        description: 'Chiffre d\'affaires',
        icon: Receipt,
        roles: ['1', '2'],
      },
    ]

    return allStats.filter(stat => stat.roles.includes(user?.role))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {getWelcomeMessage()}, {user?.first_name} !
            </h1>
            <p className="text-muted-foreground">
              {getRoleName()} chez {company?.name}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {getStatsForRole().map((stat, index) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Company Information */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Informations de l'entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Nom</p>
                <p className="text-sm text-muted-foreground">{company?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Code entreprise</p>
                <p className="text-sm font-mono text-muted-foreground">{company?.company_code}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Plan d'abonnement</p>
                <p className="text-sm text-muted-foreground">
                  {company?.subscription_plan === '1' && 'Starter'}
                  {company?.subscription_plan === '2' && 'Business'}
                  {company?.subscription_plan === '3' && 'Professional'}
                  {company?.subscription_plan === '4' && 'Enterprise'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Statut</p>
                <p className="text-sm text-muted-foreground capitalize">{company?.status}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Dernière connexion: Aujourd'hui</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Compte créé: {new Date(user?.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Rôle: {getRoleName()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions (Role-based) */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accès rapide aux fonctionnalités principales selon votre rôle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {user?.role !== '4' && (
                <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Bus className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">Gérer la flotte</h3>
                  <p className="text-sm text-muted-foreground">Véhicules et maintenance</p>
                </div>
              )}
              
              <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <FileText className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-medium">Planning</h3>
                <p className="text-sm text-muted-foreground">Voir les trajets</p>
              </div>
              
              {(user?.role === '1' || user?.role === '2') && (
                <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Users className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">Équipe</h3>
                  <p className="text-sm text-muted-foreground">Gérer les utilisateurs</p>
                </div>
              )}
              
              {user?.role !== '4' && (
                <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Receipt className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">Facturation</h3>
                  <p className="text-sm text-muted-foreground">Devis et factures</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}