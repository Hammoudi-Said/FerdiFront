'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { UserRole } from '@/lib/constants/enums'
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, hasPermission, updateActivity } = useAuthStore()
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    
    // Interface
    theme: 'light',
    language: 'fr',
    compactMode: false,
    
    // Sécurité
    twoFactorAuth: false,
    sessionTimeout: 8,
    autoLogout: true,
    
    // Système (Admin uniquement)
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true
  })

  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      // Mock save - en production : API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Paramètres sauvegardés', {
        description: 'Vos préférences ont été mises à jour avec succès'
      })
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                Paramètres
              </h1>
              <p className="text-sm text-gray-600">
                Configurez vos préférences et paramètres système FERDI
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                size="sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
              <Button
                onClick={handleSave}
                loading={loading}
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notifications */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <CardTitle className="text-base font-medium text-gray-900">
                    Notifications
                  </CardTitle>
                </div>
                <CardDescription>
                  Gérez vos préférences de notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="text-sm font-medium">
                    Notifications email
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications" className="text-sm font-medium">
                    Notifications push
                  </Label>
                  <Switch
                    id="push-notifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-reports" className="text-sm font-medium">
                    Rapports hebdomadaires
                  </Label>
                  <Switch
                    id="weekly-reports"
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => updateSetting('weeklyReports', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Interface */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4 text-gray-500" />
                  <CardTitle className="text-base font-medium text-gray-900">
                    Interface
                  </CardTitle>
                </div>
                <CardDescription>
                  Personnalisez l'apparence de FERDI
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Thème</Label>
                  <select
                    value={settings.theme}
                    onChange={(e) => updateSetting('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-gray-900 focus:ring-gray-900 bg-white"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="system">Système</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Langue</Label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-gray-900 focus:ring-gray-900 bg-white"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-mode" className="text-sm font-medium">
                    Mode compact
                  </Label>
                  <Switch
                    id="compact-mode"
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sécurité */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <CardTitle className="text-base font-medium text-gray-900">
                    Sécurité
                  </CardTitle>
                </div>
                <CardDescription>
                  Paramètres de sécurité et authentification
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor" className="text-sm font-medium">
                    Authentification 2FA
                  </Label>
                  <Switch
                    id="two-factor"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Timeout session (heures)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-logout" className="text-sm font-medium">
                    Déconnexion automatique
                  </Label>
                  <Switch
                    id="auto-logout"
                    checked={settings.autoLogout}
                    onCheckedChange={(checked) => updateSetting('autoLogout', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Paramètres Système - Admin uniquement */}
          {hasPermission('system_manage') && (
            <Card className="border border-amber-200 bg-amber-50">
              <CardHeader className="border-b border-amber-100 bg-amber-100/50 py-4">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-amber-600" />
                  <CardTitle className="text-base font-medium text-amber-900">
                    Paramètres Système
                  </CardTitle>
                </div>
                <CardDescription className="text-amber-700">
                  Réservé aux administrateurs système - Utiliser avec précaution
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance-mode" className="text-sm font-medium text-amber-900">
                      Mode maintenance
                    </Label>
                    <Switch
                      id="maintenance-mode"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="debug-mode" className="text-sm font-medium text-amber-900">
                      Mode debug
                    </Label>
                    <Switch
                      id="debug-mode"
                      checked={settings.debugMode}
                      onCheckedChange={(checked) => updateSetting('debugMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cache-enabled" className="text-sm font-medium text-amber-900">
                      Cache activé
                    </Label>
                    <Switch
                      id="cache-enabled"
                      checked={settings.cacheEnabled}
                      onCheckedChange={(checked) => updateSetting('cacheEnabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}