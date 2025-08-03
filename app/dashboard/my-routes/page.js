'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { MapPin, Calendar, Clock, Navigation, Car, AlertTriangle, CheckCircle } from 'lucide-react'

const mockDriverRoutes = [
  {
    id: 'RT-001',
    route: 'Lyon → Marseille',
    date: '2025-07-25',
    departure: '14:30',
    arrival: '18:00',
    vehicle: 'Mercedes Travego (AB-123-CD)',
    passengers: 45,
    status: 'confirmed',
    distance: '315 km',
    stops: ['Lyon Perrache', 'Valence', 'Avignon', 'Marseille St-Charles']
  },
  {
    id: 'RT-002',
    route: 'Marseille → Nice',
    date: '2025-07-26',
    departure: '09:00',
    arrival: '11:30',
    vehicle: 'Mercedes Travego (AB-123-CD)',
    passengers: 38,
    status: 'confirmed',
    distance: '200 km',
    stops: ['Marseille St-Charles', 'Toulon', 'Cannes', 'Nice Ville']
  },
  {
    id: 'RT-003',
    route: 'Nice → Cannes',
    date: '2025-07-26',
    departure: '15:00',
    arrival: '16:00',
    vehicle: 'Mercedes Travego (AB-123-CD)',
    passengers: 25,
    status: 'pending',
    distance: '35 km',
    stops: ['Nice Ville', 'Antibes', 'Cannes']
  },
  {
    id: 'RT-004',
    route: 'Paris → Lyon',
    date: '2025-07-23',
    departure: '08:00',
    arrival: '12:30',
    vehicle: 'Mercedes Travego (AB-123-CD)',
    passengers: 49,
    status: 'completed',
    distance: '465 km',
    stops: ['Paris Bercy', 'Auxerre', 'Chalon-sur-Saône', 'Lyon Perrache']
  }
]

export default function MyRoutesPage() {
  const { user, updateActivity } = useAuthStore()
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updateActivity()
    
    // Simulate loading driver's routes
    const timer = setTimeout(() => {
      setRoutes(mockDriverRoutes)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [updateActivity])

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmé</Badge>
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">En attente</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Terminé</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>
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
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const upcomingRoutes = routes.filter(r => ['confirmed', 'pending'].includes(r.status))
  const completedRoutes = routes.filter(r => ['completed'].includes(r.status))

  return (
    <RoleGuard allowedRoles={['4']} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MapPin className="mr-3 h-6 w-6 text-green-600" />
                Mes Trajets
              </h1>
              <p className="text-gray-600">
                Bonjour {user?.first_name}, voici vos trajets assignés
              </p>
            </div>
            <Button variant="outline">
              <Navigation className="mr-2 h-4 w-4" />
              Itinéraire GPS
            </Button>
          </div>

          {/* Route Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{upcomingRoutes.length}</p>
                    <p className="text-xs text-gray-600">Trajets à venir</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{completedRoutes.length}</p>
                    <p className="text-xs text-gray-600">Trajets terminés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Car className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">Mercedes Travego</p>
                    <p className="text-xs text-gray-600">Véhicule assigné</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Routes */}
          {upcomingRoutes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="mr-2 h-5 w-5 text-green-600" />
                  Trajets à Venir
                </CardTitle>
                <CardDescription>Vos prochains trajets planifiés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingRoutes.map((route) => (
                    <div key={route.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(route.status)}
                          <div>
                            <h3 className="font-semibold text-lg">{route.route}</h3>
                            <p className="text-sm text-gray-600">
                              {route.date} • {route.departure} - {route.arrival} • {route.distance}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(route.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Véhicule</p>
                          <p className="text-gray-600">{route.vehicle}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Passagers</p>
                          <p className="text-gray-600">{route.passengers} personnes</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Arrêts</p>
                          <p className="text-gray-600">{route.stops.length} arrêts</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="font-medium text-sm text-gray-700 mb-1">Itinéraire détaillé:</p>
                        <div className="flex flex-wrap gap-2">
                          {route.stops.map((stop, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs rounded-md"
                            >
                              {index > 0 && <span className="mr-1">→</span>}
                              {stop}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <Button size="sm" variant="outline">
                          Voir détails
                        </Button>
                        <Button size="sm" variant="outline">
                          <Navigation className="mr-1 h-3 w-3" />
                          GPS
                        </Button>
                        {route.status === 'pending' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            Accepter
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Routes */}
          {completedRoutes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
                  Trajets Récents Terminés
                </CardTitle>
                <CardDescription>Historique de vos trajets récents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedRoutes.map((route) => (
                    <div key={route.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(route.status)}
                        <div>
                          <p className="font-medium">{route.route}</p>
                          <p className="text-sm text-gray-600">
                            {route.date} • {route.departure} - {route.arrival} • {route.passengers} passagers
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(route.status)}
                        <p className="text-xs text-gray-500 mt-1">{route.distance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {routes.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center p-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun trajet assigné</h3>
                <p className="text-gray-600">
                  Vous n'avez actuellement aucun trajet assigné. Contactez votre dispatcher pour plus d'informations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}