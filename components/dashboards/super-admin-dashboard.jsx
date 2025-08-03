'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Database, 
  Building2, 
  Users, 
  Shield, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  Settings
} from 'lucide-react'

const mockGlobalStats = {
  totalCompanies: 8,
  totalUsers: 156,
  activeUsers: 142,
  totalVehicles: 89,
  systemHealth: 'good',
  recentActivity: [
    {
      id: 1,
      type: 'company_registered',
      company: 'Transport Express Lyon',
      timestamp: '2 heures',
      status: 'success'
    },
    {
      id: 2,
      type: 'user_login',
      company: 'AutoCars Provence',
      user: 'Sophie Martin',
      timestamp: '1 heure',
      status: 'success'
    },
    {
      id: 3,
      type: 'system_error',
      message: 'Erreur de connexion base de données',
      timestamp: '45 minutes',
      status: 'error'
    },
    {
      id: 4,
      type: 'payment_processed',
      company: 'Transport Rhône',
      amount: '€1,250.00',
      timestamp: '30 minutes',
      status: 'success'
    }
  ],
  companyList: [
    {
      id: 1,
      name: 'AutoCars Provence',
      users: 23,
      vehicles: 12,
      status: 'active',
      lastActivity: '2 heures'
    },
    {
      id: 2,
      name: 'Transport Express Lyon', 
      users: 18,
      vehicles: 8,
      status: 'active',
      lastActivity: '1 heure'
    },
    {
      id: 3,
      name: 'Cars du Sud-Ouest',
      users: 31,
      vehicles: 15,
      status: 'active', 
      lastActivity: '4 heures'
    },
    {
      id: 4,
      name: 'Transport Rhône',
      users: 28,
      vehicles: 18,
      status: 'warning',
      lastActivity: '1 jour'
    }
  ]
}

const getStatusIcon = (status) => {
  switch(status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

const getActivityMessage = (activity) => {
  switch(activity.type) {
    case 'company_registered':
      return `Nouvelle entreprise inscrite: ${activity.company}`
    case 'user_login':
      return `Connexion utilisateur: ${activity.user} (${activity.company})`
    case 'system_error':
      return activity.message
    case 'payment_processed':
      return `Paiement traité: ${activity.amount} (${activity.company})`
    default:
      return 'Activité système'
  }
}

export function SuperAdminDashboard() {
  const { updateActivity } = useAuthStore()
  const [stats, setStats] = useState(mockGlobalStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updateActivity()
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [updateActivity])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-3 h-6 w-6 text-red-600" />
            Administration Globale FERDI
          </h1>
          <p className="text-gray-600">Vue d'ensemble multi-entreprises et gestion système</p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Actions Admin
        </Button>
      </div>

      {/* Global Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.totalCompanies}</p>
                <p className="text-xs text-gray-600">Entreprises clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-gray-600">
                  Utilisateurs ({stats.activeUsers} actifs)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.totalVehicles}</p>
                <p className="text-xs text-gray-600">Véhicules totaux</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  <Badge className="bg-green-100 text-green-800">
                    Système OK
                  </Badge>
                </p>
                <p className="text-xs text-gray-600">État du système</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Entreprises Clientes</CardTitle>
            <CardDescription>Gestion et supervision multi-entreprises</CardDescription>
          </div>
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Voir toutes
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.companyList.map((company) => (
              <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{company.name}</h3>
                    <p className="text-sm text-gray-600">
                      {company.users} utilisateurs • {company.vehicles} véhicules
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={company.status === 'active' ? 'default' : 'secondary'}
                    className={company.status === 'warning' ? 'bg-orange-100 text-orange-800' : ''}
                  >
                    {company.status === 'active' ? 'Actif' : 
                     company.status === 'warning' ? 'Attention' : 'Inactif'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Dernière activité: {company.lastActivity}
                  </span>
                  <Button size="sm" variant="ghost">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Système Récente</CardTitle>
          <CardDescription>Événements et logs système en temps réel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(activity.status)}
                  <div>
                    <p className="text-sm font-medium">
                      {getActivityMessage(activity)}
                    </p>
                    <p className="text-xs text-gray-500">Il y a {activity.timestamp}</p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    activity.status === 'success' ? 'border-green-200 text-green-700' :
                    activity.status === 'error' ? 'border-red-200 text-red-700' :
                    'border-gray-200 text-gray-700'
                  }
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}