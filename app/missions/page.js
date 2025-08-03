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
import { MissionsTable } from '@/components/missions/missions-table'
import { CreateMissionModal } from '@/components/missions/create-mission-modal'
import { EditMissionModal } from '@/components/missions/edit-mission-modal'
import { DeleteMissionDialog } from '@/components/missions/delete-mission-dialog'
import { AssignDriverModal } from '@/components/missions/assign-driver-modal'
import { AssignVehicleModal } from '@/components/missions/assign-vehicle-modal'
import { missionsAPI } from '@/lib/api-client'
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Users,
  Bus
} from 'lucide-react'
import { toast } from 'sonner'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Mock data for missions
const mockMissions = [
  {
    id: 'mission-001',
    mission_number: 'MSN-2025-001',
    title: 'Transport scolaire Lyon - Paris',
    departure_location: 'Lyon, Place Bellecour',
    destination: 'Paris, Gare de Lyon',
    departure_date: '2025-01-15T08:00:00Z',
    return_date: '2025-01-15T20:00:00Z',
    passenger_count: 45,
    status: 'confirmed',
    vehicle_id: 'vehicle-001',
    driver_id: 'user-driver-001',
    client_name: 'Lycée Jean Moulin',
    client_phone: '04 78 12 34 56',
    special_instructions: 'Arrêt prévu à Mâcon pour pause déjeuner',
    created_at: '2024-12-01T10:00:00Z',
    vehicle: {
      license_plate: 'AB-123-CD',
      brand: 'Mercedes',
      model: 'Travego'
    },
    driver: {
      first_name: 'Pierre',
      last_name: 'Bernard'
    }
  },
  {
    id: 'mission-002',
    mission_number: 'MSN-2025-002',
    title: 'Excursion touristique Provence',
    departure_location: 'Marseille, Vieux Port',
    destination: 'Aix-en-Provence, Centre historique',
    departure_date: '2025-01-20T09:30:00Z',
    return_date: '2025-01-20T18:00:00Z',
    passenger_count: 35,
    status: 'pending',
    client_name: 'Office de Tourisme PACA',
    client_phone: '04 91 55 66 77',
    special_instructions: 'Guide touristique à bord',
    created_at: '2024-12-03T14:00:00Z'
  },
  {
    id: 'mission-003',
    mission_number: 'MSN-2025-003',
    title: 'Transfert aéroport Roissy',
    departure_location: 'Paris, Hôtel Le Meurice',
    destination: 'Aéroport Charles de Gaulle, Terminal 2E',
    departure_date: '2025-01-25T05:30:00Z',
    passenger_count: 8,
    status: 'confirmed',
    vehicle_id: 'vehicle-005',
    driver_id: 'user-driver-002',
    client_name: 'Entreprise International Corp',
    client_phone: '01 42 33 44 55',
    special_instructions: 'Vol à 08h15, prévoir 2h30 d\'avance',
    created_at: '2024-12-05T16:30:00Z',
    vehicle: {
      license_plate: 'QR-345-ST',
      brand: 'Mercedes',
      model: 'Sprinter'
    },
    driver: {
      first_name: 'Sophie',
      last_name: 'Dubois'
    }
  },
  {
    id: 'mission-004',
    mission_number: 'MSN-2025-004',
    title: 'Transport entreprise séminaire',
    departure_location: 'Toulouse, Centre de congrès',
    destination: 'Bordeaux, Château du Vignoble',
    departure_date: '2025-02-01T07:00:00Z',
    return_date: '2025-02-03T19:00:00Z',
    passenger_count: 50,
    status: 'cancelled',
    client_name: 'TechCorp Solutions',
    client_phone: '05 61 22 33 44',
    special_instructions: 'Mission annulée suite à reports du séminaire',
    created_at: '2024-12-07T11:00:00Z'
  }
]

