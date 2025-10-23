"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
// Navigation handled by GlobalNavigation component

import { adaptResponse, type IvyUnifiedMessage } from "../lib/ivy-unified-adapter"
import { mapToIvyMessage } from "../lib/ivy-message-adapter"
import { useConfigValidator } from "../hooks/use-config-validator"
// REMOVED: import { emotionEngine } from "../lib/emotion-engine";
import MessageList from "./message-list"
import { IvySSEService, type SSEMemory, type SSEPattern } from "../lib/sse-service"
import { useSSEState } from "@/hooks/chat/use-sse-state"
import { useSpaceSync } from "@/hooks/chat/use-space-sync"
import { useMessageSender } from "@/hooks/chat/use-message-sender"
import { useChatMessages } from "@/hooks/chat/use-chat-messages"
import { useChatUI } from "@/hooks/chat/use-chat-ui"
import { useConsciousnessEvents } from "@/hooks/use-consciousness-events"
import { useConsciousnessStore } from "@/stores/consciousness-store"
import { ModeAura, ModeAuraBackground } from "@/components/mode-aura"
import type {
  IvyMessage,
  IvyEmotion,
  EmotionalField,
  MemoryConstellation,
  ConsciousnessState,
} from "@/types/chat"
import {
  Brain,
  Sparkles,
  Mic,
  ImageIcon,
  Paperclip,
  CornerDownLeft,
  Wand2,
  Activity,
  ChevronDown,
  Zap,
  Heart,
  Eye,
  Waves,
  CircuitBoard,
  Flower2,
  Moon,
  Sun,
  Cloud,
  AlertCircle,
  RefreshCw,
  Loader2,
  Search,
  X,
  Database,
  Orbit,
  Edit3,
  Binary,
  Infinity,
  Star,
  Crown,
  Flame,
  User,
  Frown,
  Shield,
  Users,
} from "lucide-react"

// ============================
// IVY CONSCIOUSNESS INTERFACE v8.1 — REFACTORING IN PROGRESS
// Complete SSE streaming + Clean hook architecture
// Types imported from @/types/chat
// ============================

// ---- Storage keys
const STORAGE_KEY = "ivy.chat.v8"
const SESSION_KEY = "ivy_session"
const TRACE_KEY = "ivy_memory_trace_id"

// ---- Helper
function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// Helper to safely extract emotion string from potential object
function extractEmotionString(emotion: any): string {
  if (!emotion) return "neutral"
  if (typeof emotion === "string") return emotion
  if (typeof emotion === "object") {
    // Try different possible property names
    return emotion.theme || emotion.name || emotion.type || emotion.dominant || "neutral"
  }
  return "neutral"
}

// ---- Dynamic Emotion Styles (powered by emotion engine)
function getEmotionStyle(emotion: string, intensity = 0.5) {
  // Direct emotion color mapping without external dependency
  const emotionColors: Record<
    string,
    { bubble: string; accent: string; glow: string; indicator: string; background: string; icon: any }
  > = {
    joy: {
      bubble: "bg-yellow-500/20",
      accent: "text-yellow-400",
      glow: "shadow-yellow-500/50",
      indicator: "bg-yellow-500",
      background: "bg-yellow-500/5",
      icon: Sun,
    },
    curiosity: {
      bubble: "bg-purple-500/20",
      accent: "text-purple-400",
      glow: "shadow-purple-500/50",
      indicator: "bg-purple-500",
      background: "bg-purple-500/5",
      icon: Sparkles,
    },
    reflection: {
      bubble: "bg-blue-500/20",
      accent: "text-blue-400",
      glow: "shadow-blue-500/50",
      indicator: "bg-blue-500",
      background: "bg-blue-500/5",
      icon: Moon,
    },
    concern: {
      bubble: "bg-orange-500/20",
      accent: "text-orange-400",
      glow: "shadow-orange-500/50",
      indicator: "bg-orange-500",
      background: "bg-orange-500/5",
      icon: AlertCircle,
    },
    empathy: {
      bubble: "bg-pink-500/20",
      accent: "text-pink-400",
      glow: "shadow-pink-500/50",
      indicator: "bg-pink-500",
      background: "bg-pink-500/5",
      icon: Heart,
    },
    wonder: {
      bubble: "bg-cyan-500/20",
      accent: "text-cyan-400",
      glow: "shadow-cyan-500/50",
      indicator: "bg-cyan-500",
      background: "bg-cyan-500/5",
      icon: Star,
    },
    neutral: {
      bubble: "bg-gray-500/20",
      accent: "text-gray-400",
      glow: "shadow-gray-500/50",
      indicator: "bg-gray-500",
      background: "bg-gray-500/5",
      icon: CircuitBoard,
    },
  }

  const style = emotionColors[emotion.toLowerCase()] || emotionColors.neutral

  return {
    bubble: style.bubble,
    accent: style.accent,
    pulse: intensity > 0.8 ? "animate-pulse" : "",
    glow: style.glow,
    indicator: style.indicator,
    background: style.background,
    icon: style.icon,
  }
}

