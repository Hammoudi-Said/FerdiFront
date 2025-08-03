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
import { Input } from '@/components/ui/input'
import { vehiclesAPI } from '@/lib/api-client'
import { 
  Car, 
  Search, 
  CheckCircle,
  AlertTriangle,
  Wrench,
  XCircle,
  Users
} from 'lucide-react'
import { toast } from 'sonner'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Mock vehicles data - only available ones for assignment
const mockAvailableVehicles = [
  {
    id: 'vehicle-001',
    license_plate: 'AB-123-CD',
    brand: 'Mercedes',
    model: 'Travego',
    vehicle_type: 'autocar',
    capacity: 55,
    year: 2020,
    color: 'Blanc',
    status: 'available',
    mileage: 125000,
    fuel_type: 'diesel'
  },
  {
    id: 'vehicle-004',
    license_plate: 'MN-012-OP',
    brand: 'Volvo',
    model: '9700',
    vehicle_type: 'autocar',
    capacity: 45,
    year: 2018,
    color: 'Rouge',
    status: 'available',
    mileage: 220000,
    fuel_type: 'diesel'
  },
  {
    id: 'vehicle-006',
    license_plate: 'UV-678-WX',
    brand: 'Ford',
    model: 'Transit',
    vehicle_type: 'minibus',
    capacity: 15,
    year: 2021,
    color: 'Bleu',
    status: 'available',
    mileage: 85000,
    fuel_type: 'diesel'
  }
]

export function AssignVehicleModal({ open, onOpenChange, mission, onSave }) {
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState(null)

  useEffect(() => {
    if (open) {
      loadVehicles()
      setSelectedVehicleId(mission?.vehicle_id || null)
    }
  }, [open, mission])

  useEffect(() => {
    // Filter vehicles based on search term
    const filtered = vehicles.filter(vehicle => 
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredVehicles(filtered)
  }, [vehicles, searchTerm])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK_DATA) {
        // Use mock data - only available vehicles
        setVehicles(mockAvailableVehicles)
      } else {
        const response = await vehiclesAPI.getVehicles({ status: 'available' })
        setVehicles(response.data.data || response.data)
      }
    } catch (error) {
      console.error('Failed to load vehicles:', error)
      toast.error('Erreur lors du chargement des véhicules')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedVehicleId) {
      toast.error('Veuillez sélectionner un véhicule')
      return
    }

    setSaving(true)
    try {
      await onSave(selectedVehicleId)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to assign vehicle:', error)
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { 
        label: 'Disponible', 
        className: 'bg-green-100 text-green-800 hover:bg-green-100',
        icon: CheckCircle
      },
      in_use: { 
        label: 'En mission', 
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
        icon: CheckCircle
      },
      maintenance: { 
        label: 'Maintenance', 
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
        icon: Wrench
      },
      out_of_service: { 
        label: 'Hors service', 
        className: 'bg-red-100 text-red-800 hover:bg-red-100',
        icon: XCircle
      }
    }
    
    const config = statusConfig[status] || statusConfig.available
    const Icon = config.icon
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      autocar: { label: 'Autocar', className: 'bg-purple-100 text-purple-800' },
      minibus: { label: 'Minibus', className: 'bg-blue-100 text-blue-800' },
      van: { label: 'Van', className: 'bg-gray-100 text-gray-800' }
    }
    
    const config = typeConfig[type] || typeConfig.van
    
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('fr-FR').format(mileage) + ' km'
  }

  // Check if vehicle capacity is suitable for mission
  const isCapacitySuitable = (vehicleCapacity, passengerCount) => {
    if (!passengerCount) return true
    return vehicleCapacity >= passengerCount
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Car className="mr-2 h-5 w-5" />
            Assigner un véhicule
          </DialogTitle>
          <DialogDescription>
            Assignez un véhicule à la mission {mission?.mission_number}
            <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
              <strong>Trajet:</strong> {mission?.departure_location} → {mission?.destination}
              <br />
              <strong>Date:</strong> {mission?.departure_date && new Date(mission.departure_date).toLocaleDateString('fr-FR')}
              <br />
              <strong>Passagers:</strong> {mission?.passenger_count || 'Non spécifié'}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un véhicule (immatriculation, marque, modèle)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Current Assignment */}
          {mission?.vehicle && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Véhicule actuellement assigné:</p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-medium">
                    {mission.vehicle.license_plate}
                  </div>
                  <div className="text-sm text-gray-600">
                    {mission.vehicle.brand} {mission.vehicle.model}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicles List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-8">
                <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun véhicule trouvé
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Aucun véhicule ne correspond à votre recherche.' : 'Aucun véhicule disponible.'}
                </p>
              </div>
            ) : (
              filteredVehicles.map((vehicle) => {
                const capacitySuitable = isCapacitySuitable(vehicle.capacity, mission?.passenger_count)
                
                return (
                  <div
                    key={vehicle.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVehicleId === vehicle.id
                        ? 'border-blue-500 bg-blue-50'
                        : capacitySuitable
                        ? 'border-gray-200 hover:bg-gray-50'
                        : 'border-orange-200 bg-orange-50'
                    }`}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                          <Car className="h-6 w-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 text-lg">
                              {vehicle.license_plate}
                            </span>
                            {getStatusBadge(vehicle.status)}
                            {getTypeBadge(vehicle.vehicle_type)}
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            {vehicle.brand} {vehicle.model} ({vehicle.year}) - {vehicle.color}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              <span className={!capacitySuitable ? 'text-orange-600 font-medium' : ''}>
                                {vehicle.capacity} places
                              </span>
                            </div>
                            <div>
                              {formatMileage(vehicle.mileage)}
                            </div>
                            <div className="capitalize">
                              {vehicle.fuel_type}
                            </div>
                          </div>
                          
                          {!capacitySuitable && (
                            <div className="text-xs text-orange-600 mt-1 font-medium">
                              ⚠️ Capacité insuffisante pour {mission?.passenger_count} passagers
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <input
                          type="radio"
                          checked={selectedVehicleId === vehicle.id}
                          onChange={() => setSelectedVehicleId(vehicle.id)}
                          className="h-4 w-4 text-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {mission?.passenger_count && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              💡 <strong>Conseil:</strong> Choisissez un véhicule avec une capacité d'au moins {mission.passenger_count} places pour cette mission.
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
          <Button onClick={handleSave} disabled={saving || !selectedVehicleId}>
            {saving && <LoadingSpinner size="sm" className="mr-2" />}
            Assigner le véhicule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}