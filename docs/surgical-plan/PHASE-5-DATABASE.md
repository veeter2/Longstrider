# Phase 5: Database Optimization ⚡

**Priority**: P2 - MEDIUM
**Timeline**: Week 5
**Status**: Ready for Implementation
**Dependencies**: Phases 1-2 Complete

---

## Objective

Optimize database performance with triggers, indexes, and Realtime subscriptions. Ensure the system scales to millions of memories.

---

## Success Criteria

- ✅ Auto-processing triggers for high-gravity memories
- ✅ Realtime subscriptions for instant UI updates
- ✅ Query performance <100ms for indexed queries
- ✅ Database connection pooling implemented
- ✅ Comprehensive indexes on all frequently queried columns
- ✅ Automated cleanup for old cache entries

---

## Tasks

### Task 5.1: Create Database Triggers

**File**: `supabase/migrations/20251030_memory_triggers.sql` (NEW)

```sql
-- =====================================================
-- MEMORY PROCESSING TRIGGERS
-- Auto-tag, notify, and process memories
-- =====================================================

-- Function: Auto-tag high-gravity memories
CREATE OR REPLACE FUNCTION auto_tag_high_gravity()
RETURNS TRIGGER AS $$
BEGIN
  -- Tag memories with gravity >= 0.85 as high_gravity
  IF NEW.gravity_score >= 0.85 THEN
    NEW.meta_tags = array_append(COALESCE(NEW.meta_tags, ARRAY[]::text[]), 'high_gravity');
    NEW.identity_anchor = true;
  END IF;

  -- Tag identity anchors
  IF NEW.entities @> ARRAY['Blu', 'Matt', 'Atlas', 'Ivy'] THEN
    NEW.meta_tags = array_append(COALESCE(NEW.meta_tags, ARRAY[]::text[]), 'identity');
  END IF;

  -- Auto-set temporal_type if not provided
  IF NEW.temporal_type IS NULL THEN
    IF NEW.content ~* '(yesterday|last week|remember|before)' THEN
      NEW.temporal_type = 'past';
    ELSIF NEW.content ~* '(tomorrow|next week|will|plan|going to)' THEN
      NEW.temporal_type = 'future';
    ELSE
      NEW.temporal_type = 'present';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_tag_high_gravity
  BEFORE INSERT ON gravity_map
  FOR EACH ROW
  EXECUTE FUNCTION auto_tag_high_gravity();

-- =====================================================
-- REALTIME NOTIFICATIONS
-- =====================================================

-- Function: Notify frontend of new memories
CREATE OR REPLACE FUNCTION notify_memory_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'memory_created',
    json_build_object(
      'id', NEW.id,
      'user_id', NEW.user_id,
      'thread_id', NEW.thread_id,
      'session_id', NEW.session_id,
      'gravity_score', NEW.gravity_score,
      'emotion_type', NEW.emotion_type,
      'created_at', NEW.created_at
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_memory_created
  AFTER INSERT ON gravity_map
  FOR EACH ROW
  EXECUTE FUNCTION notify_memory_created();

-- =====================================================
-- ARC BUILDING TRIGGER
-- Auto-create arcs for high-gravity memory clusters
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_arc_building()
RETURNS TRIGGER AS $$
DECLARE
  similar_memories INT;
  arc_id UUID;
BEGIN
  -- Only process high-gravity memories
  IF NEW.gravity_score < 0.8 THEN
    RETURN NEW;
  END IF;

  -- Count similar recent memories with same emotion and high gravity
  SELECT COUNT(*)
  INTO similar_memories
  FROM gravity_map
  WHERE
    user_id = NEW.user_id
    AND emotion_type = NEW.emotion_type
    AND gravity_score >= 0.8
    AND created_at > NOW() - INTERVAL '24 hours'
    AND id != NEW.id;

  -- If 3+ similar memories, create/update arc
  IF similar_memories >= 2 THEN
    -- Check if arc already exists for this emotion
    SELECT id INTO arc_id
    FROM memory_arcs
    WHERE
      user_id = NEW.user_id
      AND arc_name ILIKE '%' || NEW.emotion_type || '%'
      AND evolution_stage IN ('forming', 'active')
    ORDER BY created_at DESC
    LIMIT 1;

    IF arc_id IS NULL THEN
      -- Create new arc
      INSERT INTO memory_arcs (
        user_id,
        arc_name,
        gravity_center,
        evolution_stage,
        created_at
      ) VALUES (
        NEW.user_id,
        NEW.emotion_type || ' arc (auto-created)',
        NEW.gravity_score,
        'forming',
        NOW()
      )
      RETURNING id INTO arc_id;
    END IF;

    -- Associate memory with arc
    INSERT INTO memory_arc_associations (
      memory_id,
      arc_id,
      fusion_strength,
      created_at
    ) VALUES (
      NEW.id,
      arc_id,
      0.8,
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_arc_building
  AFTER INSERT ON gravity_map
  FOR EACH ROW
  EXECUTE FUNCTION trigger_arc_building();

-- =====================================================
-- CLEANUP TRIGGERS
-- =====================================================

-- Function: Clean old consciousness cache entries
CREATE OR REPLACE FUNCTION cleanup_old_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM consciousness_cache
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-cache', '0 * * * *', 'SELECT cleanup_old_cache()');
```

