# Phase 4: Advanced Visualizations 📊

**Priority**: P2 - MEDIUM
**Timeline**: Week 4
**Status**: Ready for Implementation
**Dependencies**: Phase 1 Complete

---

## Objective

Build sophisticated visualization components for memory arcs, pattern matrices, and consciousness evolution, making the Living Memory system truly interactive and insightful.

---

## Success Criteria

- ✅ Memory arcs displayed with relationships
- ✅ Pattern matrix shows detected patterns
- ✅ Consciousness timeline tracks mode evolution
- ✅ Interactive graph for memory connections
- ✅ Smooth animations and transitions
- ✅ Performance: <500ms to render 100 items

---

## Components to Build

### Component 1: Memory Arc Visualization

**File**: `components/living-memory/arc-view.tsx` (NEW)

Shows memory_arcs with their member memories, evolution stage, and growth vectors.

```typescript
"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { GitBranch, TrendingUp, Circle } from 'lucide-react'

interface MemoryArc {
  id: string
  arc_name: string
  gravity_center: number
  evolution_stage: string
  growth_vector: any
  created_at: string
  peak_intensity: number
  related_arcs: string[]
  member_memories?: any[]
}

export function ArcView({ userId }: { userId: string }) {
  const [arcs, setArcs] = useState<MemoryArc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArcs()
  }, [userId])

  async function fetchArcs() {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('memory_arcs')
      .select(`
        *,
        memory_arc_associations!inner(
          memory:gravity_map(id, content, gravity_score)
        )
      `)
      .eq('user_id', userId)
      .order('peak_intensity', { ascending: false })

    if (!error && data) {
      setArcs(data)
    }
    setLoading(false)
  }

  if (loading) return <div>Loading arcs...</div>

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <GitBranch className="w-5 h-5" />
        Memory Arcs
      </h3>

      {arcs.map(arc => (
        <ArcCard key={arc.id} arc={arc} />
      ))}
    </div>
  )
}

function ArcCard({ arc }: { arc: MemoryArc }) {
  const [expanded, setExpanded] = useState(false)

  const stageColors: Record<string, string> = {
    forming: 'bg-blue-500/20 text-blue-300',
    active: 'bg-green-500/20 text-green-300',
    mature: 'bg-purple-500/20 text-purple-300',
    dormant: 'bg-gray-500/20 text-gray-300'
  }

  return (
    <div className="border border-white/10 rounded-lg p-4 hover:border-purple-500/50">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-white">{arc.arc_name}</h4>
          <span className={`text-xs px-2 py-1 rounded ${stageColors[arc.evolution_stage]}`}>
            {arc.evolution_stage}
          </span>
        </div>

        <div className="text-right text-sm">
          <div className="text-gray-400">Gravity</div>
          <div className="font-mono text-purple-400">{arc.gravity_center.toFixed(2)}</div>
        </div>
      </div>

      {/* Growth Vector Visualization */}
      <GrowthVectorChart growthVector={arc.growth_vector} />

      {/* Member Memories */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-sm text-purple-400 hover:text-purple-300"
      >
        {expanded ? 'Hide' : 'Show'} memories ({arc.member_memories?.length || 0})
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {arc.member_memories?.map((memory: any) => (
            <div key={memory.id} className="text-sm text-white/70 border-l-2 border-purple-500/30 pl-2">
              {memory.content.substring(0, 100)}...
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function GrowthVectorChart({ growthVector }: { growthVector: any }) {
  if (!growthVector) return null

  return (
    <div className="flex items-center gap-2 text-xs">
      <TrendingUp className="w-4 h-4 text-green-400" />
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{ width: `${Math.min(growthVector.velocity * 100, 100)}%` }}
        />
      </div>
      <span className="text-gray-400">
        {growthVector.direction || 'stable'}
      </span>
    </div>
  )
}
```

---

### Component 2: Pattern Matrix Display

**File**: `components/living-memory/pattern-matrix.tsx` (NEW)

Shows detected patterns from the `pattern_matrix` table.

