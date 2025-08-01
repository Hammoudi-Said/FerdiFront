'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Bus, Plus, Wrench, Calendar, MapPin } from 'lucide-react'

export default function FleetPage() {
  const { user } = useAuthStore()

  // Check permissions
  if (user?.role === '4') {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Bus className="mr-3 h-8 w-8" />
              Gestion de flotte
            </h1>
            <p className="text-muted-foreground">
              Gérez vos autocars et leur maintenance
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un véhicule
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Fonctionnalité en développement</CardTitle>
            <CardDescription>
              La gestion de flotte sera bientôt disponible
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
              <div className="p-4">
                <Bus className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Véhicules</h3>
                <p className="text-sm text-muted-foreground">Inventaire complet de votre flotte</p>
              </div>
              <div className="p-4">
                <Wrench className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Maintenance</h3>
                <p className="text-sm text-muted-foreground">Suivi des réparations et entretiens</p>
              </div>
              <div className="p-4">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Planning</h3>
                <p className="text-sm text-muted-foreground">Planification des services</p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg max-w-md mx-auto">
              <h4 className="font-semibold mb-2">Fonctionnalités prévues :</h4>
              <ul className="text-sm text-left space-y-1">
                <li>• Ajout et modification de véhicules</li>
                <li>• Suivi de la maintenance</li>
                <li>• Gestion des documents (assurance, contrôle technique)</li>
                <li>• Planification des trajets</li>
                <li>• Rapports d'activité</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}