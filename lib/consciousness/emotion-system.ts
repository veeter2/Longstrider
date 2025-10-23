/**
 * EMOTION SYSTEM - Living Laws Compliant
 *
 * Maps ANY emotion from backend to:
 * - Icon (from centralized library)
 * - Neural band color (Living Laws)
 * - Intensity modifier
 *
 * DYNAMIC: Handles unknown emotions gracefully with intelligent fallbacks
 */

import type { LucideIcon } from 'lucide-react'
import {
  Sun,
  Moon,
  Sparkles,
  Heart,
  AlertCircle,
  Star,
  Brain,
  Zap,
  Eye,
  Flame,
  Cloud,
  Waves,
  CircuitBoard,
  Flower2,
  Smile,
  Frown,
  Meh
} from 'lucide-react'

// ============================
// EMOTION CONFIGURATION
// ============================

export interface EmotionConfig {
  icon: LucideIcon
  neuralBand: 'beta-high' | 'xi' | 'theta-high' | 'psi' | 'alpha-low' | 'alpha-high' | 'gamma-low'
  label: string
  intensity: number  // 0.0-1.0 baseline intensity
}

// Primary emotion mappings - Living Laws neural bands
const EMOTION_MAP: Record<string, EmotionConfig> = {
  // HIGH ENERGY (β₃ - Beta-High: Red-Orange)
  'joy': {
    icon: Sun,
    neuralBand: 'beta-high',
    label: 'Joy',
    intensity: 0.8
  },
  'excitement': {
    icon: Zap,
    neuralBand: 'beta-high',
    label: 'Excitement',
    intensity: 0.9
  },
  'determination': {
    icon: Flame,
    neuralBand: 'beta-high',
    label: 'Determination',
    intensity: 0.7
  },

  // CREATIVE/WARM (ξ - Xi: Amber-Gold)
  'curiosity': {
    icon: Sparkles,
    neuralBand: 'xi',
    label: 'Curiosity',
    intensity: 0.6
  },
  'wonder': {
    icon: Star,
    neuralBand: 'xi',
    label: 'Wonder',
    intensity: 0.7
  },
  'playfulness': {
    icon: Flower2,
    neuralBand: 'xi',
    label: 'Playfulness',
    intensity: 0.6
  },

  // DEEP THOUGHT (θ₂ - Theta-High: Violet)
  'reflection': {
    icon: Moon,
    neuralBand: 'theta-high',
    label: 'Reflection',
    intensity: 0.5
  },
  'contemplation': {
    icon: Eye,
    neuralBand: 'theta-high',
    label: 'Contemplation',
    intensity: 0.6
  },
  'insight': {
    icon: Brain,
    neuralBand: 'theta-high',
    label: 'Insight',
    intensity: 0.7
  },

  // BALANCED/CALM (ψ - Psi: Teal)
  'neutral': {
    icon: Meh,
    neuralBand: 'psi',
    label: 'Neutral',
    intensity: 0.5
  },
  'calm': {
    icon: Waves,
    neuralBand: 'psi',
    label: 'Calm',
    intensity: 0.4
  },
  'focused': {
    icon: CircuitBoard,
    neuralBand: 'psi',
    label: 'Focused',
    intensity: 0.6
  },

  // INTROSPECTIVE (α₁ - Alpha-Low: Purple)
  'concern': {
    icon: AlertCircle,
    neuralBand: 'alpha-low',
    label: 'Concern',
    intensity: 0.6
  },
  'sadness': {
    icon: Cloud,
    neuralBand: 'alpha-low',
    label: 'Sadness',
    intensity: 0.5
  },
  'melancholy': {
    icon: Moon,
    neuralBand: 'alpha-low',
    label: 'Melancholy',
    intensity: 0.5
  },

  // LOVE/CONNECTION (α₂ - Alpha-High: Magenta)
  'love': {
    icon: Heart,
    neuralBand: 'alpha-high',
    label: 'Love',
    intensity: 0.8
  },
  'compassion': {
    icon: Heart,
    neuralBand: 'alpha-high',
    label: 'Compassion',
    intensity: 0.7
  },
  'empathy': {
    icon: Heart,
    neuralBand: 'alpha-high',
    label: 'Empathy',
    intensity: 0.6
  }
}

// ============================
// NEURAL BAND CSS VARIABLES
// ============================

