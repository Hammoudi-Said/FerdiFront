'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import { HandHeart, Plus, Users, FileText, Star } from 'lucide-react'

export default function SubcontractorsPage() {
  const { user } = useAuthStore()

  // Check permissions
  if (!['1', '2', '3'].includes(user?.role)) {
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
              <HandHeart className="mr-3 h-8 w-8 text-green-600" />
              Sous traitants
            </h1>
            <p className="text-muted-foreground">
              Gestion de vos partenaires externes et sous-traitants
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un sous-traitant
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Fonctionnalité en développement</CardTitle>
            <CardDescription>
              La gestion des sous-traitants sera bientôt disponible
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
              <div className="p-4">
                <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Partenaires</h3>
                <p className="text-sm text-muted-foreground">Base de données des sous-traitants</p>
              </div>
              <div className="p-4">
                <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Contrats</h3>
                <p className="text-sm text-muted-foreground">Gestion des accords et tarifs</p>
              </div>
              <div className="p-4">
                <Star className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Évaluations</h3>
                <p className="text-sm text-muted-foreground">Suivi des performances</p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg max-w-md mx-auto">
              <h4 className="font-semibold mb-2">Fonctionnalités prévues :</h4>
              <ul className="text-sm text-left space-y-1">
                <li>• Répertoire des sous-traitants</li>
                <li>• Gestion des contrats et tarifs</li>
                <li>• Assignation de trajets externes</li>
                <li>• Suivi des performances</li>
                <li>• Gestion des paiements</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}