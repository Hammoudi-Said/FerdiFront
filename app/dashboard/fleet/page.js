'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Bus, Plus, Settings, Wrench, Fuel, MapPin } from 'lucide-react'

const mockFleetData = [
  {
    id: 'VH-001',
    model: 'Mercedes Travego',
    plate: 'AB-123-CD',
    capacity: 49,
    fuel: 75,
    status: 'available',
    location: 'Dépôt Lyon',
    mileage: 125000,
    lastMaintenance: '2025-07-15'
  },
  {
    id: 'VH-002',
    model: 'Setra S515HD',
    plate: 'EF-456-GH',
    capacity: 53,
    fuel: 45,
    status: 'in_use',
    location: 'En route vers Marseille',
    mileage: 89000,
    lastMaintenance: '2025-07-10'
  },
  {
    id: 'VH-003',
    model: 'Volvo 9700',
    plate: 'IJ-789-KL',
    capacity: 51,
    fuel: 20,
    status: 'maintenance',
    location: 'Atelier',
    mileage: 156000,
    lastMaintenance: '2025-07-20'
  },
  {
    id: 'VH-004',
    model: 'Mercedes Sprinter',
    plate: 'MN-012-OP',
    capacity: 16,
    fuel: 90,
    status: 'available',
    location: 'Dépôt Paris',
    mileage: 45000,
    lastMaintenance: '2025-07-18'
  }
]

export default function FleetPage() {
  const { updateActivity } = useAuthStore()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updateActivity()
    
    // Simulate loading
    const timer = setTimeout(() => {
      setVehicles(mockFleetData)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [updateActivity])

  const getStatusBadge = (status) => {
    switch(status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>
      case 'in_use':
        return <Badge className="bg-blue-100 text-blue-800">En service</Badge>
      case 'maintenance':
        return <Badge className="bg-orange-100 text-orange-800">Maintenance</Badge>
      case 'out_of_service':
        return <Badge className="bg-red-100 text-red-800">Hors service</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getFuelStatus = (level) => {
    if (level > 50) return 'text-green-600'
    if (level > 25) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <RoleGuard allowedRoles={['1', '2']} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Bus className="mr-3 h-6 w-6 text-blue-600" />
                Gestion de la Flotte
              </h1>
              <p className="text-gray-600">Supervision et maintenance de vos véhicules</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau véhicule
              </Button>
            </div>
          </div>

          {/* Fleet Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Bus className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'available').length}</p>
                    <p className="text-xs text-gray-600">Véhicules disponibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'in_use').length}</p>
                    <p className="text-xs text-gray-600">En service</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Wrench className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'maintenance').length}</p>
                    <p className="text-xs text-gray-600">En maintenance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Fuel className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{vehicles.length}</p>
                    <p className="text-xs text-gray-600">Total flotte</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vehicles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Véhicules</CardTitle>
              <CardDescription>
                {loading ? 'Chargement...' : `${vehicles.length} véhicule(s) dans la flotte`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Véhicule</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Immatriculation</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Capacité</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Carburant</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Localisation</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Kilométrage</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Bus className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{vehicle.model}</p>
                                <p className="text-xs text-gray-500">{vehicle.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium">{vehicle.plate}</td>
                          <td className="py-3 px-4 text-gray-600">{vehicle.capacity} places</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    vehicle.fuel > 50 ? 'bg-green-500' :
                                    vehicle.fuel > 25 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${vehicle.fuel}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-medium ${getFuelStatus(vehicle.fuel)}`}>
                                {vehicle.fuel}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(vehicle.status)}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{vehicle.location}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm font-medium">{vehicle.mileage.toLocaleString()} km</p>
                              <p className="text-xs text-gray-500">
                                Maintenance: {vehicle.lastMaintenance}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Button size="sm" variant="ghost" className="p-2">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}