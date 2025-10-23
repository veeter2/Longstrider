"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ArrowRight, Sparkles, Zap, Brain, Target } from "lucide-react"
import { useConsciousnessStore } from "@/stores/consciousness-store"
import { getCognitiveProfile, saveCognitiveProfile } from "@/lib/cognitive-profile"
import {
  spaceCreationQuestions,
  generateSpaceConfiguration,
  type SpaceCreationResponse,
} from "@/lib/space-creation-interview"

export default function CreateSpacePage() {
  const router = useRouter()
  const createSpace = useConsciousnessStore((state) => state.createSpace)

  const [step, setStep] = useState<"select" | "interview" | "generating">("select")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<SpaceCreationResponse[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")

  const cognitiveProfile = getCognitiveProfile() || {
    userId: "temp",
    thinkingStyle: [],
    communicationPreferences: { directness: 5, depth: 5, pace: "moderate" as const, style: "balanced" },
    organizationStyle: [],
    feedbackPreferences: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const currentQuestion = spaceCreationQuestions[currentQuestionIndex]

  // Quick Space Creation
  const handleQuickSpace = () => {
    const quickSpace = createSpace({
      name: "Quick Thought",
      description: "Quick exploration space",
      type: "personal",
      status: "active",
      space_path: ["Quick Thought"],
      signals: [],
      links: [],
      goals: [],
      recent_activity: [],
      is_anchored: false,
      is_favorite: false,
      child_spaces: [],
      active_rails: [],
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
          dominant_emotion: "neutral",
          emotional_arc: [],
        },
      },
    })

    router.push(`/cognitive?space=${quickSpace.id}`)
  }

  // Start Guided Interview
  const handleGuidedSpace = () => {
    setStep("interview")
  }

  // Handle Answer Submission
  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return

    const response: SpaceCreationResponse = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      timestamp: Date.now(),
    }

    setResponses([...responses, response])
    setCurrentAnswer("")

    // Move to next question or generate space
    if (currentQuestionIndex < spaceCreationQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      generateSpace()
    }
  }

  // Generate Space from Interview
  const generateSpace = async () => {
    setStep("generating")

    // Generate configuration
    const config = generateSpaceConfiguration(responses, cognitiveProfile)

    // Create space with full configuration
    const newSpace = createSpace({
      name: config.name,
      description: config.description,
      type: "personal",
      status: "active",
      space_path: [config.name],
      signals: [],
      links: [],
      goals: config.milestones.map((m) => ({
        id: crypto.randomUUID(),
        title: m.name,
        description: m.description,
        status: "active",
        created_at: Date.now(),
      })),
      recent_activity: [
        {
          id: crypto.randomUUID(),
          type: "insight",
          content: `Space created with ${config.mode} mode. Ready to collaborate!`,
          timestamp: Date.now(),
          gravity: 0.7,
        },
      ],
      is_anchored: false,
      is_favorite: false,
      child_spaces: [],
      active_rails: [],
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
          dominant_emotion: "neutral",
          emotional_arc: [],
        },
      },
      meta_cognition_profile: {
        depth: config.communicationStyle.depth / 10,
        complexity: 0.5,
        evolution_rate: 0.5,
        abstraction_level: 0.5,
      },
    })

    // Store space configuration as metadata (for LLM context)
    localStorage.setItem(`space_config_${newSpace.id}`, JSON.stringify(config))

    // Save cognitive profile from responses (first-time onboarding)
    if (!getCognitiveProfile()) {
      const profile = {
        userId: crypto.randomUUID(),
        thinkingStyle: responses.slice(0, 2).map(r => r.answer),
        communicationPreferences: {
          style: config.communicationStyle.feedbackStyle,
          directness: config.communicationStyle.directness,
          depth: config.communicationStyle.depth,
          pace: config.communicationStyle.pace,
        },
        organizationStyle: [responses[2]?.answer || "exploratory"],
        workContext: [responses[0]?.answer || ""],
        feedbackPreferences: [config.communicationStyle.feedbackStyle],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      saveCognitiveProfile(profile)
    }

    // Navigate to chat with space context
    setTimeout(() => {
      router.push(`/cognitive?space=${newSpace.id}`)
    }, 2000)
  }

  // Adapt question based on cognitive profile
  const adaptedQuestion = currentQuestion.adaptToProfile
    ? currentQuestion.adaptToProfile(cognitiveProfile)
    : currentQuestion.question

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-light text-white mb-4">Create a New Space</h1>
              <p className="text-slate-400 text-lg">Choose how you'd like to begin</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Space */}
              <div 
                className="p-8 cursor-pointer border border-slate-800 bg-slate-900/50 rounded-lg hover:border-cyan-500/50 transition-all group" 
                onClick={handleQuickSpace}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <Zap className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-light text-white">Quick Space</h2>
                  <p className="text-slate-400">
                    Jump straight into conversation. Perfect for quick thoughts, brainstorming, or exploration.
                  </p>
                  <div className="text-sm text-slate-500">~30 seconds</div>
                </div>
              </div>

              {/* Guided Space */}
              <div
                className="p-8 cursor-pointer border border-slate-800 bg-slate-900/50 rounded-lg hover:border-emerald-500/50 transition-all group relative overflow-hidden"
                onClick={handleGuidedSpace}
              >
                <div className="absolute top-4 right-4">
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">Recommended</span>
                </div>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Brain className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-light text-white">Guided Space</h2>
                  <p className="text-slate-400">
                    Let LongStrider interview you to set up goals, structure, and success metrics. Creates a tailored
                    thought partnership.
                  </p>
                  <div className="text-sm text-slate-500">~5-7 minutes</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "interview" && (
          <motion.div
            key="interview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-400">
                  Question {currentQuestionIndex + 1} of {spaceCreationQuestions.length}
                </span>
                <span className="text-sm text-emerald-400">
                  {Math.round(((currentQuestionIndex + 1) / spaceCreationQuestions.length) * 100)}% complete
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestionIndex + 1) / spaceCreationQuestions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="p-8 border border-slate-800 bg-slate-900/50 rounded-lg">
              <div className="space-y-6">
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-light text-white mb-2">{adaptedQuestion}</h2>
                      {currentQuestion.followUp && (
                        <p className="text-sm text-slate-400">{currentQuestion.followUp}</p>
                      )}
                    </div>
                  </div>
                </div>

                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full min-h-[150px] text-base bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all resize-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.metaKey) {
                      handleSubmitAnswer()
                    }
                  }}
                />

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      if (currentQuestionIndex > 0) {
                        setCurrentQuestionIndex(currentQuestionIndex - 1)
                        setCurrentAnswer(responses[currentQuestionIndex - 1]?.answer || "")
                      } else {
                        setStep("select")
                      }
                    }}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-lg text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {currentQuestionIndex < spaceCreationQuestions.length - 1 ? "Next" : "Create Space"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Target className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-light text-white mb-4">Creating Your Space</h2>
            <p className="text-slate-400 text-lg">Setting up your thought partnership...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
