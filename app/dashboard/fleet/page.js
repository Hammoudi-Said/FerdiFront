'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ModernPageLayout, ModernStats, ModernSection } from '@/components/ui/modern-page-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VehiclesTable } from '@/components/fleet/vehicles-table'
import { CreateVehicleModal } from '@/components/fleet/create-vehicle-modal'
import { EditVehicleModal } from '@/components/fleet/edit-vehicle-modal'
import { DeleteVehicleDialog } from '@/components/fleet/delete-vehicle-dialog'
import { MaintenanceModal } from '@/components/fleet/maintenance-modal'
import {
  Bus,
  Plus,
  Search,
  Settings,
  Wrench,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function FleetPage() {
  const { user, updateActivity } = useAuthStore()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  const [stats, setStats] = useState({
    total: 18,
    active: 16,
    maintenance: 2,
    available: 14
  })

  useEffect(() => {
    updateActivity()
    loadVehicles()
  }, [updateActivity])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      // Mock data pour la flotte
      const mockVehicles = [
        {
          id: 'fleet-1',
          brand: 'Mercedes',
          model: 'Sprinter 516',
          license_plate: 'AB-123-CD',
          capacity: 22,
          status: 'ACTIVE',
          last_maintenance: '2024-01-15',
          next_maintenance: '2024-04-15'
        },
        {
          id: 'fleet-2', 
          brand: 'Iveco',
          model: 'Daily 70C17',
          license_plate: 'EF-456-GH',
          capacity: 33,
          status: 'MAINTENANCE',
          last_maintenance: '2024-02-01',
          next_maintenance: '2024-05-01'
        }
      ]
      setVehicles(mockVehicles)
    } catch (error) {
      toast.error('Erreur lors du chargement de la flotte')
    } finally {
      setLoading(false)
    }
  }

  const modernStats = [
    {
      label: 'Total véhicules',
      value: stats.total,
      icon: Bus,
      trend: '+2 ce mois'
    },
    {
      label: 'Opérationnels',
      value: stats.active,
      icon: CheckCircle,
      subtitle: `${Math.round((stats.active/stats.total)*100)}% de la flotte`
    },
    {
      label: 'En maintenance',
      value: stats.maintenance,
      icon: Wrench,
      subtitle: 'Interventions programmées'
    },
    {
      label: 'Disponibles',
      value: stats.available,
      icon: TrendingUp,
      subtitle: 'Prêts à partir'
    }
  ]

  return (
    <DashboardLayout>
      <ModernPageLayout
        title="🚛 Gestion de flotte"
        subtitle="Surveillez et gérez votre parc de véhicules"
        icon={Bus}
        headerGradient="from-orange-600 via-orange-700 to-red-600"
        actions={
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-white text-orange-600 hover:bg-white/90 shadow-lg"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un véhicule
          </Button>
        }
      >
        <ModernStats stats={modernStats} />

        <ModernSection
          title="🔍 Rechercher des véhicules"
          subtitle="Trouvez rapidement le véhicule que vous cherchez"
          icon={Search}
          iconColor="text-orange-600"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par plaque, marque ou modèle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </ModernSection>

        <ModernSection
          title="🚐 Liste des véhicules"
          subtitle={`${vehicles.length} véhicule(s) dans votre flotte`}
          icon={Bus}
          iconColor="text-orange-600"
          className="p-0"
        >
          <div className="p-6">
            <VehiclesTable
              vehicles={vehicles.filter(v => 
                !searchTerm || 
                v.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.model.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              onEdit={(vehicle) => {
                setSelectedVehicle(vehicle)
                setEditModalOpen(true)
              }}
              onDelete={(vehicle) => {
                setSelectedVehicle(vehicle)
                setDeleteDialogOpen(true)
              }}
              onMaintenance={(vehicle) => {
                setSelectedVehicle(vehicle)
                setMaintenanceModalOpen(true)
              }}
              loading={loading}
            />
          </div>
        </ModernSection>
      </ModernPageLayout>

      {/* Modals */}
      <CreateVehicleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSave={(data) => {
          setVehicles(prev => [...prev, { id: `fleet-${Date.now()}`, ...data }])
          toast.success('Véhicule ajouté avec succès')
        }}
      />

      {selectedVehicle && (
        <>
          <EditVehicleModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            vehicle={selectedVehicle}
            onSave={(data) => {
              setVehicles(prev => prev.map(v => 
                v.id === selectedVehicle.id ? { ...v, ...data } : v
              ))
              toast.success('Véhicule modifié avec succès')
            }}
          />

          <DeleteVehicleDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            vehicle={selectedVehicle}
            onConfirm={() => {
              setVehicles(prev => prev.filter(v => v.id !== selectedVehicle.id))
              toast.success('Véhicule supprimé avec succès')
            }}
          />

          <MaintenanceModal
            open={maintenanceModalOpen}
            onOpenChange={setMaintenanceModalOpen}
            vehicle={selectedVehicle}
          />
        </>
      )}
    </DashboardLayout>
  )
}