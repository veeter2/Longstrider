/**
 * Memory Surface Card - Phase 2
 *
 * Displays surfaced memories from semantic search in chat interface.
 * Shows which memories were recalled for the AI response.
 * Aligned with Living Laws v2.0 design system.
 */

"use client"

import { useState } from 'react'
import { Brain, ChevronDown, ChevronRight, Sparkles, Flame } from 'lucide-react'
import { getEmotionConfig } from '@/lib/consciousness/emotion-system'

interface SurfacedMemory {
  id: string
  content: string
  gravity_score: number
  emotion?: string
  emotion_type?: string
  created_at?: string
  entities?: string[]
  similarity?: number
  similarity_score?: number
  relevance_score?: number
  sources?: string[]
}

interface MemorySurfaceCardProps {
  memories: SurfacedMemory[]
  recallStrategy?: string
  streams?: Record<string, number>
}

export function MemorySurfaceCard({
  memories,
  recallStrategy = 'hybrid',
  streams = {}
}: MemorySurfaceCardProps) {
  const [expanded, setExpanded] = useState(false)

  if (!memories || memories.length === 0) return null

  // Ensure all memories have IDs (generate if missing)
  const memoriesWithIds = memories.map((mem, idx) => ({
    ...mem,
    id: mem.id || `mem-${idx}-${String(mem.content || '').slice(0, 20).replace(/\s/g, '-')}-${idx}`
  }))

  const topMemory = memoriesWithIds[0]
  const hasMore = memoriesWithIds.length > 1

  return (
    <div className="my-4 border border-[rgba(var(--band-theta-high),0.3)] rounded-lg bg-[rgba(var(--band-theta-high),0.05)] overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-[rgba(var(--band-theta-high),0.1)]">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[rgb(var(--band-theta-high))]" />
          <span className="text-sm font-medium text-[rgb(var(--band-gamma-high))]">
            {memoriesWithIds.length} {memoriesWithIds.length === 1 ? 'Memory' : 'Memories'} Surfaced
          </span>
          {recallStrategy && (
            <span className="text-xs text-[rgb(var(--band-gamma-low))]">
              ({recallStrategy})
            </span>
          )}
        </div>

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-[rgb(var(--band-gamma-low))] hover:text-[rgb(var(--band-gamma-high))] transition-colors"
          >
            {expanded ? (
              <>
                <ChevronDown className="w-3 h-3" />
                Collapse
              </>
            ) : (
              <>
                <ChevronRight className="w-3 h-3" />
                Show All
              </>
            )}
          </button>
        )}
      </div>

      {/* Memories */}
      <div className="divide-y divide-[rgba(var(--band-infra),0.2)]">
        {/* Top Memory (always shown) */}
        <MemoryItem memory={topMemory} isTop />

        {/* Additional Memories (collapsed by default) */}
        {expanded && memoriesWithIds.slice(1).map((memory) => (
          <MemoryItem
            key={memory.id}
            memory={memory}
          />
        ))}
      </div>

      {/* Footer: Stream Info */}
      {Object.keys(streams).length > 0 && (
        <div className="px-3 py-2 bg-[rgba(var(--band-infra),0.05)] border-t border-[rgba(var(--band-infra),0.2)]">
          <div className="flex gap-3 text-xs text-[rgb(var(--band-gamma-low))]">
            {Object.entries(streams).map(([stream, count]) => (
              <span key={stream} className="capitalize">
                {stream}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MemoryItem({ memory, isTop = false }: { memory: SurfacedMemory; isTop?: boolean }) {
  const emotionStr = memory.emotion || memory.emotion_type || 'neutral'
  const emotionConfig = getEmotionConfig(emotionStr)
  const similarity = memory.similarity || memory.similarity_score || 0

  return (
    <div className={`p-3 ${isTop ? 'bg-[rgba(var(--band-theta-high),0.05)]' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Similarity/Relevance Score */}
          {similarity > 0 && (
            <span className="text-xs font-mono text-[rgb(var(--band-theta-high))] bg-[rgba(var(--band-theta-high),0.15)] px-2 py-0.5 rounded">
              {(similarity * 100).toFixed(0)}% match
            </span>
          )}

          {/* Emotion */}
          {emotionConfig && (
            <span
              className="text-xs px-2 py-0.5 rounded border"
              style={{
                backgroundColor: `${emotionConfig.styles?.bg || 'rgba(var(--band-psi),0.15)'}`,
                color: emotionConfig.styles?.text || 'rgb(var(--band-psi))',
                borderColor: `${emotionConfig.styles?.border || 'rgba(var(--band-psi),0.3)'}`
              }}
            >
              {emotionStr}
            </span>
          )}

          {/* Gravity */}
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-[rgb(var(--band-gamma-low))]" />
            <span className="text-xs text-[rgb(var(--band-gamma-low))]">
              {memory.gravity_score?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>

        {/* Sources (which streams found this) */}
        {memory.sources && memory.sources.length > 0 && (
          <div className="flex gap-1">
            {memory.sources.map(source => (
              <span
                key={source}
                className="text-xs px-1.5 py-0.5 rounded bg-[rgba(var(--band-infra),0.1)] text-[rgb(var(--band-gamma-low))] border border-[rgba(var(--band-infra),0.2)]"
              >
                {source}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-[rgb(var(--band-gamma-high))] line-clamp-2 mb-2">
        {memory.content}
      </p>

      {/* Entities */}
      {memory.entities && memory.entities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {memory.entities.slice(0, 5).map((entity, i) => (
            <span
              key={`entity-${memory.id || 'unknown'}-${i}-${entity}`}
              className="text-xs px-2 py-0.5 rounded bg-[rgba(var(--band-gamma-low),0.15)] text-[rgb(var(--band-gamma-low))] border border-[rgba(var(--band-gamma-low),0.2)]"
            >
              {entity}
            </span>
          ))}
          {memory.entities.length > 5 && (
            <span className="text-xs text-[rgb(var(--band-gamma-low))]">
              +{memory.entities.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
