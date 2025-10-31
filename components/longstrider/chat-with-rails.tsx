"use client"

import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ThreeRailLayout } from '@/components/three-rail-layout'
import { LongStriderChat } from './chat-center'
import { LongStriderLeftRail } from './chat-left-rail'
import { SpaceCreationInterview } from './space-creation-interview'
import { useLongStriderStore } from '@/stores/longstrider-store'
import { useConsciousnessStore } from '@/stores/consciousness-store'

// ============================
// LONGSTRIDER CHAT WITH RAILS
// Complete three-rail cognitive interface
// With conversational space creation
// ============================

export function LongStriderChatWithRails() {
  const { currentThreadId, setCurrentThread } = useLongStriderStore()
  const { createSpace } = useConsciousnessStore()

  const [showInterview, setShowInterview] = useState(false)

  const handleSpaceSelect = (spaceId: string) => {
    // Switch to selected space/thread
    setCurrentThread(spaceId)
  }

  const handleCreateSpace = () => {
    // Open conversational interview instead of creating immediately
    setShowInterview(true)
  }

  const handleInterviewComplete = (spaceId: string) => {
    // Interview handled space creation and thread switching
    // Just close the interview
    setShowInterview(false)
  }

  const handleInterviewCancel = () => {
    setShowInterview(false)
  }

  return (
    <ThreeRailLayout
      leftRail={
        <LongStriderLeftRail
          onSpaceSelect={handleSpaceSelect}
          onCreateSpace={handleCreateSpace}
          selectedSpaceId={currentThreadId || undefined}
        />
      }
      rightRail={null}
      leftRailWidth={320}
      rightRailWidth={0}
    >
      <AnimatePresence mode="wait">
        {showInterview ? (
          <SpaceCreationInterview
            key="interview"
            onComplete={handleInterviewComplete}
            onCancel={handleInterviewCancel}
          />
        ) : (
          <LongStriderChat key="chat" />
        )}
      </AnimatePresence>
    </ThreeRailLayout>
  )
}

export default LongStriderChatWithRails
