/**
 * PATTERN SYSTEM - Dynamic Pattern Type Handling
 *
 * Maps pattern types from backend to icons and colors
 * Backend sends: ANY pattern_type string
 *
 * DYNAMIC: Handles unknown pattern types gracefully
 */

// ============================
// PATTERN CONFIGURATION
// ============================

export interface PatternConfig {
  icon: string  // Emoji for simplicity and universality
  label: string
  neuralBand: 'beta-high' | 'xi' | 'theta-high' | 'psi' | 'alpha-high'
  description: string
}

// Known pattern type mappings
const PATTERN_MAP: Record<string, PatternConfig> = {
  // Identity & Self
  'identity_pattern': {
    icon: '👑',
    label: 'Identity Pattern',
    neuralBand: 'theta-high',
    description: 'Core self-concept patterns'
  },
  'contradiction_pattern': {
    icon: '🔄',
    label: 'Contradiction',
    neuralBand: 'alpha-high',
    description: 'Conflicting beliefs or statements'
  },

  // Temporal & Growth
  'temporal_pattern': {
    icon: '⏳',
    label: 'Temporal Pattern',
    neuralBand: 'psi',
    description: 'Time-based recurring themes'
  },
  'growth_pattern': {
    icon: '🌱',
    label: 'Growth Pattern',
    neuralBand: 'xi',
    description: 'Personal development trajectory'
  },

  // Emotional & Relational
  'emotional_loop': {
    icon: '🌀',
    label: 'Emotional Loop',
    neuralBand: 'alpha-high',
    description: 'Recurring emotional cycles'
  },
  'connection_pattern': {
    icon: '🔗',
    label: 'Connection Pattern',
    neuralBand: 'alpha-high',
    description: 'Relationship and social patterns'
  },

  // Cognitive & Behavioral
  'thinking_style': {
    icon: '🧠',
    label: 'Thinking Style',
    neuralBand: 'theta-high',
    description: 'Cognitive approach patterns'
  },
  'decision_pattern': {
    icon: '🎯',
    label: 'Decision Pattern',
    neuralBand: 'psi',
    description: 'Decision-making tendencies'
  },
  'communication_style': {
    icon: '💬',
    label: 'Communication',
    neuralBand: 'xi',
    description: 'How you express ideas'
  },

  // Goals & Motivation
  'goal_pattern': {
    icon: '🎯',
    label: 'Goal Pattern',
    neuralBand: 'beta-high',
    description: 'Achievement and objective patterns'
  },
  'motivation_driver': {
    icon: '⚡',
    label: 'Motivation Driver',
    neuralBand: 'beta-high',
    description: 'What drives your actions'
  },

  // Creative & Learning
  'creative_pattern': {
    icon: '🎨',
    label: 'Creative Pattern',
    neuralBand: 'xi',
    description: 'Creative expression tendencies'
  },
  'learning_style': {
    icon: '📚',
    label: 'Learning Style',
    neuralBand: 'theta-high',
    description: 'How you acquire knowledge'
  },

  // Problem-Solving
  'problem_solving': {
    icon: '🔧',
    label: 'Problem-Solving',
    neuralBand: 'psi',
    description: 'Approach to challenges'
  },
  'coping_mechanism': {
    icon: '🛡️',
    label: 'Coping Mechanism',
    neuralBand: 'alpha-high',
    description: 'Stress management patterns'
  }
}

// ============================
// DYNAMIC PATTERN GETTER
// ============================

/**
 * Get pattern configuration for ANY pattern type
 * Handles unknown patterns with intelligent fallback
 */
export function getPatternConfig(patternType: string | undefined): PatternConfig {
  if (!patternType) {
    return {
      icon: '✨',
      label: 'Unknown Pattern',
      neuralBand: 'psi',
      description: 'Pattern detected'
    }
  }

  const normalized = patternType.toLowerCase().trim().replace(/\s+/g, '_')

  // Try exact match
  const config = PATTERN_MAP[normalized]
  if (config) return config

  // FALLBACK: Analyze pattern name for keywords
  return analyzeUnknownPattern(patternType, normalized)
}

/**
 * Intelligent fallback for unknown patterns
 * Uses keyword analysis to assign appropriate icon/band
 */
function analyzeUnknownPattern(original: string, normalized: string): PatternConfig {
  // Identity/Self keywords
  if (/identity|self|persona|character|core/.test(normalized)) {
    return {
      icon: '👤',
      label: original,
      neuralBand: 'theta-high',
      description: 'Identity-related pattern'
    }
  }

  // Emotional keywords
  if (/emotion|feel|mood|sentiment|affect/.test(normalized)) {
    return {
      icon: '💭',
      label: original,
      neuralBand: 'alpha-high',
      description: 'Emotional pattern'
    }
  }

  // Temporal keywords
  if (/time|temporal|recurring|cycle|rhythm/.test(normalized)) {
    return {
      icon: '🕐',
      label: original,
      neuralBand: 'psi',
      description: 'Time-based pattern'
    }
  }

  // Growth/Change keywords
  if (/growth|develop|evolv|progress|change/.test(normalized)) {
    return {
      icon: '🌿',
      label: original,
      neuralBand: 'xi',
      description: 'Growth pattern'
    }
  }

  // Connection/Social keywords
  if (/connect|relation|social|interact|bond/.test(normalized)) {
    return {
      icon: '🤝',
      label: original,
      neuralBand: 'alpha-high',
      description: 'Relational pattern'
    }
  }

  // Cognitive keywords
  if (/think|cognit|reason|logic|analyz/.test(normalized)) {
    return {
      icon: '🧩',
      label: original,
      neuralBand: 'theta-high',
      description: 'Cognitive pattern'
    }
  }

  // Goal/Achievement keywords
  if (/goal|achiev|ambition|target|objective/.test(normalized)) {
    return {
      icon: '🎯',
      label: original,
      neuralBand: 'beta-high',
      description: 'Goal-oriented pattern'
    }
  }

  // Default fallback
  return {
    icon: '✨',
    label: original,
    neuralBand: 'psi',
    description: 'Detected pattern'
  }
}

/**
 * Get pattern icon (emoji)
 */
export function getPatternIcon(patternType: string | undefined): string {
  return getPatternConfig(patternType).icon
}

/**
 * Get all registered pattern types
 */
export function getAllPatternTypes(): Array<string> {
  return Object.keys(PATTERN_MAP)
}

/**
 * Check if pattern type is known
 */
export function isKnownPattern(patternType: string): boolean {
  return patternType.toLowerCase().replace(/\s+/g, '_') in PATTERN_MAP
}
