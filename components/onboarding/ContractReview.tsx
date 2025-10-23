"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  FileText, 
  CheckCircle, 
  Edit3, 
  Save,
  Eye,
  PenTool,
  User,
  Brain,
  MessageSquare
} from "lucide-react"
import type { ContractReviewProps, WorkingContract } from "@/types/onboarding"

export default function ContractReview({ 
  contract, 
  onAccept, 
  onEdit 
}: ContractReviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContract, setEditContract] = useState(contract)

  const handleSave = () => {
    onEdit(editContract)
    setIsEditing(false)
  }

  const contractSections = [
    {
      icon: User,
      title: "Mission Statement",
      content: contract.mission,
      key: "mission" as keyof WorkingContract
    },
    {
      icon: Brain,
      title: "Decision Protocol", 
      content: `Low: ${contract.decision_protocol.low}\nMedium: ${contract.decision_protocol.medium}\nHigh: ${contract.decision_protocol.high}`,
      key: "decision_protocol" as keyof WorkingContract
    },
    {
      icon: MessageSquare,
      title: "Feedback Protocol",
      content: `Cadence: ${contract.feedback_protocol.cadence}\nFocus: ${contract.feedback_protocol.focus}\nChallenge Level: ${contract.feedback_protocol.challenge_level}/10`,
      key: "feedback_protocol" as keyof WorkingContract
    }
  ]

  if (!contract) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-2xl font-light text-white">Working Contract</h1>
        </div>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Review, adjust, and accept our working agreement. You can modify this at any time.
        </p>
      </div>

      {/* Contract Content */}
      <div className="bg-[rgba(var(--glass-base),0.6)] backdrop-blur-xl border border-white/10 rounded-lg p-8 space-y-8">
        {contractSections.map((section, index) => {
          const Icon = section.icon
          
          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="border-b border-slate-700 pb-6 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    {section.title}
                    {isEditing && (
                      <button className="text-xs text-slate-400 hover:text-white">
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                  </h3>
                  
                  {isEditing && section.key === "mission" ? (
                    <textarea
                      value={editContract.mission}
                      onChange={(e) => setEditContract(prev => ({ ...prev, mission: e.target.value }))}
                      className="w-full min-h-[100px] p-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none resize-none"
                      placeholder="Enter mission statement..."
                    />
                  ) : (
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Milestones */}
        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Milestones
          </h3>
          <div className="space-y-3">
            {contract.milestones.map((milestone, index) => (
              <div key={index} className="p-4 bg-slate-800/30 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white">{milestone.goal}</h4>
                  <span className="text-sm text-slate-400">{milestone.deadline}</span>
                </div>
                <p className="text-sm text-slate-300">{milestone.metric}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Persona Overlays */}
        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-lg font-medium text-white mb-4">Persona Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(contract.persona_overlays).map(([persona, weight]) => (
              <div key={persona} className="text-center p-3 bg-slate-800/30 rounded-lg">
                <div className="text-sm font-medium text-white capitalize mb-1">{persona}</div>
                <div className="text-lg font-bold text-violet-400">{Math.round(weight * 100)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Boundaries */}
        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-lg font-medium text-white mb-3">Safety Boundaries</h3>
          <p className="text-slate-300 leading-relaxed">{contract.safety_boundaries}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-3 rounded-lg border transition-all flex items-center gap-2 ${
            isEditing 
              ? 'border-slate-600 text-slate-400 hover:text-white' 
              : 'border-violet-500/30 text-violet-300 hover:bg-violet-500/10'
          }`}
        >
          {isEditing ? <Eye className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
          {isEditing ? 'View Mode' : 'Edit Contract'}
        </button>

        {isEditing && (
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        )}

        <button
          onClick={onAccept}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Agree and Activate Profile
        </button>
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-slate-500 max-w-xl mx-auto">
        <p>
          This is a living contract that evolves with our partnership. 
          You can update any field at any time through settings.
        </p>
      </div>
    </div>
  )
}