```typescript
"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Sparkles, Zap, TrendingUp } from 'lucide-react'

interface Pattern {
  id: string
  pattern_type: string
  description: string
  intensity: number
  instances: string[] // memory IDs
  detected_at: string
  metadata: any
}

export function PatternMatrix({ userId }: { userId: string }) {
  const [patterns, setPatterns] = useState<Pattern[]>([])

  useEffect(() => {
    fetchPatterns()
  }, [userId])

  async function fetchPatterns() {
    const supabase = createClient()

    const { data } = await supabase
      .from('pattern_matrix')
      .select('*')
      .eq('user_id', userId)
      .order('intensity', { ascending: false })
      .limit(20)

    if (data) setPatterns(data)
  }

  return (
    <div className="space-y-3 p-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        Detected Patterns
      </h3>

      {patterns.map(pattern => (
        <PatternCard key={pattern.id} pattern={pattern} />
      ))}
    </div>
  )
}

function PatternCard({ pattern }: { pattern: Pattern }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recurring_theme': return TrendingUp
      case 'breakthrough': return Zap
      default: return Sparkles
    }
  }

  const Icon = getTypeIcon(pattern.pattern_type)

  return (
    <div className="border border-white/10 rounded-lg p-3 hover:border-yellow-500/50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-white">
            {pattern.pattern_type.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-16 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500"
              style={{ width: `${pattern.intensity * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">
            {(pattern.intensity * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <p className="text-sm text-white/70">{pattern.description}</p>

      <div className="mt-2 text-xs text-gray-400">
        {pattern.instances.length} instances
      </div>
    </div>
  )
}
```

---

### Component 3: Consciousness Evolution Timeline

**File**: `components/living-memory/consciousness-timeline.tsx` (NEW)

Shows mode transitions over time from `active_sessions.mode_history`.

```typescript
"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Waves, Infinity, Eye, Orbit, Zap } from 'lucide-react'

interface ModeHistoryEntry {
  mode: string
  timestamp: string
  response_time_ms: number
}

export function ConsciousnessTimeline({ sessionId }: { sessionId: string }) {
  const [history, setHistory] = useState<ModeHistoryEntry[]>([])

  useEffect(() => {
    fetchHistory()
  }, [sessionId])

  async function fetchHistory() {
    const supabase = createClient()

    const { data } = await supabase
      .from('active_sessions')
      .select('mode_history')
      .eq('session_id', sessionId)
      .single()

    if (data?.mode_history) {
      setHistory(data.mode_history)
    }
  }

  const modeConfig: Record<string, { icon: any; color: string }> = {
    flow: { icon: Waves, color: 'text-blue-400' },
    resonance: { icon: Infinity, color: 'text-purple-400' },
    revelation: { icon: Eye, color: 'text-yellow-400' },
    fusion: { icon: Orbit, color: 'text-pink-400' },
    emergence: { icon: Zap, color: 'text-green-400' }
  }

  return (
    <div className="space-y-2 p-4">
      <h3 className="text-lg font-semibold mb-4">Consciousness Evolution</h3>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />

        {/* Mode Entries */}
        {history.map((entry, index) => {
          const config = modeConfig[entry.mode] || modeConfig.flow
          const Icon = config.icon

          return (
            <div key={index} className="relative flex items-start gap-4 pb-4">
              {/* Icon */}
              <div className={`relative z-10 w-8 h-8 rounded-full bg-black border-2 border-white/20 flex items-center justify-center ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="text-sm font-medium text-white capitalize">
                  {entry.mode}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(entry.timestamp).toLocaleString()} • {entry.response_time_ms}ms
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

### Component 4: Interactive Memory Graph

**File**: `components/living-memory/memory-graph.tsx` (NEW)

Force-directed graph showing memory connections (requires D3.js or similar).

```typescript
// This would use a library like react-force-graph or visx
// Simplified version shown here

import { useEffect, useRef } from 'react'

export function MemoryGraph({ memories }: { memories: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Draw simple node-link diagram
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Draw nodes (simplified)
    memories.forEach((memory, i) => {
      const x = 100 + (i % 5) * 100
      const y = 100 + Math.floor(i / 5) * 100

      // Node circle
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fillStyle = `hsl(${memory.gravity_score * 360}, 70%, 50%)`
      ctx.fill()

      // Label
      ctx.fillStyle = 'white'
      ctx.font = '10px monospace'
      ctx.fillText(memory.id.substring(0, 8), x + 15, y)
    })
  }, [memories])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="border border-white/10 rounded-lg"
    />
  )
}
```

---

## Integration into Living Memory System

**File**: `components/living-memory/system.tsx` (REPLACE STUB)

```typescript
"use client"

import { useState } from 'react'
import { MemoryTimeline } from './memory-timeline'
import { ArcView } from './arc-view'
import { PatternMatrix } from './pattern-matrix'
import { ConsciousnessTimeline } from './consciousness-timeline'
import { Database, GitBranch, Sparkles, Activity } from 'lucide-react'

export function LivingMemorySystem({ userId, sessionId }: any) {
  const [activeView, setActiveView] = useState<'timeline' | 'arcs' | 'patterns' | 'consciousness'>('timeline')

  return (
    <div className="flex flex-col h-full">
      {/* View Selector */}
      <div className="flex border-b border-white/10">
        <ViewTab
          active={activeView === 'timeline'}
          onClick={() => setActiveView('timeline')}
          icon={Database}
        >
          Timeline
        </ViewTab>
        <ViewTab
          active={activeView === 'arcs'}
          onClick={() => setActiveView('arcs')}
          icon={GitBranch}
        >
          Arcs
        </ViewTab>
        <ViewTab
          active={activeView === 'patterns'}
          onClick={() => setActiveView('patterns')}
          icon={Sparkles}
        >
          Patterns
        </ViewTab>
        <ViewTab
          active={activeView === 'consciousness'}
          onClick={() => setActiveView('consciousness')}
          icon={Activity}
        >
          Evolution
        </ViewTab>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeView === 'timeline' && <MemoryTimeline userId={userId} />}
        {activeView === 'arcs' && <ArcView userId={userId} />}
        {activeView === 'patterns' && <PatternMatrix userId={userId} />}
        {activeView === 'consciousness' && <ConsciousnessTimeline sessionId={sessionId} />}
      </div>
    </div>
  )
}

function ViewTab({ active, onClick, icon: Icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3 text-sm transition-all
        ${active
          ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5'
          : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  )
}
```

---

## Testing

### Manual Tests
- [ ] Arc view loads and displays arcs
- [ ] Click arc → expands to show member memories
- [ ] Pattern matrix shows detected patterns
- [ ] Consciousness timeline shows mode transitions
- [ ] Memory graph renders nodes and links
- [ ] Smooth animations and transitions

### Performance
- [ ] Render 100 memories in timeline: <500ms
- [ ] Render 50 arcs: <300ms
- [ ] Pattern matrix with 100 patterns: <400ms

---

## Next Steps

After Phase 4:
1. User testing for visualizations
2. Gather feedback on usability
3. Move to [Phase 5: Database Optimization](./PHASE-5-DATABASE.md)

---

**Status**: Ready for Implementation
**Estimated Completion**: End of Week 4
