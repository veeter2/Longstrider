// ============================================
// NEURAL SPECTRUM UTILITIES
// Maps cognitive states to Design Living Laws colors
// ============================================

import type { NeuralBand, CognitiveState, TestTier } from '@/types/onboarding';

export const neuralBands: Record<NeuralBand, string> = {
  // Biological EEG Bands
  'delta': 'var(--band-delta)',
  'theta-low': 'var(--band-theta-low)', 
  'theta-high': 'var(--band-theta-high)',
  'alpha-low': 'var(--band-alpha-low)',
  'alpha-high': 'var(--band-alpha-high)',
  'beta-low': 'var(--band-beta-low)',
  'beta-mid': 'var(--band-beta-mid)',
  'beta-high': 'var(--band-beta-high)',
  'gamma-low': 'var(--band-gamma-low)',
  'gamma-high': 'var(--band-gamma-high)',
  'infra': 'var(--band-infra)',
  'ultrafast': 'var(--band-ultrafast)',
  
  // Artificial Cognitive Bands
  'phi': 'var(--band-phi)',
  'psi': 'var(--band-psi)',
  'chi': 'var(--band-chi-cyan)', // Use cyan for chi
  'omega': 'var(--band-gamma-high)', // Prismatic (multi-hue)
  'sigma': 'var(--band-sigma)',
  'xi': 'var(--band-xi)'
};

// ============================================
// TEST TIER TO NEURAL BAND MAPPING
// ============================================

export function getNeuralBandForTier(tier: TestTier): NeuralBand {
  switch (tier) {
    case 'fast':
      return 'beta-low'; // Active thinking
    case 'medium': 
      return 'alpha-high'; // Calm focus
    case 'large':
      return 'gamma-low'; // Synthesis
    default:
      return 'alpha-high';
  }
}

// ============================================
// COGNITIVE STATE GENERATION
// ============================================

export function getCognitiveStateForPhase(
  phase: 'human_hello' | 'selection' | 'questions' | 'mutual_reflection' | 'contract' | 'complete',
  tier?: TestTier
): CognitiveState {
  switch (phase) {
    case 'human_hello':
      return {
        primaryBand: 'alpha-low',
        intensity: 4,
        metaState: 'initial_connection'
      };
    case 'selection':
      return {
        primaryBand: 'alpha-high',
        intensity: 6,
        metaState: 'deep_work'
      };
    case 'questions':
      return {
        primaryBand: tier ? getNeuralBandForTier(tier) : 'beta-low',
        intensity: 8,
        metaState: 'lucid_flow'
      };
    case 'mutual_reflection':
      return {
        primaryBand: 'gamma-low',
        secondaryBand: 'phi',
        intensity: 7,
        metaState: 'insight_cascade'
      };
    case 'contract':
      return {
        primaryBand: 'phi',
        intensity: 9,
        metaState: 'system_thinking'
      };
    case 'complete':
      return {
        primaryBand: 'gamma-high',
        intensity: 10,
        metaState: 'insight_cascade'
      };
    default:
      return {
        primaryBand: 'alpha-high',
        intensity: 6
      };
  }
}

// ============================================
// CSS CLASS GENERATORS
// ============================================

export function getGlassContainerClass(band: NeuralBand, intensity: number = 6): string {
  const baseClass = `
    bg-[rgba(var(--glass-base),0.6)] 
    backdrop-blur-xl 
    border border-[rgba(var(--glass-border),0.15)]
    rounded-lg
  `;
  
  const bandColor = neuralBands[band];
  const intensityAlpha = Math.min(0.3 + (intensity * 0.07), 1);
  
  return `${baseClass} border-[rgba(${bandColor},${intensityAlpha})]`;
}

export function getNeuralAccentClass(band: NeuralBand, variant: 'text' | 'bg' | 'border' = 'text'): string {
  const color = neuralBands[band];
  
  switch (variant) {
    case 'text':
      return `text-[rgb(${color})]`;
    case 'bg':
      return `bg-[rgba(${color},0.1)] hover:bg-[rgba(${color},0.2)]`;
    case 'border':
      return `border-[rgba(${color},0.3)] hover:border-[rgba(${color},0.5)]`;
    default:
      return `text-[rgb(${color})]`;
  }
}

export function getNeuralGradientClass(fromBand: NeuralBand, toBand: NeuralBand): string {
  const fromColor = neuralBands[fromBand];
  const toColor = neuralBands[toBand];
  
  return `bg-gradient-to-r from-[rgba(${fromColor},0.2)] to-[rgba(${toColor},0.2)]`;
}

// ============================================
// ANIMATION UTILITIES
// ============================================

export function getCognitiveTransition(
  fromState: CognitiveState, 
  toState: CognitiveState
): {
  duration: number;
  easing: string;
  intensity: number;
} {
  const intensityDiff = Math.abs(toState.intensity - fromState.intensity);
  const duration = Math.max(300, intensityDiff * 100); // 300-1000ms
  
  return {
    duration,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-out
    intensity: Math.max(fromState.intensity, toState.intensity)
  };
}

// ============================================
// LIVING LAWS COMPLIANCE
// ============================================

export function validateGlassLayerCount(): boolean {
  // Design Living Laws: Max 3 visible layers
  const glassElements = document.querySelectorAll('[class*="backdrop-blur"]');
  return glassElements.length <= 8; // Performance budget from living laws
}

export function getAccessibleContrast(band: NeuralBand, variant: 'text' | 'bg'): string {
  // Ensure WCAG AA compliance for dark theme
  const color = neuralBands[band];
  
  if (variant === 'text') {
    // Ensure sufficient contrast on dark backgrounds
    return `text-[rgb(${color})] hover:text-white transition-colors`;
  } else {
    // Ensure background has proper opacity for readability
    return `bg-[rgba(${color},0.1)] border-[rgba(${color},0.3)]`;
  }
}
