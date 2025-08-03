'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Car, 
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Fuel,
  Settings,
  Phone
} from 'lucide-react'

const mockDriverStats = {
  todayTrips: 2,
  weekTrips: 8,
  totalKm: 1240,
  nextTrip: {
    id: 'TRP-001',
    route: 'Lyon → Marseille',
    departure: '14:30',
    arrival: '18:00',
    vehicle: 'Mercedes Travego (AB-123-CD)',
    passengers: 45,
    status: 'confirmed'
  },
  currentWeekSchedule: [
    {
      date: '2025-07-25',
      day: 'Ven',
      trips: [
        {
          id: 'TRP-001',
          route: 'Lyon → Marseille',
          time: '14:30 - 18:00',
          status: 'confirmed',
          vehicle: 'Mercedes Travego'
        }
      ]
    },
    {
      date: '2025-07-26',
      day: 'Sam', 
      trips: [
        {
          id: 'TRP-002',
          route: 'Marseille → Nice',
          time: '09:00 - 11:30',
          status: 'confirmed',
          vehicle: 'Mercedes Travego'
        },
        {
          id: 'TRP-003',
          route: 'Nice → Cannes',
          time: '15:00 - 16:00',
          status: 'pending',
          vehicle: 'Mercedes Travego'
        }
      ]
    },
    {
      date: '2025-07-27',
      day: 'Dim',
      trips: []
    }
  ],
  vehicleInfo: {
    model: 'Mercedes Travego',
    plate: 'AB-123-CD',
    fuel: 75,
    maintenance: 'OK',
    lastCheck: '20/07/2025'
  },
  recentTrips: [
    {
      id: 'TRP-098',
      route: 'Paris → Lyon',
      date: '23/07/2025',
      duration: '4h30',
      km: 465,
      status: 'completed'
    },
    {
      id: 'TRP-097',
      route: 'Lyon → Grenoble',
      date: '22/07/2025', 
      duration: '2h15',
      km: 180,
      status: 'completed'
    }
  ]
}

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
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-600" />
  }
}

export function DriverDashboard() {
  const { user, updateActivity } = useAuthStore()
  const [stats, setStats] = useState(mockDriverStats)
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
            <Car className="mr-3 h-6 w-6 text-green-600" />
            Bonjour {user?.first_name}
          </h1>
          <p className="text-gray-600">Vos trajets et planning personnel</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Phone className="mr-2 h-4 w-4" />
            Support
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Profil
          </Button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.todayTrips}</p>
                <p className="text-xs text-gray-600">Trajets aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.weekTrips}</p>
                <p className="text-xs text-gray-600">Cette semaine</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Navigation className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.totalKm}</p>
                <p className="text-xs text-gray-600">Km ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Fuel className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.vehicleInfo.fuel}%</p>
                <p className="text-xs text-gray-600">Carburant véhicule</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Trip Alert */}
      {stats.nextTrip && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Navigation className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Prochain trajet</h3>
                  <p className="text-lg font-bold text-blue-800">{stats.nextTrip.route}</p>
                  <p className="text-sm text-blue-700">
                    {stats.nextTrip.departure} - {stats.nextTrip.arrival} • {stats.nextTrip.vehicle}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(stats.nextTrip.status)}
                <p className="text-sm text-blue-700 mt-1">
                  {stats.nextTrip.passengers} passagers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule & Vehicle Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* This Week Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Planning de la Semaine
            </CardTitle>
            <CardDescription>Vos trajets programmés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.currentWeekSchedule.map((day) => (
                <div key={day.date} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{day.day} {day.date.split('-')[2]}/{day.date.split('-')[1]}</p>
                    </div>
                    <Badge variant="outline">
                      {day.trips.length} trajet{day.trips.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  {day.trips.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Jour de repos</p>
                  ) : (
                    <div className="space-y-2">
                      {day.trips.map((trip) => (
                        <div key={trip.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(trip.status)}
                            <div>
                              <p className="font-medium">{trip.route}</p>
                              <p className="text-xs text-gray-600">{trip.time}</p>
                            </div>
                          </div>
                          {getStatusBadge(trip.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5 text-green-600" />
              Véhicule Assigné
            </CardTitle>
            <CardDescription>Informations de votre véhicule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Vehicle Details */}
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900">{stats.vehicleInfo.model}</h3>
                  <p className="text-green-700">{stats.vehicleInfo.plate}</p>
                  <p className="text-xs text-green-600">
                    Maintenance: {stats.vehicleInfo.maintenance} • Dernière vérif: {stats.vehicleInfo.lastCheck}
                  </p>
                </div>
              </div>

              {/* Fuel Level */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Niveau carburant</span>
                  <span className="text-sm text-gray-600">{stats.vehicleInfo.fuel}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      stats.vehicleInfo.fuel > 50 ? 'bg-green-500' :
                      stats.vehicleInfo.fuel > 25 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${stats.vehicleInfo.fuel}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" className="text-xs">
                  Signaler problème
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  Demande maintenance
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
            Trajets Récents
          </CardTitle>
          <CardDescription>Historique de vos derniers trajets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentTrips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(trip.status)}
                  <div>
                    <p className="font-medium">{trip.route}</p>
                    <p className="text-sm text-gray-600">
                      {trip.date} • {trip.duration} • {trip.km} km
                    </p>
                  </div>
                </div>
                {getStatusBadge(trip.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}