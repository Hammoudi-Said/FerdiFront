'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { hasPermission, PERMISSIONS } from '@/lib/utils/permission-manager'
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Route,
  Users,
  Truck,
  Calendar,
  Navigation,
  PlayCircle,
  StopCircle
} from 'lucide-react'
import Link from 'next/link'

/**
 * 📋 DISPATCH DASHBOARD - Gestion des opérations et planning
 * Conforme OpenAPI - DISPATCH accès aux routes et affectations
 */
export function DispatchDashboard() {
  const { user, company } = useAuthStore()
  const [operations, setOperations] = useState({
    activeRoutes: [],
    pendingAssignments: [],
    availableDrivers: [],
    alerts: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDispatchData()
  }, [])

  const loadDispatchData = async () => {
    try {
      // Simuler le chargement des données de dispatch
      setOperations({
        activeRoutes: [
          {
            id: 1,
            name: 'Paris-Lyon Express',
            driver: 'Pierre Bernard',
            vehicle: 'Bus Mercedes n°12',
            status: 'EN_COURS',
            progress: 65,
            eta: '12:30',
            passengers: 45,
            alerts: 0
          },
          {
            id: 2,
            name: 'Marseille-Nice Côte',
            driver: 'Marie Dubois',
            vehicle: 'Bus Volvo n°08',
            status: 'EN_RETARD',
            progress: 40,
            eta: '14:15',
            passengers: 32,
            alerts: 1
          }
        ],
        pendingAssignments: [
          {
            id: 3,
            departure: 'Bordeaux Gare',
            destination: 'Toulouse Matabiau',
            departureTime: '16:00',
            requiredDriver: true,
            urgency: 'high'
          }
        ],
        availableDrivers: [
          { id: 'driver-001', name: 'Jean Martin', status: 'available', location: 'Paris' },
          { id: 'driver-002', name: 'Sophie Leroy', status: 'available', location: 'Lyon' }
        ],
        alerts: [
          { id: 1, type: 'delay', message: 'Route Marseille-Nice en retard de 25 min' },
          { id: 2, type: 'maintenance', message: 'Bus n°15 nécessite inspection' }
        ]
      })
    } catch (error) {
      console.error('Erreur chargement dashboard dispatch:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!hasPermission(user?.role, PERMISSIONS.ROUTES_WRITE)) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-semibold">Accès non autorisé</h3>
        <p className="text-muted-foreground">Cette page est réservée aux dispatcheurs.</p>
      </div>
    )
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'EN_COURS':
        return <Badge className="bg-green-500">En cours</Badge>
      case 'EN_RETARD':
        return <Badge className="bg-red-500">En retard</Badge>
      case 'PLANIFIEE':
        return <Badge variant="outline">Planifiée</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Centre de dispatch</h1>
        <p className="text-muted-foreground">
          Bonjour {user?.first_name} • Gestion opérationnelle • {company?.name}
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Routes actives</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operations.activeRoutes.length}</div>
            <p className="text-xs text-muted-foreground">en cours d'exécution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chauffeurs disponibles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operations.availableDrivers.length}</div>
            <p className="text-xs text-muted-foreground">prêts pour affectation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affectations en attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operations.pendingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">nécessitent attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{operations.alerts.length}</div>
            <p className="text-xs text-muted-foreground">nécessitent action</p>
          </CardContent>
        </Card>
      </div>

      {/* Routes actives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="mr-2 h-5 w-5" />
            Routes en cours
          </CardTitle>
          <CardDescription>Suivi temps réel des missions en cours</CardDescription>
        </CardHeader>
        <CardContent>
          {operations.activeRoutes.length === 0 ? (
            <div className="text-center py-8">
              <Route className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">Aucune route active</h3>
              <p className="text-muted-foreground">Toutes les missions sont terminées</p>
            </div>
          ) : (
            <div className="space-y-4">
              {operations.activeRoutes.map((route) => (
                <div key={route.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(route.status)}
                        <span className="font-medium">{route.name}</span>
                        {route.alerts > 0 && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      
                      <div className="grid gap-2 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium">Chauffeur</p>
                          <p className="text-sm">{route.driver}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Véhicule</p>
                          <p className="text-sm">{route.vehicle}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {route.passengers} passagers
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          ETA: {route.eta}
                        </div>
                      </div>

                      {/* Barre de progression */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${route.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">{route.progress}% du trajet</p>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button size="sm">
                        <MapPin className="mr-2 h-4 w-4" />
                        Localiser
                      </Button>
                      <Button size="sm" variant="outline">
                        Contacter
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Affectations en attente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Affectations en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {operations.pendingAssignments.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                <p className="mt-2 text-muted-foreground">Toutes les missions sont affectées</p>
              </div>
            ) : (
              <div className="space-y-3">
                {operations.pendingAssignments.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{assignment.departure} → {assignment.destination}</p>
                        <p className="text-sm text-muted-foreground">Départ: {assignment.departureTime}</p>
                        {assignment.urgency === 'high' && (
                          <Badge className="bg-red-500 mt-1">Urgent</Badge>
                        )}
                      </div>
                      <Button size="sm">
                        Affecter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chauffeurs disponibles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Chauffeurs disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {operations.availableDrivers.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-muted-foreground">Position: {driver.location}</p>
                  </div>
                  <Badge className="bg-green-500">Disponible</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Link href="/dashboard/planning" className="w-full">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Planning complet
            </Button>
          </Link>

          <Link href="/dashboard/routes" className="w-full">
            <Button variant="outline" className="w-full justify-start">
              <Route className="mr-2 h-4 w-4" />
              Gérer les routes
            </Button>
          </Link>

          <Link href="/dashboard/fleet" className="w-full">
            <Button variant="outline" className="w-full justify-start">
              <Truck className="mr-2 h-4 w-4" />
              État de la flotte
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}