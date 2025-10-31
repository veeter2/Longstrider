# Living Memory ↔ Chat Bidirectional Integration
## Surgical Plan - Master Document

**Status**: Ready for Implementation
**Created**: 2025-10-30
**Estimated Timeline**: 5 weeks
**Priority**: Critical

---

## Executive Summary

This surgical plan addresses the critical gaps in the bidirectional flow between the LongStrider chat interface and the Living Memory system. The architecture is 80% complete, with a sophisticated SSE-based consciousness pipeline, but lacks key UI components and integration points.

### Critical Findings

1. **No Webhook Infrastructure** - System uses SSE exclusively (no webhooks found, contrary to initial belief)
2. **Messages Not Visible in Living Memory** - Chat messages stored in `gravity_map` but no timeline UI exists
3. **Memory Surfacing Incomplete** - Recalled memories not displayed in chat interface
4. **Semantic Search Inactive** - pgvector ready but not utilized in queries
5. **Living Memory UI is Stub** - `/components/living-memory/system.tsx` is placeholder only

### Success Criteria

- ✅ 100% of chat messages appear in Living Memory within 2 seconds
- ✅ Surfaced memories visible in chat with source indication
- ✅ Semantic search returns relevant memories (>0.7 similarity)
- ✅ External webhooks can create memories
- ✅ Memory arcs displayed with relationships
- ✅ Page load < 1s for timeline (50 items)

---

## Implementation Phases

### [Phase 1: Core Bidirectional Flow](./docs/surgical-plan/PHASE-1-BIDIRECTIONAL-FLOW.md) ⚡ CRITICAL
**Week 1** | **Priority: P0**

Complete the essential message ↔ memory linkage and build the core timeline UI.

- Add memory_id tracking to chat messages
- Emit realtime events from memory storage
- Build MemoryTimeline component
- Integrate timeline into left rail

**Files**: `cognition_intake/index.ts`, `longstrider-store.ts`, `chat-center.tsx`, NEW: `memory-timeline.tsx`

---

### [Phase 2: Memory Surfacing & Semantic Search](./docs/surgical-plan/PHASE-2-SEMANTIC-SEARCH.md) 🔍
**Week 2** | **Priority: P0**

Activate semantic search and show recalled memories in chat interface.

- Update CCE-Recall for pgvector semantic search
- Add embedding generation pipeline
- Display surfaced memories in chat
- Backfill existing memories with embeddings

**Files**: `cce-recall/index.ts`, `cognition_intake/index.ts`, `chat-center.tsx`, NEW: `backfill-embeddings.ts`

---

### [Phase 3: Webhook & External Events](./docs/surgical-plan/PHASE-3-WEBHOOKS.md) 🔗
**Week 3** | **Priority: P1**

Enable external systems (Slack, email, etc.) to create memories via webhooks.

- Create webhook receiver function
- Implement HMAC signature verification
- Document webhook API contract
- Test with Slack integration

**Files**: NEW: `webhook-memory-intake/index.ts`, NEW: `docs/WEBHOOK_API.md`

---

### [Phase 4: Advanced Visualizations](./docs/surgical-plan/PHASE-4-VISUALIZATIONS.md) 📊
**Week 4** | **Priority: P2**

Build sophisticated memory visualization components.

- Memory arc visualization with relationships
- Pattern matrix display
- Consciousness evolution timeline
- Interactive memory graph

**Files**: NEW: `arc-view.tsx`, NEW: `pattern-matrix.tsx`, NEW: `consciousness-timeline.tsx`

---

### [Phase 5: Database Optimization](./docs/surgical-plan/PHASE-5-DATABASE.md) ⚡
**Week 5** | **Priority: P2**

Optimize database with triggers and realtime subscriptions.

- Create auto-processing triggers
- Setup Realtime subscriptions
- Add performance indexes
- Implement connection pooling

**Files**: NEW: `create_memory_triggers.sql`, NEW: `supabase-realtime.ts`

---

## Architecture Overview

### Current State: What's Working ✅

1. **Chat → Memory Storage** (Partial)
   - Messages flow through: Chat → `cognition_intake` → `cce-dispatcher` → `gravity_map`
   - SSE streaming provides real-time events
   - Metadata extraction (gravity, emotion, entities) functional

2. **Consciousness Pipeline**
   - CCE-Orchestrator → CCE-Conductor → CCE-Response working
   - Mode determination (flow/resonance/revelation/fusion/emergence) operational
   - Pattern detection and insight generation active

3. **Memory Retrieval**
   - CCE-Recall queries gravity_map with mode-based topk
   - Entity-based, temporal, baseline streams functional

4. **State Management**
   - LongStriderStore persists messages
   - ConsciousnessStore tracks Space analytics
   - SSE client handles streaming events

### Critical Gaps ❌

1. **No Memory Timeline UI** - Messages stored but not displayed
2. **No Memory Surfacing in Chat** - Recalled memories not shown to user
3. **Semantic Search Disabled** - Embeddings column exists but unused
4. **Living Memory Stub** - Component exists but non-functional
5. **No External Ingestion** - Only chat can create memories
6. **No Database Triggers** - Manual processing only

---

## Key Files Reference

### Critical Changes Required

