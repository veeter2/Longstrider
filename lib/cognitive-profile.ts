// Cognitive Profile Management
// Stores and retrieves user cognitive profiles from onboarding

export interface CognitiveProfile {
  userId: string
  thinkingStyle?: string[]
  communicationPreferences?: {
    style?: string
    directness?: number
    depth?: number
    pace?: "fast" | "moderate" | "deep"
  }
  organizationStyle?: string[]
  workContext?: string[]
  feedbackPreferences?: string[]
  motivationStyle?: string[]
  personaWeights?: {
    phd: number
    strategist: number
    architect: number
    companion: number
    lover: number
  }
  livingLaws?: string[]
  createdAt: number
  updatedAt: number
}

const PROFILE_KEY = "longstrider_cognitive_profile"

export function saveCognitiveProfile(profile: CognitiveProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function getCognitiveProfile(): CognitiveProfile | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(PROFILE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function updateCognitiveProfile(updates: Partial<CognitiveProfile>): void {
  const existing = getCognitiveProfile()
  if (!existing) return

  const updated = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  }

  saveCognitiveProfile(updated)
}

export function clearCognitiveProfile(): void {
  localStorage.removeItem(PROFILE_KEY)
}
