'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/lib/stores/auth-store'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Building2, MapPin, Phone, Mail, Globe, Copy, Edit, Save, X } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function CompanyPage() {
  const { user, company, setCompany } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    if (company) {
      setEditForm({
        name: company.name || '',
        address: company.address || '',
        city: company.city || '',
        postal_code: company.postal_code || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
      })
    }
  }, [company])

  const canEdit = user?.role === '1' || user?.role === '2' // Super Admin or Admin

  const handleCopyCode = () => {
    navigator.clipboard.writeText(company?.company_code || '')
    toast.success('Code copié dans le presse-papiers!')
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (company) {
      setEditForm({
        name: company.name || '',
        address: company.address || '',
        city: company.city || '',
        postal_code: company.postal_code || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
      })
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await api.put(`/companies/${company.id}`, editForm)
      setCompany(response.data)
      setIsEditing(false)
      toast.success('Informations mises à jour avec succès!')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
      console.error('Error updating company:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const getSubscriptionPlanName = (plan) => {
    const plans = {
      'FREETRIAL': 'FREETRIAL - Accès complet pendant 14 jours',
      'ESSENTIAL': 'ESSENTIAL - Jusqu\'à 20 véhicules',
      'STANDARD': 'STANDARD - Jusqu\'à 50 véhicules',
      'PREMIUM': 'PREMIUM - Illimité',
    }
    return plans[plan] || 'Plan inconnu'
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Actif' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactif' },
      suspended: { color: 'bg-red-100 text-red-800', label: 'Suspendu' },
    }
    const config = statusConfig[status] || statusConfig.inactive
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (!company) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
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
            <h1 className="text-3xl font-bold tracking-tight">Ma société</h1>
            <p className="text-muted-foreground">
              Informations et paramètres de votre entreprise
            </p>
          </div>
          {canEdit && !isEditing && (
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          )}
          {isEditing && (
            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Enregistrer
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </div>
          )}
        </div>

        {/* Permission-based read-only notice */}
        {!canEdit && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Mode lecture seule :</strong> Vous pouvez consulter les informations de l'entreprise mais vous n'avez pas les droits pour les modifier. 
                  Contactez votre administrateur pour toute modification.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de l'entreprise</Label>
                {isEditing ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nom de l'entreprise"
                  />
                ) : (
                  <p className="text-sm bg-muted p-2 rounded">{company.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>SIRET</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded">{company.siret}</p>
                <p className="text-xs text-muted-foreground">Le SIRET ne peut pas être modifié</p>
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <div>{getStatusBadge(company.status)}</div>
              </div>

              <div className="space-y-2">
                <Label>Plan d'abonnement</Label>
                <p className="text-sm bg-muted p-2 rounded">
                  {getSubscriptionPlanName(company.subscription_plan)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Téléphone</Label>
                {isEditing ? (
                  <Input
                    value={editForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Téléphone"
                  />
                ) : (
                  <p className="text-sm bg-muted p-2 rounded">{company.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email (optionnel)"
                  />
                ) : (
                  <p className="text-sm bg-muted p-2 rounded">
                    {company.email || 'Non renseigné'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Site web</Label>
                {isEditing ? (
                  <Input
                    value={editForm.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.exemple.fr"
                  />
                ) : (
                  <p className="text-sm bg-muted p-2 rounded">
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {company.website}
                      </a>
                    ) : (
                      'Non renseigné'
                    )}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Adresse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Adresse complète</Label>
                {isEditing ? (
                  <Textarea
                    value={editForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Adresse complète"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm bg-muted p-2 rounded">{company.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Ville"
                    />
                  ) : (
                    <p className="text-sm bg-muted p-2 rounded">{company.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Code postal</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      placeholder="Code postal"
                    />
                  ) : (
                    <p className="text-sm bg-muted p-2 rounded">{company.postal_code}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pays</Label>
                <p className="text-sm bg-muted p-2 rounded">{company.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Company Code */}
          <Card>
            <CardHeader>
              <CardTitle>Code entreprise</CardTitle>
              <CardDescription>
                Partagez ce code avec vos collaborateurs pour qu'ils puissent s'inscrire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-muted p-3 rounded font-mono text-lg font-bold text-center">
                  {company.company_code}
                </div>
                <Button size="sm" variant="outline" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Ce code ne peut pas être modifié pour des raisons de sécurité
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'abonnement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium">Utilisateurs maximum</p>
                <p className="text-2xl font-bold">{company.max_users}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Véhicules maximum</p>
                <p className="text-2xl font-bold">{company.max_vehicles}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Date de création</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(company.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
