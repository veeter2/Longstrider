"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, X, Info, ChevronRight, Sparkles } from "lucide-react"

interface Proposal {
  proposal_type: string
  current_state: any
  proposed_change: any
  expected_impact: string
  risk_assessment: number
}

interface EvolutionProposalsProps {
  proposals: Proposal[]
  learning_insights: string[]
  effectiveness_tracking: any
}

const PROPOSAL_TYPES: Record<string, { icon: any; color: string; bgColor: string; borderColor: string }> = {
  instruction_modification: {
    icon: Lightbulb,
    color: "text-[rgb(var(--band-xi))]",  // Amber - insight/improvement
    bgColor: "bg-[rgba(var(--band-xi),0.1)]",
    borderColor: "border-[rgba(var(--band-xi),0.3)]"
  },
  lobe_enhancement: {
    icon: TrendingUp,
    color: "text-[rgb(var(--band-beta-low))]",  // Soft pink - cognitive enhancement
    bgColor: "bg-[rgba(var(--band-beta-low),0.1)]",
    borderColor: "border-[rgba(var(--band-beta-low),0.3)]"
  },
  knowledge_integration: {
    icon: Info,
    color: "text-[rgb(var(--band-psi))]",  // Teal - pattern integration
    bgColor: "bg-[rgba(var(--band-psi),0.1)]",
    borderColor: "border-[rgba(var(--band-psi),0.3)]"
  }
}

