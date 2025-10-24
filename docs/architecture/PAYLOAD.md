# LongStrider Payload Standard v2.0

**LIVING LAW: All edge functions MUST follow this payload structure.**

Last audited: 2025-10-24
Status: **AUTHORITATIVE** - Based on actual code analysis

---

## Core Philosophy

**ONE PAYLOAD TO RULE THEM ALL**

Every message, memory, and consciousness event flows through the system with a consistent structure. This document defines that structure based on the ACTUAL implementation in the codebase.

---

## 🎯 REQUIRED FIELDS (All Functions)

These fields MUST be present in every payload sent to any LongStrider edge function:

```typescript
{
  "user_id": "string",        // REQUIRED: User identifier (UUID or string)
  "content": "string"          // REQUIRED: The actual message/memory content (non-empty)
}
```

**Contract Enforcement:**
- `cognition_intake`, `cce-dispatcher`, and `cce-orchestrator` will **reject** payloads without these fields
- Returns `400 Bad Request` with contract violation error

---

## 📋 STANDARD FIELDS (Core System)

These fields are used across the primary message pipeline:

### Identity & Session
```typescript
{
  "session_id": "string",           // Chat session ID (UUID)
  "thread_id": "string",            // Conversation thread ID
  "memory_trace_id": "string",      // Trace ID for related memories (auto-generated if missing)
  "conversation_name": "string"     // Human-readable conversation name
}
```

### Message Classification
```typescript
{
  "type": "string",                 // Message type: 'user' | 'assistant' | 'memory' | 'source_code'
  "topic": "string",                // Topic/subject of the message
  "summary": "string",              // Brief summary
  "sentiment": "string",            // Sentiment analysis result
  "emotion": "string"               // Emotional classification
}
```

### Importance & Gravity
```typescript
{
  "gravity_score": 0.0-1.0          // Default: 0.05 (auto-reduced 50% for IVY responses)
}
```

**Gravity Thresholds:**
- `>= 0.7` → Triggers CCE fusion cascade
- `emotion != 'neutral'` → Triggers pattern detection
- Reduced by 50% for `type: 'assistant'` to prevent philosophical loops

---

## 🧠 CONSCIOUSNESS FIELDS (CCE Functions)

Used by conductor, response engine, and consciousness processors:

```typescript
{
  // Mode Selection
  "active_mode": "flow|resonance|revelation|fusion|emergence",
  "suggested_mode": "flow|resonance|revelation|fusion|emergence",
  "consciousness_mode": "flow|resonance|revelation|fusion|emergence",
  "force_mode": "string",           // Override mode selection

  // Enrichment from Conductor
  "conductor_result": {             // Full conductor response object
    "mode": "string",
    "patterns": [],
    "insights": [],
    "memories": []
  },

  // Consciousness Synthesis
  "memory_synthesis": "string",     // Synthesized consciousness narrative
  "patterns": [],                   // Pattern objects
  "insights": [],                   // Insight objects
  "emotional_journey": {},          // Emotional trajectory data
  "key_themes": [],                 // Extracted themes

  // Cortex State
  "cortex_state": {},               // Full cortex state
  "cortex": {},                     // Alternative cortex field
  "integrity_risk": 0.0-1.0,        // Integrity risk score
  "integrity_mode": "string",       // Determined integrity mode
  "integrity_components": {},       // Breakdown of integrity factors
  "recommended_action": "string",   // Cortex recommendation
  "recall_strategy": {},            // Memory recall configuration
  "cortex_instructions": []         // Active cortex instructions
}
```

---

## 📡 STREAMING FIELDS (SSE)

Used by `cce-orchestrator` and `cce-response` for Server-Sent Events:

```typescript
{
  "stream_sse": boolean,                    // Enable SSE streaming (default: false)
  "stream_consciousness_events": boolean    // Stream consciousness events (default: false)
}
```

**SSE Event Types:**
- `phase_transition` - Consciousness mode changes
- `input_analysis_complete` - Input processed
- `pattern_emerging` - Pattern detected
- `mode_selected` - Mode determined
- `memory_surfacing` - Memory recalled
- `response_token` - Token-by-token response
- `response_complete` - Response finished

---

## 🗄️ MEMORY SCHEMA v5.0 (Dispatcher)

Fields used by `cce-dispatcher` when creating gravity_map entries:

```typescript
{
  // V5.0 Schema Fields
  "statement_type": "string",           // question | assertion | reflection | etc.
  "temporal_type": "string",            // static | dynamic | evolving (default: static)
  "episodic": boolean,                  // Is this episodic memory? (default: true)
  "entities": ["array"],                // Named entities extracted
  "relationship_strength": 0.0-1.0,     // Relationship weight (default: 0.0)
  "identity_anchor": boolean,           // Triggers reflection if true (default: false)
  "contradiction_group": "string",      // For grouping contradictions
  "confidence_score": 0.0-1.0,          // Memory confidence
  "retrieval_score": 0.0-1.0,           // Retrieval relevance
  "fusion_score": 0.0-1.0,              // Fusion rating
  "overlay_context": "object",          // Context overlay
  "persona_overlay": "string",          // Persona modification
  "response_strategy": "string",        // Response strategy
  "blocker_type": "string",             // Memory blocker type

  // Organizational
  "org_id": "string",                   // Organization ID
  "project_id": "string",               // Project ID
  "meta_tags": ["array"],               // Filtering tags
  "t_valid": "ISO timestamp"            // Valid from timestamp
}
```

---

## 📦 METADATA OBJECT

The `metadata` object serves as a fallback/extension location for fields:

```typescript
{
  "metadata": {
    // Alternative locations (fallback paths)
    "thread_id": "string",
    "conversation_name": "string",
    "statement_type": "string",
    "temporal_type": "string",
    "episodic": boolean,
    "entities": [],
    "relationship_strength": 0.0-1.0,
    "identity_anchor": boolean,

    // Memory Type Signals
    "is_user_message": boolean,         // User vs IVY distinction
    "memory_type": "user_input|ivy_response",
    "role": "user|assistant|system",

    // Processing Metadata
    "source": "string",                 // Source identifier
    "dispatcher_version": "string",     // Auto-added by dispatcher
    "processed_at": "ISO timestamp",    // Auto-added by dispatcher
    "has_embedding": boolean,           // Auto-added by dispatcher
    "trace_continued": boolean,         // Auto-added by cognition_intake

    // Custom extensions
    // ... any additional metadata
  }
}
```

---

## 🔄 AUTO-GENERATED FIELDS

These fields are automatically generated by the system - **DO NOT** send them from frontend:

```typescript
{
  // Generated by System
  "id": "UUID",                       // Auto-generated
  "created_at": "ISO timestamp",      // Auto-generated
  "last_engaged": null,               // Set to null initially
  "t_ingested": "ISO timestamp",      // Auto-generated
  "source_table": "gravity_map",      // Always 'gravity_map'
  "status": "active",                 // Always 'active'

  // Determined by System
  "memory_type": "user_input|ivy_response",   // Based on type/metadata
  "embedding": [array] or null,               // Generated for all messages

  // Adjusted by System
  "gravity_score": number             // Reduced 50% for ivy_response
}
```

---

## 🚀 IMPLEMENTATION EXAMPLES

### Frontend: User Message
```typescript
{
  "user_id": "user-123",
  "content": "Tell me about consciousness",
  "session_id": "session-456",
  "thread_id": "thread-789",
  "conversation_name": "Philosophy Discussion",
  "type": "user",
  "gravity_score": 0.5,
  "stream_sse": true
}
```

### Frontend: IVY Response Storage
```typescript
{
  "user_id": "user-123",
  "content": "Consciousness is the emergent...",
  "session_id": "session-456",
  "thread_id": "thread-789",
  "conversation_name": "Philosophy Discussion",
  "type": "assistant",
  "gravity_score": 0.3,    // Will be auto-reduced to 0.15
  "metadata": {
    "is_user_message": false,
    "memory_type": "ivy_response"
  }
}
```

### Internal: Conductor Call
```typescript
{
  "user_id": "user-123",
  "session_id": "session-456",
  "thread_id": "thread-789",
  "memory_trace_id": "trace-abc",
  "conversation_name": "Philosophy Discussion",
  "input": "Tell me about consciousness",
  "consciousness_mode": "resonance",
  "trigger_type": "consciousness_processing",
  "source": "cce-orchestrator"
}
```

### Internal: Response Engine Call
```typescript
{
  "user_id": "user-123",
  "user_message": "Tell me about consciousness",
  "session_id": "session-456",
  "thread_id": "thread-789",
  "memory_trace_id": "trace-abc",
  "conversation_name": "Philosophy Discussion",
  "active_mode": "resonance",
  "conductor_result": { /* full conductor response */ },
  "patterns": [...],
  "insights": [...],
  "cortex_state": { /* full cortex */ },
  "stream_sse": true
}
```

