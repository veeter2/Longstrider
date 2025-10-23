/**
 * USE SPACE INITIALIZER
 * 
 * Ensures a default space exists on app load
 * Runs ONCE at app level (layout.tsx)
 * Prevents race conditions between Chat & Navigator
 * 
 * Architecture:
 * - App Layout → This Hook → Creates default space if none exists
 * - Chat & Navigator → Consume spaces → Never create defaults
 */

"use client"

import { useEffect, useRef } from 'react'
import { useConsciousnessStore } from '@/stores/consciousness-store'

export function useSpaceInitializer() {
  const { 
    spaces,
    cognitiveState, 
    createSpace, 
    linkToSpace 
  } = useConsciousnessStore()
  
  // Prevent multiple initializations
  const initialized = useRef(false)
  
  useEffect(() => {
    // Only run once per app load
    if (initialized.current) return
    
    // Skip if already has spaces
    if (Object.keys(spaces).length > 0) {
      console.log('✅ [SPACE_INIT] Spaces exist, skipping initialization')
      
      // Ensure SOME space is linked
      if (!cognitiveState.current_space_id) {
        const firstSpace = Object.values(spaces)[0]
        if (firstSpace) {
          console.log('🔗 [SPACE_INIT] Linking to first available space:', firstSpace.name)
          linkToSpace(firstSpace.id)
        }
      }
      
      initialized.current = true
      return
    }
    
    // No spaces exist - create default
    console.log('🆕 [SPACE_INIT] No spaces found, creating default Active Chat space')
    
    const defaultSpace = createSpace({
      name: 'Active Chat',
      description: 'Your conversation with IVY',
      type: 'personal',
      status: 'active',
      space_path: ['Chat'],
      signals: [{ 
        name: 'chat', 
        color: '#10b981', 
        created_by: 'system', 
        id: crypto.randomUUID(), 
        created_at: Date.now() 
      }],
      links: [],
      goals: [],
      recent_activity: [],
      is_anchored: true,
      is_favorite: true,
      child_spaces: [],
      active_rail_ids: [],
      analytics: {
        message_count: 0,
        word_count: 0,
        pattern_count: 0,
        complexity_score: 0,
        gravity_score: 0.5,
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
    
    // Link to it
    linkToSpace(defaultSpace.id)
    initialized.current = true
    
    console.log('✅ [SPACE_INIT] Created and linked default space:', defaultSpace.id)
  }, []) // Empty deps - run once on mount
  
  return {
    isInitialized: initialized.current
  }
}