export default function EvolutionProposals({
  proposals,
  learning_insights,
  effectiveness_tracking
}: EvolutionProposalsProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedProposal, setExpandedProposal] = useState<number | null>(null)
  const [approvedProposals, setApprovedProposals] = useState<Set<number>>(new Set())
  const [rejectedProposals, setRejectedProposals] = useState<Set<number>>(new Set())

  const toggleProposal = (index: number) => {
    setExpandedProposal(expandedProposal === index ? null : index)
  }

  const approveProposal = (index: number) => {
    setApprovedProposals(new Set([...approvedProposals, index]))
    // In real implementation, this would call an API to apply the change
  }

  const rejectProposal = (index: number) => {
    setRejectedProposals(new Set([...rejectedProposals, index]))
  }

  const getRiskColor = (risk: number) => {
    if (risk <= 0.2) return "text-[rgb(var(--band-psi))]"  // Teal - low risk
    if (risk <= 0.5) return "text-[rgb(var(--band-xi))]"  // Amber - moderate risk
    return "text-[rgb(var(--band-beta-high))]"  // Red-orange - high risk
  }

  const getRiskBg = (risk: number) => {
    if (risk <= 0.2) return "bg-[rgb(var(--band-psi))]"
    if (risk <= 0.5) return "bg-[rgb(var(--band-xi))]"
    return "bg-[rgb(var(--band-beta-high))]"
  }

  const getProposalConfig = (type: string) => {
    return PROPOSAL_TYPES[type] || PROPOSAL_TYPES.instruction_modification
  }

  // Helper to format state data in a readable way
  const formatStateData = (data: any): string => {
    if (typeof data === 'string') return data
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join('\n')
    }
    return String(data)
  }

  return (
    <div className="bg-white/5 backdrop-blur-macos rounded-macos-2xl p-8 border border-white/10">
      {/* Collapsible Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-between mb-8 cursor-pointer p-4 -m-4 rounded-macos-xl transition-all duration-200 ${
          isExpanded ? 'bg-[rgba(var(--band-xi),0.05)]' : 'hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-macos-lg transition-all duration-200 ${
            isExpanded ? 'bg-[rgba(var(--band-xi),0.3)] border border-[rgba(var(--band-xi),0.5)]' : 'bg-white/10 border border-white/20'
          }`}>
            <Sparkles className={`w-5 h-5 ${isExpanded ? 'text-[rgb(var(--band-xi))]' : 'text-gray-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-xl font-light ${isExpanded ? 'text-[rgb(var(--band-xi))]' : 'text-white'}`}>
                Evolution Lab
              </h3>
              {proposals.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-macos-sm bg-[rgba(var(--band-xi),0.2)] text-[rgb(var(--band-xi))] border border-[rgba(var(--band-xi),0.3)]">
                  {proposals.length} {proposals.length === 1 ? 'proposal' : 'proposals'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-0.5">Self-improvement suggestions from consciousness</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className={`w-5 h-5 ${isExpanded ? 'text-[rgb(var(--band-xi))]' : 'text-gray-400'}`} />
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
            {/* Proposals */}
            <div className="space-y-4 mb-8">
        {proposals.length > 0 ? (
          proposals.map((proposal, index) => {
            const config = getProposalConfig(proposal.proposal_type)
            const Icon = config.icon
            const isExpanded = expandedProposal === index
            const isApproved = approvedProposals.has(index)
            const isRejected = rejectedProposals.has(index)
            const isDecided = isApproved || isRejected

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-macos-xl border transition-all duration-300 ${
                  isApproved
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : isRejected
                    ? 'bg-gray-500/10 border-gray-500/30 opacity-50'
                    : `${config.bgColor} ${config.borderColor}`
                }`}
              >
                {/* Proposal Header */}
                <div
                  onClick={() => !isDecided && toggleProposal(index)}
                  className={`p-4 ${!isDecided ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={`w-5 h-5 mt-0.5 ${isApproved ? 'text-emerald-400' : config.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${isApproved ? 'text-emerald-400' : 'text-white'}`}>
                            {proposal.proposal_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </h4>
                          {isApproved && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                          {isRejected && <X className="w-4 h-4 text-gray-400" />}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{proposal.expected_impact}</p>

                        {/* Risk Assessment */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">Risk:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${proposal.risk_assessment * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={getRiskBg(proposal.risk_assessment)}
                              />
                            </div>
                            <span className={`text-xs font-mono ${getRiskColor(proposal.risk_assessment)}`}>
                              {(proposal.risk_assessment * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!isDecided && (
                      <div className="flex gap-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            approveProposal(index)
                          }}
                          className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-macos-md text-xs font-medium hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            rejectProposal(index)
                          }}
                          className="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-macos-md text-xs font-medium hover:bg-rose-500/30 transition-colors border border-rose-500/30"
                        >
                          Reject
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && !isDecided && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-4 pb-4"
                    >
                      <div className="pt-4 border-t border-white/10 space-y-3">
                        {/* Current State */}
                        <div>
                          <div className="text-xs font-medium text-gray-400 mb-2">Current State:</div>
                          <div className="p-3 bg-white/5 rounded-macos-md space-y-1">
                            {Object.entries(proposal.current_state).map(([key, value]) => (
                              <div key={key} className="flex items-start gap-2">
                                <span className="text-xs text-[rgb(var(--band-xi))] font-mono min-w-[140px]">{key}:</span>
                                <span className="text-xs text-gray-300 flex-1">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Proposed Change */}
                        <div>
                          <div className="text-xs font-medium text-gray-400 mb-2">Proposed Change:</div>
                          <div className="p-3 bg-[rgba(var(--band-xi),0.1)] rounded-macos-md border border-[rgba(var(--band-xi),0.3)] space-y-1">
                            {Object.entries(proposal.proposed_change).map(([key, value]) => (
                              <div key={key} className="flex items-start gap-2">
                                <span className="text-xs text-[rgb(var(--band-xi))] font-mono font-medium min-w-[140px]">{key}:</span>
                                <span className="text-xs text-gray-200 flex-1 font-medium">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No evolution proposals at this time</p>
          </div>
        )}
      </div>

            {/* Learning Insights */}
            {learning_insights && learning_insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-[rgb(var(--band-beta-low))]" />
                  <span className="text-sm text-gray-400 font-medium">LEARNING INSIGHTS:</span>
                </div>
                <div className="space-y-2">
                  {learning_insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-2 p-3 bg-[rgba(var(--band-beta-low),0.1)] rounded-macos-lg border border-[rgba(var(--band-beta-low),0.3)]"
                    >
                      <span className="text-[rgb(var(--band-beta-low))] text-xs mt-0.5">•</span>
                      <span className="text-xs text-gray-300 flex-1">{insight}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Effectiveness Tracking */}
            {effectiveness_tracking && Object.keys(effectiveness_tracking).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-6 border-t border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-gray-400 font-medium">EFFECTIVENESS TRACKING:</span>
                  </div>
                  {Object.keys(effectiveness_tracking).length > 4 && (
                    <span className="text-xs text-gray-500">
                      Showing 4 of {Object.keys(effectiveness_tracking).length}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(effectiveness_tracking).slice(0, 4).map(([key, data]: [string, any], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      className="p-3 bg-white/5 rounded-macos-lg border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 truncate">{key}</span>
                        <span className="text-xs text-emerald-400 font-mono">
                          {typeof data === 'number' ? `${(data * 100).toFixed(0)}%` : data.effectiveness ? `${(data.effectiveness * 100).toFixed(0)}%` : 'N/A'}
                        </span>
                      </div>
                      {data.usage_count && (
                        <div className="text-xs text-gray-500">
                          {data.usage_count} uses
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Status Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-xs"
            >
              <span className="text-gray-400">Evolution Status:</span>
              <div className="flex gap-4">
                <span className="text-gray-300">
                  <span className="text-emerald-400">{approvedProposals.size}</span> approved
                </span>
                <span className="text-gray-300">
                  <span className="text-gray-500">{rejectedProposals.size}</span> rejected
                </span>
                <span className="text-gray-300">
                  <span className="text-[rgb(var(--band-psi))]">{proposals.length - approvedProposals.size - rejectedProposals.size}</span> pending
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
