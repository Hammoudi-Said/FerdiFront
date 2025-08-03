'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter } from 'lucide-react'

export function PlanningFilters({ filters, onFiltersChange }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.status !== 'all') count++
    if (!filters.showUnassigned || !filters.showAssigned) count++
    if (filters.vehicleType !== 'all') count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={filters.status === 'all'}
          onCheckedChange={() => handleFilterChange('status', 'all')}
        >
          Tous les statuts
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.status === 'pending'}
          onCheckedChange={() => handleFilterChange('status', 'pending')}
        >
          En attente
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.status === 'confirmed'}
          onCheckedChange={() => handleFilterChange('status', 'confirmed')}
        >
          Confirmé
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.status === 'completed'}
          onCheckedChange={() => handleFilterChange('status', 'completed')}
        >
          Terminé
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Assignations</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={filters.showAssigned}
          onCheckedChange={(checked) => handleFilterChange('showAssigned', checked)}
        >
          Missions assignées
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.showUnassigned}
          onCheckedChange={(checked) => handleFilterChange('showUnassigned', checked)}
        >
          Missions non assignées
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Type de véhicule</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={filters.vehicleType === 'all'}
          onCheckedChange={() => handleFilterChange('vehicleType', 'all')}
        >
          Tous les types
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.vehicleType === 'autocar'}
          onCheckedChange={() => handleFilterChange('vehicleType', 'autocar')}
        >
          Autocar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.vehicleType === 'minibus'}
          onCheckedChange={() => handleFilterChange('vehicleType', 'minibus')}
        >
          Minibus
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.vehicleType === 'van'}
          onCheckedChange={() => handleFilterChange('vehicleType', 'van')}
        >
          Van
        </DropdownMenuCheckboxItem>

        {activeFiltersCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8"
              onClick={() => onFiltersChange({
                status: 'all',
                showUnassigned: true,
                showAssigned: true,
                vehicleType: 'all'
              })}
            >
              Réinitialiser les filtres
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}