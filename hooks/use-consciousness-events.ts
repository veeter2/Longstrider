/**
 * USE CONSCIOUSNESS EVENTS
 * Professional-grade consciousness event processing
 * 
 * Architecture:
 * SSE Events → This Hook → Consciousness Store → Navigator/UI
 * 
 * Responsibilities:
 * - Process raw consciousness events from SSE stream
 * - Transform into structured SpaceActivity events  
 * - Update consciousness store with rich metadata
 * - Handle event deduplication and rate limiting
 * - Provide debugging and monitoring capabilities
 */

import { useCallback, useRef, useEffect } from 'react'
import { useConsciousnessStore } from '@/stores/consciousness-store'
import type { SpaceActivity } from '@/stores/consciousness-store'

/**
 * Simple hash function for content deduplication
 * Better than first-50-chars approach
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

interface ConsciousnessEventOptions {
  // Rate limiting
  maxEventsPerMinute?: number
  
  // Filtering
  enabledEventTypes?: Array<SpaceActivity['type']>
  
  // Debugging
  enableLogging?: boolean
  
  // Quality control
  minContentLength?: number
}

interface RawConsciousnessEvent {
  type: 'thought' | 'insight' | 'contradiction' | 'memory_depth' | 'pattern'
  content: any
  messageId?: string
  metadata?: Record<string, any>
}

export function useConsciousnessEvents(options: ConsciousnessEventOptions = {}) {
  const {
    maxEventsPerMinute = 30,
    enabledEventTypes = ['thought', 'insight', 'contradiction', 'memory_depth', 'pattern_emergence', 'mode_shift'],
    enableLogging = true,
    minContentLength = 3
  } = options
  
  // Store access
  const { 
    addConsciousnessEvent, 
    setThinking, 
    setCognitiveMode, 
    setCurrentEmotion,
    cognitiveState 
  } = useConsciousnessStore()
  
  // Rate limiting
  const eventCountRef = useRef<number[]>([])
  
  // Event deduplication with time windows
  const recentEventsRef = useRef<Set<string>>(new Set())
  
  // Clear dedup cache every 5 minutes to allow event recurrence
  useEffect(() => {
    const intervalId = setInterval(() => {
      recentEventsRef.current.clear()
      if (enableLogging) {
        console.log('🧹 [CONSCIOUSNESS] Dedup cache cleared - allowing event recurrence')
      }
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(intervalId)
  }, [enableLogging])
  
  const isRateLimited = useCallback(() => {
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    
    // Clean old timestamps
    eventCountRef.current = eventCountRef.current.filter(timestamp => timestamp > oneMinuteAgo)
    
    return eventCountRef.current.length >= maxEventsPerMinute
  }, [maxEventsPerMinute])
  
  const isDuplicate = useCallback((eventKey: string, useTimeWindow = true) => {
    // Add time window to key (5-minute windows)
    // This allows same content to appear again after 5 minutes
    const timeWindow = useTimeWindow ? Math.floor(Date.now() / (5 * 60 * 1000)) : ''
    const keyWithTime = useTimeWindow ? `${eventKey}:${timeWindow}` : eventKey
    
    if (recentEventsRef.current.has(keyWithTime)) {
      return true
    }
    
    // Add to recent events
    recentEventsRef.current.add(keyWithTime)
    
    // Keep only last 200 event keys (increased from 100 for better dedup)
    if (recentEventsRef.current.size > 200) {
      const keys = Array.from(recentEventsRef.current)
      recentEventsRef.current = new Set(keys.slice(-100))
    }
    
    return false
  }, [])
  
  /**
   * Process IVY thought event
   */
  const onThought = useCallback((thought: any, messageId?: string) => {
    if (isRateLimited()) return
    
    const content = typeof thought === 'string' ? thought : JSON.stringify(thought)
    // Use content hash for better deduplication
    const contentHash = simpleHash(content)
    const eventKey = `thought:${contentHash}`
    
    if (isDuplicate(eventKey) || content.length < minContentLength) return
    
    if (enableLogging) {
      console.log('🧠 [CONSCIOUSNESS] Processing thought:', { thought, messageId })
    }
    
    eventCountRef.current.push(Date.now())
    
    addConsciousnessEvent({
      type: 'thought',
      content: `💭 ${content}`,
      metadata: {
        messageId,
        consciousness_state: { thought }
      }
    })
  }, [isRateLimited, isDuplicate, minContentLength, enableLogging, addConsciousnessEvent])
  
  /**
   * Process IVY insight event  
   */
  const onInsight = useCallback((insight: any, messageId?: string) => {
    if (isRateLimited()) return
    
    const content = typeof insight === 'string' ? insight : JSON.stringify(insight)
    // Use content hash for better deduplication
    const contentHash = simpleHash(content)
    const eventKey = `insight:${contentHash}`
    
    if (isDuplicate(eventKey) || content.length < minContentLength) return
    
    if (enableLogging) {
      console.log('💡 [CONSCIOUSNESS] Processing insight:', { insight, messageId })
    }
    
    eventCountRef.current.push(Date.now())
    
    addConsciousnessEvent({
      type: 'insight',
      content: `💡 ${content}`,
      gravity: 0.8, // Insights have high gravity
      metadata: {
        messageId,
        consciousness_state: { insight }
      }
    })
  }, [isRateLimited, isDuplicate, minContentLength, enableLogging, addConsciousnessEvent])
  
  /**
   * Process IVY contradiction event
   */
  const onContradiction = useCallback((contradiction: any, messageId?: string) => {
    if (isRateLimited()) return
    
    const content = typeof contradiction === 'string' ? contradiction : JSON.stringify(contradiction)
    // Use content hash for better deduplication
    const contentHash = simpleHash(content)
    const eventKey = `contradiction:${contentHash}`
    
    if (isDuplicate(eventKey) || content.length < minContentLength) return
    
    if (enableLogging) {
      console.log('⚡ [CONSCIOUSNESS] Processing contradiction:', { contradiction, messageId })
    }
    
    eventCountRef.current.push(Date.now())
    
    addConsciousnessEvent({
      type: 'contradiction',
      content: `⚡ ${content}`,
      gravity: 0.9, // Contradictions are very significant
      emotion: 'tension',
      metadata: {
        messageId,
        contradiction_type: 'cognitive',
        consciousness_state: { contradiction }
      }
    })
  }, [isRateLimited, isDuplicate, minContentLength, enableLogging, addConsciousnessEvent])
  
  /**
   * Process memory depth event
   */
  const onMemoryDepth = useCallback((depth: number, messageId?: string) => {
    if (isRateLimited()) return
    
    // DON'T deduplicate memory depth - it shows progression
    // Each depth reading is meaningful, even if same number
    
    if (enableLogging) {
      console.log('🏗️ [CONSCIOUSNESS] Processing memory depth:', { depth, messageId })
    }
    
    eventCountRef.current.push(Date.now())
    
    // Only log significant memory depth changes
    if (depth > 10) {
      addConsciousnessEvent({
        type: 'memory_depth',
        content: `🏗️ Memory depth reached: ${depth} memories`,
        gravity: Math.min(depth / 50, 1), // Scale gravity with depth
        metadata: {
          messageId,
          depth,
          consciousness_state: { memory_depth: depth }
        }
      })
    }
  }, [isRateLimited, enableLogging, addConsciousnessEvent])
  
  /**
   * Process pattern emergence event
   */
  const onPatternEmergence = useCallback((pattern: any, strength?: number, messageId?: string) => {
    if (isRateLimited()) return
    
    const content = typeof pattern === 'string' ? pattern : JSON.stringify(pattern)
    // Use content hash for better deduplication
    const contentHash = simpleHash(content)
    const eventKey = `pattern:${contentHash}`
    
    if (isDuplicate(eventKey) || content.length < minContentLength) return
    
    if (enableLogging) {
      console.log('🌿 [CONSCIOUSNESS] Processing pattern emergence:', { pattern, strength, messageId })
    }
    
    eventCountRef.current.push(Date.now())
    
    addConsciousnessEvent({
      type: 'pattern_emergence',
      content: `🌿 Pattern detected: ${content}`,
      gravity: strength || 0.6,
      metadata: {
        messageId,
        pattern_strength: strength,
        consciousness_state: { pattern, strength }
      }
    })
  }, [isRateLimited, isDuplicate, minContentLength, enableLogging, addConsciousnessEvent])
  
  /**
   * Process mode shift event
   */
  const onModeShift = useCallback((newMode: string, oldMode?: string, messageId?: string) => {
    if (isRateLimited()) return
    
    // DON'T deduplicate mode shifts - they're important transitions
    // Even oscillating modes (flow→resonance→flow) should be visible
    
    if (enableLogging) {
      console.log(`🔄 [CONSCIOUSNESS] Processing mode shift: ${oldMode} → ${newMode}`, { messageId })
    }
    
    eventCountRef.current.push(Date.now())
    
    // Update store mode
    setCognitiveMode(newMode as any)
    
    addConsciousnessEvent({
      type: 'mode_shift',
      content: oldMode 
        ? `🔄 Mode shift: ${oldMode} → ${newMode}`
        : `🔄 Mode activated: ${newMode}`,
      gravity: 0.7,
      metadata: {
        messageId,
        mode_from: oldMode,
        mode_to: newMode,
        consciousness_state: { mode_shift: { from: oldMode, to: newMode } }
      }
    })
  }, [isRateLimited, enableLogging, addConsciousnessEvent, setCognitiveMode])
  
  /**
   * Process synthesis complete event
   */
  const onSynthesis = useCallback((synthesis: string, messageId?: string) => {
    if (!synthesis || synthesis.length < minContentLength) return
    if (isRateLimited()) return
    
    // Use content hash for better deduplication
    const contentHash = simpleHash(synthesis)
    const eventKey = `synthesis:${contentHash}`
    if (isDuplicate(eventKey)) return
    
    if (enableLogging) {
      console.log('🧬 [CONSCIOUSNESS] Processing synthesis:', { synthesis: synthesis.substring(0, 100), messageId })
    }
    
    eventCountRef.current.push(Date.now())
    
    addConsciousnessEvent({
      type: 'memory',
      content: `🧬 Memory synthesis: ${synthesis.substring(0, 150)}...`,
      gravity: 0.7,
      metadata: {
        messageId,
        synthesis: synthesis,
        consciousness_state: { synthesis }
      }
    })
  }, [isRateLimited, isDuplicate, minContentLength, enableLogging, addConsciousnessEvent])
  
  /**
   * Process emotional journey event
   */
  const onEmotionalJourney = useCallback((journey: any, messageId?: string) => {
    if (!journey || isRateLimited()) return
    
    const trajectory = journey.trajectory || journey.current_state || 'processing'
    // Use content hash of full journey object for better deduplication
    const contentHash = simpleHash(JSON.stringify(journey))
    const eventKey = `emotional_journey:${contentHash}`
    if (isDuplicate(eventKey)) return
    
    if (enableLogging) {
      console.log('🎭 [CONSCIOUSNESS] Processing emotional journey:', { journey, messageId })
    }
    
    eventCountRef.current.push(Date.now())
    
    // Update current emotion in store
    if (journey.current_state) {
      setCurrentEmotion(journey.current_state)
    }
    
    addConsciousnessEvent({
      type: 'insight',
      content: `🎭 Emotional shift: ${trajectory}`,
      gravity: journey.intensity || 0.6,
      emotion: journey.current_state,
      metadata: {
        messageId,
        consciousness_state: { emotional_journey: journey }
      }
    })
  }, [isRateLimited, isDuplicate, enableLogging, addConsciousnessEvent, setCurrentEmotion])
  
  /**
   * Clear event history (for testing/debugging)
   */
  const clearEventHistory = useCallback(() => {
    eventCountRef.current = []
    recentEventsRef.current.clear()
    if (enableLogging) {
      console.log('🧹 [CONSCIOUSNESS] Event history cleared')
    }
  }, [enableLogging])
  
  /**
   * Get event processing stats
   */
  const getStats = useCallback(() => {
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    const recentEvents = eventCountRef.current.filter(timestamp => timestamp > oneMinuteAgo)
    
    return {
      eventsInLastMinute: recentEvents.length,
      maxEventsPerMinute,
      rateLimitActive: isRateLimited(),
      totalRecentEvents: recentEventsRef.current.size,
      currentSpaceId: cognitiveState.current_space_id
    }
  }, [maxEventsPerMinute, isRateLimited, cognitiveState.current_space_id])
  
  return {
    // Event processors
    onThought,
    onInsight,
    onContradiction,
    onMemoryDepth,
    onPatternEmergence,
    onModeShift,
    onSynthesis,
    onEmotionalJourney,
    
    // Utilities
    clearEventHistory,
    getStats,
    
    // State
    isRateLimited: isRateLimited()
  }
}
