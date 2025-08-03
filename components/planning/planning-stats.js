'use client'

import { Card, CardContent } from '@/components/ui/card'
import { 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Car, 
  Users 
} from 'lucide-react'

export function PlanningStats({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total missions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMissions}</p>
            </div>
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assignées</p>
              <p className="text-2xl font-bold text-green-600">{stats.assignedMissions}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non assignées</p>
              <p className="text-2xl font-bold text-orange-600">{stats.unassignedMissions}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Véhicules libres</p>
              <p className="text-2xl font-bold text-blue-600">{stats.availableVehicles}</p>
            </div>
            <Car className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chauffeurs libres</p>
              <p className="text-2xl font-bold text-purple-600">{stats.availableDrivers}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}