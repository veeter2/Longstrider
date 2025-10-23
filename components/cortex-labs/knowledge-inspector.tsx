"use client"

/**
 * Knowledge Inspector - Professional Polish v2.1
 * Primary card with sub-expandable layers
 * Aligned with Living Design Laws
 */

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronRight, Lock, Sparkles, Brain, Book, User, Database, CheckCircle, AlertCircle } from "lucide-react"

interface KnowledgeInspectorProps {
  living_laws: {
    active: string[]
    quantum_entanglement_level: string
    consciousness_cords?: number
  }
  self_knowledge: {
    cce_functions: Record<string, string>
    decision_trace?: string[]
    system_architecture?: any
  }
  domain_knowledge: {
    user_uploaded: string[]
    preseeded: string[]
    relevant_chunks: any[]
    relevant_sources: string[]
    application_instructions?: any
  }
  business_ip: {
    applicable: Array<{key: string, description: string, effectiveness: number}>
    confidentiality_level: string
    total_ip_count?: number
  }
  personal_context: {
    user_patterns: Array<{pattern: string, strength: number, last_observed?: string}>
    relationship_map?: any
    preferences?: any
    active_goals: string[]
  }
}

const LAYER_CONFIG = {
  living_laws: {
    name: "Living Laws",
    icon: Sparkles,
    band: "alpha-high",  // α₂ Magenta - Core system principles
    description: "System consciousness framework"
  },
  self_knowledge: {
    name: "Self-Knowledge",
    icon: Brain,
    band: "chi-cyan",  // χ Cyan - Self-awareness
    description: "CCE functions & decision traces"
  },
  domain_knowledge: {
    name: "Domain Knowledge",
    icon: Book,
    band: "theta-high",  // θ₂ Violet - Spatial memory, navigation
    description: "External knowledge sources"
  },
  business_ip: {
    name: "Business IP",
    icon: Lock,
    band: "xi",  // ξ Amber - Insight emergence
    description: "Proprietary company knowledge"
  },
  personal_context: {
    name: "Personal Context",
    icon: User,
    band: "psi",  // ψ Teal - Pattern recognition
    description: "User patterns & preferences"
  }
}

