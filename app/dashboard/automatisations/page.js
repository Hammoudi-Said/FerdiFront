'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Zap, Plus, Settings, Clock, CheckCircle } from 'lucide-react'

export default function AutomationsPage() {
  const { user } = useAuthStore()

  // Check permissions
  if (!['1', '2'].includes(user?.role)) {
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
              <Zap className="mr-3 h-8 w-8 text-blue-600" />
              Automatisations
            </h1>
            <p className="text-muted-foreground">
              Processus automatisés pour optimiser vos opérations
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle automatisation
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Fonctionnalité en développement</CardTitle>
            <CardDescription>
              Les automatisations seront bientôt disponibles
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
              <div className="p-4">
                <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Planification automatique</h3>
                <p className="text-sm text-muted-foreground">Gestion automatisée des horaires</p>
              </div>
              <div className="p-4">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Validation automatique</h3>
                <p className="text-sm text-muted-foreground">Contrôles et validations automatiques</p>
              </div>
              <div className="p-4">
                <Settings className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Configuration</h3>
                <p className="text-sm text-muted-foreground">Paramétrage des règles</p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg max-w-md mx-auto">
              <h4 className="font-semibold mb-2">Fonctionnalités prévues :</h4>
              <ul className="text-sm text-left space-y-1">
                <li>• Planification automatique des trajets</li>
                <li>• Assignation automatique des chauffeurs</li>
                <li>• Notifications automatiques</li>
                <li>• Rapports périodiques automatisés</li>
                <li>• Intégrations avec systèmes externes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}