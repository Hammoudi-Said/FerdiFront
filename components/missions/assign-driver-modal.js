'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { usersAPI } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { 
  UserCheck, 
  Search, 
  Phone, 
  Mail,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Mock drivers data
const mockDrivers = [
  {
    id: 'user-driver-001',
    first_name: 'Pierre',
    last_name: 'Bernard',
    full_name: 'Pierre Bernard',
    email: 'pierre.bernard@transport-bretagne.fr',
    mobile: '0698765432',
    status: 'available',
    last_mission_date: '2024-12-10T00:00:00Z'
  },
  {
    id: 'user-driver-002',
    first_name: 'Sophie',
    last_name: 'Dubois',
    full_name: 'Sophie Dubois',
    email: 'sophie.dubois@transport-bretagne.fr',
    mobile: '0634567890',
    status: 'available',
    last_mission_date: '2024-12-08T00:00:00Z'
  },
  {
    id: 'user-driver-003',
    first_name: 'Lucas',
    last_name: 'Moreau',
    full_name: 'Lucas Moreau',
    email: 'lucas.moreau@transport-bretagne.fr',
    mobile: '0645678901',
    status: 'assigned',
    current_mission: 'MSN-2025-005',
    last_mission_date: '2024-12-15T00:00:00Z'
  }
]

export function AssignDriverModal({ open, onOpenChange, mission, onSave }) {
  const [drivers, setDrivers] = useState([])
  const [filteredDrivers, setFilteredDrivers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDriverId, setSelectedDriverId] = useState(null)
  const { getUsers } = useAuthStore()

  useEffect(() => {
    if (open) {
      loadDrivers()
      setSelectedDriverId(mission?.driver_id || null)
    }
  }, [open, mission])

  useEffect(() => {
    // Filter drivers based on search term
    const filtered = drivers.filter(driver => 
      driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredDrivers(filtered)
  }, [drivers, searchTerm])

  const loadDrivers = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK_DATA) {
        // Use mock data - filter only drivers (role 4)
        setDrivers(mockDrivers)
      } else {
        const response = await usersAPI.getUsers({ role: '4' }) // Only drivers
        setDrivers(response.data.data || response.data)
      }
    } catch (error) {
      console.error('Failed to load drivers:', error)
      toast.error('Erreur lors du chargement des chauffeurs')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedDriverId) {
      toast.error('Veuillez sélectionner un chauffeur')
      return
    }

    setSaving(true)
    try {
      await onSave(selectedDriverId)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to assign driver:', error)
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getStatusBadge = (driver) => {
    switch(driver.status) {
      case 'available':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Disponible
          </Badge>
        )
      case 'assigned':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            En mission
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            {driver.status}
          </Badge>
        )
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserCheck className="mr-2 h-5 w-5" />
            Assigner un chauffeur
          </DialogTitle>
          <DialogDescription>
            Assignez un chauffeur à la mission {mission?.mission_number}
            <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
              <strong>Trajet:</strong> {mission?.departure_location} → {mission?.destination}
              <br />
              <strong>Date:</strong> {mission?.departure_date && new Date(mission.departure_date).toLocaleDateString('fr-FR')}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un chauffeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Current Assignment */}
          {mission?.driver && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Chauffeur actuellement assigné:</p>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={mission.driver.avatar_url} />
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                    {getInitials(mission.driver.first_name, mission.driver.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {mission.driver.first_name} {mission.driver.last_name}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drivers List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun chauffeur trouvé
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Aucun chauffeur ne correspond à votre recherche.' : 'Aucun chauffeur disponible.'}
                </p>
              </div>
            ) : (
              filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDriverId === driver.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedDriverId(driver.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={driver.avatar_url} />
                        <AvatarFallback className="text-sm bg-blue-100 text-blue-600">
                          {getInitials(driver.first_name, driver.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {driver.full_name}
                          </span>
                          {getStatusBadge(driver)}
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {driver.email}
                          </div>
                          {driver.mobile && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {driver.mobile}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Dernière mission: {formatDate(driver.last_mission_date)}
                          {driver.current_mission && (
                            <span className="ml-2 text-orange-600">
                              (Actuellement: {driver.current_mission})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <input
                        type="radio"
                        checked={selectedDriverId === driver.id}
                        onChange={() => setSelectedDriverId(driver.id)}
                        className="h-4 w-4 text-blue-600"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || !selectedDriverId}>
            {saving && <LoadingSpinner size="sm" className="mr-2" />}
            Assigner le chauffeur
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}