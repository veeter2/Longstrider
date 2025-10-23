/**
 * USE SPACE SYNC
 * Syncs chat messages to Space analytics in real-time
 * 
 * THE MAGIC: Chat → Store → Navigator bidirectional flow
 * 
 * Responsibilities:
 * - Listen to new messages
 * - Extract metadata (emotion, gravity, themes, etc.)
 * - Update current Space analytics
 * - Trigger parent Space rollup
 * - Create SpaceActivity entries
 */

import { useEffect, useCallback } from 'react'
import { useConsciousnessStore } from '@/stores/consciousness-store'
import type { IvyMessage } from '@/types/chat'
import type { SpaceActivity, EmotionalField } from '@/stores/consciousness-store'

interface UseSpaceSyncOptions {
  enabled?: boolean
}

export function useSpaceSync(messages: IvyMessage[], options: UseSpaceSyncOptions = {}) {
  const { enabled = true } = options
  
  const {
    cognitiveState,
    getSpace,
    updateSpace,
    setCurrentEmotion,
    setCognitiveMode,
    setEmotionalField,
    updateMetaMemory
  } = useConsciousnessStore()

  // Enhanced sync: Extract ALL rich metadata from chat messages
  const syncMessageToSpace = useCallback((message: IvyMessage) => {
    if (!enabled) {
      console.warn('⚠️ [SPACE_SYNC] Disabled, skipping sync')
      return
    }
    
    if (!cognitiveState.current_space_id) {
      console.error('❌ [SPACE_SYNC] No active Space! Cannot sync message. Current state:', cognitiveState)
      return
    }
    
    const currentSpace = getSpace(cognitiveState.current_space_id)
    if (!currentSpace) {
      console.error('❌ [SPACE_SYNC] Space not found:', cognitiveState.current_space_id)
      return
    }

    console.log('🌟 [SPACE_SYNC] Processing rich message metadata:', {
      id: message.id,
      emotion: message.emotion,
      gravity: message.gravity,
      emotionalField: message.emotionalField,
      memoryConstellation: message.payload.memoryConstellation,
      consciousnessState: message.payload.consciousnessState,
      meta: message.payload.meta
    })

    // ============================
    // EXTRACT RICH METADATA
    // ============================
    
    // Basic metadata
    const emotion = String(message.emotion || message.payload.meta?.emotion || 'neutral')
    const gravity = Number(message.gravity || message.payload.meta?.gravity || 0.5)
    const tokensUsed = Number(message.payload.meta?.tokensUsed || 0)
    const tokensSaved = Number(message.payload.meta?.tokensSaved || 0)
    const estimatedCost = Number(message.payload.meta?.estimated_cost || 0)
    
    // 🌟 NEW: Rich metadata we were missing
    const keyThemes = message.payload.meta?.key_themes || []
    const activeMemoryIds = message.payload.meta?.active_memory_ids || []
    const synthesis = message.payload.meta?.synthesis || ''
    const resonanceActive = message.payload.meta?.resonance_active || false
    
    // Memory constellation data
    const memoryConstellation = message.payload.memoryConstellation
    const memoryDepth = memoryConstellation?.depth || 0
    const patterns = Array.isArray(memoryConstellation?.patterns) 
      ? memoryConstellation.patterns 
      : []
    const memoryArcs = memoryConstellation?.arcs || []
    
    // Consciousness state data
    const consciousnessState = message.payload.consciousnessState
    const consciousnessMode = consciousnessState?.mode
    const coherence = consciousnessState?.coherence || 0
    const patternRecognition = consciousnessState?.pattern_recognition || 0
    
    // Emotional field data (rich!)
    const emotionalFieldData = message.emotionalField
    const harmonicResonance = emotionalFieldData?.harmonic_resonance
    const fieldCoherence = emotionalFieldData?.field_coherence
    const evolutionMomentum = emotionalFieldData?.evolution_momentum
    
    // Backend metadata (soul/sovereign data)
    const soulId = message.payload.meta?.soul_id
    const sovereignName = message.payload.meta?.sovereign_name
    
    // ============================
    // CREATE ACTIVITY ENTRY
    // ============================
    
    const activity: SpaceActivity = {
      id: message.id,
      type: 'message',
      content: message.payload.text?.substring(0, 150) || 'Message',
      timestamp: message.ts,
      gravity,
      emotion,
      metadata: {
        messageId: message.id,
        consciousness_state: consciousnessState,
        memory_depth: memoryDepth,
        pattern_strength: patterns.length > 0 ? patterns.length / 10 : undefined,
        soul_id: soulId as string | undefined,
        sovereign_name: sovereignName as string | undefined,
        // 🌟 NEW: Additional rich metadata
        key_themes: Array.isArray(keyThemes) ? keyThemes : [],
        active_memory_ids: Array.isArray(activeMemoryIds) ? activeMemoryIds : [],
        synthesis: typeof synthesis === 'string' ? synthesis : '',
        resonance_active: typeof resonanceActive === 'boolean' ? resonanceActive : false
      }
    }

    // ============================
    // UPDATE SPACE ANALYTICS (ENHANCED)
    // ============================
    
    updateSpace(currentSpace.id, {
      analytics: {
        ...currentSpace.analytics,
        message_count: currentSpace.analytics.message_count + 1,
        word_count: currentSpace.analytics.word_count + (message.payload.text?.split(' ').length || 0),
        pattern_count: Math.max(currentSpace.analytics.pattern_count, patterns.length),
        complexity_score: Math.max(currentSpace.analytics.complexity_score, patternRecognition * 10),
        gravity_score: (currentSpace.analytics.gravity_score * currentSpace.analytics.message_count + gravity) / (currentSpace.analytics.message_count + 1),
        tokens_used: currentSpace.analytics.tokens_used + tokensUsed,
        tokens_saved: currentSpace.analytics.tokens_saved + tokensSaved,
        estimated_cost: currentSpace.analytics.estimated_cost + estimatedCost,
        emotional_signature: {
          ...currentSpace.analytics.emotional_signature,
          average_gravity: (currentSpace.analytics.emotional_signature.average_gravity * currentSpace.analytics.message_count + gravity) / (currentSpace.analytics.message_count + 1),
          dominant_emotion: emotion,
          emotional_arc: [
            ...currentSpace.analytics.emotional_signature.emotional_arc,
            {
              timestamp: message.ts,
              emotion,
              intensity: gravity
            }
          ].slice(-50) // Keep last 50 for richer emotional history
        }
      },
      recent_activity: [
        activity,
        ...currentSpace.recent_activity
      ].slice(0, 20), // Keep more activities for richer feed
      last_activity_at: Date.now()
    })

    // ============================
    // UPDATE META MEMORY (NEW!)
    // ============================
    
    if (memoryConstellation && (patterns.length > 0 || memoryDepth > 10)) {
      const trendingPatterns = patterns
        .filter((p): p is { pattern_type?: string } => typeof p === 'object' && p !== null)
        .filter(p => p.pattern_type)
        .map(p => p.pattern_type!)
        .slice(0, 10)
      
      const dominantConcepts = patterns
        .filter((p): p is { emotional_signature?: string } => typeof p === 'object' && p !== null)
        .filter(p => p.emotional_signature)
        .map(p => p.emotional_signature!)
        .slice(0, 10)

      updateMetaMemory(currentSpace.id, {
        trending_patterns: trendingPatterns.length > 0 ? trendingPatterns : currentSpace.meta_memory?.trending_patterns || [],
        aggregate_gravity: gravity,
        dominant_concepts: dominantConcepts.length > 0 ? dominantConcepts : currentSpace.meta_memory?.dominant_concepts || [],
        consciousness_snapshots: [
          ...(currentSpace.meta_memory?.consciousness_snapshots || []),
          {
            id: message.id,
            messageIndex: currentSpace.analytics.message_count,
            gravitySpike: gravity > 0.8,
            patternDetected: patterns.length > 3 ? `${patterns.length} patterns` : '',
            timestamp: message.ts
          }
        ].slice(-20) // Keep last 20 snapshots
      })
    }

    // ============================
    // UPDATE GLOBAL CONSCIOUSNESS STATE (ENHANCED)
    // ============================
    
    // Update emotion
    setCurrentEmotion(emotion)
    
    // Update emotional field with rich data
    if (emotionalFieldData) {
      const enhancedEmotionalField: Partial<EmotionalField> = {
        dominant: emotion,
        emotional_blend: emotionalFieldData.emotional_blend || emotionalFieldData.blend,
        fusion_quality: emotionalFieldData.fusion_quality || emotionalFieldData.quality,
        average_gravity: gravity,
        emotional_span: emotionalFieldData.emotional_span || emotionalFieldData.span,
        harmonic_resonance: harmonicResonance,
        field_coherence: fieldCoherence,
        evolution_momentum: evolutionMomentum
      }
      
      setEmotionalField(enhancedEmotionalField)
    }
    
    // Update cognitive mode (expanded support)
    if (consciousnessMode) {
      setCognitiveMode(consciousnessMode as any)
    }
    
    console.log(`✨ [SPACE_SYNC] Synced rich metadata to space "${currentSpace.name}":`, {
      emotion,
      gravity,
      memoryDepth,
      patternsCount: patterns.length,
      consciousnessMode,
      tokensUsed,
      estimatedCost
    })
    
  }, [enabled, cognitiveState.current_space_id, getSpace, updateSpace, setCurrentEmotion, setCognitiveMode, setEmotionalField, updateMetaMemory])

  // Auto-sync on new messages
  useEffect(() => {
    if (!enabled) return
    if (messages.length === 0) return
    if (!cognitiveState.current_space_id) return // Guard against no active space
    
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'ivy') {
      syncMessageToSpace(lastMessage)
    }
  }, [messages, enabled, cognitiveState.current_space_id]) // Removed syncMessageToSpace from deps

  return {
    syncMessageToSpace
  }
}
