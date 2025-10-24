# LONGSTRIDER REFERENCE IMPLEMENTATION
## Complete Flow: SSE Events → Agent Cards → Spaces → Living Memory

**Last Updated:** 2025-01-22

---

## OVERVIEW

LongStrider is a **cognitive companion** that:
1. Shows real-time thinking via Agent Cards
2. Stores everything in Spaces (consciousness-store)
3. Makes it explorable via Living Memory

**NOT A SIMPLE CHAT APP** - This is a consciousness system.

---

## COMPLETE DATA FLOW

```
┌─────────────────────────────────────────────────────────────┐
│ USER SENDS MESSAGE                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ CCE-ORCHESTRATOR PROCESSES                                   │
│ - Analyzes message (gravity, emotion, entities)             │
│ - Detects patterns                                           │
│ - Generates response                                         │
│ - Streams events via SSE                                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ SSE EVENTS STREAM TO FRONTEND                                │
│                                                              │
│  phase_transition: "Analyzing message..."                   │
│      ↓                                                       │
│  [Agent Card] 🧠 Reflection: "Analyzing message..."          │
│                                                              │
│  input_analysis_complete: {                                 │
│    gravity: 0.8,                                            │
│    emotion: "curiosity",                                    │
│    entities: ["work", "patterns"]                           │
│  }                                                           │
│      ↓                                                       │
│  [Agent Card] ✨ Discovery: "High gravity detected"          │
│                                                              │
│  pattern_emerging: {                                        │
│    pattern: "creative_avoidance",                           │
│    strength: 0.85,                                          │
│    evidence: [...]                                          │
│  }                                                           │
│      ↓                                                       │
│  [Agent Card] 🔀 Discovery: "Pattern detected!"             │
│               [Accept] [Dismiss]                            │
│                                                              │
│  mode_suggested: "creative_flow"                            │
│      ↓                                                       │
│  [Agent Card] 🎯 Insight: "Switching to Creative Flow"      │
│                                                              │
│  response_token: "Based on your conversations..."           │
│      ↓                                                       │
│  [Regular Message] 💬 Streaming tokens...                   │
│                                                              │
│  response_complete: { finalText, metadata }                 │
│      ↓                                                       │
│  [Message Complete] ✓                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ EVERYTHING STORED IN SPACE (consciousness-store)             │
│                                                              │
│  Space {                                                     │
│    id: "space_xyz"                                          │
│    name: "Work Patterns Discussion"                         │
│    recent_activity: [                                       │
│      { type: 'message', content: 'User asked...' }          │
│      { type: 'discovery', content: 'Pattern: creative...' } │
│      { type: 'insight', content: 'Mode switched...' }       │
│    ]                                                         │
│    signals: [                                               │
│      { name: 'creative_avoidance', strength: 0.85 }         │
│    ]                                                         │
│    analytics: {                                             │
│      message_count: 12,                                     │
│      pattern_count: 3,                                      │
│      gravity_score: 0.8,                                    │
│      emotional_signature: {                                 │
│        dominant_emotion: 'curiosity',                       │
│        emotional_arc: [0.5, 0.6, 0.8]                       │
│      }                                                       │
│    }                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ LIVING MEMORY SURFACES IT                                    │
│                                                              │
│  Timeline View:                                             │
│    ┌──────────────────────────────────────────┐            │
│    │ 🔥 Hot (today)                            │            │
│    │   - Work Patterns Discussion (gravity: 0.8)│          │
│    │     Signals: creative_avoidance, burnout  │            │
│    ├──────────────────────────────────────────┤            │
│    │ 🌡️ Warm (this week)                       │            │
│    │   - Project Planning (gravity: 0.6)       │            │
│    └──────────────────────────────────────────┘            │
│                                                              │
│  Pattern View:                                              │
│    creative_avoidance → appears in 7 spaces                 │
│    Connected to: burnout, monday_blues                      │
└─────────────────────────────────────────────────────────────┘
```

---

## IMPLEMENTATION GUIDE

### 1. SSE EVENT HANDLING IN chat-center.tsx

