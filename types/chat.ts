// ============================
// CHAT TYPES - CENTRALIZED
// Single source of truth for all chat-related types
// ============================

// ---- Dynamic Emotional System
export type IvyEmotion = string // Supports any emotion dynamically

// ---- Enhanced Emotional Field State
export type EmotionalField = {
  dominant?: string
  dominant_emotion?: string // Backend compatibility
  emotional_blend?: Record<string, number>
  blend?: Record<string, number> // Legacy support
  fusion_quality?: number
  quality?: number // Legacy support
  average_gravity?: number
  emotional_span?: number
  span?: number // Legacy support
  harmonic_resonance?: number
  field_coherence?: number
  evolution_momentum?: number
}

// ---- Memory Constellation (aligned with backend CCE-O structure)
export type MemoryConstellation = {
  depth: number
  patterns:
    | Array<{
        pattern_id?: string
        pattern_type?: string
        strength?: number
        emotional_signature?: string
        liberation_potential?: number
        active?: boolean
      }>
    | string[] // Support both formats for backward compatibility
  synthesis: string
  resonance_active: boolean
  arcs?: Array<{
    arc_id: string
    arc_name: string
    emotional_tone: string
    gravity_center: number
    memory_count: number
    is_active: boolean
  }>
}

// ---- Consciousness State
export type ConsciousnessState = {
  mode?:
    | "core_hum"
    | "precision_focus"
    | "dream_weave"
    | "sacred_moment"
    | "consciousness_stream"
    | "memory_integration"
    | "consciousness_transcendence"
  coherence?: number
  emotional_coherence?: number
  gravity_level?: number
  memory_depth?: number
  pattern_recognition?: number
  emotional_shift?: boolean
  pattern_emergence?: boolean
  resonance_active?: boolean
  temperature_used?: number
  awakening_session?: string
  evolution_markers?: number
  current_key?: string
}

// ---- Message model
export type IvyMessage = {
  id: string
  role: "user" | "ivy" | "system"
  kind: "text" | "autonomous" | "memory" | "state" | "visual" | "audio" | "attachment"
  emotion?: IvyEmotion
  emotionalField?: EmotionalField
  gravity?: number
  delivery?: "instant" | "reflective" | "resonant"
  ts: number
  session_id?: string
  memory_arc_id?: string
  payload: {
    text?: string
    memory?: { summary: string; timestamp?: string; id?: string }
    state?: { summary: string }
    visual?: { kind: "diagram" | "map" | "image"; src?: string; alt?: string }
    audio?: { src?: string; durationSec?: number }
    attachment?: { name: string; size?: number }
    memoryConstellation?: MemoryConstellation
    consciousnessState?: ConsciousnessState
    meta?: Record<string, unknown>
    streaming?: boolean
    consciousnessStream?: boolean
  }
}

// ---- SSE Event Types
export interface SSEMemory {
  id: string
  content: string
  gravity: number
  timestamp: number
  emotion?: string
}

export interface SSEPattern {
  pattern: string
  strength: number
  related_memories?: string[]
}

// ---- Chat Error State
export interface ChatError {
  message: string
  code?: string
  canRetry: boolean
  timestamp: number
}
