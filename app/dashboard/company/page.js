'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ModernPageLayout, ModernSection } from '@/components/ui/modern-page-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Edit3,
  Save,
  Shield,
  Users,
  CreditCard,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

export default function CompanyPage() {
  const { user, company, updateActivity, hasPermission } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [companyData, setCompanyData] = useState({
    name: company?.name || 'Transport FERDI',
    email: company?.email || 'contact@ferdi.fr',
    phone: company?.phone || '01 23 45 67 89',
    address: company?.address || '123 Avenue de la République',
    city: company?.city || 'Paris',
    postal_code: company?.postal_code || '75001',
    siret: company?.siret || '12345678901234',
    description: company?.description || 'Spécialiste du transport de personnes'
  })

  useEffect(() => {
    updateActivity()
  }, [updateActivity])

  const handleSave = async () => {
    try {
      setLoading(true)
      // Mock save - dans un vrai projet, ici on appellerait l'API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Informations de l\'entreprise mises à jour')
      setIsEditing(false)
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const canEdit = hasPermission('company_manage') || user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

  return (
    <DashboardLayout>
      <ModernPageLayout
        title="🏢 Informations de l'entreprise"
        subtitle="Gérez les données de votre entreprise"
        icon={Building2}
        headerGradient="from-purple-600 via-purple-700 to-indigo-600"
        actions={
          canEdit ? (
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(false)}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                    size="sm"
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                    size="sm"
                    disabled={loading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                  size="sm"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              )}
            </div>
          ) : null
        }
      >
        {!canEdit && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">Mode lecture seule</p>
                <p className="text-xs text-amber-600">Contactez votre administrateur pour modifier ces informations</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informations générales */}
          <ModernSection
            title="ℹ️ Informations générales"
            subtitle="Données principales de votre entreprise"
            icon={Building2}
            iconColor="text-purple-600"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise
                </label>
                <Input
                  value={companyData.name}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-white/80 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={companyData.description}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-white/80 backdrop-blur-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SIRET
                </label>
                <Input
                  value={companyData.siret}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, siret: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
          </ModernSection>

          {/* Coordonnées */}
          <ModernSection
            title="📞 Coordonnées"
            subtitle="Informations de contact"
            icon={Phone}
            iconColor="text-purple-600"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="pl-10 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={companyData.phone}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className="pl-10 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </ModernSection>

          {/* Adresse */}
          <ModernSection
            title="📍 Adresse"
            subtitle="Localisation de votre entreprise"
            icon={MapPin}
            iconColor="text-purple-600"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <Input
                  value={companyData.address}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-white/80 backdrop-blur-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <Input
                    value={companyData.city}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!isEditing}
                    className="bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <Input
                    value={companyData.postal_code}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, postal_code: e.target.value }))}
                    disabled={!isEditing}
                    className="bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </ModernSection>

          {/* Statut et abonnement */}
          <ModernSection
            title="💎 Statut et abonnement"
            subtitle="Informations sur votre plan"
            icon={CreditCard}
            iconColor="text-purple-600"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div>
                  <p className="text-sm font-medium text-green-800">Statut de l'entreprise</p>
                  <Badge className="mt-1 bg-gradient-to-r from-green-500 to-green-600 text-white">
                    ✅ Actif
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div>
                  <p className="text-sm font-medium text-blue-800">Plan d'abonnement</p>
                  <Badge className="mt-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {company?.subscription_plan || 'Standard'}
                  </Badge>
                </div>
              </div>
            </div>
          </ModernSection>
        </div>
      </ModernPageLayout>
    </DashboardLayout>
  )
}