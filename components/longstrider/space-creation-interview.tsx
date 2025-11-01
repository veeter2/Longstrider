"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Brain,
  Search,
  Loader2,
  Sparkles,
  Check,
  ChevronRight,
  Users,
  Lightbulb,
  BookOpen,
  Clock,
  Target,
  Heart,
  Zap,
  Database,
  Star,
  Plus
} from 'lucide-react'
import { useConsciousnessStore } from '@/stores/consciousness-store'
import { useLongStriderStore } from '@/stores/longstrider-store'
import { getCognitiveProfile } from '@/lib/cognitive-profile'
import { getIvyConfig } from '@/lib/supabase'
import {
  spaceCreationQuestions,
  generateSpaceConfiguration,
  createHierarchySpaces,
  type SpaceCreationResponse
} from '@/lib/space-creation-interview'
import type { LSMessage } from '@/types/longstrider'

// ============================================================================
// CONVERSATIONAL SPACE CREATION INTERVIEW
// LongStrider guides user through project setup via natural conversation
// ============================================================================

// Mock Data
const MOCK_TEAM_MEMBERS = [
  { id: 'sarah', name: 'Sarah Chen', role: 'Engineer', avatar: '👩‍💻', projectCount: 12 },
  { id: 'mike', name: 'Mike Torres', role: 'Engineer', avatar: '👨‍💻', projectCount: 8 },
  { id: 'hailey', name: 'Hailey Kim', role: 'Designer', avatar: '👩‍🎨', projectCount: 15 },
  { id: 'marc', name: 'Marc Johnson', role: 'Product', avatar: '👨‍💼', projectCount: 10 },
  { id: 'brian', name: 'Brian Foster', role: 'Data Scientist', avatar: '👨‍🔬', projectCount: 6 },
  { id: 'stacy', name: 'Stacy Liu', role: 'Research', avatar: '👩‍🔬', projectCount: 9 }
]

const MOCK_AI_EXPERTS = [
  {
    id: 'phd-ee',
    name: 'PhD Electrical Engineer',
    description: 'Deep technical expertise in power systems, circuit design, and signal processing',
    icon: '⚡',
    personaWeights: { phd: 0.7, strategist: 0.1, architect: 0.1, companion: 0.05, lover: 0.05 }
  },
  {
    id: 'systems-architect',
    name: 'Systems Architect',
    description: 'Holistic thinking for complex integrations and infrastructure design',
    icon: '🏗️',
    personaWeights: { phd: 0.2, strategist: 0.3, architect: 0.4, companion: 0.05, lover: 0.05 }
  },
  {
    id: 'creative-strategist',
    name: 'Creative Strategist',
    description: 'Innovation-focused with strategic vision and novel approaches',
    icon: '💡',
    personaWeights: { phd: 0.1, strategist: 0.4, architect: 0.2, companion: 0.1, lover: 0.2 }
  },
  {
    id: 'research-analyst',
    name: 'Research Analyst',
    description: 'Deep dives into literature, patterns, and evidence-based insights',
    icon: '🔬',
    personaWeights: { phd: 0.5, strategist: 0.2, architect: 0.2, companion: 0.05, lover: 0.05 }
  },
  {
    id: 'tactical-executor',
    name: 'Tactical Executor',
    description: 'Get things done with practical focus and clear action plans',
    icon: '🎯',
    personaWeights: { phd: 0.1, strategist: 0.5, architect: 0.2, companion: 0.1, lover: 0.1 }
  }
]

const MOCK_KNOWLEDGE_ITEMS = [
  {
    id: 'kb-1',
    title: 'Voltage Regulation Best Practices',
    author: 'Mike Torres',
    date: '2 months ago',
    type: 'guide',
    icon: '📘',
    excerpt: 'Comprehensive guide to voltage regulation in power converters...'
  },
  {
    id: 'kb-2',
    title: 'Power Systems Foundation',
    author: 'Team Library',
    date: '6 months ago',
    type: 'foundation',
    icon: '📚',
    excerpt: 'Core principles of power system design and analysis...'
  },
  {
    id: 'kb-3',
    title: 'Converter Design Patterns',
    author: 'Sarah Chen',
    date: '4 months ago',
    type: 'patterns',
    icon: '🎨',
    excerpt: 'Common design patterns for DC-DC and AC-DC converters...'
  }
]

