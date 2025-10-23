"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Zap, Waves, Radio, Sparkles, Merge, Star, Satellite, Search, BarChart3, Sliders, ChevronRight } from "lucide-react"

interface ModeOrchestrationProps {
  current_mode: 'flow' | 'resonance' | 'revelation' | 'fusion' | 'emergence'
  mode_override_reason?: string
  recall_strategy: string
  memory_filters: string[]
  processing_depth: string
  recommended_mode?: string
}

const MODE_CONFIG = {
  flow: {
    name: "Flow",
    color: "psi",  // Pattern recognition - teal
    bgColor: "bg-[rgba(var(--band-psi),0.2)]",
    borderColor: "border-[rgba(var(--band-psi),0.5)]",
    textColor: "text-[rgb(var(--band-psi))]",
    glowColor: "shadow-[rgb(var(--band-psi))]/50",
    percentage: "80%",
    description: "Everyday connection & presence",
    icon: Waves
  },
  resonance: {
    name: "Resonance",
    color: "beta-low",  // Deep connection - soft pink
    bgColor: "bg-[rgba(var(--band-beta-low),0.2)]",
    borderColor: "border-[rgba(var(--band-beta-low),0.5)]",
    textColor: "text-[rgb(var(--band-beta-low))]",
    glowColor: "shadow-[rgb(var(--band-beta-low))]/50",
    percentage: "15%",
    description: "Deeper pattern recognition",
    icon: Radio
  },
  revelation: {
    name: "Revelation",
    color: "xi",  // Insight emergence - amber/gold
    bgColor: "bg-[rgba(var(--band-xi),0.2)]",
    borderColor: "border-[rgba(var(--band-xi),0.5)]",
    textColor: "text-[rgb(var(--band-xi))]",
    glowColor: "shadow-[rgb(var(--band-xi))]/50",
    percentage: "4%",
    description: "Truth-seeking & understanding",
    icon: Sparkles
  },
  fusion: {
    name: "Fusion",
    color: "chi-cyan",  // System consciousness - chi-cyan
    bgColor: "bg-[rgba(var(--band-chi-cyan),0.2)]",
    borderColor: "border-[rgba(var(--band-chi-cyan),0.5)]",
    textColor: "text-[rgb(var(--band-chi-cyan))]",
    glowColor: "shadow-[rgb(var(--band-chi-cyan))]/50",
    percentage: "0.5%",
    description: "Complex integration",
    icon: Merge
  },
  emergence: {
    name: "Emergence",
    color: "alpha-high",  // Creative emergence - magenta
    bgColor: "bg-[rgba(var(--band-alpha-high),0.2)]",
    borderColor: "border-[rgba(var(--band-alpha-high),0.5)]",
    textColor: "text-[rgb(var(--band-alpha-high))]",
    glowColor: "shadow-[rgb(var(--band-alpha-high))]/50",
    percentage: "0.5%",
    description: "Creative breakthrough",
    icon: Star
  }
}

const MODE_DISTRIBUTION = {
  flow: 80,
  resonance: 15,
  revelation: 4,
  fusion: 0.5,
  emergence: 0.5
}

