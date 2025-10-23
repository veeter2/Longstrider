// ============================================
// ROCKET HOOKS - Performance-first state management
// ============================================

import { useState, useCallback, useRef, useMemo } from 'react'
import { getIvyConfig } from '../lib/supabase'

// ============================================
// MESSAGE STATE HOOK - O(1) operations
// ============================================

export function useMessageState() {
  const [messages, setMessages] = useState<Map<string, any>>(new Map())
  const orderRef = useRef<string[]>([])
  const [trigger, setTrigger] = useState(0) // Force re-renders

  const add = useCallback((message: any) => {
    setMessages(prev => {
      const next = new Map(prev)
      next.set(message.id, message)
      orderRef.current.push(message.id)
      return next
    })
    setTrigger(t => t + 1) // Trigger re-render
  }, [])

  const update = useCallback((id: string, updates: any) => {
    setMessages(prev => {
      const next = new Map(prev)
      const existing = next.get(id)
      if (existing) {
        next.set(id, { ...existing, ...updates })
      }
      return next
    })
    setTrigger(t => t + 1) // Trigger re-render
  }, [])

  const updateContent = useCallback((id: string, chunk: string) => {
    setMessages(prev => {
      const next = new Map(prev)
      const existing = next.get(id)
      if (existing) {
        next.set(id, {
          ...existing,
          content: existing.content + chunk
        })
      }
      return next
    })
    setTrigger(t => t + 1) // Trigger re-render
  }, [])

  const attachMemories = useCallback((id: string, memories: any[]) => {
    setMessages(prev => {
      const next = new Map(prev)
      const existing = next.get(id)
      if (existing) {
        next.set(id, {
          ...existing,
          memories: [...(existing.memories || []), ...memories]
        })
      }
      return next
    })
    setTrigger(t => t + 1) // Trigger re-render
  }, [])

  const items = useMemo(() => {
    const seen = new Set<string>()
    return orderRef.current
      .filter(id => {
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
      .map(id => messages.get(id))
      .filter(Boolean)
  }, [messages, trigger]) // Include trigger to force recomputation

  const get = useCallback((id: string) => messages.get(id), [messages])

  return {
    items,
    add,
    update,
    updateContent,
    attachMemories,
    finalizeStreaming: (id: string) => update(id, { streaming: false }),
    setFeedback: (id: string, feedback: string) => update(id, { feedback }),
    updateGravity: (id: string, gravity: number) => update(id, { gravity }),
    get
  }
}

// ============================================
// META MEMORY HOOK - Dynamic memory flow
// ============================================

export function useMetaMemory({ userId, sessionId }: { userId: string; sessionId: string }) {
  const [activeMemories, setActiveMemories] = useState<any[]>([])
  const [focusedMemory, setFocusedMemory] = useState<any>(null)
  const memoryCache = useRef(new Map<string, any>())
  
  const fetchRelatedMemories = useCallback(async (content: string, limit = 5) => {
    try {
      const config = await getIvyConfig()
      if (!config) return []
      
      // Check cache first
      const cacheKey = `${content.slice(0, 50)}_${limit}`
      if (memoryCache.current.has(cacheKey)) {
        return memoryCache.current.get(cacheKey)
      }
      
      // Fetch from fusion engine
      const response = await fetch(`${config.supabaseUrl}/functions/v1/cognition-fusion-engine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.supabaseKey}`
        },
        body: JSON.stringify({
          user_id: userId,
          query: content,
          limit,
          threshold: 0.3
        })
      })
      
      if (!response.ok) throw new Error('Memory fetch failed')
      
      const data = await response.json()
      const memories = data.entries || []
      
      // Calculate semantic distance for UI positioning
      const enhancedMemories = memories.map((m: any, i: number) => ({
        ...m,
        distance: i / memories.length // Simple distance metric
      }))
      
      // Cache result
      memoryCache.current.set(cacheKey, enhancedMemories)
      
      return enhancedMemories
    } catch (error) {
      console.error('Memory fetch error:', error)
      return []
    }
  }, [userId])
  
  const recordFeedback = useCallback(async (messageId: string, feedback: string) => {
    try {
      const config = await getIvyConfig()
      if (!config) return
      
      // Send feedback to backend for learning
      await fetch(`${config.supabaseUrl}/functions/v1/cognition_intake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.supabaseKey}`
        },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          type: 'feedback',
          content: feedback,
          metadata: {
            message_id: messageId,
            feedback_type: feedback,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('Feedback recording error:', error)
    }
  }, [userId, sessionId])
  
  const focusMemory = useCallback((memory: any) => {
    setFocusedMemory(memory)
    // Fetch deeper connections for focused memory
    fetchRelatedMemories(memory.content, 10).then(related => {
      setActiveMemories(related)
    })
  }, [fetchRelatedMemories])
  
  return {
    activeMemories,
    focusedMemory,
    fetchRelatedMemories,
    recordFeedback,
    focusMemory
  }
}

// ============================================
// STREAM ENGINE HOOK - Real streaming
// ============================================

export function useStreamEngine() {
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const send = useCallback(async ({
    content,
    userId,
    sessionId,
    threadId,
    mode,
    onChunk,
    onMemory,
    onComplete
  }: {
    content: string
    userId: string
    sessionId: string
    threadId?: string
    mode: string
    onChunk: (chunk: string) => void
    onMemory: (memories: any[]) => void
    onComplete: () => void
  }) => {
    // Abort any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current
    
    try {
      const config = await getIvyConfig()
      if (!config) throw new Error('Config not available')
      
      const response = await fetch(`${config.supabaseUrl}/functions/v1/cce-orchestrator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.supabaseKey}`,
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          user_id: userId,
          content,
          session_id: sessionId,
          thread_id: threadId,
          memory_trace_id: threadId,
          type: 'assistant',
          mode,
          metadata: {
            source: 'chat',
            timestamp: new Date().toISOString()
          }
        }),
        signal
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')
      
      const decoder = new TextDecoder()
      let buffer = ''
      let memoryFetched = false
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              onComplete()
              break
            }
            
            try {
              const parsed = JSON.parse(data)
              
              // Handle content chunks
              if (parsed.content) {
                onChunk(parsed.content)
              }
              
              // Handle memory constellation (only once)
              if (parsed.memories && !memoryFetched) {
                onMemory(parsed.memories)
                memoryFetched = true
              }
            } catch {
              // Plain text chunk
              if (data) onChunk(data)
            }
          }
        }
      }
      
      onComplete()
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Stream error:', error)
        throw error
      }
    }
  }, [])
  
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])
  
  return { send, abort }
}
