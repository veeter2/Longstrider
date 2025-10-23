/**
 * CONSCIOUSNESS MAPPING LIBRARY
 *
 * Centralized, Living Laws-compliant mapping system for:
 * - Emotions → Icons + Neural Bands
 * - Consciousness Modes → Icons + Colors
 * - Pattern Types → Icons + Descriptions
 *
 * FULLY DYNAMIC: Handles ANY backend value gracefully
 */

// Re-export everything
export * from './emotion-system'
export * from './mode-system'
export * from './pattern-system'

// Convenience exports
export { getEmotionConfig } from './emotion-system'
export { getModeConfig, getModeColor, getModeIcon } from './mode-system'
export { getPatternConfig, getPatternIcon } from './pattern-system'
