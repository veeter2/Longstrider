# Phase 1: Core Bidirectional Flow ⚡

**Priority**: P0 - CRITICAL
**Timeline**: Week 1
**Status**: Ready for Implementation
**Dependencies**: None

---

## Objective

Establish the essential bidirectional connection between chat messages and living memory. Every message sent in chat should immediately appear in the memory timeline, and messages should track their corresponding memory IDs.

---

## Success Criteria

- ✅ Every chat message has a `memory_id` linking to `gravity_map.id`
- ✅ New memories appear in timeline within 2 seconds of creation
- ✅ Left rail displays functional memory timeline
- ✅ Timeline updates in real-time via Supabase Realtime
- ✅ Memory cards show gravity, emotion, entities, timestamp

---

## Tasks

### Task 1.1: Enhance Memory Storage with Realtime Events

**File**: `supabase/functions/cognition_intake/index.ts`
**Lines**: After line 638 (after dispatcher success)
**Estimated Time**: 1 hour

#### Current State
```typescript
// Line ~638: Dispatcher call succeeds
const dispatcherResult = await dispatcherResponse.json();

// Currently just returns response, no realtime notification
return new Response(JSON.stringify({
  success: true,
  status: "Memory processed through dispatcher v1.2",
  primary: dispatcherResult.primary,
  // ...
}), { ... });
```

#### Required Changes
```typescript
// After dispatcher succeeds (line ~638), ADD:
if (dispatcherResult.primary?.id) {
  // Emit Supabase Realtime broadcast for immediate UI updates
  try {
    await supabase
      .channel('memory_events')
      .send({
        type: 'broadcast',
        event: 'memory_created',
        payload: {
          memory_id: dispatcherResult.primary.id,
          user_id: memory.user_id,
          session_id: memory.session_id,
          thread_id: memory.thread_id,
          memory_trace_id: memory.memory_trace_id,
          gravity_score: dispatcherResult.primary.gravity_score || memory.gravity_score,
          emotion: memory.emotion,
          content_preview: memory.content.substring(0, 100),
          entities: memory.entities,
          created_at: new Date().toISOString(),
          type: memory.type
        }
      });

    console.log('📡 Realtime event broadcast for memory:', dispatcherResult.primary.id);
  } catch (realtimeError) {
    // Non-critical - don't block response
    console.error('[Realtime] Broadcast failed:', realtimeError);
  }
}

// THEN return the existing response (add memory_id to response)
return new Response(JSON.stringify({
  success: true,
  status: "Memory processed through dispatcher v1.2",
  memory_id: dispatcherResult.primary?.id, // ADD THIS
  primary: dispatcherResult.primary,
  // ... rest of response
}), { ... });
```

#### Testing
```bash
# Test that memory_created event is broadcast
curl -X POST http://localhost:54321/functions/v1/cognition_intake \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","content":"Test message"}'

# Check Supabase logs for "Realtime event broadcast"
```

---

### Task 1.2: Add Memory ID Tracking to Chat Store

**File**: `stores/longstrider-store.ts`
**Lines**: Interface definition ~5, addMessage action ~123
**Estimated Time**: 30 minutes

#### Current State
```typescript
// Line ~5: LSMessage type (imported from @/types/longstrider)
// Currently no memory_id field tracked

// Line ~123: addMessage action
addMessage: (threadId, message) => {
  set((state) => {
    const threadMessages = state.messagesByThread[threadId] || []
    return {
      messagesByThread: {
        ...state.messagesByThread,
        [threadId]: [...threadMessages, message]
      },
      firstMessageTimestamp: state.firstMessageTimestamp || Date.now()
    }
  })
}
```

#### Required Changes

**Step 1**: Update the LSMessage type in `types/longstrider.ts`:
```typescript
// File: types/longstrider.ts
export interface LSMessage {
  id: string
  type: 'user' | 'assistant' | 'system' | 'memory'
  kind?: 'text' | 'autonomous' | 'memory' | 'state' | 'visual' | 'audio' | 'attachment'
  content: string
  timestamp: Date

  // Existing fields
  user_id?: string
  session_id?: string
  thread_id?: string
  memory_trace_id?: string
  conversation_name?: string

  // NEW: Link to gravity_map
  memory_id?: string  // ← ADD THIS

  // ... rest of existing fields
  metadata?: any
  gravity_score?: number
  emotion?: string
  // etc.
}
```

