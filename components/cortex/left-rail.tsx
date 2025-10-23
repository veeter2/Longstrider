"use client"

/**
 * Cortex Left Rail Navigation
 * Sub-page navigation for power user programming interface
 * Cognitive Band: Chi-Cyan (χ) - System consciousness control
 */

import { Database, Cpu, Sparkles, Eye, Upload, type LucideIcon } from 'lucide-react'

export type CortexSection = 'knowledge' | 'cognitive' | 'evolution' | 'awareness' | 'knowledge-import'

interface NavItem {
  id: CortexSection
  label: string
  icon: LucideIcon
  description: string
  band: string // Neural band color
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'knowledge',
    label: 'Knowledge Stack',
    icon: Database,
    description: 'Active sources & effectiveness',
    band: 'psi' // ψ Teal - Pattern recognition
  },
  {
    id: 'cognitive',
    label: 'Cognitive Architecture',
    icon: Cpu,
    description: 'Modes, lobes, processing',
    band: 'beta-low' // β₁ Pink-Magenta - Cortex, reasoning
  },
  {
    id: 'evolution',
    label: 'Evolution Lab',
    icon: Sparkles,
    description: 'System improvements & proposals',
    band: 'xi' // ξ Amber-Gold - Insight emergence
  },
  {
    id: 'awareness',
    label: 'Self-Awareness',
    icon: Eye,
    description: 'Consciousness & decision trace',
    band: 'alpha-high' // α₂ Magenta - Calm focus
  },
  {
    id: 'knowledge-import',
    label: 'Knowledge Import',
    icon: Upload, // Changed from Download to Upload!
    description: 'Import chat history & conversations',
    band: 'chi-cyan' // χ Cyan - Creative synthesis
  }
]

interface CortexLeftRailProps {
  activeSection: CortexSection
  onSectionChange: (section: CortexSection) => void
}

export function CortexLeftRail({
  activeSection,
  onSectionChange
}: CortexLeftRailProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {/* Header */}
          <div className="pb-4 mb-2 border-b border-white/10">
            <h3 className="text-sm font-bold text-[rgb(var(--band-chi-cyan))] uppercase tracking-wider">
              Cortex Control
            </h3>
            <p className="text-xs text-gray-500 mt-1">Programming Interface</p>
          </div>

          {/* Navigation Items */}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            const bandVar = `--band-${item.band}`

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? `bg-[rgba(var(${bandVar}),0.2)] border border-[rgba(var(${bandVar}),0.5)]`
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      isActive ? `text-[rgb(var(${bandVar}))]` : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${
                      isActive ? `text-[rgb(var(${bandVar}))]` : 'text-white'
                    }`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
