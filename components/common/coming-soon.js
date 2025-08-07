'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Wrench,
  ArrowLeft,
  Clock,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

export function ComingSoonPage({ 
  title, 
  description, 
  icon: Icon,
  features = [],
  expectedDate = "Très prochainement",
  priority = "high" // high, medium, low
}) {
  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'high':
        return {
          badge: 'Priorité élevée',
          badgeClass: 'bg-red-100 text-red-800 hover:bg-red-100',
          icon: AlertTriangle,
          color: 'text-red-600'
        }
      case 'medium':
        return {
          badge: 'En développement',
          badgeClass: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
          icon: Clock,
          color: 'text-orange-600'
        }
      case 'low':
        return {
          badge: 'Planifié',
          badgeClass: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
          icon: Calendar,
          color: 'text-blue-600'
        }
      default:
        return {
          badge: 'En développement',
          badgeClass: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
          icon: Clock,
          color: 'text-gray-600'
        }
    }
  }

  const priorityConfig = getPriorityConfig(priority)
  const PriorityIcon = priorityConfig.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="text-center space-y-6">
          {/* Icon and Status */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-blue-100">
                <Icon className="h-12 w-12 text-blue-600" />
              </div>
              <div className="absolute -bottom-2 -right-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center border-2 border-white">
                  <Wrench className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <Badge className={priorityConfig.badgeClass}>
                <PriorityIcon className="h-3 w-3 mr-1" />
                {priorityConfig.badge}
              </Badge>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Status Card */}
          <Card className="max-w-2xl mx-auto bg-white/70 backdrop-blur-sm border-blue-200">
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2 text-blue-900">
                <Wrench className="h-5 w-5" />
                Module en cours de développement
              </CardTitle>
              <CardDescription className="text-gray-600">
                Notre équipe travaille activement sur cette fonctionnalité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Expected Timeline */}
              <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Calendar className={`h-5 w-5 ${priorityConfig.color}`} />
                <div className="text-center">
                  <p className="font-medium text-blue-900">Disponibilité prévue</p>
                  <p className={`text-sm ${priorityConfig.color}`}>{expectedDate}</p>
                </div>
              </div>

              {/* Features List */}
              {features.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Fonctionnalités prévues
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{feature.title}</p>
                          {feature.description && (
                            <p className="text-gray-600 text-xs mt-1">{feature.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900">Besoin d'informations ?</p>
                    <p className="text-yellow-700">
                      Contactez notre équipe support pour plus de détails sur cette fonctionnalité ou pour demander un accès anticipé.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}