'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { 
  MapPin, 
  Clock, 
  Calendar,
  Navigation,
  CheckCircle,
  AlertCircle,
  Truck,
  Route,
  Shield
} from 'lucide-react'

// Mock data for driver's assigned routes
const mockDriverRoutes = [
  {
    id: 'RT-001',
    departure: 'Paris Gare de Lyon',
    destination: 'Lyon Part-Dieu',
    departure_time: '08:30',
    arrival_time: '11:45',
    date: '2025-07-25',
    vehicle: 'Autocar Mercedes Travego - 1234 AB 75',
    status: 'confirmed',
    passengers: 48,
    distance: '462 km',
    duration: '3h15'
  },
  {
    id: 'RT-002',
    departure: 'Lyon Part-Dieu',
    destination: 'Paris Gare de Lyon',
    departure_time: '16:00',
    arrival_time: '19:15',
    date: '2025-07-25',
    vehicle: 'Autocar Mercedes Travego - 1234 AB 75',
    status: 'confirmed',
    passengers: 52,
    distance: '462 km',
    duration: '3h15'
  },
  {
    id: 'RT-003',
    departure: 'Paris Orly',
    destination: 'Marseille Saint-Charles',
    departure_time: '07:00',
    arrival_time: '14:30',
    date: '2025-07-26',
    vehicle: 'Autocar Volvo 9700 - 5678 CD 13',
    status: 'pending',
    passengers: 45,
    distance: '775 km',
    duration: '7h30'
  }
]

export default function MyRoutesPage() {
  const { user, hasPermission, updateActivity, isRestrictedToAssigned } = useAuthStore()
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updateActivity()
    
    // Only drivers should access this page
    if (!isRestrictedToAssigned()) {
      toast.error('Accès refusé', {
        description: 'Cette page est réservée aux chauffeurs'
      })
      return
    }

    // Load driver's assigned routes
    loadMyRoutes()
  }, [updateActivity, isRestrictedToAssigned])

  const loadMyRoutes = async () => {
    setLoading(true)
    try {
      // In real app, this would call API: /api/users/me/routes
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setRoutes(mockDriverRoutes)
    } catch (error) {
      toast.error('Erreur lors du chargement de vos trajets')
    }
    setLoading(false)
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmé</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Terminé</Badge>
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
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const updateRouteStatus = (routeId, newStatus) => {
    setRoutes(prev => prev.map(route => 
      route.id === routeId ? { ...route, status: newStatus } : route
    ))
    toast.success(`Statut du trajet ${routeId} mis à jour`)
  }

  // Check if user is actually a driver
  if (!isRestrictedToAssigned()) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-600">
            Cette page est réservée aux chauffeurs pour consulter leurs trajets assignés.
          </p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-amber-800">
              <strong>Votre rôle :</strong> {user?.role === '1' ? 'Admin Ferdi' : 
                                             user?.role === '2' ? 'Client Admin' :
                                             user?.role === '3' ? 'Dispatcheur' :
                                             user?.role === '5' ? 'Support Interne' :
                                             user?.role === '6' ? 'Comptable' : 'Inconnu'}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Utilisez la section "Trajets" pour gérer tous les trajets.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes trajets assignés</h1>
            <p className="text-gray-600">Vos missions de transport à venir</p>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Navigation className="mr-1 h-3 w-3" />
            Chauffeur
          </Badge>
        </div>

        {/* Driver Info */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">
                  Chauffeur : {user?.full_name || `${user?.first_name} ${user?.last_name}`}
                </p>
                <p className="text-xs text-green-700">
                  Vous avez accès uniquement à vos trajets assignés
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Route className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-800">Trajets assignés</p>
                  <p className="text-2xl font-bold text-blue-900">{routes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-800">Confirmés</p>
                  <p className="text-2xl font-bold text-green-900">
                    {routes.filter(r => r.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-800">En attente</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {routes.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-800">Distance totale</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {routes.reduce((total, route) => total + parseInt(route.distance), 0)} km
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Routes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Vos trajets à venir
            </CardTitle>
            <CardDescription>
              Liste de tous vos trajets assignés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : routes.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun trajet assigné</h3>
                <p className="text-gray-600">Vous n'avez actuellement aucun trajet assigné</p>
              </div>
            ) : (
              <div className="space-y-4">
                {routes.map((route) => (
                  <Card key={route.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-green-600">
                          {getStatusIcon(route.status)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {route.id}
                            </h3>
                            {getStatusBadge(route.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <div className="flex items-center mb-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="font-medium">Départ :</span>
                                <span className="ml-1">{route.departure}</span>
                              </div>
                              <div className="flex items-center mb-1">
                                <Navigation className="h-4 w-4 mr-1" />
                                <span className="font-medium">Arrivée :</span>
                                <span className="ml-1">{route.destination}</span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span className="font-medium">Date :</span>
                                <span className="ml-1">{route.date}</span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center mb-1">
                                <Clock className="h-4 w-4 mr-1" />
                                <span className="font-medium">Horaires :</span>
                                <span className="ml-1">{route.departure_time} - {route.arrival_time}</span>
                              </div>
                              <div className="flex items-center mb-1">
                                <Truck className="h-4 w-4 mr-1" />
                                <span className="font-medium">Véhicule :</span>
                                <span className="ml-1 text-xs">{route.vehicle}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-xs">
                                  <strong>Passagers :</strong> {route.passengers}
                                </span>
                                <span className="text-xs">
                                  <strong>Distance :</strong> {route.distance}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons for driver */}
                      <div className="flex space-x-2">
                        {route.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updateRouteStatus(route.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Confirmer
                          </Button>
                        )}
                        {route.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateRouteStatus(route.id, 'completed')}
                          >
                            Marquer terminé
                          </Button>
                        )}
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