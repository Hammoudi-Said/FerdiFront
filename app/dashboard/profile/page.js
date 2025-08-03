'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EditProfileModal } from '@/components/profile/edit-profile-modal'
import { ChangePasswordModal } from '@/components/profile/change-password-modal'
import { usersAPI } from '@/lib/api-client'
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Calendar,
  Edit3,
  Lock,
  MapPin,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export default function ProfilePage() {
  const { user, company, getRoleData, updateActivity } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Loading profile... USE_MOCK_DATA:', USE_MOCK_DATA)
      
      if (USE_MOCK_DATA) {
        // Use store data in mock mode
        console.log('Using store data for profile:', user)
        setProfile(user)
      } else {
        // Call the backend API /users/me
        console.log('Calling backend API /users/me...')
        const response = await usersAPI.getProfile()
        console.log('Profile API response:', response)
        setProfile(response.data)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      console.error('Error details:', error.response || error)
      
      // Show more detailed error message
      const errorMessage = error.response?.data?.detail || error.message || 'Erreur lors du chargement du profil'
      toast.error('Erreur lors du chargement du profil', {
        description: errorMessage
      })
      
      // Fallback to store data if API fails
      if (user) {
        console.log('Falling back to store data:', user)
        setProfile(user)
      }
    } finally {
      setLoading(false)
    }
  }, [user]) // Only depend on user data

  useEffect(() => {
    updateActivity()
    loadProfile()
  }, [loadProfile]) // Now it's safe to depend on memoized loadProfile

  const handleProfileUpdate = async (data) => {
    try {
      if (USE_MOCK_DATA) {
        // Simulate update in mock mode
        setProfile({ ...profile, ...data })
        toast.success('Profil mis à jour avec succès')
        return
      }

      const response = await usersAPI.updateProfile(data)
      setProfile(response.data)
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Erreur lors de la mise à jour du profil')
      throw error
    }
  }

  const handlePasswordChange = async (data) => {
    try {
      if (USE_MOCK_DATA) {
        // Simulate password change
        toast.success('Mot de passe modifié avec succès')
        return
      }

      await usersAPI.changePassword(data)
      toast.success('Mot de passe modifié avec succès')
    } catch (error) {
      console.error('Failed to change password:', error)
      toast.error('Erreur lors de la modification du mot de passe')
      throw error
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const roleData = getRoleData()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <RoleGuard allowedRoles={['1', '2', '3', '4', '5', '6']} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
              <p className="text-gray-600">Gérez vos informations personnelles</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => setPasswordModalOpen(true)}
              >
                <Lock className="mr-2 h-4 w-4" />
                Changer le mot de passe
              </Button>
              <Button onClick={() => setEditModalOpen(true)}>
                <Edit3 className="mr-2 h-4 w-4" />
                Modifier le profil
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-1">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                      {getInitials(profile?.first_name, profile?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {profile?.full_name || `${profile?.first_name} ${profile?.last_name}`}
                </CardTitle>
                <CardDescription className="flex items-center justify-center mt-2">
                  <Shield className="mr-2 h-4 w-4" />
                  {roleData?.label || 'Utilisateur'}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge 
                  className={`${roleData?.color || 'bg-gray-500'} text-white hover:${roleData?.color || 'bg-gray-500'} mb-4`}
                >
                  {roleData?.description || 'Rôle utilisateur'}
                </Badge>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Membre depuis {formatDate(profile?.created_at)}
                  </div>
                  {profile?.last_login_at && (
                    <div className="flex items-center justify-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Dernière connexion: {formatDate(profile?.last_login_at)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Information Cards */}
            <div className="md:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Prénom</label>
                      <p className="text-gray-900">{profile?.first_name || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nom</label>
                      <p className="text-gray-900">{profile?.last_name || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{profile?.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Téléphone</label>
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{profile?.mobile || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              {company && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="mr-2 h-5 w-5" />
                      Entreprise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nom de l'entreprise</label>
                        <p className="text-gray-900">{company.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Code entreprise</label>
                        <p className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                          {company.company_code}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">SIRET</label>
                        <p className="text-gray-900">{company.siret || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Téléphone</label>
                        <p className="text-gray-900">{company.phone || 'Non renseigné'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">Adresse</label>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                          <p className="text-gray-900">
                            {company.address ? 
                              `${company.address}, ${company.city} ${company.postal_code}` : 
                              'Non renseignée'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Role Permissions */}
              {roleData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      Permissions
                    </CardTitle>
                    <CardDescription>
                      Voici les permissions associées à votre rôle
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {roleData.permissions?.map((permission, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {permission === '*' ? 'Toutes les permissions' : permission}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <EditProfileModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          profile={profile}
          onSave={handleProfileUpdate}
        />

        <ChangePasswordModal
          open={passwordModalOpen}
          onOpenChange={setPasswordModalOpen}
          onSave={handlePasswordChange}
        />
      </DashboardLayout>
    </RoleGuard>
  )
}