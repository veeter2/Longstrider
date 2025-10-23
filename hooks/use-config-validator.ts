/**
 * USE CONFIG VALIDATOR HOOK
 * 
 * React hook for config validation
 * Subscribe to changes, get real-time validation state
 */

import { useState, useEffect } from 'react'
import { configValidator, type ConfigValidationResult } from '../services/config-validator'

export function useConfigValidator() {
  const [validation, setValidation] = useState<ConfigValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial validation
    const result = configValidator.validate()
    setValidation(result)
    setIsLoading(false)

    // Subscribe to changes
    const unsubscribe = configValidator.subscribe((result) => {
      setValidation(result)
    })

    return unsubscribe
  }, [])

  return {
    validation,
    isValid: validation?.isValid ?? false,
    errors: validation?.errors ?? [],
    warnings: validation?.warnings ?? [],
    config: validation?.config,
    isLoading,
    canMakeAPICalls: validation?.isValid && !!validation?.config?.supabaseUrl && !!validation?.config?.supabaseKey,
    errorMessage: validation?.isValid 
      ? '' 
      : (validation?.errors ?? []).map(e => e.message).join('. ') || 'Configuration invalid. Please check Settings.'
  }
}

export function useConfigStatus() {
  const { isValid, errorMessage, canMakeAPICalls, isLoading } = useConfigValidator()
  
  return {
    isValid,
    errorMessage,
    canMakeAPICalls,
    isLoading,
    status: isValid ? 'ready' : 'error'
  }
}