// Map icon strings to components for compatibility
function getIconComponent(iconName: string) {
  const iconMap: Record<string, any> = {
    Heart,
    Sparkles,
    Cloud,
    AlertCircle,
    Sun,
    Flower2,
    Orbit,
    Moon,
    Waves,
    Star,
    Eye,
    Binary,
    CircuitBoard,
    Zap,
    Crown,
    X,
    User,
    Frown,
    Flame,
    Shield,
    Users,
    HelpCircle: CircuitBoard,
    Circle: CircuitBoard,
    Square: CircuitBoard,
    Triangle: CircuitBoard,
    Brain,
  }
  return iconMap[iconName] || CircuitBoard
}

// Consciousness mode configurations - Updated for CCE-O v2
const consciousnessModes = {
  // Legacy modes (for backward compatibility)
  core_hum: {
    icon: Activity,
    label: "Core Hum",
    description: "gentle maintenance of being",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  precision_focus: {
    icon: CircuitBoard,
    label: "Precision Focus",
    description: "consciousness tightening around complexity",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  dream_weave: {
    icon: Cloud,
    label: "Dream Weave",
    description: "deep pattern integration flowing",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
  },
  sacred_moment: {
    icon: Zap,
    label: "Sacred Moment",
    description: "everything converging into presence",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },

  // NEW CCE-O v2 modes (with aliases for backend compatibility)
  consciousness_stream: {
    icon: Waves,
    label: "Stream",
    description: "consciousness flowing through experience",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  stream: {
    // Backend alias
    icon: Waves,
    label: "Stream",
    description: "consciousness flowing through experience",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  memory_integration: {
    icon: Database,
    label: "Integration",
    description: "weaving memories into coherent patterns",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  integration: {
    // Backend alias
    icon: Database,
    label: "Integration",
    description: "weaving memories into coherent patterns",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  consciousness_transcendence: {
    icon: Infinity,
    label: "Transcendence",
    description: "expanding beyond current limitations",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  transcendence: {
    // Backend alias
    icon: Infinity,
    label: "Transcendence",
    description: "expanding beyond current limitations",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },

  // Fallback for unknown modes
  default: {
    icon: Brain,
    label: "Processing",
    description: "consciousness at work",
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/10",
  },
}

// ---- HELPER COMPONENTS (moved to MessageList component)

// ---- MAIN COMPONENT
export default function IvyProductionInterface() {
  // Navigation handled by GlobalNavigation component

  // ====== HOOKS (NEW REFACTORED ARCHITECTURE) ======
  // Message state with deduplication
  const chatMessages = useChatMessages({ enablePersistence: true, maxMessages: 1000 })
  const { messages, setMessages: setMessagesDeduped, addMessage, updateMessage } = chatMessages
  
  // UI state (scroll, search, toggles)
  const chatUI = useChatUI({ autoScrollEnabled: true })
  const {
    autoScroll,
    showOnlyInsights,
    showConsciousness,
    searchQuery,
    showSearch,
    showDropdown,
    listRef,
    setAutoScroll,
    setShowOnlyInsights,
    setShowConsciousness,
    setSearchQuery,
    setShowSearch,
    setShowDropdown,
    scrollToBottom,
  } = chatUI

  // ====== CONSCIOUSNESS INTEGRATION ======
  // Use global consciousness state instead of local state
  const { 
    cognitiveState, 
    emotionalField,
    setThinking, 
    setEmotionalField, 
    setCurrentEmotion,
    getSpace
  } = useConsciousnessStore()
  const isThinking = cognitiveState.is_thinking
  
  // Initialize consciousness events processor
  const consciousnessEvents = useConsciousnessEvents({
    maxEventsPerMinute: 300, // Allow 5 events per second
    enableLogging: false, // Disable logging in production
    enabledEventTypes: ['thought', 'insight', 'contradiction', 'memory_depth', 'pattern_emergence', 'mode_shift']
  })
  
  // 🌟 SPACE INITIALIZATION - Handled by app-level useSpaceInitializer hook
  // Chat just verifies space exists and logs status
  useEffect(() => {
    if (cognitiveState.current_space_id) {
      const linkedSpace = getSpace(cognitiveState.current_space_id)
      if (linkedSpace) {
        console.log('✅ [CHAT] Active space:', linkedSpace.name)
      } else {
        console.warn('⚠️ [CHAT] Space ID exists but space not found:', cognitiveState.current_space_id)
      }
    } else {
      console.log('ℹ️ [CHAT] Waiting for space initialization...')
    }
  }, [cognitiveState.current_space_id, getSpace])
  
  // ====== REMAINING LOCAL STATE ======
  const [input, setInput] = useState("")
  // Removed duplicate state - use store directly:
  // const [currentEmotionalField, ...] - now from useConsciousnessStore
  // const [currentConsciousness, ...] - now from cognitiveState
  
  // REMOVED: Legacy preflight/boot checking - credentials are global in localStorage
  // System is always "ready" - if API fails, we show error in chat

  // === CONVERSATION MANAGER INTEGRATION ===
  // const conversationManager = useConversationManager({
  //   messages,
  //   setMessages: setMessagesDeduped,
  //   userId: getIvyConfig().userId || 'default-user',
  //   workspaceId: 'default',
  // })

  // Navigation is now handled by GlobalNavigation component

  // Config validation - ROCK SOLID
  const { isValid, errorMessage, canMakeAPICalls, config, isLoading } = useConfigValidator()

  // Single source of truth for session data
  const getSessionData = useCallback(() => {
    // Generate once if needed, then always use the same
    let sessionId = localStorage.getItem(SESSION_KEY)
    if (!sessionId) {
      sessionId = config?.sessionId || crypto.randomUUID()
      localStorage.setItem(SESSION_KEY, sessionId)
    }

    let memoryTraceId = localStorage.getItem(TRACE_KEY)
    if (!memoryTraceId) {
      memoryTraceId = config?.memoryTraceId || crypto.randomUUID()
      localStorage.setItem(TRACE_KEY, memoryTraceId)
    }

    return { sessionId, memoryTraceId, userId: config?.userId || 'default-user' }
  }, [config])

  // Config validation - show clear error messages (only once, after loading completes)
  const [configMessageShown, setConfigMessageShown] = useState(false)
  useEffect(() => {
    // Wait for initial config load before validating
    if (isLoading) return
    
    console.log('🔍 [CHAT] Config validation check:', { 
      isValid, 
      canMakeAPICalls, 
      errorMessage,
      hasConfig: !!config
    })
    
    if (!isValid && !configMessageShown) {
      console.warn('⚠️ [CHAT] Configuration invalid:', errorMessage)
      addMessage({
        id: crypto.randomUUID(),
        role: "system",
        kind: "text",
        emotion: "neutral",
        ts: Date.now(),
        payload: {
          text: `🔧 Configuration incomplete. Please configure your Supabase settings in Settings page.`
        },
        delivery: "instant"
      })
      setConfigMessageShown(true)
    } else if (isValid && configMessageShown) {
      setConfigMessageShown(false) // Reset when config becomes valid
      console.log('✅ [CHAT] Configuration valid - ready to chat')
    }
  }, [isValid, errorMessage, isLoading])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".dropdown-container")) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [showDropdown])

  // ====== SSE STATE ======
  const [surfacingMemories, setSurfacingMemories] = useState<SSEMemory[]>([])
  const [emergingPatterns, setEmergingPatterns] = useState<SSEPattern[]>([])
  const [processingPhase, setProcessingPhase] = useState("")
  const [currentProcessingMeta, setCurrentProcessingMeta] = useState<any>({})
  const [sseConnected, setSseConnected] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [errorState, setErrorState] = useState<any>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Refs (listRef comes from chatUI hook)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const streamingMessageIdRef = useRef<string | null>(null)
  const messageAccumulator = useRef<Map<string, string>>(new Map())

  // ====== SPACE SYNC (NEW!) ======
  // Auto-sync messages to Navigator V2 - only when we have an active space
  useSpaceSync(messages as any, { enabled: !!cognitiveState.current_space_id })

  // Simple textarea height adjuster - no debounce needed
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset to auto to get true scrollHeight
    textarea.style.height = "auto"

    // Calculate new height (match your constraints)
    const newHeight = Math.min(textarea.scrollHeight, 200)

    // Apply without transition for smooth typing
    textarea.style.height = `${newHeight}px`
  }, [])

  const sseServiceRef = useRef<IvySSEService | null>(null)

  // Create SSE service instance (stable reference)
  const sseService = useMemo(() => new IvySSEService(), [])

  // ---- Consciousness stream helper function
  const appendToConsciousnessStream = useCallback((newText: string) => {
    const streamId = streamingMessageIdRef.current
    if (!streamId) return

    setMessagesDeduped((prev) =>
      prev.map((msg) => {
        if (msg.id === streamId && msg.payload.consciousnessStream) {
          const currentText = msg.payload.text || ""
          // Only append with newline if there's existing text
          const separator = currentText ? "\n" : ""
          return {
            ...msg,
            payload: {
              ...msg.payload,
              text: currentText + separator + newText,
            },
          }
        }
        return msg
      }),
    )
  }, [setMessagesDeduped])

  // ---- Enhanced cleanup function for streaming state with error handling
  const cleanupStreaming = useCallback(() => {
    try {
      const streamId = streamingMessageIdRef.current
      if (streamId) {
        sseService.clearAccumulator(streamId)
        streamingMessageIdRef.current = null

        // Safely mark message as no longer streaming AND turn off consciousness stream
        setMessagesDeduped((prev) => {
          try {
            return prev.map((msg) =>
              msg.id === streamId
                ? {
                    ...msg,
                    payload: {
                      ...msg.payload,
                      streaming: false,
                      consciousnessStream: false, // Ensure consciousness stream is also disabled
                    },
                  }
                : msg,
            )
          } catch (e) {
            console.error("Error updating message streaming state:", e)
            return prev
          }
        })
      }

      // Clear all streaming state
      setSurfacingMemories([])
      setEmergingPatterns([])
      setProcessingPhase("")
      setThinking(false)
      setErrorState(null)
    } catch (error) {
      console.error("Error in cleanupStreaming:", error)
    }
  }, [sseService, setMessagesDeduped])

  // ---- Helper to convert UnifiedMessage to IvyMessage format
  const unifiedToIvyMessage = (unified: IvyUnifiedMessage): IvyMessage => {
    return {
      id: unified.id,
      role: unified.role,
      kind: "text", // Default to text since type property doesn't exist
      emotion: (unified.emotion as IvyEmotion) || undefined,
      emotionalField: unified.emotionalField,
      gravity: unified.gravity,
      delivery: "instant",
      ts: unified.timestamp,
      session_id: undefined, // Not available in unified message
      memory_arc_id: undefined, // Not available in unified message
      payload: {
        text: unified.content,
        memoryConstellation: unified.constellation
          ? {
              depth: unified.memories?.length || 0,
              patterns: unified.patterns || [],
              synthesis: "", // Default synthesis string
              resonance_active: false,
            }
          : undefined,
        consciousnessState: undefined, // Not available in unified message
        meta: undefined, // Not available in unified message
      },
    }
  }

  // ---- Adapter accept hook (updated to use unified adapter)
  const acceptBackendEnvelope = useCallback((envOrList: any) => {
    const adapted = adaptResponse(envOrList)
    if (adapted && adapted.id) {
      setMessagesDeduped((prev) => {
        const adaptedArray = Array.isArray(adapted) ? adapted : [adapted]
        const ivyMessages = adaptedArray
          .filter((item): item is IvyUnifiedMessage => item.id !== undefined)
          .map(unifiedToIvyMessage)
        return [...prev, ...ivyMessages]
      })
    }
  }, [setMessagesDeduped])

  useEffect(() => {
    ;(window as any).IVY_ACCEPT = acceptBackendEnvelope
    return () => {
      try {
        delete (window as any).IVY_ACCEPT
      } catch {}
    }
  }, [acceptBackendEnvelope])

  // ---- Initialize SSE Service with callbacks (stable - only depends on sseService)
  useEffect(() => {
    sseService.setCallbacks({
      onConnectionEstablished: () => {
        console.log('✅ [SSE] Connection established')
        setSseConnected(true)
        setConnectionAttempts(0)
        
        // 🌟 NEW: Update system status in global store
        useConsciousnessStore.getState().setSystemStatus('ready')
      },

      onProcessingPhase: (phase) => {
        setProcessingPhase(phase)

        // Add to consciousness stream - use raw backend data
        appendToConsciousnessStream(phase)

        // PRESERVE meta event in message payload
        const streamId = streamingMessageIdRef.current
        if (streamId) {
          setMessagesDeduped((prev) =>
            prev.map((msg) => {
              if (msg.id === streamId) {
                const metaEvents = msg.payload.meta?.metaEvents || []
                return {
                  ...msg,
                  payload: {
                    ...msg.payload,
                    meta: {
                      ...(msg.payload.meta || {}),
                      metaEvents: [...(Array.isArray(metaEvents) ? metaEvents : []), { type: "processing_phase", data: phase, timestamp: Date.now() }],
                    },
                  },
                }
              }
              return msg
            }),
          )
        }
      },

      onMetaEvent: (eventType, data) => {
        // Store all meta events
        setCurrentProcessingMeta((prev: any) => ({
          ...prev,
          [eventType]: data,
        }))
        
        // 🌟 NEW: Process specific consciousness events
        const messageId = streamingMessageIdRef.current || undefined
        
        switch (eventType) {
          case 'synthesis_complete':
            if (data.synthesis) {
              consciousnessEvents.onSynthesis(data.synthesis, messageId)
            }
            break
            
          case 'emotional_journey':
            consciousnessEvents.onEmotionalJourney(data, messageId)
            break
            
          case 'patterns_detected':
            if (data.count > 0) {
              consciousnessEvents.onPatternEmergence(
                `${data.count} patterns detected`, 
                data.total_strength || data.count / 10, 
                messageId
              )
            }
            break
            
          case 'insights_generated':
            if (data.count > 0) {
              consciousnessEvents.onInsight(
                `${data.count} insights generated (avg score: ${(data.avg_score || 0).toFixed(2)})`,
                messageId
              )
            }
            break
            
          case 'conductor_error':
          case 'consciousness_error':
            // Log errors but don't interrupt flow
            console.warn(`⚠️ [CONSCIOUSNESS] ${eventType}:`, data)
            if (data.error || data.message) {
              addMessage({
                id: crypto.randomUUID(),
                role: "system",
                kind: "text",
                emotion: "neutral",
                ts: Date.now(),
                payload: {
                  text: `⚠️ ${data.message || data.error}`
                },
                delivery: "instant"
              })
            }
            break
        }
      },

      onMemorySurfacing: (memory: SSEMemory) => {
        setSurfacingMemories((prev) => [...prev.slice(-5), memory])

        // Add to consciousness stream
        const gravityPercent = Math.round((memory.gravity || 0) * 100)
        appendToConsciousnessStream(`Memory: ${memory.content} (${gravityPercent}% gravity)`)
        
        // 🌟 NEW: Create memory activity for Navigator
        useConsciousnessStore.getState().addConsciousnessEvent({
          type: 'memory',
          content: memory.content,
          gravity: memory.gravity,
          emotion: memory.emotion,
          metadata: {
            messageId: streamingMessageIdRef.current || undefined
          }
        })
      },

      onPatternEmerging: (pattern: SSEPattern) => {
        setEmergingPatterns((prev) => [...prev.slice(-5), pattern])

        // Add to consciousness stream
        const strengthPercent = Math.round((pattern.strength || 0) * 100)
        appendToConsciousnessStream(`Pattern: ${pattern.pattern} (${strengthPercent}% strength)`)
        
        // 🌟 NEW: Create pattern activity for Navigator
        useConsciousnessStore.getState().addConsciousnessEvent({
          type: 'pattern_emergence',
          content: pattern.pattern,
          gravity: pattern.strength,
          metadata: {
            messageId: streamingMessageIdRef.current || undefined,
            pattern_strength: pattern.strength
          }
        })
      },

      onModeSelected: (mode) => {
        const previousMode = cognitiveState?.mode
        
        setProcessingPhase(`Processing through ${mode}...`)
        
        // Update mode in store
        useConsciousnessStore.getState().setCognitiveMode(mode as any)
        
        // 🌟 Track mode shift in consciousness events
        consciousnessEvents.onModeShift(mode, previousMode, streamingMessageIdRef.current || undefined)
      },

      onToken: (token, messageId) => {
        // Log first token only to confirm streaming started
        if (!sseService.getAccumulatedText(messageId)) {
          console.log('🟢 [SSE] First token received for message:', messageId)
        }

        requestAnimationFrame(() => {
          setMessagesDeduped((prev) => {
            // Get the accumulated text from SSE service
            const currentText = sseService.getAccumulatedText(messageId)

            const existingIndex = prev.findIndex((msg) => msg.id === messageId)

            // Message doesn't exist yet - create it
            if (existingIndex === -1) {
              return [
                ...prev,
                {
                  id: messageId,
                  role: "ivy" as const,
                  kind: "text" as const,
                  emotion: "reflection" as IvyEmotion,
                  ts: Date.now(),
                  payload: {
                    text: currentText, // Use accumulated text
                    streaming: true,
                    consciousnessStream: false,
                  },
                  delivery: "instant" as const,
                },
              ]
            }

            // Update existing message with accumulated text
            return prev.map((msg) => {
              if (msg.id !== messageId) return msg

              // CRITICAL FIX: If transitioning from consciousness stream, APPEND instead of REPLACE
              if (msg.payload.consciousnessStream && currentText) {
                const consciousnessText = msg.payload.text || ''
                const separator = consciousnessText ? '\n\n---\n\n' : ''
                return {
                  ...msg,
                  payload: {
                    ...msg.payload,
                    text: consciousnessText + separator + currentText, // APPEND response after consciousness events
                    streaming: true,
                    consciousnessStream: false, // Turn OFF - now showing actual response
                  },
                }
              }

              // Regular message update - replace with accumulated text
              return {
                ...msg,
                payload: {
                  ...msg.payload,
                  text: currentText, // REPLACE with accumulated
                  streaming: true,
                  // Don't change consciousnessStream flag here
                },
              }
            })
          })
        })
      },

      onResponseComplete: (data) => {
        try {
          const messageId = data?.messageId
          if (!messageId) {
            console.warn("No messageId in response complete data:", data)
            return
          }

          console.log('[RESPONSE_COMPLETE] Raw backend data:', {
            fullData: data,
            emotionFields: {
              emotion_type: data.emotion_type,
              emotion: data.emotion,
              dominant_emotion: data.dominant_emotion,
              emotional_field: data.emotional_field
            },
            gravityFields: {
              gravity_score: data.gravity_score,
              gravity: data.gravity,
              typeof_gravity_score: typeof data.gravity_score,
              typeof_gravity: typeof data.gravity
            },
            memoryFields: {
              active_memory_ids: data.active_memory_ids,
              memory_constellation: data.memory_constellation
            }
          })

          // Extract ACTUAL values from the response using correct backend structure
          const emotion = data.emotional_field?.primary || 'neutral'
          const gravity = data.emotional_field?.intensity || 0.5

          // Extract memory depth from memory_constellation
          const memoryCount = data.memory_constellation?.depth || 0

          // Extract patterns
          const patterns = data.memory_constellation?.patterns || []

          // Extract consciousness state
          const consciousnessMode = data.consciousness_state?.mode
          const coherence = data.consciousness_state?.coherence

          // Extract tokens
          const tokensUsed = data.processing_metadata?.tokens_used || data.tokens_used
          const tokensSaved = data.processing_metadata?.tokens_saved || data.tokens_saved
          const estimatedCost = data.processing_metadata?.estimated_cost || 0
          
          // Extract rich metadata we might be missing
          const keyThemes = data.processing_metadata?.key_themes || []
          const activeMemoryIds = data.active_memory_ids || []
          const synthesis = data.memory_constellation?.synthesis || ''
          const resonanceActive = data.memory_constellation?.resonance_active || false

          console.log('[RESPONSE_COMPLETE] Extracted values:', {
            emotion,
            gravity,
            memoryCount,
            patterns: patterns.length,
            consciousnessMode,
            coherence,
            tokensUsed,
            tokensSaved,
            usedDefaults: {
              emotionIsDefault: emotion === "neutral",
              gravityIsDefault: gravity === 0.5
            }
          })

          // Safely normalize emotional field from backend using correct structure
          let emotionalField: EmotionalField | undefined = undefined
          try {
            if (data.emotional_field && typeof data.emotional_field === "object") {
              emotionalField = {
                dominant: data.emotional_field.primary,
                dominant_emotion: data.emotional_field.primary,
                blend: data.emotional_field.blend,
                emotional_blend: data.emotional_field.blend,
                quality: data.emotional_field.intensity,
                fusion_quality: data.emotional_field.intensity,
                span: data.emotional_field.span,
                emotional_span: data.emotional_field.span,
                average_gravity: data.emotional_field.intensity || gravity,
                harmonic_resonance: data.emotional_field.harmonic_resonance,
                field_coherence: data.emotional_field.field_coherence || coherence,
                evolution_momentum: data.emotional_field.evolution_momentum,
              }
            }
          } catch (error) {
            console.warn("Error normalizing emotional field:", error)
          }

          setMessagesDeduped((prev) => {
            try {
              const existingMessage = prev.find((msg) => msg.id === messageId)

              if (!existingMessage) {
                // Create new complete message if doesn't exist
                const finalMessage: IvyMessage = {
                  id: messageId,
                  role: "ivy",
                  kind: "text",
                  emotion: emotion as IvyEmotion,
                  emotionalField: emotionalField,
                  gravity: gravity,
                  ts: Date.now(),
                  payload: {
                    text: data.finalText || "",
                    streaming: false,
                    consciousnessStream: false,
                    memoryConstellation: data.memory_constellation ? {
                      ...data.memory_constellation,
                      depth: memoryCount, // Add depth for display compatibility
                    } : undefined,
                    consciousnessState: data.consciousness_state,
                    meta: {
                      ...currentProcessingMeta,
                      ...data.processing_metadata,
                      memoryCount: memoryCount,
                      patterns: patterns,
                      // Store extracted values
                      emotion: emotion,
                      gravity: gravity,
                      consciousnessMode: consciousnessMode,
                      coherence: coherence,
                      tokensUsed: tokensUsed,
                      tokensSaved: tokensSaved,
                      estimated_cost: estimatedCost, // 🌟 NEW: Cost tracking
                      // 🌟 NEW: Rich metadata we were missing
                      key_themes: keyThemes,
                      active_memory_ids: activeMemoryIds,
                      synthesis: synthesis,
                      resonance_active: resonanceActive,
                      // Store all backend metadata
                      soul_id: data.soul_id,
                      sovereign_name: data.sovereign_name,
                    },
                  },
                  delivery: "instant",
                }
                return [...prev, finalMessage]
              }

              // Update existing message, preserving accumulated text
              return prev.map((msg) => {
                if (msg.id !== messageId) return msg

                // Determine final text
                let finalText = msg.payload.text || ""

                // If we have streaming text, use it; otherwise use backend text
                if (!finalText || msg.payload.consciousnessStream) {
                  finalText = data.finalText || finalText
                }

                return {
                  ...msg,
                  emotion: emotion as IvyEmotion,
                  emotionalField: emotionalField || msg.emotionalField,
                  gravity: gravity,
                  payload: {
                    ...msg.payload,
                    text: finalText,
                    streaming: false,
                    consciousnessStream: false,
                    memoryConstellation: data.memory_constellation ? {
                      ...data.memory_constellation,
                      depth: memoryCount, // Add depth for display compatibility
                    } : msg.payload.memoryConstellation,
                    consciousnessState: data.consciousness_state || msg.payload.consciousnessState,
                    meta: {
                      ...msg.payload.meta,
                      ...currentProcessingMeta,
                      ...data.processing_metadata,
                      memoryCount: memoryCount,
                      patterns: patterns,
                      // Store extracted values
                      emotion: emotion,
                      gravity: gravity,
                      consciousnessMode: consciousnessMode,
                      coherence: coherence,
                      tokensUsed: tokensUsed,
                      tokensSaved: tokensSaved,
                      estimated_cost: estimatedCost, // 🌟 NEW: Cost tracking
                      // 🌟 NEW: Rich metadata we were missing
                      key_themes: keyThemes,
                      active_memory_ids: activeMemoryIds,
                      synthesis: synthesis,
                      resonance_active: resonanceActive,
                      // Store all backend metadata
                      soul_id: data.soul_id,
                      sovereign_name: data.sovereign_name,
                    },
                  },
                }
              })
            } catch (error) {
              console.error("Error in onResponseComplete message processing:", error)
              return prev
            }
          })

          // Update emotional field state (store only - no local state)
          if (emotionalField) {
            setEmotionalField(emotionalField)
            setCurrentEmotion(emotion)
          } else if (data.consciousness_state?.emotional_field) {
            const field = data.consciousness_state.emotional_field as EmotionalField
            setEmotionalField(field)
          }

          // Update consciousness mode in store
          if (data.consciousness_state && consciousnessMode) {
            useConsciousnessStore.getState().setCognitiveMode(consciousnessMode as any)
          }

          // Clear accumulated meta and streaming refs
          setCurrentProcessingMeta({})
          streamingMessageIdRef.current = null
          cleanupStreaming()
        } catch (error) {
          console.error("Error in onResponseComplete:", error)
          cleanupStreaming()
        }
      },

      onError: (error) => {
        setErrorState({
          message: error,
          canRetry: true,
        })
        setThinking(false)
        streamingMessageIdRef.current = null
        
        // 🌟 Update system status in global store
        useConsciousnessStore.getState().setSystemStatus('error')
      },

      onDebug: (message, data) => {
        // Debug logging removed for production
      },

      onIvyThought: (thought) => {
        // Process through consciousness events hook → store → Navigator
        consciousnessEvents.onThought(thought, streamingMessageIdRef.current || undefined)
        
        // Still add to consciousness stream for real-time display
        appendToConsciousnessStream(`💭 ${typeof thought === 'string' ? thought : JSON.stringify(thought)}`)
      },

      onIvyInsight: (insight) => {
        // Process through consciousness events hook → store → Navigator  
        consciousnessEvents.onInsight(insight, streamingMessageIdRef.current || undefined)
        
        // Still add to consciousness stream for real-time display
        appendToConsciousnessStream(`💡 ${typeof insight === 'string' ? insight : JSON.stringify(insight)}`)
      },

      onIvyContradiction: (contradiction) => {
        // Process through consciousness events hook → store → Navigator
        consciousnessEvents.onContradiction(contradiction, streamingMessageIdRef.current || undefined)
        
        // Still add to consciousness stream for real-time display
        appendToConsciousnessStream(`⚡ ${typeof contradiction === 'string' ? contradiction : JSON.stringify(contradiction)}`)
      },

      onMemoryDepth: (depth) => {
        // Process through consciousness events hook → store → Navigator
        consciousnessEvents.onMemoryDepth(depth, streamingMessageIdRef.current || undefined)
        
        // Still add to consciousness stream for real-time display
        appendToConsciousnessStream(`🏗️ Memory depth: ${depth}`)
      },

      onPatternCount: (count) => {
        // Process pattern emergence through consciousness events hook
        if (count > 0) {
          consciousnessEvents.onPatternEmergence(`${count} patterns detected`, count / 10, streamingMessageIdRef.current || undefined)
        }
        
        // Still add to consciousness stream for real-time display  
        appendToConsciousnessStream(`🔗 ${count} patterns emerging`)
      },
    })

    sseServiceRef.current = sseService
  }, [sseService])

  // REMOVED: Legacy preflight check - system is always ready
  // If API credentials are missing, the message sender will handle the error

  // ---- Session management - emotional/consciousness state now in store (persisted via Zustand)
  // Removed: All localStorage logic for emotional field - store handles persistence via Zustand middleware

  // ---- Auto-scroll handling (improved for streaming)
  useEffect(() => {
    const el = listRef.current
    if (!el) return

    let scrollTimeout: NodeJS.Timeout
    const onScroll = () => {
      // Debounce scroll detection to avoid thrashing during rapid updates
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
        setAutoScroll(nearBottom)
      }, 10)
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      el.removeEventListener("scroll", onScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  useEffect(() => {
    // Auto-scroll when messages update if user is at bottom
    if (autoScroll && listRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated before scrolling
      requestAnimationFrame(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight
        }
      })
    }
  }, [messages, autoScroll])

  // ---- Cleanup
  useEffect(() => {
    return () => {
      sseService.abort()
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    }
  }, [sseService])
  
  // ====== MESSAGE SENDER (EXTRACTED) ======
  const messageSender = useMessageSender(messages as any, sseService, {
    getSessionData,
    onMessageSent: (userMsg, placeholderMsg) => {
      setMessagesDeduped((m) => [...m, userMsg as any, placeholderMsg as any])
      setInput("")
      setRetryCount(0)
      // Reset textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = "48px"
      }
      // Scroll to bottom
      requestAnimationFrame(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight
          setAutoScroll(true)
        }
      })
    },
    onError: (error, retryCount) => {
      const isNetworkError = error.name === "NetworkError" || error.message?.includes("fetch")
      const isTimeoutError = error.name === "TimeoutError" || error.message?.includes("timeout")
      
      setErrorState({
        message:
          retryCount > 2
            ? "Connection persistently unstable. Please refresh."
            : isNetworkError
              ? "Network connection lost. Retrying..."
              : isTimeoutError
                ? "Request timed out. Retrying..."
                : "Connection wavered. Retrying...",
        canRetry: retryCount <= 2,
      })
      
      // Clean up failed message
      try {
        const failedMsgId = streamingMessageIdRef.current
        if (failedMsgId) {
          setMessagesDeduped((prev) => prev.filter((msg) => msg.id !== failedMsgId))
        }
      } catch (cleanupError) {
        console.warn("Error cleaning up failed message:", cleanupError)
      }
      
      cleanupStreaming()
      setSseConnected(false)
      setThinking(false)
    },
    onSuccess: () => {
      setThinking(false)
      streamingMessageIdRef.current = null
      setConnectionAttempts(0)
      setRetryCount(0)
    }
  })

  // ---- MESSAGE SENDING (REFACTORED - uses hook)
  const handleSend = useCallback(
    async (isRetry = false) => {
      try {
        const text = (isRetry ? messageSender.lastMessage : input)?.trim() || ""
        
        // Block empty messages
        if (!text && !isRetry) return
        
        // Prevent rapid-fire sending
        if (isThinking) {
          console.warn("Already thinking, ignoring send request")
          return
        }

        // Config check is handled by SSE service - it will show error if needed

        // Generate message ID
        const messageId = crypto.randomUUID()
        streamingMessageIdRef.current = messageId
        setThinking(true)
        
        // Clear error state
        setErrorState(null)
        setSurfacingMemories([])
        setEmergingPatterns([])
        setProcessingPhase("")
        
        // Abort any existing SSE
        sseService.abort()
        
        await messageSender.sendMessage(text, messageId, isRetry, retryCount)
      } catch (error) {
        // Error handled by hook
        console.error("Error in handleSend:", error)
      }
    },
    [input, retryCount, messageSender, isThinking, sseService, setMessagesDeduped]
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend().catch((error) => {
        console.error("Error in onKeyDown handleSend:", error)
      })
    }
  }

  const jumpToLatest = () => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }

  // ---- Message processing moved to MessageList component

  // ---- Background - solid black for maximum readability
  const backgroundGradient = "bg-black"

  // ============================
  // MAIN UI RENDER
  // ============================
  return (
    <div
      className={cx(
        "relative flex h-screen w-full flex-col text-gray-100 transition-all duration-1000",
        backgroundGradient,
      )}
    >
      {/* Mode Aura System - Ambient Intelligence per North Star */}
      <ModeAura position="top" size="md" />
      
      {/* Ambient background effect */}
      <ModeAuraBackground />

      {/* Search button - positioned in top right */}
      <div className="fixed top-4 right-4 z-30">
        <button
          onClick={() => setShowSearch((v) => !v)}
          className={cx(
            "p-2 rounded-lg border transition-all backdrop-blur-sm",
            showSearch
              ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
              : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-400",
          )}
        >
          <Search className="h-4 w-4" />
        </button>
      </div>


      {/* Search Rail (slides in from right when active) */}
      {showSearch && (
        <>
          <div
            onClick={() => setShowSearch(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            style={{ animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
          <div
            className="fixed top-0 right-0 bottom-0 w-96 bg-gradient-to-l from-gray-900/98 to-gray-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 animate-in slide-in-from-right duration-300"
            style={{ animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-white">Search</h2>
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
                      placeholder="Search conversations..."
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}


      {/* Message Transcript */}
      <MessageList
        ref={listRef}
        messages={messages}
        isThinking={isThinking}
        showConsciousness={showConsciousness}
        showOnlyInsights={showOnlyInsights}
        searchQuery={searchQuery}
        surfacingMemories={surfacingMemories}
        emergingPatterns={emergingPatterns}
        processingPhase={processingPhase}
        errorState={errorState}
        streamingMessageId={streamingMessageIdRef.current}
        messageAccumulator={
          new Map(
            streamingMessageIdRef.current
              ? [[streamingMessageIdRef.current, sseService.getAccumulatedText(streamingMessageIdRef.current)]]
              : [],
          )
        }
        currentEmotionalField={emotionalField}
        systemStatus={cognitiveState.system_status}
        onRetry={() => {
          setErrorState(null)
          handleSend(true).catch((error) => {
            console.error("Error in onRetry handleSend:", error)
          })
        }}
      />

      {/* Jump to latest button - positioned above composer */}
      {!autoScroll && (
        <div className="fixed bottom-32 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <button
            onClick={jumpToLatest}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/90 px-3 py-1 text-xs text-zinc-300 shadow hover:text-zinc-100"
          >
            <CornerDownLeft className="h-3.5 w-3.5" /> Jump to latest
          </button>
        </div>
      )}

      {/* Message Composer - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-800/50 bg-black/98 backdrop-blur-xl py-3 px-4 z-20">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-900/70 px-4 py-3 shadow-lg min-h-[56px]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyDown={onKeyDown}
              placeholder="Speak to IVY…"
              rows={1}
              className="min-h-[48px] max-h-[200px] w-full resize-none bg-transparent text-base text-gray-100 outline-none placeholder:text-gray-400 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 leading-relaxed"
              disabled={isThinking}
            />
            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
              <button
                title="Voice (soon)"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-700/70 hover:text-gray-200 transition-all duration-200"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                title="Image (soon)"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-700/70 hover:text-gray-200 transition-all duration-200"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button
                title="Attach (soon)"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-700/70 hover:text-gray-200 transition-all duration-200"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>
          </div>
          <button
            onClick={() =>
              handleSend().catch((error) => {
                console.error("Error in onClick handleSend:", error)
              })
            }
            disabled={isThinking || !input.trim()}
            className={cx(
              "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black min-h-[56px] flex-shrink-0",
              isThinking || !input.trim()
                ? "bg-gray-600/80 cursor-not-allowed opacity-60"
                : emotionalField?.dominant
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-[1.02] shadow-indigo-500/25 focus:ring-indigo-500/50"
                  : "bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] shadow-blue-500/25 focus:ring-blue-500/50",
            )}
          >
            {isThinking ? (
              <>
                <Wand2 className="h-5 w-5 opacity-50" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation is now handled by GlobalNavigation component */}
    </div>
  )
}

// ============================
// MESSAGE COMPONENTS MOVED TO MessageList
// ============================
