// ============================================
// ONBOARDING SESSION PERSISTENCE
// Allows users to save progress and return later
// ============================================

import type { OnboardingSession, OnboardingState } from '@/types/onboarding'

const SESSION_KEY = 'longstrider_onboarding_session'

export function saveOnboardingSession(session: OnboardingSession): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      ...session,
      savedAt: Date.now()
    }))
  } catch (error) {
    console.error('Failed to save onboarding session:', error)
  }
}

export function loadOnboardingSession(): OnboardingSession | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return null

    const session = JSON.parse(stored) as OnboardingSession & { savedAt?: number }
    
    // Check if session is too old (e.g., older than 7 days)
    if (session.savedAt && (Date.now() - session.savedAt) > 7 * 24 * 60 * 60 * 1000) {
      clearOnboardingSession()
      return null
    }

    return session
  } catch (error) {
    console.error('Failed to load onboarding session:', error)
    return null
  }
}

export function clearOnboardingSession(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (error) {
    console.error('Failed to clear onboarding session:', error)
  }
}

export function hasOnboardingSession(): boolean {
  return loadOnboardingSession() !== null
}

// Auto-save helper that throttles saves
let saveTimeout: NodeJS.Timeout | null = null

export function autoSaveSession(session: OnboardingSession, throttleMs: number = 2000): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  
  saveTimeout = setTimeout(() => {
    saveOnboardingSession(session)
  }, throttleMs)
}
