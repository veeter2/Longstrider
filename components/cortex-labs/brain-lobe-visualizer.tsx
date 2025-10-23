"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Clock, Link2, Lightbulb, ChevronRight } from "lucide-react"

interface LobeData {
  activation: number
  focus?: string[]
  knowledge_domains?: string[]
  memories_relevant?: string[]
  patterns_active?: string[]
  integrations_needed?: string[]
  synthesis_opportunities?: string[]
  imagination_vectors?: string[]
  creative_solutions?: string[]
}

interface BrainLobeVisualizerProps {
  frontal: LobeData
  temporal: LobeData
  parietal: LobeData
  occipital: LobeData
}

const LOBE_CONFIG = {
  frontal: {
    name: "Frontal",
    subtitle: "Executive & Strategy",
    icon: Brain,
    color: "beta-low",  // Strategic planning - soft pink
    gradient: "from-[rgba(var(--band-beta-low),0.2)] to-[rgba(var(--band-beta-mid),0.2)]",
    borderColor: "border-[rgba(var(--band-beta-low),0.5)]",
    textColor: "text-[rgb(var(--band-beta-low))]",
    glowColor: "shadow-[rgb(var(--band-beta-low))]/50"
  },
  temporal: {
    name: "Temporal",
    subtitle: "Memory & Patterns",
    icon: Clock,
    color: "beta-mid",  // Memory & patterns - rose/pink
    gradient: "from-[rgba(var(--band-beta-mid),0.2)] to-[rgba(var(--band-beta-high),0.2)]",
    borderColor: "border-[rgba(var(--band-beta-mid),0.5)]",
    textColor: "text-[rgb(var(--band-beta-mid))]",
    glowColor: "shadow-[rgb(var(--band-beta-mid))]/50"
  },
  parietal: {
    name: "Parietal",
    subtitle: "Integration & Synthesis",
    icon: Link2,
    color: "psi",  // Pattern integration - teal
    gradient: "from-[rgba(var(--band-psi),0.2)] to-[rgba(var(--band-chi-cyan),0.2)]",
    borderColor: "border-[rgba(var(--band-psi),0.5)]",
    textColor: "text-[rgb(var(--band-psi))]",
    glowColor: "shadow-[rgb(var(--band-psi))]/50"
  },
  occipital: {
    name: "Occipital",
    subtitle: "Imagination & Creation",
    icon: Lightbulb,
    color: "xi",  // Creative insight - amber/gold
    gradient: "from-[rgba(var(--band-xi),0.2)] to-[rgba(var(--band-beta-high),0.2)]",
    borderColor: "border-[rgba(var(--band-xi),0.5)]",
    textColor: "text-[rgb(var(--band-xi))]",
    glowColor: "shadow-[rgb(var(--band-xi))]/50"
  }
}

