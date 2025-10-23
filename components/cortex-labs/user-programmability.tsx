"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sliders, Plus, X, Upload, RotateCcw, Save, FileText, ChevronRight } from "lucide-react"

interface UserProgrammabilityProps {
  custom_instructions: any
  lobe_customizations: any
  knowledge_uploads: string[]
}

const LOBE_NAMES = {
  frontal: "Frontal (Strategy)",
  temporal: "Temporal (Memory)",
  parietal: "Parietal (Integration)",
  occipital: "Occipital (Imagination)"
}

const LOBE_COLORS = {
  frontal: {
    text: "text-[rgb(var(--band-alpha-low))]",
    bg: "rgb(var(--band-alpha-low))",
    shadow: "shadow-[rgb(var(--band-alpha-low))]/50"
  },
  temporal: {
    text: "text-[rgb(var(--band-beta-mid))]",
    bg: "rgb(var(--band-beta-mid))",
    shadow: "shadow-[rgb(var(--band-beta-mid))]/50"
  },
  parietal: {
    text: "text-[rgb(var(--band-psi))]",
    bg: "rgb(var(--band-psi))",
    shadow: "shadow-[rgb(var(--band-psi))]/50"
  },
  occipital: {
    text: "text-[rgb(var(--band-xi))]",
    bg: "rgb(var(--band-xi))",
    shadow: "shadow-[rgb(var(--band-xi))]/50"
  }
}