**Step 2**: Update addMessage to accept memory_id:
```typescript
// File: stores/longstrider-store.ts

// Update the action signature
addMessage: (threadId: string, message: LSMessage, memoryId?: string) => void

// Update implementation
addMessage: (threadId, message, memoryId) => {
  set((state) => {
    const threadMessages = state.messagesByThread[threadId] || []

    // Attach memory_id if provided
    const messageWithMemory = memoryId
      ? { ...message, memory_id: memoryId }
      : message

    return {
      messagesByThread: {
        ...state.messagesByThread,
        [threadId]: [...threadMessages, messageWithMemory]
      },
      firstMessageTimestamp: state.firstMessageTimestamp || Date.now()
    }
  })
}
```

#### Testing
```typescript
// In browser console:
const store = useLongStriderStore.getState()
store.addMessage('test-thread', {
  id: 'msg-1',
  type: 'user',
  content: 'Test',
  timestamp: new Date()
}, 'memory-123')

// Verify message has memory_id
console.log(store.messagesByThread['test-thread'][0].memory_id) // Should be 'memory-123'
```

---

### Task 1.3: Update Chat Center to Store Memory IDs

**File**: `components/longstrider/chat-center.tsx`
**Lines**: SSE event handling ~980-1430, specifically `response_complete` handler
**Estimated Time**: 1 hour

#### Current State
```typescript
// Around line 1300: response_complete event handler
case 'response_complete':
  console.log('✅ Response complete', data)

  // Currently stores metadata but NOT memory_id
  updateMessage(currentThreadId, streamingMessageId, {
    metadata: {
      ...data.metadata,
      memory_count: data.memory_count,
      pattern_count: data.pattern_count,
      // ... other metadata
    }
  })
  break
```

#### Required Changes
```typescript
case 'response_complete':
  console.log('✅ Response complete', data)

  // Extract memory_id from response
  const memoryId = data.memory_id || data.metadata?.memory_id || data.primary?.id

  // Update the assistant message with memory_id and full metadata
  updateMessage(currentThreadId, streamingMessageId, {
    memory_id: memoryId, // ← ADD THIS
    metadata: {
      ...data.metadata,
      memory_id: memoryId, // Also store in metadata for redundancy
      memory_count: data.memory_count,
      pattern_count: data.pattern_count,
      gravity_score: data.gravity || data.gravity_score,
      emotion: data.emotion,
      consciousness_mode: data.consciousness_mode || data.mode,
      processing_time_ms: data.processing_time_ms,
      // Include memory constellation if available
      memory_constellation: data.memoryConstellation,
      memory_samples: data.memory_samples
    }
  })

  // If memory_id exists, log success
  if (memoryId) {
    console.log('🔗 Message linked to memory:', memoryId)
  } else {
    console.warn('⚠️ No memory_id in response_complete event')
  }
  break
```

#### Also Update User Message Storage
```typescript
// Around line 400-500: When user sends message
const handleSendMessage = async () => {
  // ... existing code to create user message

  const userMessage: LSMessage = {
    id: messageId,
    type: 'user',
    content: inputText,
    timestamp: new Date(),
    user_id: userId,
    session_id: sessionId,
    thread_id: threadId,
    memory_trace_id: memoryTraceId,
    // memory_id will be added when we receive response from cognition_intake
  }

  // Add to store immediately (without memory_id)
  addMessage(threadId, userMessage)

  // Send to backend
  const response = await sendMessageToCCEO({ ... })

  // AFTER receiving response from cognition_intake, update with memory_id
  // This might come through a different event or in the initial response
  // We'll handle this in the SSE stream when cognition_intake returns
}
```

#### Add Handler for User Message Memory ID
```typescript
// Add new SSE event handler for user message storage confirmation
case 'user_message_stored':
  // This event should be sent by cognition_intake after storing user message
  if (data.memory_id && data.message_id) {
    updateMessage(currentThreadId, data.message_id, {
      memory_id: data.memory_id
    })
    console.log('🔗 User message linked to memory:', data.memory_id)
  }
  break
```

#### Testing
1. Send a chat message
2. Open browser DevTools → Network → Filter SSE
3. Verify `response_complete` event includes `memory_id`
4. Check Redux/Zustand store: message should have `memory_id` field
5. Verify console logs show "Message linked to memory"

