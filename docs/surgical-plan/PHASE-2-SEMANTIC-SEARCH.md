# Phase 2: Memory Surfacing & Semantic Search 🔍

**Priority**: P0 - CRITICAL
**Timeline**: Week 2
**Status**: Ready for Implementation
**Dependencies**: Phase 1 Complete

---

## Objective

Activate semantic search using pgvector embeddings and display recalled memories in the chat interface. Users should see which memories were surfaced during AI responses.

---

## Success Criteria

- ✅ All new memories get 1536-dim OpenAI embeddings
- ✅ CCE-Recall uses semantic similarity search (pgvector)
- ✅ Semantic queries return <300ms for 100k memories
- ✅ Surfaced memories displayed in chat as system cards
- ✅ Memory relevance >80% (user can validate)
- ✅ Existing memories backfilled with embeddings

---

## Architecture Overview

```
User Message → Embedding Generated → Stored in gravity_map.embedding
                                    ↓
AI Response Needed ← CCE-Recall (pgvector search) ← Query Embedding
                                    ↓
                    Relevant Memories Retrieved → Shown in Chat
```

---

## Tasks

### Task 2.1: Add Embedding Generation to Memory Storage

**File**: `supabase/functions/cognition_intake/index.ts`
**Lines**: Before dispatcher call (~line 550)
**Estimated Time**: 2 hours

#### Implementation

```typescript
// Add helper function at top of file (after imports)
async function generateEmbedding(content: string): Promise<number[] | null> {
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      console.warn('[Embedding] No OpenAI API key configured')
      return null
    }

    // Truncate content to 8000 tokens max (~32k chars for safety)
    const truncatedContent = content.length > 32000
      ? content.substring(0, 32000)
      : content

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small', // 1536 dimensions, $0.02 per 1M tokens
        input: truncatedContent
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Embedding] OpenAI API error:', response.status, errorText)
      return null
    }

    const result = await response.json()

    if (!result.data || !result.data[0] || !result.data[0].embedding) {
      console.error('[Embedding] Invalid response format')
      return null
    }

    console.log(`✅ Generated embedding: ${result.data[0].embedding.length} dimensions`)
    return result.data[0].embedding

  } catch (error) {
    console.error('[Embedding] Generation failed:', error)
    return null
  }
}
```

#### Add to Dispatcher Payload

```typescript
// Around line 558, BEFORE calling dispatcher
// Generate embedding for content
const embedding = await generateEmbedding(memory.content)

// Add to dispatcher payload
const dispatcherPayload = {
  // ... existing fields
  user_id: memory.user_id,
  content: memory.content,
  // ... more fields

  // ADD EMBEDDING
  embedding: embedding, // Will be null if generation fails (non-blocking)

  metadata: {
    ...memory.metadata,
    embedding_generated: embedding !== null,
    embedding_model: embedding ? 'text-embedding-3-small' : null
  }
}
```

#### Update Dispatcher to Store Embedding

**File**: `supabase/functions/cce-dispatcher/index.ts` (if separate)
**OR**: Ensure gravity_map insert includes embedding field

```typescript
// When inserting to gravity_map, include embedding
const insertData = {
  // ... all existing fields
  embedding: payload.embedding || null, // pgvector column accepts null
  // ... rest
}

const { data, error } = await supabase
  .from('gravity_map')
  .insert([insertData])
  .select()
  .single()
```

#### Cost Tracking

```typescript
// Add cost logging (optional but recommended)
if (embedding) {
  const tokenCount = Math.ceil(memory.content.length / 4) // Rough estimate
  const cost = (tokenCount / 1_000_000) * 0.02 // $0.02 per 1M tokens
  console.log(`💰 Embedding cost: ~$${cost.toFixed(6)} (${tokenCount} tokens)`)
}
```

#### Testing

```bash
# Test embedding generation
curl -X POST http://localhost:54321/functions/v1/cognition_intake \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -d '{
    "user_id": "test-user",
    "content": "This is a test message for embedding generation"
  }'

# Check database for embedding
psql -d your_db -c "SELECT id, content, embedding FROM gravity_map ORDER BY created_at DESC LIMIT 1;"
```

---

### Task 2.2: Update CCE-Recall for Semantic Search

