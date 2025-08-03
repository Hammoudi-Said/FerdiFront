'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Calendar,
  Bus,
  UserCheck,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Route,
  Navigation
} from 'lucide-react'

const mockDispatchStats = {
  todayTrips: 8,
  plannedTrips: 15,
  availableDrivers: 5,
  availableVehicles: 7,
  activeTrips: [
    {
      id: 'TRP-001',
      route: 'Paris → Lyon',
      driver: 'Jean Dupont',
      vehicle: 'Mercedes Travego (AB-123-CD)',
      departure: '09:00',
      arrival: '13:30',
      status: 'en_cours',
      progress: 65
    },
    {
      id: 'TRP-002',
      route: 'Lyon → Marseille',
      driver: 'Sophie Martin',
      vehicle: 'Setra S515HD (EF-456-GH)',
      departure: '10:30',
      arrival: '14:00',
      status: 'en_cours',
      progress: 40
    },
    {
      id: 'TRP-003',
      route: 'Nice → Cannes',
      driver: 'Pierre Morel',
      vehicle: 'Volvo 9700 (IJ-789-KL)',
      departure: '11:00',
      arrival: '12:00',
      status: 'termine',
      progress: 100
    }
  ],
  upcomingAssignments: [
    {
      id: 'ASS-001',
      route: 'Toulouse → Bordeaux',
      scheduledTime: '15:00',
      duration: '3h30',
      driver: null,
      vehicle: null,
      priority: 'high'
    },
    {
      id: 'ASS-002',
      route: 'Strasbourg → Nancy',
      scheduledTime: '16:30',
      duration: '2h15',
      driver: 'Claire Durand',
      vehicle: null,
      priority: 'medium'
    }
  ],
  availableResources: {
    drivers: [
      { name: 'Thomas Lefèvre', status: 'disponible', location: 'Dépôt Lyon' },
      { name: 'Marie Dubois', status: 'disponible', location: 'Dépôt Paris' },
      { name: 'Yacine Bernard', status: 'repos', location: 'Dépôt Marseille' }
    ],
    vehicles: [
      { name: 'Ford Transit (MN-012-OP)', status: 'disponible', location: 'Dépôt Lyon' },
      { name: 'Mercedes Sprinter (QR-345-ST)', status: 'disponible', location: 'Dépôt Paris' },
      { name: 'Iveco Daily (UV-678-WX)', status: 'maintenance', location: 'Atelier' }
    ]
  }
}

const getStatusIcon = (status) => {
  switch(status) {
    case 'en_cours':
      return <Navigation className="h-4 w-4 text-blue-600" />
    case 'termine':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'retard':
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

const getStatusBadge = (status) => {
  switch(status) {
    case 'en_cours':
      return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
    case 'termine':
      return <Badge className="bg-green-100 text-green-800">Terminé</Badge>
    case 'retard':
      return <Badge className="bg-red-100 text-red-800">Retard</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const getPriorityBadge = (priority) => {
  switch(priority) {
    case 'high':
      return <Badge className="bg-red-100 text-red-800">Urgent</Badge>
    case 'medium':
      return <Badge className="bg-orange-100 text-orange-800">Normal</Badge>
    case 'low':
      return <Badge className="bg-green-100 text-green-800">Faible</Badge>
    default:
      return <Badge variant="secondary">{priority}</Badge>
  }
}

export function DispatcherDashboard() {
  const { updateActivity } = useAuthStore()
  const [stats, setStats] = useState(mockDispatchStats)
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
            <Route className="mr-3 h-6 w-6 text-blue-600" />
            Centre de Dispatching
          </h1>
          <p className="text-gray-600">Gestion des trajets, planning et affectations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            Carte
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau trajet
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
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
                <p className="text-2xl font-bold">{stats.plannedTrips}</p>
                <p className="text-xs text-gray-600">Trajets planifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.availableDrivers}</p>
                <p className="text-xs text-gray-600">Chauffeurs disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.availableVehicles}</p>
                <p className="text-xs text-gray-600">Véhicules disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Trips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Trajets en Cours</CardTitle>
            <CardDescription>Suivi temps réel des missions actives</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.activeTrips.map((trip) => (
              <div key={trip.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(trip.status)}
                    <div>
                      <h3 className="font-medium">{trip.route}</h3>
                      <p className="text-sm text-gray-600">
                        {trip.driver} • {trip.vehicle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(trip.status)}
                    <span className="text-xs text-gray-500">
                      {trip.departure} - {trip.arrival}
                    </span>
                  </div>
                </div>
                
                {/* Progress bar for active trips */}
                {trip.status === 'en_cours' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progression</span>
                      <span>{trip.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${trip.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Assignments & Resources */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Assignments to Complete */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
              Affectations en Attente
            </CardTitle>
            <CardDescription>Trajets nécessitant une assignation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{assignment.route}</h4>
                      <p className="text-sm text-gray-600">
                        {assignment.scheduledTime} • {assignment.duration}
                      </p>
                    </div>
                    {getPriorityBadge(assignment.priority)}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <p className={assignment.driver ? 'text-green-600' : 'text-red-600'}>
                        Chauffeur: {assignment.driver || 'Non assigné'}
                      </p>
                      <p className={assignment.vehicle ? 'text-green-600' : 'text-red-600'}>
                        Véhicule: {assignment.vehicle || 'Non assigné'}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Assigner
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
              Ressources Disponibles
            </CardTitle>
            <CardDescription>Chauffeurs et véhicules libres</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Available Drivers */}
              <div>
                <h4 className="font-medium text-sm mb-2">Chauffeurs</h4>
                <div className="space-y-2">
                  {stats.availableResources.drivers.slice(0, 3).map((driver, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{driver.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{driver.location}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Vehicles */}
              <div>
                <h4 className="font-medium text-sm mb-2">Véhicules</h4>
                <div className="space-y-2">
                  {stats.availableResources.vehicles.slice(0, 3).map((vehicle, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          vehicle.status === 'disponible' ? 'bg-green-500' : 
                          vehicle.status === 'maintenance' ? 'bg-orange-500' : 'bg-red-500'
                        }`}></div>
                        <span>{vehicle.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{vehicle.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}