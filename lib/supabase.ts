import { createClient, SupabaseClient } from "@supabase/supabase-js"

// ========================================
// IVY SUPABASE CONNECTION MANAGER
// The ONLY way to get Supabase client
// Respects Preflight as source of truth
// ========================================

// Singleton instances - one for client, one for server
let clientInstance: SupabaseClient | null = null
let serverInstance: SupabaseClient | null = null

// Track last used credentials to detect changes
let lastClientUrl: string | null = null
let lastClientKey: string | null = null

/**
 * IVY's PRIMARY Supabase Client Factory
 * Checks in order:
 * 1. localStorage (from Preflight - SOURCE OF TRUTH)
 * 2. window.IVY_CONFIG (set by Preflight after successful connection)
 * 3. Environment variables (fallback)
 * 
 * @param forceNew - Force create a new instance (useful after Preflight updates)
 * @returns Supabase client or null if not configured
 */
export const getSupabaseClient = (forceNew = false): SupabaseClient | null => {
  // Only check localStorage in browser environment
  if (typeof window !== 'undefined') {
    // Priority 1: localStorage from Settings (SOURCE OF TRUTH)
    const storedUrl = localStorage.getItem('ls_supabase_url')
    const storedKey = localStorage.getItem('ls_supabase_key')
    
    if (storedUrl && storedKey) {
      // Check if credentials changed
      if (forceNew || storedUrl !== lastClientUrl || storedKey !== lastClientKey) {
        console.log('[IVY] Creating Supabase client from Preflight config')
        clientInstance = createClient(storedUrl, storedKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          }
        })
        lastClientUrl = storedUrl
        lastClientKey = storedKey
      }
      return clientInstance
    }

    // Priority 2: window.IVY_CONFIG (set by Preflight after validation)
    const ivyConfig = (window as any).IVY_CONFIG
    if (ivyConfig?.url && ivyConfig?.anonKey) {
      if (forceNew || ivyConfig.url !== lastClientUrl || ivyConfig.anonKey !== lastClientKey) {
        console.log('[IVY] Creating Supabase client from IVY_CONFIG')
        clientInstance = createClient(ivyConfig.url, ivyConfig.anonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          }
        })
        lastClientUrl = ivyConfig.url
        lastClientKey = ivyConfig.anonKey
      }
      return clientInstance
    }
  }

  // Priority 3: Environment variables (fallback)
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (envUrl && envKey) {
    if (forceNew || !clientInstance || envUrl !== lastClientUrl || envKey !== lastClientKey) {
      console.log('[IVY] Creating Supabase client from environment variables')
      clientInstance = createClient(envUrl, envKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      })
      lastClientUrl = envUrl
      lastClientKey = envKey
    }
    return clientInstance
  }

  // Not configured - but check if we have a stale instance
  if (clientInstance && !forceNew) {
    console.warn('[IVY] Using stale Supabase client - credentials may be outdated')
    return clientInstance
  }

  console.warn(
    '[IVY] Supabase not configured. Please complete Preflight setup or set environment variables.'
  )
  return null
}

/**
 * Server-side Supabase client (for API routes)
 * Checks environment variables only
 */
export const createServerSupabaseClient = (): SupabaseClient | null => {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!envUrl || !envKey) {
    console.warn(
      '[IVY Server] Supabase credentials not found in environment variables'
    )
    return null
  }

  if (!serverInstance) {
    serverInstance = createClient(envUrl, envKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
  }

  return serverInstance
}

/**
 * Get LongStrider configuration from Settings
 * Useful for components that need more than just Supabase client
 */
export const getIvyConfig = (): {
  supabaseUrl: string | null
  supabaseKey: string | null
  userId: string | null
  sessionId: string | null
  orgId: string | null
  memoryTraceId: string | null
  edgeFunctions: Record<string, string>
} => {
  if (typeof window === 'undefined') {
    return {
      supabaseUrl: null,
      supabaseKey: null,
      userId: null,
      sessionId: null,
      orgId: null,
      memoryTraceId: null,
      edgeFunctions: {}
    }
  }

  // Gather all edge function URLs (legacy support)
  const edgeFunctions: Record<string, string> = {}
  const edgeKeys = [
    'getCortex',
    'cce-orchestrator',
    'cce-insight-generator',
    'cce-pattern-detector',
    'cce-contradiction-mapper',
    'cce-reflection-engine',
    'cce-consciousness-snapshot',
    'cognition-fusion-engine',
    'cognition_intake',
    'cce-arc-builder'
  ]

  edgeKeys.forEach(key => {
    const url = localStorage.getItem(`ls_edge_${key}_url`)
    if (url) edgeFunctions[key] = url
  })

  return {
    supabaseUrl: localStorage.getItem('ls_supabase_url'),
    supabaseKey: localStorage.getItem('ls_supabase_key'),
    userId: localStorage.getItem('ls_user_id'),
    sessionId: localStorage.getItem('ls_session_id'),
    orgId: localStorage.getItem('ls_org_id'),
    memoryTraceId: localStorage.getItem('ls_memory_trace_id'),
    edgeFunctions
  }
}

/**
 * Check if LongStrider is properly configured
 * Used by components to gate functionality
 */
export const isIvyConfigured = (): boolean => {
  if (typeof window === 'undefined') return false

  const url = localStorage.getItem('ls_supabase_url')
  const key = localStorage.getItem('ls_supabase_key')
  const userId = localStorage.getItem('ls_user_id')

  return !!(url && key && userId)
}

/**
 * Check if Preflight has passed all checks (DEPRECATED - kept for compatibility)
 * Gates access to Boot and Chat
 */
export const isPreflightComplete = (): boolean => {
  // Always return true now - we use Settings page instead
  return true
}

/**
 * Clear all LongStrider configuration (logout/reset)
 */
export const clearIvyConfig = (): void => {
  if (typeof window === 'undefined') return

  // Clear instances
  clientInstance = null
  serverInstance = null
  lastClientUrl = null
  lastClientKey = null

  // Clear localStorage
  const keysToRemove = [
    'ls_supabase_url',
    'ls_supabase_key',
    'ls_user_id',
    'ls_user_email',
    'ls_org_id',
    'ls_session_id',
    'ls_memory_trace_id'
  ]

  keysToRemove.forEach(key => localStorage.removeItem(key))

  // Clear edge function URLs
  const edgeKeys = [
    'getCortex',
    'cce-orchestrator',
    'cce-insight-generator',
    'cce-pattern-detector',
    'cce-contradiction-mapper',
    'cce-reflection-engine',
    'cce-consciousness-snapshot',
    'cognition-fusion-engine',
    'cognition_intake',
    'cce-arc-builder'
  ]

  edgeKeys.forEach(key => localStorage.removeItem(`ls_edge_${key}_url`))

  // Clear window config
  if ((window as any).IVY_CONFIG) {
    delete (window as any).IVY_CONFIG
  }
}
