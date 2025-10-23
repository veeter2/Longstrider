// ============================
// LONGSTRIDER TYPE SYSTEM v1.0
// Matches CCE Dispatcher v1.2 Payload Schema
// ============================

/**
 * Complete LongStrider Message Type
 * Maps 1:1 with CCE Dispatcher v1.2 payload structure
 */
export interface LSMessage {
  // === REQUIRED FIELDS (Backend) ===
  id: string                      // Auto-generated UUID
  user_id: string                 // REQUIRED
  content: string                 // REQUIRED

  // === SESSION & THREAD IDENTIFIERS ===
  session_id: string
  thread_id: string
  memory_trace_id: string         // UUID for tracking related memories
  conversation_name: string

  // === CLASSIFICATION FIELDS ===
  type: 'user' | 'assistant' | 'memory' | 'system'
  memory_type?: 'user_input' | 'ivy_response'  // Auto-determined by backend
  topic?: string
  summary?: string

  // === EMOTIONAL & GRAVITY ===
  sentiment?: string
  emotion?: string                // Drives emotion system
  gravity_score: number           // 0.0-1.0, triggers cascade at 0.7+

  // === V5.0 SCHEMA FIELDS ===
  statement_type?: string
  temporal_type?: 'static' | 'dynamic' | 'evolving'
  episodic?: boolean
  entities?: string[]
  relationship_strength?: number  // 0.0-1.0
  identity_anchor?: boolean       // 🔥 Triggers reflection engine
  contradiction_group?: string
  confidence_score?: number       // 0.0-1.0
  retrieval_score?: number        // 0.0-1.0
  fusion_score?: number           // 0.0-1.0
  overlay_context?: Record<string, any>
  persona_overlay?: string
  response_strategy?: string
  blocker_type?: string

  // === ORGANIZATIONAL ===
  org_id?: string
  project_id?: string
  meta_tags?: string[]
  t_valid?: string                // ISO timestamp

  // === TIMESTAMPS ===
  created_at: string              // ISO timestamp
  last_engaged?: string | null
  t_ingested: string              // ISO timestamp

  // === BACKEND METADATA ===
  source_table?: string           // 'gravity_map'
  status?: string                 // 'active'
  embedding?: number[] | null     // Only for user_input

  // === DYNAMIC METADATA (Any additional fields) ===
  metadata?: {
    // Known fallback locations
    thread_id?: string
    conversation_name?: string
    statement_type?: string
    temporal_type?: string
    episodic?: boolean
    entities?: string[]
    relationship_strength?: number
    identity_anchor?: boolean
    is_user_message?: boolean
    memory_type?: 'user_input' | 'ivy_response'
    role?: 'user' | 'assistant'
    source?: string

    // Dispatcher info
    dispatcher_version?: string
    processed_at?: string
    has_embedding?: boolean

    // 🎯 ANY FUTURE FIELDS (Dynamic discovery)
    [key: string]: any
  }

  // === FRONTEND STATE ===
  isStreaming?: boolean           // Streaming in progress
  streamId?: string               // SSE stream identifier
  ts: number                      // Frontend timestamp (Date.now())
}

/**
 * Agent Message Type
 * Proactive interventions from LongStrider agent
 */
export interface LSAgentMessage {
  id: string
  type: 'intervention' | 'insight' | 'warning' | 'suggestion' | 'discovery' | 'question' | 'reflection'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  trigger: {
    type: 'pattern' | 'threshold' | 'anomaly' | 'opportunity' | 'risk' | 'periodic' | 'user_request'
    confidence: number            // 0.0-1.0
    context?: any
  }
  content: {
    title: string
    message: string
    reasoning?: string
    evidence?: Array<{
      type: string
      data: any
      weight: number              // 0.0-1.0
    }>
    actions?: Array<{
      id: string
      label: string
      type: 'primary' | 'secondary' | 'destructive'
      payload: any
    }>
  }
  timing: {
    delay?: number                // ms to wait before showing
    expires?: number              // timestamp when insight becomes stale
    cooldown?: number             // ms before similar insight can trigger
  }
  metadata?: Record<string, any>
  timestamp: number
}

/**
 * Agent Behavior Configuration
 */
export interface AgentBehavior {
  mode: 'silent' | 'reactive' | 'proactive' | 'autonomous'
  interruption_threshold: number  // 0-1, how important before interrupting
  insight_frequency: 'realtime' | 'batched' | 'periodic'
  personality: {
    curiosity: number             // 0-1, how often to explore
    caution: number               // 0-1, how often to warn
    creativity: number            // 0-1, how often to suggest new ideas
    efficiency: number            // 0-1, how often to optimize
  }
  focus_areas: string[]           // What the agent is currently watching
}

/**
 * Memory Space (from Left Rail)
 */
export interface MemorySpace {
  id: string
  thread_id: string
  session_id: string
  name: string
  created: number
  updated: number