| File | Current State | Required Changes | Phase |
|------|---------------|------------------|-------|
| `supabase/functions/cognition_intake/index.ts` | Stores memories | Add embeddings, realtime events | 1, 2 |
| `stores/longstrider-store.ts` | Tracks messages | Add memory_id field | 1 |
| `components/longstrider/chat-center.tsx` | Chat UI | Store memory IDs, show surfaced | 1, 2 |
| `components/living-memory/memory-timeline.tsx` | **MISSING** | Build timeline component | 1 |
| `components/longstrider/chat-left-rail.tsx` | Space list only | Add memory timeline tab | 1 |
| `supabase/functions/cce-recall/index.ts` | Text search only | Add semantic search | 2 |
| `supabase/functions/webhook-memory-intake/index.ts` | **MISSING** | Build webhook receiver | 3 |
| `components/living-memory/arc-view.tsx` | **MISSING** | Build arc visualization | 4 |
| `supabase/migrations/create_memory_triggers.sql` | **MISSING** | Add triggers | 5 |

### Read-Only Reference Files

- `docs/audit/public_tables.sql` - Complete schema (2700+ lines)
- `supabase/functions/cce-orchestrator/index.ts` - Main pipeline (968 lines)
- `supabase/functions/cce-response/index.ts` - Response generation
- `lib/sse-service.ts` - SSE client implementation
- `types/longstrider.ts` - Type definitions

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Embedding generation costs | High ($$) | Medium | Rate limit, batch, cache |
| Realtime connection limits | High (outages) | Low | Connection pooling, channels |
| Query performance degradation | Medium (UX) | High | Indexes, pagination, lazy load |
| Webhook security breach | Critical (data) | Low | HMAC verification, rate limits |
| Semantic search accuracy | Medium (UX) | Medium | Tune thresholds, hybrid search |

---

## Testing Strategy

### Unit Tests
- Each new component (MemoryTimeline, ArcView, etc.)
- Embedding generation
- Webhook signature verification

### Integration Tests
- Full chat → memory → chat flow
- Semantic search relevance
- Realtime event propagation

### E2E Tests
1. User sends message
2. Memory appears in timeline within 2s
3. Memory surfaced in next response
4. Memory displayed in chat

### Performance Tests
- Query speed with 10k, 100k, 1M memories
- Realtime event latency
- Embedding generation throughput

---

## Dependencies

### External Services
- **OpenAI API** - Embedding generation (text-embedding-3-small)
- **Supabase** - Database, Realtime, Edge Functions
- **pgvector** - Semantic search extension

### Internal Systems
- CCE Pipeline (Orchestrator, Conductor, Response, Recall)
- LongStrider Store (Zustand)
- Consciousness Store (Zustand)
- SSE Service

---

## Rollout Plan

### Week 1: Foundation
1. Implement Phase 1.1-1.3 (memory linkage)
2. Build MemoryTimeline component
3. Test bidirectional flow
4. Deploy to staging

### Week 2: Search Enhancement
1. Implement Phase 2.1-2.2 (semantic search)
2. Generate embeddings for new messages
3. Backfill existing memories (overnight job)
4. Deploy semantic search

### Week 3: External Integration
1. Build webhook receiver
2. Document API
3. Test with Slack integration
4. Deploy webhook endpoint

### Week 4: Visualization
1. Build arc view component
2. Pattern matrix display
3. Consciousness timeline
4. User testing session

### Week 5: Optimization
1. Database triggers
2. Realtime subscriptions
3. Performance tuning
4. Production rollout

---

## Success Metrics

### Performance
- Memory storage latency: < 500ms
- Timeline load time: < 1s (50 items)
- Semantic search: < 300ms
- Realtime event propagation: < 100ms

### Reliability
- Memory storage success rate: > 99.9%
- Webhook delivery success: > 99%
- Realtime connection uptime: > 99.5%

### User Experience
- Memory visibility: 100% (all messages appear)
- Surfaced memory relevance: > 80% user satisfaction
- Timeline usability: < 5s to find specific memory

---

## Next Steps

1. **Validate Plan** - Review this master document
2. **Read Phase 1** - Start with `PHASE-1-BIDIRECTIONAL-FLOW.md`
3. **Assign Agent** - Have specialized agent tackle Phase 1
4. **Implement** - Work through phases sequentially
5. **Test** - Run integration tests after each phase
6. **Deploy** - Staged rollout with monitoring

---

## Questions for Clarification

1. **User Priority** - Which phase is most critical for your immediate needs?
2. **Embedding Costs** - Comfortable with OpenAI embedding costs (~$0.13 per 1M tokens)?
3. **Webhook Sources** - Which external systems should we prioritize (Slack, email, calendar)?
4. **Timeline UI** - Prefer left rail, modal, or separate page for memory timeline?
5. **Semantic Search** - Acceptable latency for semantic queries?

---

## Contact & Support

- **Primary Document**: This file (LIVING-MEMORY-SURGICAL-PLAN.md)
- **Phase Documents**: `docs/surgical-plan/PHASE-*.md`
- **Architecture Docs**: `docs/architecture/`
- **Database Schema**: `docs/audit/public_tables.sql`

---

**Last Updated**: 2025-10-30
**Version**: 1.0
**Status**: Ready for Implementation