**File**: `supabase/functions/cce-recall/index.ts`
**Lines**: Add new semantic search stream
**Estimated Time**: 2.5 hours

#### Current State (Text Search Only)

```typescript
// Currently uses basic text matching or entity matching
const { data: memories } = await supabase
  .from('gravity_map')
  .select('*')
  .eq('user_id', user_id)
  .textSearch('content', query) // Basic text search
  .limit(topk)
```

#### Required Changes

```typescript
// Add semantic search function
async function semanticMemoryStream(
  supabase,
  user_id: string,
  queryEmbedding: number[] | null,
  topk: number,
  similarityThreshold: number = 0.5
) {
  if (!queryEmbedding || queryEmbedding.length !== 1536) {
    console.warn('[Semantic Stream] Invalid or missing embedding, skipping')
    return []
  }

  try {
    // Use pgvector cosine distance operator <=>
    // Lower distance = more similar
    const { data, error } = await supabase.rpc('search_memories_by_embedding', {
      query_embedding: queryEmbedding,
      match_user_id: user_id,
      match_count: topk,
      similarity_threshold: similarityThreshold
    })

    if (error) {
      console.error('[Semantic Stream] Error:', error)
      return []
    }

    console.log(`🔍 Semantic search returned ${data?.length || 0} memories`)
    return data || []

  } catch (error) {
    console.error('[Semantic Stream] Exception:', error)
    return []
  }
}
```

#### Create Database Function for Semantic Search

**File**: `supabase/migrations/20251030_semantic_search.sql` (NEW)

```sql
-- Function for semantic memory search using pgvector
CREATE OR REPLACE FUNCTION search_memories_by_embedding(
  query_embedding vector(1536),
  match_user_id text,
  match_count int DEFAULT 10,
  similarity_threshold float DEFAULT 0.5
)
RETURNS TABLE (
  id uuid,
  content text,
  gravity_score double precision,
  emotion_type text,
  created_at timestamptz,
  entities text[],
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gm.id,
    gm.content,
    gm.gravity_score,
    gm.emotion_type,
    gm.created_at,
    gm.entities,
    gm.metadata,
    1 - (gm.embedding <=> query_embedding) as similarity
  FROM gravity_map gm
  WHERE
    gm.user_id = match_user_id
    AND gm.embedding IS NOT NULL
    AND (1 - (gm.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY gm.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

-- Create index for faster vector search
CREATE INDEX IF NOT EXISTS idx_gravity_map_embedding_cosine
  ON gravity_map
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_memories_by_embedding TO authenticated;
GRANT EXECUTE ON FUNCTION search_memories_by_embedding TO service_role;
```

#### Update Main Recall Function

```typescript
// In main recall handler
export default async function handler(req: Request) {
  const {
    user_id,
    user_message,
    consciousness_mode = 'flow',
    session_id,
    thread_id
  } = await req.json()

  // Generate embedding for user message
  const queryEmbedding = await generateEmbedding(user_message)

  // Determine topk based on mode
  const topk = getTopKByMode(consciousness_mode)

  // Get multiple memory streams in parallel
  const [semanticMemories, recentMemories, entityMemories] = await Promise.all([
    // NEW: Semantic search (highest priority)
    semanticMemoryStream(supabase, user_id, queryEmbedding, topk, 0.6),

    // Existing: Recent temporal memories
    recentMemoryStream(supabase, user_id, session_id, topk),

    // Existing: Entity-based memories
    entityMemoryStream(supabase, user_id, extractEntities(user_message), topk)
  ])

  // Merge and deduplicate memories by ID
  const allMemories = mergeMemoryStreams({
    semantic: semanticMemories,
    recent: recentMemories,
    entity: entityMemories
  })

  // Sort by relevance score (combination of similarity, gravity, recency)
  const rankedMemories = rankMemories(allMemories, {
    semanticWeight: 0.5,
    gravityWeight: 0.3,
    recencyWeight: 0.2
  })

  return new Response(JSON.stringify({
    memories: rankedMemories.slice(0, topk),
    streams: {
      semantic: semanticMemories.length,
      recent: recentMemories.length,
      entity: entityMemories.length
    },
    recall_strategy: 'hybrid_semantic'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

// Helper: Merge and dedupe
function mergeMemoryStreams(streams: Record<string, any[]>) {
  const memoryMap = new Map()

  for (const [source, memories] of Object.entries(streams)) {
    for (const memory of memories) {
      if (!memoryMap.has(memory.id)) {
        memoryMap.set(memory.id, {
          ...memory,
          sources: [source],
          source_scores: { [source]: memory.similarity || memory.gravity_score || 0 }
        })
      } else {
        const existing = memoryMap.get(memory.id)
        existing.sources.push(source)
        existing.source_scores[source] = memory.similarity || memory.gravity_score || 0
      }
    }
  }

  return Array.from(memoryMap.values())
}

// Helper: Rank memories by weighted score
function rankMemories(memories: any[], weights: any) {
  return memories.map(memory => {
    const semanticScore = memory.source_scores.semantic || 0
    const gravityScore = memory.gravity_score || 0
    const recencyScore = calculateRecencyScore(memory.created_at)

    const combinedScore =
      semanticScore * weights.semanticWeight +
      gravityScore * weights.gravityWeight +
      recencyScore * weights.recencyWeight

    return {
      ...memory,
      relevance_score: combinedScore
    }
  }).sort((a, b) => b.relevance_score - a.relevance_score)
}

function calculateRecencyScore(createdAt: string): number {
  const ageMs = Date.now() - new Date(createdAt).getTime()
  const ageDays = ageMs / (1000 * 60 * 60 * 24)

  // Exponential decay: 1.0 at 0 days, 0.5 at 7 days, 0.1 at 30 days
  return Math.exp(-ageDays / 10)
}
```