const MOCK_MEMORIES = [
  {
    id: 'mem-1',
    content: 'Power converter prototype discussion - explored buck/boost topology',
    date: 'Sept 15, 2024',
    gravity: 0.82,
    icon: '🧠'
  },
  {
    id: 'mem-2',
    content: 'Voltage spike issues resolved with improved filtering',
    date: 'Aug 3, 2024',
    gravity: 0.76,
    icon: '⚡'
  }
]

// Interview Step Type
type InterviewStep =
  | 'greeting'
  | 'goal'
  | 'team'
  | 'ai-expert'
  | 'searching'
  | 'knowledge-preview'
  | 'confirm'
  | 'creating'
  | 'complete'

interface InterviewMessage {
  id: string
  type: 'longstrider' | 'user'
  content: string
  timestamp: number
  metadata?: {
    step?: InterviewStep
    interactive?: boolean
    selectedTeam?: string[]
    selectedExpert?: string
    selectedKnowledge?: string[]
    selectedMemories?: string[]
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface SpaceCreationInterviewProps {
  onComplete: (spaceId: string) => void
  onCancel: () => void
}

export function SpaceCreationInterview({ onComplete, onCancel }: SpaceCreationInterviewProps) {
  const { createSpace, updateSpace } = useConsciousnessStore()
  const { setCurrentThread, addMessage } = useLongStriderStore()

  const [step, setStep] = useState<InterviewStep>('greeting')
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [responses, setResponses] = useState<SpaceCreationResponse[]>([])

  // Selections
  const [selectedTeam, setSelectedTeam] = useState<string[]>([])
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null)
  const [selectedKnowledge, setSelectedKnowledge] = useState<string[]>([])
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])

  const [isWaitingForUser, setIsWaitingForUser] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const hasShownGreeting = useRef(false)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when waiting for user
  useEffect(() => {
    if (isWaitingForUser) {
      inputRef.current?.focus()
    }
  }, [isWaitingForUser])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  // Add LongStrider message
  const addLongStriderMessage = (content: string, step: InterviewStep, metadata?: any) => {
    const message: InterviewMessage = {
      id: `ls-${Date.now()}`,
      type: 'longstrider',
      content,
      timestamp: Date.now(),
      metadata: { step, ...metadata }
    }
    setMessages(prev => [...prev, message])
  }

  // Add user message
  const addUserMessage = (content: string) => {
    const message: InterviewMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, message])
  }

  // Show greeting on mount (once)
  useEffect(() => {
    if (!hasShownGreeting.current) {
      hasShownGreeting.current = true
      const message: InterviewMessage = {
        id: `ls-${Date.now()}`,
        type: 'longstrider',
        content: "Hey! I'm ready to help. Do you want to jump into a quick chat, or should we set up a new project together?",
        timestamp: Date.now(),
        metadata: { step: 'greeting' }
      }
      setMessages([message])
    }
  }, [])

  // Handle greeting choice
  const handleGreetingChoice = (choice: 'quick' | 'guided') => {
    if (choice === 'quick') {
      addUserMessage("Let's do a quick chat")
      const timeout = setTimeout(() => handleQuickChat(), 500)
      timeoutsRef.current.push(timeout)
    } else {
      addUserMessage("I want to set up a new project")
      const timeout = setTimeout(() => startGuidedInterview(), 500)
      timeoutsRef.current.push(timeout)
    }
  }

  // Quick chat - just ask for name
  const handleQuickChat = () => {
    addLongStriderMessage("Perfect! What would you like to name this space?", 'goal')
    setStep('goal')
    setIsWaitingForUser(true)
  }

  // Start guided interview
  const startGuidedInterview = () => {
    const cognitiveProfile = getCognitiveProfile()
    const firstQuestion = spaceCreationQuestions[0]
    const adaptedQuestion = cognitiveProfile && firstQuestion.adaptToProfile
      ? firstQuestion.adaptToProfile(cognitiveProfile)
      : firstQuestion.question

    addLongStriderMessage(adaptedQuestion, 'goal')
    setStep('goal')
    setIsWaitingForUser(true)
  }

  // Handle user text input submission
  const handleSubmitInput = () => {
    if (!userInput.trim()) return

    const trimmed = userInput.trim()
    addUserMessage(trimmed)
    setUserInput('')
    setIsWaitingForUser(false)

    // Save response
    const response: SpaceCreationResponse = {
      questionId: step,
      answer: trimmed,
      timestamp: Date.now()
    }
    setResponses(prev => [...prev, response])

    // Progress to next step
    const timeout = setTimeout(() => progressInterview(trimmed), 600)
    timeoutsRef.current.push(timeout)
  }

  // Progress through interview
  const progressInterview = (lastAnswer: string) => {
    switch (step) {
      case 'goal':
        // Ask about team
        addLongStriderMessage(
          "Great! Who would you like to work with on this?",
          'team',
          { interactive: true }
        )
        setStep('team')
        break

      case 'team':
        // Move to AI expert selection (handled by interactive component)
        break

      case 'ai-expert':
        // Start searching
        addLongStriderMessage(
          "Let me search through your memories and knowledge library...",
          'searching'
        )
        setStep('searching')
        const searchTimeout = setTimeout(() => showKnowledgePreview(), 2000)
        timeoutsRef.current.push(searchTimeout)
        break

      default:
        break
    }
  }

  // Show knowledge preview
  const showKnowledgePreview = () => {
    const goalResponse = responses.find(r => r.questionId === 'goal')?.answer || ''

    addLongStriderMessage(
      `Hey! I found some relevant context:\n\n**Past Work:** You worked on a similar converter design 3 months ago\n\n**Team Knowledge:** Mike has notes on voltage regulation\n\n**Foundation Docs:** Power systems guide available\n\nWant me to pull all this together and set up your project?`,
      'knowledge-preview',
      { interactive: true }
    )
    setStep('knowledge-preview')
  }

  // Confirm and create space
  const handleConfirmCreation = () => {
    addUserMessage("Yes, let's do it!")
    addLongStriderMessage("Creating your space...", 'creating')
    setStep('creating')

    const createTimeout = setTimeout(() => createSpaceFromInterview(), 1500)
    timeoutsRef.current.push(createTimeout)
  }

  // Create space with full configuration
  const createSpaceFromInterview = async () => {
    const cognitiveProfile = getCognitiveProfile() || {
      userId: 'default',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    // Get actual user goal
    const goalAnswer = responses.find(r => r.questionId === 'goal')?.answer || 'Untitled Project'

    // Build responses for configuration generator (with smart defaults for quick chat)
    const fullResponses: SpaceCreationResponse[] = [
      { questionId: 'goal', answer: goalAnswer, timestamp: Date.now() },
      { questionId: 'motivation', answer: 'To advance my capabilities and achieve meaningful results', timestamp: Date.now() },
      { questionId: 'breakdown', answer: 'Research and exploration\nPlanning and design\nExecution and implementation\nReview and refinement', timestamp: Date.now() },
      { questionId: 'success_metrics', answer: 'Clear progress toward goal\nKey milestones achieved\nMeaningful insights gained', timestamp: Date.now() },
      { questionId: 'mode', answer: selectedExpert ? MOCK_AI_EXPERTS.find(e => e.id === selectedExpert)?.name || 'analytical' : 'analytical', timestamp: Date.now() },
      { questionId: 'timeline', answer: 'ongoing', timestamp: Date.now() }
    ]

    const config = generateSpaceConfiguration(fullResponses, cognitiveProfile)

    // Get user ID from config
    const userId = getIvyConfig().userId || undefined // Pass undefined if not available

    // Create hierarchy of spaces (parent → children → grandchildren)
    const { parent, children, grandchildren } = await createHierarchySpaces(
      config,
      createSpace,
      updateSpace,
      userId || undefined
    )

    // Use parent space as the main space
    const newSpace = parent

    // Create space (keeping old single-space logic as fallback if no hierarchy)
    /*
    const newSpace = createSpace({
      name: config.name,
      type: 'personal',
      status: 'active',
      is_anchored: false,
      is_favorite: false,
      signals: [],
      space_path: [],
      child_spaces: [],
      links: [],
      goals: config.successCriteria.map((criterion, i) => ({
        id: `goal-${i}`,
        title: criterion,
        status: 'active' as const,
        created_at: Date.now()
      })),
      recent_activity: [
        {
          id: 'activity-init',
          type: 'insight',
          content: 'Space created with guided interview',
          timestamp: Date.now()
        }
      ],
      active_rail_ids: [],
      analytics: {
        message_count: 0,
        word_count: 0,
        pattern_count: 0,
        complexity_score: 0,
        gravity_score: 0,
        tokens_used: 0,
        tokens_saved: 0,
        estimated_cost: 0,
        emotional_signature: {
          average_gravity: 0,
          dominant_emotion: 'neutral',
          emotional_arc: []
        }
      }
    })
    */

    // Build final summary
    const teamMembers = selectedTeam.map(id => MOCK_TEAM_MEMBERS.find(m => m.id === id)?.name).filter(Boolean)
    const expertName = selectedExpert ? MOCK_AI_EXPERTS.find(e => e.id === selectedExpert)?.name : null
    const knowledgeItems = selectedKnowledge.map(id => MOCK_KNOWLEDGE_ITEMS.find(k => k.id === id)?.title).filter(Boolean)
    const memories = selectedMemories.map(id => MOCK_MEMORIES.find(m => m.id === id)?.content).filter(Boolean)

    const goalSummary = config.successCriteria.length > 0
      ? config.successCriteria.map(c => `• ${c}`).join('\n')
      : 'Working toward meaningful progress'

    // Build hierarchy summary
    const hierarchySummary = children.length > 0 
      ? `\n\n**Structure Created:**
• ${newSpace.name}${children.length > 0 ? `\n${children.map((c: any) => `  • ${c.name}${grandchildren.filter((gc: any) => gc.parent_space_id === c.id).length > 0 ? `\n${grandchildren.filter((gc: any) => gc.parent_space_id === c.id).map((gc: any) => `    • ${gc.name}`).join('\n')}` : ''}`).join('\n')}` : ''}`
      : ''

    const kickoffMessage = `I've set up your **${config.name}** project! Here's what I pulled together:

🎯 **Your Goal:** ${config.goal}
${teamMembers.length > 0 ? `\n👥 **Team:** ${teamMembers.join(', ')}` : ''}${expertName ? `\n\n🤖 **AI Thought Partner:** ${expertName}` : ''}${knowledgeItems.length > 0 ? `\n\n📚 **Knowledge Docs Loaded:**\n${knowledgeItems.map(k => `• ${k}`).join('\n')}` : ''}${memories.length > 0 ? `\n\n🧠 **Related Past Work:**\n${memories.map(m => m ? `• ${m.substring(0, 80)}${m.length > 80 ? '...' : ''}` : '').filter(Boolean).join('\n')}` : ''}${hierarchySummary}

**Success Milestones:**
${goalSummary}

I'm here to help you make progress. What would you like to tackle first?`

    // Add kickoff messages to the thread so they persist
    const now = new Date().toISOString()

    // User's original goal as first message
    const nowTs = Date.now()
    const userGoalMessage: LSMessage = {
      id: `msg-user-${nowTs}`,
      user_id: 'current-user', // Will be replaced by actual user ID in production
      content: goalAnswer,
      session_id: newSpace.id,
      thread_id: newSpace.id,
      memory_trace_id: newSpace.id,
      conversation_name: config.name,
      type: 'user',
      gravity_score: 0.8, // Important message
      created_at: now,
      t_ingested: now,
      ts: nowTs
    }

    // LongStrider's kickoff summary as second message
    const kickoffSummaryMessage: LSMessage = {
      id: `msg-ls-${nowTs + 1}`,
      user_id: 'longstrider-system',
      content: kickoffMessage,
      session_id: newSpace.id,
      thread_id: newSpace.id,
      memory_trace_id: newSpace.id,
      conversation_name: config.name,
      type: 'assistant',
      gravity_score: 0.9, // Very important setup message
      created_at: now,
      t_ingested: now,
      ts: nowTs + 1,
      metadata: {
        setup_message: true,
        team_members: teamMembers,
        ai_expert: expertName,
        knowledge_items: knowledgeItems,
        related_memories: memories.length
      }
    }

    // Add both messages to the thread
    addMessage(newSpace.id, userGoalMessage)
    addMessage(newSpace.id, kickoffSummaryMessage)

    // Show completion in interview
    addLongStriderMessage('Perfect! Your space is ready. Switching over now...', 'complete')
    setStep('complete')

    // Switch to new space after brief delay
    const switchTimeout = setTimeout(() => {
      setCurrentThread(newSpace.id)
      onComplete(newSpace.id)
    }, 1500)
    timeoutsRef.current.push(switchTimeout)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-[rgb(var(--band-infra))]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {msg.type === 'longstrider' ? (
                <LongStriderBubble message={msg} />
              ) : (
                <UserBubble message={msg} />
              )}

              {/* Interactive Components */}
              {msg.metadata?.interactive && msg.metadata.step === 'team' && (
                <TeamSelector
                  selected={selectedTeam}
                  onSelect={(team) => {
                    setSelectedTeam(team)
                  }}
                  onContinue={() => {
                    addUserMessage(
                      selectedTeam.length > 0
                        ? `I'd like to work with ${selectedTeam.map(id => MOCK_TEAM_MEMBERS.find(m => m.id === id)?.name).join(', ')}`
                        : "I'll work on this solo for now"
                    )
                    setTimeout(() => {
                      addLongStriderMessage(
                        "Based on your goal, I recommend a **PhD Electrical Engineer** to help. You can also include other experts like Systems Architect or Creative Strategist.",
                        'ai-expert',
                        { interactive: true }
                      )
                      setStep('ai-expert')
                    }, 600)
                  }}
                />
              )}

              {msg.metadata?.interactive && msg.metadata.step === 'ai-expert' && (
                <AIExpertSelector
                  selected={selectedExpert}
                  onSelect={setSelectedExpert}
                  onContinue={() => {
                    const expertName = selectedExpert
                      ? MOCK_AI_EXPERTS.find(e => e.id === selectedExpert)?.name
                      : 'Balanced AI'
                    addUserMessage(`Let's work with ${expertName}`)
                    setTimeout(() => progressInterview(''), 600)
                  }}
                />
              )}

              {msg.metadata?.interactive && msg.metadata.step === 'knowledge-preview' && (
                <KnowledgePreview
                  knowledge={MOCK_KNOWLEDGE_ITEMS}
                  memories={MOCK_MEMORIES}
                  selectedKnowledge={selectedKnowledge}
                  selectedMemories={selectedMemories}
                  onSelectKnowledge={setSelectedKnowledge}
                  onSelectMemories={setSelectedMemories}
                  onConfirm={handleConfirmCreation}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Greeting Buttons */}
        {step === 'greeting' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 ml-16"
          >
            <button
              onClick={() => handleGreetingChoice('quick')}
              className="px-6 py-3 rounded-lg
                bg-[rgba(var(--band-chi-cyan),0.1)]
                border border-[rgba(var(--band-chi-cyan),0.3)]
                hover:bg-[rgba(var(--band-chi-cyan),0.15)]
                hover:border-[rgba(var(--band-chi-cyan),0.5)]
                text-sm font-medium
                text-[rgb(var(--band-chi-cyan))]
                transition-all duration-200"
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Quick Chat
            </button>
            <button
              onClick={() => handleGreetingChoice('guided')}
              className="px-6 py-3 rounded-lg
                bg-[rgba(var(--band-theta-high),0.1)]
                border border-[rgba(var(--band-theta-high),0.3)]
                hover:bg-[rgba(var(--band-theta-high),0.15)]
                hover:border-[rgba(var(--band-theta-high),0.5)]
                text-sm font-medium
                text-[rgb(var(--band-theta-high))]
                transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              New Project
            </button>
          </motion.div>
        )}

        {/* Loading indicator for creating step */}
        {step === 'creating' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center py-8"
          >
            <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--band-theta-high))]" />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {isWaitingForUser && step !== 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 border-t border-slate-800 bg-slate-900 p-6"
        >
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleSubmitInput()
                  } else if (e.key === 'Escape') {
                    onCancel()
                  }
                }}
                placeholder="Type your response..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-sm resize-none 
                  focus:outline-none 
                  focus:ring-2 focus:ring-[rgba(var(--band-theta-high),0.3)]
                  focus:border-[rgb(var(--band-theta-high))]
                  text-slate-100 placeholder:text-slate-500
                  transition-all duration-200"
                rows={2}
              />
              <button
                onClick={handleSubmitInput}
                disabled={!userInput.trim()}
                className="absolute right-3 bottom-3 p-2 rounded-lg 
                  bg-[rgba(var(--band-theta-high),0.2)]
                  hover:bg-[rgba(var(--band-theta-high),0.3)]
                  border border-[rgba(var(--band-theta-high),0.3)]
                  hover:border-[rgba(var(--band-theta-high),0.5)]
                  disabled:opacity-30 disabled:cursor-not-allowed
                  text-[rgb(var(--band-theta-high))]
                  transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              <kbd className="px-2 py-1 bg-slate-800 rounded">⌘</kbd> + <kbd className="px-2 py-1 bg-slate-800 rounded">Enter</kbd> to send • <kbd className="px-2 py-1 bg-slate-800 rounded">Esc</kbd> to cancel
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ============================================================================
// MESSAGE BUBBLES
// ============================================================================

