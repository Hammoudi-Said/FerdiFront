'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertTriangle } from 'lucide-react'

export function DeleteVehicleDialog({ open, onOpenChange, vehicle, onConfirm }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting vehicle:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            Supprimer le véhicule
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Êtes-vous sûr de vouloir supprimer le véhicule{' '}
                <strong>{vehicle?.license_plate}</strong> ({vehicle?.brand} {vehicle?.model}) ?
              </p>
              <p className="text-red-600 font-medium">
                Cette action est irréversible et supprimera définitivement :
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Les informations du véhicule</li>
                <li>L'historique de maintenance</li>
                <li>Toutes les missions assignées</li>
                <li>Les données d'assurance et de contrôle technique</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
            Supprimer définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}