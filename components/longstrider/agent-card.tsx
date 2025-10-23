"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { 
  Brain,
  Sparkles,
  AlertCircle,
  Lightbulb,
  GitBranch,
  TrendingUp,
  Shield,
  Zap,
  Eye,
  MessageSquare,
  Bot,
  Cpu,
  Activity,
  Target,
  Compass,
  Navigation,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  ArrowRight,
  Layers,
  Network,
  Waves,
  Timer,
  Gauge,
  Infinity,
  X
} from 'lucide-react'

import type { LSAgentMessage, AgentBehavior } from '@/types/longstrider'

// ============================
// LONGSTRIDER AGENT INTEGRATION
// Proactive, Autonomous, Intelligent
// ============================

// Helper for class names
function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// ============================
// AGENT CARD COMPONENT
// Types imported from @/types/longstrider
// ============================

// ============================
// LONGSTRIDER AGENT CARD
// How the agent appears in chat
// ============================

function LongStriderAgentCard({ 
  message,
  onAction,
  isMinimized = false
}: { 
  message: LSAgentMessage
  onAction?: (actionId: string, payload: any) => void
  isMinimized?: boolean
}) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [actionTaken, setActionTaken] = useState<string | null>(null)
  
  if (isDismissed) return null
  
  const getIcon = () => {
    switch (message.type) {
      case 'intervention': return Shield
      case 'insight': return Eye
      case 'warning': return AlertTriangle
      case 'suggestion': return Lightbulb
      case 'discovery': return Sparkles
      case 'question': return HelpCircle
      case 'reflection': return Brain
      default: return Info
    }
  }
  
  const getColorScheme = () => {
    const schemes = {
      intervention: 'from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400',
      insight: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
      warning: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400',
      suggestion: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
      discovery: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
      question: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-400',
      reflection: 'from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400'
    }
    return schemes[message.type] || schemes.insight
  }
  
  const Icon = getIcon()
  const colorScheme = getColorScheme()
  
  const handleAction = (action: any) => {
    setActionTaken(action.id)
    onAction?.(action.id, action.payload)
  }
  
  // Minimized view for subtle insights
  if (isMinimized) {
    return (
      <div className={cx(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-gradient-to-r border backdrop-blur-sm",
        colorScheme,
        "animate-in slide-in-from-left duration-300"
      )}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">{message.content.title}</span>
        <button 
          onClick={() => setIsDismissed(true)}
          className="ml-1 hover:opacity-70"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    )
  }
  
  // Full agent intervention card
  return (
    <div className={cx(
      "relative group animate-in slide-in-from-left duration-500",
      message.priority === 'urgent' && "animate-pulse"
    )}>
      {/* Agent Avatar */}
      <div className="flex gap-4 px-4 py-6">
        <div className="flex-shrink-0">
          <div className={cx(
            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
            "from-violet-500 to-purple-600 shadow-lg",
            message.priority === 'urgent' && "ring-2 ring-red-500 ring-offset-2 ring-offset-black"
          )}>
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
        
        {/* Agent Message */}
        <div className="flex-1 max-w-3xl">
          <div className={cx(
            "rounded-2xl p-4 bg-gradient-to-br border backdrop-blur-sm",
            colorScheme,
            "shadow-lg"
          )}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-100">
                    {message.content.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs opacity-60">LongStrider Agent</span>
                    <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded">
                      {message.type}
                    </span>
                    {message.trigger.confidence && (
                      <span className="text-xs opacity-60">
                        {(message.trigger.confidence * 100).toFixed(0)}% confident
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Priority indicator */}
              {message.priority === 'urgent' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-full">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-400 font-medium">Urgent</span>
                </div>
              )}
            </div>
            
            {/* Message Content */}
            <div className="text-sm text-gray-200 leading-relaxed mb-3">
              {message.content.message}
            </div>
            
            {/* Reasoning (expandable) */}
            {message.content.reasoning && (
              <details className="mb-3">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                  Why am I suggesting this?
                </summary>
                <p className="mt-2 text-xs text-gray-400 pl-4 border-l-2 border-gray-700">
                  {message.content.reasoning}
                </p>
              </details>
            )}
            
            {/* Evidence */}
            {message.content.evidence && message.content.evidence.length > 0 && (
              <div className="mb-3 p-2 bg-black/20 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Based on:</div>
                <div className="space-y-1">
                  {message.content.evidence.map((ev, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className={cx(
                        "w-1.5 h-1.5 rounded-full",
                        ev.weight > 0.7 ? "bg-green-400" : 
                        ev.weight > 0.4 ? "bg-yellow-400" : "bg-gray-400"
                      )} />
                      <span className="text-gray-300">{ev.type}</span>
                      <span className="text-gray-500">weight: {(ev.weight * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Actions */}
            {message.content.actions && message.content.actions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {message.content.actions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action)}
                    disabled={actionTaken !== null}
                    className={cx(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      actionTaken === action.id && "ring-2 ring-green-500",
                      action.type === 'primary' && "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300",
                      action.type === 'secondary' && "bg-white/10 hover:bg-white/20 text-gray-300",
                      action.type === 'destructive' && "bg-red-500/20 hover:bg-red-500/30 text-red-300",
                      actionTaken && actionTaken !== action.id && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {action.label}
                    {actionTaken === action.id && " ✓"}
                  </button>
                ))}
                
                <button
                  onClick={() => setIsDismissed(true)}
                  className="ml-auto p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
            
            {/* Trigger info */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3 text-xs text-gray-500">
              <span>Triggered by: {message.trigger.type}</span>
              {message.timing.expires && (
                <span>Expires in {Math.floor((message.timing.expires - Date.now()) / 60000)}m</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================
// AGENT STATUS INDICATOR
// Shows agent activity/thinking
// ============================

function AgentStatusIndicator({ 
  status,
  behavior 
}: { 
  status: 'idle' | 'observing' | 'analyzing' | 'intervening'
  behavior: AgentBehavior
}) {
  const getStatusConfig = () => {
    const configs = {
      idle: { icon: Timer, color: 'text-gray-400', pulse: false, label: 'Idle' },
      observing: { icon: Eye, color: 'text-blue-400', pulse: false, label: 'Observing' },
      analyzing: { icon: Activity, color: 'text-yellow-400', pulse: true, label: 'Analyzing' },
      intervening: { icon: Zap, color: 'text-red-400', pulse: true, label: 'Intervening' }
    }
    return configs[status] || configs.idle
  }
  
  const config = getStatusConfig()
  const Icon = config.icon
  
  return (
    <div className="fixed bottom-24 right-4 z-30">
      <div className={cx(
        "flex items-center gap-2 px-3 py-2 rounded-full",
        "bg-black/80 backdrop-blur-sm border border-white/10",
        "shadow-lg"
      )}>
        <div className={cx(
          "flex items-center gap-2",
          config.pulse && "animate-pulse"
        )}>
          <Icon className={cx("w-4 h-4", config.color)} />
          <span className={cx("text-xs font-medium", config.color)}>
            LongStrider: {config.label}
          </span>
        </div>
        
        {/* Behavior mode indicator */}
        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
          <Gauge className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400">{behavior.mode}</span>
        </div>
        
        {/* Focus areas */}
        {behavior.focus_areas.length > 0 && (
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
            <Compass className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-purple-400">
              {behavior.focus_areas.length} focus
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================
// AGENT CONTROL PANEL
// User can adjust agent behavior
// ============================

function AgentControlPanel({ 
  behavior,
  onBehaviorChange
}: {
  behavior: AgentBehavior
  onBehaviorChange: (behavior: AgentBehavior) => void
}) {
  const modes = ['silent', 'reactive', 'proactive', 'autonomous'] as const
  
  return (
    <div className="fixed top-20 right-4 z-30">
      <details className="group">
        <summary className="cursor-pointer list-none">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-300">Agent Control</span>
          </div>
        </summary>
        
        <div className="absolute right-0 mt-2 w-64 p-4 rounded-lg bg-gray-900/95 backdrop-blur-sm border border-white/10 shadow-xl">
          {/* Mode Selection */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">Agent Mode</label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-lg">
              {modes.map(mode => (
                <button
                  key={mode}
                  onClick={() => onBehaviorChange({ ...behavior, mode })}
                  className={cx(
                    "px-2 py-1 rounded text-xs font-medium transition-colors",
                    behavior.mode === mode
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
          {/* Interruption Threshold */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block">
              Interruption Threshold: {(behavior.interruption_threshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={behavior.interruption_threshold * 100}
              onChange={(e) => onBehaviorChange({
                ...behavior,
                interruption_threshold: parseInt(e.target.value) / 100
              })}
              className="w-full"
            />
          </div>
          
          {/* Personality Sliders */}
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-1">Personality</div>
            {Object.entries(behavior.personality).map(([trait, value]) => (
              <div key={trait}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 capitalize">{trait}</span>
                  <span className="text-gray-400">{(value * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value * 100}
                  onChange={(e) => onBehaviorChange({
                    ...behavior,
                    personality: {
                      ...behavior.personality,
                      [trait]: parseInt(e.target.value) / 100
                    }
                  })}
                  className="w-full h-1"
                />
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  )
}

// ============================
// MAIN INTEGRATION HOOK
// Connects agent to chat via SSE
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
          a.id === actionId ? { ...a, taken: true } : a
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
    handleAgentAction,
    AgentCard: LongStriderAgentCard,
    AgentStatus: AgentStatusIndicator,
    AgentControl: AgentControlPanel
  }
}

// ============================
// EXAMPLE INTEGRATION
// How to use in your chat component
// ============================

export function ExampleChatWithAgent() {
  // Your existing SSE service
  const sseService = null // Replace with actual SSE service
  
  // Initialize LongStrider Agent
  const {
    agentMessages,
    agentStatus,
    agentBehavior,
    setAgentBehavior,
    handleAgentAction,
    AgentCard,
    AgentStatus,
    AgentControl
  } = useLongStriderAgent(sseService)
  
  // Filter agent messages to show in chat
  const visibleAgentMessages = agentMessages.filter(msg => 
    !msg.timing?.delay || Date.now() > msg.timestamp + msg.timing.delay
  )
  
  return (
    <div className="relative h-screen">
      {/* Agent Control Panel */}
      <AgentControl 
        behavior={agentBehavior} 
        onBehaviorChange={setAgentBehavior} 
      />
      
      {/* Agent Status Indicator */}
      <AgentStatus 
        status={agentStatus} 
        behavior={agentBehavior} 
      />
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        {/* Mix agent messages with regular chat messages */}
        {visibleAgentMessages.map(agentMsg => (
          <AgentCard
            key={agentMsg.id}
            message={agentMsg}
            onAction={handleAgentAction}
            isMinimized={agentMsg.priority === 'low'}
          />
        ))}
      </div>
    </div>
  )
}

export default useLongStriderAgent