---

### Task 1.4: Build Memory Timeline Component

**File**: `components/living-memory/memory-timeline.tsx` (NEW FILE)
**Estimated Time**: 3 hours

#### Implementation

```typescript
"use client"

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Clock, Brain, Flame, Tag, User, Crown } from 'lucide-react'
import { getEmotionConfig } from '@/lib/consciousness'

interface Memory {
  id: string
  content: string
  gravity_score: number
  emotion_type: string
  created_at: string
  memory_trace_id: string
  thread_id?: string
  entities: string[]
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

  // Fetch memories from Supabase
  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()

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

      const { data, error } = await query

      if (error) throw error

      setMemories(data || [])
      setError(null)
    } catch (err) {
      console.error('[MemoryTimeline] Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, threadId, limit, filter])

  useEffect(() => {
    fetchMemories()
  }, [fetchMemories])

  // Subscribe to real-time memory creation events
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`memory_events_${userId}`)
      .on('broadcast', { event: 'memory_created' }, (payload) => {
        console.log('📡 New memory received:', payload)

        // Only add if it matches our filters
        if (payload.payload.user_id === userId) {
          // If thread filter is active, only add matching thread
          if (threadId && payload.payload.thread_id !== threadId) {
            return
          }

          // Refresh to get full memory data
          fetchMemories()
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userId, threadId, fetchMemories])

  if (loading && memories.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-red-400 text-sm">Error loading memories: {error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      {showFilters && (
        <div className="flex gap-2 p-3 border-b border-white/10">
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
        {memories.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
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
  const emotionConfig = getEmotionConfig(memory.emotion_type)
  const EmotionIcon = emotionConfig?.icon || Brain

  return (
    <div className="group border border-white/10 rounded-lg p-3 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          {/* Timestamp */}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(memory.created_at).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>

          {/* Emotion Badge */}
          <span
            className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{
              backgroundColor: `${emotionConfig?.color}20`,
              color: emotionConfig?.color
            }}
          >
            <EmotionIcon className="w-3 h-3" />
            {memory.emotion_type}
          </span>

          {/* Identity Anchor Badge */}
          {memory.identity_anchor && (
            <Crown className="w-3 h-3 text-yellow-400" title="Identity Anchor" />
          )}
        </div>

        {/* Gravity Score */}
        <GravityIndicator score={memory.gravity_score} />
      </div>

      {/* Content */}
      <p className="text-sm text-white/80 mb-2 line-clamp-3">
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
                className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded"
              >
                {entity}
              </span>
            ))}
            {memory.entities.length > 3 && (
              <span className="text-xs text-gray-400">
                +{memory.entities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Memory Type */}
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <User className="w-3 h-3" />
          {memory.type}
        </span>
      </div>
    </div>
  )
}

function GravityIndicator({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 0.8) return 'text-red-400 bg-red-500/20'
    if (score >= 0.6) return 'text-orange-400 bg-orange-500/20'
    if (score >= 0.4) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-gray-400 bg-gray-500/20'
  }

  const getLabel = () => {
    if (score >= 0.8) return 'Critical'
    if (score >= 0.6) return 'High'
    if (score >= 0.4) return 'Medium'
    return 'Low'
  }

  return (
    <div className={`text-xs font-mono px-2 py-0.5 rounded ${getColor()}`}>
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
        flex items-center gap-1 px-3 py-1.5 rounded text-xs transition-all
        ${active
          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
          : 'bg-white/5 text-gray-400 hover:bg-white/10'
        }
      `}
    >
      {children}
    </button>
  )
}
```

#### Testing
```typescript
// Test component in isolation
import { MemoryTimeline } from '@/components/living-memory/memory-timeline'

<MemoryTimeline
  userId="test-user-id"
  limit={20}
  showFilters={true}
/>
```

---

### Task 1.5: Integrate Timeline into Left Rail

**File**: `components/longstrider/chat-left-rail.tsx`
**Lines**: Around line 400+ (after Space components)
**Estimated Time**: 1 hour

#### Current State
```typescript
// Left rail currently only shows Spaces
return (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="p-4 border-b border-white/10">
      <h2>LongStrider</h2>
    </div>

    {/* Spaces List */}
    <SpacesList spaces={spaces} />
  </div>
)
```

#### Required Changes
```typescript
import { MemoryTimeline } from '@/components/living-memory/memory-timeline'
import { Database, GitBranch } from 'lucide-react'

