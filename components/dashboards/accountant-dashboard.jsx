'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calculator,
  Receipt,
  TrendingUp,
  FileText,
  Download,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  BarChart3
} from 'lucide-react'

const mockAccountingStats = {
  monthlyRevenue: 68450,
  pendingInvoices: 12,
  overdue: 3,
  paidToday: 8,
  recentInvoices: [
    {
      id: 'INV-2025-001',
      client: 'AutoCars Provence',
      amount: 2450.00,
      date: '25/07/2025',
      dueDate: '24/08/2025',
      status: 'paid'
    },
    {
      id: 'INV-2025-002',
      client: 'Transport Express Lyon',
      amount: 3200.00,
      date: '24/07/2025',
      dueDate: '23/08/2025',
      status: 'sent'
    },
    {
      id: 'INV-2025-003',
      client: 'Cars du Sud-Ouest',
      amount: 1890.00,
      date: '23/07/2025',
      dueDate: '22/08/2025',
      status: 'overdue'
    },
    {
      id: 'INV-2025-004',
      client: 'Transport Rhône',
      amount: 4120.00,
      date: '22/07/2025',
      dueDate: '21/08/2025',
      status: 'draft'
    }
  ],
  monthlyBreakdown: {
    totalInvoiced: 68450,
    totalReceived: 52300,
    totalPending: 16150,
    averagePaymentTime: 18
  },
  upcomingPayments: [
    {
      client: 'AutoCars Provence',
      amount: 2450.00,
      dueDate: '26/07/2025',
      status: 'due_soon'
    },
    {
      client: 'Transport Express Lyon',
      amount: 3200.00,
      dueDate: '28/07/2025',
      status: 'due_soon'
    },
    {
      client: 'Cars du Sud-Ouest',
      amount: 1890.00,
      dueDate: '20/07/2025',
      status: 'overdue'
    }
  ],
  expenseCategories: [
    {
      category: 'Carburant',
      amount: 12450,
      percentage: 35,
      change: '+5%'
    },
    {
      category: 'Maintenance',
      amount: 8900,
      percentage: 25,
      change: '-2%'
    },
    {
      category: 'Salaires',
      amount: 9800,
      percentage: 28,
      change: '+1%'
    },
    {
      category: 'Assurances',
      amount: 4200,
      percentage: 12,
      change: '0%'
    }
  ]
}

const getStatusBadge = (status) => {
  switch(status) {
    case 'paid':
      return <Badge className="bg-green-100 text-green-800">Payée</Badge>
    case 'sent':
      return <Badge className="bg-blue-100 text-blue-800">Envoyée</Badge>
    case 'overdue':
      return <Badge className="bg-red-100 text-red-800">En retard</Badge>
    case 'draft':
      return <Badge className="bg-gray-100 text-gray-800">Brouillon</Badge>
    case 'due_soon':
      return <Badge className="bg-orange-100 text-orange-800">Bientôt due</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const getStatusIcon = (status) => {
  switch(status) {
    case 'paid':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'sent':
      return <Clock className="h-4 w-4 text-blue-600" />
    case 'overdue':
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    case 'draft':
      return <FileText className="h-4 w-4 text-gray-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

export function AccountantDashboard() {
  const { updateActivity } = useAuthStore()
  const [stats, setStats] = useState(mockAccountingStats)
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
            <Calculator className="mr-3 h-6 w-6 text-teal-600" />
            Comptabilité & Finance
          </h1>
          <p className="text-gray-600">Gestion financière et facturation</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <Receipt className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      {/* Financial Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">€{stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-600">CA du mois</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
                <p className="text-xs text-gray-600">Factures en attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-xs text-gray-600">Factures en retard</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-teal-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.paidToday}</p>
                <p className="text-xs text-gray-600">Payées aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
            Aperçu Financier Mensuel
          </CardTitle>
          <CardDescription>Performance financière du mois en cours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-800">
                €{stats.monthlyBreakdown.totalInvoiced.toLocaleString()}
              </p>
              <p className="text-sm text-green-600">Total facturé</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-800">
                €{stats.monthlyBreakdown.totalReceived.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600">Total encaissé</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-2xl font-bold text-orange-800">
                €{stats.monthlyBreakdown.totalPending.toLocaleString()}
              </p>
              <p className="text-sm text-orange-600">En attente</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-2xl font-bold text-purple-800">
                {stats.monthlyBreakdown.averagePaymentTime}j
              </p>
              <p className="text-sm text-purple-600">Délai moyen paiement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices & Upcoming Payments */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Factures Récentes</CardTitle>
              <CardDescription>Dernières factures émises</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Receipt className="mr-2 h-4 w-4" />
              Voir toutes
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(invoice.status)}
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-gray-600">
                        {invoice.client} • {invoice.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">€{invoice.amount.toFixed(2)}</p>
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-orange-600" />
              Paiements à Venir
            </CardTitle>
            <CardDescription>Factures dont l'échéance approche</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      payment.status === 'overdue' ? 'bg-red-500' :
                      payment.status === 'due_soon' ? 'bg-orange-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">{payment.client}</p>
                      <p className="text-sm text-gray-600">
                        Échéance: {payment.dueDate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">€{payment.amount.toFixed(2)}</p>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
              Répartition des Dépenses
            </CardTitle>
            <CardDescription>Analyse des coûts par catégorie</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Rapport détaillé
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.expenseCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{category.category}</span>
                    <Badge 
                      variant="outline" 
                      className={
                        category.change.startsWith('+') ? 'border-red-200 text-red-700' :
                        category.change.startsWith('-') ? 'border-green-200 text-green-700' :
                        'border-gray-200 text-gray-700'
                      }
                    >
                      {category.change}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">€{category.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{category.percentage}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}