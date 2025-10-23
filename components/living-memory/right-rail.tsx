"use client"

/**
 * Living Memory Right Rail
 * Meta intelligence, patterns, and cognitive state
 * Cognitive Band: Gamma-Low (lavender-white) - Synthesis, integration
 */

import {
  Sparkles,
  Zap,
  CheckCircle,
  XCircle,
  Lightbulb,
  AlertCircle,
  Save,
} from 'lucide-react'

interface Pattern {
  id: string
  pattern: string
  count: number
  strength: number
  lastOccurred: number
}

interface IdentityAnchor {
  id: string
  content: string
  triggered: boolean
}

interface Contradiction {
  id: string
  group: string
  earlier: string
  current: string
  resolution?: string
}

interface MemoryItem {
  keyThemes: string[]
  consciousness_mode?: string
  coherence?: number
}

interface LivingMemoryRightRailProps {
  patterns: Pattern[]
  identityAnchors: IdentityAnchor[]
  contradictions: Contradiction[]
  selectedMemory: MemoryItem | null
  isMounted: boolean
  getModeIcon: (mode: string) => React.ReactNode
}

export function LivingMemoryRightRail({
  patterns,
  identityAnchors,
  contradictions,
  selectedMemory,
  isMounted,
  getModeIcon,
}: LivingMemoryRightRailProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <Sparkles className="h-5 w-5 text-[rgb(var(--band-gamma-low))]" />
            Meta Intelligence
          </h3>

          {/* Cognitive State - Most immediately relevant */}
          {selectedMemory && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500">COGNITIVE STATE</h4>
              <div className="bg-[rgba(var(--band-alpha-high),0.1)] rounded-lg p-3 border border-[rgba(var(--band-alpha-high),0.2)]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Mode</span>
                    <div className="flex items-center gap-1">
                      {getModeIcon(selectedMemory.consciousness_mode || 'stream')}
                      <span className="text-xs font-medium capitalize">
                        {selectedMemory.consciousness_mode || 'stream'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Band</span>
                    <span className="text-xs font-medium">θ₂ (Deep Focus)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Coherence</span>
                    <span className="text-xs font-medium">
                      {((selectedMemory.coherence || 0.5) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Momentum</span>
                    <span className="text-xs font-medium text-[rgb(var(--band-psi))]">Accelerating</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Themes - Immediate context */}
          {selectedMemory && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500">KEY THEMES</h4>
              <div className="flex flex-wrap gap-1">
                {selectedMemory.keyThemes.map(theme => (
                  <span
                    key={theme}
                    className="px-2 py-1 bg-white/10 text-gray-300 rounded-lg text-xs hover:bg-white/20 cursor-pointer transition-colors duration-200 border border-white/10"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pattern Recognition - Changed to psi (teal) for pattern recognition */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500">ACTIVE PATTERNS</h4>
            {patterns.map(pattern => (
              <div key={pattern.id} className="bg-[rgba(var(--band-psi),0.1)] rounded-lg p-3 border border-[rgba(var(--band-psi),0.2)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[rgb(var(--band-psi))]">{pattern.pattern}</span>
                  <span className="text-xs text-gray-400">×{pattern.count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[rgba(var(--band-psi),0.5)]"
                      style={{ width: `${pattern.strength * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {(pattern.strength * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1" suppressHydrationWarning>
                  Last: {isMounted ? new Date(pattern.lastOccurred).toLocaleTimeString() : '...'}
                </div>
              </div>
            ))}
          </div>

          {/* Confidence Indicators */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500">CONFIDENCE INDICATORS</h4>
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Confidence Score</span>
                  <span className="text-xs font-medium">82%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[rgba(var(--band-psi),0.6)]" style={{ width: '82%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Retrieval Score</span>
                  <span className="text-xs font-medium">96%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[rgba(var(--band-theta-high),0.6)]" style={{ width: '96%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Fusion Score</span>
                  <span className="text-xs font-medium">71%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[rgba(var(--band-alpha-high),0.6)]" style={{ width: '71%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Identity Anchors */}
          {identityAnchors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500">IDENTITY ANCHORS</h4>
              {identityAnchors.map(anchor => (
                <div key={anchor.id} className="bg-[rgba(var(--band-xi),0.1)] rounded-lg p-3 border border-[rgba(var(--band-xi),0.2)]">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-[rgb(var(--band-xi))] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-200">"{anchor.content}"</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {anchor.triggered && '→ Triggered reflection engine'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contradictions */}
          {contradictions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500">CONTRADICTION TRACKING</h4>
              {contradictions.map(contra => (
                <div key={contra.id} className="bg-[rgba(var(--band-beta-high),0.1)] rounded-lg p-3 border border-[rgba(var(--band-beta-high),0.2)]">
                  <div className="text-xs text-[rgb(var(--band-beta-high))] mb-2">Group: {contra.group}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-3 w-3 text-[rgb(var(--band-beta-high))] mt-0.5" />
                      <span className="text-gray-300">{contra.earlier}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-[rgb(var(--band-psi))] mt-0.5" />
                      <span className="text-gray-300">{contra.current}</span>
                    </div>
                  </div>
                  {contra.resolution && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <span className="text-xs text-gray-500">Resolution: </span>
                      <span className="text-xs text-gray-300">{contra.resolution}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Recommendations */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500">SUGGESTED NEXT STEPS</h4>
            <div className="space-y-2">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-[rgb(var(--band-xi))] mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">Document batch processing decision</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Gravity: 0.92 | Why: Team alignment needed
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-[rgb(var(--band-xi))] mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">Review contradictions in sync approach</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Gravity: 0.67 | Why: Unresolved tension
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-start gap-2">
                  <Save className="h-4 w-4 text-[rgb(var(--band-psi))] mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">Save running summary snapshot</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Gravity: 0.45 | Why: Milestone reached
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
