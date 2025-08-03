'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { 
  Bus, 
  Users,
  Fuel,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Eye
} from 'lucide-react'

// Mock fleet data for consultation
const mockFleet = [
  {
    id: 'VH-001',
    plate: '1234 AB 75',
    model: 'Mercedes Travego',
    capacity: 55,
    year: 2020,
    status: 'available',
    mileage: 125000,
    fuel_level: 85,
    last_maintenance: '2025-06-15',
    next_maintenance: '2025-08-15',
    current_driver: 'Jean Dupont',
    location: 'Garage Paris Nord'
  },
  {
    id: 'VH-002', 
    plate: '5678 CD 13',
    model: 'Volvo 9700',
    capacity: 49,
    year: 2019,
    status: 'in_use',
    mileage: 189000,
    fuel_level: 65,
    last_maintenance: '2025-05-20',
    next_maintenance: '2025-07-20',
    current_driver: 'Sophie Martin',
    location: 'En route vers Lyon'
  },
  {
    id: 'VH-003',
    plate: '9012 EF 69',
    model: 'Setra S515HD',
    capacity: 58,
    year: 2021,
    status: 'maintenance',
    mileage: 89000,
    fuel_level: 30,
    last_maintenance: '2025-07-20',
    next_maintenance: '2025-09-20',
    current_driver: null,
    location: 'Atelier maintenance'
  },
  {
    id: 'VH-004',
    plate: '3456 GH 06',
    model: 'Iveco Crossway',
    capacity: 42,
    year: 2018,
    status: 'available',
    mileage: 234000,
    fuel_level: 90,
    last_maintenance: '2025-06-30',
    next_maintenance: '2025-08-30',
    current_driver: null,
    location: 'Garage Nice'
  }
]

export default function FleetViewPage() {
  const { user, hasPermission, updateActivity } = useAuthStore()
  const [fleet, setFleet] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updateActivity()
    
    // Check if user has permission to view fleet (dispatch or internal_support)
    if (!hasPermission('fleet_view')) {
      toast.error('Accès refusé', {
        description: 'Vous n\'avez pas les permissions pour voir cette page'
      })
      return
    }

    loadFleet()
  }, [hasPermission, updateActivity])

  const loadFleet = async () => {
    setLoading(true)
    try {
      // In real app, this would call API: /api/fleet/
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setFleet(mockFleet)
    } catch (error) {
      toast.error('Erreur lors du chargement de la flotte')
    }
    setLoading(false)
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disponible</Badge>
      case 'in_use':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">En service</Badge>
      case 'maintenance':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Maintenance</Badge>
      case 'out_of_service':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Hors service</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_use':
        return <Bus className="h-4 w-4 text-blue-600" />
      case 'maintenance':
        return <Settings className="h-4 w-4 text-red-600" />
      case 'out_of_service':
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getFuelLevelColor = (level) => {
    if (level >= 70) return 'text-green-600'
    if (level >= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getFleetStats = () => {
    return {
      total: fleet.length,
      available: fleet.filter(v => v.status === 'available').length,
      in_use: fleet.filter(v => v.status === 'in_use').length,
      maintenance: fleet.filter(v => v.status === 'maintenance').length,
      total_capacity: fleet.reduce((sum, v) => sum + v.capacity, 0),
      avg_fuel: Math.round(fleet.reduce((sum, v) => sum + v.fuel_level, 0) / fleet.length)
    }
  }

  // Check permissions
  if (!hasPermission('fleet_view')) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-600">
            Vous n'avez pas les permissions pour consulter la flotte.
          </p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-amber-800">
              <strong>Permissions requises :</strong> Consultation flotte
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Cette page est accessible aux dispatcheurs et au support interne.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const stats = getFleetStats()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Flotte (consultation)</h1>
            <p className="text-gray-600">Vue d'ensemble des véhicules de la flotte</p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Eye className="mr-1 h-3 w-3" />
            Consultation uniquement
          </Badge>
        </div>

        {/* Permission Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Mode consultation
                </p>
                <p className="text-xs text-blue-700">
                  Vous pouvez consulter les informations de la flotte mais pas les modifier. 
                  Pour la gestion complète, contactez un administrateur.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Bus className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-800">Véhicules totaux</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-800">Disponibles</p>
                  <p className="text-2xl font-bold text-green-900">{stats.available}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-800">Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.maintenance}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-800">Capacité totale</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.total_capacity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fleet List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bus className="mr-2 h-5 w-5" />
              Véhicules de la flotte
            </CardTitle>
            <CardDescription>
              Liste complète des véhicules avec leurs statuts actuels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : fleet.length === 0 ? (
              <div className="text-center py-8">
                <Bus className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucun véhicule trouvé</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {fleet.map((vehicle) => (
                  <Card key={vehicle.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      {/* Vehicle Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(vehicle.status)}
                          <div>
                            <h3 className="text-lg font-semibold">
                              {vehicle.model}
                            </h3>
                            <p className="text-sm text-gray-600 font-mono">
                              {vehicle.plate}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(vehicle.status)}
                      </div>

                      {/* Vehicle Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Capacité:</span>
                            <span className="font-medium">{vehicle.capacity} places</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Année:</span>
                            <span className="font-medium">{vehicle.year}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Kilométrage:</span>
                            <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Carburant:</span>
                            <span className={`font-medium ${getFuelLevelColor(vehicle.fuel_level)}`}>
                              {vehicle.fuel_level}%
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Chauffeur:</span>
                            <span className="font-medium">
                              {vehicle.current_driver || 'Non assigné'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Localisation:</span>
                            <span className="font-medium text-xs">{vehicle.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Maintenance Info */}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Dernière maintenance:</span>
                            <div>{new Date(vehicle.last_maintenance).toLocaleDateString('fr-FR')}</div>
                          </div>
                          <div>
                            <span className="font-medium">Prochaine maintenance:</span>
                            <div>{new Date(vehicle.next_maintenance).toLocaleDateString('fr-FR')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}