'use client'

import { useState } from 'react'
import { InvitationAcceptForm } from '@/components/invitations/invitation-accept-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TestTube, Copy, ExternalLink } from 'lucide-react'

export default function TestInvitationPage() {
  const [testToken, setTestToken] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Génération d'un token de test
  const generateTestToken = () => {
    const randomToken = 'test-' + Math.random().toString(36).substr(2, 9)
    setTestToken(randomToken)
  }

  const handleSuccess = (userData) => {
    setResult({
      type: 'success',
      data: userData
    })
    console.log('✅ Invitation accepted successfully:', userData)
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
    setResult({
      type: 'error',
      message: errorMessage
    })
    console.error('❌ Invitation error:', errorMessage)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test d'acceptation d'invitation FERDI
          </h1>
          <p className="text-gray-600">
            Page de test pour vérifier le nouveau système d'invitation avec pré-remplissage
          </p>
        </div>

        {/* Token Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Générateur de token de test
            </CardTitle>
            <CardDescription>
              Générez un token pour tester le formulaire d'acceptation d'invitation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="test_token">Token d'invitation</Label>
                <Input
                  id="test_token"
                  value={testToken}
                  onChange={(e) => setTestToken(e.target.value)}
                  placeholder="Entrez un token ou générez-en un"
                />
              </div>
              <Button
                onClick={generateTestToken}
                variant="outline"
                className="mt-6"
              >
                Générer
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowForm(true)
                  setError(null)
                  setResult(null)
                }}
                disabled={!testToken}
                className="flex-1"
              >
                Tester le formulaire
              </Button>

              {testToken && (
                <>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(`/invitations/accept?token=${testToken}`)
                    }}
                    variant="outline"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier l'URL
                  </Button>

                  <Button
                    onClick={() => {
                      window.open(`/invitations/accept?token=${testToken}`, '_blank')
                    }}
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions de test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p><strong>1. Configuration backend :</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600">
                <li>Assurez-vous que votre backend FERDI fonctionne sur <code>http://localhost:8000</code></li>
                <li>Vérifiez que les routes d'invitations sont implémentées</li>
                <li>Variable d'environnement : <code>NEXT_PUBLIC_USE_MOCK_DATA=false</code></li>
              </ul>

              <p><strong>2. Endpoints testés :</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600">
                <li><code>POST /api/v1/auth/test-token?token=xxx</code> (prioritaire)</li>
                <li><code>GET /api/v1/invitations/token/xxx</code> (fallback)</li>
                <li><code>POST /api/v1/invitations/accept</code> (soumission)</li>
              </ul>

              <p><strong>3. Réponse backend attendue :</strong></p>
              <div className="bg-gray-100 p-3 rounded-md text-xs">
                <pre>{JSON.stringify({
                  email: "invite@company.com",
                  role: "DRIVER",
                  company_name: "Transport Company",
                  first_name: "",
                  last_name: "",
                  mobile: "",
                  personal_message: "...",
                  invited_by: { full_name: "Admin", email: "admin@company.com" },
                  expires_at: "2024-12-31T23:59:59Z"
                }, null, 2)}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Test Area */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Test du formulaire</CardTitle>
              <CardDescription>
                Token : <code className="bg-gray-100 px-2 py-1 rounded">{testToken}</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationAcceptForm
                token={testToken}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Résultat du test</CardTitle>
            </CardHeader>
            <CardContent>
              {result.type === 'success' ? (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    <strong>✅ Succès !</strong> L'invitation a été acceptée avec succès.
                    <pre className="mt-2 text-xs bg-green-100 p-2 rounded">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>❌ Erreur :</strong> {result.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Current Configuration Display */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration actuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Backend URL :</strong>
                <code className="block bg-gray-100 p-2 rounded mt-1">
                  {process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}
                </code>
              </div>
              <div>
                <strong>Mode Mock :</strong>
                <code className="block bg-gray-100 p-2 rounded mt-1">
                  {process.env.NEXT_PUBLIC_USE_MOCK_DATA || 'false'}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