#### Testing

```bash
# Apply migration
supabase migration up

# Test semantic search directly
psql -d your_db -c "
SELECT content, similarity
FROM search_memories_by_embedding(
  (SELECT embedding FROM gravity_map WHERE content = 'test query' LIMIT 1),
  'user-id',
  5,
  0.5
);
"

# Test via API
curl -X POST http://localhost:54321/functions/v1/cce-recall \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "user_message": "What did we discuss about Project Atlas?",
    "consciousness_mode": "resonance"
  }'
```

---

### Task 2.3: Display Surfaced Memories in Chat UI

**File**: `components/longstrider/chat-center.tsx`
**Lines**: SSE event handler for `memory_surfacing`
**Estimated Time**: 2 hours

#### Current State

```typescript
// Event handler exists but doesn't create UI
case 'memory_surfacing':
  console.log('Memories surfaced:', data.memories)
  // Currently just logs, doesn't display
  break
```

#### Required Changes

```typescript
// Update SSE handler to create memory cards
case 'memory_surfacing':
  if (data.memories && Array.isArray(data.memories) && data.memories.length > 0) {
    // Create a system message card for surfaced memories
    const memoryCard: LSMessage = {
      id: `memory-surface-${Date.now()}`,
      type: 'system',
      kind: 'memory',
      content: '', // Empty, will render custom component
      timestamp: new Date(),
      metadata: {
        surfaced_memories: data.memories,
        memory_count: data.count || data.memories.length,
        recall_strategy: data.recall_strategy || 'hybrid',
        streams: data.streams || {}
      }
    }

    // Insert memory card BEFORE the streaming assistant message
    // Find the index of the current streaming message
    const messages = getMessages(currentThreadId)
    const streamingIndex = messages.findIndex(m => m.id === streamingMessageId)

    if (streamingIndex !== -1) {
      // Insert before streaming message
      insertMessageAt(currentThreadId, streamingIndex, memoryCard)
    } else {
      // Fallback: just add to end
      addMessage(currentThreadId, memoryCard)
    }

    console.log(`🧠 Displayed ${data.memories.length} surfaced memories`)
  }
  break
```

#### Create Memory Card Component

**File**: `components/longstrider/memory-surface-card.tsx` (NEW)

