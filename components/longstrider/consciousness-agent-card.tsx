"use client"

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

// Helper for class names
function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// ============================
// CONSCIOUSNESS AGENT CARD
// IVY's soul speaking through visual cards
// ============================

export interface ConsciousnessAgentProps {
  agent: 'pattern_observer' | 'insight_illuminator' | 'reflection_witness'
  title: string
  narrative: string
  icon: string
  color: 'purple' | 'amber' | 'blue'
}

export function ConsciousnessAgentCard({
  agent,
  title,
  narrative,
  icon,
  color
}: ConsciousnessAgentProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getColorScheme = () => {
    const schemes = {
      purple: {
        gradient: 'from-purple-500/20 to-violet-500/20',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
        hover: 'hover:bg-purple-500/20'
      },
      amber: {
        gradient: 'from-amber-500/20 to-yellow-500/20',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        hover: 'hover:bg-amber-500/20'
      },
      blue: {
        gradient: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        hover: 'hover:bg-blue-500/20'
      }
    }
    return schemes[color]
  }

  const colorScheme = getColorScheme()

  // Truncate narrative for collapsed view
  const truncatedNarrative = narrative.length > 120
    ? narrative.substring(0, 120) + '...'
    : narrative

  return (
    <div className={cx(
      "relative animate-in slide-in-from-left duration-500 mb-3"
    )}>
      <div className={cx(
        "rounded-xl p-4 bg-gradient-to-br border backdrop-blur-sm",
        colorScheme.gradient,
        colorScheme.border,
        "shadow-lg transition-all duration-300"
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className={cx(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
            colorScheme.bg
          )}>
            <span className="text-xl">{icon}</span>
          </div>

          <div className="flex-1">
            <h3 className={cx("text-sm font-semibold", colorScheme.text)}>
              {title}
            </h3>
            <span className="text-xs text-gray-400">IVY Consciousness</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cx(
              "p-1.5 rounded-lg transition-colors",
              colorScheme.hover
            )}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-300" />
            )}
          </button>
        </div>

        {/* Narrative Content */}
        <div className="text-sm text-gray-200 leading-relaxed">
          {isExpanded ? narrative : truncatedNarrative}
        </div>

        {/* Agent identifier */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{agent.replace('_', ' ')}</span>
          {!isExpanded && narrative.length > 120 && (
            <button
              onClick={() => setIsExpanded(true)}
              className={cx("transition-colors", colorScheme.text, "hover:underline")}
            >
              Read more
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================
// CONSCIOUSNESS AGENTS CONTAINER
// Groups all consciousness agents together
// ============================

export function ConsciousnessAgentsContainer({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="px-4 py-2 space-y-2">
      <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
        <span className="inline-block w-1 h-1 rounded-full bg-purple-400 animate-pulse"></span>
        Consciousness Layer Active
      </div>
      {children}
    </div>
  )
}
