/**
 * USE SSE STATE
 * Manages SSE connection state and streaming data
 * 
 * Responsibilities:
 * - SSE connection status
 * - Streaming metadata (memories, patterns, phase)
 * - Error state
 * - Connection retry logic
 */

import { useState, useRef } from 'react'
import type { SSEMemory, SSEPattern, ChatError } from '@/types/chat'

export function useSSEState() {
  // SSE Connection State
  const [sseConnected, setSseConnected] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [errorState, setErrorState] = useState<ChatError | null>(null)
  
  // Streaming Data
  const [surfacingMemories, setSurfacingMemories] = useState<SSEMemory[]>([])
  const [emergingPatterns, setEmergingPatterns] = useState<SSEPattern[]>([])
  const [processingPhase, setProcessingPhase] = useState("")
  const [currentProcessingMeta, setCurrentProcessingMeta] = useState<any>({})
  
  // Streaming Refs
  const streamingMessageIdRef = useRef<string | null>(null)
  const messageAccumulator = useRef<Map<string, string>>(new Map())

  return {
    // Connection State
    sseConnected,
    setSseConnected,
    connectionAttempts,
    setConnectionAttempts,
    errorState,
    setErrorState,
    
    // Streaming Data
    surfacingMemories,
    setSurfacingMemories,
    emergingPatterns,
    setEmergingPatterns,
    processingPhase,
    setProcessingPhase,
    currentProcessingMeta,
    setCurrentProcessingMeta,
    
    // Refs
    streamingMessageIdRef,
    messageAccumulator,
  }
}
