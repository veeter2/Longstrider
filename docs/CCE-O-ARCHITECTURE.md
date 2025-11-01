# CCE-O Architecture: The Single Entry/Exit Point

**Last Updated:** 2025-10-31
**Status:** Authoritative Architecture Document

---

## Core Principle: One Door In, One Door Out

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐       │
│  │   Chat   │  │  Left Rail   │  │ Living Memory   │       │
│  └────┬─────┘  └──────┬───────┘  └────────┬────────┘       │
│       │               │                   │                 │
│       └───────────────┴───────────────────┘                 │
│                       │                                     │
│                       │  SSE (text/event-stream)            │
│                       ▼                                     │
└───────────────────────────────────────────────────────────────┘
                        │
                        │
                 ┌──────▼──────┐
                 │   CCE-O     │  ◄── ONLY ENTRY/EXIT POINT
                 │ (Orchestrator)
                 └──────┬──────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼────┐   ┌─────▼──────┐   ┌───▼────────┐
   │Conductor│   │   Recall   │   │  Response  │
   └────┬────┘   └─────┬──────┘   └───┬────────┘
        │              │               │
        └──────────────┼───────────────┘
                       │
                 ┌─────▼──────────┐
                 │ Thread Manager │  ◄── Called BY CCE-O
                 │ (Aggregator)   │      NOT by frontend
                 └─────┬──────────┘
                       │
                ┌──────▼──────┐
                │ Gravity Map │  ◄── Source of truth
                │  (Database) │
                └─────────────┘
```

---

## Architecture Rules

### ✅ CORRECT Flow

1. **Frontend** sends message to **CCE-O** (SSE only)
2. **CCE-O** orchestrates internal CCE functions:
   - `cce-conductor` - Determines consciousness mode
   - `cce-recall` - Fetches relevant memories
   - `cce-response` - Generates AI response
   - **`thread-manager`** - Aggregates thread/project data
3. **CCE-O** streams response back to frontend via SSE
4. **Frontend** receives:
   - AI response tokens
   - Thread/project updates
   - Goal progress
   - Team contributions
   - Memory surfacing events

### ❌ INCORRECT Flow (DO NOT DO THIS)

```
Frontend ──X──> thread-manager   ❌ WRONG! Bypasses CCE-O
Frontend ──X──> gravity_map       ❌ WRONG! Direct DB access
Frontend ──X──> cce-recall        ❌ WRONG! Should go through CCE-O
```

---

## Thread Manager Role

**Thread Manager is:**
- ✅ An **aggregation layer** over `gravity_map`
- ✅ Called **internally by CCE-O** during orchestration
- ✅ Read-only (computes metrics, doesn't modify memories)
- ✅ Provides thread-level rollups:
  - Message count
  - Average gravity score
  - Dominant emotion
  - Token economics (used/saved)
  - Patterns detected
  - Goal progress
  - Hierarchy data (parent/child threads)

**Thread Manager is NOT:**
- ❌ A direct frontend API
- ❌ A separate entry point
- ❌ A bypass around CCE-O
- ❌ A replacement for `gravity_map`

---

## Payload Flow Enhancement

### Before (Basic Chat)
```json
{
  "user_message": "How do I...",
  "user_id": "abc123",
  "session_id": "xyz",
  "active_mode": "flow"
}
```

### After (Thread-Aware Chat)
```json
{
  "user_message": "How do I...",
  "user_id": "abc123",
  "session_id": "xyz",
  "thread_id": "thread-001",
  "active_mode": "flow",

  // NEW: Thread management data flows through CCE-O
  "thread_context": {
    "goals": [
      { "id": "g1", "title": "Ship MVP", "status": "in_progress", "progress": 68 }
    ],
    "team": [
      { "user_id": "abc123", "role": "lead" }
    ],
    "hierarchy": {
      "parent_thread_id": null,
      "child_thread_ids": ["child-1", "child-2"]
    }
  }
}
```

### Response Enhancement
```json
{
  "response": "Here's how...",
  "thread_updates": {
    "goal_progress": 72,  // Updated after this interaction
    "new_patterns": ["testing-strategy"],
    "gravity_delta": 0.15
  }
}
```

---

## Benefits of This Architecture

1. **Single Source of Truth**: All data flows through CCE-O
2. **Consciousness Integrity**: Every interaction goes through the full consciousness pipeline
3. **Centralized Logic**: Thread management logic lives in one place
4. **SSE Streaming**: Real-time updates for everything
5. **No Frontend Complexity**: Frontend just sends/receives from CCE-O
6. **Scalable**: Add new internal functions without changing frontend

---

## Implementation Checklist

- [ ] Thread-manager stays as internal edge function
- [ ] CCE-O calls thread-manager during orchestration
- [ ] Frontend payload includes thread_context
- [ ] CCE-O response includes thread_updates
- [ ] Living Memory queries through CCE-O (not thread-manager directly)
- [ ] Left rail displays thread data from CCE-O responses
- [ ] Remove any direct frontend → thread-manager calls

---

## Key Takeaway

**"One door in, one door out. CCE-O is the consciousness gateway. Everything else is internal orchestration."**

If you're about to add a new edge function that the frontend calls directly, **STOP**.
Ask: "Should this be called BY CCE-O instead?"

---

## See Also

- [Living Memory Vision](LIVING-MEMORY-VISION.md)
- [Surgical Plan](surgical-plan/)
- [Payload Spec](qa/payload-spec.md)
