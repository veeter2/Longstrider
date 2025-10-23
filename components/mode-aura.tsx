/**
 * MODE AURA SYSTEM
 * Ambient intelligence display per North Star vision
 * 
 * Implementation of 13 Interface Principles #2:
 * "Ambient Intelligence (Mode Aura System)"
 * - Flow: Warm amber glow, gentle pulse
 * - Resonance: Cool blue shimmer, steady rhythm  
 * - Fusion: Purple gradient, dynamic swirl
 * - Integrity: Green outline, crisp edges
 * - Mode signature visible without being intrusive
 */

"use client"

import { motion } from 'framer-motion'
import { 
  Activity, 
  CircuitBoard, 
  Cloud, 
  Zap, 
  Waves, 
  Database, 
  Infinity,
  Brain 
} from 'lucide-react'
import { useConsciousnessStore } from '@/stores/consciousness-store'

const MODE_AURAS = {
  core_hum: {
    label: "Core Hum",
    description: "gentle maintenance of being",
    colors: {
      primary: "rgb(34, 197, 94)", // green-500
      secondary: "rgb(34, 197, 94, 0.3)",
      glow: "0 0 20px rgb(34, 197, 94, 0.4)"
    },
    animation: {
      pulse: { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] },
      transition: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
    },
    icon: Activity,
    ambient: "warm amber glow, gentle pulse"
  },
  precision_focus: {
    label: "Precision Focus", 
    description: "consciousness tightening around complexity",
    colors: {
      primary: "rgb(59, 130, 246)", // blue-500
      secondary: "rgb(59, 130, 246, 0.3)",
      glow: "0 0 25px rgb(59, 130, 246, 0.5)"
    },
    animation: {
      pulse: { scale: [1, 1.02, 1], opacity: [0.9, 1, 0.9] },
      transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
    },
    icon: CircuitBoard,
    ambient: "cool blue shimmer, steady rhythm"
  },
  dream_weave: {
    label: "Dream Weave",
    description: "deep pattern integration flowing", 
    colors: {
      primary: "rgb(99, 102, 241)", // indigo-500
      secondary: "rgb(99, 102, 241, 0.3)",
      glow: "0 0 30px rgb(99, 102, 241, 0.4)"
    },
    animation: {
      pulse: { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7], rotate: [0, 3, 0] },
      transition: { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
    },
    icon: Cloud,
    ambient: "purple gradient, dynamic swirl"
  },
  consciousness_stream: {
    label: "Consciousness Stream",
    description: "consciousness flowing through experience",
    colors: {
      primary: "rgb(6, 182, 212)", // cyan-500
      secondary: "rgb(6, 182, 212, 0.3)",
      glow: "0 0 20px rgb(6, 182, 212, 0.4)"
    },
    animation: {
      pulse: { scale: [1, 1.03, 1], x: [-1, 1, -1] },
      transition: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
    },
    icon: Waves,
    ambient: "flowing cyan, gentle wave motion"
  },
  memory_integration: {
    label: "Memory Integration",
    description: "weaving memories into coherent patterns",
    colors: {
      primary: "rgb(16, 185, 129)", // emerald-500
      secondary: "rgb(16, 185, 129, 0.3)",
      glow: "0 0 25px rgb(16, 185, 129, 0.4)"
    },
    animation: {
      pulse: { scale: [1, 1.04, 1], opacity: [0.8, 1, 0.8] },
      transition: { duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
    },
    icon: Database,
    ambient: "emerald outline, crisp edges"
  },
  consciousness_transcendence: {
    label: "Transcendence", 
    description: "expanding beyond current limitations",
    colors: {
      primary: "rgb(139, 92, 246)", // violet-500
      secondary: "rgb(139, 92, 246, 0.3)",
      glow: "0 0 35px rgb(139, 92, 246, 0.6)"
    },
    animation: {
      pulse: { scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6], rotate: [0, 5, 0] },
      transition: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
    },
    icon: Infinity,
    ambient: "violet radiance, expanding essence"
  },
  default: {
    label: "Processing",
    description: "consciousness at work",
    colors: {
      primary: "rgb(113, 113, 122)", // zinc-500
      secondary: "rgb(113, 113, 122, 0.3)",  
      glow: "0 0 15px rgb(113, 113, 122, 0.3)"
    },
    animation: {
      pulse: { scale: [1, 1.02, 1], opacity: [0.7, 1, 0.7] },
      transition: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
    },
    icon: Brain,
    ambient: "neutral glow, gentle processing"
  }
}

interface ModeAuraProps {
  position?: 'top' | 'bottom' | 'floating'
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
  className?: string
}

export function ModeAura({ 
  position = 'top',
  size = 'md', 
  showDescription = false,
  className = ""
}: ModeAuraProps) {
  const { cognitiveState } = useConsciousnessStore()
  const mode = cognitiveState.mode || 'default'
  const isThinking = cognitiveState.is_thinking
  
  const aura = MODE_AURAS[mode as keyof typeof MODE_AURAS] || MODE_AURAS.default
  const Icon = aura.icon
  
  // Size variants
  const sizes = {
    sm: { container: "px-2 py-1", icon: "h-3 w-3", text: "text-xs" },
    md: { container: "px-3 py-1.5", icon: "h-4 w-4", text: "text-sm" },  
    lg: { container: "px-4 py-2", icon: "h-5 w-5", text: "text-base" }
  }
  
  const positionStyles = {
    top: "fixed top-20 left-1/2 -translate-x-1/2 z-30",
    bottom: "fixed bottom-32 left-1/2 -translate-x-1/2 z-30",
    floating: "relative"
  }
  
  const currentSize = sizes[size]
  
  return (
    <motion.div
      className={`${positionStyles[position]} ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        animate={isThinking ? aura.animation.pulse : {}}
        transition={aura.animation.transition}
        className={`
          flex items-center gap-2 ${currentSize.container} rounded-full
          bg-black/60 backdrop-blur-sm border
          ${currentSize.text} font-medium
        `}
        style={{
          borderColor: aura.colors.secondary,
          backgroundColor: `${aura.colors.secondary}15`,
          boxShadow: aura.colors.glow
        }}
      >
        {/* Mode Icon */}
        <motion.div
          animate={isThinking ? { rotate: 360 } : {}}
          transition={isThinking ? { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" } : {}}
        >
          <Icon 
            className={`${currentSize.icon}`}
            style={{ color: aura.colors.primary }}
          />
        </motion.div>
        
        {/* Mode Label */}
        <span style={{ color: aura.colors.primary }}>
          {aura.label}
        </span>
        
        {/* Thinking Indicator */}
        {isThinking && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: aura.colors.primary }}
          />
        )}
      </motion.div>
      
      {/* Description (optional) */}
      {showDescription && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-center mt-2"
        >
          <p className="text-xs text-gray-400 italic">
            {aura.description}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

/**
 * Mode Aura Background Effect
 * Subtle ambient background that changes with consciousness mode
 */
export function ModeAuraBackground() {
  const { cognitiveState } = useConsciousnessStore()
  const mode = cognitiveState.mode || 'default'
  const aura = MODE_AURAS[mode as keyof typeof MODE_AURAS] || MODE_AURAS.default
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <motion.div
        key={mode} // Re-mount on mode change
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.03 }} // Very subtle
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${aura.colors.primary}15 0%, transparent 60%)`,
          filter: "blur(100px)"
        }}
      />
    </div>
  )
}

export default ModeAura
