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

export function DeleteMissionDialog({ open, onOpenChange, mission, onConfirm }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting mission:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            Supprimer la mission
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Êtes-vous sûr de vouloir supprimer la mission{' '}
                <strong>{mission?.mission_number}</strong> ?
              </p>
              
              {mission && (
                <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
                  <div><strong>Titre:</strong> {mission.title}</div>
                  <div><strong>Date:</strong> {formatDate(mission.departure_date)}</div>
                  <div><strong>Trajet:</strong> {mission.departure_location} → {mission.destination}</div>
                  <div><strong>Client:</strong> {mission.client_name}</div>
                  {mission.passenger_count && (
                    <div><strong>Passagers:</strong> {mission.passenger_count}</div>
                  )}
                </div>
              )}
              
              <p className="text-red-600 font-medium">
                Cette action est irréversible et supprimera définitivement :
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Les détails de la mission</li>
                <li>Les assignations de chauffeur et véhicule</li>
                <li>L'historique de la mission</li>
                <li>Toutes les données client associées</li>
              </ul>
              
              {(mission?.status === 'confirmed' || mission?.status === 'completed') && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-md">
                  <p className="text-orange-800 text-sm font-medium">
                    ⚠️ Attention : Cette mission est {mission.status === 'confirmed' ? 'confirmée' : 'terminée'}. 
                    Sa suppression pourrait impacter la facturation et les rapports.
                  </p>
                </div>
              )}
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