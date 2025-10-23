"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  MessageSquare, 
  Send, 
  Edit3, 
  CheckCircle, 
  Brain,
  Heart,
  Zap,
  TrendingUp
} from "lucide-react"
import type { MutualReflectionProps } from "@/types/onboarding"

interface UserSummary {
  thinking_summary: string
  motivation_summary: string
  communication_summary: string
  behavioral_patterns: string[]
  growth_opportunities: string[]
}

export default function MutualReflectionPhase({
  userSummary,
  onUserQuestion,
  onAgreementReached,
  questionsExchange
}: MutualReflectionProps) {
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showUserQuestions, setShowUserQuestions] = useState(false)

  const handleSubmitQuestion = async () => {
    if (!currentQuestion.trim()) return

    setIsSubmitting(true)
    try {
      onUserQuestion(currentQuestion.trim())
      setCurrentQuestion("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const summarySections = [
    {
      icon: Brain,
      title: "Thinking Patterns",
      content: userSummary.thinking_summary,
      color: "text-blue-400"
    },
    {
      icon: Heart,
      title: "Motivation & Values", 
      content: userSummary.motivation_summary,
      color: "text-emerald-400"
    },
    {
      icon: MessageSquare,
      title: "Communication Style",
      content: userSummary.communication_summary,
      color: "text-violet-400"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-violet-400" />
          </div>
          <h1 className="text-2xl font-light text-white">Cognitive Mirror</h1>
        </div>
        <p className="text-slate-400 max-w-2xl mx-auto">
          This is my current map of your mind and motivation. You can edit, question, or correct anything below.
        </p>
      </div>

      {/* Summary Sections */}
      <div className="space-y-6">
        {summarySections.map((section, index) => {
          const Icon = section.icon
          
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-[rgba(var(--glass-base),0.6)] backdrop-blur-xl border border-white/10 rounded-lg p-6"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${section.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-3">{section.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Behavioral Patterns */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-[rgba(var(--glass-base),0.6)] backdrop-blur-xl border border-white/10 rounded-lg p-6"
      >
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Behavioral Patterns
        </h3>
        <div className="flex flex-wrap gap-2">
          {userSummary.behavioral_patterns.map((pattern, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm text-amber-300"
            >
              {pattern}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Growth Opportunities */}
      {userSummary.growth_opportunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-[rgba(var(--glass-base),0.6)] backdrop-blur-xl border border-white/10 rounded-lg p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Growth Opportunities
          </h3>
          <div className="flex flex-wrap gap-2">
            {userSummary.growth_opportunities.map((opportunity, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-300"
              >
                {opportunity}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* User Questions Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-[rgba(var(--glass-base),0.6)] backdrop-blur-xl border border-white/10 rounded-lg p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            Questions for LongStrider
          </h3>
          <button
            onClick={() => setShowUserQuestions(!showUserQuestions)}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            {showUserQuestions ? 'Hide questions' : 'Show questions'}
          </button>
        </div>

        {showUserQuestions && (
          <div className="space-y-4">
            <p className="text-slate-300">
              Now you can ask me questions about how I think, decide, or learn — anything you want to know about my design, logic, or biases.
            </p>
            
            {/* Example Questions */}
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Example questions:</p>
              <div className="space-y-1 text-sm text-slate-500">
                <p>• "How do you reason when you're unsure?"</p>
                <p>• "What do you prioritize when two values conflict?"</p>
                <p>• "How do you decide what feedback to give?"</p>
              </div>
            </div>

            {/* Question Input */}
            <div className="space-y-3">
              <textarea
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="Ask me anything about my reasoning, biases, or design..."
                className="w-full min-h-[80px] p-4 bg-slate-800/30 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 focus:outline-none transition-all resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.metaKey && currentQuestion.trim()) {
                    handleSubmitQuestion()
                  }
                }}
              />
              
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitQuestion}
                  disabled={!currentQuestion.trim() || isSubmitting}
                  className="px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-300 hover:bg-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Asking...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Ask LongStrider
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Previous Questions */}
            {questionsExchange.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400">Our conversation:</p>
                {questionsExchange.map((exchange, index) => (
                  <div key={index} className="space-y-2">
                    <div className="text-sm text-blue-300">
                      <strong>You:</strong> {exchange.userQuestion}
                    </div>
                    <div className="text-sm text-slate-300 ml-4">
                      <strong>LongStrider:</strong> {exchange.lsResponse}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Agreement Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-center"
      >
        <button
          onClick={onAgreementReached}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
        >
          <CheckCircle className="w-5 h-5" />
          Confirm and Move to Contract
        </button>
      </motion.div>
    </div>
  )
}
