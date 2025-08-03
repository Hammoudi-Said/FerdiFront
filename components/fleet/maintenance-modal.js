'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Separator } from '@/components/ui/separator'
import { vehiclesAPI } from '@/lib/api-client'
import { 
  Wrench, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Mock maintenance data
const mockMaintenanceHistory = [
  {
    id: 'maint-001',
    date: '2024-12-01T10:00:00Z',
    type: 'Révision complète',
    description: 'Révision des 120 000 km avec changement filtres et huile',
    cost: 850.00,
    mileage: 120000,
    status: 'completed',
    next_maintenance_mileage: 140000
  },
  {
    id: 'maint-002',
    date: '2024-09-15T14:30:00Z',
    type: 'Réparation',
    description: 'Remplacement des plaquettes de frein avant',
    cost: 320.50,
    mileage: 118500,
    status: 'completed'
  },
  {
    id: 'maint-003',
    date: '2024-06-20T09:00:00Z',
    type: 'Contrôle technique',
    description: 'Contrôle technique annuel - Aucun défaut détecté',
    cost: 85.00,
    mileage: 115000,
    status: 'completed'
  }
]

export function MaintenanceModal({ open, onOpenChange, vehicle }) {
  const [maintenanceHistory, setMaintenanceHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [addingMaintenance, setAddingMaintenance] = useState(false)

  const loadMaintenanceHistory = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK_DATA) {
        // Use mock data
        setMaintenanceHistory(mockMaintenanceHistory)
      } else {
        const response = await vehiclesAPI.getVehicleMaintenance(vehicle.id)
        setMaintenanceHistory(response.data)
      }
    } catch (error) {
      console.error('Failed to load maintenance history:', error)
      toast.error('Erreur lors du chargement de l\'historique de maintenance')
    } finally {
      setLoading(false)
    }
  }

  // Load maintenance history when modal opens
  React.useEffect(() => {
    if (open && vehicle) {
      loadMaintenanceHistory()
    }
  }, [open, vehicle])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount)
  }

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('fr-FR').format(mileage) + ' km'
  }

  const getMaintenanceTypeBadge = (type) => {
    const typeConfig = {
      'Révision complète': 'bg-blue-100 text-blue-800',
      'Réparation': 'bg-orange-100 text-orange-800',
      'Contrôle technique': 'bg-green-100 text-green-800',
      'Entretien': 'bg-purple-100 text-purple-800'
    }
    
    return (
      <Badge className={typeConfig[type] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    )
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-orange-600" />
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const calculateNextMaintenance = () => {
    if (!vehicle || !maintenanceHistory.length) return null
    
    const lastMaintenance = maintenanceHistory[0] // Assuming sorted by date desc
    if (lastMaintenance.next_maintenance_mileage) {
      const remaining = lastMaintenance.next_maintenance_mileage - vehicle.mileage
      return {
        mileage: lastMaintenance.next_maintenance_mileage,
        remaining: Math.max(0, remaining)
      }
    }
    return null
  }

  const nextMaintenance = calculateNextMaintenance()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wrench className="mr-2 h-5 w-5" />
            Maintenance - {vehicle?.license_plate}
          </DialogTitle>
          <DialogDescription>
            Historique et planification de la maintenance pour {vehicle?.brand} {vehicle?.model}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">État du véhicule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kilométrage actuel</p>
                  <p className="text-xl font-bold text-gray-900">{formatMileage(vehicle?.mileage || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Dernière maintenance</p>
                  <p className="text-lg text-gray-900">
                    {vehicle?.last_maintenance ? formatDate(vehicle.last_maintenance) : 'Aucune'}
                  </p>
                </div>
              </div>
              
              {nextMaintenance && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Prochaine maintenance prévue
                      </p>
                      <p className="text-blue-800">
                        À {formatMileage(nextMaintenance.mileage)} 
                        ({formatMileage(nextMaintenance.remaining)} restants)
                      </p>
                    </div>
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maintenance History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Historique de maintenance</CardTitle>
                  <CardDescription>
                    Toutes les opérations de maintenance effectuées
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setAddingMaintenance(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-24">
                  <LoadingSpinner size="lg" />
                </div>
              ) : maintenanceHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun historique de maintenance
                  </h3>
                  <p className="text-gray-500">
                    Commencez par ajouter la première opération de maintenance.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceHistory.map((maintenance, index) => (
                    <div key={maintenance.id}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 pt-1">
                          {getStatusIcon(maintenance.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getMaintenanceTypeBadge(maintenance.type)}
                              <span className="text-sm text-gray-500">
                                {formatDate(maintenance.date)}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(maintenance.cost)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatMileage(maintenance.mileage)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">
                            {maintenance.description}
                          </p>
                        </div>
                      </div>
                      {index < maintenanceHistory.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button onClick={() => setAddingMaintenance(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle maintenance
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}