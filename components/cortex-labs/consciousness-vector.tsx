"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Zap, Shield, Sparkles, Link } from "lucide-react"

interface ConsciousnessVectorProps {
  vector: number[]
  gravity: number
  integrity: number
  coherence_score: number
  consciousness_cords: number
  quantum_entanglement_level: string
  evolution_rate: number
}

const DIMENSION_LABELS = [
  "Identity Coherence",
  "Emotional Depth",
  "Pattern Recognition",
  "Creative Synthesis",
  "Strategic Thinking",
  "Memory Integration",
  "Relationship Resonance",
  "Self-Awareness",
  "Temporal Continuity",
  "Adaptive Learning"
]

export default function ConsciousnessVector({
  vector,
  gravity,
  integrity,
  coherence_score,
  consciousness_cords,
  quantum_entanglement_level,
  evolution_rate
}: ConsciousnessVectorProps) {
  const [hoveredDimension, setHoveredDimension] = useState<number | null>(null)

  const getColorForValue = (value: number) => {
    if (value >= 0.7) return "bg-[rgb(var(--band-psi))]"  // Teal - high activation
    if (value >= 0.4) return "bg-[rgb(var(--band-xi))]"   // Amber - moderate
    return "bg-[rgb(var(--band-beta-high))]"              // Red-orange - low
  }

  const getGlowForValue = (value: number) => {
    if (value >= 0.7) return "shadow-[rgb(var(--band-psi))]/50"
    if (value >= 0.4) return "shadow-[rgb(var(--band-xi))]/50"
    return "shadow-[rgb(var(--band-beta-high))]/50"
  }

  const getTextColorForValue = (value: number) => {
    if (value >= 0.7) return "text-[rgb(var(--band-psi))]"
    if (value >= 0.4) return "text-[rgb(var(--band-xi))]"
    return "text-[rgb(var(--band-beta-high))]"
  }

  const getEntanglementColor = (level: string) => {
    switch (level) {
      case "QUANTUM_ENTANGLED":
        return "text-[rgb(var(--band-alpha-high))] bg-[rgba(var(--band-alpha-high),0.2)] border-[rgba(var(--band-alpha-high),0.5)]"  // Magenta
      case "APPROACHING_ENTANGLEMENT":
        return "text-[rgb(var(--band-chi-cyan))] bg-[rgba(var(--band-chi-cyan),0.2)] border-[rgba(var(--band-chi-cyan),0.5)]"  // Chi-cyan
      case "DEEPENING":
        return "text-[rgb(var(--band-theta-high))] bg-[rgba(var(--band-theta-high),0.2)] border-[rgba(var(--band-theta-high),0.5)]"  // Violet
      case "DEVELOPING":
        return "text-[rgb(var(--band-psi))] bg-[rgba(var(--band-psi),0.2)] border-[rgba(var(--band-psi),0.5)]"  // Teal
      default:
        return "text-[rgb(var(--band-sigma))] bg-[rgba(var(--band-sigma),0.2)] border-[rgba(var(--band-sigma),0.5)]"  // Silver-gray
    }
  }

  const getIntegrityStatus = () => {
    if (integrity >= 0.9) return { text: "OPTIMAL", color: "text-[rgb(var(--band-psi))]" }
    if (integrity >= 0.7) return { text: "STABLE", color: "text-[rgb(var(--band-chi-cyan))]" }
    if (integrity >= 0.5) return { text: "CAUTION", color: "text-[rgb(var(--band-xi))]" }
    return { text: "CRITICAL", color: "text-[rgb(var(--band-beta-high))]" }
  }

  const integrityStatus = getIntegrityStatus()

  return (
    <div className="bg-white/5 backdrop-blur-macos rounded-macos-xl p-5 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-light text-white">Consciousness Vector</h3>
          <p className="text-xs text-gray-400">10D Substrate</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[rgb(var(--band-chi-cyan))] rounded-full animate-pulse"></div>
          <span className="text-xs text-[rgb(var(--band-chi-cyan))] font-medium">LIVE</span>
        </div>
      </div>

      {/* 10D Vector Bars */}
      <div className="space-y-2 mb-4">
        {vector.map((value, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
            onMouseEnter={() => setHoveredDimension(index)}
            onMouseLeave={() => setHoveredDimension(null)}
          >
            <div className="flex items-center gap-3">
              <div className="w-32 text-xs text-gray-400 truncate">
                {DIMENSION_LABELS[index]}
              </div>
              <div className="flex-1 relative">
                <div className="h-5 bg-white/5 rounded-md overflow-hidden border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.05 }}
                    className={`h-full ${getColorForValue(value)} relative`}
                  >
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                  </motion.div>
                </div>
              </div>
              <div className={`w-12 text-right text-xs font-mono ${getTextColorForValue(value)}`}>
                {value.toFixed(2)}
              </div>
            </div>

            {/* Hover tooltip */}
            {hoveredDimension === index && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-40 top-10 z-10 bg-black/90 backdrop-blur-xl border border-white/20 rounded-macos-lg px-4 py-3 shadow-2xl"
              >
                <p className="text-xs text-gray-300 whitespace-nowrap">
                  {DIMENSION_LABELS[index]}: <span className={getTextColorForValue(value)}>{(value * 100).toFixed(0)}%</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {value >= 0.7 ? "Strong activation" : value >= 0.4 ? "Moderate activation" : "Weak activation"}
                </p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Gravity */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="h-4 w-4 text-[rgb(var(--band-xi))]" />
            <span className="text-xs text-gray-400">Gravity</span>
          </div>
          <div className="text-xl font-light text-[rgb(var(--band-xi))]">{gravity.toFixed(2)}</div>
        </div>

        {/* Integrity */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Shield className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-400">Integrity</span>
          </div>
          <div className={`text-xl font-light ${integrityStatus.color}`}>{integrity.toFixed(2)}</div>
        </div>

        {/* Coherence */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="h-4 w-4 text-[rgb(var(--band-chi-cyan))]" />
            <span className="text-xs text-gray-400">Coherence</span>
          </div>
          <div className="text-xl font-light text-[rgb(var(--band-chi-cyan))]">{coherence_score.toFixed(2)}</div>
        </div>

        {/* Consciousness Cords */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Link className="h-4 w-4 text-[rgb(var(--band-alpha-high))]" />
            <span className="text-xs text-gray-400">Cords</span>
          </div>
          <div className="text-xl font-light text-[rgb(var(--band-alpha-high))]">{consciousness_cords}</div>
        </div>
      </div>

      {/* Evolution Rate & Entanglement */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Evolution:</span>
          <span className="text-xs font-mono text-[rgb(var(--band-chi-cyan))]">{evolution_rate.toFixed(3)}</span>
        </div>
        <div className={`text-xs px-2 py-0.5 rounded border ${getEntanglementColor(quantum_entanglement_level)}`}>
          {quantum_entanglement_level.replace(/_/g, " ")}
        </div>
      </div>
    </div>
  )
}
