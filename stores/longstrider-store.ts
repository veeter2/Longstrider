"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LSMessage, AgentBehavior } from '@/types/longstrider'

// ============================
// LONGSTRIDER STORE
// Persistent state for LongStrider chat system
// ============================

export interface LongStriderState {
  // Messages per thread
  messagesByThread: Record<string, LSMessage[]>

  // Current session context
  currentThreadId: string | null
  currentSessionId: string | null
  currentMemoryTraceId: string | null

  // Agent behavior
  agentBehavior: AgentBehavior

  // Session metadata
  firstMessageTimestamp: number | null
  conversationName: string | null

  // Message counts
  totalMessageCount: number
  userMessageCount: number

  // Loading states
  isLoading: boolean
  isSending: boolean
  error: string | null

  // Hydration state
  _hasHydrated: boolean
  setHasHydrated: (hasHydrated: boolean) => void

  // ============================
  // MESSAGE ACTIONS
  // ============================

  addMessage: (threadId: string, message: LSMessage) => void
  updateMessage: (threadId: string, messageId: string, updates: Partial<LSMessage>) => void
  deleteMessage: (threadId: string, messageId: string) => void
  clearMessages: (threadId: string) => void
  getMessages: (threadId: string) => LSMessage[]

  // ============================
  // THREAD ACTIONS
  // ============================

  setCurrentThread: (threadId: string) => void
  createNewThread: (threadId: string, sessionId: string) => void

  // ============================
  // SESSION ACTIONS
  // ============================

  setCurrentSession: (sessionId: string) => void
  setMemoryTraceId: (memoryTraceId: string) => void
  setConversationName: (name: string) => void

  // ============================
  // AGENT ACTIONS
  // ============================

  setAgentBehavior: (behavior: Partial<AgentBehavior>) => void

  // ============================
  // LOADING ACTIONS
  // ============================

  setLoading: (isLoading: boolean) => void
  setSending: (isSending: boolean) => void
  setError: (error: string | null) => void

  // ============================
  // UTILITY ACTIONS
  // ============================

  incrementMessageCount: () => void
  incrementUserMessageCount: () => void
  resetCounts: () => void
}

export const useLongStriderStore = create<LongStriderState>()(
  persist(
    (set, get) => ({
      // Initial State
      messagesByThread: {},
      currentThreadId: null,
      currentSessionId: null,
      currentMemoryTraceId: null,
      agentBehavior: {
        mode: 'proactive',
        interruption_threshold: 0.6,
        insight_frequency: 'realtime',
        personality: {
          curiosity: 0.7,
          caution: 0.5,
          creativity: 0.8,
          efficiency: 0.6
        },
        focus_areas: ['memory-optimization', 'pattern-detection', 'cost-monitoring']
      },
      firstMessageTimestamp: null,
      conversationName: null,
      totalMessageCount: 0,
      userMessageCount: 0,
      isLoading: false,
      isSending: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (hasHydrated) => {
        set({ _hasHydrated: hasHydrated })
      },

      // Message Actions
      addMessage: (threadId, message) => {
        set((state) => {
          const threadMessages = state.messagesByThread[threadId] || []
          return {
            messagesByThread: {
              ...state.messagesByThread,
              [threadId]: [...threadMessages, message]
            },
            // Set first message timestamp if not set
            firstMessageTimestamp: state.firstMessageTimestamp || Date.now()
          }
        })
      },

      updateMessage: (threadId, messageId, updates) => {
        set((state) => {
          const threadMessages = state.messagesByThread[threadId] || []
          const updatedMessages = threadMessages.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          )
          return {
            messagesByThread: {
              ...state.messagesByThread,
              [threadId]: updatedMessages
            }
          }
        })
      },

      deleteMessage: (threadId, messageId) => {
        set((state) => {
          const threadMessages = state.messagesByThread[threadId] || []
          return {
            messagesByThread: {
              ...state.messagesByThread,
              [threadId]: threadMessages.filter(msg => msg.id !== messageId)
            }
          }
        })
      },

      clearMessages: (threadId) => {
        set((state) => {
          const { [threadId]: deleted, ...remaining } = state.messagesByThread
          return {
            messagesByThread: remaining
          }
        })
      },

      getMessages: (threadId) => {
        return get().messagesByThread[threadId] || []
      },

      // Thread Actions
      setCurrentThread: (threadId) => {
        set({ currentThreadId: threadId })
      },

      createNewThread: (threadId, sessionId) => {
        set({
          currentThreadId: threadId,
          currentSessionId: sessionId,
          messagesByThread: {
            ...get().messagesByThread,
            [threadId]: []
          },
          firstMessageTimestamp: Date.now(),
          totalMessageCount: 0,
          userMessageCount: 0
        })
      },

      // Session Actions
      setCurrentSession: (sessionId) => {
        set({ currentSessionId: sessionId })
      },

      setMemoryTraceId: (memoryTraceId) => {
        set({ currentMemoryTraceId: memoryTraceId })
      },

      setConversationName: (name) => {
        set({ conversationName: name })
      },

      // Agent Actions
      setAgentBehavior: (behavior) => {
        set((state) => ({
          agentBehavior: {
            ...state.agentBehavior,
            ...behavior
          }
        }))
      },

      // Loading Actions
      setLoading: (isLoading) => {
        set({ isLoading })
      },

      setSending: (isSending) => {
        set({ isSending })
      },

      setError: (error) => {
        set({ error })
      },

      // Utility Actions
      incrementMessageCount: () => {
        set((state) => ({
          totalMessageCount: state.totalMessageCount + 1
        }))
      },

      incrementUserMessageCount: () => {
        set((state) => ({
          userMessageCount: state.userMessageCount + 1
        }))
      },

      resetCounts: () => {
        set({
          totalMessageCount: 0,
          userMessageCount: 0,
          firstMessageTimestamp: null
        })
      }
    }),
    {
      name: 'longstrider-store',
      // Persist messages and session context
      partialize: (state) => ({
        messagesByThread: state.messagesByThread,
        currentThreadId: state.currentThreadId,
        currentSessionId: state.currentSessionId,
        currentMemoryTraceId: state.currentMemoryTraceId,
        agentBehavior: state.agentBehavior,
        conversationName: state.conversationName
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)
