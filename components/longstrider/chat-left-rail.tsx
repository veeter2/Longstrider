"use client"

import React, { useState, useCallback, useMemo, useEffect } from 'react'
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
  Shield
} from 'lucide-react'

import type { MemorySpace, MemoryCluster } from '@/types/longstrider'
import { useConsciousnessStore } from '@/stores/consciousness-store'
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
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<MemorySpace['status'] | 'all'>('all')
  const [showArchived, setShowArchived] = useState(false)

  // ============================
  // REAL DATA FROM STORES
  // ============================
  const { spaces: consciousnessSpaces, createSpace } = useConsciousnessStore()
  const { currentThreadId, setCurrentThread } = useLongStriderStore()

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
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-100">Memory Spaces</h2>
          </div>
          <button
            onClick={onCreateSpace}
            className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 transition-colors"
            title="Create New Space"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spaces..."
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-100 placeholder:text-gray-500 focus:border-indigo-500/50 focus:outline-none transition-colors"
          />
        </div>
        
        {/* Filters */}
        <div className="mt-3 flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300 focus:border-indigo-500/50 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cool">Cool</option>
            <option value="cold">Cold</option>
          </select>
          
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={cx(
              "px-2 py-1 rounded text-xs transition-colors",
              showArchived 
                ? "bg-gray-500/20 text-gray-300" 
                : "bg-white/5 text-gray-500 hover:text-gray-300"
            )}
          >
            {showArchived ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span className="ml-1">Archived</span>
          </button>
        </div>
        
        {/* Totals */}
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span>{totals.totalSpaces} spaces</span>
          <span>•</span>
          <span>{(totals.totalTokens / 1000).toFixed(1)}k tokens</span>
          <span>•</span>
          <span>${totals.totalCost.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredClusters.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No memory spaces found</p>
          </div>
        ) : (
          filteredClusters.map(cluster => (
            <MemoryClusterSection
              key={cluster.id}
              cluster={cluster}
              selectedSpaceId={selectedSpaceId}
              onSpaceSelect={(id) => onSpaceSelect?.(id)}
            />
          ))
        )}
      </div>
      
      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10">
        <button className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-center gap-2">
          <Archive className="w-4 h-4" />
          Manage Archives
        </button>
      </div>
    </div>
  )
}

export default LongStriderLeftRail