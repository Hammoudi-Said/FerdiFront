'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ModernPageLayout, ModernStats, ModernSection } from '@/components/ui/modern-page-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MissionsTable } from '@/components/missions/missions-table'
import { CreateMissionModal } from '@/components/missions/create-mission-modal'
import { EditMissionModal } from '@/components/missions/edit-mission-modal'
import { DeleteMissionDialog } from '@/components/missions/delete-mission-dialog'
import { AssignDriverModal } from '@/components/missions/assign-driver-modal'
import { AssignVehicleModal } from '@/components/missions/assign-vehicle-modal'
import {
  MapPin,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Bus
} from 'lucide-react'
import { toast } from 'sonner'

export default function MissionsPage() {
  const { user, updateActivity } = useAuthStore()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assignDriverOpen, setAssignDriverOpen] = useState(false)
  const [assignVehicleOpen, setAssignVehicleOpen] = useState(false)
  const [selectedMission, setSelectedMission] = useState(null)

  const [stats, setStats] = useState({
    total: 45,
    today: 5,
    confirmed: 38,
    pending: 7
  })

  useEffect(() => {
    updateActivity()
    loadMissions()
  }, [updateActivity])

  const loadMissions = async () => {
    try {
      setLoading(true)
      // Mock data pour les missions
      const mockMissions = [
        {
          id: 'mission-1',
          title: 'Transport scolaire - Lycée Victor Hugo',
          departure: 'Place de la République, Paris',
          destination: 'Lycée Victor Hugo, Besançon',
          date: new Date().toISOString().split('T')[0],
          start_time: '08:00',
          end_time: '17:00',
          status: 'CONFIRMED',
          driver: 'Jean Dupont',
          vehicle: 'Mercedes Sprinter (AB-123-CD)',
          passengers: 28,
          client: 'Académie de Besançon'
        },
        {
          id: 'mission-2',
          title: 'Sortie culturelle - Musée du Louvre',
          departure: 'École Primaire Jules Ferry, Melun',
          destination: 'Musée du Louvre, Paris',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '09:30',
          end_time: '16:30',
          status: 'PENDING',
          driver: null,
          vehicle: null,
          passengers: 32,
          client: 'École Jules Ferry'
        }
      ]
      setMissions(mockMissions)
    } catch (error) {
      toast.error('Erreur lors du chargement des missions')
    } finally {
      setLoading(false)
    }
  }

  const modernStats = [
    {
      label: 'Total missions',
      value: stats.total,
      icon: MapPin,
      trend: '+8 ce mois'
    },
    {
      label: "Aujourd'hui",
      value: stats.today,
      icon: Clock,
      subtitle: '5 trajets programmés'
    },
    {
      label: 'Confirmées',
      value: stats.confirmed,
      icon: CheckCircle,
      subtitle: 'Chauffeur et véhicule assignés'
    },
    {
      label: 'En attente',
      value: stats.pending,
      icon: AlertCircle,
      subtitle: 'Nécessitent une assignation'
    }
  ]

  return (
    <DashboardLayout>
      <ModernPageLayout
        title="🗺️ Gestion des missions"
        subtitle="Organisez et suivez toutes vos missions de transport"
        icon={MapPin}
        headerGradient="from-emerald-600 via-teal-700 to-cyan-600"
        actions={
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle mission
          </Button>
        }
      >
        <ModernStats stats={modernStats} />

        <ModernSection
          title="🔍 Rechercher des missions"
          subtitle="Trouvez rapidement la mission que vous cherchez"
          icon={Search}
          iconColor="text-emerald-600"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par titre, client ou destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-emerald-500/20 bg-white/80 backdrop-blur-sm text-gray-700">
              <option value="all">Tous les statuts</option>
              <option value="CONFIRMED">Confirmées</option>
              <option value="PENDING">En attente</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="COMPLETED">Terminées</option>
            </select>
          </div>
        </ModernSection>

        <ModernSection
          title="📋 Liste des missions"
          subtitle={`${missions.length} mission(s) programmée(s)`}
          icon={Calendar}
          iconColor="text-emerald-600"
          className="p-0"
        >
          <div className="p-0">
            <MissionsTable
              missions={missions.filter(m => 
                !searchTerm || 
                m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.destination.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              onEdit={(mission) => {
                setSelectedMission(mission)
                setEditModalOpen(true)
              }}
              onDelete={(mission) => {
                setSelectedMission(mission)
                setDeleteDialogOpen(true)
              }}
              onAssignDriver={(mission) => {
                setSelectedMission(mission)
                setAssignDriverOpen(true)
              }}
              onAssignVehicle={(mission) => {
                setSelectedMission(mission)
                setAssignVehicleOpen(true)
              }}
              loading={loading}
            />
          </div>
        </ModernSection>
      </ModernPageLayout>

      {/* Modals */}
      <CreateMissionModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSave={(data) => {
          setMissions(prev => [...prev, { id: `mission-${Date.now()}`, ...data }])
          toast.success('Mission créée avec succès')
        }}
      />

      {selectedMission && (
        <>
          <EditMissionModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            mission={selectedMission}
            onSave={(data) => {
              setMissions(prev => prev.map(m => 
                m.id === selectedMission.id ? { ...m, ...data } : m
              ))
              toast.success('Mission modifiée avec succès')
            }}
          />

          <DeleteMissionDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            mission={selectedMission}
            onConfirm={() => {
              setMissions(prev => prev.filter(m => m.id !== selectedMission.id))
              toast.success('Mission supprimée avec succès')
            }}
          />

          <AssignDriverModal
            open={assignDriverOpen}
            onOpenChange={setAssignDriverOpen}
            mission={selectedMission}
            onSave={(driver) => {
              setMissions(prev => prev.map(m => 
                m.id === selectedMission.id ? { ...m, driver: driver.name } : m
              ))
              toast.success('Chauffeur assigné avec succès')
            }}
          />

          <AssignVehicleModal
            open={assignVehicleOpen}
            onOpenChange={setAssignVehicleOpen}
            mission={selectedMission}
            onSave={(vehicle) => {
              setMissions(prev => prev.map(m => 
                m.id === selectedMission.id ? { ...m, vehicle: `${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})` } : m
              ))
              toast.success('Véhicule assigné avec succès')
            }}
          />
        </>
      )}
    </DashboardLayout>
  )
}