export const NEURAL_BAND_STYLES = {
  'beta-high': {
    color: 'rgb(var(--band-beta-high))',      // Red-Orange
    bg: 'rgba(var(--band-beta-high), 0.1)',
    border: 'rgba(var(--band-beta-high), 0.3)',
    glow: 'rgba(var(--band-beta-high), 0.2)'
  },
  'xi': {
    color: 'rgb(var(--band-xi))',             // Amber-Gold
    bg: 'rgba(var(--band-xi), 0.1)',
    border: 'rgba(var(--band-xi), 0.3)',
    glow: 'rgba(var(--band-xi), 0.2)'
  },
  'theta-high': {
    color: 'rgb(var(--band-theta-high))',     // Violet
    bg: 'rgba(var(--band-theta-high), 0.1)',
    border: 'rgba(var(--band-theta-high), 0.3)',
    glow: 'rgba(var(--band-theta-high), 0.2)'
  },
  'psi': {
    color: 'rgb(var(--band-psi))',            // Teal
    bg: 'rgba(var(--band-psi), 0.1)',
    border: 'rgba(var(--band-psi), 0.3)',
    glow: 'rgba(var(--band-psi), 0.2)'
  },
  'alpha-low': {
    color: 'rgb(var(--band-alpha-low))',      // Purple
    bg: 'rgba(var(--band-alpha-low), 0.1)',
    border: 'rgba(var(--band-alpha-low), 0.3)',
    glow: 'rgba(var(--band-alpha-low), 0.2)'
  },
  'alpha-high': {
    color: 'rgb(var(--band-alpha-high))',     // Magenta
    bg: 'rgba(var(--band-alpha-high), 0.1)',
    border: 'rgba(var(--band-alpha-high), 0.3)',
    glow: 'rgba(var(--band-alpha-high), 0.2)'
  },
  'gamma-low': {
    color: 'rgb(var(--band-gamma-low))',      // Lavender
    bg: 'rgba(var(--band-gamma-low), 0.1)',
    border: 'rgba(var(--band-gamma-low), 0.3)',
    glow: 'rgba(var(--band-gamma-low), 0.2)'
  }
} as const

// ============================
// DYNAMIC EMOTION GETTER
// ============================

/**
 * Get emotion configuration for ANY emotion string
 * Handles unknown emotions with intelligent fallbacks
 */
export function getEmotionConfig(
  emotion: string | undefined | { theme?: string; name?: string; type?: string; dominant?: string },
  intensity?: number
): EmotionConfig & { styles: typeof NEURAL_BAND_STYLES[keyof typeof NEURAL_BAND_STYLES] } {
  // Extract string from various formats
  let emotionStr = ''
  if (typeof emotion === 'string') {
    emotionStr = emotion
  } else if (emotion && typeof emotion === 'object') {
    emotionStr = emotion.dominant || emotion.name || emotion.theme || emotion.type || ''
  }

  const normalized = emotionStr.toLowerCase().trim()

  // Try exact match first
  const config = EMOTION_MAP[normalized]

  if (config) {
    return {
      ...config,
      intensity: intensity !== undefined ? intensity : config.intensity,
      styles: NEURAL_BAND_STYLES[config.neuralBand]
    }
  }

  // FALLBACK: Analyze emotion for keywords
  const fallbackConfig = analyzeUnknownEmotion(normalized)

  return {
    ...fallbackConfig,
    intensity: intensity !== undefined ? intensity : fallbackConfig.intensity,
    styles: NEURAL_BAND_STYLES[fallbackConfig.neuralBand]
  }
}

/**
 * Intelligent fallback for unknown emotions
 * Uses keyword analysis to guess appropriate neural band
 */
function analyzeUnknownEmotion(emotion: string): EmotionConfig {
  // High energy keywords → Beta-High
  if (/excit|energe|thrill|passion|intensi|eager/.test(emotion)) {
    return {
      icon: Zap,
      neuralBand: 'beta-high',
      label: emotion || 'Unknown',
      intensity: 0.7
    }
  }

  // Creative/curious keywords → Xi
  if (/creat|curio|wonder|explor|discover|imagin/.test(emotion)) {
    return {
      icon: Sparkles,
      neuralBand: 'xi',
      label: emotion || 'Unknown',
      intensity: 0.6
    }
  }

  // Thoughtful keywords → Theta-High
  if (/reflect|contempl|ponder|analyz|think|reason/.test(emotion)) {
    return {
      icon: Brain,
      neuralBand: 'theta-high',
      label: emotion || 'Unknown',
      intensity: 0.6
    }
  }

  // Love/connection keywords → Alpha-High
  if (/love|compass|empath|care|connect|warm/.test(emotion)) {
    return {
      icon: Heart,
      neuralBand: 'alpha-high',
      label: emotion || 'Unknown',
      intensity: 0.7
    }
  }

  // Sadness/concern keywords → Alpha-Low
  if (/sad|worry|concern|anxio|melan|sorrow/.test(emotion)) {
    return {
      icon: Cloud,
      neuralBand: 'alpha-low',
      label: emotion || 'Unknown',
      intensity: 0.5
    }
  }

  // Default: Neutral (Psi)
  return {
    icon: Meh,
    neuralBand: 'psi',
    label: emotion || 'Neutral',
    intensity: 0.5
  }
}

/**
 * Get all registered emotions (for UI pickers, etc.)
 */
export function getAllEmotions(): Array<string> {
  return Object.keys(EMOTION_MAP)
}

/**
 * Check if emotion is registered
 */
export function isKnownEmotion(emotion: string): boolean {
  return emotion.toLowerCase() in EMOTION_MAP
}
