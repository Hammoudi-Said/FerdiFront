'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  MapPin, 
  Clock, 
  Users, 
  Car, 
  UserCheck, 
  Calendar,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function QuickAssignModal({ 
  open, 
  onOpenChange, 
  mission, 
  availableDrivers = [], 
  availableVehicles = [], 
  onSave 
}) {
  const [selectedDriverId, setSelectedDriverId] = useState(mission?.driver_id || '')
  const [selectedVehicleId, setSelectedVehicleId] = useState(mission?.vehicle_id || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const assignments = {}
      
      if (selectedDriverId !== mission?.driver_id) {
        assignments.driverId = selectedDriverId || null
      }
      
      if (selectedVehicleId !== mission?.vehicle_id) {
        assignments.vehicleId = selectedVehicleId || null
      }

      if (Object.keys(assignments).length > 0) {
        await onSave(assignments)
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save assignments:', error)
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        label: 'En attente', 
        className: 'bg-orange-100 text-orange-800',
        icon: Clock
      },
      confirmed: { 
        label: 'Confirmé', 
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      completed: { 
        label: 'Terminé', 
        className: 'bg-blue-100 text-blue-800',
        icon: CheckCircle
      },
      cancelled: { 
        label: 'Annulé', 
        className: 'bg-red-100 text-red-800',
        icon: AlertTriangle
      }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr })
  }

  // Check if vehicle capacity is suitable
  const isVehicleCapacitySuitable = (vehicle) => {
    if (!mission?.passenger_count) return true
    return vehicle.capacity >= mission.passenger_count
  }

  const hasChanges = selectedDriverId !== (mission?.driver_id || '') || 
                    selectedVehicleId !== (mission?.vehicle_id || '')

  if (!mission) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Assignation rapide
          </DialogTitle>
          <DialogDescription>
            Assignez rapidement un chauffeur et un véhicule à cette mission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mission Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">{mission.mission_number}</h3>
              {getStatusBadge(mission.status)}
            </div>
            
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-1">{mission.title}</div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-green-600" />
                  <span>{mission.departure_location}</span>
                </div>
                <span>→</span>
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-red-600" />
                  <span>{mission.destination}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDateTime(mission.departure_date)}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{mission.passenger_count} passagers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Assignments */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Driver */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Chauffeur actuel</label>
              {mission.driver ? (
                <div className="flex items-center space-x-2 p-2 bg-green-50 rounded border border-green-200">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={mission.driver.avatar_url} />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                      {getInitials(mission.driver.first_name, mission.driver.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {mission.driver.first_name} {mission.driver.last_name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded border border-orange-200">
                  <UserCheck className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600">Non assigné</span>
                </div>
              )}
            </div>

            {/* Current Vehicle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Véhicule actuel</label>
              {mission.vehicle ? (
                <div className="flex items-center space-x-2 p-2 bg-green-50 rounded border border-green-200">
                  <Car className="h-4 w-4 text-green-600" />
                  <div className="text-sm">
                    <div className="font-medium">{mission.vehicle.license_plate}</div>
                    <div className="text-gray-600 text-xs">
                      {mission.vehicle.brand} {mission.vehicle.model}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded border border-orange-200">
                  <Car className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600">Non assigné</span>
                </div>
              )}
            </div>
          </div>

          {/* New Assignments */}
          <div className="space-y-4">
            {/* Driver Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nouveau chauffeur
                <span className="text-gray-500 ml-1">({availableDrivers.length} disponible(s))</span>
              </label>
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un chauffeur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <div className="flex items-center">
                      <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                      Aucun chauffeur
                    </div>
                  </SelectItem>
                  {availableDrivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={driver.avatar_url} />
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                            {getInitials(driver.first_name, driver.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{driver.first_name} {driver.last_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nouveau véhicule
                <span className="text-gray-500 ml-1">({availableVehicles.length} disponible(s))</span>
              </label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un véhicule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 text-gray-400 mr-2" />
                      Aucun véhicule
                    </div>
                  </SelectItem>
                  {availableVehicles.map((vehicle) => {
                    const capacitySuitable = isVehicleCapacitySuitable(vehicle)
                    
                    return (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4 text-gray-600" />
                            <div>
                              <div className="font-medium">{vehicle.license_plate}</div>
                              <div className="text-xs text-gray-500">
                                {vehicle.brand} {vehicle.model} - {vehicle.capacity} places
                              </div>
                            </div>
                          </div>
                          {!capacitySuitable && (
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              
              {selectedVehicleId && mission.passenger_count && (
                <div className="text-xs text-gray-500">
                  {(() => {
                    const selectedVehicle = availableVehicles.find(v => v.id === selectedVehicleId)
                    if (selectedVehicle && !isVehicleCapacitySuitable(selectedVehicle)) {
                      return (
                        <div className="text-orange-600 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Attention: Capacité insuffisante ({selectedVehicle.capacity} places pour {mission.passenger_count} passagers)
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Availability Warning */}
          {(availableDrivers.length === 0 || availableVehicles.length === 0) && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <div className="text-sm text-yellow-800">
                  {availableDrivers.length === 0 && availableVehicles.length === 0 && 
                    "Aucun chauffeur ni véhicule disponible"
                  }
                  {availableDrivers.length === 0 && availableVehicles.length > 0 && 
                    "Aucun chauffeur disponible"
                  }
                  {availableDrivers.length > 0 && availableVehicles.length === 0 && 
                    "Aucun véhicule disponible"
                  }
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !hasChanges}
          >
            {saving && <LoadingSpinner size="sm" className="mr-2" />}
            Enregistrer les assignations
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}