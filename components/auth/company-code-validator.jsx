'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Building } from 'lucide-react'
import { mockAPI } from '@/lib/mock-data'

/**
 * 🏢 COMPANY CODE VALIDATOR - Validation temps réel des codes entreprise
 * Valide instantanément les codes entreprise pendant la saisie
 */
export function CompanyCodeValidator({ 
  value, 
  onChange, 
  onValidation, 
  placeholder = "Code entreprise", 
  required = false,
  className = ""
}) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationState, setValidationState] = useState(null) // null, 'valid', 'invalid'
  const [companyInfo, setCompanyInfo] = useState(null)
  const [error, setError] = useState(null)

  // Debounce la validation pour éviter trop de requêtes
  useEffect(() => {
    if (!value || value.length < 3) {
      setValidationState(null)
      setCompanyInfo(null)
      setError(null)
      onValidation?.(false, null)
      return
    }

    const timer = setTimeout(() => {
      validateCompanyCode(value)
    }, 500) // Délai de 500ms après la dernière frappe

    return () => clearTimeout(timer)
  }, [value])

  const validateCompanyCode = async (code) => {
    if (!code || code.length < 3) return

    setIsValidating(true)
    setError(null)

    try {
      // Simuler la validation avec les données mock
      const response = await mockAPI.validateCompanyCode(code)
      const result = await response.json()

      if (response.ok && result.valid) {
        setValidationState('valid')
        setCompanyInfo(result.company)
        onValidation?.(true, result.company)
      } else {
        setValidationState('invalid')
        setCompanyInfo(null)
        setError(result.message || 'Code entreprise invalide')
        onValidation?.(false, null)
      }
    } catch (error) {
      console.error('Erreur validation code entreprise:', error)
      setValidationState('invalid')
      setError('Erreur lors de la validation')
      onValidation?.(false, null)
    } finally {
      setIsValidating(false)
    }
  }

  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
    }
    
    switch (validationState) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getInputClassName = () => {
    let baseClasses = className
    
    if (validationState === 'valid') {
      baseClasses += ' border-green-500 focus:border-green-500'
    } else if (validationState === 'invalid') {
      baseClasses += ' border-red-500 focus:border-red-500'
    }
    
    return baseClasses
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          required={required}
          className={getInputClassName()}
          maxLength={20}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getValidationIcon()}
        </div>
      </div>

      {/* Messages d'état */}
      {validationState === 'valid' && companyInfo && (
        <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <Building className="h-4 w-4 text-green-600" />
          <div className="text-sm text-green-800">
            <p className="font-medium">{companyInfo.name}</p>
            <p className="text-xs">{companyInfo.city} • {companyInfo.subscription_plan}</p>
          </div>
        </div>
      )}

      {validationState === 'invalid' && error && (
        <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <XCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Indicateur de format */}
      {!value && (
        <p className="text-xs text-muted-foreground">
          Format: XXX-XXXXX-XXX (ex: BRE-12345-ABC)
        </p>
      )}
    </div>
  )
}

/**
 * Hook pour utiliser la validation de code entreprise
 */
export function useCompanyCodeValidator() {
  const [code, setCode] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [company, setCompany] = useState(null)

  const handleValidation = (valid, companyData) => {
    setIsValid(valid)
    setCompany(companyData)
  }

  return {
    code,
    setCode,
    isValid,
    company,
    handleValidation
  }
}