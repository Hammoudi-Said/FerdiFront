'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Bus, 
  UserCheck,
  Plus,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react'

// Mock data for the main dashboard overview
const mockDashboardData = {
  stats: {
    totalUsers: 28,
    availableVehicles: 7,
    availableDrivers: 5,
    maintenanceVehicles: 2,
  },
  upcomingMissions: [
    {
      id: 'MSN-2025-001',
      departure_date: '25/07/2025',
      vehicle: 'Autocar Mercedes Travego',
      status: 'confirmed',
      destination: 'Paris - Lyon'
    },
    {
      id: 'MSN-2025-002',
      departure_date: '26/07/2025', 
      vehicle: 'Minibus Sprinter',
      status: 'pending',
      destination: 'Lyon - Marseille'
    },
    {
      id: 'MSN-2025-003',
      departure_date: '27/07/2025',
      vehicle: 'Autocar Setra S515HD', 
      status: 'confirmed',
      destination: 'Nice - Cannes'
    },
    {
      id: 'MSN-2025-004',
      departure_date: '28/07/2025',
      vehicle: 'Van Ford Transit',
      status: 'cancelled',
      destination: 'Toulouse - Bordeaux'
    },
    {
      id: 'MSN-2025-005',
      departure_date: '29/07/2025',
      vehicle: 'Autocar Volvo 9700',
      status: 'confirmed',
      destination: 'Strasbourg - Nancy'
    }
  ],
  availableDrivers: [
    'Jean Dupont',
    'Sophie Martin', 
    'Yacine Lefèvre',
    'Claire Morel',
    'Thomas Durand'
  ]
}

const getStatusBadge = (status) => {
  switch(status) {
    case 'confirmed':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmé</Badge>
    case 'pending':
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">À valider</Badge>
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Annulé</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const getStatusIcon = (status) => {
  switch(status) {
    case 'confirmed':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'pending':
      return <Clock className="h-4 w-4 text-orange-600" />
    case 'cancelled':
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

export default function DashboardPage() {
  const { user, company, updateActivity } = useAuthStore()
  const [data, setData] = useState(mockDashboardData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updateActivity()
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [updateActivity])

  const getTodayDate = () => {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  return (
    <RoleGuard allowedRoles={['1', '2', '3', '4', '5', '6']} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-gray-600">Vue d'ensemble de vos missions de transport</p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => updateActivity()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle mission
            </Button>
          </div>

          {/* Missions Table */}
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Missions à venir</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                Voir tout
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-600">Numéro de dossier</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">Date de départ</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">Véhicule</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">Statut</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingMissions.map((mission, index) => (
                      <tr key={mission.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            {getStatusIcon(mission.status)}
                            <span className="ml-2 font-medium">{mission.id}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-600">{mission.departure_date}</td>
                        <td className="py-3 px-2 text-gray-600">{mission.vehicle}</td>
                        <td className="py-3 px-2">{getStatusBadge(mission.status)}</td>
                        <td className="py-3 px-2">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Today's Date */}
          <div className="text-lg font-medium text-gray-900 mb-4">
            Aujourd'hui - {getTodayDate()}
          </div>

          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Available Vehicles */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Bus className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-green-900">Véhicules disponibles : {data.stats.availableVehicles}</h3>
                      <Badge className="bg-green-200 text-green-800 hover:bg-green-200 mt-1">
                        Disponibles
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {data.stats.maintenanceVehicles > 0 && (
                  <div className="text-sm text-green-800 mt-2">
                    {data.stats.maintenanceVehicles} véhicules en maintenance
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Drivers */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-blue-900">Chauffeurs disponibles : {data.stats.availableDrivers}</h3>
                      <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-200 mt-1">
                        Disponibles
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-blue-800">
                  {data.availableDrivers.map((driver, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      {driver}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}