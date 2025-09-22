'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ModernPageLayout, ModernStats, ModernSection } from '@/components/ui/modern-page-layout'
import { Button } from '@/components/ui/button'
import { PlanningCalendar } from '@/components/planning/planning-calendar'
import { PlanningFilters } from '@/components/planning/planning-filters'
import { PlanningStats } from '@/components/planning/planning-stats'
import { QuickAssignModal } from '@/components/planning/quick-assign-modal'
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function PlanningPage() {
  const { user, updateActivity } = useAuthStore()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [quickAssignOpen, setQuickAssignOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const [stats, setStats] = useState({
    today: 5,
    thisWeek: 23,
    completed: 156,
    pending: 8
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
          title: 'Transport école - Lycée Victor Hugo',
          start_time: '08:00',
          end_time: '17:00',
          date: new Date().toISOString().split('T')[0],
          driver: 'Jean Dupont',
          vehicle: 'Mercedes Sprinter (AB-123-CD)',
          status: 'CONFIRMED'
        },
        {
          id: 'mission-2',
          title: 'Sortie musée - École primaire',
          start_time: '09:30',
          end_time: '16:30',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          driver: 'Marie Martin',
          vehicle: 'Iveco Daily (EF-456-GH)',
          status: 'PENDING'
        }
      ]
      setMissions(mockMissions)
    } catch (error) {
      toast.error('Erreur lors du chargement du planning')
    } finally {
      setLoading(false)
    }
  }

  const modernStats = [
    {
      label: "Aujourd'hui",
      value: stats.today,
      icon: Clock,
      trend: '+2 vs hier'
    },
    {
      label: 'Cette semaine',
      value: stats.thisWeek,
      icon: Calendar,
      subtitle: '5 jours ouvrables'
    },
    {
      label: 'Terminées',
      value: stats.completed,
      icon: CheckCircle,
      subtitle: 'Ce mois-ci'
    },
    {
      label: 'En attente',
      value: stats.pending,
      icon: AlertCircle,
      subtitle: 'À assigner'
    }
  ]

  return (
    <DashboardLayout>
      <ModernPageLayout
        title="📅 Planning & Missions"
        subtitle="Organisez et suivez toutes vos missions de transport"
        icon={Calendar}
        headerGradient="from-green-600 via-green-700 to-teal-600"
        actions={
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setQuickAssignOpen(true)}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              size="sm"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Assignment rapide
            </Button>
            <Button
              onClick={() => toast.info('Fonctionnalité en développement')}
              className="bg-white text-green-600 hover:bg-white/90 shadow-lg"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle mission
            </Button>
          </div>
        }
      >
        <ModernStats stats={modernStats} />

        <ModernSection
          title="🗓️ Calendrier des missions"
          subtitle="Vue d'ensemble de vos missions planifiées"
          icon={Calendar}
          iconColor="text-green-600"
        >
          <PlanningCalendar
            missions={missions}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            loading={loading}
          />
        </ModernSection>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ModernSection
              title="📊 Statistiques du planning"
              subtitle="Analyse des performances de votre flotte"
              icon={TrendingUp}
              iconColor="text-green-600"
            >
              <PlanningStats missions={missions} />
            </ModernSection>
          </div>

          <div>
            <ModernSection
              title="🎯 Filtres rapides"
              subtitle="Personnalisez votre vue"
              icon={Users}
              iconColor="text-green-600"
            >
              <PlanningFilters
                onFilterChange={(filters) => {
                  // Logique de filtrage des missions
                  console.log('Filters applied:', filters)
                }}
              />
            </ModernSection>
          </div>
        </div>
      </ModernPageLayout>

      <QuickAssignModal
        open={quickAssignOpen}
        onOpenChange={setQuickAssignOpen}
        onSave={(assignment) => {
          toast.success('Mission assignée avec succès')
        }}
      />
    </DashboardLayout>
  )
}