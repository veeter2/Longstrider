"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================
// CONSCIOUSNESS STORE v3 - SPACE ARCHITECTURE
// Clean cognitive topology: Domains → Spaces → Memories
// ============================

// Domain: Top-level grouping (Personal, Work, Research)
export interface Domain {
  id: string
  name: string
  description?: string
  org_id?: string
  project_id?: string
  created_at: number
}

// Signal: Thematic or emotional metadata (replaces Tag)
export interface Signal {
  id: string
  name: string
  emotion?: string
  color: string
  created_at: number
  created_by: string
}

// Rail: AI assistant/agent configuration
export interface Rail {
  id: string
  name: string
  icon: string
  color: string
  personality: string
  behaviors: string[]
  knowledge: string[]
}

// Space Link: Relationships between spaces
export interface SpaceLink {
  target_id: string
  type: 'branch' | 'reference' | 'merge' | 'similar' | 'related'
  strength: number // 0-1
  created_at: number
}

// Meta Cognition Profile: Depth of thinking
export interface MetaCognitionProfile {
  depth: number // 0-1 (surface → deep)
  complexity: number // 0-1 (simple → complex)
  evolution_rate: number // 0-1 (static → rapidly evolving)
  abstraction_level: number // 0-1 (concrete → abstract)
}

// Council Response: AI agent consensus
export interface CouncilResponse {
  consensus_score: number // 0-1
  agents: Array<{
    agent_id: string
    agent_name: string
    response: string
    confidence: number
    timestamp: number
  }>
  analyzed_at: number
}

// Goal: Objectives within a Space
export interface SpaceGoal {
  id: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'blocked'
  created_at: number
  completed_at?: number
  parent_goal_id?: string
}

// Activity: Recent messages/events in Space (Enhanced for consciousness events)
export interface SpaceActivity {
  id: string
  type: 'message' | 'insight' | 'pattern' | 'memory' | 'thought' | 'contradiction' | 'mode_shift' | 'memory_depth' | 'pattern_emergence'
  content: string
  timestamp: number
  gravity?: number
  emotion?: string
  // Rich metadata for consciousness events
  metadata?: {
    messageId?: string // Link to source message
    depth?: number // For memory_depth events
    memory_depth?: number // Alternative name for consistency
    pattern_strength?: number // For pattern events  
    contradiction_type?: string // For contradiction events
    mode_from?: string // For mode_shift events
    mode_to?: string // For mode_shift events
    consciousness_state?: any // Raw consciousness data
    soul_id?: string // Backend soul ID
    sovereign_name?: string // Backend sovereign name
    key_themes?: string[] // Key themes detected
    active_memory_ids?: string[] // Memory IDs surfaced
    synthesis?: string // Memory synthesis
    resonance_active?: boolean // Resonance state
  }
}

// Cognitive State: Live cognitive state
export interface CognitiveState {
  mode?: 'core_hum' | 'precision_focus' | 'creative_flow' | 'analytical_deep'
  is_thinking: boolean
  current_emotion?: string
  system_status: 'ready' | 'thinking' | 'error'
  current_space_id?: string // Link to active Space
  session_start: number
  last_activity: number
}

// Emotional Field: Dynamic emotional state
export interface EmotionalField {
  dominant?: string
  emotional_blend?: Record<string, number>
  fusion_quality?: number
  average_gravity?: number
  emotional_span?: number
  harmonic_resonance?: number
  field_coherence?: number
  evolution_momentum?: number
}

// Space: Context container for thoughts (replaces Thread)
export interface Space {
  id: string
  name: string
  description?: string
  
  // Hierarchy
  domain_id?: string
  parent_space_id?: string
  child_spaces: string[]
  space_path: string[] // ["Work", "Project XYZ"]
  
  // Classification
  type: 'personal' | 'team' | 'organization'
  status: 'active' | 'anchored' | 'hibernated' | 'concluded'
  
  // Organization
  signals: Array<Signal>
  
  // State
  is_anchored: boolean
  is_favorite: boolean
  
  // Intelligence Layer
  cluster_id?: string
  meta_cognition_profile?: MetaCognitionProfile
  council_responses?: CouncilResponse
  links: SpaceLink[]
  
  // Active Rails per Space
  active_rail_ids: string[]
  
