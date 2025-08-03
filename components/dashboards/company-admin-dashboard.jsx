'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  Bus,
  UserCheck,
  Plus,
  Settings,
  TrendingUp,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

const mockCompanyStats = {
  totalUsers: 28,
  activeDrivers: 12,
  totalVehicles: 18,
  maintenanceVehicles: 2,
  upcomingTrips: 15,
  monthlyRevenue: 45230,
  pendingInvoices: 8,
  recentUsers: [
    {
      id: 1,
      name: 'Marie Dubois',
      role: 'Chauffeur',
      status: 'active',
      lastSeen: '2 heures'
    },
    {
      id: 2,
      name: 'Pierre Martin',
      role: 'Dispatcheur', 
      status: 'active',
      lastSeen: '1 heure'
    },
    {
      id: 3,
      name: 'Claire Morel',
      role: 'Comptable',
      status: 'offline',
      lastSeen: '1 jour'
    }
  ],
  upcomingMissions: [
    {
      id: 'MSN-001',
      destination: 'Paris - Lyon',
      date: '25/07/2025',
      driver: 'Jean Dupont',
      vehicle: 'Mercedes Travego',
      status: 'confirmed'
    },
    {
      id: 'MSN-002', 
      destination: 'Lyon - Marseille',
      date: '26/07/2025',
      driver: 'Non assigné',
      vehicle: 'Setra S515HD',
      status: 'pending'
    }
  ]
}

export function CompanyAdminDashboard() {
  const { user, company, updateActivity } = useAuthStore()
  const [stats, setStats] = useState(mockCompanyStats)
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
            <Building2 className="mr-3 h-6 w-6 text-purple-600" />
            Gestion de {company?.name}
          </h1>
          <p className="text-gray-600">Administration complète de votre entreprise de transport</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-gray-600">Utilisateurs équipe</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.totalVehicles}</p>
                <p className="text-xs text-gray-600">
                  Véhicules ({stats.maintenanceVehicles} maintenance)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.activeDrivers}</p>
                <p className="text-xs text-gray-600">Chauffeurs actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">€{stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-600">CA du mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Équipe</CardTitle>
              <CardDescription>Gestion des utilisateurs</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Voir tous
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={user.status === 'active' ? 'default' : 'secondary'}
                      className={user.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {user.status === 'active' ? 'En ligne' : 'Hors ligne'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {user.lastSeen}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Missions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Missions Planifiées</CardTitle>
              <CardDescription>Prochaines missions à venir</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Planning
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingMissions.map((mission) => (
                <div key={mission.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {mission.status === 'confirmed' ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> :
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    }
                    <div>
                      <p className="font-medium">{mission.destination}</p>
                      <p className="text-xs text-gray-600">
                        {mission.date} • {mission.vehicle}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={mission.status === 'confirmed' ? 'default' : 'secondary'}
                      className={
                        mission.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }
                    >
                      {mission.status === 'confirmed' ? 'Confirmé' : 'À assigner'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {mission.driver}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Raccourcis vers les fonctions principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <Users className="h-6 w-6 mb-2 text-blue-600" />
              <span>Gérer Utilisateurs</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <Bus className="h-6 w-6 mb-2 text-green-600" />
              <span>Gérer Flotte</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <Calendar className="h-6 w-6 mb-2 text-purple-600" />
              <span>Planning</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <FileText className="h-6 w-6 mb-2 text-orange-600" />
              <span>Facturation</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}