export function ChatLeftRail() {
  const [activeTab, setActiveTab] = useState<'spaces' | 'memories'>('spaces')
  const { currentThreadId } = useLongStriderStore()
  const userId = 'USER_ID' // Get from auth context

  return (
    <div className="flex flex-col h-full">
      {/* Header with Tabs */}
      <div className="border-b border-white/10">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-white mb-3">LongStrider</h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-t border-white/10">
          <TabButton
            active={activeTab === 'spaces'}
            onClick={() => setActiveTab('spaces')}
            icon={GitBranch}
          >
            Spaces
          </TabButton>
          <TabButton
            active={activeTab === 'memories'}
            onClick={() => setActiveTab('memories')}
            icon={Database}
          >
            Memory
          </TabButton>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'spaces' && <SpacesList />}
        {activeTab === 'memories' && (
          <MemoryTimeline
            userId={userId}
            threadId={currentThreadId || undefined}
            limit={50}
            showFilters={true}
          />
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-all
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

#### Testing
1. Click "Memory" tab in left rail
2. Verify timeline loads with recent memories
3. Send a chat message
4. Verify new memory appears in timeline within 2 seconds
5. Switch between Spaces and Memory tabs
6. Filter memories by "High Gravity" and "Identity"

---

## Dependencies

### NPM Packages
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "lucide-react": "^0.x",
    "zustand": "^4.x"
  }
}
```

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Schema (No changes required)
- `gravity_map` table already has all required fields
- No migrations needed for Phase 1

---

## Testing Checklist

### Manual Tests
- [ ] Send chat message → appears in gravity_map within 500ms
- [ ] Send chat message → appears in memory timeline within 2s
- [ ] Memory card displays: content, gravity, emotion, entities, timestamp
- [ ] Filter by "High Gravity" → only shows memories with gravity >= 0.7
- [ ] Filter by "Identity" → only shows identity_anchor = true
- [ ] Switch threads → timeline updates to show thread-specific memories
- [ ] Real-time: Have two browser windows open, send message in one, appears in other

### Automated Tests
```typescript
// File: tests/memory-timeline.test.tsx
describe('MemoryTimeline', () => {
  it('fetches and displays memories', async () => {
    // Test component renders
    // Test API call to gravity_map
    // Test memory cards render
  })

  it('receives real-time updates', async () => {
    // Mock Supabase Realtime channel
    // Emit memory_created event
    // Verify new memory appears
  })

  it('filters memories correctly', async () => {
    // Click "High Gravity" filter
    // Verify query parameters
    // Verify filtered results
  })
})
```

---

## Rollback Plan

If Phase 1 causes issues:

1. **Disable Realtime Events**: Comment out broadcast in `cognition_intake/index.ts`
2. **Revert Store Changes**: Remove `memory_id` field from LSMessage type
3. **Hide Memory Tab**: Remove tab button from left rail, keep Spaces only
4. **Database**: No schema changes made, safe to rollback code only

---

## Performance Considerations

### Query Optimization
```sql
-- Ensure indexes exist on gravity_map
CREATE INDEX IF NOT EXISTS idx_gravity_map_user_created
  ON gravity_map(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gravity_map_thread
  ON gravity_map(thread_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gravity_map_gravity
  ON gravity_map(gravity_score DESC)
  WHERE gravity_score >= 0.7;
```

### Pagination (Future Enhancement)
```typescript
// For Phase 1, limit to 50 memories
// In later phase, implement infinite scroll or pagination
```

---

## Next Steps

After completing Phase 1:
1. **Validate**: Run all tests, verify memories appear bidirectionally
2. **User Feedback**: Have 2-3 users test the timeline
3. **Move to Phase 2**: [PHASE-2-SEMANTIC-SEARCH.md](./PHASE-2-SEMANTIC-SEARCH.md)

---

## Questions & Clarifications

1. **Memory Limit**: 50 memories sufficient for initial view?
2. **Real-time Latency**: Is 2s acceptable or need faster?
3. **Thread Filtering**: Should timeline default to current thread only or all threads?
4. **Memory Detail View**: Click memory card to see full details (Phase 4)?

---

**Status**: Ready for Implementation
**Assigned To**: TBD
**Reviewer**: TBD
**Estimated Completion**: End of Week 1
