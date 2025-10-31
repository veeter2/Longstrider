"use client"

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Brain,
  Zap,
  Star,
  GitBranch,
  Network,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Activity,
  TrendingUp,
  Database,
  Moon,
  Sun,
  Cloud,
  Archive,
  Eye,
  EyeOff,
  Flame,
  Hash,
  Shield,
  ExternalLink,
  Tag,
  MessageSquare,
  Clock,
  Target,
  Sparkles,
  Edit3,
  User,
  Check
} from 'lucide-react'

import type { MemorySpace, MemoryCluster } from '@/types/longstrider'
import { useConsciousnessStore, type SpaceGoal } from '@/stores/consciousness-store'
import { useLongStriderStore } from '@/stores/longstrider-store'

// ============================
// LONGSTRIDER LEFT RAIL
// Memory Navigation & Space Management
// Dynamic, Expandable, Real-time
// ============================

// Helper for class names
function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// ============================
// SPACE STATUS INDICATOR
// ============================

function SpaceStatusIndicator({ status }: { status: MemorySpace['status'] }) {
  const configs = {
    hot: { icon: Flame, color: 'text-red-400', bg: 'bg-red-500/20', title: 'Hot - Active now' },
    warm: { icon: Sun, color: 'text-orange-400', bg: 'bg-orange-500/20', title: 'Warm - Recent activity' },
    cool: { icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-500/20', title: 'Cool - Older memory' },
    cold: { icon: Moon, color: 'text-gray-400', bg: 'bg-gray-500/20', title: 'Cold - Archived' },
    archived: { icon: Archive, color: 'text-gray-500', bg: 'bg-gray-600/20', title: 'Archived' }
  }
  
  const config = configs[status] || configs.cold
  const Icon = config.icon
  
  return (
    <div 
      className={cx("w-5 h-5 rounded-full flex items-center justify-center", config.bg)}
      title={config.title}
    >
      <Icon className={cx("w-3 h-3", config.color)} />
    </div>
  )
}

// ============================
// METRIC BADGE COMPONENT
// ============================

function MetricBadge({ 
  icon: Icon, 
  value, 
  label, 
  color = 'gray' 
}: { 
  icon: any
  value: any
  label: string
  color?: string
}) {
  const formatValue = () => {
    if (typeof value === 'number') {
      if (label.includes('%') || label.includes('score')) {
        return `${(value * 100).toFixed(0)}%`
      }
      if (label.includes('cost')) {
        return `$${value.toFixed(3)}`
      }
      if (value > 1000) {
        return `${(value / 1000).toFixed(1)}k`
      }
      return value.toFixed(0)
    }
    return String(value)
  }
  
  const colorClasses = {
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  }
  
  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.gray
  
  return (
    <div className={cx(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border",
      classes
    )}>
      <Icon className="w-3 h-3" />
      <span>{formatValue()}</span>
    </div>
  )
}

// ============================
// GOAL CARD (for current session)
// ============================

function GoalCard({ goal, spaceId }: { goal: SpaceGoal; spaceId: string }) {
  const { updateSpace, spaces } = useConsciousnessStore()

  const handleToggleGoal = () => {
    const space = spaces[spaceId]
    if (!space) return

    const updatedGoals = space.goals.map(g =>
      g.id === goal.id
        ? {
            ...g,
            status: g.status === 'completed' ? 'active' : 'completed',
            completed_at: g.status === 'completed' ? undefined : Date.now()
          } as SpaceGoal
        : g
    )

    updateSpace(spaceId, { goals: updatedGoals })
  }

  const isCompleted = goal.status === 'completed'
  const isBlocked = goal.status === 'blocked'

  return (
    <button
      onClick={handleToggleGoal}
      className={cx(
        "w-full flex items-start gap-2 p-2 rounded-lg transition-all duration-200 text-left group",
        isCompleted
          ? "bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/15"
          : isBlocked
          ? "bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/15"
          : "bg-white/5 border border-white/10 hover:bg-white/10"
      )}
    >
      {/* Checkbox */}
      <div className={cx(
        "mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all",
        isCompleted
          ? "bg-emerald-500/30 border-emerald-500"
          : "bg-transparent border-gray-500 group-hover:border-indigo-400"
      )}>
        {isCompleted && <Check className="w-3 h-3 text-emerald-300" />}
      </div>

      {/* Goal text */}
      <div className="flex-1 min-w-0">
        <p className={cx(
          "text-xs leading-relaxed",
          isCompleted
            ? "text-emerald-200 line-through"
            : "text-gray-300"
        )}>
          {goal.title}
        </p>
        {goal.description && (
          <p className="text-[10px] text-gray-500 mt-0.5">{goal.description}</p>
        )}
      </div>
    </button>
  )
}

// ============================
// CURRENT SESSION CARD
// ============================

function CurrentSessionCard({
  space,
  onNavigateToMemory,
  onUpdateSpace
}: {
  space: MemorySpace | null
  onNavigateToMemory: () => void
  onUpdateSpace?: (spaceId: string, updates: { name?: string, starred?: boolean }) => void
}) {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState('')
  const titleInputRef = React.useRef<HTMLInputElement>(null)

  if (!space) {
    return (
      <div className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 backdrop-blur-sm">
        <div className="text-center text-gray-400 text-sm">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No active session</p>
          <p className="text-xs mt-1">Create a new space to get started</p>
        </div>
      </div>
    )
  }

  const tags = (space.metadata?.tags as string[]) || []
  const summary = (space.metadata?.summary as string) || "Building something amazing..."

  // Format dates
  const createdDate = new Date(space.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const hoursSinceModified = (Date.now() - space.updated) / (1000 * 60 * 60)
  const modifiedText = hoursSinceModified < 1
    ? `${Math.floor(hoursSinceModified * 60)}m ago`
    : hoursSinceModified < 24
      ? `${Math.floor(hoursSinceModified)}h ago`
      : hoursSinceModified < 168
        ? `${Math.floor(hoursSinceModified / 24)}d ago`
        : new Date(space.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  // Team members (placeholder for now)
  const teamCount = 0 // TODO: Wire from space.team_members when available

  const handleStartEdit = () => {
    setEditedTitle(space.name)
    setIsEditingTitle(true)
    setTimeout(() => titleInputRef.current?.focus(), 0)
  }

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== space.name) {
      onUpdateSpace?.(space.id, { name: editedTitle.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle()
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false)
    }
  }

  const toggleStar = () => {
    onUpdateSpace?.(space.id, { starred: !space.starred })
  }

  return (
    <div className="mx-4 my-4 rounded-xl bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-pink-500/15 border-2 border-indigo-500/30 backdrop-blur-sm overflow-hidden shadow-xl shadow-indigo-500/20">
      {/* Header */}
      <div className="p-4">
        {/* Title Row with Edit + Star */}
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-base font-semibold text-gray-100 bg-black/30 border border-indigo-500/50 rounded focus:outline-none focus:border-indigo-500"
              />
            ) : (
              <div className="flex items-center gap-1.5 group">
                <h3
                  onClick={handleStartEdit}
                  className="text-base font-bold text-white truncate cursor-pointer hover:text-indigo-300 transition-colors"
                  title="Click to edit"
                >
                  {space.name}
                </h3>
                <button
                  onClick={handleStartEdit}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/10 rounded"
                  title="Edit title"
                >
                  <Edit3 className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            )}

            {/* Compact metadata row */}
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5 flex-wrap">
              <span className="whitespace-nowrap">Created {createdDate}</span>
              <span className="text-gray-600">•</span>
              <span className="whitespace-nowrap">{modifiedText}</span>
              <span className="text-gray-600">•</span>
              <div className="flex items-center gap-1">
                <User className="w-2.5 h-2.5" />
                <span>{teamCount > 0 ? `Matt +${teamCount}` : 'Solo'}</span>
              </div>
            </div>
          </div>

          {/* Star Button */}
          <button
            onClick={toggleStar}
            className={cx(
              "p-1.5 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0",
              space.starred
                ? "text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30"
                : "text-gray-500 bg-white/5 hover:bg-white/10 hover:text-yellow-400"
            )}
            title={space.starred ? "Remove star" : "Add star"}
          >
            <Star className={cx("w-4 h-4", space.starred && "fill-current")} />
          </button>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-200 line-clamp-2 leading-relaxed mt-2.5">
          {summary}
        </p>

        {/* Divider */}
        <div className="my-3 border-t border-white/5" />

        {/* Goals Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Goals {(space.goals?.length ?? 0) > 0 && `(${space.goals?.filter(g => g.status === 'completed').length}/${space.goals?.length ?? 0})`}
            </h4>
          </div>
          {space.goals && space.goals.length > 0 ? (
            <div className="space-y-1.5">
              {space.goals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  spaceId={space.id}
                />
              ))}
            </div>
          ) : (
            <p className="italic text-xs text-gray-500">No goals set yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================
// MEMORY SPACE CARD
// ============================

function MemorySpaceCard({ 
  space, 
  isSelected,
  onClick,
  onExpand,
  isExpanded 
}: { 
  space: MemorySpace
  isSelected: boolean
  onClick: () => void
  onExpand: () => void
  isExpanded: boolean
}) {
  const hasChildren = (space.child_ids?.length || 0) > 0
  const isHighGravity = (space.metrics?.gravity_score || 0) > 0.7
  
  return (
    <div className={cx(
      "group relative rounded-lg transition-all duration-200",
      isSelected 
        ? "bg-indigo-500/20 border border-indigo-500/40" 
        : "bg-white/5 border border-white/10 hover:bg-white/10",
      isHighGravity && "ring-1 ring-purple-500/30"
    )}>
      {/* Main Card */}
      <div 
        onClick={onClick}
        className="p-3 cursor-pointer"
      >
        <div className="flex items-start gap-2">
          {/* Expand/Collapse */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onExpand()
              }}
              className="mt-0.5 text-gray-400 hover:text-gray-200"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          
          {/* Status */}
          <SpaceStatusIndicator status={space.status} />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-100 truncate">
                {space.name}
              </h3>
              {space.starred && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
              {space.pinned && <Shield className="w-3 h-3 text-blue-400" />}
            </div>
            
            {/* Metrics */}
            {space.metrics && (
              <div className="mt-2 flex flex-wrap gap-1">
                {space.metrics.gravity_score && (
                  <MetricBadge 
                    icon={Zap} 
                    value={space.metrics.gravity_score} 
                    label="gravity score" 
                    color="purple"
                  />
                )}
                {space.metrics.message_count && (
                  <MetricBadge 
                    icon={Hash} 
                    value={space.metrics.message_count} 
                    label="messages" 
                    color="blue"
                  />
                )}
                {space.metrics.coherence && space.metrics.coherence > 0.5 && (
                  <MetricBadge 
                    icon={Activity} 
                    value={space.metrics.coherence} 
                    label="coherence" 
                    color="cyan"
                  />
                )}
                {space.metrics.total_cost && (
                  <MetricBadge 
                    icon={TrendingUp} 
                    value={space.metrics.total_cost} 
                    label="cost" 
                    color="green"
                  />
                )}
              </div>
            )}
            
            {/* Timestamp */}
            <div className="mt-1 text-xs text-gray-500">
              Updated {new Date(space.updated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Child Spaces */}
      {isExpanded && hasChildren && (
        <div className="pl-8 pr-3 pb-3">
          {space.child_ids?.map(childId => (
            <div 
              key={childId} 
              className="mt-2 p-2 bg-black/30 rounded border border-white/5"
            >
              <div className="flex items-center gap-2">
                <GitBranch className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-300">Child: {childId.slice(0, 8)}...</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================
// MEMORY CLUSTER SECTION
// ============================

function MemoryClusterSection({ 
  cluster,
  selectedSpaceId,
  onSpaceSelect
}: {
  cluster: MemoryCluster
  selectedSpaceId?: string
  onSpaceSelect: (spaceId: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set())
  
  const toggleSpaceExpand = (spaceId: string) => {
    setExpandedSpaces(prev => {
      const next = new Set(prev)
      if (next.has(spaceId)) {
        next.delete(spaceId)
      } else {
        next.add(spaceId)
      }
      return next
    })
  }
  
  // Calculate cluster metrics
  const clusterMetrics = useMemo(() => {
    const totalGravity = cluster.spaces.reduce((sum, space) => 
      sum + (space.metrics?.gravity_score || 0), 0
    )
    const avgGravity = cluster.spaces.length > 0 ? totalGravity / cluster.spaces.length : 0
    
    const totalTokens = cluster.spaces.reduce((sum, space) => 
      sum + (space.metrics?.token_count || 0), 0
    )
    
    return { avgGravity, totalTokens }
  }, [cluster])
  
  return (
    <div className="mb-4">
      {/* Cluster Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
      >
        <ChevronRight className={cx(
          "w-4 h-4 text-gray-400 transition-transform",
          isExpanded && "rotate-90"
        )} />
        <Network className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-gray-200">{cluster.name}</span>
        <span className="text-xs text-gray-500">({cluster.spaces.length})</span>
        
        {/* Cluster Metrics */}
        <div className="ml-auto flex items-center gap-2">
          {clusterMetrics.avgGravity > 0.5 && (
            <div className="px-2 py-0.5 bg-purple-500/10 rounded-full">
              <span className="text-xs text-purple-400">
                ⚡ {(clusterMetrics.avgGravity * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </button>
      
      {/* Cluster Spaces */}
      {isExpanded && (
        <div className="mt-2 space-y-2 pl-6">
          {cluster.spaces.map(space => (
            <MemorySpaceCard
              key={space.id}
              space={space}
              isSelected={selectedSpaceId === space.id}
              onClick={() => onSpaceSelect(space.id)}
              onExpand={() => toggleSpaceExpand(space.id)}
              isExpanded={expandedSpaces.has(space.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================
// MAIN LEFT RAIL COMPONENT
// ============================

export function LongStriderLeftRail({
  onSpaceSelect,
  onCreateSpace,
  selectedSpaceId,
  className
}: {
  onSpaceSelect?: (spaceId: string) => void
  onCreateSpace?: () => void
  selectedSpaceId?: string
  className?: string
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<MemorySpace['status'] | 'all'>('all')
  const [showArchived, setShowArchived] = useState(false)

  // ============================
  // REAL DATA FROM STORES
  // ============================
  const { spaces: consciousnessSpaces, createSpace, updateSpace } = useConsciousnessStore()
  const { currentThreadId, setCurrentThread } = useLongStriderStore()

  // Handler for updating space (title, star, etc)
  const handleUpdateSpace = useCallback((spaceId: string, updates: { name?: string, starred?: boolean }) => {
    if (updates.name !== undefined) {
      updateSpace(spaceId, { name: updates.name })
    }
    if (updates.starred !== undefined) {
      updateSpace(spaceId, { is_favorite: updates.starred })
    }
  }, [updateSpace])

  // Convert consciousness store Spaces to LongStrider MemorySpaces
  const clusters = useMemo(() => {
    const allSpaces = Object.values(consciousnessSpaces)

    // Map to LongStrider format
    const mappedSpaces: MemorySpace[] = allSpaces.map(space => {
      // Determine status based on last activity
      const hoursSinceActivity = (Date.now() - space.last_activity_at) / (1000 * 60 * 60)
      let status: MemorySpace['status'] = 'cold'
      if (space.status === 'hibernated' || space.status === 'concluded') {
        status = 'archived'
      } else if (hoursSinceActivity < 1) {
        status = 'hot'
      } else if (hoursSinceActivity < 24) {
        status = 'warm'
      } else if (hoursSinceActivity < 168) {
        status = 'cool'
      }

      return {
        id: space.id,
        thread_id: space.id, // Use space ID as thread ID
        session_id: '', // Not tracked in consciousness store
        name: space.name,
        created: space.created_at,
        updated: space.updated_at,
        status,
        starred: space.is_favorite,
        pinned: space.is_anchored,
        metrics: {
          message_count: space.analytics.message_count,
          token_count: space.analytics.tokens_used,
          total_cost: space.analytics.estimated_cost,
          gravity_score: space.analytics.gravity_score,
          coherence: space.analytics.complexity_score
        },
        metadata: {
          domain_id: space.domain_id,
          type: space.type,
          signals: space.signals
        },
        child_ids: space.child_spaces
      }
    })

    // Group by status for clusters
    const clusterMap: Record<string, MemorySpace[]> = {
      hot: [],
      warm: [],
      cool: [],
      cold: [],
      archived: []
    }

    mappedSpaces.forEach(space => {
      clusterMap[space.status].push(space)
    })

    // Create clusters
    const result: MemoryCluster[] = []

    if (clusterMap.hot.length > 0) {
      result.push({
        id: 'cluster-hot',
        name: 'Active Now',
        spaces: clusterMap.hot.sort((a, b) => b.updated - a.updated)
      })
    }

    if (clusterMap.warm.length > 0) {
      result.push({
        id: 'cluster-warm',
        name: 'Recent',
        spaces: clusterMap.warm.sort((a, b) => b.updated - a.updated)
      })
    }

    if (clusterMap.cool.length > 0 || clusterMap.cold.length > 0) {
      result.push({
        id: 'cluster-cool',
        name: 'Older Memories',
        spaces: [...clusterMap.cool, ...clusterMap.cold].sort((a, b) => b.updated - a.updated)
      })
    }

    if (clusterMap.archived.length > 0) {
      result.push({
        id: 'cluster-archived',
        name: 'Archived',
        spaces: clusterMap.archived.sort((a, b) => b.updated - a.updated)
      })
    }

    return result
  }, [consciousnessSpaces])

  // Get current space for CurrentSessionCard
  const currentSpace = useMemo(() => {
    const allSpaces = Object.values(consciousnessSpaces)

    // DEBUG: Log what we have
    console.log('[LeftRail] consciousnessSpaces count:', allSpaces.length)
    console.log('[LeftRail] selectedSpaceId:', selectedSpaceId)
    console.log('[LeftRail] currentThreadId:', currentThreadId)

    const mappedSpaces = allSpaces.map(space => {
      const hoursSinceActivity = (Date.now() - space.last_activity_at) / (1000 * 60 * 60)
      let status: MemorySpace['status'] = 'cold'
      if (space.status === 'hibernated' || space.status === 'concluded') {
        status = 'archived'
      } else if (hoursSinceActivity < 1) {
        status = 'hot'
      } else if (hoursSinceActivity < 24) {
        status = 'warm'
      } else if (hoursSinceActivity < 168) {
        status = 'cool'
      }

      return {
        id: space.id,
        thread_id: space.id,
        session_id: '',
        name: space.name,
        created: space.created_at,
        updated: space.updated_at,
        status,
        starred: space.is_favorite,
        pinned: space.is_anchored,
        metrics: {
          message_count: space.analytics.message_count,
          token_count: space.analytics.tokens_used,
          total_cost: space.analytics.estimated_cost,
          gravity_score: space.analytics.gravity_score,
          coherence: space.analytics.complexity_score
        },
        metadata: {
          domain_id: space.domain_id,
          type: space.type,
          signals: space.signals,
          tags: [], // Placeholder for future tag system
          summary: space.analytics.emotional_signature?.dominant_emotion || ''
        },
        child_ids: space.child_spaces
      }
    })

    // Priority: selectedSpaceId > currentThreadId > most recent hot space
    if (selectedSpaceId) {
      const found = mappedSpaces.find(s => s.id === selectedSpaceId)
      console.log('[LeftRail] Found space by selectedSpaceId:', found?.name)
      return found || null
    }

    if (currentThreadId) {
      const found = mappedSpaces.find(s => s.id === currentThreadId)
      console.log('[LeftRail] Found space by currentThreadId:', found?.name)
      return found || null
    }

    const hotSpace = mappedSpaces.find(s => s.status === 'hot')
    console.log('[LeftRail] Fallback to hot space:', hotSpace?.name)
    return hotSpace || null
  }, [consciousnessSpaces, selectedSpaceId, currentThreadId])

  // Recent sessions (limit to 5)
  const recentSessions = useMemo(() => {
    const allSpaces = clusters.flatMap(c => c.spaces)
    return allSpaces
      .filter(s => s.status !== 'archived')
      .sort((a, b) => b.updated - a.updated)
      .slice(0, 5)
  }, [clusters])

  // Filter logic
  const filteredClusters = useMemo(() => {
    return clusters.map(cluster => ({
      ...cluster,
      spaces: cluster.spaces.filter(space => {
        // Status filter
        if (!showArchived && space.status === 'archived') return false
        if (filterStatus !== 'all' && space.status !== filterStatus) return false
        
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return (
            space.name.toLowerCase().includes(query) ||
            space.thread_id.includes(query) ||
            JSON.stringify(space.metadata || {}).toLowerCase().includes(query)
          )
        }
        
        return true
      })
    })).filter(cluster => cluster.spaces.length > 0)
  }, [clusters, filterStatus, searchQuery, showArchived])
  
  // Calculate totals
  const totals = useMemo(() => {
    let totalSpaces = 0
    let totalTokens = 0
    let totalCost = 0
    
    clusters.forEach(cluster => {
      cluster.spaces.forEach(space => {
        totalSpaces++
        totalTokens += space.metrics?.token_count || 0
        totalCost += space.metrics?.total_cost || 0
      })
    })
    
    return { totalSpaces, totalTokens, totalCost }
  }, [clusters])
  
  return (
    <div className={cx(
      "flex flex-col h-full bg-gradient-to-b from-gray-900/95 to-black/95",
      "border-r border-white/10",
      className
    )}>
      {/* Header - Clean & Minimal */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-100">LongStrider</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onCreateSpace}
              className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 transition-all duration-200 hover:scale-105"
              title="Create New Space"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/living-memory')}
              className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 text-xs font-medium flex items-center gap-1.5"
              title="Open Living Memory"
            >
              <Target className="w-3.5 h-3.5" />
              Memory
            </button>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Current Session Card */}
        <CurrentSessionCard
          space={currentSpace}
          onNavigateToMemory={() => router.push('/living-memory')}
          onUpdateSpace={handleUpdateSpace}
        />

        {/* Recent Sessions - Dimmed */}
        {recentSessions.length > 0 && (
          <div className="px-4 mt-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Recent Sessions
              </h3>
              <button
                onClick={() => router.push('/living-memory')}
                className="text-[10px] text-gray-500 hover:text-indigo-400 transition-colors"
              >
                View All →
              </button>
            </div>
            <div className="space-y-1.5">
              {recentSessions.map((space) => (
                <button
                  key={space.id}
                  onClick={() => onSpaceSelect?.(space.id)}
                  className={cx(
                    "w-full text-left p-2 rounded-lg transition-all duration-200",
                    selectedSpaceId === space.id
                      ? "bg-indigo-500/15 border border-indigo-500/30"
                      : "bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-400 truncate">
                          {space.name}
                        </span>
                        {space.starred && <Star className="w-2.5 h-2.5 text-yellow-500/70 fill-current flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-600 mt-0.5">
                        <span>{new Date(space.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span>{space.metrics?.message_count || 0} msgs</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LongStriderLeftRail