  // Goals & Progress
  goals: SpaceGoal[]
  
  // Activity Feed
  recent_activity: SpaceActivity[]
  
  // Analytics
  analytics: {
    message_count: number
    word_count: number
    pattern_count: number
    complexity_score: number
    gravity_score: number
    // Token Economics
    tokens_used: number
    tokens_saved: number
    estimated_cost: number
    emotional_signature: {
      average_gravity: number
      dominant_emotion: string
      emotional_arc: Array<{
        timestamp: number
        emotion: string
        intensity: number
      }>
    }
  }
  
  // Meta Memory
  meta_memory?: {
    trending_patterns: string[]
    aggregate_gravity: number
    dominant_concepts: string[]
    consciousness_snapshots: Array<{
      id: string
      messageIndex: number
      gravitySpike: boolean
      patternDetected: string
      timestamp: number
    }>
  }
  
  // Timestamps
  created_at: number
  updated_at: number
  last_activity_at: number
}

export interface ConsciousnessState {
  // Core Data
  spaces: Record<string, Space>
  domains: Record<string, Domain>
  
  // Cognitive State (NEW!)
  cognitiveState: CognitiveState
  emotionalField: EmotionalField
  
  // Cross-Space Intelligence
  crossSpacePatterns: string[]
  globalAnalytics: {
    totalSpaces: number
    totalDomains: number
    totalMessages: number
    averageComplexity: number
    averageGravity: number
    dominantEmotions: string[]
  }
  
  // Rails (AI assistants/agents per space)
  available_rails: any[]
  
  // Loading States
  isLoading: boolean
  isAnalyzing: boolean
  
  // ============================
  // DOMAIN ACTIONS
  // ============================
  createDomain: (domain: Omit<Domain, 'id' | 'created_at'>) => Domain
  updateDomain: (id: string, updates: Partial<Domain>) => void
  deleteDomain: (id: string) => void
  getDomain: (id: string) => Domain | undefined
  getSpacesByDomain: (domainId: string) => Space[]
  
  // ============================
  // SPACE ACTIONS
  // ============================
  createSpace: (space: Omit<Space, 'id' | 'created_at' | 'updated_at' | 'last_activity_at'>) => Space
  updateSpace: (id: string, updates: Partial<Space>) => void
  deleteSpace: (id: string) => void
  clearAllSpaces: () => void
  getSpace: (id: string) => Space | undefined
  
  // Space Organization
  anchorSpace: (id: string) => void
  unanchorSpace: (id: string) => void
  favoriteSpace: (id: string) => void
  unfavoriteSpace: (id: string) => void
  hibernateSpace: (id: string) => void
  activateSpace: (id: string) => void
  
  // Space Operations
  branchSpace: (sourceId: string, name: string) => Space
  cloneSpace: (sourceId: string, name: string) => Space
  mergeSpaces: (sourceIds: string[], targetName: string) => Space
  
  // Signal Management
  addSignal: (spaceId: string, signal: Omit<Signal, 'id' | 'created_at'>) => void
  removeSignal: (spaceId: string, signalId: string) => void
  
  // Meta Memory
  updateMetaMemory: (spaceId: string, metaMemory: Space['meta_memory']) => void
  analyzeCrossSpacePatterns: () => void
  updateGlobalAnalytics: () => void
  
  // Search & Query
  searchSpaces: (query: string) => Space[]
  getSpacesByStatus: (status: Space['status']) => Space[]
  getAnchoredSpaces: () => Space[]
  getFavoriteSpaces: () => Space[]
  getSpaceHierarchy: (spaceId: string) => Space[]
  
  // ============================
  // COGNITIVE STATE ACTIONS (NEW!)
  // ============================
  setCognitiveMode: (mode: CognitiveState['mode']) => void
  setThinking: (thinking: boolean) => void
  setSystemStatus: (status: CognitiveState['system_status']) => void
  setCurrentEmotion: (emotion?: string) => void
  setEmotionalField: (field: Partial<EmotionalField>) => void
  linkToSpace: (spaceId: string) => void
  updateActivity: () => void
  
  // ============================
  // CONSCIOUSNESS EVENTS (NEW!)
  // ============================
  addConsciousnessEvent: (event: Omit<SpaceActivity, 'id' | 'timestamp'>) => void
  