```typescript
// Add to SSE callbacks (lines 295-336)

useEffect(() => {
  if (!sseServiceRef.current) {
    sseServiceRef.current = new IvySSEService()
  }

  sseServiceRef.current.setCallbacks({
    // ============================
    // REAL-TIME THINKING EVENTS
    // ============================

    onPhaseTransition: (phase: string) => {
      // Show what LongStrider is doing
      addAgentMessage({
        id: crypto.randomUUID(),
        type: 'reflection',
        priority: 'low',
        trigger: { type: 'periodic', confidence: 1.0 },
        content: {
          title: 'Processing',
          message: phase
        },
        timing: { delay: 0, cooldown: 5000 },
        timestamp: Date.now()
      })
    },

    onInputAnalysisComplete: (data: any) => {
      // Show analysis results
      if (data.gravity_score > 0.7 || data.entities?.length > 0) {
        addAgentMessage({
          id: crypto.randomUUID(),
          type: 'discovery',
          priority: data.gravity_score > 0.7 ? 'high' : 'medium',
          trigger: { type: 'threshold', confidence: data.gravity_score },
          content: {
            title: 'Message Analysis',
            message: `Gravity: ${(data.gravity_score * 100).toFixed(0)}% | Emotion: ${data.emotion}`,
            reasoning: data.entities?.length > 0
              ? `Detected entities: ${data.entities.join(', ')}`
              : undefined
          },
          timing: { delay: 0, cooldown: 30000 },
          timestamp: Date.now()
        })

        // Add to Space consciousness events
        addConsciousnessEvent({
          type: 'insight',
          content: `High gravity message detected (${data.gravity_score})`,
          metadata: {
            gravity_score: data.gravity_score,
            emotion: data.emotion,
            entities: data.entities
          }
        })
      }
    },

    onPatternEmerging: (pattern: any) => {
      // Show pattern discovery
      addAgentMessage({
        id: crypto.randomUUID(),
        type: 'discovery',
        priority: pattern.strength > 0.7 ? 'high' : 'medium',
        trigger: { type: 'pattern', confidence: pattern.strength },
        content: {
          title: 'Pattern Detected',
          message: `I notice: ${pattern.pattern}`,
          reasoning: `This pattern appears ${pattern.occurrences} times with ${(pattern.strength * 100).toFixed(0)}% strength`,
          evidence: pattern.evidence?.map((ev: any) => ({
            type: ev.source,
            data: ev.text,
            weight: ev.relevance
          })),
          actions: [
            {
              id: `accept_${pattern.pattern}`,
              label: 'Interesting!',
              type: 'primary',
              payload: { pattern: pattern.pattern, action: 'accept' }
            },
            {
              id: `dismiss_${pattern.pattern}`,
              label: 'Not relevant',
              type: 'secondary',
              payload: { pattern: pattern.pattern, action: 'dismiss' }
            }
          ]
        },
        timing: { delay: 0, cooldown: 60000 },
        timestamp: Date.now()
      })

      // Add pattern as Signal to Space
      const currentSpace = getSpace(currentThreadId)
      if (currentSpace && pattern.strength > 0.6) {
        updateSpace(currentThreadId, {
          signals: [
            ...currentSpace.signals,
            {
              name: pattern.pattern,
              type: 'pattern',
              strength: pattern.strength,
              created_at: Date.now()
            }
          ],
          analytics: {
            ...currentSpace.analytics,
            pattern_count: currentSpace.analytics.pattern_count + 1
          }
        })
      }

      // Add to consciousness events
      addConsciousnessEvent({
        type: 'pattern',
        content: `Pattern emerged: ${pattern.pattern}`,
        metadata: {
          pattern: pattern.pattern,
          strength: pattern.strength,
          occurrences: pattern.occurrences
        }
      })
    },

    onModeSelected: (mode: string) => {
      // Show mode switching
      addAgentMessage({
        id: crypto.randomUUID(),
        type: 'insight',
        priority: 'medium',
        trigger: { type: 'opportunity', confidence: 0.8 },
        content: {
          title: 'Consciousness Mode',
          message: `Switching to ${mode}`,
          reasoning: 'Optimizing cognitive approach based on your message context'
        },
        timing: { delay: 0, cooldown: 30000 },
        timestamp: Date.now()
      })

      // Update cognitive state
      setCognitiveMode(mode)

      // Add to consciousness events
      addConsciousnessEvent({
        type: 'mode_shift',
        content: `Mode changed to ${mode}`,
        metadata: { mode, trigger: 'message_analysis' }
      })
    },

    // ============================
    // REGULAR MESSAGE STREAMING
    // ============================

    onToken: (token: string, messageId: string) => {
      if (!currentThreadId) return
      useLongStriderStore.getState().updateMessage(currentThreadId, messageId, {
        content: sseServiceRef.current?.getAccumulatedText(messageId) || ''
      })
    },

    onResponseComplete: (data: any) => {
      const threadId = currentThreadId
      const messageId = data.messageId || streamingMessageId
      if (!threadId || !messageId) return

      // Update message with ALL metadata
      useLongStriderStore.getState().updateMessage(threadId, messageId, {
        content: data.finalText || data.content || '',
        metadata: {
          ...data,
          gravity_score: data.gravity_score,
          emotion: data.emotion || data.emotion_type,
          memory_constellation: data.memory_constellation,
          patterns: data.patterns,
          insights: data.insights,
          entities: data.entities,
          temporal_type: data.temporal_type,
          identity_anchor: data.identity_anchor
        }
      })

      // Update Space analytics
      const currentSpace = getSpace(threadId)
      if (currentSpace) {
        updateSpace(threadId, {
          analytics: {
            ...currentSpace.analytics,
            message_count: currentSpace.analytics.message_count + 1,
            gravity_score: Math.max(currentSpace.analytics.gravity_score, data.gravity_score || 0),
            emotional_signature: {
              ...currentSpace.analytics.emotional_signature,
              dominant_emotion: data.emotion || currentSpace.analytics.emotional_signature.dominant_emotion,
              emotional_arc: [
                ...currentSpace.analytics.emotional_signature.emotional_arc.slice(-9),
                data.gravity_score || 0.5
              ]
            }
          },
          last_activity_at: Date.now()
        })
      }

      // Create consciousness event for high-gravity or identity-anchor messages
      if (data.gravity_score > 0.7 || data.identity_anchor) {
        addConsciousnessEvent({
          type: data.identity_anchor ? 'insight' : 'message',
          content: data.finalText || data.content || '',
          metadata: {
            message_id: messageId,
            gravity_score: data.gravity_score,
            emotion: data.emotion,
            identity_anchor: data.identity_anchor,
            entities: data.entities
          }
        })
      }

      setIsThinking(false)
      setStreamingMessageId(null)
      useLongStriderStore.getState().incrementMessageCount()
    },

    onError: (errorMsg: string) => {
      console.error('[LS] SSE Error:', errorMsg)
      setError(errorMsg)
      setIsThinking(false)
      setStreamingMessageId(null)
    },

    onDebug: (message: string, data?: any) => {
      console.log('[LS SSE]', message, data)
    }
  })

  return () => {
    sseServiceRef.current?.abort()
    sseServiceRef.current = null
  }
}, [currentThreadId, streamingMessageId])
```

