'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  LifeBuoy,
  Phone,
  Mail,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building2,
  TrendingUp
} from 'lucide-react'

const mockSupportStats = {
  openTickets: 12,
  solvedToday: 8,
  avgResponseTime: '15min',
  satisfaction: 4.8,
  recentTickets: [
    {
      id: 'TIC-001',
      title: 'Problème de connexion application mobile',
      company: 'AutoCars Provence',
      user: 'Sophie Martin',
      priority: 'high',
      status: 'open',
      created: '2h',
      type: 'technical'
    },
    {
      id: 'TIC-002', 
      title: 'Demande de formation nouveau chauffeur',
      company: 'Transport Express Lyon',
      user: 'Jean Dupont',
      priority: 'medium',
      status: 'in_progress',
      created: '4h',
      type: 'training'
    },
    {
      id: 'TIC-003',
      title: 'Question sur facturation mensuelle',
      company: 'Cars du Sud-Ouest',
      user: 'Pierre Morel',
      priority: 'low',
      status: 'waiting',
      created: '1j',
      type: 'billing'
    },
    {
      id: 'TIC-004',
      title: 'Bug dans le planning hebdomadaire',
      company: 'Transport Rhône',
      user: 'Marie Dubois',
      priority: 'high',
      status: 'resolved',
      created: '2j',
      type: 'bug'
    }
  ],
  companyActivity: [
    {
      company: 'AutoCars Provence',
      activeUsers: 23,
      issues: 3,
      lastContact: '2h',
      status: 'active'
    },
    {
      company: 'Transport Express Lyon',
      activeUsers: 18,
      issues: 1,
      lastContact: '1j',
      status: 'active'
    },
    {
      company: 'Cars du Sud-Ouest',
      activeUsers: 31,
      issues: 2,
      lastContact: '3h',
      status: 'attention'
    }
  ],
  knowledgeBase: [
    {
      title: 'Configuration initiale application mobile',
      category: 'Mobile',
      views: 156,
      helpful: 89
    },
    {
      title: 'Procédure de sauvegarde des données',
      category: 'Technique',
      views: 143,
      helpful: 92
    },
    {
      title: 'Guide de facturation automatique',
      category: 'Facturation',
      views: 98,
      helpful: 76
    }
  ]
}

const getPriorityBadge = (priority) => {
  switch(priority) {
    case 'high':
      return <Badge className="bg-red-100 text-red-800">Urgent</Badge>
    case 'medium':
      return <Badge className="bg-orange-100 text-orange-800">Normal</Badge>
    case 'low':
      return <Badge className="bg-green-100 text-green-800">Faible</Badge>
    default:
      return <Badge variant="secondary">{priority}</Badge>
  }
}

const getStatusBadge = (status) => {
  switch(status) {
    case 'open':
      return <Badge className="bg-red-100 text-red-800">Ouvert</Badge>
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
    case 'waiting':
      return <Badge className="bg-orange-100 text-orange-800">En attente</Badge>
    case 'resolved':
      return <Badge className="bg-green-100 text-green-800">Résolu</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const getStatusIcon = (status) => {
  switch(status) {
    case 'open':
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    case 'in_progress':
      return <Clock className="h-4 w-4 text-blue-600" />
    case 'waiting':
      return <Clock className="h-4 w-4 text-orange-600" />
    case 'resolved':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

const getTypeIcon = (type) => {
  switch(type) {
    case 'technical':
      return <Phone className="h-4 w-4 text-blue-600" />
    case 'training':
      return <User className="h-4 w-4 text-green-600" />
    case 'billing':
      return <TrendingUp className="h-4 w-4 text-orange-600" />
    case 'bug':
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    default:
      return <MessageCircle className="h-4 w-4 text-gray-600" />
  }
}

export function SupportDashboard() {
  const { updateActivity } = useAuthStore()
  const [stats, setStats] = useState(mockSupportStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updateActivity()
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [updateActivity])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <LifeBuoy className="mr-3 h-6 w-6 text-orange-600" />
            Centre de Support
          </h1>
          <p className="text-gray-600">Assistance et support client FERDI</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            <MessageCircle className="mr-2 h-4 w-4" />
            Nouveau ticket
          </Button>
        </div>
      </div>

      {/* Support Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.openTickets}</p>
                <p className="text-xs text-gray-600">Tickets ouverts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.solvedToday}</p>
                <p className="text-xs text-gray-600">Résolus aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
                <p className="text-xs text-gray-600">Temps de réponse</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.satisfaction}/5</p>
                <p className="text-xs text-gray-600">Satisfaction client</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets & Company Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Support Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tickets Récents</CardTitle>
              <CardDescription>Dernières demandes de support</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Voir tous
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(ticket.type)}
                      <div>
                        <h4 className="font-medium text-sm">{ticket.title}</h4>
                        <p className="text-xs text-gray-600">
                          {ticket.company} • {ticket.user}
                        </p>
                      </div>
                    </div>
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      {getStatusBadge(ticket.status)}
                    </div>
                    <span className="text-xs text-gray-500">
                      Il y a {ticket.created}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Company Activity Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-blue-600" />
              Activité Entreprises
            </CardTitle>
            <CardDescription>État des entreprises clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.companyActivity.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{company.company}</h4>
                      <p className="text-sm text-gray-600">
                        {company.activeUsers} utilisateurs actifs
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={company.status === 'active' ? 'default' : 'secondary'}
                        className={company.status === 'attention' ? 'bg-orange-100 text-orange-800' : ''}
                      >
                        {company.issues} ticket{company.issues > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Dernier contact: {company.lastContact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Base */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Base de Connaissances</CardTitle>
            <CardDescription>Articles les plus consultés</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            Gérer articles
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.knowledgeBase.map((article, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="text-sm text-gray-600">
                      Catégorie: {article.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="text-center">
                      <p className="font-medium">{article.views}</p>
                      <p className="text-xs">Vues</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-green-600">{article.helpful}%</p>
                      <p className="text-xs">Utile</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}