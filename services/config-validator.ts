/**
 * CONFIG VALIDATOR SERVICE
 * 
 * The ONLY way to validate IVY configuration
 * Rock solid foundation - UI can go crazy, this stays stable
 */

import { getIvyConfig } from '../lib/supabase'

export interface ConfigValidationResult {
  isValid: boolean
  errors: ConfigError[]
  warnings: ConfigWarning[]
  config: {
    supabaseUrl: string | null
    supabaseKey: string | null
    userId: string | null
    sessionId: string | null
    orgId: string | null
    memoryTraceId: string | null
    edgeFunctions: Record<string, string>
  }
}

export interface ConfigError {
  field: string
  message: string
  severity: 'critical' | 'error' | 'warning'
  fix: string
}

export interface ConfigWarning {
  field: string
  message: string
  suggestion: string
}

export class ConfigValidator {
  private static instance: ConfigValidator
  private lastValidation: ConfigValidationResult | null = null
  private validationCallbacks: Array<(result: ConfigValidationResult) => void> = []

  static getInstance(): ConfigValidator {
    if (!ConfigValidator.instance) {
      ConfigValidator.instance = new ConfigValidator()
    }
    return ConfigValidator.instance
  }

  /**
   * Validate all configuration
   * Returns cached result if config hasn't changed
   */
  validate(): ConfigValidationResult {
    try {
      const config = getIvyConfig()
      
      // DEBUG: Log what we're checking
      console.log('🔍 [CONFIG VALIDATOR] Checking config:', {
        hasUrl: !!config.supabaseUrl,
        hasKey: !!config.supabaseKey,
        hasUserId: !!config.userId,
        url: config.supabaseUrl?.substring(0, 30) + '...',
        edgeFunctions: Object.keys(config.edgeFunctions)
      })
      
      const errors: ConfigError[] = []
      const warnings: ConfigWarning[] = []

      // CRITICAL: Supabase URL
      if (!config.supabaseUrl) {
        errors.push({
          field: 'supabaseUrl',
          message: 'Supabase URL is required',
          severity: 'critical',
          fix: 'Set your Supabase project URL in Settings'
        })
      } else if (!this.isValidUrl(config.supabaseUrl)) {
        errors.push({
          field: 'supabaseUrl',
          message: 'Invalid Supabase URL format',
          severity: 'error',
          fix: 'Check your Supabase project URL in Settings'
        })
      }

      // CRITICAL: Supabase Key
      if (!config.supabaseKey) {
        errors.push({
          field: 'supabaseKey',
          message: 'Supabase API key is required',
          severity: 'critical',
          fix: 'Set your Supabase anon key in Settings'
        })
      } else if (!this.isValidSupabaseKey(config.supabaseKey)) {
        errors.push({
          field: 'supabaseKey',
          message: 'Invalid Supabase key format',
          severity: 'error',
          fix: 'Check your Supabase anon key in Settings'
        })
      }

      // IMPORTANT: User ID
      if (!config.userId) {
        warnings.push({
          field: 'userId',
          message: 'User ID not set',
          suggestion: 'Set a user ID in Settings for better tracking'
        })
      }

      // Check edge functions
      const requiredFunctions = ['cce-orchestrator', 'chat_loop_ivy_v1']
      const missingFunctions = requiredFunctions.filter(func => !config.edgeFunctions[func])
      
      if (missingFunctions.length > 0) {
        warnings.push({
          field: 'edgeFunctions',
          message: `Missing edge functions: ${missingFunctions.join(', ')}`,
          suggestion: 'Configure edge function URLs in Settings'
        })
      }

      const result: ConfigValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        config
      }

      // Cache result
      this.lastValidation = result

      // Notify subscribers
      this.validationCallbacks.forEach(callback => callback(result))

      return result

    } catch (error) {
      const errorResult: ConfigValidationResult = {
        isValid: false,
        errors: [{
          field: 'config',
          message: 'Failed to load configuration',
          severity: 'critical',
          fix: 'Check localStorage and refresh the page'
        }],
        warnings: [],
        config: {
          supabaseUrl: null,
          supabaseKey: null,
          userId: null,
          sessionId: null,
          orgId: null,
          memoryTraceId: null,
          edgeFunctions: {}
        }
      }

      this.lastValidation = errorResult
      return errorResult
    }
  }

  /**
   * Get cached validation result
   */
  getLastValidation(): ConfigValidationResult | null {
    return this.lastValidation
  }

  /**
   * Subscribe to validation changes
   */
  subscribe(callback: (result: ConfigValidationResult) => void): () => void {
    this.validationCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.validationCallbacks.indexOf(callback)
      if (index > -1) {
        this.validationCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Check if config can make API calls
   */
  canMakeAPICalls(): boolean {
    const validation = this.validate()
    return validation.isValid && !!validation.config.supabaseUrl && !!validation.config.supabaseKey
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(): string {
    const validation = this.validate()
    
    if (validation.isValid) {
      return ''
    }

    const criticalErrors = validation.errors.filter(e => e.severity === 'critical')
    if (criticalErrors.length > 0) {
      return criticalErrors.map(e => e.message).join('. ') + '. Please check Settings.'
    }

    return 'Configuration incomplete. Please check Settings.'
  }

  /**
   * Get all missing fields
   */
  getMissingFields(): string[] {
    const validation = this.validate()
    return validation.errors.map(e => e.field)
  }

  // Private helpers
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private isValidSupabaseKey(key: string): boolean {
    // Supabase keys are typically JWT tokens
    return key.length > 20 && key.includes('.')
  }
}

// Export singleton instance
export const configValidator = ConfigValidator.getInstance()

// Export convenience functions
export const validateConfig = () => configValidator.validate()
export const canMakeAPICalls = () => configValidator.canMakeAPICalls()
export const getConfigError = () => configValidator.getErrorMessage()
export const getMissingFields = () => configValidator.getMissingFields()