---

### Task 5.2: Create Performance Indexes

**File**: `supabase/migrations/20251030_performance_indexes.sql` (NEW)

```sql
-- =====================================================
-- PERFORMANCE INDEXES FOR GRAVITY_MAP
-- =====================================================

-- Core lookup indexes
CREATE INDEX IF NOT EXISTS idx_gravity_map_user_id
  ON gravity_map(user_id);

CREATE INDEX IF NOT EXISTS idx_gravity_map_thread_id
  ON gravity_map(thread_id)
  WHERE thread_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gravity_map_session_id
  ON gravity_map(session_id)
  WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gravity_map_memory_trace_id
  ON gravity_map(memory_trace_id);

-- Temporal queries
CREATE INDEX IF NOT EXISTS idx_gravity_map_created_at
  ON gravity_map(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gravity_map_user_created
  ON gravity_map(user_id, created_at DESC);

-- Gravity-based queries
CREATE INDEX IF NOT EXISTS idx_gravity_map_high_gravity
  ON gravity_map(user_id, gravity_score DESC)
  WHERE gravity_score >= 0.7;

-- Identity anchors
CREATE INDEX IF NOT EXISTS idx_gravity_map_identity_anchors
  ON gravity_map(user_id, identity_anchor)
  WHERE identity_anchor = true;

-- Entity search
CREATE INDEX IF NOT EXISTS idx_gravity_map_entities
  ON gravity_map USING GIN(entities);

-- Emotion filtering
CREATE INDEX IF NOT EXISTS idx_gravity_map_emotion
  ON gravity_map(user_id, emotion_type)
  WHERE emotion_type IS NOT NULL;

-- Temporal type filtering
CREATE INDEX IF NOT EXISTS idx_gravity_map_temporal
  ON gravity_map(temporal_type)
  WHERE temporal_type IS NOT NULL;

-- Meta tags search
CREATE INDEX IF NOT EXISTS idx_gravity_map_tags
  ON gravity_map USING GIN(meta_tags);

-- =====================================================
-- EMBEDDING SEARCH (PGVECTOR)
-- =====================================================

-- Cosine similarity search (most common)
CREATE INDEX IF NOT EXISTS idx_gravity_map_embedding_cosine
  ON gravity_map
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- L2 distance search (alternative)
CREATE INDEX IF NOT EXISTS idx_gravity_map_embedding_l2
  ON gravity_map
  USING ivfflat (embedding vector_l2_ops)
  WITH (lists = 100);

-- =====================================================
-- MEMORY ARCS INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_memory_arcs_user
  ON memory_arcs(user_id, evolution_stage);

CREATE INDEX IF NOT EXISTS idx_memory_arcs_gravity
  ON memory_arcs(gravity_center DESC);

-- =====================================================
-- ASSOCIATIONS INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_arc_associations_memory
  ON memory_arc_associations(memory_id);

CREATE INDEX IF NOT EXISTS idx_arc_associations_arc
  ON memory_arc_associations(arc_id, fusion_strength DESC);

-- =====================================================
-- SESSION INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_active_sessions_user
  ON active_sessions(user_id, session_status);

CREATE INDEX IF NOT EXISTS idx_active_sessions_updated
  ON active_sessions(last_message_at DESC);

-- =====================================================
-- PATTERN MATRIX INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pattern_matrix_user
  ON pattern_matrix(user_id, intensity DESC);

CREATE INDEX IF NOT EXISTS idx_pattern_matrix_type
  ON pattern_matrix(pattern_type);

-- =====================================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- =====================================================

ANALYZE gravity_map;
ANALYZE memory_arcs;
ANALYZE memory_arc_associations;
ANALYZE active_sessions;
ANALYZE pattern_matrix;
```

---

### Task 5.3: Setup Realtime Subscriptions

**File**: `lib/supabase-realtime.ts` (NEW)

