/**
 * Memory Timeline Component - Phase 1
 * 
 * Displays memories from gravity_map in real-time with filters.
 * Aligned with Living Laws v2.0 design system.
 */

"use client"

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseClient, getIvyConfig } from '@/lib/supabase'
import { Clock, Brain, Flame, Crown } from 'lucide-react'
import { getEmotionConfig } from '@/lib/consciousness/emotion-system'
import type { LucideIcon } from 'lucide-react'

// Memory interface matching gravity_map schema
interface Memory {
  id: string
  content: string
  gravity_score: number
  emotion: string  // Note: schema uses 'emotion', not 'emotion_type'
  created_at: string
  memory_trace_id: string
  thread_id?: string | null
  entities: string[] | null  // JSONB from DB, might be array or null
  identity_anchor: boolean
  type: string
  metadata: any
  statement_type?: string
}

interface MemoryTimelineProps {
  userId: string
  threadId?: string
  limit?: number
  showFilters?: boolean
}

export function MemoryTimeline({
  userId,
  threadId,
  limit = 50,
  showFilters = true
}: MemoryTimelineProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'high-gravity' | 'identity'>('all')
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch memories from Supabase - fixed dependency array
  const fetchMemories = useCallback(async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    try {
      setIsRefreshing(true)
      setError(null)

      let query = supabase
        .from('gravity_map')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      // Filter by thread if specified
      if (threadId) {
        query = query.eq('thread_id', threadId)
      }

      // Apply additional filters
      if (filter === 'high-gravity') {
        query = query.gte('gravity_score', 0.7)
      } else if (filter === 'identity') {
        query = query.eq('identity_anchor', true)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      // Parse entities safely (JSONB might be string, array, or null)
      const parsedMemories = (data || []).map((m: any) => ({
        ...m,
        entities: Array.isArray(m.entities)
          ? m.entities
          : typeof m.entities === 'string'
            ? JSON.parse(m.entities)
            : []
      }))

      setMemories(parsedMemories)
    } catch (err: any) {
      console.error('[MemoryTimeline] Fetch error:', err)
      setError(err.message || 'Failed to load memories')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [userId, threadId, limit, filter]) // Fixed: direct dependencies, not callback

  // Initial fetch - using stable dependencies
  useEffect(() => {
    fetchMemories()
  }, [fetchMemories])

  // Subscribe to real-time memory creation events
  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase || !userId) return

    // Unique channel name per user (matches cognition_intake broadcast)
    const channelName = `memory_events:${userId}`
    const channel = supabase.channel(channelName)

    const subscription = channel
      .on('broadcast', { event: 'memory_created' }, (payload) => {
        console.log('📡 New memory received:', payload)

        // Only add if it matches our filters
        if (payload.payload?.user_id === userId) {
          // If thread filter is active, only add matching thread
          if (threadId && payload.payload.thread_id !== threadId) {
            return
          }

          // Refresh to get full memory data (optimistic update would be Phase 2)
          fetchMemories()
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [userId, threadId, fetchMemories])

  if (loading && memories.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--band-theta-high))]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-[rgba(var(--band-beta-high),0.1)] border border-[rgba(var(--band-beta-high),0.2)] rounded-lg">
        <p className="text-[rgb(var(--band-beta-high))] text-sm">Error loading memories: {error}</p>
        <button 
          onClick={fetchMemories} 
          className="mt-2 text-xs underline text-[rgb(var(--band-gamma-low))] hover:text-[rgb(var(--band-gamma-high))]"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters - Living Laws design */}
      {showFilters && (
        <div className="flex gap-2 p-3 border-b border-[rgba(var(--band-infra),0.2)]">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All
          </FilterButton>
          <FilterButton
            active={filter === 'high-gravity'}
            onClick={() => setFilter('high-gravity')}
          >
            <Flame className="w-3 h-3" />
            High Gravity
          </FilterButton>
          <FilterButton
            active={filter === 'identity'}
            onClick={() => setFilter('identity')}
          >
            <Crown className="w-3 h-3" />
            Identity
          </FilterButton>
        </div>
      )}

      {/* Memory List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isRefreshing && memories.length > 0 && (
          <div className="text-center text-[rgb(var(--band-gamma-low))] text-xs py-2">
            Refreshing...
          </div>
        )}
        {memories.length === 0 ? (
          <div className="text-center text-[rgb(var(--band-gamma-low))] py-8">
            <Brain className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No memories yet</p>
          </div>
        ) : (
          memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))
        )}
      </div>
    </div>
  )
}

function MemoryCard({ memory }: { memory: Memory }) {
  const emotionConfig = getEmotionConfig(memory.emotion)
  const EmotionIcon = emotionConfig?.icon || Brain

  return (
    <div className="group border border-[rgba(var(--band-infra),0.2)] rounded-lg p-3 hover:border-[rgba(var(--band-theta-high),0.5)] transition-all hover:shadow-lg hover:shadow-[rgba(var(--band-theta-high),0.1)] bg-[rgba(var(--band-infra),0.05)] backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {/* Timestamp */}
          <span className="text-xs text-[rgb(var(--band-gamma-low))] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(memory.created_at).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>

          {/* Emotion Badge - Living Laws colors */}
          <span
            className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 border"
            style={{
              backgroundColor: `${emotionConfig?.styles?.bg || 'rgba(var(--band-psi),0.15)'}`,
              color: emotionConfig?.styles?.text || 'rgb(var(--band-psi))',
              borderColor: `${emotionConfig?.styles?.border || 'rgba(var(--band-psi),0.3)'}`
            }}
          >
            <EmotionIcon className="w-3 h-3" />
            {memory.emotion || 'neutral'}
          </span>

          {/* Identity Anchor Badge */}
          {memory.identity_anchor && (
            <Crown className="w-3 h-3 text-[rgb(var(--band-xi))]" title="Identity Anchor" />
          )}
        </div>

        {/* Gravity Score */}
        <GravityIndicator score={memory.gravity_score} />
      </div>

      {/* Content */}
      <p className="text-sm text-[rgb(var(--band-gamma-high))] mb-2 line-clamp-3">
        {memory.content}
      </p>

      {/* Footer: Entities & Type */}
      <div className="flex items-center justify-between gap-2">
        {/* Entities */}
        {memory.entities && memory.entities.length > 0 && (
          <div className="flex flex-wrap gap-1 flex-1">
            {memory.entities.slice(0, 3).map((entity, i) => (
              <span
                key={i}
                className="text-xs bg-[rgba(var(--band-gamma-low),0.15)] text-[rgb(var(--band-gamma-low))] border border-[rgba(var(--band-gamma-low),0.2)] px-2 py-0.5 rounded"
              >
                {entity}
              </span>
            ))}
            {memory.entities.length > 3 && (
              <span className="text-xs text-[rgb(var(--band-gamma-low))]">
                +{memory.entities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Memory Type */}
        <span className="text-xs text-[rgb(var(--band-gamma-low))] flex items-center gap-1">
          {memory.type}
        </span>
      </div>
    </div>
  )
}

function GravityIndicator({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 0.8) return 'text-[rgb(var(--band-beta-high))] bg-[rgba(var(--band-beta-high),0.2)]'
    if (score >= 0.6) return 'text-[rgb(var(--band-xi))] bg-[rgba(var(--band-xi),0.2)]'
    if (score >= 0.4) return 'text-[rgb(var(--band-theta-high))] bg-[rgba(var(--band-theta-high),0.2)]'
    return 'text-[rgb(var(--band-gamma-low))] bg-[rgba(var(--band-gamma-low),0.2)]'
  }

  return (
    <div className={`text-xs font-mono px-2 py-0.5 rounded border ${getColor()}`}>
      {score.toFixed(2)}
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1 px-3 py-1.5 rounded text-xs transition-all border
        ${active
          ? 'bg-[rgb(var(--band-gamma-low))] text-[rgb(var(--band-infra))] shadow-lg shadow-[rgba(var(--band-gamma-low),0.2)] border-[rgba(var(--band-gamma-low),0.3)]'
          : 'bg-[rgba(var(--band-infra),0.1)] text-[rgb(var(--band-gamma-low))] hover:bg-[rgba(var(--band-infra),0.2)] border-[rgba(var(--band-infra),0.2)]'
        }
      `}
    >
      {children}
    </button>
  )
}

