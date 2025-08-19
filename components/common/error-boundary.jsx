'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

/**
 * 🔧 NEW: Error Boundary Component to catch React component errors
 * Provides graceful error handling and recovery options
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('🔴 Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
      hasError: true
    })

    // Optional: Send error to error reporting service
    if (typeof window !== 'undefined') {
      try {
        // Store error info in session storage for debugging
        sessionStorage.setItem('ferdi_last_error', JSON.stringify({
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }))
      } catch (storageError) {
        console.warn('Failed to store error info:', storageError)
      }
    }
  }

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1
    
    if (newRetryCount >= 3) {
      // After 3 retries, suggest page refresh
      window.location.reload()
      return
    }

    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: newRetryCount
    })
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  handleReportError = () => {
    try {
      const errorReport = {
        error: this.state.error?.toString(),
        stack: this.state.error?.stack,
        componentStack: this.state.errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
      
      // Copy error report to clipboard
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      alert('Rapport d\'erreur copié dans le presse-papiers')
    } catch (copyError) {
      console.warn('Failed to copy error report:', copyError)
    }
  }

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-800">
                Oups ! Une erreur s'est produite
              </CardTitle>
              <CardDescription className="text-red-600">
                {this.props.fallbackMessage || "Quelque chose s'est mal passé dans cette partie de l'application."}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error details for development */}
              {isDevelopment && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Détails de l'erreur (Développement)</h4>
                  <div className="text-xs font-mono text-red-700 break-all">
                    <div className="mb-2">
                      <strong>Message:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.error.stack && (
                      <div className="max-h-32 overflow-y-auto">
                        <strong>Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* User-friendly message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Que s'est-il passé ?</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Une erreur inattendue s'est produite dans cette partie de l'application. 
                      Vos données sont en sécurité et vous pouvez continuer à utiliser les autres fonctionnalités.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  disabled={this.state.retryCount >= 3}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {this.state.retryCount >= 3 ? 'Limite atteinte' : `Réessayer (${this.state.retryCount}/3)`}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Retour au tableau de bord
                </Button>
              </div>

              {isDevelopment && (
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={this.handleReportError}
                  className="w-full"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Copier le rapport d'erreur
                </Button>
              )}

              {/* Additional help */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Si le problème persiste, contactez notre{' '}
                  <a 
                    href="#" 
                    className="text-blue-600 hover:text-blue-500 font-medium"
                    onClick={(e) => {
                      e.preventDefault()
                      alert('Fonctionnalité de support à venir')
                    }}
                  >
                    support technique
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary