import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import AuthGuard from '@/components/auth/auth-guard'
import SessionManager from '@/components/auth/session-manager'
import ErrorBoundary from '@/components/common/error-boundary'

export const metadata = {
  title: 'FERDI - Gestion de Flotte d\'Autocars',
  description: 'Plateforme moderne pour la gestion de flotte d\'autocars pour autocaristes français',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* 🔧 FIX: Wrap entire app with Error Boundary */}
          <ErrorBoundary fallbackMessage="Une erreur s'est produite dans l'application FERDI. L'équipe technique a été notifiée.">
            {/* Authentication Guard - Protects entire app */}
            <AuthGuard>
              {/* Session Manager - Handles session timeouts and warnings */}
              <SessionManager />
              
              {/* Main Content */}
              {children}
            </AuthGuard>
          </ErrorBoundary>
          
          {/* Global Toast Notifications */}
          <Toaster 
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}