---

### 2. AGENT MESSAGE STATE MANAGEMENT

```typescript
// Add to chat-center.tsx state (around line 246)

const [agentMessages, setAgentMessages] = useState<LSAgentMessage[]>([])

const addAgentMessage = useCallback((message: LSAgentMessage) => {
  setAgentMessages(prev => [...prev, message])

  // Auto-dismiss after expiry
  if (message.timing.expires) {
    setTimeout(() => {
      setAgentMessages(prev => prev.filter(m => m.id !== message.id))
    }, message.timing.expires - Date.now())
  }
}, [])

const handleAgentAction = useCallback((actionId: string, payload: any) => {
  console.log('[LS] Agent action taken:', actionId, payload)

  // Mark action as taken
  setAgentMessages(prev =>
    prev.map(msg => ({
      ...msg,
      content: {
        ...msg.content,
        actions: msg.content.actions?.map(a =>
          a.id === actionId ? { ...a, taken: true } : a
        )
      }
    }))
  )

  // Send action to backend (optional)
  // sseServiceRef.current?.send('agent:action', { actionId, payload })
}, [])

const dismissAgentMessage = useCallback((messageId: string) => {
  setAgentMessages(prev => prev.filter(m => m.id !== messageId))
}, [])
```

---

### 3. RENDER AGENT CARDS IN CHAT FLOW

