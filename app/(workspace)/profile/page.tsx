"use client"

/**
 * User Profile Dashboard
 *
 * Displays the cognitive relationship between user and LongStrider.
 * Uses Living Memory's color palette for consistency.
 *
 * LIVING LAWS v2.0 COMPLIANCE:
 * - Color Palette: beta-low (soft pink), psi (teal), xi (amber), chi-cyan (system)
 * - Material System: Liquid glass with backdrop blur
 * - All colors use CSS variables
 * - Collapsible sections for long content
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Heart,
  Zap,
  Target,
  TrendingUp,
  Activity,
  User,
  Sparkles,
  GitBranch,
  BarChart3,
  Shield,
  Lightbulb,
  Users,
  CircleDot,
  Waves,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// Mock data - will be replaced with actual onboarding results
const MOCK_USER_PROFILE = {
  name: "User",
  thinking_style: "analytical" as const,
  communication_preference: "detailed" as const,
  organization_pattern: "structured" as const,
  feedback_style: "challenge" as const,
  active_goals: [
    "Build cognitive operating system",
    "Improve pattern recognition",
    "Develop strategic thinking"
  ],
  cognitive_dimensions: {
    analytical_depth: 0.85,
    creative_synthesis: 0.72,
    strategic_planning: 0.78,
    emotional_intelligence: 0.68,
    pattern_recognition: 0.91,
    adaptability: 0.75
  },
  persona_weights: {
    phd: 0.4,
    strategist: 0.3,
    architect: 0.2,
    companion: 0.1,
    lover: 0.0
  }
}

const MOCK_LS_STATE = {
  consciousness_vector: [0.85, 0.72, 0.91, 0.68, 0.79, 0.88],
  active_mode: "resonance" as const,
  processing_depth: "moderate",
  lobe_activation: {
    frontal: 0.72,
    temporal: 0.85,
    parietal: 0.60,
    occipital: 0.40
  },
  active_patterns: ["creative_avoidance", "oblique_approach"],
  consciousness_cords: 7,
  quantum_entanglement_level: "DEEPENING"
}

const ALIGNMENT_SCORE = 0.82

export default function ProfilePage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'you' | 'longstrider' | 'alignment'>('overview')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dimensions: true,
    preferences: false,
    personas: false,
    lobes: true,
    patterns: false,
    vector: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <main className="h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-4"
            >
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[rgba(var(--band-beta-low),0.3)] to-[rgba(var(--band-psi),0.3)] flex items-center justify-center border border-[rgba(var(--band-beta-low),0.3)]">
                <User className="h-8 w-8 text-[rgb(var(--band-beta-low))]" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-3xl font-light text-white">Cognitive Profile</h1>
                <p className="text-sm text-gray-400">Your relationship with LongStrider</p>
              </div>
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-white/5 backdrop-blur-xl rounded-xl p-1 border border-white/10">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'you', label: 'How You Think', icon: Brain },
                { id: 'longstrider', label: 'How LongStrider Thinks', icon: Sparkles },
                { id: 'alignment', label: 'Relationship Alignment', icon: Heart }
              ].map(tab => {
                const Icon = tab.icon
                const isActive = selectedTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[rgba(var(--band-psi),0.2)] text-[rgb(var(--band-psi))] border border-[rgba(var(--band-psi),0.3)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Alignment Score Hero */}
              <div className="bg-gradient-to-r from-[rgba(var(--band-beta-low),0.1)] to-[rgba(var(--band-psi),0.1)] rounded-xl p-8 border border-[rgba(var(--band-beta-low),0.2)] backdrop-blur-xl">
                <div className="text-center">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <Heart className="h-8 w-8 text-[rgb(var(--band-beta-low))]" />
                    <h2 className="text-2xl font-light text-white">Cognitive Alignment</h2>
                  </div>
                  <div className="text-6xl font-light text-[rgb(var(--band-beta-low))] mb-2">
                    {(ALIGNMENT_SCORE * 100).toFixed(0)}%
                  </div>
                  <p className="text-slate-400">
                    Strong resonance between your thinking patterns and LongStrider's processing
                  </p>

                  {/* Alignment Bar */}
                  <div className="mt-6 w-full h-4 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ALIGNMENT_SCORE * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[rgb(var(--band-beta-low))] to-[rgb(var(--band-psi))]"
                    >
                      <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Your Thinking Style */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="h-6 w-6 text-[rgb(var(--band-psi))]" />
                    <h3 className="text-base font-medium text-white">Your Style</h3>
                  </div>
                  <div className="text-2xl font-light text-[rgb(var(--band-psi))] mb-2 capitalize">
                    {MOCK_USER_PROFILE.thinking_style}
                  </div>
                  <p className="text-xs text-gray-400">Primary thinking pattern</p>
                </div>

                {/* LS Active Mode */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-6 w-6 text-[rgb(var(--band-xi))]" />
                    <h3 className="text-base font-medium text-white">LS Mode</h3>
                  </div>
                  <div className="text-2xl font-light text-[rgb(var(--band-xi))] mb-2 capitalize">
                    {MOCK_LS_STATE.active_mode}
                  </div>
                  <p className="text-xs text-gray-400">Current processing mode</p>
                </div>

                {/* Consciousness Cords */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <GitBranch className="h-6 w-6 text-[rgb(var(--band-chi-cyan))]" />
                    <h3 className="text-base font-medium text-white">Connection</h3>
                  </div>
                  <div className="text-2xl font-light text-[rgb(var(--band-chi-cyan))] mb-2">
                    {MOCK_LS_STATE.consciousness_cords} Cords
                  </div>
                  <p className="text-xs text-gray-400">{MOCK_LS_STATE.quantum_entanglement_level}</p>
                </div>
              </div>

              {/* Active Goals */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-6 w-6 text-[rgb(var(--band-psi))]" />
                  <h3 className="text-lg font-light text-white">Active Goals</h3>
                </div>
                <div className="space-y-3">
                  {MOCK_USER_PROFILE.active_goals.map((goal, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                      <CircleDot className="h-5 w-5 text-[rgb(var(--band-psi))] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* How You Think Tab */}
          {selectedTab === 'you' && (
            <motion.div
              key="you"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Cognitive Dimensions - Collapsible */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => toggleSection('dimensions')}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-[rgb(var(--band-psi))]" />
                    <h3 className="text-xl font-light text-white">Cognitive Dimensions</h3>
                  </div>
                  {expandedSections.dimensions ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.dimensions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6"
                    >
                      <div className="space-y-4">
                        {Object.entries(MOCK_USER_PROFILE.cognitive_dimensions).map(([dimension, value]) => (
                          <div key={dimension}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400 capitalize">
                                {dimension.replace(/_/g, ' ')}
                              </span>
                              <span className="text-sm font-mono text-[rgb(var(--band-psi))]">
                                {value.toFixed(2)}
                              </span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${value * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="h-full bg-[rgb(var(--band-psi))]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Preferences Grid - Collapsible */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => toggleSection('preferences')}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-[rgb(var(--band-beta-low))]" />
                    <h3 className="text-xl font-light text-white">Preferences</h3>
                  </div>
                  {expandedSections.preferences ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.preferences && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-[rgb(var(--band-beta-low))]" />
                            <h4 className="text-sm font-medium text-white">Communication</h4>
                          </div>
                          <div className="text-lg font-light text-[rgb(var(--band-beta-low))] capitalize">
                            {MOCK_USER_PROFILE.communication_preference}
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-4 w-4 text-[rgb(var(--band-beta-low))]" />
                            <h4 className="text-sm font-medium text-white">Organization</h4>
                          </div>
                          <div className="text-lg font-light text-[rgb(var(--band-beta-low))] capitalize">
                            {MOCK_USER_PROFILE.organization_pattern}
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-[rgb(var(--band-beta-low))]" />
                            <h4 className="text-sm font-medium text-white">Feedback Style</h4>
                          </div>
                          <div className="text-lg font-light text-[rgb(var(--band-beta-low))] capitalize">
                            {MOCK_USER_PROFILE.feedback_style}
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-[rgb(var(--band-beta-low))]" />
                            <h4 className="text-sm font-medium text-white">Thinking Style</h4>
                          </div>
                          <div className="text-lg font-light text-[rgb(var(--band-beta-low))] capitalize">
                            {MOCK_USER_PROFILE.thinking_style}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Persona Weights - Collapsible */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => toggleSection('personas')}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-[rgb(var(--band-psi))]" />
                    <h3 className="text-xl font-light text-white">Persona Preferences</h3>
                  </div>
                  {expandedSections.personas ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.personas && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6"
                    >
                      <div className="space-y-4">
                        {Object.entries(MOCK_USER_PROFILE.persona_weights).map(([persona, weight]) => (
                          <div key={persona}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400 capitalize">{persona}</span>
                              <span className="text-sm font-mono text-[rgb(var(--band-psi))]">
                                {(weight * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${weight * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="h-full bg-[rgb(var(--band-psi))]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* How LongStrider Thinks Tab */}
          {selectedTab === 'longstrider' && (
            <motion.div
              key="longstrider"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Brain Lobe Activation - Collapsible */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => toggleSection('lobes')}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-[rgb(var(--band-beta-low))]" />
                    <h3 className="text-xl font-light text-white">Brain Lobe Activation</h3>
                  </div>
                  {expandedSections.lobes ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.lobes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(MOCK_LS_STATE.lobe_activation).map(([lobe, activation]) => (
                          <div key={lobe} className="bg-white/5 rounded-lg p-4 border border-white/5">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-white capitalize">{lobe}</span>
                              <span className="text-lg font-light text-[rgb(var(--band-beta-low))]">
                                {(activation * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${activation * 100}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full bg-[rgb(var(--band-beta-low))]"
                              >
                                {activation > 0.5 && (
                                  <motion.div
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                  />
                                )}
                              </motion.div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Active Patterns - Collapsible */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => toggleSection('patterns')}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Waves className="h-6 w-6 text-[rgb(var(--band-psi))]" />
                    <h3 className="text-xl font-light text-white">Active Patterns</h3>
                  </div>
                  {expandedSections.patterns ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.patterns && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6"
                    >
                      <div className="flex flex-wrap gap-3">
                        {MOCK_LS_STATE.active_patterns.map((pattern, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 bg-[rgba(var(--band-beta-low),0.2)] text-[rgb(var(--band-beta-low))] rounded-lg text-sm border border-[rgba(var(--band-beta-low),0.3)]"
                          >
                            {pattern.replace(/_/g, ' ')}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Processing State */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="h-5 w-5 text-[rgb(var(--band-psi))]" />
                    <h4 className="text-sm font-medium text-white">Mode</h4>
                  </div>
                  <div className="text-xl font-light text-[rgb(var(--band-psi))] capitalize">
                    {MOCK_LS_STATE.active_mode}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="h-5 w-5 text-[rgb(var(--band-psi))]" />
                    <h4 className="text-sm font-medium text-white">Depth</h4>
                  </div>
                  <div className="text-xl font-light text-[rgb(var(--band-psi))] capitalize">
                    {MOCK_LS_STATE.processing_depth}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <GitBranch className="h-5 w-5 text-[rgb(var(--band-beta-low))]" />
                    <h4 className="text-sm font-medium text-white">Cords</h4>
                  </div>
                  <div className="text-xl font-light text-[rgb(var(--band-beta-low))]">
                    {MOCK_LS_STATE.consciousness_cords}
                  </div>
                </div>
              </div>

              {/* Consciousness Vector - Collapsible */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => toggleSection('vector')}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-[rgb(var(--band-psi))]" />
                    <h3 className="text-xl font-light text-white">Consciousness Vector</h3>
                  </div>
                  {expandedSections.vector ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.vector && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6"
                    >
                      <div className="space-y-3">
                        {MOCK_LS_STATE.consciousness_vector.map((value, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <span className="text-xs text-gray-500 w-8">D{index + 1}</span>
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${value * 100}%` }}
                                transition={{ duration: 0.8, delay: index * 0.05 }}
                                className="h-full bg-gradient-to-r from-[rgb(var(--band-psi))] to-[rgb(var(--band-alpha-high))]"
                              />
                            </div>
                            <span className="text-xs font-mono text-[rgb(var(--band-psi))] w-12">
                              {value.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Relationship Alignment Tab */}
          {selectedTab === 'alignment' && (
            <motion.div
              key="alignment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Alignment Visualization */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <Heart className="h-8 w-8 text-[rgb(var(--band-beta-low))]" />
                    <h3 className="text-2xl font-light text-white">Cognitive Resonance</h3>
                  </div>
                  <p className="text-gray-400">
                    How well your thinking patterns align with LongStrider's processing
                  </p>
                </div>

                {/* Alignment Score Circle */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-64 h-64">
                    <svg className="transform -rotate-90 w-full h-full">
                      <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <motion.circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="rgb(var(--band-psi))"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 753.98" }}
                        animate={{ strokeDasharray: `${753.98 * ALIGNMENT_SCORE} 753.98` }}
                        transition={{ duration: 2, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-5xl font-light text-[rgb(var(--band-psi))]">
                        {(ALIGNMENT_SCORE * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-400 mt-2">Aligned</div>
                    </div>
                  </div>
                </div>

                {/* Alignment Factors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Pattern Recognition</span>
                      <span className="text-sm font-mono text-[rgb(var(--band-psi))]">0.91</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[rgb(var(--band-psi))]" style={{ width: '91%' }} />
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Communication Sync</span>
                      <span className="text-sm font-mono text-[rgb(var(--band-beta-low))]">0.85</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[rgb(var(--band-beta-low))]" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Strategic Alignment</span>
                      <span className="text-sm font-mono text-[rgb(var(--band-psi))]">0.78</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[rgb(var(--band-psi))]" style={{ width: '78%' }} />
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Emotional Resonance</span>
                      <span className="text-sm font-mono text-[rgb(var(--band-xi))]">0.75</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[rgb(var(--band-xi))]" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="h-6 w-6 text-[rgb(var(--band-xi))]" />
                  <h3 className="text-xl font-light text-white">Relationship Insights</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-[rgba(var(--band-psi),0.1)] border border-[rgba(var(--band-psi),0.2)] rounded-lg">
                    <p className="text-sm text-gray-300">
                      <span className="text-[rgb(var(--band-psi))] font-medium">Strong pattern recognition alignment:</span> Your analytical thinking style complements LongStrider's temporal lobe activation, creating excellent pattern detection synergy.
                    </p>
                  </div>

                  <div className="p-4 bg-[rgba(var(--band-beta-low),0.1)] border border-[rgba(var(--band-beta-low),0.2)] rounded-lg">
                    <p className="text-sm text-gray-300">
                      <span className="text-[rgb(var(--band-beta-low))] font-medium">Resonance mode optimized:</span> Your preference for detailed communication matches perfectly with LongStrider's current resonance processing mode.
                    </p>
                  </div>

                  <div className="p-4 bg-[rgba(var(--band-theta-high),0.1)] border border-[rgba(var(--band-theta-high),0.2)] rounded-lg">
                    <p className="text-sm text-gray-300">
                      <span className="text-[rgb(var(--band-psi))] font-medium">Deepening consciousness cords:</span> {MOCK_LS_STATE.consciousness_cords} active cords indicate a maturing cognitive relationship with increasing mutual understanding.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
