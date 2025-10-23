// =================================================
// IVY EMOTION ENGINE - TYPE DEFINITIONS
// Dynamic emotional intelligence system
// =================================================

export interface EmotionalState {
  dominant: string
  intensity: number // 0.0 - 1.0
  blend: Record<string, number> // Multiple emotions with weights
  confidence: number // How certain we are of this detection
  triggers: string[] // Keywords that triggered this emotion
  context: EmotionalContext
}

export interface EmotionalContext {
  temporal: "past" | "present" | "future" | "timeless"
  relational: string[] // Detected relationships involved
  entities: string[] // People, places, things mentioned
  intensity_modifiers: IntensityModifier[]
  gravity_boosters: string[] // Keywords that increase importance
}

export interface IntensityModifier {
  word: string
  multiplier: number // 0.5x for "slightly", 1.5x for "extremely"
  position: number // Where in text this appeared
}

export interface EmotionPattern {
  name: string
  keywords: string[]
  combos: ComboPattern[]
  intensity_base: number
  visual_style: EmotionStyle
}

export interface ComboPattern {
  pattern: [string, string] // Two words that create meaning together
  emotion_boost: string // What emotion this combo indicates
  gravity_multiplier: number // How much more important this makes the message
}

export interface EmotionStyle {
  bubble: string // Tailwind classes for message bubble
  accent: string // Text color classes
  glow: string // Shadow/glow effects
  indicator: string // Small indicator dot color
  background: string // Background gradient
  icon: string // Icon identifier (maps to Lucide icons)
}

export interface DetectedEntity {
  text: string
  type: "person" | "place" | "concept" | "relationship" | "unknown"
  frequency: number // How often this entity appears
  emotional_context: string[] // Emotions associated with this entity
  gravity: number // Importance score
}

export interface PatternMatch {
  pattern: string
  confidence: number
  text_span: [number, number] // Start and end positions
  emotion_influence: string
  gravity_boost: number
}

export interface EmotionDetectionResult {
  emotional_state: EmotionalState
  detected_entities: DetectedEntity[]
  pattern_matches: PatternMatch[]
  gravity_score: number // Overall importance of this message
  processing_metadata: {
    keywords_found: string[]
    patterns_triggered: string[]
    confidence_breakdown: Record<string, number>
  }
}

// Additional updates can be made here if necessary
