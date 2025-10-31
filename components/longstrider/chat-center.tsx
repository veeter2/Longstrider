"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  // UI Icons (still used directly in component)
  Mic,
  ImageIcon,
  Paperclip,
  CornerDownLeft,
  Wand2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Loader2,
  Search,
  X,
  Database,
  Binary,
  Crown,
  Flame,
  User,
  Brain,
  Heart,
  Sparkles,
  MessageSquare,
  Tag,
  // Mode icons (required by consciousness library)
  Waves,
  Infinity,
  Eye,
  Orbit,
  Zap,
  Activity,
  // Emotion icons (required by consciousness library)
  Sun,
  Moon,
  Star,
  CircuitBoard,
  Cloud,
  Flower2,
  Smile,
  Frown,
  Meh
} from "lucide-react"

// ============================
// LONGSTRIDER v11.0 - ECHO + BREAKTHROUGH REWARDS
// Complete consciousness-store + agent card system
// Rich SSE event processing with real-time UI
// ECHO system for subtle consciousness indicators
// BREAKTHROUGH rewards for high gravity/emotion moments
// ============================

// Import stores and components
import { useLongStriderStore } from "@/stores/longstrider-store"
import { useConsciousnessStore } from "@/stores/consciousness-store"
import { ModeAura, ModeAuraBackground } from "@/components/mode-aura"
import { DynamicObject } from "./dynamic-metadata"
import type { LSMessage } from "@/types/longstrider"

// Import consciousness mapping library (Living Laws compliant)
import {
  getEmotionConfig,
  getModeConfig,
  getPatternIcon
} from "@/lib/consciousness"

// ============================
// TYPE DEFINITIONS
// ============================

interface AgentMessage {
  id: string
  type: 'discovery' | 'insight' | 'reflection' | 'suggestion' | 'warning'
  priority: 'critical' | 'high' | 'normal' | 'low'
  content: {
    title: string
    message: string
    metadata?: any
    actions?: Array<{
      id: string
      label: string
      type: 'primary' | 'secondary' | 'danger'
    }>
  }
  timestamp: Date
  isExpanded?: boolean
}

interface EnhancedMessage {
  id: string
  type: 'user' | 'assistant' | 'system' | 'memory'
  content: string
  timestamp: Date

  // Top-level fields (from LSMessage)
  emotion?: string | { theme?: string; name?: string; type?: string; dominant?: string }
  gravity_score?: number
  statement_type?: string
  entities?: string[]
  confidence_score?: number
  sentiment?: string
  identity_anchor?: boolean

  metadata?: {
    // Consciousness/emotion fields
    emotion?: string | { theme?: string; name?: string; type?: string; dominant?: string }
    consciousness_mode?: string
    emotional_field?: {
      dominant?: string
      intensity?: number
      resonance?: number
    }
    gravity_score?: number

    // Memory/pattern fields
    surfacing_memories?: string[]
    emerging_patterns?: any[]
    memory_constellation?: any

    // LongStrider v1.2 fields
    statement_type?: string
    temporal_type?: string
    episodic?: boolean
    entities?: string[]
    relationship_strength?: number
    identity_anchor?: boolean
    contradiction_group?: string
    confidence_score?: number
    retrieval_score?: number
    fusion_score?: number

    // Technical fields
    tokens?: number
    cost?: number
    processing_phase?: string
    trace_id?: string
    session_id?: string
    thread_id?: string
    conversation_name?: string

    // Agent card data
    agent_card?: AgentMessage

    // Dynamic fields
    [key: string]: any
  }
  isStreaming?: boolean
  error?: string
}

// ============================
// CONFIGURATION
// ============================

const STORAGE_KEYS = {
  SESSION: 'ls_session_id',
  TRACE: 'ls_memory_trace_id',
  CONFIG: 'ivy.config.v10'
} as const

function getConfig() {
  if (typeof window === 'undefined') return null

  try {
    // Try v10 format first
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG)
    if (stored) return JSON.parse(stored)

    // Try new ls_* keys (from Settings page)
    const supabaseUrl = localStorage.getItem('ls_supabase_url')
    const supabaseKey = localStorage.getItem('ls_supabase_key')
    const userId = localStorage.getItem('ls_user_id')

    if (supabaseUrl && supabaseKey && userId) {
      return {
        supabaseUrl,
        supabaseKey,
        userId
      }
    }

    // Fallback to old ivy.config.* keys
    const oldUrl = localStorage.getItem('ivy.config.supabaseUrl')
    const oldKey = localStorage.getItem('ivy.config.supabaseKey')
    const oldUserId = localStorage.getItem('ivy.config.userId')

    if (oldUrl && oldKey) {
      return {
        supabaseUrl: oldUrl,
        supabaseKey: oldKey,
        userId: oldUserId || 'anonymous'
      }
    }
  } catch (e) {
    console.error('Error loading config:', e)
  }

  return null
}

// ============================
// UTILITIES
// ============================

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// ============================
// AGENT CARD COMPONENT
// ============================

