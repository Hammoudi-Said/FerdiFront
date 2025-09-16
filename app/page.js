'use client'

import { redirect } from 'next/navigation'

// ✅ CORRECTION CRITIQUE 1.1: Suppression HomePage redondante
// Redirection immédiate vers dashboard sans délai artificiel
// GAIN: -500ms + suppression écran loading redondant + logique auth simplifiée
export default function RootPage() {
  // ✅ Redirection immédiate côté serveur - plus de delay 500ms
  redirect('/dashboard')
}