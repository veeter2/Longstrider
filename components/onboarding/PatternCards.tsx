"use client"

import { motion } from "framer-motion"
import { Brain, Zap, Target, TrendingUp } from "lucide-react"

interface PatternCardsProps {
  patterns: string[]
}

const patternIcons = {
  thinking: Brain,
  behavior: Zap,
  preference: Target,
  growth: TrendingUp
}

export default function PatternCards({ patterns }: PatternCardsProps) {
  if (!patterns || patterns.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-medium text-slate-300">Patterns Detected</span>
      </div>
      
      <div className="grid gap-3">
        {patterns.map((pattern, index) => {
          // Simple categorization for demo - in real implementation this would be more sophisticated
          const category = pattern.toLowerCase().includes('think') ? 'thinking' :
                          pattern.toLowerCase().includes('behavior') ? 'behavior' :
                          pattern.toLowerCase().includes('prefer') ? 'preference' : 'growth'
          
          const Icon = patternIcons[category as keyof typeof patternIcons] || Brain
          const colors = {
            thinking: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400',
            behavior: 'from-violet-500/10 to-purple-500/10 border-violet-500/20 text-violet-400', 
            preference: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400',
            growth: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400'
          }

          return (
            <motion.div
              key={pattern}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`p-4 rounded-lg bg-gradient-to-r ${colors[category as keyof typeof colors]} border backdrop-blur-sm`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed">{pattern}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
