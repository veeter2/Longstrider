"use client"

import React from 'react'
import { ThreeRailLayout } from '@/components/three-rail-layout'
import { LongStriderChat } from './chat-center'
import { LongStriderLeftRail } from './chat-left-rail'
import { useLongStriderStore } from '@/stores/longstrider-store'
import { useConsciousnessStore } from '@/stores/consciousness-store'

// ============================
// LONGSTRIDER CHAT WITH RAILS
// Complete three-rail cognitive interface
// ============================

export function LongStriderChatWithRails() {
  const { currentThreadId, setCurrentThread } = useLongStriderStore()
  const { createSpace } = useConsciousnessStore()

  const handleSpaceSelect = (spaceId: string) => {
    // Switch to selected space/thread
    setCurrentThread(spaceId)
  }

  const handleCreateSpace = () => {
    // Create new space in consciousness store
    const newSpace = createSpace({
      name: `LongStrider ${new Date().toLocaleString()}`,
      type: 'personal',
      status: 'active',
      is_anchored: false,
      is_favorite: false,
      signals: [],
      space_path: [],
      child_spaces: [],
      links: [],
      goals: [],
      recent_activity: [],
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

    // Switch to new space
    setCurrentThread(newSpace.id)
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
      <LongStriderChat />
    </ThreeRailLayout>
  )
}

export default LongStriderChatWithRails