function LongStriderBubble({ message }: { message: InterviewMessage }) {
  return (
    <div className="flex items-start gap-3">
      {/* Avatar - Using γ₁ (Gamma-Low) for chat/synthesis per Living Laws */}
      <div className="w-10 h-10 rounded-full 
        bg-[rgba(var(--band-gamma-low),0.15)]
        border border-[rgba(var(--band-gamma-low),0.3)]
        flex items-center justify-center flex-shrink-0">
        <Brain className="w-5 h-5 text-[rgb(var(--band-gamma-low))]" />
      </div>
      <div className="flex-1 max-w-2xl">
        <div className="text-xs text-slate-400 mb-1">LongStrider</div>
        {/* Message bubble - OPAQUE for readability (Living Laws 2.2) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  )
}

function UserBubble({ message }: { message: InterviewMessage }) {
  return (
    <div className="flex items-start gap-3 flex-row-reverse">
      {/* Avatar - Using β₁ (Beta-Low) for active thinking per Living Laws */}
      <div className="w-10 h-10 rounded-full 
        bg-[rgba(var(--band-beta-low),0.15)]
        border border-[rgba(var(--band-beta-low),0.3)]
        flex items-center justify-center flex-shrink-0">
        <User className="w-5 h-5 text-[rgb(var(--band-beta-low))]" />
      </div>
      <div className="flex-1 max-w-2xl flex flex-col items-end">
        <div className="text-xs text-slate-400 mb-1">You</div>
        {/* Message bubble - OPAQUE for readability (Living Laws 2.2) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// INTERACTIVE SELECTORS
// ============================================================================

function TeamSelector({
  selected,
  onSelect,
  onContinue
}: {
  selected: string[]
  onSelect: (team: string[]) => void
  onContinue: () => void
}) {
  const toggleMember = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter(m => m !== id))
    } else {
      onSelect([...selected, id])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-16 mt-4 p-4 rounded-lg bg-slate-900 border border-slate-800 max-w-xl"
    >
      <div className="text-xs text-slate-400 mb-3 flex items-center gap-2">
        <Users className="w-3 h-3" />
        Select team members (based on past collaborations)
      </div>
      <div className="space-y-2 mb-4">
        {MOCK_TEAM_MEMBERS.map(member => (
          <button
            key={member.id}
            onClick={() => toggleMember(member.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
              selected.includes(member.id)
                ? 'bg-[rgba(var(--band-theta-high),0.15)] border-[rgba(var(--band-theta-high),0.4)]'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="text-2xl">{member.avatar}</div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-slate-100">{member.name}</div>
              <div className="text-xs text-slate-400">{member.role} • {member.projectCount} projects</div>
            </div>
            {selected.includes(member.id) && (
              <Check className="w-4 h-4 text-[rgb(var(--band-theta-high))]" />
            )}
          </button>
        ))}
      </div>
      <button
        onClick={onContinue}
        className="w-full py-2 px-4 rounded-lg 
          bg-[rgba(var(--band-theta-high),0.2)]
          hover:bg-[rgba(var(--band-theta-high),0.3)]
          border border-[rgba(var(--band-theta-high),0.3)]
          hover:border-[rgba(var(--band-theta-high),0.5)]
          text-[rgb(var(--band-theta-high))]
          transition-all duration-200 text-sm font-medium"
      >
        Continue
      </button>
    </motion.div>
  )
}

function AIExpertSelector({
  selected,
  onSelect,
  onContinue
}: {
  selected: string | null
  onSelect: (id: string) => void
  onContinue: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-16 mt-4 p-4 rounded-lg bg-slate-900 border border-slate-800 max-w-xl"
    >
      <div className="text-xs text-slate-400 mb-3 flex items-center gap-2">
        <Brain className="w-3 h-3" />
        Choose your AI thought partner
      </div>
      <div className="space-y-2 mb-4">
        {MOCK_AI_EXPERTS.map(expert => (
          <button
            key={expert.id}
            onClick={() => onSelect(expert.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
              selected === expert.id
                ? 'bg-[rgba(var(--band-theta-high),0.15)] border-[rgba(var(--band-theta-high),0.4)]'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="text-2xl">{expert.icon}</div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium flex items-center gap-2 text-slate-100">
                {expert.name}
                {expert.id === 'phd-ee' && (
                  <span className="text-xs px-2 py-0.5 rounded 
                    bg-[rgba(var(--band-xi),0.2)]
                    text-[rgb(var(--band-xi))]
                    border border-[rgba(var(--band-xi),0.3)]">
                    Recommended
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">{expert.description}</div>
            </div>
            {selected === expert.id && (
              <Check className="w-4 h-4 text-[rgb(var(--band-theta-high))]" />
            )}
          </button>
        ))}
      </div>
      <button
        onClick={onContinue}
        disabled={!selected}
        className="w-full py-2 px-4 rounded-lg 
          bg-[rgba(var(--band-theta-high),0.2)]
          hover:bg-[rgba(var(--band-theta-high),0.3)]
          border border-[rgba(var(--band-theta-high),0.3)]
          hover:border-[rgba(var(--band-theta-high),0.5)]
          disabled:opacity-30 disabled:cursor-not-allowed
          text-[rgb(var(--band-theta-high))]
          transition-all duration-200 text-sm font-medium"
      >
        Continue
      </button>
    </motion.div>
  )
}

function KnowledgePreview({
  knowledge,
  memories,
  selectedKnowledge,
  selectedMemories,
  onSelectKnowledge,
  onSelectMemories,
  onConfirm
}: {
  knowledge: typeof MOCK_KNOWLEDGE_ITEMS
  memories: typeof MOCK_MEMORIES
  selectedKnowledge: string[]
  selectedMemories: string[]
  onSelectKnowledge: (ids: string[]) => void
  onSelectMemories: (ids: string[]) => void
  onConfirm: () => void
}) {
  const toggleKnowledge = (id: string) => {
    if (selectedKnowledge.includes(id)) {
      onSelectKnowledge(selectedKnowledge.filter(k => k !== id))
    } else {
      onSelectKnowledge([...selectedKnowledge, id])
    }
  }

  const toggleMemory = (id: string) => {
    if (selectedMemories.includes(id)) {
      onSelectMemories(selectedMemories.filter(m => m !== id))
    } else {
      onSelectMemories([...selectedMemories, id])
    }
  }

  // Auto-select all by default
  useEffect(() => {
    if (selectedKnowledge.length === 0) {
      onSelectKnowledge(knowledge.map(k => k.id))
    }
    if (selectedMemories.length === 0) {
      onSelectMemories(memories.map(m => m.id))
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-16 mt-4 p-4 rounded-lg bg-slate-900 border border-slate-800 max-w-2xl"
    >
      {/* Knowledge Items */}
      <div className="mb-4">
        <div className="text-xs text-slate-400 mb-3 flex items-center gap-2">
          <BookOpen className="w-3 h-3" />
          Knowledge Library
        </div>
        <div className="space-y-2">
          {knowledge.map(item => (
            <button
              key={item.id}
              onClick={() => toggleKnowledge(item.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
                selectedKnowledge.includes(item.id)
                  ? 'bg-[rgba(var(--band-theta-high),0.15)] border-[rgba(var(--band-theta-high),0.4)]'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="text-xl">{item.icon}</div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-slate-100">{item.title}</div>
                <div className="text-xs text-slate-400 mt-1">
                  By {item.author} • {item.date}
                </div>
              </div>
              {selectedKnowledge.includes(item.id) && (
                <Check className="w-4 h-4 text-[rgb(var(--band-theta-high))] flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Memories */}
      <div className="mb-4">
        <div className="text-xs text-slate-400 mb-3 flex items-center gap-2">
          <Database className="w-3 h-3" />
          Related Memories
        </div>
        <div className="space-y-2">
          {memories.map(memory => (
            <button
              key={memory.id}
              onClick={() => toggleMemory(memory.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
                selectedMemories.includes(memory.id)
                  ? 'bg-[rgba(var(--band-theta-high),0.15)] border-[rgba(var(--band-theta-high),0.4)]'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="text-xl">{memory.icon}</div>
              <div className="flex-1 text-left">
                <div className="text-sm text-slate-100">{memory.content}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  {memory.date}
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {(memory.gravity * 100).toFixed(0)}% gravity
                  </span>
                </div>
              </div>
              {selectedMemories.includes(memory.id) && (
                <Check className="w-4 h-4 text-[rgb(var(--band-theta-high))] flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="w-full py-3 px-4 rounded-lg 
          bg-[rgba(var(--band-theta-high),0.2)]
          hover:bg-[rgba(var(--band-theta-high),0.3)]
          border border-[rgba(var(--band-theta-high),0.3)]
          hover:border-[rgba(var(--band-theta-high),0.5)]
          text-[rgb(var(--band-theta-high))]
          transition-all duration-200 text-sm font-medium"
      >
        <Sparkles className="w-4 h-4 inline mr-2" />
        Create Space with Selected Context
      </button>
    </motion.div>
  )
}