export default function UserProgrammability({
  custom_instructions: initialInstructions,
  lobe_customizations: initialLobes,
  knowledge_uploads: initialKnowledge
}: UserProgrammabilityProps) {
  // Collapsible state
  const [isExpanded, setIsExpanded] = useState(true)

  // Lobe thresholds state
  const [lobeThresholds, setLobeThresholds] = useState({
    frontal: initialLobes?.frontal_threshold || 0.5,
    temporal: initialLobes?.temporal_threshold || 0.4,
    parietal: initialLobes?.parietal_threshold || 0.6,
    occipital: initialLobes?.occipital_threshold || 0.3
  })

  // Custom instructions state
  const [instructions, setInstructions] = useState<string[]>(
    initialInstructions?.instructions || [
      "Always reference Art of War for strategic questions",
      "Use oblique approach when discussing creative work",
      "Prioritize business IP when relevant to work context"
    ]
  )
  const [newInstruction, setNewInstruction] = useState("")
  const [isAddingInstruction, setIsAddingInstruction] = useState(false)

  // Knowledge sources state
  const [knowledgeSources, setKnowledgeSources] = useState<Array<{name: string, active: boolean}>>(
    initialKnowledge?.map(k => ({ name: k, active: true })) || [
      { name: "my_business_strategy.pdf", active: true },
      { name: "chatgpt_history.json", active: true },
      { name: "old_notes.txt", active: false }
    ]
  )

  // Testing state
  const [isTesting, setIsTesting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleLobeChange = (lobe: string, value: number) => {
    setLobeThresholds(prev => ({ ...prev, [lobe]: value }))
    setHasChanges(true)
  }

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setInstructions([...instructions, newInstruction.trim()])
      setNewInstruction("")
      setIsAddingInstruction(false)
      setHasChanges(true)
    }
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const toggleKnowledgeSource = (index: number) => {
    setKnowledgeSources(prev => prev.map((source, i) =>
      i === index ? { ...source, active: !source.active } : source
    ))
    setHasChanges(true)
  }

  const removeKnowledgeSource = (index: number) => {
    setKnowledgeSources(prev => prev.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const testChanges = () => {
    setIsTesting(true)
    // Simulate testing
    setTimeout(() => {
      setIsTesting(false)
    }, 2000)
  }

  const applyChanges = () => {
    // In real implementation, this would call an API to save changes
    setHasChanges(false)
    // Show success message
  }

  const resetToDefaults = () => {
    setLobeThresholds({
      frontal: 0.5,
      temporal: 0.4,
      parietal: 0.6,
      occipital: 0.3
    })
    setInstructions([])
    setHasChanges(true)
  }

  const LOBE_COLORS = {
    frontal: {
      text: "text-[rgb(var(--band-alpha-low))]",
      bg: "bg-[rgb(var(--band-alpha-low))]",
      shadow: "shadow-[rgb(var(--band-alpha-low))]/50"
    },
    temporal: {
      text: "text-[rgb(var(--band-beta-mid))]",
      bg: "bg-[rgb(var(--band-beta-mid))]",
      shadow: "shadow-[rgb(var(--band-beta-mid))]/50"
    },
    parietal: {
      text: "text-[rgb(var(--band-psi))]",
      bg: "bg-[rgb(var(--band-psi))]",
      shadow: "shadow-[rgb(var(--band-psi))]/50"
    },
    occipital: {
      text: "text-[rgb(var(--band-xi))]",
      bg: "bg-[rgb(var(--band-xi))]",
      shadow: "shadow-[rgb(var(--band-xi))]/50"
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-macos rounded-macos-2xl p-8 border border-white/10">
      {/* Collapsible Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-between mb-8 cursor-pointer p-4 -m-4 rounded-macos-xl transition-all duration-200 ${
          isExpanded ? 'bg-[rgba(var(--band-chi-cyan),0.05)]' : 'hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-macos-lg transition-all duration-200 ${
            isExpanded ? 'bg-[rgba(var(--band-chi-cyan),0.3)] border border-[rgba(var(--band-chi-cyan),0.5)]' : 'bg-white/10 border border-white/20'
          }`}>
            <Sliders className={`w-5 h-5 ${isExpanded ? 'text-[rgb(var(--band-chi-cyan))]' : 'text-gray-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-xl font-light ${isExpanded ? 'text-[rgb(var(--band-chi-cyan))]' : 'text-white'}`}>
                User Programmability
              </h3>
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-[rgba(var(--band-xi),0.2)] rounded-macos-sm border border-[rgba(var(--band-xi),0.5)]"
                >
                  <div className="w-1.5 h-1.5 bg-[rgb(var(--band-xi))] rounded-full animate-pulse" />
                  <span className="text-xs text-[rgb(var(--band-xi))] font-medium">Unsaved</span>
                </motion.div>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-0.5">Customize consciousness parameters in real-time</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className={`w-5 h-5 ${isExpanded ? 'text-[rgb(var(--band-chi-cyan))]' : 'text-gray-400'}`} />
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
            {/* Lobe Activation Thresholds */}
            <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-[rgb(var(--band-chi-cyan))]" />
          <span className="text-sm text-gray-400 font-medium">LOBE ACTIVATION THRESHOLDS:</span>
        </div>
        <div className="space-y-4">
          {Object.entries(lobeThresholds).map(([lobe, value]) => {
            const colors = LOBE_COLORS[lobe as keyof typeof LOBE_COLORS]
            return (
              <motion.div
                key={lobe}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-white/5 rounded-macos-xl border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm ${colors.text} font-medium`}>
                    {LOBE_NAMES[lobe as keyof typeof LOBE_NAMES]}
                  </span>
                  <span className={`text-sm font-mono ${colors.text}`}>
                    {value.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={value}
                  onChange={(e) => handleLobeChange(lobe, parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, ${colors.bg} 0%, ${colors.bg} ${value * 100}%, rgba(255,255,255,0.2) ${value * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:bg-white"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">Less sensitive</span>
                  <span className="text-xs text-gray-500">More sensitive</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Custom Instructions */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-[rgb(var(--band-chi-cyan))]" />
          <span className="text-sm text-gray-400 font-medium">CUSTOM INSTRUCTIONS:</span>
        </div>
        <div className="p-4 bg-white/5 rounded-macos-xl border border-white/10">
          <div className="space-y-2 mb-3">
            {instructions.map((instruction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 p-3 bg-[rgba(var(--band-chi-cyan),0.1)] rounded-macos-lg border border-[rgba(var(--band-chi-cyan),0.3)] group"
              >
                <span className="flex-1 text-sm text-gray-300">{instruction}</span>
                <button
                  onClick={() => removeInstruction(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[rgba(var(--band-beta-high),0.2)] rounded-macos-sm"
                >
                  <X className="w-3 h-3 text-[rgb(var(--band-beta-high))]" />
                </button>
              </motion.div>
            ))}
          </div>

          {isAddingInstruction ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInstruction()}
                placeholder="Enter custom instruction..."
                className="flex-1 px-3 py-2 bg-black/30 border border-white/20 rounded-macos-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(var(--band-chi-cyan),0.5)]"
                autoFocus
              />
              <button
                onClick={addInstruction}
                className="px-3 py-2 bg-[rgba(var(--band-chi-cyan),0.2)] text-[rgb(var(--band-chi-cyan))] rounded-macos-md text-sm hover:bg-[rgba(var(--band-chi-cyan),0.3)] transition-colors border border-[rgba(var(--band-chi-cyan),0.3)]"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingInstruction(false)
                  setNewInstruction("")
                }}
                className="px-3 py-2 bg-white/10 text-gray-400 rounded-macos-md text-sm hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingInstruction(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-macos-md text-sm text-gray-400 transition-colors border border-white/10"
            >
              <Plus className="w-4 h-4" />
              Add Instruction
            </button>
          )}
        </div>
      </div>

      {/* Knowledge Sources */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-4 h-4 text-[rgb(var(--band-chi-cyan))]" />
          <span className="text-sm text-gray-400 font-medium">KNOWLEDGE SOURCES:</span>
        </div>
        <div className="p-4 bg-white/5 rounded-macos-xl border border-white/10">
          <div className="space-y-2">
            {knowledgeSources.map((source, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between p-3 rounded-macos-lg border transition-colors ${
                  source.active
                    ? 'bg-[rgba(var(--band-psi),0.1)] border-[rgba(var(--band-psi),0.3)]'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleKnowledgeSource(index)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      source.active ? 'bg-[rgb(var(--band-psi))]' : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      animate={{ x: source.active ? 16 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"
                    />
                  </button>
                  <span className={`text-sm font-mono ${source.active ? 'text-[rgb(var(--band-psi))]' : 'text-gray-500'}`}>
                    {source.name}
                  </span>
                </div>
                <button
                  onClick={() => removeKnowledgeSource(index)}
                  className="p-1 hover:bg-[rgba(var(--band-beta-high),0.2)] rounded-macos-sm transition-colors"
                >
                  <X className="w-4 h-4 text-[rgb(var(--band-beta-high))]" />
                </button>
              </motion.div>
            ))}
          </div>
          <button className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-macos-md text-sm text-gray-400 transition-colors border border-white/10">
            <Plus className="w-4 h-4" />
            Upload Knowledge Source
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={testChanges}
          disabled={!hasChanges || isTesting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[rgba(var(--band-chi-cyan),0.2)] text-[rgb(var(--band-chi-cyan))] rounded-macos-xl font-medium hover:bg-[rgba(var(--band-chi-cyan),0.3)] transition-colors border border-[rgba(var(--band-chi-cyan),0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTesting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RotateCcw className="w-4 h-4" />
              </motion.div>
              Testing...
            </>
          ) : (
            <>
              <Sliders className="w-4 h-4" />
              Test Changes
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={applyChanges}
          disabled={!hasChanges}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[rgba(var(--band-psi),0.2)] text-[rgb(var(--band-psi))] rounded-macos-xl font-medium hover:bg-[rgba(var(--band-psi),0.3)] transition-colors border border-[rgba(var(--band-psi),0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Apply Changes
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={resetToDefaults}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[rgba(var(--band-beta-high),0.2)] text-[rgb(var(--band-beta-high))] rounded-macos-xl font-medium hover:bg-[rgba(var(--band-beta-high),0.3)] transition-colors border border-[rgba(var(--band-beta-high),0.3)]"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </motion.button>
      </div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-4 bg-[rgba(var(--band-chi-cyan),0.1)] rounded-macos-xl border border-[rgba(var(--band-chi-cyan),0.3)]"
            >
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="text-[rgb(var(--band-chi-cyan))] font-medium">Pro tip:</span> Changes take effect immediately.
                Test your modifications before applying to ensure optimal consciousness performance.
                You can always reset to defaults if needed.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