export default function MissionsPage() {
  const { hasPermission, updateActivity, user } = useAuthStore()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assignDriverModalOpen, setAssignDriverModalOpen] = useState(false)
  const [assignVehicleModalOpen, setAssignVehicleModalOpen] = useState(false)
  const [selectedMission, setSelectedMission] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0
  })

  useEffect(() => {
    updateActivity()
    loadMissions()
  }, [updateActivity])

  const loadMissions = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK_DATA) {
        // Filter missions for drivers (only their assigned missions)
        let filteredMissions = mockMissions
        if (user?.role === '4') { // Driver role
          filteredMissions = mockMissions.filter(m => m.driver_id === user.id)
        }
        setMissions(filteredMissions)
        calculateStats(filteredMissions)
      } else {
        const params = {}
        if (user?.role === '4') { // Driver role
          params.driver_id = user.id
        }
        const response = await missionsAPI.getMissions(params)
        setMissions(response.data.data || response.data)
        calculateStats(response.data.data || response.data)
      }
    } catch (error) {
      console.error('Failed to load missions:', error)
      toast.error('Erreur lors du chargement des missions')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (missionsList) => {
    const total = missionsList.length
    const confirmed = missionsList.filter(m => m.status === 'confirmed').length
    const pending = missionsList.filter(m => m.status === 'pending').length
    const cancelled = missionsList.filter(m => m.status === 'cancelled').length
    const completed = missionsList.filter(m => m.status === 'completed').length

    setStats({ total, confirmed, pending, cancelled, completed })
  }

  const handleCreateMission = async (missionData) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock mission creation
        const newMission = {
          id: `mission-${Date.now()}`,
          mission_number: `MSN-2025-${String(missions.length + 1).padStart(3, '0')}`,
          ...missionData,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
        setMissions(prev => [...prev, newMission])
        calculateStats([...missions, newMission])
        toast.success('Mission créée avec succès')
      } else {
        await missionsAPI.createMission(missionData)
        await loadMissions()
        toast.success('Mission créée avec succès')
      }
    } catch (error) {
      console.error('Failed to create mission:', error)
      toast.error('Erreur lors de la création de la mission')
      throw error
    }
  }

  const handleEditMission = async (missionId, missionData) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock mission update
        setMissions(prev => prev.map(m => 
          m.id === missionId ? { ...m, ...missionData } : m
        ))
        toast.success('Mission modifiée avec succès')
      } else {
        await missionsAPI.updateMission(missionId, missionData)
        await loadMissions()
        toast.success('Mission modifiée avec succès')
      }
    } catch (error) {
      console.error('Failed to update mission:', error)
      toast.error('Erreur lors de la modification de la mission')
      throw error
    }
  }

  const handleDeleteMission = async (missionId) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock mission deletion
        const updatedMissions = missions.filter(m => m.id !== missionId)
        setMissions(updatedMissions)
        calculateStats(updatedMissions)
        toast.success('Mission supprimée avec succès')
      } else {
        await missionsAPI.deleteMission(missionId)
        await loadMissions()
        toast.success('Mission supprimée avec succès')
      }
    } catch (error) {
      console.error('Failed to delete mission:', error)
      toast.error('Erreur lors de la suppression de la mission')
      throw error
    }
  }

  const handleStatusUpdate = async (missionId, newStatus) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock status update
        setMissions(prev => prev.map(m => 
          m.id === missionId ? { ...m, status: newStatus } : m
        ))
        toast.success('Statut mis à jour avec succès')
      } else {
        await missionsAPI.updateMissionStatus(missionId, newStatus)
        await loadMissions()
        toast.success('Statut mis à jour avec succès')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const handleAssignDriver = async (missionId, driverId) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock driver assignment
        setMissions(prev => prev.map(m => 
          m.id === missionId ? { 
            ...m, 
            driver_id: driverId,
            driver: { first_name: 'Nouveau', last_name: 'Chauffeur' } // Mock driver info
          } : m
        ))
        toast.success('Chauffeur assigné avec succès')
      } else {
        await missionsAPI.assignDriver(missionId, driverId)
        await loadMissions()
        toast.success('Chauffeur assigné avec succès')
      }
    } catch (error) {
      console.error('Failed to assign driver:', error)
      toast.error('Erreur lors de l\'assignation du chauffeur')
      throw error
    }
  }

  const handleAssignVehicle = async (missionId, vehicleId) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock vehicle assignment
        setMissions(prev => prev.map(m => 
          m.id === missionId ? { 
            ...m, 
            vehicle_id: vehicleId,
            vehicle: { license_plate: 'XX-000-XX', brand: 'Nouveau', model: 'Véhicule' } // Mock vehicle info
          } : m
        ))
        toast.success('Véhicule assigné avec succès')
      } else {
        await missionsAPI.assignVehicle(missionId, vehicleId)
        await loadMissions()
        toast.success('Véhicule assigné avec succès')
      }
    } catch (error) {
      console.error('Failed to assign vehicle:', error)
      toast.error('Erreur lors de l\'assignation du véhicule')
      throw error
    }
  }

  const handleEditClick = (mission) => {
    setSelectedMission(mission)
    setEditModalOpen(true)
  }

  const handleDeleteClick = (mission) => {
    setSelectedMission(mission)
    setDeleteDialogOpen(true)
  }

  const handleAssignDriverClick = (mission) => {
    setSelectedMission(mission)
    setAssignDriverModalOpen(true)
  }

  const handleAssignVehicleClick = (mission) => {
    setSelectedMission(mission)
    setAssignVehicleModalOpen(true)
  }

  const exportMissions = () => {
    const csvContent = [
      ['Numéro', 'Titre', 'Départ', 'Destination', 'Date', 'Passagers', 'Statut', 'Client'].join(','),
      ...filteredMissions.map(mission => [
        mission.mission_number,
        mission.title,
        mission.departure_location,
        mission.destination,
        new Date(mission.departure_date).toLocaleDateString('fr-FR'),
        mission.passenger_count,
        getStatusLabel(mission.status),
        mission.client_name
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `missions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusLabel = (status) => {
    const statusLabels = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé'
    }
    return statusLabels[status] || status
  }

  // Filter missions based on search term, status, and date
  const filteredMissions = missions.filter(mission => {
    const matchesSearch = !searchTerm || 
      mission.mission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.departure_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.destination.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || mission.status === filterStatus
    
    let matchesDate = true
    if (filterDate !== 'all') {
      const missionDate = new Date(mission.departure_date)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      
      switch (filterDate) {
        case 'today':
          matchesDate = missionDate.toDateString() === today.toDateString()
          break
        case 'tomorrow':
          matchesDate = missionDate.toDateString() === tomorrow.toDateString()
          break
        case 'week':
          matchesDate = missionDate >= today && missionDate <= nextWeek
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const canManageMissions = hasPermission('routes_manage')
  const canViewAllMissions = user?.role !== '4' // Not driver

  return (
    <RoleGuard allowedRoles={['1', '2', '3', '4', '5']} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.role === '4' ? 'Mes missions' : 'Gestion des missions'}
              </h1>
              <p className="text-gray-600">
                {user?.role === '4' 
                  ? 'Consultez vos missions assignées'
                  : 'Gérez les missions de transport de votre flotte'
                }
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={exportMissions}
                disabled={filteredMissions.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Exporter CSV
              </Button>
              {canManageMissions && (
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle mission
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
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Confirmées</p>
                    <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Terminées</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Annulées</p>
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
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
                      placeholder="Rechercher par numéro, titre, client ou destination..."
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
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
                
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Toutes les dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="tomorrow">Demain</option>
                  <option value="week">Cette semaine</option>
                </select>
              </div>
              
              {(searchTerm || filterStatus !== 'all' || filterDate !== 'all') && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {filteredMissions.length} mission(s) trouvée(s)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setFilterStatus('all')
                      setFilterDate('all')
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Missions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Missions ({filteredMissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <MissionsTable
                  missions={filteredMissions}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onStatusUpdate={handleStatusUpdate}
                  onAssignDriver={handleAssignDriverClick}
                  onAssignVehicle={handleAssignVehicleClick}
                  canManage={canManageMissions}
                  showAllColumns={canViewAllMissions}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        {canManageMissions && (
          <CreateMissionModal
            open={createModalOpen}
            onOpenChange={setCreateModalOpen}
            onSave={handleCreateMission}
          />
        )}

        {selectedMission && canManageMissions && (
          <EditMissionModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            mission={selectedMission}
            onSave={(data) => handleEditMission(selectedMission.id, data)}
          />
        )}

        {selectedMission && canManageMissions && (
          <DeleteMissionDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            mission={selectedMission}
            onConfirm={() => handleDeleteMission(selectedMission.id)}
          />
        )}

        {selectedMission && canManageMissions && (
          <AssignDriverModal
            open={assignDriverModalOpen}
            onOpenChange={setAssignDriverModalOpen}
            mission={selectedMission}
            onSave={(driverId) => handleAssignDriver(selectedMission.id, driverId)}
          />
        )}

        {selectedMission && canManageMissions && (
          <AssignVehicleModal
            open={assignVehicleModalOpen}
            onOpenChange={setAssignVehicleModalOpen}
            mission={selectedMission}
            onSave={(vehicleId) => handleAssignVehicle(selectedMission.id, vehicleId)}
          />
        )}
      </DashboardLayout>
    </RoleGuard>
  )
}