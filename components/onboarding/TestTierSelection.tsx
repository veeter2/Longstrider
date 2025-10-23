"use client"

import { motion } from "framer-motion"
import { Clock, ArrowRight, Brain } from "lucide-react"
import type { TestTier, TestTierConfig, LargeTestConfig } from "@/types/onboarding"
import { onboardingConfig } from "@/lib/onboarding-config"
import { 
  getNeuralBandForTier, 
  getGlassContainerClass, 
  getNeuralAccentClass 
} from "@/lib/neural-spectrum"

interface TestTierSelectionProps {
  onTierSelect: (tier: TestTier) => void
}

// Neural Band Symbols as per Design Living Laws
const NeuralBandIcon = ({ band, className }: { band: string, className?: string }) => {
  const getSymbol = (band: string) => {
    switch (band) {
      case 'beta-low': return 'β₁'  // Active thinking, reasoning
      case 'alpha-high': return 'α₂' // Calm focus, engagement  
      case 'gamma-low': return 'γ₁'  // Synthesis, integration
      default: return '?'
    }
  }
  
  return (
    <span className={`text-2xl font-light ${className}`}>
      {getSymbol(band)}
    </span>
  )
}

const tierConfigs = {
  fast: { 
    neuralBand: 'beta-low',
    name: 'Rapid Assessment',
    symbol: 'β₁'
  },
  medium: { 
    neuralBand: 'alpha-high',
    name: 'Synthesis Assessment', 
    symbol: 'α₂'
  },
  large: { 
    neuralBand: 'gamma-low',
    name: 'Integration Assessment',
    symbol: 'γ₁'
  }
} as const

export default function TestTierSelection({ onTierSelect }: TestTierSelectionProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-violet-400" />
          </div>
          <h1 className="text-3xl font-light text-white">Cognitive Assessment</h1>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Choose your preferred depth of assessment. This creates a personalized cognitive profile 
          and establishes our working partnership through mutual understanding.
        </motion.p>
      </div>

      {/* Test Tier Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(onboardingConfig.tests).map(([tierKey, config], index) => {
          const tier = tierKey as TestTier
          const tierConfig = tierConfigs[tier]
          const neuralBand = getNeuralBandForTier(tier)
          const containerClass = getGlassContainerClass(neuralBand, 6)
          const accentClass = getNeuralAccentClass(neuralBand, 'text')

          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className={containerClass}
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-[rgba(var(--band-${neuralBand}),0.15)] flex items-center justify-center flex-shrink-0`}>
                    <NeuralBandIcon band={tierConfig.neuralBand} className={accentClass} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white mb-1">
                      {tierConfig.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{config.duration_estimate}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-300 leading-relaxed">
                  {tier === 'fast' && (
                    "Quick cognitive mapping with essential patterns. Perfect for getting started immediately."
                  )}
                  {tier === 'medium' && (
                    "Comprehensive assessment with live pattern detection. Builds a robust cognitive profile."
                  )}
                  {tier === 'large' && (
                    "Deep-dive exploration across multiple cognitive dimensions. Creates the most sophisticated partnership."
                  )}
                </p>

                {/* Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Questions</span>
                    <span className="text-white">
                      {(() => {
                        const typedConfig = config as TestTierConfig | LargeTestConfig;
                        
                        if ('user_questions' in typedConfig && 'ls_questions' in typedConfig) {
                          // Fast and Medium tests - count user + LS questions
                          const tierConfig = typedConfig as TestTierConfig;
                          return tierConfig.user_questions.length + tierConfig.ls_questions.length;
                        } else if ('sections' in typedConfig) {
                          // Large test - count all items in all sections
                          const largeConfig = typedConfig as LargeTestConfig;
                          return largeConfig.sections.reduce((total: number, section) => 
                            total + (section.user_items?.length || 0) + (section.ls_items?.length || 0), 0
                          );
                        }
                        return 0;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Min. Required</span>
                    <span className="text-white">{config.min_required_to_profile}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Pattern Cards</span>
                    <span className="text-emerald-400">
                      {tier === 'fast' ? 'Basic' : tier === 'medium' ? 'Live' : 'Advanced'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTierSelect(tier)}
                  className={`w-full mt-6 px-4 py-3 rounded-lg bg-[rgba(var(--band-${neuralBand}),0.2)] border border-[rgba(var(--band-${neuralBand}),0.3)] hover:bg-[rgba(var(--band-${neuralBand}),0.3)] transition-all duration-200 flex items-center justify-center gap-2 ${accentClass}`}
                >
                  <span>Start {tierConfig.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-center text-sm text-slate-500 max-w-xl mx-auto"
      >
        <p>
          You can always extend your profile later or retake assessments. 
          All data stays local unless you choose to share it.
        </p>
      </motion.div>
    </div>
  )
}
