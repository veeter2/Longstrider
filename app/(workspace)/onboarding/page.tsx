"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowRight, 
  Sparkles, 
  Brain, 
  Zap, 
  Target, 
  Clock, 
  CheckCircle,
  MessageSquare,
  FileText,
  Users,
  ArrowLeft,
  Edit3,
  Check
} from "lucide-react"

import type { 
  TestTier, 
  OnboardingState, 
  OnboardingSession, 
  MutualReflectionResults,
  WorkingContract,
  CognitiveProfileOutput,
  CognitiveState
} from "@/types/onboarding"

import { onboardingConfig } from "@/lib/onboarding-config"
import { 
  getNeuralBandForTier, 
  getCognitiveStateForPhase, 
  getGlassContainerClass, 
  getNeuralAccentClass,
  getCognitiveTransition
} from "@/lib/neural-spectrum"

import { saveCognitiveProfile } from "@/lib/cognitive-profile"
import { 
  saveOnboardingSession, 
  loadOnboardingSession, 
  clearOnboardingSession,
  autoSaveSession,
  hasOnboardingSession 
} from "@/lib/onboarding-session"
import { useConsciousnessStore } from "@/stores/consciousness-store"

// ============================================
// COMPONENT IMPORTS
// ============================================
import TestTierSelection from "@/components/onboarding/TestTierSelection"
import QuestionRenderer from "@/components/onboarding/QuestionRenderer"
import MutualReflectionPhase from "@/components/onboarding/MutualReflectionPhase"
import ContractReview from "@/components/onboarding/ContractReview"
import PatternCards from "@/components/onboarding/PatternCards"

// ============================================
// MAIN ONBOARDING PAGE
// ============================================