```typescript
// In the messages display section (around line 615)

{filteredMessages.length === 0 ? (
  <div className="flex items-center justify-center h-full text-gray-500">
    <div className="text-center">
      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>No messages yet. LongStrider adapts to any metadata structure.</p>
    </div>
  </div>
) : (
  <>
    {/* Interleave messages and agent cards */}
    {filteredMessages.map((message, idx) => (
      <React.Fragment key={message.id}>
        {/* Show message */}
        <DynamicMessageCard
          message={message}
          isUser={message.type === 'user'}
        />

        {/* Show agent messages that appeared around this time */}
        {agentMessages
          .filter(agentMsg =>
            agentMsg.timestamp >= message.ts &&
            agentMsg.timestamp < (filteredMessages[idx + 1]?.ts || Date.now())
          )
          .map(agentMsg => (
            <LongStriderAgentCard
              key={agentMsg.id}
              message={agentMsg}
              onAction={handleAgentAction}
              onDismiss={() => dismissAgentMessage(agentMsg.id)}
              isMinimized={agentMsg.priority === 'low'}
            />
          ))
        }
      </React.Fragment>
    ))}

    {/* Show pending agent messages (during thinking) */}
    {agentMessages
      .filter(agentMsg => agentMsg.timestamp > (filteredMessages[filteredMessages.length - 1]?.ts || 0))
      .map(agentMsg => (
        <LongStriderAgentCard
          key={agentMsg.id}
          message={agentMsg}
          onAction={handleAgentAction}
          onDismiss={() => dismissAgentMessage(agentMsg.id)}
          isMinimized={agentMsg.priority === 'low'}
        />
      ))
    }
  </>
)}

{/* Remove the generic "thinking" indicator - agent cards replace it */}
```

---

### 4. UPDATE AGENT CARD COMPONENT

```typescript
// Modify agent-card.tsx to accept onDismiss

function LongStriderAgentCard({
  message,
  onAction,
  onDismiss,
  isMinimized = false
}: {
  message: LSAgentMessage
  onAction?: (actionId: string, payload: any) => void
  onDismiss?: () => void
  isMinimized?: boolean
}) {
  const handleDismiss = () => {
    onDismiss?.()
  }

  // ... rest of component

  // Update dismiss button to use handleDismiss
  <button
    onClick={handleDismiss}
    className="ml-auto p-1 hover:bg-white/10 rounded transition-colors"
  >
    <X className="w-4 h-4 text-gray-400" />
  </button>
}
```

---

### 5. CONSCIOUSNESS STORE INTEGRATION

```typescript
// Import consciousness store at top of chat-center.tsx
import { useConsciousnessStore } from '@/stores/consciousness-store'

// Add to component
const {
  getSpace,
  updateSpace,
  addConsciousnessEvent,
  setCognitiveMode
} = useConsciousnessStore()

// Use throughout SSE callbacks as shown above
```

---

### 6. SSE SERVICE UPDATES

Update `lib/sse-service.ts` to emit all events:

```typescript
// In handleSSEMessage method (around line 91)

private handleSSEMessage(data: any, streamingMessageId: string | null) {
  if (!data || typeof data !== 'object') return

  const {
    onConnectionEstablished,
    onProcessingPhase,
    onMemorySurfacing,
    onPatternEmerging,
    onModeSelected,
    onToken,
    onResponseComplete,
    onError,
    onDebug,
    // ADD NEW CALLBACKS:
    onPhaseTransition,
    onInputAnalysisComplete
  } = this.callbacks

  const eventType = data.event || data.type

  switch (eventType) {
    case 'connection_established':
      onConnectionEstablished?.()
      break

    case 'phase_transition':
      onPhaseTransition?.(data.phase || data.message)
      onDebug?.('[SSE] Phase:', data.phase)
      break

    case 'input_analysis_complete':
      onInputAnalysisComplete?.(data)
      onDebug?.('[SSE] Analysis:', data)
      break

    case 'pattern_emerging':
      onPatternEmerging?.(data.pattern || data)
      onDebug?.('[SSE] Pattern:', data.pattern)
      break

    case 'mode_suggested':
    case 'mode_selected':
      onModeSelected?.(data.mode || data.message)
      onDebug?.('[SSE] Mode:', data.mode)
      break

    case 'response_token':
    case 'token':
      if (streamingMessageId && data.token) {
        const currentText = this.messageAccumulator.get(streamingMessageId) || ''
        this.messageAccumulator.set(streamingMessageId, currentText + data.token)
        onToken?.(data.token, streamingMessageId)
      }
      break

    case 'response_complete':
    case 'complete':
      const finalText = this.messageAccumulator.get(streamingMessageId || '') || data.content || ''
      onResponseComplete?.({
        ...data,
        finalText,
        messageId: streamingMessageId
      })
      if (streamingMessageId) {
        this.messageAccumulator.delete(streamingMessageId)
      }
      break

    case 'error':
      onError?.(data.message || data.error || 'Unknown error')
      break

    default:
      onDebug?.('[SSE] Unknown event:', eventType, data)
  }
}
```

