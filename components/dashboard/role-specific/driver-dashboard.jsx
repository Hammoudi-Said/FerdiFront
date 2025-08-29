'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { hasPermission, PERMISSIONS } from '@/lib/utils/permission-manager'
import { 
  Car, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Route,
  Fuel,
  User,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

/**
 * 🚗 DRIVER DASHBOARD - Vue limitée aux missions assignées
 * Conforme OpenAPI - DRIVER accès aux missions assignées uniquement
 */
export function DriverDashboard() {
  const { user, company } = useAuthStore()
  const [missions, setMissions] = useState({
    today: [],
    upcoming: [],
    completed: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDriverData()
  }, [])

  const loadDriverData = async () => {
    try {
      // Simuler le chargement des missions du chauffeur
      // En réalité, cela viendrait de l'API
      setMissions({
        today: [
          {
            id: 1,
            departure: 'Paris Gare du Nord',
            destination: 'Lyon Part-Dieu', 
            departureTime: '08:30',
            arrivalTime: '12:00',
            status: 'EN_COURS',
            vehicle: 'Bus Mercedes n°12',
            passengers: 45
          }
        ],
        upcoming: [
          {
            id: 2,
            departure: 'Lyon Part-Dieu',
            destination: 'Paris Gare du Nord',
            departureTime: '15:30',
            arrivalTime: '19:00', 
            status: 'PLANIFIEE',
            vehicle: 'Bus Mercedes n°12',
            passengers: 38
          }
        ],
        completed: 12
      })
    } catch (error) {
      console.error('Erreur chargement dashboard chauffeur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!hasPermission(user?.role, PERMISSIONS.ROUTES_READ_ASSIGNED)) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-semibold">Accès non autorisé</h3>
        <p className="text-muted-foreground">Cette page est réservée aux chauffeurs.</p>
      </div>
    )
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'EN_COURS':
        return <Badge className="bg-green-500">En cours</Badge>
      case 'PLANIFIEE':
        return <Badge variant="outline">Planifiée</Badge>
      case 'TERMINEE':
        return <Badge className="bg-blue-500">Terminée</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes missions</h1>
        <p className="text-muted-foreground">
          Bonjour {user?.first_name} • {company?.name}
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missions.today.length}</div>
            <p className="text-xs text-muted-foreground">mission(s) prévue(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À venir</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missions.upcoming.length}</div>
            <p className="text-xs text-muted-foreground">mission(s) planifiée(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missions.completed}</div>
            <p className="text-xs text-muted-foreground">mission(s) terminée(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">ponctualité</p>
          </CardContent>
        </Card>
      </div>

      {/* Missions du jour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Mes missions d'aujourd'hui
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {missions.today.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">Aucune mission aujourd'hui</h3>
              <p className="text-muted-foreground">Profitez de votre journée de repos!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {missions.today.map((mission) => (
                <div key={mission.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(mission.status)}
                        <span className="text-sm text-muted-foreground">#{mission.id}</span>
                      </div>
                      
                      <div className="grid gap-2 md:grid-cols-2">
                        <div>
                          <p className="font-medium text-sm">Départ</p>
                          <p className="text-sm">{mission.departure}</p>
                          <p className="text-xs text-muted-foreground">à {mission.departureTime}</p>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Arrivée</p>
                          <p className="text-sm">{mission.destination}</p>
                          <p className="text-xs text-muted-foreground">à {mission.arrivalTime}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Car className="mr-1 h-4 w-4" />
                          {mission.vehicle}
                        </div>
                        <div className="flex items-center">
                          <User className="mr-1 h-4 w-4" />
                          {mission.passengers} passagers
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button size="sm">
                        <Route className="mr-2 h-4 w-4" />
                        Itinéraire
                      </Button>
                      {mission.status === 'EN_COURS' && (
                        <Button size="sm" variant="outline">
                          Signaler un problème
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prochaines missions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Prochaines missions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {missions.upcoming.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Aucune mission planifiée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {missions.upcoming.map((mission) => (
                <div key={mission.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(mission.status)}
                      <span className="font-medium">{mission.departure} → {mission.destination}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {mission.departureTime} - {mission.arrivalTime} • {mission.vehicle}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Détails
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Link href="/dashboard/my-schedule" className="w-full">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Mon planning complet
            </Button>
          </Link>

          <Link href="/dashboard/profile" className="w-full">
            <Button variant="outline" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Mon profil
            </Button>
          </Link>

          <Button variant="outline" className="w-full justify-start">
            <Fuel className="mr-2 h-4 w-4" />
            Signaler consommation
          </Button>

          <Link href="/dashboard/support" className="w-full">
            <Button variant="outline" className="w-full justify-start">
              <AlertCircle className="mr-2 h-4 w-4" />
              Assistance
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}