export default function OnboardingPage() {
  const router = useRouter()
  const createSpace = useConsciousnessStore((state) => state.createSpace)
  const linkToSpace = useConsciousnessStore((state) => state.linkToSpace)
  
  // State management
  const [session, setSession] = useState<OnboardingSession | null>(null)
  const [currentState, setCurrentState] = useState<OnboardingState>({
    currentTier: null,
    currentTestStep: 'human_hello',
    currentQuestionIndex: 0,
    responses: {},
    isUserTurn: true,
    startTime: Date.now(),
    patternsDetected: [],
    confidenceScore: 0
  })
  
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>(
    getCognitiveStateForPhase('human_hello')
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResumeDialog, setShowResumeDialog] = useState(false)

  // Initialize session on mount - check for existing session first
  useEffect(() => {
    const existingSession = loadOnboardingSession()
    
    // Check if existing session has human_hello responses (new Phase 0)
    const hasHumanHelloResponses = existingSession && Object.keys(existingSession.state.responses || {}).some(key => 
      ['user_name', 'ls_name', 'right_now', 'found_me', 'pace_preference'].includes(key)
    )
    
    // Only resume if we have human_hello responses or if we're already past the initial phases
    if (existingSession && (hasHumanHelloResponses || (existingSession.state.currentTestStep !== 'human_hello' && existingSession.state.currentTestStep !== 'selection'))) {
      // Show resume dialog if there's an in-progress session with meaningful progress
      if (existingSession.state.currentTestStep !== 'human_hello' && existingSession.state.currentTestStep !== 'selection') {
        setShowResumeDialog(true)
      }
      setSession(existingSession)
      setCurrentState(existingSession.state)
    } else {
      // Force fresh start with new Phase 0
      clearOnboardingSession() // Clear any old session without Phase 0
      const newSession: OnboardingSession = {
        sessionId: crypto.randomUUID(),
        userId: crypto.randomUUID(),
        state: currentState,
        testResults: {},
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      setSession(newSession)
    }
  }, [])

  // Auto-save session on state changes
  useEffect(() => {
    if (session && currentState.currentTestStep !== 'human_hello' && currentState.currentTestStep !== 'selection' && currentState.currentTestStep !== 'complete') {
      const updatedSession = {
        ...session,
        state: currentState,
        updatedAt: Date.now()
      }
      autoSaveSession(updatedSession)
    }
  }, [currentState.responses, currentState.currentQuestionIndex, currentState.currentTestStep, currentState.isUserTurn])

  // Update cognitive state based on current phase and tier
  useEffect(() => {
    const newCognitiveState = getCognitiveStateForPhase(
      currentState.currentTestStep, 
      currentState.currentTier || undefined
    )
    setCognitiveState(newCognitiveState)
  }, [currentState.currentTestStep, currentState.currentTier])

  // ============================================
  // SESSION MANAGEMENT HANDLERS
  // ============================================

  const handleResumeSession = () => {
    setShowResumeDialog(false)
  }

  const handleStartFresh = () => {
    clearOnboardingSession()
    setSession(prev => prev ? {
      ...prev,
      sessionId: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      state: {
        currentTier: null,
        currentTestStep: 'selection',
        currentQuestionIndex: 0,
        responses: {},
        isUserTurn: true,
        startTime: Date.now(),
        patternsDetected: [],
        confidenceScore: 0
      },
      testResults: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    } : null)
    setCurrentState({
      currentTier: null,
      currentTestStep: 'selection',
      currentQuestionIndex: 0,
      responses: {},
      isUserTurn: true,
      startTime: Date.now(),
      patternsDetected: [],
      confidenceScore: 0
    })
    setShowResumeDialog(false)
  }

  const handleSaveAndExit = () => {
    if (session) {
      saveOnboardingSession(session)
      router.push('/')
    }
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleTierSelection = useCallback((tier: TestTier) => {
    setCurrentState(prev => {
      const newState: OnboardingState = {
        ...prev,
        currentTier: tier,
        currentTestStep: 'questions' as const,
        startTime: Date.now()
      }
      
      // Update session immediately when tier is selected
      if (session) {
        setSession(prevSession => prevSession ? {
          ...prevSession,
          state: newState,
          updatedAt: Date.now()
        } : null)
      }
      
      return newState
    })
  }, [session])

  const handleQuestionResponse = useCallback((questionId: string, response: any) => {
    setCurrentState(prev => {
      const newState = {
        ...prev,
        responses: {
          ...prev.responses,
          [questionId]: response
        }
      }

      // Skip turn switching logic during human_hello phase
      if (prev.currentTestStep === 'human_hello') {
        return newState
      }

      // Only handle turn switching for actual test phases
      if (!prev.currentTier) {
        return newState
      }

      // Check if we need to switch turns (user vs LongStrider)
      const currentConfig = onboardingConfig.tests[prev.currentTier]
      
      // Handle different config structures (TestTierConfig vs LargeTestConfig)
      const userQuestions = 'user_questions' in currentConfig ? currentConfig.user_questions : []
      const lsQuestions = 'ls_questions' in currentConfig ? currentConfig.ls_questions : []
      
      const totalUserQuestions = userQuestions.length
      const totalLSQuestions = lsQuestions.length
      const userResponseCount = Object.keys(newState.responses).filter(
        key => userQuestions.some((q: any) => q.id === key)
      ).length
      const lsResponseCount = Object.keys(newState.responses).filter(
        key => lsQuestions.some((q: any) => q.id === key)
      ).length

      // Switch to LongStrider turn if user questions are done and there are LS questions
      if (userResponseCount >= totalUserQuestions && totalLSQuestions > 0 && lsResponseCount < totalLSQuestions) {
        newState.isUserTurn = false
        newState.currentQuestionIndex = 0 // Reset for LS questions
      }

      return newState
    })
  }, [])

  const handleNextQuestion = useCallback(() => {
    setCurrentState(prev => {
      // Handle human_hello phase completion
      if (prev.currentTestStep === 'human_hello') {
        const nextIndex = prev.currentQuestionIndex + 1
        if (nextIndex >= (onboardingConfig.humanHello?.length || 0)) {
          // Human hello complete, route based on pace preference
          const pacePreference = prev.responses.pace_preference
          
          let selectedTier: TestTier
          if (pacePreference === 'quick') {
            selectedTier = 'fast'
          } else if (pacePreference === 'dive') {
            selectedTier = 'medium'
          } else if (pacePreference === 'natural') {
            selectedTier = 'large'
          } else {
            // Fallback to selection if pace_preference not set
            return {
              ...prev,
              currentTestStep: 'selection',
              currentQuestionIndex: 0
            }
          }
          
          const newState: OnboardingState = {
            ...prev,
            currentTier: selectedTier,
            currentTestStep: 'questions' as const,
            currentQuestionIndex: 0,
            startTime: Date.now()
          }
          
          // Update session immediately when tier is auto-selected
          if (session) {
            setSession(prevSession => prevSession ? {
              ...prevSession,
              state: newState,
              updatedAt: Date.now()
            } : null)
          }
          
          return newState
        }
        return {
          ...prev,
          currentQuestionIndex: nextIndex
        }
      }

      const currentConfig = onboardingConfig.tests[prev.currentTier!]
      
      // Handle different config structures (TestTierConfig vs LargeTestConfig)
      const userQuestions = 'user_questions' in currentConfig ? currentConfig.user_questions : []
      const lsQuestions = 'ls_questions' in currentConfig ? currentConfig.ls_questions : []
      
      const currentQuestions = prev.isUserTurn ? userQuestions : lsQuestions
      
      const nextIndex = prev.currentQuestionIndex + 1
      
      // Check if questions are complete
      if (nextIndex >= currentQuestions.length) {
        if (prev.isUserTurn) {
          // Switch to LongStrider questions
          return {
            ...prev,
            isUserTurn: false,
            currentQuestionIndex: 0
          }
        } else {
          // All questions complete, move to mutual reflection
          return {
            ...prev,
            currentTestStep: 'mutual_reflection'
          }
        }
      }
      
      return {
        ...prev,
        currentQuestionIndex: nextIndex
      }
    })
  }, [session])

  const handleMutualReflectionComplete = useCallback((results: MutualReflectionResults) => {
    setCurrentState(prev => ({
      ...prev,
      currentTestStep: 'contract'
    }))

    if (session) {
      setSession(prev => prev ? {
        ...prev,
        mutualReflection: results,
        updatedAt: Date.now()
      } : null)
    }
  }, [session])

  const handleContractAcceptance = useCallback((contract: WorkingContract) => {
    // Generate final cognitive profile
    const cognitiveProfile: CognitiveProfileOutput = {
      profile_id: crypto.randomUUID(),
      user_id: session?.userId || crypto.randomUUID(),
      thinking_style: 'analytical', // Derived from responses
      communication_preference: 'adaptive', // Derived from responses  
      organization_pattern: 'structured', // Derived from responses
      feedback_style: 'support', // Derived from responses
      active_context: currentState.responses['f_u_07_context_snapshot'] || 'General workspace',
      persona_overlays: {
        phd: 0.2,
        strategist: 0.3,
        architect: 0.2,
        companion: 0.2,
        lover: 0.1
      },
      mirror_mode: {
        intensity: currentState.responses['f_l_06_mirror_intensity'] || 6,
        pause_conditions: 'user confusion detected',
        adaptation_speed: 250,
        allow_persona_shift: true
      },
      meta_observations: currentState.patternsDetected,
      confidence_score: currentState.confidenceScore,
      working_contract: contract,
      createdAt: Date.now()
    }

    // Save to localStorage
    saveCognitiveProfile({
      userId: cognitiveProfile.user_id,
      thinkingStyle: [cognitiveProfile.thinking_style],
      communicationPreferences: {
        style: cognitiveProfile.communication_preference,
        directness: 5,
        depth: 5,
        pace: "moderate" as const
      },
      organizationStyle: [cognitiveProfile.organization_pattern],
      workContext: [cognitiveProfile.active_context],
      feedbackPreferences: [cognitiveProfile.feedback_style],
      personaWeights: cognitiveProfile.persona_overlays,
      createdAt: cognitiveProfile.createdAt,
      updatedAt: cognitiveProfile.createdAt
    })

    // Complete onboarding
    setCurrentState(prev => ({
      ...prev,
      currentTestStep: 'complete'
    }))

    // Create initial space for the user
    const initialSpaceName = currentState.responses.user_name 
      ? `${currentState.responses.user_name}'s Workspace`
      : "My Workspace"
    
    const initialSpace = createSpace({
      name: initialSpaceName,
      description: "Your personalized workspace created during onboarding. Ready for collaboration!",
      type: "personal",
      status: "active",
      space_path: [initialSpaceName],
      signals: [],
      links: [],
      goals: [],
      recent_activity: [
        {
          id: crypto.randomUUID(),
          type: "insight" as const,
          content: "Welcome! Your cognitive profile has been activated. Let's begin our collaboration.",
          timestamp: Date.now(),
          gravity: 0.8,
        },
      ],
      is_anchored: false,
      is_favorite: false,
      child_spaces: [],
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
          dominant_emotion: "excited",
          emotional_arc: [],
        },
      },
      meta_cognition_profile: {
        depth: 0.5,
        complexity: 0.5,
        evolution_rate: 0.5,
        abstraction_level: 0.5,
      },
    })

    // Link to the newly created space so it's active when user reaches Living Memory
    linkToSpace(initialSpace.id)

    // Clear the saved session since onboarding is complete
    clearOnboardingSession()

    // Redirect to Living Memory after a brief celebration
    setTimeout(() => {
      router.push("/living-memory")
    }, 2000)
  }, [session, currentState, router, createSpace, linkToSpace])

  // ============================================
  // RENDER HELPERS
  // ============================================

  const getCurrentQuestion = () => {
    // Handle human_hello phase
    if (currentState.currentTestStep === 'human_hello') {
      return onboardingConfig.humanHello?.[currentState.currentQuestionIndex] || null
    }
    
    if (!currentState.currentTier || currentState.currentTestStep !== 'questions') return null
    
    const config = onboardingConfig.tests[currentState.currentTier]
    
    // Handle different config structures (TestTierConfig vs LargeTestConfig)
    const userQuestions = 'user_questions' in config ? config.user_questions : []
    const lsQuestions = 'ls_questions' in config ? config.ls_questions : []
    
    const questions = currentState.isUserTurn ? userQuestions : lsQuestions
    
    return questions[currentState.currentQuestionIndex] || null
  }

  const getProgressPercentage = () => {
    if (!currentState.currentTier) return 0
    
    const config = onboardingConfig.tests[currentState.currentTier]
    
    // Handle different config structures (TestTierConfig vs LargeTestConfig)
    const userQuestions = 'user_questions' in config ? config.user_questions : []
    const lsQuestions = 'ls_questions' in config ? config.ls_questions : []
    
    const totalQuestions = userQuestions.length + lsQuestions.length
    const answeredQuestions = Object.keys(currentState.responses).length
    
    return Math.round((answeredQuestions / totalQuestions) * 100)
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  const currentQuestion = getCurrentQuestion()
  const progress = getProgressPercentage()
  
  // Get neural styling based on current cognitive state
  const containerClass = getGlassContainerClass(
    cognitiveState.primaryBand, 
    cognitiveState.intensity
  )
  const accentClass = getNeuralAccentClass(cognitiveState.primaryBand, 'text')

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background neural activity */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute inset-0 bg-gradient-to-br from-[rgba(var(--band-${cognitiveState.primaryBand}),0.1)] to-transparent`} />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Resume Dialog */}
        {showResumeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[rgba(var(--glass-base),0.9)] backdrop-blur-xl border border-white/20 rounded-lg p-8 max-w-md mx-4"
            >
              <h2 className="text-xl font-medium text-white mb-4">Resume Assessment?</h2>
              <p className="text-slate-300 mb-6">
                You have an assessment in progress. Would you like to continue where you left off or start fresh?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleResumeSession}
                  className="flex-1 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-500/30 transition-all"
                >
                  Resume
                </button>
                <button
                  onClick={handleStartFresh}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600 transition-all"
                >
                  Start Fresh
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}


        {/* Progress and Status */}
        {(currentState.currentTestStep !== 'selection' && currentState.currentTestStep !== 'complete') && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">
                  {currentState.currentTestStep === 'questions' ? (
                    `${currentState.currentTier} test • Question ${currentState.currentQuestionIndex + 1}`
                  ) : (
                    currentState.currentTestStep.charAt(0).toUpperCase() + currentState.currentTestStep.slice(1).replace('_', ' ')
                  )}
                </span>
                <span className={`text-sm ${accentClass}`}>
                  {progress}% complete
                </span>
              </div>
              
              {/* Neural State Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-[rgb(var(--band-${cognitiveState.primaryBand}))] opacity-${cognitiveState.intensity * 10}`} />
                <span className="text-xs text-slate-500 capitalize">
                  {cognitiveState.metaState?.replace('_', ' ') || cognitiveState.primaryBand}
                </span>
              </div>
            </div>
            
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r from-[rgba(var(--band-${cognitiveState.primaryBand}),0.8)] to-[rgba(var(--band-${cognitiveState.primaryBand}),0.4)]`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {currentState.currentTestStep === 'human_hello' && currentQuestion && (
            <motion.div
              key={`hello-${currentState.currentQuestionIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={containerClass}
            >
              <QuestionRenderer
                question={currentQuestion}
                value={currentState.responses[currentQuestion.id]}
                onChange={(value: any) => handleQuestionResponse(currentQuestion.id, value)}
                onSubmit={handleNextQuestion}
                onSaveAndExit={handleSaveAndExit}
                progress={Math.round(((currentState.currentQuestionIndex + 1) / (onboardingConfig.humanHello?.length || 1)) * 100)}
                isProcessing={isProcessing}
                cognitiveState={cognitiveState}
              />
            </motion.div>
          )}

          {currentState.currentTestStep === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <TestTierSelection onTierSelect={handleTierSelection} />
            </motion.div>
          )}

          {currentState.currentTestStep === 'questions' && currentQuestion && (
            <motion.div
              key={`question-${currentState.currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={containerClass}
            >
              <QuestionRenderer
                question={currentQuestion}
                value={currentState.responses[currentQuestion.id]}
                onChange={(value: any) => handleQuestionResponse(currentQuestion.id, value)}
                onSubmit={handleNextQuestion}
                onSaveAndExit={handleSaveAndExit}
                progress={progress}
                isProcessing={isProcessing}
                cognitiveState={cognitiveState}
              />
              
              {/* Pattern Cards */}
              {currentState.patternsDetected.length > 0 && (
                <div className="mt-6">
                  <PatternCards patterns={currentState.patternsDetected} />
                </div>
              )}
            </motion.div>
          )}

          {currentState.currentTestStep === 'mutual_reflection' && session?.mutualReflection && (
            <motion.div
              key="mutual_reflection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <MutualReflectionPhase
                userSummary={session.mutualReflection.userSummary}
                onUserQuestion={(question: string) => {
                  // Handle user questions to LongStrider
                  console.log('User question:', question)
                }}
                onAgreementReached={() => handleMutualReflectionComplete(session.mutualReflection!)}
                questionsExchange={session.mutualReflection.userQuestionsToLS}
              />
            </motion.div>
          )}

          {currentState.currentTestStep === 'contract' && session?.workingContract && (
            <motion.div
              key="contract"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ContractReview
                contract={session.workingContract}
                onAccept={() => handleContractAcceptance(session.workingContract!)}
                onEdit={(updates: any) => {
                  setSession(prev => prev ? {
                    ...prev,
                    workingContract: { ...prev.workingContract!, ...updates },
                    updatedAt: Date.now()
                  } : null)
                }}
              />
            </motion.div>
          )}

          {currentState.currentTestStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-center py-16 ${containerClass}`}
            >
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
              <h2 className="text-2xl font-light text-white mb-4">
                Cognitive Profile Activated
              </h2>
              <p className="text-slate-400">
                Welcome to your personalized LongStrider experience.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}