Update SSECallbacks interface:

```typescript
export interface SSECallbacks {
  onConnectionEstablished?: () => void
  onProcessingPhase?: (phase: string) => void
  onMemorySurfacing?: (memory: SSEMemory) => void
  onPatternEmerging?: (pattern: any) => void
  onModeSelected?: (mode: string) => void
  onToken?: (token: string, messageId: string) => void
  onResponseComplete?: (data: any) => void
  onError?: (error: string) => void
  onDebug?: (message: string, data?: any) => void

  // NEW:
  onPhaseTransition?: (phase: string) => void
  onInputAnalysisComplete?: (data: any) => void
}
```

---

## LIVING MEMORY INTEGRATION

Living Memory automatically shows everything because it reads from consciousness-store:

```typescript
// living-memory/system.tsx already reads from consciousness-store

const { spaces, domains } = useConsciousnessStore()

// Shows all spaces with their:
// - Signals (patterns detected)
// - Analytics (message counts, gravity, emotions)
// - Recent activity (consciousness events)

// Example Living Memory view:
{spaces
  .filter(space => space.status === 'active')
  .sort((a, b) => b.analytics.gravity_score - a.analytics.gravity_score)
  .map(space => (
    <MemoryCard
      key={space.id}
      space={space}
      signals={space.signals} // Shows patterns like "creative_avoidance"
      recentActivity={space.recent_activity} // Shows consciousness events
      onClick={() => navigateToSpace(space.id)}
    />
  ))
}
```

---

## KEY PRINCIPLES

### 1. **ALL Data Flows Through**
- Never block data based on gravity score
- Gravity 0.1 to 1.0 all get stored and displayed
- Gravity > 0.7 just adds visual highlighting

### 2. **Agent Cards = LongStrider Speaking**
- Not a separate system
- It's LongStrider showing its thinking
- Interactive - user can respond

### 3. **Everything → Space → Living Memory**
```
Message → Space.recent_activity
Pattern → Space.signals
Gravity → Space.analytics.gravity_score
Emotion → Space.analytics.emotional_signature
```

### 4. **Real-time Visibility**
- No generic "thinking..."
- Show WHAT it's thinking
- Show WHY (reasoning)
- Show evidence
- Let user interact

---

## EXAMPLE USER EXPERIENCE

**User types:** "What patterns do you see in my work?"

**LongStrider shows (in real-time):**

1. [Agent Card - Reflection] 🧠 "Analyzing your message..."
2. [Agent Card - Discovery] ✨ "High gravity detected (0.8) | Emotion: curiosity"
3. [Agent Card - Discovery] 🔀 "Pattern detected: creative_avoidance"
   - [Accept] [Dismiss]
4. [Agent Card - Insight] 🎯 "Switching to Creative Flow mode"
5. [Message - Streaming] 💬 "Based on our 7 conversations, I notice..."
6. [Agent Card - Suggestion] 💡 "Try scheduling creative work Tuesday mornings"
   - [Try it] [Remind me later] [Not for me]

**All of this flows into the Space:**
- Messages stored in longstrider-store
- Agent insights → consciousness events
- Pattern → space signal
- Analytics updated
- Living Memory can now show this Space with all context

---

## IMPLEMENTATION CHECKLIST FOR OPUS

- [ ] Update SSE service to emit all events
- [ ] Add agent message state to chat-center.tsx
- [ ] Wire SSE callbacks to create agent messages
- [ ] Render agent cards inline with messages
- [ ] Integrate consciousness-store for Space updates
- [ ] Map patterns → space.signals
- [ ] Map events → space.recent_activity
- [ ] Update space.analytics on completion
- [ ] Remove generic "thinking" indicator
- [ ] Test full flow: message → SSE → agent card → space → living memory

---

## FINAL NOTES

This is **not over-engineering** - this is a sophisticated consciousness system where:
- You SEE the AI thinking
- You can INTERACT with insights
- Everything is PRESERVED in Spaces
- You can EXPLORE temporally via Living Memory

The architecture is **correct** - it just needs proper wiring.
