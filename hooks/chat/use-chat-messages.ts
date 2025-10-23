/**
 * USE CHAT MESSAGES
 * Manages message state, deduplication, and persistence
 * 
 * Responsibilities:
 * - Message CRUD operations
 * - Deduplication logic
 * - LocalStorage persistence
 * - Message filtering/search
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { IvyMessage } from '@/types/chat'

const STORAGE_KEY = "ivy.chat.v8"

interface UseChatMessagesOptions {
  enablePersistence?: boolean
  maxMessages?: number
}

export function useChatMessages(options: UseChatMessagesOptions = {}) {
  const {
    enablePersistence = true,
    maxMessages = 1000
  } = options

  // Core state
  const [messages, setMessages] = useState<IvyMessage[]>([])
  
  // Deduplication tracking
  const messageIdsRef = useRef<Set<string>>(new Set())

  // ============================
  // DEDUPLICATION
  // ============================
  const setMessagesDeduped = useCallback((updater: React.SetStateAction<IvyMessage[]>) => {
    setMessages((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      
      // Filter out duplicates
      const deduped = next.filter((msg) => {
        if (messageIdsRef.current.has(msg.id)) {
          return true // Keep existing
        }
        messageIdsRef.current.add(msg.id)
        return true
      })
      
      return deduped
    })
  }, [])

  // ============================
  // CRUD OPERATIONS
  // ============================
  const addMessage = useCallback((message: IvyMessage) => {
    setMessagesDeduped((prev) => [...prev, message])
  }, [setMessagesDeduped])

  const updateMessage = useCallback((id: string, updates: Partial<IvyMessage>) => {
    setMessagesDeduped((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
    )
  }, [setMessagesDeduped])

  const deleteMessage = useCallback((id: string) => {
    setMessagesDeduped((prev) => prev.filter((msg) => msg.id !== id))
    messageIdsRef.current.delete(id)
  }, [setMessagesDeduped])

  const clearMessages = useCallback(() => {
    setMessages([])
    messageIdsRef.current.clear()
  }, [])

  // ============================
  // QUERY OPERATIONS
  // ============================
  const getMessage = useCallback((id: string) => {
    return messages.find((msg) => msg.id === id)
  }, [messages])

  const getMessagesByRole = useCallback((role: IvyMessage['role']) => {
    return messages.filter((msg) => msg.role === role)
  }, [messages])

  const searchMessages = useCallback((query: string) => {
    if (!query.trim()) return messages
    
    const lowerQuery = query.toLowerCase()
    return messages.filter(
      (msg) =>
        msg.payload.text?.toLowerCase().includes(lowerQuery) ||
        msg.emotion?.toLowerCase().includes(lowerQuery) ||
        msg.payload.memory?.summary?.toLowerCase().includes(lowerQuery)
    )
  }, [messages])

  // ============================
  // PERSISTENCE
  // ============================
  // Load from localStorage on mount
  useEffect(() => {
    if (!enablePersistence) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed.messages)) {
          const recentMessages = parsed.messages.slice(-20) // Only load recent
          setMessagesDeduped(recentMessages)
        }
      }
    } catch (e) {
      console.error("Session load error:", e)
    }
  }, [enablePersistence, setMessagesDeduped])

  // Save to localStorage when messages change
  useEffect(() => {
    if (!enablePersistence) return

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          messages: messages.slice(-maxMessages), // Limit stored messages
          timestamp: Date.now()
        })
      )
    } catch (e) {
      console.error("Session save error:", e)
    }
  }, [messages, enablePersistence, maxMessages])

  return {
    // State
    messages,
    messageCount: messages.length,
    
    // CRUD
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    setMessages: setMessagesDeduped,
    
    // Query
    getMessage,
    getMessagesByRole,
    searchMessages,
  }
}
