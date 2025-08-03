'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { VehiclesTable } from '@/components/fleet/vehicles-table'
import { CreateVehicleModal } from '@/components/fleet/create-vehicle-modal'
import { EditVehicleModal } from '@/components/fleet/edit-vehicle-modal'
import { DeleteVehicleDialog } from '@/components/fleet/delete-vehicle-dialog'
import { MaintenanceModal } from '@/components/fleet/maintenance-modal'
import { vehiclesAPI } from '@/lib/api-client'
import {
  Bus,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Download,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Mock data for vehicles
const mockVehicles = [
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
    fuel_type: 'diesel',
    insurance_expiry: '2025-12-31T00:00:00Z',
    technical_control_expiry: '2025-06-30T00:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    last_maintenance: '2024-11-01T00:00:00Z'
  },
  {
    id: 'vehicle-002',
    license_plate: 'EF-456-GH',
    brand: 'Setra',
    model: 'S515HD',
    vehicle_type: 'autocar',
    capacity: 50,
    year: 2019,
    color: 'Bleu',
    status: 'in_use',
    mileage: 185000,
    fuel_type: 'diesel',
    insurance_expiry: '2025-08-15T00:00:00Z',
    technical_control_expiry: '2025-03-20T00:00:00Z',
    created_at: '2024-01-20T10:00:00Z',
    last_maintenance: '2024-10-15T00:00:00Z'
  },
  {
    id: 'vehicle-003',
    license_plate: 'IJ-789-KL',
    brand: 'Ford',
    model: 'Transit',
    vehicle_type: 'minibus',
    capacity: 12,
    year: 2021,
    color: 'Gris',
    status: 'maintenance',
    mileage: 75000,
    fuel_type: 'diesel',
    insurance_expiry: '2025-10-10T00:00:00Z',
    technical_control_expiry: '2025-09-15T00:00:00Z',
    created_at: '2024-02-01T10:00:00Z',
    last_maintenance: '2024-12-01T00:00:00Z'
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
    fuel_type: 'diesel',
    insurance_expiry: '2025-05-20T00:00:00Z',
    technical_control_expiry: '2025-04-10T00:00:00Z',
    created_at: '2024-02-15T10:00:00Z',
    last_maintenance: '2024-11-20T00:00:00Z'
  },
  {
    id: 'vehicle-005',
    license_plate: 'QR-345-ST',
    brand: 'Mercedes',
    model: 'Sprinter',
    vehicle_type: 'van',
    capacity: 8,
    year: 2022,
    color: 'Noir',
    status: 'out_of_service',
    mileage: 45000,
    fuel_type: 'diesel',
    insurance_expiry: '2025-11-30T00:00:00Z',
    technical_control_expiry: '2025-07-25T00:00:00Z',
    created_at: '2024-03-01T10:00:00Z',
    last_maintenance: '2024-09-10T00:00:00Z'
  }
]

