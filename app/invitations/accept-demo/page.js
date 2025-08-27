'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InvitationAcceptForm } from '@/components/invitations/invitation-accept-form'
import { ROLE_DEFINITIONS, UserRole } from '@/lib/constants/enums'
import { 
  ArrowLeft, 
  Mail, 
  Shield,
  Users,
  Truck,
  Calculator,
  HeadphonesIcon,
  Settings
} from 'lucide-react'
import Link from 'next/link'

export default function AcceptInvitationDemoPage() {
  const [selectedRole, setSelectedRole] = useState('DRIVER')
  const [showForm, setShowForm] = useState(false)

  const demoInvitations = [
    {
      role: 'DRIVER',
      email: 'nouveau.chauffeur@transport-bretagne.fr',
      company: 'Transport Bretagne SARL',
      invitedBy: 'Marie Martin (Administrateur)',
      message: 'Bienvenue dans notre équipe de chauffeurs expérimentés !',
      icon: Truck
    },
    {
      role: 'DISPATCH',
      email: 'nouveau.dispatche@transport-bretagne.fr',
      company: 'Transport Bretagne SARL',
      invitedBy: 'Marie Martin (Administrateur)',
      message: 'Rejoignez notre équipe opérationnelle pour la gestion des trajets.',
      icon: Settings
    },
    {
      role: 'ACCOUNTANT',
      email: 'nouveau.comptable@transport-bretagne.fr',
      company: 'Transport Bretagne SARL',
      invitedBy: 'Marie Martin (Administrateur)',
      message: 'Nous avons besoin de vos compétences comptables pour notre croissance.',
      icon: Calculator
    },
    {
      role: 'INTERNAL_SUPPORT',
      email: 'nouveau.support@transport-bretagne.fr',
      company: 'Transport Bretagne SARL',
      invitedBy: 'Marie Martin (Administrateur)',
      message: 'Aidez-nous à offrir un excellent support à nos clients.',
      icon: HeadphonesIcon
    }
  ]

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setShowForm(true)
  }

  const mockToken = `demo-token-${selectedRole.toLowerCase()}-${Date.now()}`

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900">
            FERDI - Démonstration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acceptation d'invitation avec rôle {ROLE_DEFINITIONS[selectedRole]?.label}
          </p>
          
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="text-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Changer de rôle
            </Button>
          </div>
        </div>

        {/* Invitation Accept Form */}
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <InvitationAcceptForm
            token={mockToken}
            onSuccess={(userData) => {
              console.log('User created:', userData)
              alert(`Compte créé avec succès pour ${userData.full_name} avec le rôle ${ROLE_DEFINITIONS[selectedRole]?.label} !`)
            }}
            onError={(error) => {
              console.error('Error:', error)
              alert(`Erreur: ${error}`)
            }}
          />
        </div>

        {/* Back to demo link */}
        <div className="mt-8 text-center">
          <Link href="/demo" className="text-blue-600 hover:text-blue-500 text-sm">
            Retour à la page de démonstration
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full mr-3">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Démonstration</h1>
              <h2 className="text-xl text-blue-600">Page d'Acceptation d'Invitation</h2>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cette page simule le processus d'acceptation d'invitation. L'utilisateur reçoit un email avec un lien 
            qui le mène à cette page pour créer son compte avec le rôle assigné par l'administrateur.
          </p>
        </div>

        {/* Back Link */}
        <div className="mb-6">
          <Link href="/demo">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la démonstration générale
            </Button>
          </Link>
        </div>

        {/* Demo Invitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Choisissez un type d'invitation à tester
            </CardTitle>
            <CardDescription>
              Sélectionnez un rôle pour voir comment un utilisateur accepterait l'invitation correspondante.
              Le rôle est fixe et ne peut pas être modifié par l'utilisateur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {demoInvitations.map((invitation) => {
                const roleInfo = ROLE_DEFINITIONS[invitation.role]
                const Icon = invitation.icon
                
                return (
                  <Card 
                    key={invitation.role}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
                    onClick={() => handleRoleSelect(invitation.role)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-full ${roleInfo?.color} bg-opacity-20`}>
                          <Icon className={`h-6 w-6 ${roleInfo?.textColor?.replace('text-', 'text-')}`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">Invitation {roleInfo?.label}</h3>
                            <Badge className={`${roleInfo?.bgColor} ${roleInfo?.textColor} ${roleInfo?.borderColor} border`}>
                              <Shield className="w-3 h-3 mr-1" />
                              {roleInfo?.label}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              {invitation.email}
                            </div>
                            
                            <div>
                              <strong>Entreprise:</strong> {invitation.company}
                            </div>
                            
                            <div>
                              <strong>Invité par:</strong> {invitation.invitedBy}
                            </div>
                            
                            <div className="pt-2 border-t border-gray-200">
                              <p className="italic">"{invitation.message}"</p>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleRoleSelect(invitation.role)}
                          >
                            Tester cette invitation
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Features Explanation */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900">Fonctionnalités de la Page d'Acceptation</h3>
                <div className="mt-2 text-sm text-green-800 space-y-2">
                  <div><strong>✅ Rôle fixe et visible :</strong> L'utilisateur voit clairement son rôle assigné et ne peut pas le modifier</div>
                  <div><strong>✅ Informations pré-remplies :</strong> Les données de l'invitation (nom, prénom, email) sont déjà complétées</div>
                  <div><strong>✅ Validation robuste :</strong> Mot de passe sécurisé, numéro de téléphone français, champs requis</div>
                  <div><strong>✅ Gestion des erreurs :</strong> Invitations expirées, tokens invalides, erreurs de validation</div>
                  <div><strong>✅ Interface claire :</strong> Badge coloré du rôle, message personnel de l'administrateur</div>
                  <div><strong>✅ Sécurité :</strong> Token unique par invitation, validation côté serveur</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* URL Example */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Comment ça fonctionne en pratique</h3>
                <div className="mt-2 text-sm text-blue-800">
                  <p className="mb-2">
                    <strong>1. L'administrateur envoie une invitation</strong> depuis la page de gestion des invitations
                  </p>
                  <p className="mb-2">
                    <strong>2. L'utilisateur reçoit un email</strong> avec un lien unique vers la page d'acceptation :
                  </p>
                  <code className="block bg-blue-100 p-2 rounded text-xs mb-2">
                    https://ferdi.app/invitations/accept?token=abc123def456...
                  </code>
                  <p className="mb-2">
                    <strong>3. L'utilisateur clique sur le lien</strong> et arrive sur la page d'acceptation avec son rôle pré-assigné
                  </p>
                  <p>
                    <strong>4. Après avoir complété le formulaire,</strong> son compte est créé avec le rôle fixe assigné par l'admin
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}