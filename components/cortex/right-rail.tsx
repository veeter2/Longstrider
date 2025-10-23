"use client"

/**
 * Cortex Right Rail
 * Meta intelligence and system status
 * Cognitive Band: Chi-Cyan (χ) - System consciousness, self-awareness
 */

import { Activity, Brain, Zap, TrendingUp } from 'lucide-react'

interface CortexRightRailProps {
  processingTime: number
  integrityCheck: boolean
  lastUpdated: Date
  overallActivity: {
    frontal: number
    temporal: number
    parietal: number
    occipital: number
  }
}

export function CortexRightRail({
  processingTime,
  integrityCheck,
  lastUpdated,
  overallActivity
}: CortexRightRailProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Header */}
          <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <Brain className="h-5 w-5 text-[rgb(var(--band-chi-cyan))]" />
            System Status
          </h3>

          {/* Processing Stats */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500">PERFORMANCE</h4>

            {/* Processing Time */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Processing Time</span>
                <Zap className="h-3 w-3 text-[rgb(var(--band-xi))]" />
              </div>
              <div className="text-lg font-semibold text-[rgb(var(--band-xi))]">
                {processingTime}ms
              </div>
            </div>

            {/* Integrity */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Integrity</span>
                <Activity className="h-3 w-3 text-[rgb(var(--band-psi))]" />
              </div>
              <div className={`text-lg font-semibold ${integrityCheck ? 'text-[rgb(var(--band-psi))]' : 'text-[rgb(var(--band-beta-high))]'}`}>
                {integrityCheck ? 'OPTIMAL' : 'CHECK REQUIRED'}
              </div>
            </div>

            {/* Last Updated */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Last Updated</span>
                <TrendingUp className="h-3 w-3 text-gray-400" />
              </div>
              <div className="text-xs text-gray-300">
                {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Overall Brain Activity */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500">LOBE ACTIVITY</h4>
            <div className="space-y-2">
              {Object.entries(overallActivity).map(([lobe, activation]) => {
                const lobeConfig: Record<string, { color: string; label: string }> = {
                  frontal: { color: 'rgb(var(--band-alpha-low))', label: 'Frontal' },
                  temporal: { color: 'rgb(var(--band-beta-mid))', label: 'Temporal' },
                  parietal: { color: 'rgb(var(--band-psi))', label: 'Parietal' },
                  occipital: { color: 'rgb(var(--band-xi))', label: 'Occipital' }
                }
                const config = lobeConfig[lobe]

                return (
                  <div key={lobe} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: activation > 0.5 ? config.color : 'rgb(var(--band-sigma))'
                      }}
                    />
                    <span className="text-xs text-gray-400 flex-1">{config.label}</span>
                    <span className="text-xs font-mono text-gray-300">
                      {(activation * 100).toFixed(0)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Live Indicator */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[rgb(var(--band-psi))] rounded-full animate-pulse" />
              <span className="text-xs text-[rgb(var(--band-psi))]">LIVE</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Real-time consciousness substrate monitoring
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
