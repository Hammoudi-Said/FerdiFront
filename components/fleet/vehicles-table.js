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
import { Edit3, Trash2, Wrench, MoreHorizontal, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

export function VehiclesTable({ vehicles, onEdit, onDelete, onMaintenance, onStatusUpdate, canManage }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('fr-FR').format(mileage) + ' km'
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { 
        label: 'Disponible', 
        className: 'bg-green-100 text-green-800 hover:bg-green-100',
        icon: CheckCircle
      },
      in_use: { 
        label: 'En mission', 
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
        icon: CheckCircle
      },
      maintenance: { 
        label: 'Maintenance', 
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
        icon: Wrench
      },
      out_of_service: { 
        label: 'Hors service', 
        className: 'bg-red-100 text-red-800 hover:bg-red-100',
        icon: AlertTriangle
      }
    }
    
    const config = statusConfig[status] || statusConfig.available
    const Icon = config.icon
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      autocar: { label: 'Autocar', className: 'bg-purple-100 text-purple-800' },
      minibus: { label: 'Minibus', className: 'bg-blue-100 text-blue-800' },
      van: { label: 'Van', className: 'bg-gray-100 text-gray-800' }
    }
    
    const config = typeConfig[type] || typeConfig.van
    
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const isMaintenanceDue = (vehicle) => {
    if (!vehicle.technical_control_expiry) return false
    const expiryDate = new Date(vehicle.technical_control_expiry)
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
    return expiryDate <= threeMonthsFromNow
  }

  const isInsuranceExpiring = (vehicle) => {
    if (!vehicle.insurance_expiry) return false
    const expiryDate = new Date(vehicle.insurance_expiry)
    const oneMonthFromNow = new Date()
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
    return expiryDate <= oneMonthFromNow
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 8a2 2 0 01-2-2V9a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun véhicule trouvé</h3>
        <p className="text-gray-500">Aucun véhicule ne correspond à vos critères de recherche.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Véhicule</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Capacité</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Kilométrage</TableHead>
            <TableHead>Contrôle technique</TableHead>
            <TableHead>Assurance</TableHead>
            {canManage && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">
                    {vehicle.license_plate}
                  </div>
                  <div className="text-sm text-gray-600">
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </div>
                  <div className="text-xs text-gray-500">
                    {vehicle.color}
                  </div>
                  {(isMaintenanceDue(vehicle) || isInsuranceExpiring(vehicle)) && (
                    <div className="flex space-x-1">
                      {isMaintenanceDue(vehicle) && (
                        <Badge variant="destructive" className="text-xs">
                          Contrôle technique bientôt
                        </Badge>
                      )}
                      {isInsuranceExpiring(vehicle) && (
                        <Badge variant="destructive" className="text-xs">
                          Assurance expire bientôt
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {getTypeBadge(vehicle.vehicle_type)}
              </TableCell>
              <TableCell className="text-center font-medium">
                {vehicle.capacity} places
              </TableCell>
              <TableCell>
                {getStatusBadge(vehicle.status)}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {formatMileage(vehicle.mileage)}
              </TableCell>
              <TableCell className="text-sm">
                <div className={isMaintenanceDue(vehicle) ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  {formatDate(vehicle.technical_control_expiry)}
                </div>
              </TableCell>
              <TableCell className="text-sm">
                <div className={isInsuranceExpiring(vehicle) ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  {formatDate(vehicle.insurance_expiry)}
                </div>
              </TableCell>
              {canManage && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onMaintenance(vehicle)}>
                        <Wrench className="mr-2 h-4 w-4" />
                        Maintenance
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onStatusUpdate(vehicle.id, 'available')}
                        disabled={vehicle.status === 'available'}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marquer disponible
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onStatusUpdate(vehicle.id, 'maintenance')}
                        disabled={vehicle.status === 'maintenance'}
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        En maintenance
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onStatusUpdate(vehicle.id, 'out_of_service')}
                        disabled={vehicle.status === 'out_of_service'}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Hors service
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(vehicle)}
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