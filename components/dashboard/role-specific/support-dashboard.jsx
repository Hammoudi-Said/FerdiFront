'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { hasPermission, PERMISSIONS } from '@/lib/utils/permission-manager'
import { 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  User,
  Calendar,
  Headphones,
  Ticket,
  Zap
} from 'lucide-react'
import Link from 'next/link'

/**
 * 🎧 SUPPORT DASHBOARD - Interface de support client
 * Conforme OpenAPI - INTERNAL_SUPPORT accès aux tickets et clients
 */
export function SupportDashboard() {
  const { user, company } = useAuthStore()
  const [supportData, setSupportData] = useState({
    tickets: {
      open: [],
      pending: [],
      resolved: []
    },
    stats: {
      todayTickets: 0,
      avgResponseTime: 0,
      satisfactionScore: 0,
      activeClients: 0
    },
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSupportData()
  }, [])

  const loadSupportData = async () => {
    try {
      // Simuler le chargement des données de support
      setSupportData({
        tickets: {
          open: [
            {
              id: 'TIC-001',
              client: 'Lycée Victor Hugo',
              subject: 'Retard sur la ligne scolaire',
              priority: 'high',
              created: '2024-08-29T08:30:00Z',
              assignedTo: user?.full_name,
              category: 'service'
            },
            {
              id: 'TIC-002',
              client: 'Mairie de Quimper', 
              subject: 'Demande de devis transport événement',
              priority: 'medium',
              created: '2024-08-29T10:15:00Z',
              assignedTo: user?.full_name,
              category: 'commercial'
            }
          ],
          pending: [
            {
              id: 'TIC-003',
              client: 'Entreprise TechStart',
              subject: 'Modification horaire navette',
              priority: 'low',
              created: '2024-08-28T16:00:00Z',
              category: 'planning'
            }
          ],
          resolved: []
        },
        stats: {
          todayTickets: 8,
          avgResponseTime: 23, // minutes
          satisfactionScore: 4.7,
          activeClients: 24
        },
        recentActivity: [
          {
            id: 1,
            type: 'ticket_created',
            description: 'Nouveau ticket créé par Lycée Victor Hugo',
            time: '08:30',
            priority: 'high'
          },
          {
            id: 2,
            type: 'ticket_resolved', 
            description: 'Ticket TIC-004 résolu pour Mairie de Brest',
            time: '09:45',
            priority: 'normal'
          },
          {
            id: 3,
            type: 'call_received',
            description: 'Appel reçu de Transport Régional SARL',
            time: '10:20',
            priority: 'normal'
          }
        ]
      })
    } catch (error) {
      console.error('Erreur chargement dashboard support:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!hasPermission(user?.role, PERMISSIONS.USERS_READ_COMPANY)) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-semibold">Accès non autorisé</h3>
        <p className="text-muted-foreground">Cette page est réservée au support interne.</p>
      </div>
    )
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500">Urgent</Badge>
      case 'medium':
        return <Badge className="bg-orange-500">Moyen</Badge>
      case 'low':
        return <Badge className="bg-green-500">Faible</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'ticket_created':
        return <Ticket className="h-4 w-4 text-red-500" />
      case 'ticket_resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'call_received':
        return <Phone className="h-4 w-4 text-blue-500" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  const formatTimeAgo = (timeString) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}j`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Centre de Support</h1>
        <p className="text-muted-foreground">
          Bonjour {user?.first_name} • Support client • {company?.name}
        </p>
      </div>

      {/* Métriques de support */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets aujourd'hui</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportData.stats.todayTickets}</div>
            <p className="text-xs text-muted-foreground">nouveaux tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de réponse</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportData.stats.avgResponseTime} min</div>
            <p className="text-xs text-muted-foreground">temps moyen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{supportData.stats.satisfactionScore}/5</div>
            <p className="text-xs text-muted-foreground">note moyenne</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportData.stats.activeClients}</div>
            <p className="text-xs text-muted-foreground">ce mois-ci</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tickets ouverts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Tickets ouverts ({supportData.tickets.open.length})
            </CardTitle>
            <CardDescription>Tickets nécessitant votre attention</CardDescription>
          </CardHeader>
          <CardContent>
            {supportData.tickets.open.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                <p className="mt-2 text-muted-foreground">Aucun ticket ouvert</p>
              </div>
            ) : (
              <div className="space-y-3">
                {supportData.tickets.open.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(ticket.priority)}
                          <span className="font-medium">{ticket.id}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(ticket.created)} ago
                          </span>
                        </div>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground">{ticket.client}</p>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Button size="sm">
                          Répondre
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="mr-1 h-3 w-3" />
                          Appeler
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supportData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets en attente */}
      {supportData.tickets.pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Tickets en attente ({supportData.tickets.pending.length})
            </CardTitle>
            <CardDescription>Tickets en attente de traitement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supportData.tickets.pending.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(ticket.priority)}
                      <span className="font-medium">{ticket.id}</span>
                    </div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground">{ticket.client}</p>
                  </div>
                  <Button size="sm">
                    Prendre en charge
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Button className="w-full justify-start">
            <Ticket className="mr-2 h-4 w-4" />
            Nouveau ticket
          </Button>

          <Link href="/dashboard/clients" className="w-full">
            <Button variant="outline" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Gérer clients
            </Button>
          </Link>

          <Button variant="outline" className="w-full justify-start">
            <Phone className="mr-2 h-4 w-4" />
            Journal d'appels
          </Button>

          <Button variant="outline" className="w-full justify-start">
            <Mail className="mr-2 h-4 w-4" />
            Base de connaissances
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}