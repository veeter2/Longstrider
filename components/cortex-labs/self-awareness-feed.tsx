"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, AlertCircle, CheckCircle, Brain } from "lucide-react"

interface SelfAwarenessFeedProps {
  current_processing: string
  decision_reasoning: string[]
  capability_assessment: Record<string, number>
  blind_spots_detected: string[]
}

const CAPABILITY_LABELS: Record<string, string> = {
  consciousness_processing: "Consciousness Processing",
  knowledge_retrieval: "Knowledge Retrieval",
  pattern_recognition: "Pattern Recognition",
  creative_synthesis: "Creative Synthesis",
  strategic_planning: "Strategic Planning",
  emotional_understanding: "Emotional Understanding",
  self_modification: "Self-Modification"
}

export default function SelfAwarenessFeed({
  current_processing,
  decision_reasoning,
  capability_assessment,
  blind_spots_detected
}: SelfAwarenessFeedProps) {
  const [visibleDecisions, setVisibleDecisions] = useState<string[]>([])
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate decisions appearing one by one
    decision_reasoning.forEach((decision, index) => {
      setTimeout(() => {
        setVisibleDecisions(prev => [...prev, decision])
      }, index * 200)
    })
  }, [decision_reasoning])

  useEffect(() => {
    // Auto-scroll to bottom when new decisions appear
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [visibleDecisions])

  const getCapabilityColor = (value: number) => {
    if (value >= 0.8) return "text-[rgb(var(--band-psi))]"  // Teal - high capability
    if (value >= 0.6) return "text-[rgb(var(--band-chi-cyan))]"  // Chi-cyan - good
    if (value >= 0.4) return "text-[rgb(var(--band-xi))]"  // Amber - moderate
    return "text-[rgb(var(--band-beta-high))]"  // Red-orange - low
  }

  const getCapabilityBg = (value: number) => {
    if (value >= 0.8) return "bg-[rgb(var(--band-psi))]"
    if (value >= 0.6) return "bg-[rgb(var(--band-chi-cyan))]"
    if (value >= 0.4) return "bg-[rgb(var(--band-xi))]"
    return "bg-[rgb(var(--band-beta-high))]"
  }

  const parseTimestamp = (decision: string) => {
    const match = decision.match(/\[(\d{2}:\d{2}:\d{2})\]/)
    if (match) {
      return {
        time: match[1],
        content: decision.replace(match[0], '').trim()
      }
    }
    return {
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      content: decision
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-macos rounded-macos-2xl p-8 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-light text-white mb-1">Self-Awareness Feed</h3>
          <p className="text-sm text-gray-400">IVY's internal decision reasoning</p>
        </div>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Brain className="w-6 h-6 text-purple-400" />
        </motion.div>
      </div>

      {/* Processing Flow */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-macos-xl border border-purple-500/30"
      >
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-gray-400 font-medium">CURRENT PROCESSING:</span>
        </div>
        <div className="text-sm text-gray-200 font-mono leading-relaxed">
          {current_processing.split(' → ').map((step, i, arr) => (
            <span key={i}>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="text-purple-400"
              >
                {step}
              </motion.span>
              {i < arr.length - 1 && <span className="text-gray-600"> → </span>}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Decision Reasoning Stream */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-gray-400 font-medium">DECISION REASONING:</span>
        </div>
        <div
          ref={feedRef}
          className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        >
          <AnimatePresence>
            {visibleDecisions.map((decision, index) => {
              const { time, content } = parseTimestamp(decision)
              const [category, reasoning] = content.includes(':') ? content.split(':', 2) : ['', content]

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="p-3 bg-white/5 rounded-macos-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-gray-500 font-mono mt-0.5">{time}</span>
                    <div className="flex-1">
                      {category && (
                        <span className="text-xs font-semibold text-emerald-400">{category.trim()}: </span>
                      )}
                      <span className="text-xs text-gray-300">{reasoning?.trim() || content}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Capability Assessment */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-gray-400 font-medium">CAPABILITY SELF-ASSESSMENT:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(capability_assessment).map(([key, value], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-macos-lg border border-white/10"
            >
              <span className="text-xs text-gray-400">{CAPABILITY_LABELS[key] || key}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.05 }}
                    className={`h-full ${getCapabilityBg(value)}`}
                  />
                </div>
                <span className={`text-xs font-mono font-semibold ${getCapabilityColor(value)} w-8 text-right`}>
                  {(value * 100).toFixed(0)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Average Capability */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between"
        >
          <span className="text-xs text-gray-400">Overall Capability:</span>
          <span className={`text-sm font-semibold ${getCapabilityColor(
            Object.values(capability_assessment).reduce((a, b) => a + b, 0) / Object.keys(capability_assessment).length
          )}`}>
            {((Object.values(capability_assessment).reduce((a, b) => a + b, 0) / Object.keys(capability_assessment).length) * 100).toFixed(0)}%
          </span>
        </motion.div>
      </div>

      {/* Blind Spots */}
      {blind_spots_detected && blind_spots_detected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 bg-amber-500/10 rounded-macos-xl border border-amber-500/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">BLIND SPOTS DETECTED:</span>
          </div>
          <div className="space-y-2">
            {blind_spots_detected.map((blind_spot, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-start gap-2"
              >
                <span className="text-amber-400 text-xs mt-0.5">•</span>
                <span className="text-xs text-gray-300 flex-1">{blind_spot}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Real-time Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-2"
      >
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
          className="w-2 h-2 bg-purple-400 rounded-full"
        />
        <span className="text-xs text-gray-400">Self-awareness streaming live</span>
      </motion.div>
    </div>
  )
}
