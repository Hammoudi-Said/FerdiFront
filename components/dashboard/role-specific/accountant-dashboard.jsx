'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { hasPermission, PERMISSIONS } from '@/lib/utils/permission-manager'
import { 
  Euro, 
  TrendingUp, 
  TrendingDown,
  Receipt,
  AlertCircle,
  Download,
  FileText,
  Calendar,
  PieChart,
  BarChart3,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

/**
 * 💰 ACCOUNTANT DASHBOARD - Gestion financière et facturation
 * Conforme OpenAPI - ACCOUNTANT accès aux données financières
 */
export function AccountantDashboard() {
  const { user, company } = useAuthStore()
  const [financials, setFinancials] = useState({
    monthly: {
      revenue: 0,
      expenses: 0,
      profit: 0,
      growth: 0
    },
    pending: {
      invoices: [],
      payments: [],
      expenses: []
    },
    analytics: {
      topRoutes: [],
      costBreakdown: []
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = async () => {
    try {
      // Simuler le chargement des données financières
      setFinancials({
        monthly: {
          revenue: 87350,
          expenses: 52100,
          profit: 35250,
          growth: 8.2
        },
        pending: {
          invoices: [
            {
              id: 'INV-2024-001',
              client: 'Lycée Victor Hugo',
              amount: 2850,
              dueDate: '2024-09-05',
              status: 'overdue'
            },
            {
              id: 'INV-2024-002', 
              client: 'Mairie de Quimper',
              amount: 4200,
              dueDate: '2024-09-10',
              status: 'pending'
            }
          ],
          payments: [
            {
              id: 'PAY-001',
              description: 'Maintenance véhicules',
              amount: 3200,
              dueDate: '2024-08-31',
              category: 'maintenance'
            }
          ],
          expenses: [
            {
              id: 'EXP-001',
              description: 'Carburant - Août 2024',
              amount: 8500,
              status: 'pending_approval',
              submittedBy: 'Pierre Bernard'
            }
          ]
        },
        analytics: {
          topRoutes: [
            { name: 'Paris-Lyon', revenue: 15400, margin: 22 },
            { name: 'Bordeaux-Toulouse', revenue: 12200, margin: 18 },
            { name: 'Marseille-Nice', revenue: 9800, margin: 25 }
          ],
          costBreakdown: [
            { category: 'Carburant', amount: 18500, percentage: 35 },
            { category: 'Maintenance', amount: 12300, percentage: 24 },
            { category: 'Salaires chauffeurs', amount: 15200, percentage: 29 },
            { category: 'Assurances', amount: 6100, percentage: 12 }
          ]
        }
      })
    } catch (error) {
      console.error('Erreur chargement dashboard comptable:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!hasPermission(user?.role, PERMISSIONS.BILLING_READ)) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-semibold">Accès non autorisé</h3>
        <p className="text-muted-foreground">Cette page est réservée aux comptables.</p>
      </div>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount)
  }

  const getInvoiceStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Payée</Badge>
      case 'pending':
        return <Badge className="bg-orange-500">En attente</Badge>
      case 'overdue':
        return <Badge className="bg-red-500">En retard</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Financier</h1>
        <p className="text-muted-foreground">
          Bonjour {user?.first_name} • Gestion financière • {company?.name}
        </p>
      </div>

      {/* Métriques financières */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financials.monthly.revenue)}</div>
            <p className="text-xs text-muted-foreground">ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Charges</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financials.monthly.expenses)}</div>
            <p className="text-xs text-muted-foreground">dépenses totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice net</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(financials.monthly.profit)}</div>
            <p className="text-xs text-muted-foreground">marge: {((financials.monthly.profit / financials.monthly.revenue) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Croissance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{financials.monthly.growth}%</div>
            <p className="text-xs text-muted-foreground">vs mois précédent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Factures en attente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="mr-2 h-5 w-5" />
              Factures en attente
            </CardTitle>
            <CardDescription>Suivi des paiements clients</CardDescription>
          </CardHeader>
          <CardContent>
            {financials.pending.invoices.length === 0 ? (
              <div className="text-center py-6">
                <Receipt className="mx-auto h-8 w-8 text-green-500" />
                <p className="mt-2 text-muted-foreground">Toutes les factures sont à jour</p>
              </div>
            ) : (
              <div className="space-y-3">
                {financials.pending.invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          {getInvoiceStatusBadge(invoice.status)}
                          <span className="font-medium">{invoice.id}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{invoice.client}</p>
                        <p className="text-sm">Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(invoice.amount)}</p>
                        <Button size="sm" variant="outline">
                          Relancer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dépenses à approuver */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Dépenses à valider
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financials.pending.expenses.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="mx-auto h-8 w-8 text-green-500" />
                <p className="mt-2 text-muted-foreground">Aucune dépense en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {financials.pending.expenses.map((expense) => (
                  <div key={expense.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">Par: {expense.submittedBy}</p>
                        <Badge variant="outline" className="mt-1">En attente</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(expense.amount)}</p>
                        <div className="flex space-x-1 mt-1">
                          <Button size="sm" className="bg-green-600">
                            Approuver
                          </Button>
                          <Button size="sm" variant="outline">
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analyses financières */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top routes par revenus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Routes les plus rentables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {financials.analytics.topRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{route.name}</p>
                    <p className="text-sm text-muted-foreground">Marge: {route.margin}%</p>
                  </div>
                  <p className="font-bold">{formatCurrency(route.revenue)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Répartition des coûts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Répartition des coûts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {financials.analytics.costBreakdown.map((cost, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{cost.category}</p>
                    <p className="font-bold">{formatCurrency(cost.amount)}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${cost.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{cost.percentage}% du total</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Link href="/dashboard/invoices" className="w-full">
            <Button variant="outline" className="w-full justify-start">
              <Receipt className="mr-2 h-4 w-4" />
              Gérer factures
            </Button>
          </Link>

          <Link href="/dashboard/reports" className="w-full">
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Rapports détaillés
            </Button>
          </Link>

          <Button variant="outline" className="w-full justify-start">
            <Download className="mr-2 h-4 w-4" />
            Export comptable
          </Button>

          <Link href="/dashboard/legal-documents" className="w-full">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Documents légaux
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}