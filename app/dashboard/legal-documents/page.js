'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import { FileCheck, Plus, Shield, Calendar, AlertTriangle } from 'lucide-react'

export default function LegalDocumentsPage() {
  const { user } = useAuthStore()

  // Check permissions
  if (!['1', '2', '6'].includes(user?.role)) {
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
              <FileCheck className="mr-3 h-8 w-8 text-purple-600" />
              Documents légaux
            </h1>
            <p className="text-muted-foreground">
              Conformité légale et gestion documentaire
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un document
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Fonctionnalité en développement</CardTitle>
            <CardDescription>
              La gestion des documents légaux sera bientôt disponible
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
              <div className="p-4">
                <Shield className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Conformité</h3>
                <p className="text-sm text-muted-foreground">Respect des réglementations</p>
              </div>
              <div className="p-4">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Échéances</h3>
                <p className="text-sm text-muted-foreground">Suivi des dates limites</p>
              </div>
              <div className="p-4">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Alertes</h3>
                <p className="text-sm text-muted-foreground">Notifications d'expiration</p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg max-w-md mx-auto">
              <h4 className="font-semibold mb-2">Fonctionnalités prévues :</h4>
              <ul className="text-sm text-left space-y-1">
                <li>• Certificats d'assurance</li>
                <li>• Contrôles techniques</li>
                <li>• Licences de transport</li>
                <li>• Permis et certifications chauffeurs</li>
                <li>• Alertes d'expiration automatiques</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}