'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Calendar, Plus, Clock, MapPin, Users } from 'lucide-react'

export default function PlanningPage() {
  const { user } = useAuthStore()

  // Check permissions
  if (!['1', '2', '3', '4'].includes(user?.role)) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Card className="w-96">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Vous n'avez pas les permissions pour accéder à cette page.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Different access levels based on role
  const isDriver = user?.role === '4'
  const title = isDriver ? 'Mon Planning' : 'Planning général'
  const description = isDriver ? 
    'Consultez vos trajets et horaires assignés' : 
    'Planification et organisation des trajets'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Calendar className="mr-3 h-8 w-8 text-blue-600" />
              {title}
            </h1>
            <p className="text-muted-foreground">
              {description}
            </p>
          </div>
          {!isDriver && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau planning
            </Button>
          )}
        </div>

        {/* Coming Soon Card */}
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Fonctionnalité en développement</CardTitle>
            <CardDescription>
              {isDriver ? 
                'La consultation de votre planning sera bientôt disponible' :
                'La gestion du planning sera bientôt disponible'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
              <div className="p-4">
                <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Horaires</h3>
                <p className="text-sm text-muted-foreground">
                  {isDriver ? 'Vos créneaux horaires' : 'Gestion des créneaux'}
                </p>
              </div>
              <div className="p-4">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Trajets</h3>
                <p className="text-sm text-muted-foreground">
                  {isDriver ? 'Vos missions assignées' : 'Organisation des trajets'}
                </p>
              </div>
              <div className="p-4">
                <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Équipes</h3>
                <p className="text-sm text-muted-foreground">
                  {isDriver ? 'Informations équipe' : 'Assignation des équipes'}
                </p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg max-w-md mx-auto">
              <h4 className="font-semibold mb-2">Fonctionnalités prévues :</h4>
              <ul className="text-sm text-left space-y-1">
                {isDriver ? (
                  <>
                    <li>• Consultation de vos trajets</li>
                    <li>• Horaires détaillés</li>
                    <li>• Informations passagers</li>
                    <li>• Itinéraires optimisés</li>
                    <li>• Notifications de changements</li>
                  </>
                ) : (
                  <>
                    <li>• Planification des trajets</li>
                    <li>• Assignation des chauffeurs</li>
                    <li>• Gestion des conflits d'horaires</li>
                    <li>• Optimisation des parcours</li>
                    <li>• Rapports de planification</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}