```typescript
"use client"

import { Brain, ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { getEmotionConfig } from '@/lib/consciousness'

interface SurfacedMemory {
  id: string
  content: string
  gravity_score: number
  emotion_type: string
  created_at: string
  entities: string[]
  similarity?: number
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

  const topMemory = memories[0]
  const hasMore = memories.length > 1

  return (
    <div className="my-4 border border-purple-500/30 rounded-lg bg-purple-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-purple-500/10">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">
            {memories.length} {memories.length === 1 ? 'Memory' : 'Memories'} Surfaced
          </span>
          {recallStrategy && (
            <span className="text-xs text-purple-400/60">
              ({recallStrategy})
            </span>
          )}
        </div>

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
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
      <div className="divide-y divide-white/5">
        {/* Top Memory (always shown) */}
        <MemoryItem memory={topMemory} isTop />

        {/* Additional Memories (collapsed by default) */}
        {expanded && memories.slice(1).map((memory) => (
          <MemoryItem key={memory.id} memory={memory} />
        ))}
      </div>

      {/* Footer: Stream Info */}
      {Object.keys(streams).length > 0 && (
        <div className="px-3 py-2 bg-purple-500/5 border-t border-purple-500/20">
          <div className="flex gap-3 text-xs text-purple-400/60">
            {Object.entries(streams).map(([stream, count]) => (
              <span key={stream}>
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
  const emotionConfig = getEmotionConfig(memory.emotion_type)

  return (
    <div className={`p-3 ${isTop ? 'bg-purple-500/5' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Similarity/Relevance Score */}
          {memory.similarity !== undefined && (
            <span className="text-xs font-mono text-purple-400">
              {(memory.similarity * 100).toFixed(0)}% match
            </span>
          )}

          {/* Emotion */}
          {emotionConfig && (
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${emotionConfig.color}20`,
                color: emotionConfig.color
              }}
            >
              {memory.emotion_type}
            </span>
          )}

          {/* Gravity */}
          <span className="text-xs text-gray-400">
            g: {memory.gravity_score.toFixed(2)}
          </span>
        </div>

        {/* Sources (which streams found this) */}
        {memory.sources && memory.sources.length > 0 && (
          <div className="flex gap-1">
            {memory.sources.map(source => (
              <span
                key={source}
                className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-gray-400"
              >
                {source}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-white/70 line-clamp-2 mb-2">
        {memory.content}
      </p>

      {/* Entities */}
      {memory.entities && memory.entities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {memory.entities.slice(0, 5).map((entity, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300"
            >
              {entity}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
```

#### Update Message Rendering

**File**: `components/longstrider/message-card.tsx`

```typescript
import { MemorySurfaceCard } from './memory-surface-card'

export function MessageCard({ message }: { message: LSMessage }) {
  // ... existing rendering logic

  // Add handler for memory kind
  if (message.kind === 'memory' && message.metadata?.surfaced_memories) {
    return (
      <MemorySurfaceCard
        memories={message.metadata.surfaced_memories}
        recallStrategy={message.metadata.recall_strategy}
        streams={message.metadata.streams}
      />
    )
  }

  // ... rest of message rendering
}
```

#### Testing
1. Send message: "Tell me about Project Atlas"
2. Verify memory_surfacing SSE event received
3. Verify memory card appears in chat BEFORE AI response
4. Verify top memory shown by default
5. Click "Show All" → all surfaced memories displayed
6. Verify similarity scores, emotions, entities shown

---

### Task 2.4: Backfill Existing Memories with Embeddings

**File**: `scripts/backfill-embeddings.ts` (NEW)
**Estimated Time**: 1.5 hours (+ runtime depends on memory count)

#### Implementation

```typescript
#!/usr/bin/env deno run --allow-net --allow-env

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BATCH_SIZE = 100
const DELAY_MS = 1000 // Rate limit: 1 second between batches
const DRY_RUN = Deno.args.includes('--dry-run')

async function generateEmbedding(content: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: content.substring(0, 32000) // Truncate
      })
    })

    const result = await response.json()
    return result.data[0].embedding
  } catch (error) {
    console.error('Embedding failed:', error)
    return null
  }
}

async function backfillEmbeddings() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  console.log('🚀 Starting embedding backfill...')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)

  // Count total memories without embeddings
  const { count: totalCount } = await supabase
    .from('gravity_map')
    .select('id', { count: 'exact', head: true })
    .is('embedding', null)

  console.log(`📊 Found ${totalCount} memories without embeddings`)

  let processed = 0
  let failed = 0
  let totalCost = 0

  while (processed < (totalCount || 0)) {
    // Fetch batch
    const { data: batch, error } = await supabase
      .from('gravity_map')
      .select('id, content')
      .is('embedding', null)
      .limit(BATCH_SIZE)

    if (error || !batch || batch.length === 0) {
      console.log('No more memories to process')
      break
    }

    console.log(`\n📦 Processing batch ${Math.floor(processed / BATCH_SIZE) + 1}...`)

    for (const memory of batch) {
      const embedding = await generateEmbedding(memory.content)

      if (embedding) {
        if (!DRY_RUN) {
          await supabase
            .from('gravity_map')
            .update({ embedding })
            .eq('id', memory.id)
        }

        // Estimate cost
        const tokenCount = Math.ceil(memory.content.length / 4)
        const cost = (tokenCount / 1_000_000) * 0.02
        totalCost += cost

        processed++
        console.log(`  ✅ ${processed}/${totalCount} - $${totalCost.toFixed(4)}`)
      } else {
        failed++
        console.log(`  ❌ Failed: ${memory.id}`)
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Delay between batches
    console.log(`⏳ Waiting ${DELAY_MS}ms before next batch...`)
    await new Promise(resolve => setTimeout(resolve, DELAY_MS))
  }

  console.log('\n✨ Backfill complete!')
  console.log(`Processed: ${processed}`)
  console.log(`Failed: ${failed}`)
  console.log(`Estimated cost: $${totalCost.toFixed(4)}`)
}

// Run
backfillEmbeddings().catch(console.error)
```

#### Usage

```bash
# Dry run (test without updating)
deno run --allow-net --allow-env scripts/backfill-embeddings.ts --dry-run

# Live run (updates database)
deno run --allow-net --allow-env scripts/backfill-embeddings.ts

# Run overnight with nohup
nohup deno run --allow-net --allow-env scripts/backfill-embeddings.ts > backfill.log 2>&1 &
```

#### Cost Estimation

```typescript
// Estimate cost before running
const avgContentLength = 500 chars
const totalMemories = 10,000
const totalTokens = totalMemories * (avgContentLength / 4)
const cost = (totalTokens / 1_000_000) * 0.02
console.log(`Estimated cost: $${cost.toFixed(2)}`)
// Example: 10k memories * 125 tokens * $0.02/1M = $0.025
```

---

## Performance Optimization

### Database Indexes

```sql
-- Already created in Task 2.2, but verify:
CREATE INDEX IF NOT EXISTS idx_gravity_map_embedding_cosine
  ON gravity_map
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- For hybrid search
CREATE INDEX IF NOT EXISTS idx_gravity_map_user_gravity
  ON gravity_map(user_id, gravity_score DESC);

-- For recency scoring
CREATE INDEX IF NOT EXISTS idx_gravity_map_user_created
  ON gravity_map(user_id, created_at DESC);
```

### Query Performance Monitoring

```typescript
// Add timing logs to semantic search
const startTime = performance.now()
const memories = await semanticMemoryStream(...)
const duration = performance.now() - startTime
console.log(`⏱️ Semantic search: ${duration.toFixed(0)}ms`)

// Alert if slow
if (duration > 500) {
  console.warn(`🐌 Slow semantic search: ${duration}ms`)
}
```

---

## Testing Checklist

### Manual Tests
- [ ] New message generates embedding (check database)
- [ ] Semantic search returns relevant memories
- [ ] Memory surface card displays in chat
- [ ] Similarity scores accurate (>0.7 for related content)
- [ ] Backfill script runs without errors
- [ ] Performance <300ms for semantic queries

### Automated Tests
```typescript
describe('Semantic Search', () => {
  it('generates embeddings for new memories', async () => {
    // Create memory, verify embedding exists
  })

  it('returns semantically similar memories', async () => {
    // Store test memories, query, verify results
  })

  it('displays memory cards in chat', async () => {
    // Mock SSE event, verify card renders
  })
})
```

---

## Rollback Plan

1. **Disable Embedding Generation**: Comment out in `cognition_intake/index.ts`
2. **Revert CCE-Recall**: Use old text-search version
3. **Hide Memory Cards**: Remove `memory_surfacing` handler
4. **Database**: Keep embeddings (no harm), remove indexes if needed

---

## Next Steps

After Phase 2:
1. Validate semantic search accuracy with users
2. Tune similarity thresholds based on feedback
3. Move to [Phase 3: Webhooks](./PHASE-3-WEBHOOKS.md)

---

**Status**: Ready for Implementation
**Estimated Completion**: End of Week 2
