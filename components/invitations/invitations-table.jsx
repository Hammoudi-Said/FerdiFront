'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ROLE_DEFINITIONS } from '@/lib/stores/auth-store'
import {
  Mail,
  MoreHorizontal,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Trash2,
  AlertTriangle
} from 'lucide-react'

export function InvitationsTable({ 
  invitations = [], 
  onResendInvitation, 
  onCancelInvitation, 
  loading = false,
  canManage = false
}) {
  const [actionLoading, setActionLoading] = useState(null)

  const handleResend = async (invitation) => {
    if (!canManage) return
    
    setActionLoading(`resend-${invitation.id}`)
    try {
      await onResendInvitation?.(invitation)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (invitation) => {
    if (!canManage) return
    
    setActionLoading(`cancel-${invitation.id}`)
    try {
      await onCancelInvitation?.(invitation)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (invitation) => {
    if (invitation.accepted) {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Acceptée
        </Badge>
      )
    }

    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    
    if (expiresAt < now) {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Expirée
        </Badge>
      )
    }

    if (!invitation.is_active) {
      return (
        <Badge className="bg-gray-50 text-gray-700 border-gray-200">
          <XCircle className="w-3 h-3 mr-1" />
          Annulée
        </Badge>
      )
    }

    return (
      <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        En attente
      </Badge>
    )
  }

  const getRoleInfo = (roleId) => {
    const roleData = ROLE_DEFINITIONS[roleId]
    if (!roleData) return { label: 'Inconnu', color: 'bg-gray-500' }
    return roleData
  }

  const isExpired = (invitation) => {
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    return expiresAt < now
  }

  const canResend = (invitation) => {
    return canManage && !invitation.accepted && invitation.is_active && !isExpired(invitation)
  }

  const canCancel = (invitation) => {
    return canManage && !invitation.accepted && invitation.is_active
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune invitation</h3>
        <p className="text-gray-600">
          Les invitations envoyées apparaîtront ici.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Invité par</TableHead>
            <TableHead>Date d'envoi</TableHead>
            <TableHead>Date d'expiration</TableHead>
            {canManage && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const roleInfo = getRoleInfo(invitation.role)
            const expired = isExpired(invitation)
            
            return (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {invitation.email}
                  </div>
                </TableCell>
                <TableCell>
                  {invitation.first_name || invitation.last_name ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {`${invitation.first_name || ''} ${invitation.last_name || ''}`.trim() || '—'}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${roleInfo.color}`} />
                    <span className="text-sm">{roleInfo.label}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(invitation)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{invitation.invited_by?.full_name}</div>
                    <div className="text-gray-500">{invitation.invited_by?.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(invitation.created_at), 'dd MMM yyyy', { locale: fr })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span className={expired ? 'text-red-600' : 'text-gray-600'}>
                      {format(new Date(invitation.expires_at), 'dd MMM yyyy', { locale: fr })}
                    </span>
                    {expired && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  </div>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canResend(invitation) && (
                          <DropdownMenuItem
                            onClick={() => handleResend(invitation)}
                            disabled={actionLoading === `resend-${invitation.id}`}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            {actionLoading === `resend-${invitation.id}` ? 'Envoi...' : 'Renvoyer'}
                          </DropdownMenuItem>
                        )}
                        {canCancel(invitation) && (
                          <DropdownMenuItem
                            onClick={() => handleCancel(invitation)}
                            disabled={actionLoading === `cancel-${invitation.id}`}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {actionLoading === `cancel-${invitation.id}` ? 'Annulation...' : 'Annuler'}
                          </DropdownMenuItem>
                        )}
                        {!canResend(invitation) && !canCancel(invitation) && (
                          <DropdownMenuItem disabled>
                            Aucune action disponible
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}