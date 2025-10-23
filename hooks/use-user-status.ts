"use client"

import { useState, useEffect } from "react"

export type UserStatus = 'checking' | 'new' | 'returning'

export interface UserStatusData {
  status: UserStatus
  lastEmotion: string
  isLoading: boolean
}

/**
 * Hook to detect user status and retrieve last session data
 * Follows same pattern as use-database-settings.ts
 */
export function useUserStatus(): UserStatusData {
  const [status, setStatus] = useState<UserStatus>('checking')
  const [lastEmotion, setLastEmotion] = useState('neutral')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const detectUserStatus = () => {
      try {
        const preflightOk = localStorage.getItem('ivy_preflight_ok')
        const userId = localStorage.getItem('ivy_user_id')
        const emotion = localStorage.getItem('ivy_last_emotion')

        if (!preflightOk || !userId) {
          setStatus('new')
        } else {
          setStatus('returning')
          setLastEmotion(emotion || 'neutral')
        }
      } catch (error) {
        console.error('Error detecting user status:', error)
        setStatus('new')
      } finally {
        setIsLoading(false)
      }
    }

    detectUserStatus()
  }, [])

  return {
    status,
    lastEmotion,
    isLoading
  }
}