export default function FleetPage() {
  const { hasPermission, updateActivity } = useAuthStore()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    in_use: 0,
    maintenance: 0,
    out_of_service: 0,
    byType: {}
  })

  useEffect(() => {
    updateActivity()
    loadVehicles()
  }, [updateActivity])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK_DATA) {
        // Use mock data
        setVehicles(mockVehicles)
        calculateStats(mockVehicles)
      } else {
        const response = await vehiclesAPI.getVehicles()
        setVehicles(response.data.data || response.data)
        calculateStats(response.data.data || response.data)
      }
    } catch (error) {
      console.error('Failed to load vehicles:', error)
      toast.error('Erreur lors du chargement des véhicules')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (vehiclesList) => {
    const total = vehiclesList.length
    const available = vehiclesList.filter(v => v.status === 'available').length
    const in_use = vehiclesList.filter(v => v.status === 'in_use').length
    const maintenance = vehiclesList.filter(v => v.status === 'maintenance').length
    const out_of_service = vehiclesList.filter(v => v.status === 'out_of_service').length
    
    const byType = {}
    vehiclesList.forEach(v => {
      byType[v.vehicle_type] = (byType[v.vehicle_type] || 0) + 1
    })

    setStats({ total, available, in_use, maintenance, out_of_service, byType })
  }

  const handleCreateVehicle = async (vehicleData) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock vehicle creation
        const newVehicle = {
          id: `vehicle-${Date.now()}`,
          ...vehicleData,
          status: 'available',
          mileage: 0,
          created_at: new Date().toISOString(),
        }
        setVehicles(prev => [...prev, newVehicle])
        calculateStats([...vehicles, newVehicle])
        toast.success('Véhicule ajouté avec succès')
      } else {
        await vehiclesAPI.createVehicle(vehicleData)
        await loadVehicles()
        toast.success('Véhicule ajouté avec succès')
      }
    } catch (error) {
      console.error('Failed to create vehicle:', error)
      toast.error('Erreur lors de l\'ajout du véhicule')
      throw error
    }
  }

  const handleEditVehicle = async (vehicleId, vehicleData) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock vehicle update
        setVehicles(prev => prev.map(v => 
          v.id === vehicleId ? { ...v, ...vehicleData } : v
        ))
        toast.success('Véhicule modifié avec succès')
      } else {
        await vehiclesAPI.updateVehicle(vehicleId, vehicleData)
        await loadVehicles()
        toast.success('Véhicule modifié avec succès')
      }
    } catch (error) {
      console.error('Failed to update vehicle:', error)
      toast.error('Erreur lors de la modification du véhicule')
      throw error
    }
  }

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock vehicle deletion
        const updatedVehicles = vehicles.filter(v => v.id !== vehicleId)
        setVehicles(updatedVehicles)
        calculateStats(updatedVehicles)
        toast.success('Véhicule supprimé avec succès')
      } else {
        await vehiclesAPI.deleteVehicle(vehicleId)
        await loadVehicles()
        toast.success('Véhicule supprimé avec succès')
      }
    } catch (error) {
      console.error('Failed to delete vehicle:', error)
      toast.error('Erreur lors de la suppression du véhicule')
      throw error
    }
  }

  const handleStatusUpdate = async (vehicleId, newStatus) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock status update
        setVehicles(prev => prev.map(v => 
          v.id === vehicleId ? { ...v, status: newStatus } : v
        ))
        toast.success('Statut mis à jour avec succès')
      } else {
        await vehiclesAPI.updateVehicleStatus(vehicleId, newStatus)
        await loadVehicles()
        toast.success('Statut mis à jour avec succès')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle)
    setEditModalOpen(true)
  }

  const handleDeleteClick = (vehicle) => {
    setSelectedVehicle(vehicle)
    setDeleteDialogOpen(true)
  }

  const handleMaintenanceClick = (vehicle) => {
    setSelectedVehicle(vehicle)
    setMaintenanceModalOpen(true)
  }

  const exportVehicles = () => {
    const csvContent = [
      ['Immatriculation', 'Marque', 'Modèle', 'Type', 'Capacité', 'Année', 'Statut', 'Kilométrage'].join(','),
      ...filteredVehicles.map(vehicle => [
        vehicle.license_plate,
        vehicle.brand,
        vehicle.model,
        vehicle.vehicle_type,
        vehicle.capacity,
        vehicle.year,
        getStatusLabel(vehicle.status),
        vehicle.mileage
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flotte_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusLabel = (status) => {
    const statusLabels = {
      available: 'Disponible',
      in_use: 'En cours d\'utilisation',
      maintenance: 'En maintenance',
      out_of_service: 'Hors service'
    }
    return statusLabels[status] || status
  }

  // Filter vehicles based on search term, status, and type
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = !searchTerm || 
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus
    const matchesType = filterType === 'all' || vehicle.vehicle_type === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <RoleGuard allowedRoles={['1', '2', '3', '5']} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion de la flotte</h1>
              <p className="text-gray-600">Gérez vos véhicules et leur maintenance</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={exportVehicles}
                disabled={filteredVehicles.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Exporter CSV
              </Button>
              {hasPermission('fleet_manage') && (
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau véhicule
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Bus className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Disponibles</p>
                    <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En mission</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.in_use}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Maintenance</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
                  </div>
                  <Wrench className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hors service</p>
                    <p className="text-2xl font-bold text-red-600">{stats.out_of_service}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtres et recherche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par immatriculation, marque ou modèle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="available">Disponible</option>
                  <option value="in_use">En mission</option>
                  <option value="maintenance">En maintenance</option>
                  <option value="out_of_service">Hors service</option>
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Tous les types</option>
                  <option value="autocar">Autocar</option>
                  <option value="minibus">Minibus</option>
                  <option value="van">Van</option>
                </select>
              </div>
              
              {(searchTerm || filterStatus !== 'all' || filterType !== 'all') && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {filteredVehicles.length} véhicule(s) trouvé(s)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setFilterStatus('all')
                      setFilterType('all')
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Véhicules ({filteredVehicles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <VehiclesTable
                  vehicles={filteredVehicles}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onMaintenance={handleMaintenanceClick}
                  onStatusUpdate={handleStatusUpdate}
                  canManage={hasPermission('fleet_manage')}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <CreateVehicleModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSave={handleCreateVehicle}
        />

        {selectedVehicle && (
          <EditVehicleModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            vehicle={selectedVehicle}
            onSave={(data) => handleEditVehicle(selectedVehicle.id, data)}
          />
        )}

        {selectedVehicle && (
          <DeleteVehicleDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            vehicle={selectedVehicle}
            onConfirm={() => handleDeleteVehicle(selectedVehicle.id)}
          />
        )}

        {selectedVehicle && (
          <MaintenanceModal
            open={maintenanceModalOpen}
            onOpenChange={setMaintenanceModalOpen}
            vehicle={selectedVehicle}
          />
        )}
      </DashboardLayout>
    </RoleGuard>
  )
}