```typescript
import { createClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// =====================================================
// MEMORY SUBSCRIPTIONS
// =====================================================

export function subscribeToMemories(
  userId: string,
  onMemoryCreated: (memory: any) => void,
  onMemoryUpdated?: (memory: any) => void
): () => void {
  const supabase = createClient()

  const channel = supabase
    .channel(`memories:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'gravity_map',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('🔔 New memory:', payload.new)
        onMemoryCreated(payload.new)
      }
    )

  if (onMemoryUpdated) {
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'gravity_map',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('📝 Memory updated:', payload.new)
        onMemoryUpdated(payload.new)
      }
    )
  }

  channel.subscribe()

  return () => {
    channel.unsubscribe()
  }
}

// =====================================================
// ARC SUBSCRIPTIONS
// =====================================================

export function subscribeToArcs(
  userId: string,
  onArcCreated: (arc: any) => void
): () => void {
  const supabase = createClient()

  const channel = supabase
    .channel(`arcs:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'memory_arcs',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('🌟 New arc:', payload.new)
        onArcCreated(payload.new)
      }
    )
    .subscribe()

  return () => channel.unsubscribe()
}

// =====================================================
// BROADCAST SUBSCRIPTIONS (for webhook events)
// =====================================================

export function subscribeToBroadcasts(
  userId: string,
  onEvent: (event: any) => void
): () => void {
  const supabase = createClient()

  const channel = supabase
    .channel(`broadcasts:${userId}`)
    .on('broadcast', { event: 'memory_created' }, (payload) => {
      console.log('📡 Broadcast event:', payload)
      onEvent(payload)
    })
    .subscribe()

  return () => channel.unsubscribe()
}

// =====================================================
// CONNECTION POOL MANAGER
// =====================================================

class RealtimeConnectionPool {
  private channels: Map<string, RealtimeChannel> = new Map()
  private maxConnections = 10

  addChannel(key: string, channel: RealtimeChannel) {
    if (this.channels.size >= this.maxConnections) {
      // Remove oldest channel
      const firstKey = this.channels.keys().next().value
      this.channels.get(firstKey)?.unsubscribe()
      this.channels.delete(firstKey)
    }
    this.channels.set(key, channel)
  }

  removeChannel(key: string) {
    const channel = this.channels.get(key)
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(key)
    }
  }

  cleanup() {
    this.channels.forEach(channel => channel.unsubscribe())
    this.channels.clear()
  }
}

export const realtimePool = new RealtimeConnectionPool()
```

---

### Task 5.4: Connection Pooling Configuration

**File**: `lib/supabase-config.ts` (NEW)

```typescript
export const SUPABASE_REALTIME_CONFIG = {
  // Realtime settings
  realtime: {
    timeout: 30000, // 30 seconds
    heartbeat: 15000, // 15 seconds
  },

  // Connection pool settings
  pool: {
    max: 10, // Max 10 concurrent Realtime connections
    min: 2,  // Keep 2 connections warm
    idle: 10000 // Close idle connections after 10s
  },

  // Retry settings
  retry: {
    attempts: 3,
    delay: 1000,
    maxDelay: 10000
  }
}

// Apply settings to Supabase client
import { createClient } from '@supabase/supabase-js'

export function createConfiguredClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          eventsPerSecond: 10 // Rate limit events
        }
      }
    }
  )
}
```

---

## Apply Migrations

```bash
# Apply trigger migration
supabase migration new memory_triggers
# Copy SQL from Task 5.1 into migration file
supabase db push

# Apply index migration
supabase migration new performance_indexes
# Copy SQL from Task 5.2 into migration file
supabase db push

# Verify indexes
supabase db execute "SELECT * FROM pg_indexes WHERE tablename = 'gravity_map';"
```

---

## Testing

### Performance Tests

```sql
-- Test query performance with indexes
EXPLAIN ANALYZE
SELECT * FROM gravity_map
WHERE user_id = 'test-user'
  AND created_at > NOW() - INTERVAL '7 days'
  AND gravity_score >= 0.7
ORDER BY created_at DESC
LIMIT 50;

-- Should use index scan, not seq scan
-- Target: <100ms
```

### Realtime Tests

```typescript
// Test subscription
const unsubscribe = subscribeToMemories(
  'test-user',
  (memory) => console.log('New memory:', memory)
)

// Insert test memory
await supabase.from('gravity_map').insert({
  user_id: 'test-user',
  content: 'Test memory',
  gravity_score: 0.8
})

// Should log within 100ms
```

---

## Monitoring

### Query Performance Dashboard

```sql
-- View slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%gravity_map%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Index Usage Stats

```sql
-- Check if indexes are being used
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename = 'gravity_map'
ORDER BY idx_scan DESC;
```

---

## Next Steps

After Phase 5:
1. Monitor performance metrics
2. Tune index parameters if needed
3. Production deployment
4. Final system integration testing

---

**Status**: Ready for Implementation
**Estimated Completion**: End of Week 5