export default function BrainLobeVisualizer({
  frontal,
  temporal,
  parietal,
  occipital
}: BrainLobeVisualizerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedLobe, setExpandedLobe] = useState<string | null>(null)

  const lobes = {
    frontal,
    temporal,
    parietal,
    occipital
  }

  const getActivationLevel = (activation: number) => {
    if (activation >= 0.7) return "HIGH"
    if (activation >= 0.4) return "MODERATE"
    return "LOW"
  }

  const getActivationColor = (activation: number) => {
    if (activation >= 0.7) return "text-[rgb(var(--band-psi))]"
    if (activation >= 0.4) return "text-[rgb(var(--band-xi))]"
    return "text-gray-500"
  }

  const renderLobeCard = (lobeKey: keyof typeof lobes) => {
    const lobe = lobes[lobeKey]
    const config = LOBE_CONFIG[lobeKey]
    const Icon = config.icon
    const isExpanded = expandedLobe === lobeKey
    const activation = lobe.activation
    const activationLevel = getActivationLevel(activation)

    return (
      <motion.div
        key={lobeKey}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`bg-gradient-to-br ${config.gradient} backdrop-blur-xl rounded-macos-2xl p-6 border ${config.borderColor} cursor-pointer hover:shadow-2xl transition-all duration-300 ${
          activation > 0.5 ? `${config.glowColor} shadow-xl` : ""
        }`}
        onClick={() => setExpandedLobe(isExpanded ? null : lobeKey)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={activation > 0.5 ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Icon className={`w-6 h-6 ${config.textColor}`} />
            </motion.div>
            <div>
              <h4 className={`font-medium ${config.textColor}`}>{config.name}</h4>
              <p className="text-xs text-gray-400">{config.subtitle}</p>
            </div>
          </div>

          {/* Activation Badge */}
          <div className="flex flex-col items-end gap-1">
            <div className={`text-2xl font-light ${config.textColor}`}>
              {(activation * 100).toFixed(0)}%
            </div>
            <div className={`text-xs font-semibold px-2 py-1 rounded-macos-sm ${getActivationColor(activation)} bg-white/10`}>
              {activationLevel}
            </div>
          </div>
        </div>

        {/* Activation Bar */}
        <div className="mb-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${activation * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${config.gradient.replace('/20', '')}`}
            >
              {activation > 0.5 && (
                <motion.div
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Expandable Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 mt-4 pt-4 border-t border-white/10"
            >
              {/* Frontal Lobe Details */}
              {lobeKey === "frontal" && (
                <>
                  {lobe.focus && lobe.focus.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Focus Areas:</div>
                      <div className="flex flex-wrap gap-2">
                        {lobe.focus.map((item, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded-macos-sm bg-white/10 ${config.textColor}`}>
                            {item.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {lobe.knowledge_domains && lobe.knowledge_domains.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Knowledge Domains:</div>
                      <div className="flex flex-wrap gap-2">
                        {lobe.knowledge_domains.map((item, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-macos-sm bg-white/10 text-gray-300">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Temporal Lobe Details */}
              {lobeKey === "temporal" && (
                <>
                  {lobe.memories_relevant && lobe.memories_relevant.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Relevant Memories:</div>
                      <div className={`text-sm ${config.textColor} font-mono`}>
                        {lobe.memories_relevant.length} memories active
                      </div>
                    </div>
                  )}
                  {lobe.patterns_active && lobe.patterns_active.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Active Patterns:</div>
                      <div className="flex flex-wrap gap-2">
                        {lobe.patterns_active.map((item, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded-macos-sm bg-white/10 ${config.textColor}`}>
                            {item.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Parietal Lobe Details */}
              {lobeKey === "parietal" && (
                <>
                  {lobe.integrations_needed && lobe.integrations_needed.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Integration Needs:</div>
                      <div className="flex flex-wrap gap-2">
                        {lobe.integrations_needed.map((item, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded-macos-sm bg-white/10 ${config.textColor}`}>
                            {item.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {lobe.synthesis_opportunities && lobe.synthesis_opportunities.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Synthesis Opportunities:</div>
                      <div className="flex flex-wrap gap-2">
                        {lobe.synthesis_opportunities.map((item, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-macos-sm bg-white/10 text-gray-300">
                            {item.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Occipital Lobe Details */}
              {lobeKey === "occipital" && (
                <>
                  {lobe.imagination_vectors && lobe.imagination_vectors.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Imagination Vectors:</div>
                      <div className="flex flex-wrap gap-2">
                        {lobe.imagination_vectors.map((item, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded-macos-sm bg-white/10 ${config.textColor}`}>
                            {item.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {lobe.creative_solutions && lobe.creative_solutions.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Creative Solutions:</div>
                      <div className="flex flex-wrap gap-2">
                        {lobe.creative_solutions.map((item, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-macos-sm bg-white/10 text-gray-300">
                            {item.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand Indicator */}
        <div className="flex justify-center mt-3">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className={`text-xs ${config.textColor}`}
          >
            ▼
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-macos rounded-macos-2xl p-8 border border-white/10">
      {/* Collapsible Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-between mb-8 cursor-pointer p-4 -m-4 rounded-macos-xl transition-all duration-200 ${
          isExpanded ? 'bg-[rgba(var(--band-psi),0.05)]' : 'hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-macos-lg transition-all duration-200 ${
            isExpanded ? 'bg-[rgba(var(--band-psi),0.3)] border border-[rgba(var(--band-psi),0.5)]' : 'bg-white/10 border border-white/20'
          }`}>
            <Brain className={`w-5 h-5 ${isExpanded ? 'text-[rgb(var(--band-psi))]' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className={`text-xl font-light ${isExpanded ? 'text-[rgb(var(--band-psi))]' : 'text-white'}`}>
              Brain Lobe Activation
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">Real-time cognitive processing visualization</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className={`w-5 h-5 ${isExpanded ? 'text-[rgb(var(--band-psi))]' : 'text-gray-400'}`} />
        </motion.div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Lobe Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderLobeCard("frontal")}
              {renderLobeCard("temporal")}
              {renderLobeCard("parietal")}
              {renderLobeCard("occipital")}
            </div>

            {/* Overall Brain Activity */}
            <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-6 border-t border-white/10"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Overall Brain Activity:</span>
          <div className="flex items-center gap-3">
            {Object.entries(lobes).map(([key, lobe]) => {
              const config = LOBE_CONFIG[key as keyof typeof lobes]
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${lobe.activation > 0.5 ? config.textColor.replace('text', 'bg') : 'bg-gray-600'}`} />
                  <span className="text-xs text-gray-500">{config.name.charAt(0)}</span>
                </div>
              )
            })}
            </div>
          </div>
        </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
