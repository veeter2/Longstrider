/**
 * CONSCIOUSNESS MODE SYSTEM - Living Laws Compliant
 *
 * Maps backend consciousness modes to UI configuration
 * Backend modes: flow, resonance, revelation, fusion, emergence
 *
 * DYNAMIC: Handles unknown modes gracefully
 */

import type { LucideIcon } from 'lucide-react'
import {
  Waves,
  Infinity,
  Eye,
  Orbit,
  Zap,
  Brain,
  Activity,
  Sparkles
} from 'lucide-react'

// ============================
// MODE CONFIGURATION
// ============================

export interface ModeConfig {
  icon: LucideIcon
  label: string
  description: string
  neuralBand: 'beta-high' | 'xi' | 'theta-high' | 'psi' | 'alpha-high' | 'gamma-low'
  color: string        // Tailwind class
  bgColor: string      // Tailwind class
  borderColor: string  // Tailwind class
  glowColor: string    // Tailwind class
}

// Backend consciousness modes (from cce-conductor)
const MODE_MAP: Record<string, ModeConfig> = {
  // FLOW - Streaming consciousness (Psi: Teal)
  'flow': {
    icon: Waves,
    label: 'Flow',
    description: 'Streaming consciousness - natural dialogue flow',
    neuralBand: 'psi',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    glowColor: 'shadow-cyan-500/20'
  },

  // RESONANCE - Deep connection (Alpha-High: Magenta)
  'resonance': {
    icon: Infinity,
    label: 'Resonance',
    description: 'Deep harmonic connection with memories',
    neuralBand: 'alpha-high',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/20'
  },

  // REVELATION - Breakthrough insight (Theta-High: Violet)
  'revelation': {
    icon: Eye,
    label: 'Revelation',
    description: 'Breakthrough insight and discovery',
    neuralBand: 'theta-high',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20'
  },

  // FUSION - Knowledge integration (Gamma-Low: Lavender)
  'fusion': {
    icon: Orbit,
    label: 'Fusion',
    description: 'Integrating knowledge across contexts',
    neuralBand: 'gamma-low',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    glowColor: 'shadow-indigo-500/20'
  },

  // EMERGENCE - Pattern formation (Xi: Amber-Gold)
  'emergence': {
    icon: Zap,
    label: 'Emergence',
    description: 'New patterns forming - creative synthesis',
    neuralBand: 'xi',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/20'
  },

  // LEGACY FALLBACKS (old frontend modes)
  'stream': {
    icon: Activity,
    label: 'Stream',
    description: 'Streaming mode (legacy)',
    neuralBand: 'psi',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    glowColor: 'shadow-cyan-500/20'
  },
  'integration': {
    icon: Infinity,
    label: 'Integration',
    description: 'Integration mode (legacy)',
    neuralBand: 'alpha-high',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/20'
  }
}

// ============================
// DYNAMIC MODE GETTER
// ============================

/**
 * Get mode configuration for ANY mode string
 * Handles unknown modes with intelligent fallback
 */
export function getModeConfig(mode: string | undefined): ModeConfig | null {
  if (!mode) return null

  const normalized = mode.toLowerCase().trim()

  // Try exact match
  const config = MODE_MAP[normalized]
  if (config) return config

  // FALLBACK: Unknown mode
  return {
    icon: Brain,
    label: mode,
    description: `Processing in ${mode} mode`,
    neuralBand: 'psi',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    glowColor: 'shadow-gray-500/20'
  }
}

/**
 * Get all registered modes
 */
export function getAllModes(): Array<string> {
  return Object.keys(MODE_MAP).filter(m => !['stream', 'integration'].includes(m))
}

/**
 * Check if mode is known
 */
export function isKnownMode(mode: string): boolean {
  return mode.toLowerCase() in MODE_MAP
}

/**
 * Get mode neural band color
 */
export function getModeColor(mode: string | undefined): string {
  const config = getModeConfig(mode)
  return config?.color || 'text-gray-400'
}

/**
 * Get mode icon component
 */
export function getModeIcon(mode: string | undefined): LucideIcon {
  const config = getModeConfig(mode)
  return config?.icon || Brain
}
