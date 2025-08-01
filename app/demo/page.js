'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MOCK_DATA } from '@/lib/mock-data'
import { 
  Bus, 
  Users, 
  Building2, 
  TestTube, 
  ArrowRight,
  CheckCircle,
  Key,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-primary p-3 rounded-full mr-3">
              <Bus className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">FERDI</h1>
              <p className="text-gray-600">Mode Démonstration</p>
            </div>
          </div>
          
          <Badge variant="outline" className="mb-4">
            <TestTube className="mr-2 h-4 w-4" />
            Données factices pour test
          </Badge>
          
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Explorez l'application FERDI avec des données de démonstration. 
            Vous pouvez tester toutes les fonctionnalités sans affecter de vraies données.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Entreprise de démonstration
              </CardTitle>
              <CardDescription>
                Informations de l'entreprise exemple
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <strong className="w-20">Nom:</strong>
                  <span>{MOCK_DATA.company.name}</span>
                </div>
                <div className="flex items-center text-sm">
                  <strong className="w-20">Code:</strong>
                  <span className="font-mono bg-muted px-2 py-1 rounded">
                    {MOCK_DATA.company.company_code}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{MOCK_DATA.company.address}, {MOCK_DATA.company.city}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-3 w-3 mr-1" />
                  <span>{MOCK_DATA.company.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-3 w-3 mr-1" />
                  <span>{MOCK_DATA.company.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Utilisateurs de test
              </CardTitle>
              <CardDescription>
                Comptes disponibles pour la démonstration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(MOCK_DATA.testCredentials).map(([role, creds]) => (
                  <div key={role} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={role === 'manager' ? 'default' : 'secondary'}>
                        {role === 'manager' ? 'Administrateur' : 
                         role === 'dispatcher' ? 'Autocariste' : 'Chauffeur'}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Email:</strong> {creds.email}</div>
                      <div><strong>Mot de passe:</strong> <code className="bg-background px-1 rounded">{creds.password}</code></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features Available */}
          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités disponibles</CardTitle>
              <CardDescription>
                Ce que vous pouvez tester en mode démo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  'Connexion avec différents rôles',
                  'Tableau de bord adaptatif',
                  'Gestion des utilisateurs (admin)',
                  'Informations de l\'entreprise',
                  'Navigation basée sur les permissions',
                  'Interface responsive',
                  'Thème sombre/clair',
                  'Enregistrement d\'entreprise',
                  'Inscription d\'employés',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Démarrage rapide
              </CardTitle>
              <CardDescription>
                Commencez à explorer l'application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-1">Pour tester en tant qu'admin:</h4>
                  <p className="text-sm text-blue-700">
                    Utilisez <code>manager@transport-bretagne.fr</code> avec le mot de passe fourni
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-1">Pour tester l'inscription:</h4>
                  <p className="text-sm text-green-700">
                    Utilisez le code entreprise <code>BRE-12345-ABC</code>
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex flex-col space-y-2">
                <Link href="/auth/login">
                  <Button className="w-full">
                    Connexion
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                
                <Link href="/auth/register-company">
                  <Button variant="outline" className="w-full">
                    Créer une entreprise
                  </Button>
                </Link>
                
                <Link href="/auth/register-user">
                  <Button variant="outline" className="w-full">
                    Rejoindre une entreprise
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notice */}
        <Card className="max-w-4xl mx-auto mt-8 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <TestTube className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900">Mode Démonstration Actif</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Cette version utilise des données factices. Pour connecter l'application à votre backend FastAPI, 
                  modifiez la variable <code>NEXT_PUBLIC_USE_MOCK_DATA</code> dans votre fichier <code>.env.local</code> 
                  et configurez l'URL de votre backend dans <code>NEXT_PUBLIC_BASE_URL</code>.
                </p>
                <p className="text-sm text-yellow-800 mt-2">
                  Consultez le fichier <code>README.md</code> pour les instructions de configuration complètes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}