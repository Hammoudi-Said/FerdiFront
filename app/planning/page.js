'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { PlanningCalendar } from '@/components/planning/planning-calendar'
import { PlanningFilters } from '@/components/planning/planning-filters'
import { PlanningStats } from '@/components/planning/planning-stats'
import { QuickAssignModal } from '@/components/planning/quick-assign-modal'
import { planningAPI, missionsAPI } from '@/lib/api-client'
import {
  Calendar,
  Filter,
  RefreshCw,
  Users,
  Car,
  MapPin,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Mock planning data
const mockPlanningData = {
  missions: [
    {
      id: 'mission-001',
      mission_number: 'MSN-2025-001',
      title: 'Transport scolaire Lyon - Paris',
      departure_date: '2025-01-15T08:00:00Z',
      return_date: '2025-01-15T20:00:00Z',
      status: 'confirmed',
      vehicle_id: 'vehicle-001',
      driver_id: 'user-driver-001',
      passenger_count: 45,
      departure_location: 'Lyon, Place Bellecour',
      destination: 'Paris, Gare de Lyon',
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
      departure_date: '2025-01-20T09:30:00Z',
      return_date: '2025-01-20T18:00:00Z',
      status: 'pending',
      passenger_count: 35,
      departure_location: 'Marseille, Vieux Port',
      destination: 'Aix-en-Provence, Centre historique'
    },
    {
      id: 'mission-003',
      mission_number: 'MSN-2025-003',
      title: 'Transfert aéroport Roissy',
      departure_date: '2025-01-25T05:30:00Z',
      status: 'confirmed',
      vehicle_id: 'vehicle-005',
      driver_id: 'user-driver-002',
      passenger_count: 8,
      departure_location: 'Paris, Hôtel Le Meurice',
      destination: 'Aéroport Charles de Gaulle, Terminal 2E',
      vehicle: {
        license_plate: 'QR-345-ST',
        brand: 'Mercedes',
        model: 'Sprinter'
      },
      driver: {
        first_name: 'Sophie',
        last_name: 'Dubois'
      }
    }
  ],
  vehicles: [
    {
      id: 'vehicle-001',
      license_plate: 'AB-123-CD',
      brand: 'Mercedes',
      model: 'Travego',
      status: 'in_use',
      current_mission_id: 'mission-001'
    },
    {
      id: 'vehicle-002',
      license_plate: 'EF-456-GH',
      brand: 'Setra',
      model: 'S515HD',
      status: 'available'
    },
    {
      id: 'vehicle-005',
      license_plate: 'QR-345-ST',
      brand: 'Mercedes',
      model: 'Sprinter',
      status: 'in_use',
      current_mission_id: 'mission-003'
    }
  ],
  drivers: [
    {
      id: 'user-driver-001',
      first_name: 'Pierre',
      last_name: 'Bernard',
      status: 'assigned',
      current_mission_id: 'mission-001'
    },
    {
      id: 'user-driver-002',
      first_name: 'Sophie',
      last_name: 'Dubois',
      status: 'assigned',
      current_mission_id: 'mission-003'
    },
    {
      id: 'user-driver-003',
      first_name: 'Lucas',
      last_name: 'Moreau',
      status: 'available'
    }
  ]
}

export default function PlanningPage() {
  const { hasPermission, updateActivity, user } = useAuthStore()
  const [planningData, setPlanningData] = useState({ missions: [], vehicles: [], drivers: [] })
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week') // 'week', 'month'
  const [filters, setFilters] = useState({
    status: 'all',
    showUnassigned: true,
    showAssigned: true,
    vehicleType: 'all'
  })
  const [quickAssignModalOpen, setQuickAssignModalOpen] = useState(false)
  const [selectedMission, setSelectedMission] = useState(null)
  const [stats, setStats] = useState({
    totalMissions: 0,
    assignedMissions: 0,
    unassignedMissions: 0,
    availableVehicles: 0,
    availableDrivers: 0
  })

  useEffect(() => {
    updateActivity()
    loadPlanningData()
  }, [updateActivity, selectedDate, viewMode])

  const loadPlanningData = async () => {
    try {
      setLoading(true)
      
      const startDate = viewMode === 'week' 
        ? startOfWeek(selectedDate, { locale: fr })
        : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      
      const endDate = viewMode === 'week'
        ? endOfWeek(selectedDate, { locale: fr })
        : new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)

      if (USE_MOCK_DATA) {
        // Filter mock data based on date range
        const filteredMissions = mockPlanningData.missions.filter(mission => {
          const missionDate = new Date(mission.departure_date)
          return missionDate >= startDate && missionDate <= endDate
        })

        setPlanningData({
          ...mockPlanningData,
          missions: filteredMissions
        })
        calculateStats({ ...mockPlanningData, missions: filteredMissions })
      } else {
        const response = await planningAPI.getPlanning(
          startDate.toISOString(),
          endDate.toISOString()
        )
        setPlanningData(response.data)
        calculateStats(response.data)
      }
    } catch (error) {
      console.error('Failed to load planning data:', error)
      toast.error('Erreur lors du chargement du planning')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const totalMissions = data.missions.length
    const assignedMissions = data.missions.filter(m => m.driver_id && m.vehicle_id).length
    const unassignedMissions = totalMissions - assignedMissions
    const availableVehicles = data.vehicles.filter(v => v.status === 'available').length
    const availableDrivers = data.drivers.filter(d => d.status === 'available').length

    setStats({
      totalMissions,
      assignedMissions,
      unassignedMissions,
      availableVehicles,
      availableDrivers
    })
  }

  const handleQuickAssign = async (missionId, assignments) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock quick assignment
        const updatedMissions = planningData.missions.map(mission => {
          if (mission.id === missionId) {
            return {
              ...mission,
              driver_id: assignments.driverId,
              vehicle_id: assignments.vehicleId,
              driver: assignments.driverId ? { first_name: 'Nouveau', last_name: 'Chauffeur' } : null,
              vehicle: assignments.vehicleId ? { license_plate: 'XX-000-XX', brand: 'Nouveau', model: 'Véhicule' } : null
            }
          }
          return mission
        })

        setPlanningData(prev => ({ ...prev, missions: updatedMissions }))
        calculateStats({ ...planningData, missions: updatedMissions })
        toast.success('Assignations mises à jour avec succès')
      } else {
        // Real API calls
        if (assignments.driverId) {
          await missionsAPI.assignDriver(missionId, assignments.driverId)
        }
        if (assignments.vehicleId) {
          await missionsAPI.assignVehicle(missionId, assignments.vehicleId)
        }
        
        await loadPlanningData() // Refresh data
        toast.success('Assignations mises à jour avec succès')
      }
    } catch (error) {
      console.error('Failed to update assignments:', error)
      toast.error('Erreur lors de la mise à jour des assignations')
      throw error
    }
  }

  const handleMissionClick = (mission) => {
    if (hasPermission('routes_manage')) {
      setSelectedMission(mission)
      setQuickAssignModalOpen(true)
    }
  }

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate)
  }

  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode)
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleRefresh = () => {
    loadPlanningData()
  }

  // Filter missions based on current filters
  const filteredMissions = planningData.missions.filter(mission => {
    if (filters.status !== 'all' && mission.status !== filters.status) return false
    
    if (!filters.showUnassigned && (!mission.driver_id || !mission.vehicle_id)) return false
    if (!filters.showAssigned && (mission.driver_id && mission.vehicle_id)) return false
    
    if (filters.vehicleType !== 'all' && mission.vehicle?.vehicle_type !== filters.vehicleType) return false
    
    return true
  })

  const getViewTitle = () => {
    if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { locale: fr })
      const weekEnd = endOfWeek(selectedDate, { locale: fr })
      return `Semaine du ${format(weekStart, 'dd', { locale: fr })} au ${format(weekEnd, 'dd MMMM yyyy', { locale: fr })}`
    } else {
      return format(selectedDate, 'MMMM yyyy', { locale: fr })
    }
  }

  const canManagePlanning = hasPermission('routes_manage')

  return (
    <RoleGuard allowedRoles={['1', '2', '3', '5']} showUnauthorized={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
              <p className="text-gray-600">Visualisez et gérez les missions, véhicules et chauffeurs</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('week')}
                  className="h-8"
                >
                  Semaine
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('month')}
                  className="h-8"
                >
                  Mois
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <PlanningStats stats={stats} />

          {/* Current View Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {getViewTitle()}
              </h2>
              <Badge variant="outline" className="text-sm">
                {filteredMissions.length} mission(s)
              </Badge>
            </div>
            
            <PlanningFilters 
              filters={filters} 
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Planning Calendar */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <PlanningCalendar
                  missions={filteredMissions}
                  vehicles={planningData.vehicles}
                  drivers={planningData.drivers}
                  selectedDate={selectedDate}
                  viewMode={viewMode}
                  onDateChange={handleDateChange}
                  onMissionClick={handleMissionClick}
                  canManage={canManagePlanning}
                />
              )}
            </CardContent>
          </Card>

          {/* Quick Assignment Info */}
          {!canManagePlanning && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="flex items-center p-4">
                <Clock className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-blue-900 font-medium">Mode consultation</p>
                  <p className="text-blue-700 text-sm">
                    Vous pouvez consulter le planning mais pas modifier les assignations.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unassigned Missions Alert */}
          {stats.unassignedMissions > 0 && canManagePlanning && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-orange-600 mr-3" />
                  <div>
                    <p className="text-orange-900 font-medium">
                      {stats.unassignedMissions} mission(s) non assignée(s)
                    </p>
                    <p className="text-orange-700 text-sm">
                      Certaines missions n'ont pas de chauffeur ou de véhicule assigné.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  onClick={() => {
                    const unassignedMission = planningData.missions.find(m => !m.driver_id || !m.vehicle_id)
                    if (unassignedMission) {
                      handleMissionClick(unassignedMission)
                    }
                  }}
                >
                  Assigner maintenant
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Assignment Modal */}
        {selectedMission && (
          <QuickAssignModal
            open={quickAssignModalOpen}
            onOpenChange={setQuickAssignModalOpen}
            mission={selectedMission}
            availableDrivers={planningData.drivers.filter(d => d.status === 'available')}
            availableVehicles={planningData.vehicles.filter(v => v.status === 'available')}
            onSave={(assignments) => handleQuickAssign(selectedMission.id, assignments)}
          />
        )}
      </DashboardLayout>
    </RoleGuard>
  )
}