  // ============================
  // RAILS (stub functions)
  // ============================
  toggleRail: (spaceId: string, railId: string) => void
  getActiveRails: (spaceId: string) => any[]
}

export const useConsciousnessStore = create<ConsciousnessState>()(
  persist(
    (set, get) => ({
      // Initial State
      spaces: {},
      domains: {},
      crossSpacePatterns: [],
      
      // Cognitive State (NEW!)
      cognitiveState: {
        is_thinking: false,
        system_status: 'ready',
        session_start: Date.now(),
        last_activity: Date.now()
      },
      emotionalField: {},
      globalAnalytics: {
        totalSpaces: 0,
        totalDomains: 0,
        totalMessages: 0,
        averageComplexity: 0,
        averageGravity: 0,
        dominantEmotions: []
      },
      available_rails: [
        {
          id: "product-launch",
          name: "Product Launch",
          icon: "Target",
          color: "violet",
          personality: "Strategic advisor focused on milestones and deadlines",
          behaviors: ["Track objectives", "Monitor blockers", "Suggest priorities"],
          knowledge: ["PRD", "Timeline", "Team resources"],
        },
        {
          id: "team-collab",
          name: "Team Collaboration", 
          icon: "Users",
          color: "blue",
          personality: "Facilitator ensuring alignment and communication",
          behaviors: ["Surface conflicts early", "Track decisions", "Maintain context"],
          knowledge: ["Meeting notes", "Decisions log", "Team dynamics"],
        },
        {
          id: "deep-research",
          name: "Deep Research",
          icon: "Database", 
          color: "emerald",
          personality: "Analytical thinker challenging assumptions",
          behaviors: ["Question everything", "Demand evidence", "Connect concepts"],
          knowledge: ["Papers", "Experiments", "Data sources"],
        },
        {
          id: "creative-exploration",
          name: "Creative Exploration",
          icon: "Sparkles",
          color: "amber", 
          personality: "Creative partner exploring possibilities",
          behaviors: ["Generate alternatives", "Make connections", "Think laterally"],
          knowledge: ["Inspirations", "References", "Wild ideas"],
        },
      ],
      isLoading: false,
      isAnalyzing: false,
      
      // ============================
      // DOMAIN ACTIONS
      // ============================
      createDomain: (domainData) => {
        const id = crypto.randomUUID()
        const domain: Domain = {
          ...domainData,
          id,
          created_at: Date.now()
        }
        
        set((state) => ({
          domains: { ...state.domains, [id]: domain }
        }))
        
        get().updateGlobalAnalytics()
        return domain
      },
      
      updateDomain: (id, updates) => {
        set((state) => {
          const domain = state.domains[id]
          if (!domain) return state
          
          return {
            domains: {
              ...state.domains,
              [id]: { ...domain, ...updates }
            }
          }
        })
      },
      
      deleteDomain: (id) => {
        // Archive all spaces in this domain first
        const spacesInDomain = get().getSpacesByDomain(id)
        spacesInDomain.forEach(space => {
          get().hibernateSpace(space.id)
        })
        
        set((state) => {
          const { [id]: deleted, ...remaining } = state.domains
          return { domains: remaining }
        })
        
        get().updateGlobalAnalytics()
      },
      
      getDomain: (id) => get().domains[id],
      
      getSpacesByDomain: (domainId) => {
        return Object.values(get().spaces).filter(space => space.domain_id === domainId)
      },
      
      // ============================
      // SPACE ACTIONS
      // ============================
      createSpace: (spaceData) => {
        const id = crypto.randomUUID()
        const now = Date.now()
        
        // Ensure unique space name to prevent confusion across rail system, navigator, and chat
        const existingSpaces = Object.values(get().spaces)
        let uniqueName = spaceData.name.trim() || `Untitled Space` // Provide default if empty
        let counter = 1
        
        // Check for duplicates (case-insensitive) and append number if needed
        // Only check active spaces to allow reuse of names from concluded spaces
        while (existingSpaces.some(space => 
          space.name.toLowerCase() === uniqueName.toLowerCase() && 
          space.status !== 'concluded'
        )) {
          uniqueName = `${spaceData.name.trim()} ${counter}`
          counter++
          // Prevent infinite loop with reasonable limit
          if (counter > 100) {
            uniqueName = `${spaceData.name.trim()} ${Date.now()}`
            break
          }
        }
        
        const space: Space = {
          ...spaceData,
          name: uniqueName,
          id,
          created_at: now,
          updated_at: now,
          last_activity_at: now,
          child_spaces: spaceData.child_spaces || [],
          links: spaceData.links || [],
          goals: spaceData.goals || [],
          recent_activity: spaceData.recent_activity || [],
          active_rail_ids: spaceData.active_rail_ids || [],
          // Update space_path if name was changed or was empty
          space_path: spaceData.space_path && spaceData.space_path[spaceData.space_path.length - 1] === (spaceData.name || '') 
            ? [...spaceData.space_path.slice(0, -1), uniqueName]
            : spaceData.space_path || [uniqueName],
          analytics: spaceData.analytics || {
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
        }
        
        set((state) => ({
          spaces: { ...state.spaces, [id]: space }
        }))
        
        get().updateGlobalAnalytics()
        return space
      },
      
      updateSpace: (id, updates) => {
        set((state) => {
          const space = state.spaces[id]
          if (!space) return state
          
          return {
            spaces: {
              ...state.spaces,
              [id]: {
                ...space,
                ...updates,
                updated_at: Date.now()
              }
            }
          }
        })
        
        get().updateGlobalAnalytics()
      },
      
      deleteSpace: (id) => {
        set((state) => {
          const { [id]: deleted, ...remaining } = state.spaces
          
          // If deleting current space, clear it from cognitiveState too
          const newCognitiveState = state.cognitiveState.current_space_id === id
            ? { ...state.cognitiveState, current_space_id: undefined }
            : state.cognitiveState
          
          return {
            spaces: remaining,
            cognitiveState: newCognitiveState
          }
        })
        
        get().updateGlobalAnalytics()
      },
      
      clearAllSpaces: () => {
        set((state) => ({
          spaces: {},
          cognitiveState: {
            ...state.cognitiveState,
            current_space_id: undefined
          }
        }))
        
        get().updateGlobalAnalytics()
        
        // Also clear from localStorage to ensure clean slate
        if (typeof window !== 'undefined') {
          localStorage.removeItem('consciousness-store-v3')
        }
      },
      
      getSpace: (id) => get().spaces[id],
      
      // Space Organization
      anchorSpace: (id) => get().updateSpace(id, { is_anchored: true }),
      unanchorSpace: (id) => get().updateSpace(id, { is_anchored: false }),
      favoriteSpace: (id) => get().updateSpace(id, { is_favorite: true }),
      unfavoriteSpace: (id) => get().updateSpace(id, { is_favorite: false }),
      hibernateSpace: (id) => get().updateSpace(id, { status: 'hibernated' }),
      activateSpace: (id) => get().updateSpace(id, { status: 'active' }),
      
      // Space Operations
      branchSpace: (sourceId, name) => {
        const sourceSpace = get().getSpace(sourceId)
        if (!sourceSpace) throw new Error('Source space not found')
        
        const branchedSpace = get().createSpace({
          name,
          description: `Branched from ${sourceSpace.name}`,
          type: sourceSpace.type,
          status: 'active',
          domain_id: sourceSpace.domain_id,
          parent_space_id: sourceId,
          space_path: [...sourceSpace.space_path, name],
          signals: sourceSpace.signals,
          links: [{
            target_id: sourceId,
            type: 'branch',
            strength: 1.0,
            created_at: Date.now()
          }],
          goals: [],
          recent_activity: [],
          is_anchored: false,
          is_favorite: false,
          child_spaces: [],
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
        
        // Update source to include child
        get().updateSpace(sourceId, {
          child_spaces: [...sourceSpace.child_spaces, branchedSpace.id]
        })
        
        return branchedSpace
      },
      
      cloneSpace: (sourceId, name) => {
        const sourceSpace = get().getSpace(sourceId)
        if (!sourceSpace) throw new Error('Source space not found')
        
        return get().createSpace({
          name,
          description: sourceSpace.description,
          type: sourceSpace.type,
          status: 'active',
          goals: [],
          recent_activity: [],
          domain_id: sourceSpace.domain_id,
          space_path: [name],
          signals: sourceSpace.signals,
          links: [],
          is_anchored: false,
          is_favorite: false,
          child_spaces: [],
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
      },
      
      mergeSpaces: (sourceIds, targetName) => {
        const sourceSpaces = sourceIds.map(id => get().getSpace(id)).filter(Boolean) as Space[]
        if (sourceSpaces.length === 0) throw new Error('No valid source spaces')
        
        // Merge signals from all sources
        const mergedSignals = sourceSpaces.reduce((acc, space) => {
          space.signals.forEach(signal => {
            if (!acc.find(s => s.name === signal.name)) {
              acc.push(signal)
            }
          })
          return acc
        }, [] as Signal[])
        
        // Create merged space
        const mergedSpace = get().createSpace({
          name: targetName,
          description: `Merged from ${sourceSpaces.map(s => s.name).join(', ')}`,
          type: sourceSpaces[0].type,
          status: 'active',
          domain_id: sourceSpaces[0].domain_id,
          space_path: [targetName],
          signals: mergedSignals,
          links: sourceSpaces.map(s => ({
            target_id: s.id,
            type: 'merge' as const,
            strength: 0.8,
            created_at: Date.now()
          })),
          goals: [],
          recent_activity: [],
          is_anchored: false,
          is_favorite: false,
          child_spaces: [],
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
        
        // Hibernate source spaces
        sourceIds.forEach(id => get().hibernateSpace(id))
        
        return mergedSpace
      },
      
      // Signal Management
      addSignal: (spaceId, signalData) => {
        const space = get().getSpace(spaceId)
        if (!space) return
        
        const signal: Signal = {
          ...signalData,
          id: crypto.randomUUID(),
          created_at: Date.now()
        }
        
        get().updateSpace(spaceId, {
          signals: [...space.signals, signal]
        })
      },
      
      removeSignal: (spaceId, signalId) => {
        const space = get().getSpace(spaceId)
        if (!space) return
        
        get().updateSpace(spaceId, {
          signals: space.signals.filter(s => s.id !== signalId)
        })
      },
      
      // Meta Memory
      updateMetaMemory: (spaceId, metaMemory) => {
        get().updateSpace(spaceId, { meta_memory: metaMemory })
      },
      
      analyzeCrossSpacePatterns: () => {
        set({ isAnalyzing: true })
        
        const spaces = Object.values(get().spaces)
        const patterns = new Set<string>()
        
        spaces.forEach(space => {
          space.meta_memory?.trending_patterns?.forEach(pattern => {
            patterns.add(pattern)
          })
        })
        
        set({ 
          crossSpacePatterns: Array.from(patterns),
          isAnalyzing: false 
        })
      },
      
      updateGlobalAnalytics: () => {
        const spaces = Object.values(get().spaces)
        const domains = Object.values(get().domains)
        
        const analytics = {
          totalSpaces: spaces.length,
          totalDomains: domains.length,
          totalMessages: spaces.reduce((sum, s) => sum + s.analytics.message_count, 0),
          averageComplexity: spaces.length > 0 
            ? spaces.reduce((sum, s) => sum + s.analytics.complexity_score, 0) / spaces.length 
            : 0,
          averageGravity: spaces.length > 0
            ? spaces.reduce((sum, s) => sum + s.analytics.gravity_score, 0) / spaces.length
            : 0,
          dominantEmotions: Array.from(
            new Set(spaces.map(s => s.analytics.emotional_signature.dominant_emotion))
          )
        }
        
        set({ globalAnalytics: analytics })
      },
      
      // Search & Query
      searchSpaces: (query) => {
        const spaces = Object.values(get().spaces)
        if (!query.trim()) return spaces
        
        const lowercaseQuery = query.toLowerCase()
        return spaces.filter(space => 
          space.name.toLowerCase().includes(lowercaseQuery) ||
          space.description?.toLowerCase().includes(lowercaseQuery) ||
          space.signals.some(signal => signal.name.toLowerCase().includes(lowercaseQuery))
        )
      },
      
      getSpacesByStatus: (status) => {
        return Object.values(get().spaces).filter(space => space.status === status)
      },
      
      getAnchoredSpaces: () => {
        return Object.values(get().spaces)
          .filter(space => space.is_anchored)
          .sort((a, b) => b.last_activity_at - a.last_activity_at)
      },
      
      getFavoriteSpaces: () => {
        return Object.values(get().spaces)
          .filter(space => space.is_favorite)
          .sort((a, b) => b.last_activity_at - a.last_activity_at)
      },
      
      getSpaceHierarchy: (spaceId) => {
        const hierarchy: Space[] = []
        let currentSpace = get().getSpace(spaceId)
        
        while (currentSpace) {
          hierarchy.unshift(currentSpace)
          currentSpace = currentSpace.parent_space_id 
            ? get().getSpace(currentSpace.parent_space_id)
            : undefined
        }
        
        return hierarchy
      },
      
      // ============================
      // COGNITIVE STATE ACTIONS (NEW!)
      // ============================
      setCognitiveMode: (mode) => set((state) => ({
        cognitiveState: {
          ...state.cognitiveState,
          mode,
          last_activity: Date.now()
        }
      })),
      
      setThinking: (thinking) => set((state) => ({
        cognitiveState: {
          ...state.cognitiveState,
          is_thinking: thinking,
          system_status: thinking ? 'thinking' : 'ready',
          last_activity: Date.now()
        }
      })),
      
      setSystemStatus: (status) => set((state) => ({
        cognitiveState: {
          ...state.cognitiveState,
          system_status: status,
          last_activity: Date.now()
        }
      })),
      
      setCurrentEmotion: (emotion) => set((state) => ({
        cognitiveState: {
          ...state.cognitiveState,
          current_emotion: emotion,
          last_activity: Date.now()
        }
      })),
      
      setEmotionalField: (field) => set((state) => ({
        emotionalField: {
          ...state.emotionalField,
          ...field
        }
      })),
      
      linkToSpace: (spaceId) => set((state) => ({
        cognitiveState: {
          ...state.cognitiveState,
          current_space_id: spaceId,
          last_activity: Date.now()
        }
      })),
      
      updateActivity: () => set((state) => ({
        cognitiveState: {
          ...state.cognitiveState,
          last_activity: Date.now()
        }
      })),
      
      // ============================
      // CONSCIOUSNESS EVENTS (NEW!)
      // ============================
      addConsciousnessEvent: (eventData) => {
        const currentSpaceId = get().cognitiveState.current_space_id
        if (!currentSpaceId) {
          console.warn('No active space for consciousness event:', eventData)
          return
        }
        
        const space = get().getSpace(currentSpaceId)
        if (!space) {
          console.warn('Active space not found:', currentSpaceId)
          return
        }
        
        const event: SpaceActivity = {
          ...eventData,
          id: crypto.randomUUID(),
          timestamp: Date.now()
        }
        
        // Add to space activity feed (keep last 50 events)
        const updatedActivity = [event, ...space.recent_activity].slice(0, 50)
        
        get().updateSpace(currentSpaceId, {
          recent_activity: updatedActivity,
          last_activity_at: Date.now()
        })
        
        console.log(`🌟 [CONSCIOUSNESS] Added ${event.type} event to space "${space.name}":`, event.content)
      },
      
      // Rail functions (working implementations)
      toggleRail: (spaceId, railId) => {
        const space = get().getSpace(spaceId)
        if (!space) return
        
        const currentRailIds = space.active_rail_ids || []
        const isActive = currentRailIds.includes(railId)
        
        const newRailIds = isActive 
          ? currentRailIds.filter(id => id !== railId)
          : [...currentRailIds, railId]
          
        get().updateSpace(spaceId, { active_rail_ids: newRailIds })
      },
      
      getActiveRails: (spaceId) => {
        const space = get().getSpace(spaceId)
        if (!space) return []
        
        const activeRailIds = space.active_rail_ids || []
        return get().available_rails.filter(rail => activeRailIds.includes(rail.id))
      }
    }),
    {
      name: 'consciousness-store-v3',
      // Migration: Support old 'threads' key for backward compatibility
      partialize: (state) => ({
        spaces: state.spaces,
        domains: state.domains,
        cognitiveState: state.cognitiveState,
        crossSpacePatterns: state.crossSpacePatterns,
        globalAnalytics: state.globalAnalytics
      }),
      // Hydration: Clean migration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure cognitiveState exists
          if (!state.cognitiveState) {
            state.cognitiveState = {
              is_thinking: false,
              system_status: 'ready',
              session_start: Date.now(),
              last_activity: Date.now()
            }
          }
        }
      }
    }
  )
)
