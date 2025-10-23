"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import type { LSAgentMessage, AgentBehavior } from '@/types/longstrider'

// ============================
// LONGSTRIDER AGENT HOOK
// Manages agent behavior and interventions
// ============================

export function useLongStriderAgent(sseService: any) {
  const [agentMessages, setAgentMessages] = useState<LSAgentMessage[]>([])
  const [agentStatus, setAgentStatus] = useState<'idle' | 'observing' | 'analyzing' | 'intervening'>('observing')
  const [agentBehavior, setAgentBehavior] = useState<AgentBehavior>({
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
  })

  // Track cooldowns to prevent spam
  const cooldowns = useRef<Map<string, number>>(new Map())

  // Handle SSE events from backend
  useEffect(() => {
    if (!sseService) return

    const handleAgentEvent = (event: any) => {
      const { type, data } = event

      switch (type) {
        case 'agent_insight':
        case 'agent_intervention':
        case 'agent_warning':
        case 'agent_suggestion':
        case 'agent_discovery':
        case 'agent_question':
        case 'agent_reflection':
          // Check if we should show this based on behavior
          if (shouldShowMessage(data, agentBehavior)) {
            // Check cooldown
            const cooldownKey = `${data.type}-${data.trigger.type}`
            const lastShown = cooldowns.current.get(cooldownKey) || 0
            const cooldownPeriod = data.timing?.cooldown || 60000 // 1 minute default

            if (Date.now() - lastShown > cooldownPeriod) {
              setAgentMessages(prev => [...prev, data])
              cooldowns.current.set(cooldownKey, Date.now())

              // Update status
              if (data.priority === 'urgent' || data.priority === 'high') {
                setAgentStatus('intervening')
                setTimeout(() => setAgentStatus('observing'), 5000)
              } else {
                setAgentStatus('analyzing')
                setTimeout(() => setAgentStatus('observing'), 3000)
              }
            }
          }
          break

        case 'agent_status':
          setAgentStatus(data.status)
          break

        case 'agent_focus_change':
          setAgentBehavior(prev => ({
            ...prev,
            focus_areas: data.focus_areas
          }))
          break
      }
    }

    // Subscribe to agent events
    sseService.on('agent:*', handleAgentEvent)

    return () => {
      sseService.off('agent:*', handleAgentEvent)
    }
  }, [sseService, agentBehavior])

  // Determine if message should be shown based on behavior
  const shouldShowMessage = (message: LSAgentMessage, behavior: AgentBehavior): boolean => {
    // Silent mode - never show
    if (behavior.mode === 'silent') return false

    // Check priority threshold
    const priorityScore = {
      urgent: 1.0,
      high: 0.75,
      medium: 0.5,
      low: 0.25
    }[message.priority] || 0.5

    if (priorityScore < behavior.interruption_threshold) return false

    // Reactive mode - only show high priority
    if (behavior.mode === 'reactive' && priorityScore < 0.75) return false

    // Check personality alignment
    const personalityMatch = getPersonalityMatch(message, behavior.personality)
    if (personalityMatch < 0.3) return false

    return true
  }

  // Calculate personality match
  const getPersonalityMatch = (message: LSAgentMessage, personality: AgentBehavior['personality']): number => {
    let match = 0.5 // baseline

    switch (message.type) {
      case 'discovery':
      case 'question':
        match = personality.curiosity
        break
      case 'warning':
      case 'intervention':
        match = personality.caution
        break
      case 'suggestion':
        match = (personality.creativity + personality.efficiency) / 2
        break
    }

    return match
  }

  // Handle agent actions
  const handleAgentAction = useCallback((actionId: string, payload: any) => {
    // Send action to backend
    sseService?.send('agent:action', { actionId, payload })

    // Update local state
    setAgentMessages(prev =>
      prev.map(msg => {
        const actions = msg.content.actions?.map(a =>
          a.id === actionId ? { ...a, taken: true } as any : a
        )
        return { ...msg, content: { ...msg.content, actions } }
      })
    )
  }, [sseService])

  return {
    agentMessages,
    agentStatus,
    agentBehavior,
    setAgentBehavior,
    handleAgentAction
  }
}

export default useLongStriderAgent