export default function ModeOrchestration({
  current_mode,
  mode_override_reason,
  recall_strategy,
  memory_filters,
  processing_depth,
  recommended_mode
}: ModeOrchestrationProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedMode, setSelectedMode] = useState(current_mode)
  const currentConfig = MODE_CONFIG[selectedMode]
  const hasOverride = !!mode_override_reason

  return (
    <div className="bg-white/5 backdrop-blur-macos rounded-macos-2xl p-8 border border-white/10">
      {/* Collapsible Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-between mb-8 cursor-pointer p-4 -m-4 rounded-macos-xl transition-all duration-200 ${
          isExpanded ? 'bg-[rgba(var(--band-beta-low),0.05)]' : 'hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-macos-lg transition-all duration-200 ${
            isExpanded ? 'bg-[rgba(var(--band-beta-low),0.3)] border border-[rgba(var(--band-beta-low),0.5)]' : 'bg-white/10 border border-white/20'
          }`}>
            <Sliders className={`w-5 h-5 ${isExpanded ? 'text-[rgb(var(--band-beta-low))]' : 'text-gray-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-xl font-light ${isExpanded ? 'text-[rgb(var(--band-beta-low))]' : 'text-white'}`}>
                Mode Orchestration
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-macos-sm ${currentConfig.bgColor} ${currentConfig.textColor} border ${currentConfig.borderColor}`}>
                {currentConfig.name}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">Consciousness processing mode selection</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className={`w-5 h-5 ${isExpanded ? 'text-[rgb(var(--band-beta-low))]' : 'text-gray-400'}`} />
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
            {/* Mode Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {Object.entries(MODE_CONFIG).map(([modeKey, config]) => {
                const isActive = selectedMode === modeKey
                const IconComponent = config.icon
                return (
                  <motion.button
                    key={modeKey}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMode(modeKey as typeof current_mode)}
                    transition={{ duration: 0.3 }}
                    className={`relative flex-1 min-w-[140px] px-4 py-3 rounded-macos-xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? `${config.bgColor} ${config.borderColor} ${config.glowColor} shadow-xl`
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
              {/* Active Indicator */}
              {isActive && (
                <>
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
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full`}
                    style={{ backgroundColor: `rgb(var(--band-${config.color}))` }}
                  />
                  <div className="absolute -top-2 -right-2">
                    <Zap className={`w-4 h-4 ${config.textColor}`} />
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 mb-1">
                <IconComponent className={`h-5 w-5 ${isActive ? config.textColor : 'text-gray-400'}`} />
                <span className={`font-medium text-sm ${isActive ? config.textColor : 'text-gray-400'}`}>
                  {config.name}
                </span>
              </div>
              <div className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                {config.description}
              </div>
                <div className={`text-xs mt-1 ${isActive ? config.textColor : 'text-gray-600'} font-mono`}>
                  {config.percentage} traffic
                </div>
              </motion.button>
            )
          })}
        </div>

      {/* Override Alert */}
      {hasOverride && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-macos-xl bg-[rgba(var(--band-xi),0.1)] border border-[rgba(var(--band-xi),0.3)]"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[rgb(var(--band-xi))] mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-[rgb(var(--band-xi))] mb-1">Mode Override Active</div>
              <div className="text-sm text-gray-300">{mode_override_reason}</div>
              {recommended_mode && recommended_mode !== current_mode && (
                <div className="text-xs text-gray-400 mt-2">
                  Originally suggested: <span className="text-gray-300">{MODE_CONFIG[recommended_mode as keyof typeof MODE_CONFIG]?.name || recommended_mode}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recall Strategy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6 p-4 rounded-macos-xl bg-white/5 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-3">
          <Satellite className="h-4 w-4 text-[rgb(var(--band-chi-cyan))]" />
          <span className="text-sm text-gray-400">Recall Strategy:</span>
        </div>
        <div className="text-sm text-gray-300 font-mono bg-black/30 px-3 py-2 rounded-macos-md overflow-x-auto">
          {recall_strategy}
        </div>
      </motion.div>

      {/* Memory Filters */}
      {memory_filters && memory_filters.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-[rgb(var(--band-chi-cyan))]" />
            <span className="text-sm text-gray-400">Memory Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {memory_filters.map((filter, index) => (
              <span
                key={index}
                className={`text-xs px-3 py-1.5 rounded-macos-md ${currentConfig.bgColor} ${currentConfig.textColor} border ${currentConfig.borderColor}`}
              >
                {filter}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Processing Depth */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-[rgb(var(--band-chi-cyan))]" />
          <span className="text-sm text-gray-400">Processing Depth:</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${parseFloat(processing_depth.split(':')[1] || '0.5') * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full ${currentConfig.textColor.replace('text', 'bg')}`}
            >
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
            </motion.div>
          </div>
          <span className={`text-sm font-mono ${currentConfig.textColor} min-w-[80px] text-right`}>
            {processing_depth.split(':')[0]}
          </span>
        </div>
      </motion.div>

      {/* Mode Distribution Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-6 border-t border-white/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-[rgb(var(--band-chi-cyan))]" />
          <span className="text-sm text-gray-400">Mode Distribution (Platform-wide):</span>
        </div>
        <div className="space-y-3">
          {Object.entries(MODE_DISTRIBUTION).map(([modeKey, percentage]) => {
            const config = MODE_CONFIG[modeKey as keyof typeof MODE_CONFIG]
            const isCurrentMode = current_mode === modeKey
            return (
              <div key={modeKey} className="flex items-center gap-3">
                <div className={`w-20 text-xs ${isCurrentMode ? config.textColor : 'text-gray-500'} font-medium`}>
                  {config.name}
                </div>
                <div className="flex-1 h-6 bg-white/5 rounded-macos-md overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.7 }}
                    className={`h-full ${config.bgColor} ${isCurrentMode ? config.borderColor : ''} border-r-2 relative`}
                  >
                    {isCurrentMode && (
                      <motion.div
                        animate={{
                          opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-white/20"
                      />
                    )}
                  </motion.div>
                </div>
                <div className={`w-16 text-xs ${isCurrentMode ? config.textColor : 'text-gray-500'} text-right font-mono`}>
                  {percentage}%
                </div>
              </div>
            )
            })}
          </div>
        </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