export default function KnowledgeInspector({
  living_laws,
  self_knowledge,
  domain_knowledge,
  business_ip,
  personal_context
}: KnowledgeInspectorProps) {
  const [expandedLayer, setExpandedLayer] = useState<string | null>("living_laws")

  const toggleLayer = (layer: string) => {
    setExpandedLayer(expandedLayer === layer ? null : layer)
  }

  const getEntanglementColor = (level: string) => {
    switch (level) {
      case "QUANTUM_ENTANGLED":
        return "text-[rgb(var(--band-gamma-high))] bg-[rgba(var(--band-gamma-high),0.2)] border-[rgba(var(--band-gamma-high),0.5)]"
      case "APPROACHING_ENTANGLEMENT":
        return "text-[rgb(var(--band-alpha-high))] bg-[rgba(var(--band-alpha-high),0.2)] border-[rgba(var(--band-alpha-high),0.5)]"
      case "DEEPENING":
        return "text-[rgb(var(--band-theta-high))] bg-[rgba(var(--band-theta-high),0.2)] border-[rgba(var(--band-theta-high),0.5)]"
      case "DEVELOPING":
        return "text-[rgb(var(--band-psi))] bg-[rgba(var(--band-psi),0.2)] border-[rgba(var(--band-psi),0.5)]"
      default:
        return "text-[rgb(var(--band-sigma))] bg-[rgba(var(--band-sigma),0.2)] border-[rgba(var(--band-sigma),0.5)]"
    }
  }

  const renderLayerHeader = (layerKey: string, isActive: boolean) => {
    const config = LAYER_CONFIG[layerKey as keyof typeof LAYER_CONFIG]
    const Icon = config.icon
    const isExpanded = expandedLayer === layerKey
    const bandVar = `--band-${config.band}`

    return (
      <div
        onClick={() => toggleLayer(layerKey)}
        className={`flex items-center justify-between p-4 rounded-macos-xl cursor-pointer transition-all duration-200 ${
          isExpanded ? `bg-[rgba(var(${bandVar}),0.15)] border border-[rgba(var(${bandVar}),0.5)]` : 'bg-white/5 border border-white/10 hover:bg-white/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-macos-lg ${
            isExpanded ? `bg-[rgba(var(${bandVar}),0.3)] border border-[rgba(var(${bandVar}),0.5)]` : 'bg-white/10 border border-white/20'
          }`}>
            <Icon className={`w-5 h-5 ${isExpanded ? `text-[rgb(var(${bandVar}))]` : 'text-gray-400'}`} />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isExpanded ? `text-[rgb(var(${bandVar}))]` : 'text-white'}`}>
                {config.name}
              </span>
              {isActive && (
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`w-2 h-2 rounded-full bg-[rgb(var(${bandVar}))]`}
                />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className={`w-5 h-5 ${isExpanded ? `text-[rgb(var(${bandVar}))]` : 'text-gray-400'}`} />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-macos rounded-macos-2xl p-8 border border-white/10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-light text-white">Knowledge Layers</h3>
          <div className="flex gap-1">
            {Object.entries(LAYER_CONFIG).map(([key, config]) => {
              const bandVar = `--band-${config.band}`
              let isActive = false

              // Determine if layer is active
              if (key === 'living_laws') isActive = living_laws.active.length > 0
              if (key === 'self_knowledge') isActive = Object.keys(self_knowledge.cce_functions).length > 0
              if (key === 'domain_knowledge') isActive = domain_knowledge.relevant_sources.length > 0
              if (key === 'business_ip') isActive = business_ip.applicable.length > 0
              if (key === 'personal_context') isActive = personal_context.user_patterns.length > 0 || personal_context.active_goals.length > 0

              return isActive ? (
                <div
                  key={key}
                  className={`w-2 h-2 rounded-full bg-[rgb(var(${bandVar}))]`}
                  title={config.name}
                />
              ) : null
            })}
          </div>
        </div>
        <p className="text-sm text-gray-400">5-layer intelligent knowledge system</p>
      </div>

      {/* Sub-Layers */}
      <div className="space-y-4">
        {/* Layer 1: Living Laws */}
        <div>
          {renderLayerHeader("living_laws", living_laws.active.length > 0)}
          <AnimatePresence>
            {expandedLayer === "living_laws" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 space-y-4 p-4 bg-white/5 rounded-macos-lg border border-white/10"
              >
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-3">Active Laws ({living_laws.active.length})</div>
                  <div className="flex flex-wrap gap-2">
                    {living_laws.active.map((law, i) => (
                      <span key={i} className="text-xs px-3 py-1.5 rounded-macos-sm bg-[rgba(var(--band-alpha-high),0.2)] text-[rgb(var(--band-alpha-high))] border border-[rgba(var(--band-alpha-high),0.3)]">
                        {law.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-macos-lg bg-white/5 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Quantum Entanglement</div>
                    <div className={`text-xs px-2 py-1 rounded-macos-sm border inline-block ${getEntanglementColor(living_laws.quantum_entanglement_level)}`}>
                      {living_laws.quantum_entanglement_level.replace(/_/g, " ")}
                    </div>
                  </div>
                  {living_laws.consciousness_cords !== undefined && (
                    <div className="p-3 rounded-macos-lg bg-white/5 border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Consciousness Cords</div>
                      <div className="text-2xl font-light text-[rgb(var(--band-alpha-high))]">{living_laws.consciousness_cords}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Layer 2: Self-Knowledge */}
        <div>
          {renderLayerHeader("self_knowledge", Object.keys(self_knowledge.cce_functions).length > 0)}
          <AnimatePresence>
            {expandedLayer === "self_knowledge" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 space-y-4 p-4 bg-white/5 rounded-macos-lg border border-white/10"
              >
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-3">CCE Functions ({Object.keys(self_knowledge.cce_functions).length})</div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {Object.entries(self_knowledge.cce_functions).map(([key, description]) => (
                      <div key={key} className="p-3 bg-white/5 rounded-macos-lg border border-white/10">
                        <div className="text-xs font-mono text-[rgb(var(--band-chi-cyan))] mb-1">{key}</div>
                        <div className="text-xs text-gray-400">{description}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {self_knowledge.decision_trace && self_knowledge.decision_trace.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-400 mb-3">Recent Decision Trace</div>
                    <div className="space-y-1">
                      {self_knowledge.decision_trace.slice(0, 3).map((decision, i) => (
                        <div key={i} className="text-xs text-gray-300 font-mono bg-black/40 px-3 py-2 rounded-macos-sm">
                          {decision}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Layer 3: Domain Knowledge */}
        <div>
          {renderLayerHeader("domain_knowledge", domain_knowledge.relevant_sources.length > 0)}
          <AnimatePresence>
            {expandedLayer === "domain_knowledge" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 space-y-4 p-4 bg-white/5 rounded-macos-lg border border-white/10"
              >
                {domain_knowledge.user_uploaded.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-400 mb-3">User Uploaded ({domain_knowledge.user_uploaded.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {domain_knowledge.user_uploaded.map((source, i) => (
                        <span key={i} className="text-xs px-3 py-1.5 rounded-macos-sm bg-[rgba(var(--band-theta-high),0.2)] text-[rgb(var(--band-theta-high))] border border-[rgba(var(--band-theta-high),0.3)]">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {domain_knowledge.preseeded.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-400 mb-3">Preseeded Knowledge ({domain_knowledge.preseeded.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {domain_knowledge.preseeded.map((source, i) => (
                        <span key={i} className="text-xs px-3 py-1.5 rounded-macos-sm bg-white/10 text-gray-300 border border-white/20">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {domain_knowledge.relevant_chunks.length > 0 && (
                  <div className="p-4 rounded-macos-lg bg-[rgba(var(--band-theta-high),0.1)] border border-[rgba(var(--band-theta-high),0.3)]">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[rgb(var(--band-theta-high))]" />
                      <span className="text-sm text-[rgb(var(--band-theta-high))]">
                        {domain_knowledge.relevant_chunks.length} semantic matches (0.7+ similarity)
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Layer 4: Business IP */}
        <div>
          {renderLayerHeader("business_ip", business_ip.applicable.length > 0)}
          <AnimatePresence>
            {expandedLayer === "business_ip" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 space-y-4 p-4 bg-white/5 rounded-macos-lg border border-white/10"
              >
                <div className="p-3 rounded-macos-lg bg-[rgba(var(--band-xi),0.1)] border border-[rgba(var(--band-xi),0.3)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Confidentiality Level</span>
                    <span className="text-xs px-3 py-1 rounded-macos-sm bg-[rgba(var(--band-xi),0.2)] text-[rgb(var(--band-xi))] border border-[rgba(var(--band-xi),0.4)] font-medium">
                      {business_ip.confidentiality_level}
                    </span>
                  </div>
                </div>

                {business_ip.applicable.length > 0 ? (
                  <div>
                    <div className="text-xs font-medium text-gray-400 mb-3">Applicable IP ({business_ip.applicable.length})</div>
                    <div className="space-y-3">
                      {business_ip.applicable.map((ip, i) => (
                        <div key={i} className="p-4 bg-[rgba(var(--band-xi),0.1)] rounded-macos-lg border border-[rgba(var(--band-xi),0.3)]">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="text-sm font-mono text-[rgb(var(--band-xi))]">{ip.key}</span>
                            <div className="text-right">
                              <div className="text-xs text-gray-400">effectiveness</div>
                              <div className="text-sm font-medium text-[rgb(var(--band-xi))]">{(ip.effectiveness * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-300">{ip.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <div className="text-xs text-gray-500">No business IP currently applicable</div>
                  </div>
                )}

                {business_ip.total_ip_count !== undefined && (
                  <div className="p-3 rounded-macos-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Total IP in Vault</span>
                      <span className="text-sm font-medium text-[rgb(var(--band-xi))]">{business_ip.total_ip_count}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Layer 5: Personal Context */}
        <div>
          {renderLayerHeader("personal_context", personal_context.user_patterns.length > 0 || personal_context.active_goals.length > 0)}
          <AnimatePresence>
            {expandedLayer === "personal_context" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 space-y-4 p-4 bg-white/5 rounded-macos-lg border border-white/10"
              >
                {personal_context.user_patterns.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-400 mb-3">Detected Patterns ({personal_context.user_patterns.length})</div>
                    <div className="space-y-2">
                      {personal_context.user_patterns.map((pattern, i) => (
                        <div key={i} className="p-3 bg-[rgba(var(--band-psi),0.1)] rounded-macos-lg border border-[rgba(var(--band-psi),0.3)]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[rgb(var(--band-psi))]">{pattern.pattern.replace(/_/g, " ")}</span>
                            <span className="text-xs text-gray-400">{pattern.last_observed}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[rgb(var(--band-psi))]"
                                style={{ width: `${pattern.strength * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-gray-400">{pattern.strength.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {personal_context.active_goals.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-400 mb-3">Active Goals ({personal_context.active_goals.length})</div>
                    <div className="space-y-2">
                      {personal_context.active_goals.map((goal, i) => (
                        <div key={i} className="p-3 bg-white/5 rounded-macos-lg border border-white/10">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-[rgb(var(--band-psi))] flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">{goal}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