  // Metrics from backend
  metrics?: {
    message_count?: number
    token_count?: number
    total_cost?: number
    gravity_score?: number
    coherence?: number
    resonance?: number
    [key: string]: any            // Allow any other metrics
  }

  // Status
  status: 'hot' | 'warm' | 'cool' | 'cold' | 'archived'
  pinned?: boolean
  starred?: boolean

  // Relationships
  parent_id?: string
  child_ids?: string[]
  linked_ids?: string[]

  // Dynamic metadata
  metadata?: Record<string, any>
}

/**
 * Memory Cluster (groups of related spaces)
 */
export interface MemoryCluster {
  id: string
  name: string
  spaces: MemorySpace[]
  gravity_center?: number
  total_tokens?: number
  dominant_patterns?: string[]
}

/**
 * Pattern Stream (from Right Rail)
 */
export interface PatternStream {
  id: string
  pattern: string
  occurrences: number
  strength: number                // 0.0-1.0
  trend: 'rising' | 'falling' | 'stable'
  last_seen: number
  contexts: string[]
  related_patterns?: string[]
}

/**
 * Agent Insight (from Right Rail)
 */
export interface LSInsight {
  id: string
  type: 'pattern' | 'suggestion' | 'warning' | 'discovery' | 'connection' | 'prediction'
  content: string
  confidence: number              // 0.0-1.0
  timestamp: number
  source?: {
    thread_ids?: string[]
    message_ids?: string[]
    pattern_matches?: number
  }
  action?: {
    type: 'accept' | 'reject' | 'explore' | 'implement'
    label: string
    payload?: any
  }
  status?: 'new' | 'seen' | 'accepted' | 'rejected' | 'pending'
  metadata?: Record<string, any>
}

/**
 * Consciousness Metrics (from Right Rail)
 */
export interface ConsciousnessMetrics {
  current_mode: string
  coherence: number               // 0.0-1.0
  stability: number               // 0.0-1.0
  depth: number                   // 0.0-1.0
  emotional_field?: {
    dominant: string
    intensity: number             // 0.0-1.0
    valence: number               // 0.0-1.0
  }
  cognitive_load: number          // 0.0-1.0
  attention_focus?: string[]
}

/**
 * Agent Suggestion (from Right Rail)
 */
export interface AgentSuggestion {
  id: string
  suggestion: string
  reasoning: string
  impact: 'high' | 'medium' | 'low'
  category: 'optimization' | 'exploration' | 'correction' | 'enhancement'
  confidence: number              // 0.0-1.0
  auto_apply?: boolean
  requires_confirmation?: boolean
}

/**
 * SSE Event Types from Backend
 */
export type LSSSEEvent =
  | { type: 'connection_established'; data: any }
  | { type: 'message_start'; data: { message_id: string } }
  | { type: 'message_token'; data: { token: string; message_id: string } }
  | { type: 'message_complete'; data: LSMessage }
  | { type: 'agent_insight'; data: LSAgentMessage }
  | { type: 'agent_intervention'; data: LSAgentMessage }
  | { type: 'agent_warning'; data: LSAgentMessage }
  | { type: 'agent_suggestion'; data: LSAgentMessage }
  | { type: 'agent_discovery'; data: LSAgentMessage }
  | { type: 'agent_status'; data: { status: string } }
  | { type: 'agent_focus_change'; data: { focus_areas: string[] } }
  | { type: 'pattern_detected'; data: PatternStream }
  | { type: 'consciousness_update'; data: ConsciousnessMetrics }
  | { type: 'error'; data: { message: string; code?: string } }

/**
 * Unified Chat Message (LSMessage or AgentMessage)
 */
export type ChatMessage = LSMessage | LSAgentMessage

/**
 * Type guards
 */
export function isLSMessage(msg: ChatMessage): msg is LSMessage {
  return 'content' in msg && 'user_id' in msg
}

export function isAgentMessage(msg: ChatMessage): msg is LSAgentMessage {
  return 'trigger' in msg && 'content' in msg && 'title' in (msg as any).content
}

/**
 * Message sending payload (frontend → backend)
 */
export interface SendMessagePayload {
  user_id: string
  session_id: string
  thread_id: string
  conversation_name: string
  content: string
  type: 'user' | 'assistant'
  gravity_score?: number
  metadata?: Record<string, any>
}

/**
 * Living Memory Bridge Types
 */
export interface LivingMemoryEntry {
  id: string
  thread_id: string
  session_id: string
  conversation_name: string
  title: string
  summary: string
  content: string
  timestamp: number
  lastUpdated: number
  messageCount: number
  gravity_score: number
  emotion: string
  keyThemes: string[]
  patterns: string[]
  entities: string[]
  status: 'hot' | 'warm' | 'cool' | 'cold' | 'archived'
  starred?: boolean
}