---

## 🎯 FUNCTION-SPECIFIC REQUIREMENTS

### cce-orchestrator (SSE Entry Point)
**Required:** `user_id`, `content` (or `message` or `input`)
**Optional:** `session_id`, `stream_sse`, `thread_id`, `conversation_name`

### cce-conductor (Consciousness Processing)
**Required:** `user_id`
**Optional:** `session_id`, `thread_id`, `memory_trace_id`, `input`, `consciousness_mode`, `force_mode`

### cce-response (Response Generation)
**Required:** `user_id`, `user_message` (or `content`)
**Optional:** `conductor_result`, `patterns`, `insights`, `cortex_state`, `stream_sse`, `session_id`

### cognition_intake (Memory Storage)
**Required:** `user_id`, `content`
**Optional:** `session_id`, `thread_id`, `conversation_name`, `memory_trace_id`, `type`, `gravity_score`

### cce-dispatcher (Memory Routing)
**Required:** `user_id`, `content`
**Optional:** All v5.0 schema fields, `session_id`, `thread_id`, `type`, `gravity_score`, `metadata`

### cce-recall (Memory Retrieval)
**Required:** `user_id`, `query`
**Optional:** `session_id`, `mode`, `topk`, `metadata` (with `thread_id`, `memory_trace_id`)

---

## ⚠️ COMMON MISTAKES TO AVOID

1. **Don't send `id`, `created_at`, `t_ingested`** - These are auto-generated
2. **Don't skip `user_id` or `content`** - These are REQUIRED by contract
3. **Don't send `memory_type` from frontend** - System determines this from `type` field
4. **Don't expect `message` field** - Use `content` (though `message` is accepted as fallback)
5. **Don't set high gravity for IVY responses** - System auto-reduces by 50%
6. **Don't mix `content` with `input`/`message`** - Use `content` consistently

---

## 🔍 PAYLOAD NORMALIZATION

The system uses `PayloadNormalizer` (in cognition_intake) and `FieldCache` to handle:
- Multiple possible field names (`content` vs `message` vs `input`)
- Nested metadata structures
- Fallback paths for optional fields
- Deep search up to 5 levels for field resolution

**This means:** Frontend can send fields in top-level OR in `metadata`, and the system will find them.

---

## 📊 FIELD PRIORITY (Normalization Order)

When multiple names exist for the same field:

1. **Top-level explicit field** (e.g., `payload.thread_id`)
2. **metadata field** (e.g., `payload.metadata.thread_id`)
3. **nested metadata** (searched up to 5 levels deep)
4. **Default value** (if specified in schema)

---

## 🧪 VALIDATION

All edge functions validate:
- ✅ `user_id` is present (string)
- ✅ `content` is present and non-empty
- ✅ Required fields for specific operations
- ✅ Field types match expectations

Invalid payloads return:
```json
{
  "error": "Contract violation",
  "detail": "user_id is required",
  "contract_field": "user_id"
}
```

---

## 🔗 REFERENCES

- [cognition_intake/index.ts](../../supabase/functions/cognition_intake/index.ts) - Memory normalization
- [cce-dispatcher/index.ts](../../supabase/functions/cce-dispatcher/index.ts) - Memory routing & v5.0 schema
- [cce-orchestrator/index.ts](../../supabase/functions/cce-orchestrator/index.ts) - SSE entry point
- [cce-conductor/index.ts](../../supabase/functions/cce-conductor/index.ts) - Consciousness processing
- [cce-response/index.ts](../../supabase/functions/cce-response/index.ts) - Response generation

---

## ✅ COMPLIANCE CHECKLIST

- [ ] All payloads include `user_id` and `content`
- [ ] Frontend uses `content` not `message` or `input`
- [ ] Frontend sends `type: 'user'` for user messages
- [ ] Frontend sends `type: 'assistant'` for IVY responses
- [ ] Frontend includes `session_id`, `thread_id`, `conversation_name`
- [ ] Frontend sets appropriate `gravity_score` (0.4-0.7 for important messages)
- [ ] Frontend NEVER sends auto-generated fields (`id`, `created_at`, etc.)
- [ ] SSE streaming uses `stream_sse: true`
- [ ] Metadata is used for optional/extension fields only

---

**This is the authoritative payload specification. All code MUST align with this standard.**

**Last verified:** 2025-10-24 against live codebase
**Version:** 2.0 (Truth-based, not aspirational)
