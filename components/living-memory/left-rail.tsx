"use client"

/**
 * Living Memory Left Rail
 * Temporal timeline and memory navigation
 * Cognitive Band: Theta-High (violet) - Spatial memory, navigation
 */

import React from 'react'
import { Clock, Star, User, Users, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react'

interface MemoryItem {
  id: string
  title: string
  timestamp: number
  messageCount: number
  emotion: string
  gravity_score: number
  starred?: boolean
  teamContributions?: Array<{
    id: string
    userName: string
  }>
}

interface LivingMemoryLeftRailProps {
  memories: MemoryItem[]
  selectedMemory: MemoryItem | null
  timeRange: 'hot' | 'short' | 'mid' | 'long'
  ownershipFilter: 'mine' | 'team' | 'all'
  isMounted: boolean
  onSelectMemory: (memory: MemoryItem) => void
  onSetTimeRange: (range: 'hot' | 'short' | 'mid' | 'long') => void
  onSetOwnershipFilter: (filter: 'mine' | 'team' | 'all') => void
  onToggleStar: (id: string) => void
  getEmotionIcon: (emotion: string) => string
}

export function LivingMemoryLeftRail({
  memories,
  selectedMemory,
  timeRange,
  ownershipFilter,
  isMounted,
  onSelectMemory,
  onSetTimeRange,
  onSetOwnershipFilter,
  onToggleStar,
  getEmotionIcon,
}: LivingMemoryLeftRailProps) {
  const [showCompleted, setShowCompleted] = React.useState(false)

  // Mock completed memories
  const completedMemories = [
    {
      id: 'mem_complete_001',
      title: 'Onboarding Flow Implementation',
      timestamp: Date.now() - (95 * 86400000),
      messageCount: 64,
      gravity_score: 0.88,
      emotion: 'satisfaction',
      teamContributions: [
        { id: 'c1', userName: 'Alex Kim' },
        { id: 'c2', userName: 'Jordan Lee' }
      ],
      starred: false
    },
    {
      id: 'mem_complete_002',
      title: 'Payment Gateway Integration',
      timestamp: Date.now() - (110 * 86400000),
      messageCount: 52,
      gravity_score: 0.92,
      emotion: 'relief',
      teamContributions: undefined,
      starred: false
    },
    {
      id: 'mem_complete_003',
      title: 'Mobile Responsive Layout',
      timestamp: Date.now() - (130 * 86400000),
      messageCount: 38,
      gravity_score: 0.79,
      emotion: 'focus',
      teamContributions: [
        { id: 'c3', userName: 'Sarah Chen' }
      ],
      starred: true
    }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[rgb(var(--band-theta-high))]" />
          Living Memory
        </h2>
        <div className="flex gap-1">
          {(['hot', 'short', 'mid', 'long'] as const).map(range => {
            // Living Laws compliant color mapping for time ranges
            const colorMap: Record<typeof range, { active: string; inactive: string }> = {
              hot: {
                active: 'bg-[rgba(var(--band-beta-high),0.2)] text-[rgb(var(--band-beta-high))] border border-[rgba(var(--band-beta-high),0.3)]',
                inactive: 'bg-white/5 text-gray-400 hover:bg-[rgba(var(--band-beta-high),0.1)] hover:text-[rgb(var(--band-beta-high))] border border-transparent'
              },
              short: {
                active: 'bg-[rgba(var(--band-xi),0.2)] text-[rgb(var(--band-xi))] border border-[rgba(var(--band-xi),0.3)]',
                inactive: 'bg-white/5 text-gray-400 hover:bg-[rgba(var(--band-xi),0.1)] hover:text-[rgb(var(--band-xi))] border border-transparent'
              },
              mid: {
                active: 'bg-[rgba(var(--band-psi),0.2)] text-[rgb(var(--band-psi))] border border-[rgba(var(--band-psi),0.3)]',
                inactive: 'bg-white/5 text-gray-400 hover:bg-[rgba(var(--band-psi),0.1)] hover:text-[rgb(var(--band-psi))] border border-transparent'
              },
              long: {
                active: 'bg-[rgba(var(--band-sigma),0.2)] text-[rgb(var(--band-sigma))] border border-[rgba(var(--band-sigma),0.3)]',
                inactive: 'bg-white/5 text-gray-400 hover:bg-[rgba(var(--band-sigma),0.1)] hover:text-[rgb(var(--band-sigma))] border border-transparent'
              }
            }

            return (
              <button
                key={range}
                onClick={() => onSetTimeRange(range)}
                aria-label={`Filter by ${range} term memories`}
                aria-pressed={timeRange === range}
                className={`flex-1 py-1 px-2 text-xs rounded-lg transition-all duration-200 ${
                  timeRange === range ? colorMap[range].active : colorMap[range].inactive
                }`}
              >
                {range.toUpperCase()}
              </button>
            )
          })}
        </div>
      </div>

      {/* Ownership Filter */}
      <div className="px-4 py-2 border-b border-white/10">
        <div className="flex gap-1">
          <button
            onClick={() => onSetOwnershipFilter('mine')}
            aria-label="Show only my memories"
            aria-pressed={ownershipFilter === 'mine'}
            className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center gap-1 ${
              ownershipFilter === 'mine'
                ? 'bg-[rgba(var(--band-theta-high),0.2)] text-[rgb(var(--band-theta-high))] border border-[rgba(var(--band-theta-high),0.3)]'
                : 'bg-white/5 text-gray-400 hover:bg-[rgba(var(--band-theta-high),0.1)] hover:text-[rgb(var(--band-theta-high))] border border-transparent'
            }`}
          >
            <User className="h-3 w-3" />
            Mine
          </button>
          <button
            onClick={() => onSetOwnershipFilter('team')}
            aria-label="Show team memories"
            aria-pressed={ownershipFilter === 'team'}
            className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center gap-1 ${
              ownershipFilter === 'team'
                ? 'bg-[rgba(var(--band-psi),0.2)] text-[rgb(var(--band-psi))] border border-[rgba(var(--band-psi),0.3)]'
                : 'bg-white/5 text-gray-400 hover:bg-[rgba(var(--band-psi),0.1)] hover:text-[rgb(var(--band-psi))] border border-transparent'
            }`}
          >
            <Users className="h-3 w-3" />
            Team
          </button>
          <button
            onClick={() => onSetOwnershipFilter('all')}
            aria-label="Show all memories"
            aria-pressed={ownershipFilter === 'all'}
            className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center gap-1 ${
              ownershipFilter === 'all'
                ? 'bg-[rgba(var(--band-gamma-low),0.2)] text-[rgb(var(--band-gamma-low))] border border-[rgba(var(--band-gamma-low),0.3)]'
                : 'bg-white/5 text-gray-400 hover:bg-[rgba(var(--band-gamma-low),0.1)] hover:text-[rgb(var(--band-gamma-low))] border border-transparent'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Memory List */}
      <div className="flex-1 overflow-y-auto">
        {memories.map(memory => (
          <div
            key={memory.id}
            onClick={() => onSelectMemory(memory)}
            className={`w-full px-3 py-2 border-b border-white/10 hover:bg-white/5 transition-all duration-200 cursor-pointer ${
              selectedMemory?.id === memory.id ? 'bg-[rgba(var(--band-theta-high),0.1)] border-l-2 border-[rgb(var(--band-theta-high))]' : ''
            }`}
          >
            {/* Title + Star */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h4 className="text-sm font-medium text-white truncate flex-1">
                {memory.title}
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStar(memory.id)
                }}
                className="p-0.5 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                aria-label={memory.starred ? 'Unstar memory' : 'Star memory'}
              >
                <Star
                  className={`h-3 w-3 ${
                    memory.starred
                      ? 'fill-[rgb(var(--band-xi))] text-[rgb(var(--band-xi))]'
                      : 'text-gray-500'
                  }`}
                />
              </button>
            </div>

            {/* User/Team • Messages • Bar • % */}
            <div className="flex items-center gap-2 mb-1">
              {/* User/Team avatars */}
              {memory.teamContributions && memory.teamContributions.length > 0 ? (
                <div className="flex -space-x-1">
                  {memory.teamContributions.slice(0, 3).map((contrib, idx) => {
                    // Assign different neural band colors to each team member
                    const avatarColors = [
                      'bg-gradient-to-br from-[rgb(var(--band-psi))] to-[rgb(var(--band-alpha-high))]',      // Teal to Magenta
                      'bg-gradient-to-br from-[rgb(var(--band-xi))] to-[rgb(var(--band-beta-low))]',         // Amber to Pink
                      'bg-gradient-to-br from-[rgb(var(--band-beta-mid))] to-[rgb(var(--band-alpha-low))]',  // Rose to Purple
                      'bg-gradient-to-br from-[rgb(var(--band-gamma-low))] to-[rgb(var(--band-theta-high))]',// Lavender to Violet
                      'bg-gradient-to-br from-[rgb(var(--band-alpha-high))] to-[rgb(var(--band-psi))]',      // Magenta to Teal
                      'bg-gradient-to-br from-[rgb(var(--band-beta-low))] to-[rgb(var(--band-xi))]',         // Pink to Amber
                    ]
                    const colorClass = avatarColors[idx % avatarColors.length]

                    return (
                      <div
                        key={contrib.id}
                        className={`h-4 w-4 rounded-full ${colorClass} border border-slate-900 flex items-center justify-center`}
                        title={contrib.userName}
                        role="img"
                        aria-label={contrib.userName}
                      >
                        <span className="text-[9px] font-medium">{contrib.userName[0]}</span>
                      </div>
                    )
                  })}
                  {memory.teamContributions.length > 3 && (
                    <div className="h-4 w-4 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center">
                      <span className="text-[9px]">+{memory.teamContributions.length - 3}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-[rgb(var(--band-theta-high))] to-[rgb(var(--band-alpha-high))] border border-slate-900 flex items-center justify-center">
                  <User className="h-2.5 w-2.5 text-white" />
                </div>
              )}

              <span className="text-[10px] text-gray-500">•</span>

              {/* Messages */}
              <span className="text-[10px] text-gray-500">{memory.messageCount} msgs</span>

              <span className="text-[10px] text-gray-500">•</span>

              {/* Gravity bar */}
              <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[rgba(var(--band-theta-high),0.4)] to-[rgba(var(--band-alpha-high),0.3)]"
                  style={{ width: `${memory.gravity_score * 100}%` }}
                />
              </div>

              {/* Percentage */}
              <span className="text-[10px] text-gray-400 font-medium">
                {(memory.gravity_score * 100).toFixed(0)}%
              </span>
            </div>

            {/* Date */}
            <div className="text-[10px] text-gray-500" suppressHydrationWarning>
              {isMounted ? new Date(memory.timestamp).toLocaleDateString() : '...'}
            </div>
          </div>
        ))}

        {/* Completed Section */}
        <div className="border-t-2 border-white/20">
          {/* Completed Header - Collapsible */}
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[rgb(var(--band-sigma))]" />
              <span className="text-xs font-semibold text-gray-400 uppercase">Completed</span>
              <span className="text-[10px] text-gray-500">({completedMemories.length})</span>
            </div>
            {showCompleted ? (
              <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
            )}
          </button>

          {/* Completed Memories List */}
          {showCompleted && (
            <div className="bg-black/20">
              {completedMemories.map(memory => (
                <div
                  key={memory.id}
                  onClick={() => onSelectMemory(memory as any)}
                  className="w-full px-3 py-2 border-b border-white/5 hover:bg-white/5 transition-all duration-200 cursor-pointer opacity-60 hover:opacity-100"
                >
                  {/* Title + Star */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-medium text-gray-300 truncate flex-1">
                      {memory.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleStar(memory.id)
                      }}
                      className="p-0.5 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                      aria-label={memory.starred ? 'Unstar memory' : 'Star memory'}
                    >
                      <Star
                        className={`h-3 w-3 ${
                          memory.starred
                            ? 'fill-[rgb(var(--band-xi))] text-[rgb(var(--band-xi))]'
                            : 'text-gray-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* User/Team • Messages • Bar • % */}
                  <div className="flex items-center gap-2 mb-1">
                    {/* User/Team avatars */}
                    {memory.teamContributions && memory.teamContributions.length > 0 ? (
                      <div className="flex -space-x-1">
                        {memory.teamContributions.slice(0, 3).map((contrib, idx) => {
                          const avatarColors = [
                            'bg-gradient-to-br from-[rgb(var(--band-psi))] to-[rgb(var(--band-alpha-high))]',
                            'bg-gradient-to-br from-[rgb(var(--band-xi))] to-[rgb(var(--band-beta-low))]',
                            'bg-gradient-to-br from-[rgb(var(--band-beta-mid))] to-[rgb(var(--band-alpha-low))]',
                          ]
                          const colorClass = avatarColors[idx % avatarColors.length]

                          return (
                            <div
                              key={contrib.id}
                              className={`h-4 w-4 rounded-full ${colorClass} border border-slate-900 flex items-center justify-center opacity-70`}
                              title={contrib.userName}
                            >
                              <span className="text-[9px] font-medium">{contrib.userName[0]}</span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gradient-to-br from-[rgb(var(--band-theta-high))] to-[rgb(var(--band-alpha-high))] border border-slate-900 flex items-center justify-center opacity-70">
                        <User className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}

                    <span className="text-[10px] text-gray-500">•</span>
                    <span className="text-[10px] text-gray-500">{memory.messageCount} msgs</span>
                    <span className="text-[10px] text-gray-500">•</span>

                    {/* Gravity bar */}
                    <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[rgba(var(--band-sigma),0.3)]"
                        style={{ width: `${memory.gravity_score * 100}%` }}
                      />
                    </div>

                    <span className="text-[10px] text-gray-500 font-medium">
                      {(memory.gravity_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Date */}
                  <div className="text-[10px] text-gray-500" suppressHydrationWarning>
                    {isMounted ? new Date(memory.timestamp).toLocaleDateString() : '...'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
