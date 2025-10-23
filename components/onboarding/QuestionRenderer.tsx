"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft, Brain, MessageSquare, CheckCircle } from "lucide-react"
import type { 
  UserQuestion, 
  LongStriderQuestion, 
  CognitiveState,
  QuestionRendererProps 
} from "@/types/onboarding"
import { getNeuralAccentClass, getGlassContainerClass } from "@/lib/neural-spectrum"

type QuestionType = UserQuestion | LongStriderQuestion

interface QuestionRendererComponentProps extends Omit<QuestionRendererProps, 'question'> {
  question: QuestionType
  cognitiveState: CognitiveState
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  onSubmit,
  onBack,
  onSaveAndExit,
  progress,
  isProcessing,
  cognitiveState
}: QuestionRendererComponentProps) {
  const [localValue, setLocalValue] = useState(value || "")
  const [isValid, setIsValid] = useState(false)
  const continueButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setLocalValue(value || "")
  }, [value])

  useEffect(() => {
    // Validate based on question type and requirements
    if (!localValue) {
      setIsValid(false)
      return
    }

    switch (question.response_type) {
      case 'text':
        setIsValid(localValue.trim().length > 0)
        break
      case 'single_select':
      case 'multi_select':
        setIsValid(Array.isArray(localValue) ? localValue.length > 0 : !!localValue)
        break
      case 'number':
        const num = Number(localValue)
        setIsValid(!isNaN(num) && 
          (!question.validation?.min || num >= question.validation.min) &&
          (!question.validation?.max || num <= question.validation.max)
        )
        break
      default:
        setIsValid(true)
    }
  }, [localValue, question.response_type, question.validation])


  const handleValueChange = (newValue: any) => {
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleSubmit = () => {
    if (isValid) {
      onSubmit()
    }
  }

  const isUserQuestion = question.role === 'user'
  const accentClass = getNeuralAccentClass(cognitiveState.primaryBand, 'text')
  const bgClass = getNeuralAccentClass(cognitiveState.primaryBand, 'bg')

  const renderInput = () => {
    switch (question.response_type) {
      case 'text':
        return (
          <textarea
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Share your thoughts here..."
            className="w-full min-h-[120px] p-4 bg-slate-800/30 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 focus:outline-none transition-all resize-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey && isValid) {
                handleSubmit()
              } else if (e.key === "Tab" && isValid && continueButtonRef.current) {
                e.preventDefault()
                continueButtonRef.current.focus()
              }
            }}
          />
        )

      case 'single_select':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value
              const optionLabel = typeof option === 'string' ? option : option.label
              
              return (
                <button
                  key={optionValue}
                  onClick={() => handleValueChange(optionValue)}
                  onKeyDown={(e) => {
                    if (e.key === "Tab" && isValid && continueButtonRef.current) {
                      e.preventDefault()
                      continueButtonRef.current.focus()
                    }
                  }}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    localValue === optionValue
                      ? `${bgClass} border-[rgba(var(--band-${cognitiveState.primaryBand}),0.5)] text-white`
                      : 'bg-slate-800/20 border-slate-700 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{optionLabel}</span>
                    {localValue === optionValue && (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )

      case 'multi_select':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value
              const optionLabel = typeof option === 'string' ? option : option.label
              const selectedValues = Array.isArray(localValue) ? localValue : []
              const isSelected = selectedValues.includes(optionValue)
              
              return (
                <button
                  key={optionValue}
                  onClick={() => {
                    const newSelection = isSelected 
                      ? selectedValues.filter(v => v !== optionValue)
                      : [...selectedValues, optionValue]
                    handleValueChange(newSelection)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Tab" && isValid && continueButtonRef.current) {
                      e.preventDefault()
                      continueButtonRef.current.focus()
                    }
                  }}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    isSelected
                      ? `${bgClass} border-[rgba(var(--band-${cognitiveState.primaryBand}),0.5)] text-white`
                      : 'bg-slate-800/20 border-slate-700 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{optionLabel}</span>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )

      case 'number':
        return (
          <input
            type="number"
            value={localValue}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            min={question.validation?.min}
            max={question.validation?.max}
            className="w-full p-4 bg-slate-800/30 border border-slate-700 rounded-lg text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 focus:outline-none transition-all"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValid) {
                handleSubmit()
              } else if (e.key === "Tab" && isValid && continueButtonRef.current) {
                e.preventDefault()
                continueButtonRef.current.focus()
              }
            }}
          />
        )

      case 'scale':
        if ('scale' in question && question.scale) {
          const scaleValue = Number(localValue) || question.scale.default || question.scale.min
          
          return (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-slate-400">
                <span>{question.scale.min}</span>
                <span className={accentClass}>{scaleValue}</span>
                <span>{question.scale.max}</span>
              </div>
              <input
                type="range"
                min={question.scale.min}
                max={question.scale.max}
                value={scaleValue}
                onChange={(e) => handleValueChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-center text-sm text-slate-400">
                {scaleValue === 0 && "Not at all"}
                {scaleValue === question.scale.max && "Completely"}
              </div>
            </div>
          )
        }
        break

      default:
        return (
          <div className="p-4 bg-slate-800/20 rounded-lg text-slate-400">
            Unsupported question type: {question.response_type}
          </div>
        )
    }

    return null
  }

  return (
    <div className="p-8 space-y-6">
      {/* Question Header */}
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg bg-[rgba(var(--band-${cognitiveState.primaryBand}),0.15)] flex items-center justify-center flex-shrink-0`}>
          {isUserQuestion ? (
            <Brain className={`w-6 h-6 ${accentClass}`} />
          ) : (
            <MessageSquare className={`w-6 h-6 ${accentClass}`} />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-slate-400">
              {isUserQuestion ? 'Your turn' : 'LongStrider protocol'}
            </span>
            {question.theory_sources && (
              <span className="text-xs text-slate-500">
                • Research-based
              </span>
            )}
          </div>
          
          <h2 className="text-xl font-light text-white mb-3 leading-relaxed">
            {question.prompt}
          </h2>
          
          {question.why && (
            <p className="text-sm text-slate-400 italic">
              Why: {question.why}
            </p>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-4">
        {renderInput()}
        
        {/* Validation Messages */}
        {question.validation && localValue && !isValid && (
          <p className="text-sm text-amber-400">
            Please ensure your response meets the requirements.
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        {onBack ? (
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          {onSaveAndExit && (
            <button
              onClick={onSaveAndExit}
              className="px-4 py-2 text-sm bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-all"
            >
              Save & Exit
            </button>
          )}
          
          <motion.button
            ref={continueButtonRef}
            whileHover={{ scale: isValid ? 1.02 : 1 }}
            whileTap={{ scale: isValid ? 0.98 : 1 }}
            onClick={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValid && !isProcessing) {
                handleSubmit()
              }
            }}
            disabled={!isValid || isProcessing}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              isValid && !isProcessing
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 hover:shadow-lg'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Processing...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Keyboard Hint */}
      {question.response_type === 'text' && (
        <p className="text-xs text-slate-500 text-center">
          Press ⌘ + Enter to continue or Tab to focus Continue button
        </p>
      )}
      {question.response_type !== 'text' && isValid && (
        <p className="text-xs text-slate-500 text-center">
          Press Tab to focus Continue button or Enter to continue
        </p>
      )}
    </div>
  )
}
