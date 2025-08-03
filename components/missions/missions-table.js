'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Edit3, 
  Trash2, 
  MoreHorizontal, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  XCircle,
  Users,
  MapPin,
  Car,
  UserCheck
} from 'lucide-react'

export function MissionsTable({ 
  missions, 
  onEdit, 
  onDelete, 
  onStatusUpdate, 
  onAssignDriver,
  onAssignVehicle,
  canManage, 
  showAllColumns = true 
}) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        label: 'En attente', 
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
        icon: Clock
      },
      confirmed: { 
        label: 'Confirmé', 
        className: 'bg-green-100 text-green-800 hover:bg-green-100',
        icon: CheckCircle
      },
      completed: { 
        label: 'Terminé', 
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
        icon: CheckCircle
      },
      cancelled: { 
        label: 'Annulé', 
        className: 'bg-red-100 text-red-800 hover:bg-red-100',
        icon: XCircle
      }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const truncateText = (text, maxLength = 30) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (missions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <MapPin className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune mission trouvée</h3>
        <p className="text-gray-500">Aucune mission ne correspond à vos critères de recherche.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mission</TableHead>
            <TableHead>Trajet</TableHead>
            <TableHead>Date & Heure</TableHead>
            <TableHead>Passagers</TableHead>
            <TableHead>Statut</TableHead>
            {showAllColumns && <TableHead>Client</TableHead>}
            {showAllColumns && <TableHead>Assignations</TableHead>}
            {canManage && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {missions.map((mission) => (
            <TableRow key={mission.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center">
                    {getStatusIcon(mission.status)}
                    <span className="ml-2 font-medium text-gray-900">
                      {mission.mission_number}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {truncateText(mission.title, 40)}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-3 w-3 mr-1 text-green-600" />
                    <span>{truncateText(mission.departure_location, 25)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-3 w-3 mr-1 text-red-600" />
                    <span>{truncateText(mission.destination, 25)}</span>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1 text-sm">
                  <div className="font-medium text-gray-900">
                    {formatDate(mission.departure_date)}
                  </div>
                  <div className="text-gray-600">
                    {formatTime(mission.departure_date)}
                    {mission.return_date && (
                      <span> - {formatTime(mission.return_date)}</span>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="font-medium">{mission.passenger_count}</span>
                </div>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(mission.status)}
              </TableCell>
              
              {showAllColumns && (
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium text-gray-900">
                      {truncateText(mission.client_name, 20)}
                    </div>
                    {mission.client_phone && (
                      <div className="text-gray-600">
                        {mission.client_phone}
                      </div>
                    )}
                  </div>
                </TableCell>
              )}
              
              {showAllColumns && (
                <TableCell>
                  <div className="space-y-2">
                    {/* Vehicle Assignment */}
                    {mission.vehicle ? (
                      <div className="flex items-center text-xs">
                        <Car className="h-3 w-3 mr-1 text-blue-600" />
                        <span className="text-gray-700">
                          {mission.vehicle.license_plate}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-orange-600">
                        <Car className="h-3 w-3 mr-1" />
                        <span>Non assigné</span>
                      </div>
                    )}
                    
                    {/* Driver Assignment */}
                    {mission.driver ? (
                      <div className="flex items-center text-xs">
                        <UserCheck className="h-3 w-3 mr-1 text-green-600" />
                        <span className="text-gray-700">
                          {mission.driver.first_name} {mission.driver.last_name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-orange-600">
                        <UserCheck className="h-3 w-3 mr-1" />
                        <span>Non assigné</span>
                      </div>
                    )}
                  </div>
                </TableCell>
              )}
              
              {canManage && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onEdit(mission)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      
                      {!mission.driver_id ? (
                        <DropdownMenuItem onClick={() => onAssignDriver(mission)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Assigner chauffeur
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onAssignDriver(mission)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Changer chauffeur
                        </DropdownMenuItem>
                      )}
                      
                      {!mission.vehicle_id ? (
                        <DropdownMenuItem onClick={() => onAssignVehicle(mission)}>
                          <Car className="mr-2 h-4 w-4" />
                          Assigner véhicule
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onAssignVehicle(mission)}>
                          <Car className="mr-2 h-4 w-4" />
                          Changer véhicule
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem 
                        onClick={() => onStatusUpdate(mission.id, 'confirmed')}
                        disabled={mission.status === 'confirmed' || mission.status === 'completed'}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirmer
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => onStatusUpdate(mission.id, 'completed')}
                        disabled={mission.status === 'completed' || mission.status === 'cancelled'}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marquer terminée
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => onStatusUpdate(mission.id, 'cancelled')}
                        disabled={mission.status === 'cancelled' || mission.status === 'completed'}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Annuler
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => onDelete(mission)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}