/**
 * USE MESSAGE SENDER
 * Handles message sending logic with retry and error handling
 * 
 * Responsibilities:
 * - Send user messages via SSE
 * - Handle retries with exponential backoff
 * - Manage error states
 * - Create user & placeholder messages
 */

import { useCallback, useRef } from 'react'
import type { IvyMessage } from '@/types/chat'
import { IvySSEService } from '@/lib/sse-service'

interface UseMessageSenderOptions {
  onMessageSent?: (userMsg: IvyMessage, placeholderMsg: IvyMessage) => void
  onError?: (error: any, retryCount: number) => void
  onSuccess?: () => void
  getSessionData: () => { sessionId: string; memoryTraceId: string; userId: string }
}

export function useMessageSender(
  messages: IvyMessage[],
  sseService: IvySSEService,
  options: UseMessageSenderOptions
) {
  const { onMessageSent, onError, onSuccess, getSessionData } = options
  
  const lastMessageRef = useRef<string>("")
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const sendMessage = useCallback(
    async (text: string, messageId: string, isRetry: boolean = false, retryCount: number = 0) => {
      try {
        // Store for potential retry
        if (!isRetry) {
          lastMessageRef.current = text
        }

        // Create user message
        if (!isRetry) {
          const userMsg: IvyMessage = {
            id: crypto.randomUUID(),
            role: "user",
            kind: "text",
            ts: Date.now(),
            payload: { text },
            delivery: "instant",
          }

          // Create placeholder for IVY's response
          const placeholderMsg: IvyMessage = {
            id: messageId,
            role: "ivy",
            kind: "text",
            emotion: "reflection",
            ts: Date.now(),
            payload: {
              text: "Processing...",
              streaming: true,
              consciousnessStream: true,
            },
            delivery: "instant",
          }

          // Notify parent
          onMessageSent?.(userMsg, placeholderMsg)
        }

        // Get session data
        const { sessionId, memoryTraceId, userId } = getSessionData()

        // Validate config
        if (!userId) {
          throw new Error("Missing user ID configuration")
        }

        // Send via SSE
        await sseService.sendMessage(
          {
            text,
            isRetry,
            sessionId,
            memoryTraceId,
            userId,
            messageCount: messages.length,
            userMessageCount: messages.filter((m) => m.role === "user").length,
            firstMessageTimestamp: messages[0]?.ts,
            retryCount,
            conversationName: undefined,
            threadId: undefined,
          },
          messageId,
        )

        // Success!
        onSuccess?.()
        
      } catch (error: any) {
        console.error("Message send error:", error)
        
        // Notify parent with error details
        onError?.(error, retryCount)
        
        // Handle retry with exponential backoff
        if (retryCount <= 2) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000)
          retryTimeoutRef.current = setTimeout(() => {
            sendMessage(text, messageId, true, retryCount + 1)
          }, delay)
        }
        
        throw error
      }
    },
    [messages, sseService, onMessageSent, onError, onSuccess, getSessionData]
  )

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  return {
    sendMessage,
    clearRetryTimeout,
    lastMessage: lastMessageRef.current
  }
}
