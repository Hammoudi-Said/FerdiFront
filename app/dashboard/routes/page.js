'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Plus, Navigation, Clock } from 'lucide-react'

export default function RoutesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <MapPin className="mr-3 h-8 w-8" />
              Gestion des trajets
            </h1>
            <p className="text-muted-foreground">
              Planifiez et suivez vos trajets
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau trajet
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Fonctionnalité en développement</CardTitle>
            <CardDescription>
              La gestion des trajets sera bientôt disponible
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
              <div className="p-4">
                <Navigation className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Itinéraires</h3>
                <p className="text-sm text-muted-foreground">Planification des parcours</p>
              </div>
              <div className="p-4">
                <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Horaires</h3>
                <p className="text-sm text-muted-foreground">Gestion des créneaux</p>
              </div>
              <div className="p-4">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Suivi</h3>
                <p className="text-sm text-muted-foreground">Suivi en temps réel</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}