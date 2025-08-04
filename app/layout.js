import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import AuthGuard from '@/components/auth/auth-guard'
import SessionManager from '@/components/auth/session-manager'
import NavigationWrapper from '@/components/navigation/navigation-wrapper'

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
          {/* Authentication Guard - Protects entire app */}
          <AuthGuard>
            {/* Navigation Wrapper - Enhanced navigation controls */}
            <NavigationWrapper>
              {/* Session Manager - Handles session timeouts and warnings */}
              <SessionManager />
              
              {/* Main Content */}
              {children}
            </NavigationWrapper>
          </AuthGuard>
          
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