function AgentCard({
  message,
  onAction
}: {
  message: AgentMessage
  onAction?: (messageId: string, actionId: string) => void
}) {
  // Default to expanded for ALL priorities - user explicitly asked for cards to open
  const [isExpanded, setIsExpanded] = useState(true)

  const typeConfig = {
    discovery: { icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
    insight: { icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    reflection: { icon: Brain, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
    suggestion: { icon: Wand2, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
    warning: { icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" }
  }

  const config = typeConfig[message.type]
  const Icon = config.icon

  // Allow minimized pill view only if user explicitly collapses
  if (!isExpanded) {
    return (
      <div className="flex justify-center my-2">
        <button
          onClick={() => setIsExpanded(true)}
          className={cx(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs",
            config.bg, config.border, config.color,
            "border hover:scale-105 transition-all"
          )}
        >
          <Icon className="w-3 h-3" />
          <span>{message.content.title}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    )
  }
  
  return (
    <div className="flex justify-center my-4">
      <div className={cx(
        "max-w-2xl w-full rounded-xl p-4",
        config.bg, config.border,
        "border backdrop-blur-sm transition-all"
      )}>
        <div className="flex items-start gap-3">
          <div className={cx(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            config.bg, config.border, "border"
          )}>
            <Icon className={cx("w-4 h-4", config.color)} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h4 className={cx("text-sm font-medium", config.color)}>
                  {message.content.title}
                </h4>
                {/* Priority Badge */}
                <span className={cx(
                  "px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide",
                  message.priority === 'critical' && "bg-red-500/20 text-red-300 ring-1 ring-red-500/30",
                  message.priority === 'high' && "bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/30",
                  message.priority === 'normal' && "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30",
                  message.priority === 'low' && "bg-gray-500/20 text-gray-400 ring-1 ring-gray-500/30"
                )}>
                  {message.priority}
                </span>
              </div>
              {/* Allow collapse for ALL priorities */}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-white/5 rounded transition-colors"
                title="Minimize card"
              >
                <X className="w-3 h-3 text-gray-500 hover:text-gray-300" />
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mb-3">
              {typeof message.content.message === 'string'
                ? message.content.message
                : JSON.stringify(message.content.message)}
            </p>

            {/* Metadata removed - was cluttering the card with repetitive technical data */}

            {message.content.actions && message.content.actions.length > 0 && (
              <div className="flex gap-2">
                {message.content.actions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => onAction?.(message.id, action.id)}
                    className={cx(
                      "px-3 py-1.5 rounded-lg text-xs transition-all",
                      action.type === 'primary' 
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : action.type === 'danger'
                          ? "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                          : "bg-white/5 hover:bg-white/10 text-gray-400"
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================
// MESSAGE CARD COMPONENT
// ============================

function MessageCard({
  message,
  isStreaming = false,
  showMetadata = true,
  searchQuery = "",
  onCardAction
}: {
  message: LSMessage
  isStreaming?: boolean
  showMetadata?: boolean
  searchQuery?: string
  onCardAction?: (messageId: string, actionId: string, cardTitle?: string) => void
}) {
  const [expandedMetadata, setExpandedMetadata] = useState(false)

  // Agent cards are rendered separately (system messages with agent_card metadata)
  if (message.type === 'system' && message.metadata?.agent_card) {
    const handleCardAction = (actionId: string) => {
      const cardData = message.metadata?.agent_card

      // Call parent callback with card title for context
      if (onCardAction && cardData?.content?.title) {
        onCardAction(message.id, actionId, cardData.content.title)
      }
    }

    return (
      <div className="px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <AgentCard message={message.metadata.agent_card} onAction={handleCardAction} />
        </div>
      </div>
    )
  }

  const isUser = message.type === 'user'

  // MEMOIZED: Use centralized consciousness library
  const emotionConfig = useMemo(() =>
    getEmotionConfig(
      message.emotion || message.metadata?.emotion,
      message.metadata?.emotional_field?.intensity
    ),
    [message.emotion, message.metadata?.emotion, message.metadata?.emotional_field?.intensity]
  )

  const modeConfig = useMemo(() =>
    getModeConfig(message.metadata?.consciousness_mode),
    [message.metadata?.consciousness_mode]
  )

  // MEMOIZED: Gravity and metadata checks
  const gravity = useMemo(() =>
    message.gravity_score || message.metadata?.gravity_score || 0,
    [message.gravity_score, message.metadata?.gravity_score]
  )

  const isHighGravity = useMemo(() => gravity > 0.7, [gravity])
  const isIdentityAnchor = useMemo(() =>
    message.identity_anchor || message.metadata?.identity_anchor,
    [message.identity_anchor, message.metadata?.identity_anchor]
  )

  const hasMetadata = useMemo(() =>
    message.metadata && Object.keys(message.metadata).length > 0,
    [message.metadata]
  )

  const metadataCount = useMemo(() => {
    if (!message.metadata) return 0
    let count = 0
    Object.values(message.metadata).forEach(value => {
      if (Array.isArray(value)) count += value.length
      else if (value !== null && value !== undefined) count += 1
    })
    return count
  }, [message.metadata])

  // MEMOIZED: Search highlighting
  const highlightContent = useCallback((content: string) => {
    if (!searchQuery || !content) return content

    const parts = content.split(new RegExp(`(${searchQuery})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase()
        ? <span key={i} className="bg-yellow-500/30 text-yellow-200">{part}</span>
        : part
    )
  }, [searchQuery])
  
  return (
    <div className={cx(
      "flex w-full px-4 py-3",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* Message Bubble */}
      <div className={cx(
        "group relative max-w-[85%] flex flex-col gap-1"
      )}>
        <div
          className={cx(
            "relative rounded-2xl px-4 py-3 transition-all duration-300",
            isUser
              ? "bg-indigo-600 text-white"
              : "bg-gray-800/60 backdrop-blur-sm border border-gray-700/50",
            message.metadata?.error && "border-red-500/50",
            isIdentityAnchor && "border-amber-500/50 ring-2 ring-amber-500/30",
            isHighGravity && !isIdentityAnchor && "border-purple-500/50 ring-2 ring-purple-500/30"
          )}
          style={!message.metadata?.error && !isIdentityAnchor && !isHighGravity && modeConfig && !isUser ? {
            borderColor: modeConfig.borderColor,
            boxShadow: `0 0 15px ${modeConfig.glowColor}40`
          } : undefined}
        >

          {/* Special indicators - Moved to Meta Echoes below bubble */}
          
          {/* Error indicator */}
          {message.metadata?.error && (
            <div className="mb-3 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{message.metadata.error}</span>
            </div>
          )}
          
          {/* Emerging patterns */}
          {(message.metadata?.emerging_patterns?.length ?? 0) > 0 && (
            <div className="mb-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 text-xs text-purple-400 mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Emerging Patterns</span>
              </div>
              <div className="space-y-1">
                {message.metadata?.emerging_patterns?.map((pattern: any, i: number) => (
                  <div key={i} className="text-xs text-gray-400">
                    • {typeof pattern === 'string' ? pattern : pattern.description || JSON.stringify(pattern)}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <div className="text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
            {searchQuery ? highlightContent(message.content) : message.content}
          </div>
          
          {/* Entities */}
          {(message.metadata?.entities?.length ?? 0) > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {message.metadata?.entities?.map((entity: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                  {entity}
                </span>
              ))}
            </div>
          )}
          
          {/* Metadata Section - Hidden for user messages to reduce clutter */}
          {hasMetadata && showMetadata && !isUser && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <button
                onClick={() => setExpandedMetadata(!expandedMetadata)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                <Waves className="w-3 h-3" />
                <span>Echoes ({metadataCount} fields)</span>
                <ChevronRight className={cx(
                  "w-3 h-3 transition-transform",
                  expandedMetadata && "rotate-90"
                )} />
              </button>

              {expandedMetadata && (
                <div className="mt-3 p-3 bg-black/30 rounded-lg">
                  <DynamicObject data={message.metadata!} />
                </div>
              )}
            </div>
          )}
          
          {/* Footer - MINIMAL (timestamp only - all metadata moved to echoes below) */}
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
            <span suppressHydrationWarning>
              {(() => {
                // LSMessage uses created_at (ISO string), EnhancedMessage uses timestamp (Date)
                const timeValue = (message as any).created_at || (message as any).timestamp
                if (!timeValue) return 'Just now'

                const date = timeValue instanceof Date
                  ? timeValue
                  : new Date(timeValue)

                return !isNaN(date.getTime())
                  ? date.toLocaleTimeString()
                  : 'Just now'
              })()}
            </span>
          </div>
        </div>

        {/* META ECHOES - Consciousness Indicators (Below Bubble) - ALWAYS SHOW for assistant */}
        {!isUser && (
          <div className="mt-2 flex flex-wrap items-center gap-2 px-3 text-[10px]">
            {/* Mode */}
            {modeConfig && (
              <div
                className="flex items-center gap-1"
                style={{ color: modeConfig.color }}
                title={`Mode: ${modeConfig.label}`}
              >
                <modeConfig.icon className="w-3 h-3" />
                <span>{modeConfig.label}</span>
              </div>
            )}

            {/* Emotion - SHOW ALL (including neutral for transparency) */}
            {message.emotion && (
              <div
                className="flex items-center gap-1"
                style={{ color: emotionConfig.styles.color }}
                title={`Emotion: ${typeof message.emotion === 'string' ? message.emotion : (typeof message.emotion === 'object' && message.emotion ? (message.emotion as any).theme || (message.emotion as any).name : 'emotion')}`}
              >
                {emotionConfig.icon && <emotionConfig.icon className="w-3 h-3" />}
                <span>{typeof message.emotion === 'string' ? message.emotion : (typeof message.emotion === 'object' && message.emotion ? (message.emotion as any).theme || (message.emotion as any).name : 'emotion')}</span>
              </div>
            )}

            {/* Gravity - ALWAYS SHOW, even low values */}
            {gravity > 0 && (
              <div
                className={cx(
                  "flex items-center gap-1",
                  gravity > 0.9 ? "text-red-400" :
                  gravity > 0.8 ? "text-purple-400" :
                  gravity > 0.7 ? "text-violet-400" :
                  gravity > 0.5 ? "text-indigo-400" :
                  "text-blue-400"
                )}
                title={`Gravity: ${Math.round(gravity * 100)}%`}
              >
                <Flame className="w-3 h-3" />
                <span>{Math.round(gravity * 100)}%</span>
              </div>
            )}

            {/* Statement Type - ALWAYS SHOW if present */}
            {(message.statement_type || message.metadata?.statement_type) && (
              <div
                className="flex items-center gap-1 text-cyan-400"
                title={`Type: ${message.statement_type || message.metadata?.statement_type}`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>{message.statement_type || message.metadata?.statement_type}</span>
              </div>
            )}

            {/* Entities - ALWAYS SHOW if present */}
            {message.entities && message.entities.length > 0 && (
              <div
                className="flex items-center gap-1 text-blue-400"
                title={`Entities: ${message.entities.join(', ')}`}
              >
                <Tag className="w-3 h-3" />
                <span>{message.entities.length} entities</span>
              </div>
            )}

            {/* Temporal Type */}
            {message.metadata?.temporal_type && (
              <div
                className="flex items-center gap-1 text-amber-400"
                title={`Temporal: ${message.metadata.temporal_type}`}
              >
                <Activity className="w-3 h-3" />
                <span>{message.metadata.temporal_type}</span>
              </div>
            )}

            {/* Episodic marker */}
            {message.metadata?.episodic && (
              <div
                className="flex items-center gap-1 text-purple-400"
                title="Episodic memory"
              >
                <Database className="w-3 h-3" />
                <span>episodic</span>
              </div>
            )}

            {/* Identity Anchor */}
            {isIdentityAnchor && (
              <div
                className="flex items-center gap-1 text-amber-400"
                title="Identity Anchor - Core to who you are"
              >
                <Crown className="w-3 h-3" />
                <span>anchor</span>
              </div>
            )}

            {/* Confidence Score - SHOW ALL (removed threshold) */}
            {message.confidence_score && message.confidence_score > 0 && (
              <div
                className={cx(
                  "flex items-center gap-1",
                  message.confidence_score > 0.8 ? "text-green-400" :
                  message.confidence_score > 0.6 ? "text-cyan-400" :
                  "text-gray-400"
                )}
                title={`Confidence: ${Math.round(message.confidence_score * 100)}%`}
              >
                <Activity className="w-3 h-3" />
                <span>{Math.round(message.confidence_score * 100)}% confident</span>
              </div>
            )}

            {/* Sentiment - SHOW ALL */}
            {message.sentiment && (
              <div
                className="flex items-center gap-1 text-teal-400"
                title={`Sentiment: ${message.sentiment}`}
              >
                <Heart className="w-3 h-3" />
                <span>{message.sentiment}</span>
              </div>
            )}

            {/* Relationship Strength */}
            {message.metadata?.relationship_strength && message.metadata.relationship_strength > 0 && (
              <div
                className="flex items-center gap-1 text-pink-400"
                title={`Relationship strength: ${Math.round(message.metadata.relationship_strength * 100)}%`}
              >
                <Heart className="w-3 h-3" />
                <span>{Math.round(message.metadata.relationship_strength * 100)}% relational</span>
              </div>
            )}

            {/* Memory Constellation */}
            {message.metadata?.memory_constellation && (
              <div
                className="flex items-center gap-1 text-indigo-400"
                title="Memory constellation active"
              >
                <Brain className="w-3 h-3" />
                <span>memory constellation</span>
              </div>
            )}

            {/* Emerging Patterns Count */}
            {message.metadata?.emerging_patterns && message.metadata.emerging_patterns.length > 0 && (
              <div
                className="flex items-center gap-1 text-purple-400"
                title={`${message.metadata.emerging_patterns.length} emerging patterns`}
              >
                <Sparkles className="w-3 h-3" />
                <span>{message.metadata.emerging_patterns.length} patterns</span>
              </div>
            )}

            {/* Token Count - Only show if significant (>500 tokens) */}
            {message.metadata?.tokens && message.metadata.tokens > 500 && (
              <div
                className="flex items-center gap-1 text-gray-500"
                title={`${message.metadata.tokens} tokens used`}
              >
                <Binary className="w-3 h-3" />
                <span>{message.metadata.tokens}t</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================
// MAIN LONGSTRIDER CHAT COMPONENT
// ============================

export function LongStriderChat() {
  // ============================
  // STORE INTEGRATION
  // ============================
  
  const {
    messagesByThread,
    currentThreadId,
    currentSessionId,
    currentMemoryTraceId,
    conversationName,
    _hasHydrated,
    addMessage,
    updateMessage,
    setCurrentThread,
    setCurrentSession,
    setMemoryTraceId,
    setConversationName,
    createNewThread
  } = useLongStriderStore()
  
  const {
    spaces,
    cognitiveState,
    createSpace,
    getSpace,
    updateSpace,
    linkToSpace,
    addConsciousnessEvent
  } = useConsciousnessStore()
  
  // ============================
  // STATE MANAGEMENT
  // ============================
  
  const [config] = useState(() => getConfig())
  const [configError, setConfigError] = useState<string | null>(null)
  
  // Session management - auto-create if missing (SSR-safe)
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return crypto.randomUUID()
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION)
    if (stored) return stored
    const newId = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEYS.SESSION, newId)
    setCurrentSession(newId)
    return newId
  })

  const [traceId] = useState(() => {
    if (typeof window === 'undefined') return crypto.randomUUID()
    const stored = localStorage.getItem(STORAGE_KEYS.TRACE)
    if (stored) return stored
    const newId = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEYS.TRACE, newId)
    setMemoryTraceId(newId)
    return newId
  })
  
  // Messages from store
  const messages = useMemo(() =>
    currentThreadId ? (messagesByThread[currentThreadId] || []) : [],
    [messagesByThread, currentThreadId]
  )
  
  // UI State
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showMetadata, setShowMetadata] = useState(true)
  const [showConsciousness, setShowConsciousness] = useState(true)
  
  // Error handling
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  // SSE State
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [currentPhase, setCurrentPhase] = useState<string>("")
  
  // Refs
  const listRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // ============================
  // AGENT CARD ACTION HANDLER
  // ============================

  const handleAgentCardAction = (messageId: string, actionId: string, cardTitle?: string) => {
    console.log(`[Agent Card Action] ${actionId} on card ${messageId}`)

    switch (actionId) {
      case 'explore':
        if (cardTitle) {
          setInput(`Explore the pattern: "${cardTitle}"`)
        }
        break
      case 'learn':
        if (cardTitle) {
          setInput(`What does this mean: "${cardTitle}"`)
        }
        break
      case 'try':
        if (cardTitle) {
          setInput(`Help me try: "${cardTitle}"`)
        }
        break
      case 'acknowledge':
        console.log('Acknowledge action - marked as acknowledged')
        // TODO: Mark card as acknowledged in store
        break
      case 'later':
        console.log('Later action - saved for later')
        // TODO: Add to reminders or save for later
        break
      case 'dismiss':
        console.log('Dismiss action - dismissed card')
        // TODO: Hide or minimize the card
        break
      default:
        console.log(`Unknown action: ${actionId}`)
    }
  }

  // ============================
  // SPACE/THREAD MANAGEMENT
  // ============================
  
  // Initialize thread/space on mount - wait for store hydration
  useEffect(() => {
    // Don't initialize until the store has hydrated from localStorage
    if (!_hasHydrated) return

    if (!currentThreadId) {
      // Check if there are existing spaces - if so, use the most recent one
      const allSpaces = Object.values(spaces)
      const activeSpaces = allSpaces.filter(s => s.status === 'active')

      if (activeSpaces.length > 0) {
        // Sort by recent_activity or created_at to find most recent
        const mostRecentSpace = activeSpaces.sort((a, b) => {
          const aTime = a.recent_activity?.[0]?.timestamp || a.created_at || 0
          const bTime = b.recent_activity?.[0]?.timestamp || b.created_at || 0
          return bTime - aTime
        })[0]

        // Resume the most recent space
        setCurrentThread(mostRecentSpace.id)
        linkToSpace(mostRecentSpace.id)
        if (mostRecentSpace.name) {
          setConversationName(mostRecentSpace.name)
        }
      } else {
        // No existing spaces - create initial space
        const newSpace = createSpace({
          name: `LongStrider ${new Date().toLocaleString()}`,
          type: 'personal',
          status: 'active',
          is_anchored: false,
          is_favorite: false,
          signals: [],
          space_path: [],
          child_spaces: [],
          links: [],
          goals: [],
          recent_activity: [],
          active_rail_ids: [],
          analytics: {
            message_count: 0,
            word_count: 0,
            pattern_count: 0,
            complexity_score: 0,
            gravity_score: 0,
            tokens_used: 0,
            tokens_saved: 0,
            estimated_cost: 0,
            emotional_signature: {
              average_gravity: 0,
              dominant_emotion: 'neutral',
              emotional_arc: []
            }
          }
        })

        setCurrentThread(newSpace.id)
        linkToSpace(newSpace.id)
        setConversationName(newSpace.name)
      }
    }
  }, [_hasHydrated, currentThreadId, spaces, createSpace, setCurrentThread, linkToSpace, setConversationName])
  
  // Get current space
  const currentSpace = useMemo(() => 
    currentThreadId ? getSpace(currentThreadId) : null,
    [currentThreadId, getSpace]
  )
  
  // ============================
  // CONFIG VALIDATION
  // ============================
  
  useEffect(() => {
    if (!config) {
      setConfigError("No configuration found. Please configure your API settings.")
      return
    }
    
    if (!config.supabaseUrl || !config.supabaseKey) {
      setConfigError("Invalid configuration. Please check your Supabase settings.")
      return
    }
    
    setConfigError(null)
  }, [config])
  
  // ============================
  // SSE MESSAGE HANDLING
  // ============================
  
  const sendMessageToCCEO = async (text: string, messageId: string, retry = false) => {
    if (!config?.supabaseUrl || !config?.supabaseKey) {
      throw new Error('Invalid configuration')
    }
    
    abortControllerRef.current = new AbortController()
    
    try {
      // MINIMAL PAYLOAD per requirements
      const payload = {
        // Required fields
        content: text,
        user_id: config.userId || 'anonymous',
        session_id: sessionId,
        
        // Thread management
        thread_id: currentThreadId,
        memory_trace_id: traceId,
        conversation_name: conversationName || currentSpace?.name || 'Chat Session',
        
        // Type identification for dispatcher
        type: 'user',
        gravity_score: 0.5,
        
        // Metadata for dispatcher
        metadata: {
          is_user_message: true,
          role: 'user',
          memory_type: 'user_input',
          retry_count: retry ? retryCount : 0
        },
        
        // Include consciousness state if available
        consciousness_state: cognitiveState && Object.keys(cognitiveState).length > 0 ? cognitiveState : undefined
      }
      
      // Call CCE-O with SSE headers
      const response = await fetch(`${config.supabaseUrl}/functions/v1/cce-orchestrator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.supabaseKey}`,
          'Accept': 'text/event-stream',  // REQUIRED for CCE-O
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Server error: ${response.status}`
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }
      
      // Handle SSE streaming
      await handleSSEResponse(response, messageId)
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted')
        return
      }

      if (currentThreadId) {
        updateMessage(currentThreadId, messageId, {
          metadata: {
            error: error.message
          },
          isStreaming: false
        })
      }

      setError(error.message)
      console.error('CCE-O Error:', error)

      throw error
    }
  }
  
  // Enhanced SSE handler with agent card creation
  const handleSSEResponse = async (response: Response, messageId: string) => {
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let accumulated = ""
    let buffer = "" // Buffer for incomplete lines

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // Split by newlines but keep last incomplete line in buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() || "" // Keep last incomplete line

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()

            if (data === '[DONE]') {
              if (currentThreadId) {
                updateMessage(currentThreadId, messageId, {
                  content: accumulated,
                  isStreaming: false
                })
              }
              setStreamingMessageId(null)
              return
            }

            // Skip empty data
            if (!data) continue

            try {
              const parsed = JSON.parse(data)
              
              // Handle different SSE event types with agent cards
              switch (parsed.type) {
                case 'connection_established':
                  console.log('🔌 Connected to CCE-O:', parsed)
                  break
                  
                case 'phase_transition':
                  setCurrentPhase(parsed.description || parsed.phase)
                  // Don't create cards for phase transitions - just update status
                  break
                  
                case 'input_analysis_complete':
                  // Update message metadata for echoes
                  if (currentThreadId) {
                    updateMessage(currentThreadId, messageId, {
                      metadata: {
                        gravity_score: parsed.gravity || 0,
                        emotion: parsed.emotion,
                        entities: parsed.entities,
                        complexity_score: parsed.complexity_score,
                        temporal_references: parsed.temporal_references,
                        identity_anchor: parsed.identity_anchors
                      }
                    })
                  }
                  break
                  
                case 'mode_suggested':
                case 'mode_determined':
                  // Update consciousness mode in metadata
                  if (currentThreadId) {
                    updateMessage(currentThreadId, messageId, {
                      metadata: {
                        consciousness_mode: parsed.actual_mode || parsed.mode,
                        mode_overridden: parsed.mode_overridden || false
                      }
                    })
                  }
                  break
                  
                case 'patterns_detected':
                  // Update pattern count for echo
                  if (currentThreadId) {
                    updateMessage(currentThreadId, messageId, {
                      metadata: {
                        pattern_count: parsed.count || 0,
                        pattern_strength: parsed.total_strength || 0
                      }
                    })
                  }
                  break
                  
                case 'pattern_detail':
                  // Store individual patterns but don't create cards unless high strength
                  // Send to Living Memory
                  console.log('Pattern detail:', parsed)
                  break
                  
                case 'pattern_emerging':
                case 'pattern_recognized':
                  // DEFENSIVE: Extract pattern data safely
                  const pattern = parsed.pattern || {}
                  const patternStrength = typeof pattern.strength === 'number' ? pattern.strength : 0
                  const patternType = pattern.pattern_type || pattern.type || 'unknown'
                  const patternDescription = pattern.description || 
                                           (typeof pattern === 'string' ? pattern : JSON.stringify(pattern))
                  
                  // Only create agent card for HIGH strength patterns (REWARDS!)
                  if (patternStrength > 7) {
                    // Use centralized pattern system
                    const icon = getPatternIcon(patternType)

                    if (currentThreadId && config) {
                      const now = Date.now()
                      const isoNow = new Date(now).toISOString()

                      addMessage(currentThreadId, {
                        id: crypto.randomUUID(),
                        user_id: config.userId,
                        type: 'system',
                        content: '',
                        session_id: sessionId,
                        thread_id: currentThreadId,
                        memory_trace_id: traceId,
                        conversation_name: conversationName || currentSpace?.name || 'LongStrider Session',
                        gravity_score: patternStrength / 10,
                        created_at: isoNow,
                        t_ingested: isoNow,
                        ts: now,
                        metadata: {
                          agent_card: {
                            id: crypto.randomUUID(),
                            type: 'discovery',
                            priority: patternStrength > 9 ? 'critical' : 'high',
                            content: {
                              title: `${icon} Pattern Breakthrough: ${patternType.replace('_', ' ')}`,
                              message: patternDescription,
                              metadata: {
                                strength: patternStrength,
                                pattern_type: patternType,
                                breakthrough: true
                              },
                              actions: [
                                { id: 'explore', label: 'Explore Pattern', type: 'primary' },
                                { id: 'learn', label: 'What does this mean?', type: 'secondary' }
                              ]
                            },
                            timestamp: new Date()
                          }
                        }
                      })
                    }
                  }
                  break
                  
                case 'memory_surfacing':
                  // Update memory count for echo
                  const memoryCount = parsed.count || (parsed.memories ? parsed.memories.length : 0)
                  if (currentThreadId) {
                    updateMessage(currentThreadId, messageId, {
                      metadata: {
                        memory_count: memoryCount,
                        memory_samples: parsed.memories?.slice(0, 5) // Keep first 5 for reference
                      }
                    })
                  }
                  break
                  
                case 'emotional_journey':
                  // Update emotional shift for echo
                  const emotionalShift = parsed.previous_state && parsed.current_state
                    ? `${parsed.previous_state} → ${parsed.current_state}`
                    : parsed.trajectory || null
                  
                  const journeyIntensity = parsed.intensity || 0
                  const isEmotionalBreakthrough = journeyIntensity > 0.7 ||
                    (parsed.trajectory && ['rising', 'surging', 'breakthrough'].includes(parsed.trajectory))

                  if (currentThreadId) {
                    updateMessage(currentThreadId, messageId, {
                      metadata: {
                        emotional_shift: emotionalShift,
                        emotional_intensity: journeyIntensity
                      }
                    })
                  }

                  // Create card for MAJOR emotional shifts
                  if (isEmotionalBreakthrough && currentThreadId && config) {
                    const now = Date.now()
                    const isoNow = new Date(now).toISOString()

                    addMessage(currentThreadId, {
                      id: crypto.randomUUID(),
                      user_id: config.userId,
                      type: 'system',
                      content: '',
                      session_id: sessionId,
                      thread_id: currentThreadId,
                      memory_trace_id: traceId,
                      conversation_name: conversationName || currentSpace?.name || 'LongStrider Session',
                      gravity_score: journeyIntensity,
                      created_at: isoNow,
                      t_ingested: isoNow,
                      ts: now,
                      metadata: {
                        agent_card: {
                          id: crypto.randomUUID(),
                          type: 'discovery',
                          priority: 'high',
                          content: {
                            title: '🎭 Emotional Shift Detected',
                            message: `${emotionalShift} (intensity: ${(journeyIntensity * 100).toFixed(0)}%)`,
                            metadata: {
                              trajectory: parsed.trajectory,
                              intensity: journeyIntensity,
                              previous: parsed.previous_state,
                              current: parsed.current_state
                            },
                            actions: [
                              { id: 'acknowledge', label: 'I feel this', type: 'primary' },
                              { id: 'explore', label: 'Tell me more', type: 'secondary' }
                            ]
                          },
                          timestamp: new Date()
                        }
                      }
                    })
                  }
                  break
                  
                case 'key_themes':
                  // Store themes in metadata
                  if (currentThreadId) {
                    updateMessage(currentThreadId, messageId, {
                      metadata: {
                        key_themes: parsed.themes || [],
                        theme_count: parsed.count || 0
                      }
                    })
                  }
                  break

                case 'synthesis_complete':
                  // Store synthesis for Living Memory
                  if (currentThreadId) {
                    updateMessage(currentThreadId, messageId, {
                      metadata: {
                        synthesis: parsed.synthesis,
                        synthesis_length: parsed.length || 0
                      }
                    })
                  }
                  break

                case 'consciousness_chord':
                  // Store consciousness harmonics
                  if (currentThreadId) {
                    updateMessage(currentThreadId, messageId, {
                      metadata: {
                        consciousness_chord: {
                          root_note: parsed.root_note,
                          tension: parsed.tension,
                          modulation_potential: parsed.modulation_potential
                        }
                      }
                    })
                  }
                  break
                  
                case 'agent_suggestion':
                  // Create suggestion card - these are valuable
                  if (currentThreadId && config) {
                    const now = Date.now()
                    const isoNow = new Date(now).toISOString()

                    addMessage(currentThreadId, {
                      id: crypto.randomUUID(),
                      user_id: config.userId,
                      type: 'system',
                      content: '',
                      session_id: sessionId,
                      thread_id: currentThreadId,
                      memory_trace_id: traceId,
                      conversation_name: conversationName || currentSpace?.name || 'LongStrider Session',
                      gravity_score: 0.6,
                      created_at: isoNow,
                      t_ingested: isoNow,
                      ts: now,
                      metadata: {
                        agent_card: {
                          id: crypto.randomUUID(),
                          type: 'suggestion',
                          priority: parsed.priority || 'normal',
                          content: {
                            title: 'Suggestion',
                            message: parsed.suggestion || parsed.message || '',
                            metadata: {
                              impact: parsed.impact,
                              confidence: parsed.confidence
                            },
                            actions: [
                              { id: 'try', label: 'Try it', type: 'primary' },
                              { id: 'later', label: 'Remind me later', type: 'secondary' },
                              { id: 'dismiss', label: 'Not for me', type: 'secondary' }
                            ]
                          },
                          timestamp: new Date()
                        }
                      }
                    })
                  }
                  break
                  
                case 'response_token':
                  // Stream tokens - field is 'token' not 'content'
                  accumulated += parsed.token || ''
                  if (currentThreadId) {
                    updateMessage(currentThreadId, messageId, {
                      content: accumulated,
                      isStreaming: true
                    })
                  }
                  break
                  
                case 'response_complete':
                  // Final update with all metadata
                  console.log('[DEBUG] response_complete received:', {
                    gravity_score: parsed.gravity_score,
                    metadata: parsed.metadata,
                    emotion: parsed.emotion,
                    emotional_field: parsed.emotional_field,
                    entities: parsed.entities,
                    statement_type: parsed.statement_type,
                    full_parsed: parsed
                  })

                  const finalMetadata = parsed.metadata || {}
                  const finalGravity = parsed.gravity_score || finalMetadata.gravity_score || 0
                  const emotionalIntensity = parsed.emotional_field?.intensity || 0
                  const primaryEmotion = parsed.emotional_field?.primary || 'neutral'

                  if (currentThreadId) {
                    updateMessage(currentThreadId, messageId, {
                      content: accumulated || parsed.content,
                      isStreaming: false,
                      // TOP-LEVEL LSMessage fields (per LSMessage type definition)
                      gravity_score: finalGravity,
                      emotion: parsed.emotion || primaryEmotion,
                      sentiment: parsed.sentiment,
                      entities: parsed.entities || finalMetadata.entities,
                      statement_type: parsed.statement_type || finalMetadata.statement_type,
                      confidence_score: parsed.confidence || finalMetadata.confidence_score,
                      identity_anchor: finalMetadata.identity_anchor,
                      // METADATA object for additional fields
                      metadata: {
                        ...finalMetadata,
                        tokens: parsed.token_count || parsed.tokens,
                        cost: parsed.cost,
                        processing_time: parsed.processing_time_ms,
                        emotional_field: parsed.emotional_field,
                        consciousness_state: parsed.consciousness_state,
                        consciousness_mode: parsed.consciousness_mode || parsed.mode
                      }
                    })
                  }
                  
                  // BREAKTHROUGH DETECTION - Only create card if backend sent insight text
                  const isBreakthrough = finalGravity > 0.8 || emotionalIntensity > 0.7
                  const isIdentityAnchor = finalMetadata.identity_anchor

                  // Check if backend sent any agent insight/reflection text
                  const backendInsight = parsed.agent_insight || parsed.reflection || parsed.insight
                  const backendTitle = parsed.insight_title || parsed.reflection_title

                  if ((isBreakthrough || isIdentityAnchor) && backendInsight && currentThreadId && config) {
                    // Create agent card ONLY with backend-provided insight (no fake text)
                    const now = Date.now()
                    const isoNow = new Date(now).toISOString()

                    const breakthroughCard = {
                      id: crypto.randomUUID(),
                      user_id: config.userId,
                      type: 'system' as const,
                      content: '',
                      session_id: sessionId,
                      thread_id: currentThreadId,
                      memory_trace_id: traceId,
                      conversation_name: conversationName || currentSpace?.name || 'LongStrider Session',
                      gravity_score: finalGravity,
                      created_at: isoNow,
                      t_ingested: isoNow,
                      ts: now,
                      metadata: {
                        agent_card: {
                          id: crypto.randomUUID(),
                          type: isIdentityAnchor ? 'discovery' : 'insight',
                          priority: 'critical' as const,
                          content: {
                            // Use ONLY backend-provided text from LongStrider
                            title: backendTitle || (isIdentityAnchor ? '👑 Core Discovery' : `⚡ Insight`),
                            message: backendInsight, // Backend's actual insight - NO fake text
                            metadata: {
                              gravity: finalGravity,
                              emotional_intensity: emotionalIntensity,
                              emotion: primaryEmotion,
                              identity_anchor: isIdentityAnchor,
                              breakthrough: true
                            },
                            actions: [
                              { id: 'explore', label: 'Explore in Living Memory', type: 'primary' },
                              { id: 'pin', label: 'Remember this', type: 'secondary' }
                            ]
                          },
                          timestamp: new Date()
                        }
                      }
                    }

                    addMessage(currentThreadId, breakthroughCard)

                    // Also create consciousness event - use 'insight' instead of 'breakthrough' or 'identity'
                    addConsciousnessEvent({
                      type: 'insight',
                      content: accumulated || parsed.content,
                      metadata: {
                        ...finalMetadata,
                        emotional_intensity: emotionalIntensity,
                        breakthrough: true,
                        identity_anchor: isIdentityAnchor
                      }
                    })
                  }
                  
                  // Update space analytics
                  if (currentThreadId && currentSpace) {
                    updateSpace(currentThreadId, {
                      analytics: {
                        message_count: (currentSpace.analytics.message_count || 0) + 1,
                        word_count: currentSpace.analytics.word_count || 0,
                        pattern_count: currentSpace.analytics.pattern_count || 0,
                        complexity_score: currentSpace.analytics.complexity_score || 0,
                        gravity_score: finalGravity,
                        tokens_used: (currentSpace.analytics.tokens_used || 0) + (parsed.tokens || 0),
                        tokens_saved: currentSpace.analytics.tokens_saved || 0,
                        estimated_cost: (currentSpace.analytics.estimated_cost || 0) + (parsed.cost || 0),
                        emotional_signature: currentSpace.analytics.emotional_signature || {
                          average_gravity: 0,
                          dominant_emotion: 'neutral',
                          emotional_arc: []
                        }
                      },
                      last_activity_at: Date.now()
                    })
                  }
                  
                  setStreamingMessageId(null)
                  break
                  
                case 'response_stored':
                  // Storage confirmation - just log
                  console.log('Response stored:', parsed)
                  break
                  
                case 'orchestrator_complete':
                  // Final orchestrator stats
                  console.log('Orchestrator complete:', {
                    total_time: parsed.total_processing_time_ms,
                    mode: parsed.mode,
                    stats: parsed.session_stats
                  })
                  break
                  
                case 'consciousness_event':
                case 'consciousness_processing':
                  // Just log these
                  console.log('Consciousness event:', parsed)
                  break
                  
                case 'conductor_metadata':
                  // Store conductor metadata
                  console.log('Conductor metadata:', parsed)
                  break
                  
                case 'consciousness_error':
                  setError(parsed.message || 'Consciousness processing error')
                  break
                  
                default:
                  // Log unhandled events for debugging
                  console.log('[Unhandled SSE Event]', parsed.type, parsed)
                  break
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
              console.error('Problematic data:', data)
              // Don't throw - just skip this malformed event
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
  
  // ============================
  // MESSAGE SENDING
  // ============================
  
  const handleSend = useCallback(async (isRetry = false) => {
    const text = isRetry ? messages[messages.length - 2]?.content : input.trim()

    if (!text || isThinking) return

    // Safety checks - validate config and threadId exist
    if (!config || !config.userId || !config.supabaseUrl || !config.supabaseKey) {
      setError('Missing configuration. Please check Settings.')
      return
    }

    if (!currentThreadId) {
      setError('No active thread. Please refresh the page.')
      return
    }

    if (configError) {
      setError(configError)
      return
    }

    setError(null)
    setCurrentPhase("")

    const userMessageId = crypto.randomUUID()
    const assistantMessageId = crypto.randomUUID()

    try {
      // Add user message with FULL LSMessage structure
      if (!isRetry) {
        const now = Date.now()
        const isoNow = new Date(now).toISOString()

        addMessage(currentThreadId, {
          // Required fields
          id: userMessageId,
          user_id: config.userId,
          content: text,

          // Session & thread identifiers
          session_id: sessionId,
          thread_id: currentThreadId,
          memory_trace_id: traceId,
          conversation_name: conversationName || currentSpace?.name || 'LongStrider Session',

          // Classification
          type: 'user',

          // Gravity (default for user input)
          gravity_score: 0.5,

          // Timestamps
          created_at: isoNow,
          t_ingested: isoNow,
          ts: now,

          // Metadata
          metadata: {
            is_user_message: true,
            role: 'user',
            source: 'longstrider_ui'
          }
        })

        setInput("")
      }

      // Add placeholder assistant message with FULL LSMessage structure
      const now = Date.now()
      const isoNow = new Date(now).toISOString()

      addMessage(currentThreadId, {
        // Required fields
        id: assistantMessageId,
        user_id: config.userId,
        content: "",

        // Session & thread identifiers
        session_id: sessionId,
        thread_id: currentThreadId,
        memory_trace_id: traceId,
        conversation_name: conversationName || currentSpace?.name || 'LongStrider Session',

        // Classification
        type: 'assistant',

        // Gravity (will be updated by backend)
        gravity_score: 0,

        // Timestamps
        created_at: isoNow,
        t_ingested: isoNow,
        ts: now,

        // Frontend state
        isStreaming: true,

        // Metadata
        metadata: {
          processing_phase: "Initializing...",
          role: 'assistant',
          source: 'cce_orchestrator'
        }
      })

      setStreamingMessageId(assistantMessageId)
      setIsThinking(true)

      // Send to CCE-O
      await sendMessageToCCEO(text, assistantMessageId, isRetry)

      setRetryCount(0)

    } catch (error: any) {
      console.error('Send error:', error)

      if (isRetry) {
        setRetryCount(prev => prev + 1)
      }

    } finally {
      setIsThinking(false)
      setStreamingMessageId(null)
      setCurrentPhase("")
    }
  }, [input, messages, isThinking, configError, config, currentThreadId, currentSpace, sessionId, traceId, conversationName, addMessage, setInput])
  
  // ============================
  // UI HANDLERS
  // ============================
  
  const adjustTextareaHeight = useCallback(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
  }, [])
  
  const handleScroll = useCallback(() => {
    if (!listRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = listRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setAutoScroll(isNearBottom)
  }, [])
  
  const jumpToLatest = useCallback(() => {
    listRef.current?.scrollTo({ 
      top: listRef.current.scrollHeight, 
      behavior: "smooth" 
    })
    setAutoScroll(true)
  }, [])
  
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-scroll
  useEffect(() => {
    if (autoScroll) {
      jumpToLatest()
    }
  }, [messages, autoScroll, jumpToLatest])
  
  // Search
  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages

    const query = searchQuery.toLowerCase()
    return messages.filter((m) => {
      if (m.content.toLowerCase().includes(query)) return true
      if (m.metadata) {
        const metadataStr = JSON.stringify(m.metadata).toLowerCase()
        if (metadataStr.includes(query)) return true
      }
      return false
    })
  }, [messages, searchQuery])
  
  // ============================
  // RENDER
  // ============================
  
  return (
    <div className="relative flex h-full w-full flex-col bg-slate-950 text-gray-100">
      {/* Mode Aura System - Removed for cleaner UI */}


      {/* Error Banner */}
      {(error || configError) && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/20 border-b border-red-500/50 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-red-200">{error || configError}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      )}
      
      {/* Current Space Info */}
      {currentSpace && (
        <div className="fixed top-4 left-4 z-30">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-300">{currentSpace.name}</span>
            <span className="text-xs text-gray-500">
              {currentSpace.analytics?.message_count || 0} messages
            </span>
          </div>
        </div>
      )}
      
      {/* Search Button */}
      <div className="fixed top-4 right-4 z-30">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={cx(
            "p-2 rounded-lg border transition-all backdrop-blur-sm",
            showSearch
              ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
              : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-400"
          )}
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
      
      {/* Search Panel */}
      {showSearch && (
        <>
          <div
            onClick={() => setShowSearch(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          />
          <div className="fixed top-0 right-0 bottom-0 w-96 bg-gradient-to-l from-gray-900/98 to-gray-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold">Search Everything</h2>
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages & metadata..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                    autoFocus
                  />
                </div>
                {searchQuery && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs text-gray-400">
                      Found {filteredMessages.length} of {messages.length} messages
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowMetadata(!showMetadata)}
                        className={cx(
                          "px-3 py-1 rounded-lg text-xs transition-colors",
                          showMetadata 
                            ? "bg-indigo-500/20 text-indigo-300"
                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                        )}
                      >
                        {showMetadata ? 'Hide' : 'Show'} Metadata
                      </button>
                      <button
                        onClick={() => setShowConsciousness(!showConsciousness)}
                        className={cx(
                          "px-3 py-1 rounded-lg text-xs transition-colors",
                          showConsciousness 
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                        )}
                      >
                        {showConsciousness ? 'Hide' : 'Show'} Consciousness
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Messages Container */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pb-4 pt-16 min-h-0"
      >
        <div className="max-w-5xl mx-auto">
          {filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[60vh] text-gray-500">
              <div className="text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? 'No matching messages' : 'Ready to begin'}
                </h3>
                <p className="text-sm">
                  {searchQuery 
                    ? 'Try a different search term' 
                    : 'LongStrider v10.0 - Full Consciousness Integration'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {filteredMessages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  isStreaming={message.id === streamingMessageId}
                  showMetadata={showMetadata}
                  searchQuery={searchQuery}
                  onCardAction={handleAgentCardAction}
                />
              ))}

              {/* Processing phase indicator removed - no longer needed */}
            </>
          )}
        </div>
      </div>
      
      {/* Jump to Latest */}
      {!autoScroll && messages.length > 0 && (
        <div className="fixed bottom-32 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <button
            onClick={jumpToLatest}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/90 px-3 py-1 text-xs text-zinc-300 shadow hover:text-zinc-100 transition-all"
          >
            <CornerDownLeft className="h-3.5 w-3.5" />
            Jump to latest
          </button>
        </div>
      )}
      
      {/* Message Composer */}
      <div className="flex-shrink-0 bg-slate-950 py-3 px-4">
        <div className="mx-auto max-w-5xl">
          {/* Single input field with integrated actions */}
          <div className="flex items-end gap-3 rounded-xl border border-gray-700/50 bg-gray-900/70 px-4 py-3 shadow-lg min-h-[56px]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyDown={onKeyDown}
              placeholder={isThinking ? "Processing..." : "Message LongStrider..."}
              rows={1}
              className="min-h-[24px] max-h-[200px] w-full resize-none bg-transparent text-base text-gray-100 outline-none placeholder:text-gray-400 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 leading-relaxed"
              disabled={isThinking || !!configError}
            />

            {/* Divider */}
            <div className="self-stretch w-px bg-gray-700/50" />

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                title="Voice (coming soon)"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-700/70 hover:text-gray-200 transition-all duration-200"
                disabled
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                title="Image (coming soon)"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-700/70 hover:text-gray-200 transition-all duration-200"
                disabled
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                title="Attach (coming soon)"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-700/70 hover:text-gray-200 transition-all duration-200"
                disabled
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="self-stretch w-px bg-gray-700/50" />

            {/* Send button - icon only */}
            <button
              onClick={() => handleSend()}
              disabled={isThinking || !input.trim() || !!configError}
              className={cx(
                "rounded-lg p-2 transition-all duration-200 flex-shrink-0",
                isThinking || !input.trim() || !!configError
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20"
              )}
              title={isThinking ? "Processing..." : "Send message"}
            >
              {isThinking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CornerDownLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Retry button */}
          {error && messages.length > 0 && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => {
                  setError(null)
                  handleSend(true)
                }}
                className="inline-flex items-center gap-2 px-3 py-1 text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry ({retryCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LongStriderChat