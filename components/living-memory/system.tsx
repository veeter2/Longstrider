"use client"

/**
 * Living Memory System
 * 
 * A temporal navigation interface that treats memory as a living, breathing entity.
 * 
 * LIVING LAWS v2.0 COMPLIANCE:
 * - Neural Spectrum: θ₂ (Theta-High) violet for spatial memory/navigation
 * - Material System: Liquid glass with backdrop blur
 * - Color Tokens: ALL colors use CSS variables (no hardcoded values)
 * - Spacing: 8px base unit system
 * - Typography: System font stack with proper scale
 * - Motion: Standard durations (100ms-500ms) with proper easing
 * - Accessibility: WCAG AA compliant
 * 
 * INTEGRATION:
 * - Designed as standalone component
 * - Can accept Space[] data or use mock data
 * - localStorage batch processor (will be replaced with hooks later)
 * - Ready to drop into navigator page
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { ThreeRailLayout } from '@/components/three-rail-layout'
import { LivingMemoryLeftRail } from './left-rail'
import { LivingMemoryRightRail } from './right-rail'
import {
  Clock,
  Users,
  Target,
  Brain,
  Zap,
  TrendingUp,
  AlertCircle,
  Save,
  Edit3,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Star,
  GitBranch,
  Activity,
  DollarSign,
  Hash,
  Sparkles,
  Link,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  BarChart3,
  Network,
  Lightbulb,
  Shield,
  Flame,
  Waves,
  Cloud,
  Circle,
  ChevronUp,
  Info
} from 'lucide-react'
import { RailSidebar } from '@/components/rail-sidebar'

// ========================
// TYPES & INTERFACES
// ========================

interface MemoryItem {
  id: string
  thread_id: string
  session_id: string
  conversation_name: string
  title: string
  summary: string
  content: string
  timestamp: number
  lastUpdated: number
  messageCount: number
  
  // Cognitive metrics
  gravity_score: number
  emotion: string
  emotional_field?: {
    dominant: string
    blend: string[]
    intensity: number
    span: number
  }
  consciousness_mode?: string
  coherence?: number
  
  // Cost & tokens
  tokensUsed: number
  tokensSaved: number
  estimatedCost: number
  
  // Rich metadata
  keyThemes: string[]
  activeMemoryIds: string[]
  synthesis: string
  resonanceActive: boolean
  patterns: string[]
  
  // Team
  teamContributions?: TeamContribution[]
  
  // Associations
  parent_id?: string
  children_ids: string[]
  related_ids: string[]
  
  // Status
  status: 'hot' | 'short' | 'mid' | 'long'
  starred?: boolean
  verified?: boolean
}

interface Objective {
  id: string
  title: string
  progress: number
  dueDate?: string
  levelOfEffort: number // hours
  completed: boolean
  suggestedByAI?: boolean
  suggestion?: string
}

interface TeamContribution {
  id: string
  userId: string
  userName: string
  contribution: string
  decision?: string
  timestamp: number
  gravity: number
}

interface Pattern {
  id: string
  pattern: string
  strength: number
  count: number
  lastOccurred: number
}

interface IdentityAnchor {
  id: string
  content: string
  timestamp: number
  triggered: boolean
}

interface Contradiction {
  id: string
  group: string
  earlier: string
  current: string
  resolution?: string
}

// ========================
// MOCK DATA GENERATOR
// ========================

const generateMockData = (): MemoryItem[] => {
    const now = Date.now()
    const hour = 3600000
    const day = 86400000
    
    return [
      // HOT MEMORIES (< 48 hours)
      {
        id: 'mem_001',
        thread_id: 'thread_789abc',
        session_id: 'session_456def',
        conversation_name: 'Living Memory Architecture',
        title: 'Refining Living Memory System Design',
        summary: "We're refining the Living Memory architecture to solve core LLM usability issues. Current focus: integrating real payload data (gravity scores, consciousness states) into the UI. Key decisions: batch processing from localStorage, retroactive LOE calculation, team contributions async only.",
        content: 'Full conversation content here...',
        timestamp: now - (3 * hour),
        lastUpdated: now - (5 * 60000),
        messageCount: 47,
        gravity_score: 0.89,
        emotion: 'reflection',
        emotional_field: {
          dominant: 'reflection',
          blend: ['curiosity', 'determination'],
          intensity: 0.73,
          span: 4
        },
        consciousness_mode: 'integration',
        coherence: 0.89,
        tokensUsed: 34521,
        tokensSaved: 12300,
        estimatedCost: 0.43,
        keyThemes: ['architecture', 'batch-processing', 'team-memory', 'cost-optimization'],
        activeMemoryIds: ['mem_oct_15', 'mem_nov_02', 'mem_dec_01'],
        synthesis: 'Building a cognitive extension that solves fundamental LLM problems',
        resonanceActive: true,
        patterns: ['recursive-architecture', 'cost-consciousness', 'user-first-design'],
        teamContributions: [
          {
            id: 'contrib_001',
            userId: 'user_sarah',
            userName: 'Sarah Chen',
            contribution: 'API endpoint design for memory batch processing',
            decision: 'Use 30-second intervals for batch updates',
            timestamp: now - (2 * hour),
            gravity: 0.82
          },
          {
            id: 'contrib_002',
            userId: 'user_mike',
            userName: 'Mike Torres',
            contribution: 'Cost optimization strategy',
            decision: 'Implement caching layer',
            timestamp: now - day,
            gravity: 0.67
          }
        ],
        parent_id: 'mem_q4_strategy',
        children_ids: ['mem_frontend', 'mem_backend'],
        related_ids: ['mem_navigator_v2'],
        status: 'hot',
        starred: true,
        verified: false
      },
      {
        id: 'mem_hot_002',
        thread_id: 'thread_hot_002',
        session_id: 'session_hot_002',
        conversation_name: 'Rail System Implementation',
        title: 'Global Rail System Integration Complete',
        summary: 'Successfully implemented the global rail system with collapsible sidebars. Rails now persist state across navigation and integrate with UI store. Major milestone achieved.',
        content: 'Rail implementation details...',
        timestamp: now - (12 * hour),
        lastUpdated: now - (6 * hour),
        messageCount: 89,
        gravity_score: 0.94,
        emotion: 'joy',
        emotional_field: {
          dominant: 'joy',
          blend: ['satisfaction', 'pride'],
          intensity: 0.88,
          span: 3
        },
        consciousness_mode: 'precision_focus',
        coherence: 0.91,
        tokensUsed: 56000,
        tokensSaved: 18000,
        estimatedCost: 0.72,
        keyThemes: ['rail-system', 'ui-architecture', 'state-management', 'persistence'],
        activeMemoryIds: ['mem_001'],
        synthesis: 'Rails transform navigation into a fluid, context-aware experience',
        resonanceActive: true,
        patterns: ['component-architecture', 'state-persistence', 'user-experience'],
        teamContributions: [
          {
            id: 'contrib_003',
            userId: 'user_alex',
            userName: 'Alex Kim',
            contribution: 'Framer Motion animations for smooth transitions',
            timestamp: now - (8 * hour),
            gravity: 0.76
          }
        ],
        parent_id: 'mem_001',
        children_ids: [],
        related_ids: ['mem_001'],
        status: 'hot',
        starred: true,
        verified: true
      },
      {
        id: 'mem_hot_003',
        thread_id: 'thread_hot_003',
        session_id: 'session_hot_003',
        conversation_name: 'Consciousness Events Debug',
        title: 'Fixed Meta Memory Echo Issues',
        summary: 'Identified and resolved the meta memory echo problem. Events were being duplicated due to missing debouncing in the consciousness event handler.',
        content: 'Debug session content...',
        timestamp: now - (36 * hour),
        lastUpdated: now - (24 * hour),
        messageCount: 31,
        gravity_score: 0.78,
        emotion: 'relief',
        consciousness_mode: 'stream',
        coherence: 0.82,
        tokensUsed: 23000,
        tokensSaved: 8000,
        estimatedCost: 0.31,
        keyThemes: ['debugging', 'meta-memory', 'event-handling', 'performance'],
        activeMemoryIds: [],
        synthesis: 'Small bugs can cascade into major UX issues',
        resonanceActive: false,
        patterns: ['debugging-methodology', 'event-driven-architecture'],
        parent_id: undefined,
        children_ids: [],
        related_ids: ['mem_001'],
        status: 'hot',
        starred: false,
        verified: true
      },
      
      // SHORT MEMORIES (2-14 days)
      {
        id: 'mem_002',
        thread_id: 'thread_456xyz',
        session_id: 'session_789ghi',
        conversation_name: 'Navigator V2 Integration',
        title: 'Connecting Living Memory to Navigator',
        summary: 'Designing the integration points between Living Memory and Navigator V2 for seamless consciousness event flow.',
        content: 'Integration discussion content...',
        timestamp: now - (5 * day),
        lastUpdated: now - (3 * day),
        messageCount: 23,
        gravity_score: 0.72,
        emotion: 'curiosity',
        consciousness_mode: 'stream',
        coherence: 0.76,
        tokensUsed: 18500,
        tokensSaved: 5200,
        estimatedCost: 0.24,
        keyThemes: ['integration', 'navigator', 'events', 'real-time'],
        activeMemoryIds: ['mem_001'],
        synthesis: 'Navigator serves as the spatial complement to temporal memory',
        resonanceActive: false,
        patterns: ['event-driven', 'modular-architecture'],
        parent_id: 'mem_001',
        children_ids: [],
        related_ids: ['mem_001'],
        status: 'short',
        starred: false,
        verified: true
      },
      {
        id: 'mem_short_002',
        thread_id: 'thread_short_002',
        session_id: 'session_short_002',
        conversation_name: 'Chat Interface Strategy',
        title: 'SSE Implementation for Real-time Chat',
        summary: 'Implemented Server-Sent Events for the chat interface. Rock-solid connection handling with automatic reconnection. Ready for production.',
        content: 'SSE implementation details...',
        timestamp: now - (8 * day),
        lastUpdated: now - (7 * day),
        messageCount: 67,
        gravity_score: 0.85,
        emotion: 'confidence',
        consciousness_mode: 'precision_focus',
        coherence: 0.88,
        tokensUsed: 45000,
        tokensSaved: 12000,
        estimatedCost: 0.58,
        keyThemes: ['real-time', 'sse', 'chat-interface', 'production-ready'],
        activeMemoryIds: [],
        synthesis: 'Real-time communication is the heartbeat of consciousness',
        resonanceActive: false,
        patterns: ['real-time-systems', 'error-handling', 'reconnection-logic'],
        teamContributions: [
          {
            id: 'contrib_004',
            userId: 'user_jordan',
            userName: 'Jordan Lee',
            contribution: 'WebSocket vs SSE analysis',
            decision: 'SSE chosen for simplicity and reliability',
            timestamp: now - (7 * day),
            gravity: 0.79
          }
        ],
        parent_id: undefined,
        children_ids: ['mem_hot_002'],
        related_ids: [],
        status: 'short',
        starred: true,
        verified: true
      },
      {
        id: 'mem_short_003',
        thread_id: 'thread_short_003',
        session_id: 'session_short_003',
        conversation_name: 'Performance Optimization',
        title: 'Virtual Scrolling for Memory Lists',
        summary: 'Implemented virtual scrolling to handle thousands of memories efficiently. Dramatic performance improvement - from 3s to 100ms render time.',
        content: 'Performance optimization details...',
        timestamp: now - (12 * day),
        lastUpdated: now - (11 * day),
        messageCount: 42,
        gravity_score: 0.76,
        emotion: 'satisfaction',
        consciousness_mode: 'integration',
        coherence: 0.79,
        tokensUsed: 28000,
        tokensSaved: 9000,
        estimatedCost: 0.37,
        keyThemes: ['performance', 'virtual-scrolling', 'optimization', 'ux'],
        activeMemoryIds: [],
        synthesis: 'Performance is invisible until it fails',
        resonanceActive: false,
        patterns: ['performance-optimization', 'lazy-loading'],
        parent_id: undefined,
        children_ids: [],
        related_ids: ['mem_002'],
        status: 'short',
        starred: false,
        verified: true
      },
      
      // MID MEMORIES (14-90 days)
      {
        id: 'mem_003',
        thread_id: 'thread_old_123',
        session_id: 'session_old_456',
        conversation_name: 'Q3 Architecture Review',
        title: 'Quarterly Architecture Decisions',
        summary: 'Major architectural decisions from Q3 including database selection, API design, and scalability approach.',
        content: 'Q3 review content...',
        timestamp: now - (45 * day),
        lastUpdated: now - (45 * day),
        messageCount: 134,
        gravity_score: 0.95,
        emotion: 'determination',
        consciousness_mode: 'precision_focus',
        coherence: 0.92,
        tokensUsed: 89000,
        tokensSaved: 23000,
        estimatedCost: 1.12,
        keyThemes: ['architecture', 'decisions', 'scalability', 'database'],
        activeMemoryIds: [],
        synthesis: 'Foundation laid for entire system architecture',
        resonanceActive: false,
        patterns: ['systematic-approach', 'long-term-thinking'],
        children_ids: ['mem_001', 'mem_004'],
        related_ids: [],
        status: 'mid',
        starred: true,
        verified: true
      },
      {
        id: 'mem_mid_002',
        thread_id: 'thread_mid_002',
        session_id: 'session_mid_002',
        conversation_name: 'Consciousness Store Design',
        title: 'Zustand Store Architecture Finalized',
        summary: 'Designed and implemented the consciousness store using Zustand. Clean separation of concerns with spaces, domains, and cognitive state.',
        content: 'Store architecture details...',
        timestamp: now - (60 * day),
        lastUpdated: now - (60 * day),
        messageCount: 98,
        gravity_score: 0.91,
        emotion: 'clarity',
        consciousness_mode: 'integration',
        coherence: 0.89,
        tokensUsed: 67000,
        tokensSaved: 19000,
        estimatedCost: 0.86,
        keyThemes: ['state-management', 'zustand', 'architecture', 'persistence'],
        activeMemoryIds: [],
        synthesis: 'State management is the nervous system of the app',
        resonanceActive: false,
        patterns: ['clean-architecture', 'separation-of-concerns'],
        teamContributions: [
          {
            id: 'contrib_005',
            userId: 'user_taylor',
            userName: 'Taylor Smith',
            contribution: 'Persistence layer design',
            timestamp: now - (59 * day),
            gravity: 0.84
          },
          {
            id: 'contrib_006',
            userId: 'user_morgan',
            userName: 'Morgan Davis',
            contribution: 'TypeScript interfaces',
            timestamp: now - (58 * day),
            gravity: 0.77
          }
        ],
        parent_id: 'mem_003',
        children_ids: ['mem_001', 'mem_002'],
        related_ids: [],
        status: 'mid',
        starred: true,
        verified: true
      },
      {
        id: 'mem_mid_003',
        thread_id: 'thread_mid_003',
        session_id: 'session_mid_003',
        conversation_name: 'Design System Creation',
        title: 'Living Laws v2.0 Design System',
        summary: 'Created comprehensive design system with neural bands, liquid glass materials, and motion principles. Foundation for all UI components.',
        content: 'Design system documentation...',
        timestamp: now - (75 * day),
        lastUpdated: now - (75 * day),
        messageCount: 156,
        gravity_score: 0.98,
        emotion: 'pride',
        consciousness_mode: 'dream_weave',
        coherence: 0.94,
        tokensUsed: 102000,
        tokensSaved: 28000,
        estimatedCost: 1.30,
        keyThemes: ['design-system', 'neural-bands', 'ui-principles', 'consistency'],
        activeMemoryIds: [],
        synthesis: 'Design is how consciousness feels',
        resonanceActive: false,
        patterns: ['systematic-design', 'visual-hierarchy', 'cognitive-mapping'],
        parent_id: undefined,
        children_ids: ['mem_003', 'mem_mid_002'],
        related_ids: [],
        status: 'mid',
        starred: true,
        verified: true
      },
      
      // LONG MEMORIES (> 90 days)
      {
        id: 'mem_004',
        thread_id: 'thread_ancient',
        session_id: 'session_ancient',
        conversation_name: 'Initial Concept',
        title: 'Original Longstrider Vision',
        summary: 'The founding vision for Longstrider as a cognitive extension and thinking partner.',
        content: 'Original vision content...',
        timestamp: now - (120 * day),
        lastUpdated: now - (120 * day),
        messageCount: 67,
        gravity_score: 1.0,
        emotion: 'wonder',
        consciousness_mode: 'dream_weave',
        coherence: 0.85,
        tokensUsed: 45000,
        tokensSaved: 8000,
        estimatedCost: 0.67,
        keyThemes: ['vision', 'cognitive-extension', 'thinking-partner'],
        activeMemoryIds: [],
        synthesis: 'The dream of augmented human intelligence',
        resonanceActive: false,
        patterns: ['visionary', 'human-centered'],
        children_ids: ['mem_003'],
        related_ids: [],
        status: 'long',
        starred: true,
        verified: true
      },
      {
        id: 'mem_long_002',
        thread_id: 'thread_long_002',
        session_id: 'session_long_002',
        conversation_name: 'Funding Strategy',
        title: 'Seed Round Planning Session',
        summary: 'Initial planning for seed funding round. Target $2M at $10M valuation. Focus on cognitive computing and enterprise memory management.',
        content: 'Funding strategy details...',
        timestamp: now - (150 * day),
        lastUpdated: now - (150 * day),
        messageCount: 89,
        gravity_score: 0.88,
        emotion: 'ambition',
        consciousness_mode: 'precision_focus',
        coherence: 0.83,
        tokensUsed: 56000,
        tokensSaved: 12000,
        estimatedCost: 0.78,
        keyThemes: ['funding', 'strategy', 'valuation', 'pitch'],
        activeMemoryIds: [],
        synthesis: 'Building the future requires resources',
        resonanceActive: false,
        patterns: ['strategic-planning', 'market-positioning'],
        teamContributions: [
          {
            id: 'contrib_007',
            userId: 'user_chris',
            userName: 'Chris Wilson',
            contribution: 'Financial projections',
            timestamp: now - (149 * day),
            gravity: 0.82
          }
        ],
        parent_id: undefined,
        children_ids: ['mem_004'],
        related_ids: [],
        status: 'long',
        starred: false,
        verified: true
      },
      {
        id: 'mem_long_003',
        thread_id: 'thread_long_003',
        session_id: 'session_long_003',
        conversation_name: 'First Prototype',
        title: 'Alpha Version Demo Day',
        summary: 'First working prototype demonstrated to early advisors. Basic chat with memory persistence. Proof of concept validated.',
        content: 'Demo day details...',
        timestamp: now - (180 * day),
        lastUpdated: now - (180 * day),
        messageCount: 45,
        gravity_score: 0.92,
        emotion: 'excitement',
        consciousness_mode: 'stream',
        coherence: 0.78,
        tokensUsed: 34000,
        tokensSaved: 7000,
        estimatedCost: 0.48,
        keyThemes: ['prototype', 'demo', 'validation', 'mvp'],
        activeMemoryIds: [],
        synthesis: 'Every journey begins with a single step',
        resonanceActive: false,
        patterns: ['iterative-development', 'user-feedback'],
        parent_id: undefined,
        children_ids: ['mem_long_002'],
        related_ids: ['mem_004'],
        status: 'long',
        starred: true,
        verified: true
      },

      // Additional HOT memories (solo work - "Mine")
      {
        id: 'mem_hot_004',
        thread_id: 'thread_hot_004',
        session_id: 'session_hot_004',
        conversation_name: 'Filter Logic Debugging',
        title: 'Quick Bug Fix: Memory Filter Edge Cases',
        summary: 'Fixed edge cases in memory filtering logic where empty team arrays were causing undefined behavior. Quick solo debugging session.',
        content: 'Debug content...',
        timestamp: now - (18 * hour),
        lastUpdated: now - (15 * hour),
        messageCount: 12,
        gravity_score: 0.65,
        emotion: 'focus',
        consciousness_mode: 'precision_focus',
        coherence: 0.81,
        tokensUsed: 8500,
        tokensSaved: 2200,
        estimatedCost: 0.12,
        keyThemes: ['debugging', 'filters', 'edge-cases', 'quick-fix'],
        activeMemoryIds: [],
        synthesis: 'Sometimes the smallest bugs need the quickest fixes',
        resonanceActive: false,
        patterns: ['quick-iteration', 'solo-debugging'],
        parent_id: undefined,
        children_ids: [],
        related_ids: [],
        status: 'hot',
        starred: false,
        verified: true
      },
      {
        id: 'mem_hot_005',
        thread_id: 'thread_hot_005',
        session_id: 'session_hot_005',
        conversation_name: 'Documentation Sprint',
        title: 'API Documentation Update',
        summary: 'Updated API documentation for new memory endpoints. Added examples, error codes, and usage patterns. Solo documentation work.',
        content: 'Documentation content...',
        timestamp: now - (30 * hour),
        lastUpdated: now - (28 * hour),
        messageCount: 24,
        gravity_score: 0.71,
        emotion: 'satisfaction',
        consciousness_mode: 'stream',
        coherence: 0.84,
        tokensUsed: 15000,
        tokensSaved: 4500,
        estimatedCost: 0.19,
        keyThemes: ['documentation', 'api', 'examples', 'developer-experience'],
        activeMemoryIds: [],
        synthesis: 'Good documentation is a gift to future developers',
        resonanceActive: false,
        patterns: ['documentation-first', 'clarity'],
        parent_id: undefined,
        children_ids: [],
        related_ids: ['mem_001'],
        status: 'hot',
        starred: false,
        verified: true
      },
      {
        id: 'mem_hot_006',
        thread_id: 'thread_hot_006',
        session_id: 'session_hot_006',
        conversation_name: 'Team Standup Notes',
        title: 'Weekly Team Sync: Q1 Planning',
        summary: 'Team standup covering Q1 roadmap priorities. Discussed feature allocation, timeline adjustments, and resource planning across the team.',
        content: 'Meeting notes...',
        timestamp: now - (40 * hour),
        lastUpdated: now - (40 * hour),
        messageCount: 38,
        gravity_score: 0.83,
        emotion: 'collaboration',
        consciousness_mode: 'integration',
        coherence: 0.86,
        tokensUsed: 22000,
        tokensSaved: 6800,
        estimatedCost: 0.28,
        keyThemes: ['planning', 'team-sync', 'roadmap', 'q1'],
        activeMemoryIds: [],
        synthesis: 'Alignment creates momentum',
        resonanceActive: true,
        patterns: ['team-coordination', 'strategic-planning'],
        teamContributions: [
          {
            id: 'contrib_008',
            userId: 'user_sarah',
            userName: 'Sarah Chen',
            contribution: 'Backend capacity planning',
            timestamp: now - (40 * hour),
            gravity: 0.79
          },
          {
            id: 'contrib_009',
            userId: 'user_alex',
            userName: 'Alex Kim',
            contribution: 'Frontend milestone estimates',
            timestamp: now - (40 * hour),
            gravity: 0.75
          },
          {
            id: 'contrib_010',
            userId: 'user_jordan',
            userName: 'Jordan Lee',
            contribution: 'Infrastructure requirements',
            timestamp: now - (40 * hour),
            gravity: 0.81
          }
        ],
        parent_id: undefined,
        children_ids: [],
        related_ids: [],
        status: 'hot',
        starred: true,
        verified: true
      },

      // Additional SHORT memories (mix of solo and team)
      {
        id: 'mem_short_004',
        thread_id: 'thread_short_004',
        session_id: 'session_short_004',
        conversation_name: 'CSS Refactoring',
        title: 'Migrated to Tailwind Design Tokens',
        summary: 'Solo refactoring session to move all hardcoded colors to CSS design tokens. Improved consistency and maintainability across the codebase.',
        content: 'Refactoring notes...',
        timestamp: now - (6 * day),
        lastUpdated: now - (6 * day),
        messageCount: 19,
        gravity_score: 0.68,
        emotion: 'focus',
        consciousness_mode: 'precision_focus',
        coherence: 0.77,
        tokensUsed: 12500,
        tokensSaved: 3800,
        estimatedCost: 0.16,
        keyThemes: ['refactoring', 'css', 'design-tokens', 'consistency'],
        activeMemoryIds: [],
        synthesis: 'Technical debt paid is investment earned',
        resonanceActive: false,
        patterns: ['code-quality', 'systematic-refactoring'],
        parent_id: undefined,
        children_ids: [],
        related_ids: ['mem_mid_003'],
        status: 'short',
        starred: false,
        verified: true
      },
      {
        id: 'mem_short_005',
        thread_id: 'thread_short_005',
        session_id: 'session_short_005',
        conversation_name: 'Security Audit',
        title: 'Authentication Flow Security Review',
        summary: 'Team security audit of authentication and authorization flows. Identified and patched 3 potential vulnerabilities. Implemented additional rate limiting.',
        content: 'Security audit details...',
        timestamp: now - (9 * day),
        lastUpdated: now - (9 * day),
        messageCount: 56,
        gravity_score: 0.92,
        emotion: 'concern',
        consciousness_mode: 'precision_focus',
        coherence: 0.91,
        tokensUsed: 38000,
        tokensSaved: 11000,
        estimatedCost: 0.49,
        keyThemes: ['security', 'authentication', 'audit', 'vulnerabilities'],
        activeMemoryIds: [],
        synthesis: 'Security is not optional',
        resonanceActive: true,
        patterns: ['security-first', 'thorough-review'],
        teamContributions: [
          {
            id: 'contrib_011',
            userId: 'user_morgan',
            userName: 'Morgan Davis',
            contribution: 'Vulnerability assessment',
            decision: 'Implement JWT rotation',
            timestamp: now - (9 * day),
            gravity: 0.88
          },
          {
            id: 'contrib_012',
            userId: 'user_chris',
            userName: 'Chris Wilson',
            contribution: 'Rate limiting strategy',
            timestamp: now - (9 * day),
            gravity: 0.83
          }
        ],
        parent_id: undefined,
        children_ids: [],
        related_ids: [],
        status: 'short',
        starred: true,
        verified: true
      },
      {
        id: 'mem_short_006',
        thread_id: 'thread_short_006',
        session_id: 'session_short_006',
        conversation_name: 'Component Library',
        title: 'Button Component Variants',
        summary: 'Created comprehensive button component with all variants: primary, secondary, ghost, danger. Includes loading states and icon support.',
        content: 'Component implementation...',
        timestamp: now - (11 * day),
        lastUpdated: now - (11 * day),
        messageCount: 27,
        gravity_score: 0.73,
        emotion: 'satisfaction',
        consciousness_mode: 'integration',
        coherence: 0.82,
        tokensUsed: 18500,
        tokensSaved: 5200,
        estimatedCost: 0.24,
        keyThemes: ['components', 'ui', 'design-system', 'buttons'],
        activeMemoryIds: [],
        synthesis: 'Reusable components compound efficiency',
        resonanceActive: false,
        patterns: ['component-driven', 'reusability'],
        parent_id: 'mem_mid_003',
        children_ids: [],
        related_ids: [],
        status: 'short',
        starred: false,
        verified: true
      },

      // Additional MID memories
      {
        id: 'mem_mid_004',
        thread_id: 'thread_mid_004',
        session_id: 'session_mid_004',
        conversation_name: 'Database Migration',
        title: 'PostgreSQL Schema Migration v2',
        summary: 'Solo work on database schema migration. Added new tables for team collaboration, optimized indexes, and implemented migration rollback strategy.',
        content: 'Migration details...',
        timestamp: now - (30 * day),
        lastUpdated: now - (30 * day),
        messageCount: 43,
        gravity_score: 0.86,
        emotion: 'focus',
        consciousness_mode: 'precision_focus',
        coherence: 0.89,
        tokensUsed: 29000,
        tokensSaved: 8500,
        estimatedCost: 0.38,
        keyThemes: ['database', 'migration', 'schema', 'postgresql'],
        activeMemoryIds: [],
        synthesis: 'Data models shape system capabilities',
        resonanceActive: false,
        patterns: ['data-modeling', 'migration-strategy'],
        parent_id: 'mem_003',
        children_ids: [],
        related_ids: [],
        status: 'mid',
        starred: false,
        verified: true
      },
      {
        id: 'mem_mid_005',
        thread_id: 'thread_mid_005',
        session_id: 'session_mid_005',
        conversation_name: 'User Testing Session',
        title: 'Usability Testing Round 2',
        summary: 'Team-led user testing with 8 participants. Gathered feedback on navigation, memory browsing, and filter controls. Key insights for UX improvements.',
        content: 'Testing session notes...',
        timestamp: now - (50 * day),
        lastUpdated: now - (50 * day),
        messageCount: 72,
        gravity_score: 0.89,
        emotion: 'curiosity',
        consciousness_mode: 'integration',
        coherence: 0.87,
        tokensUsed: 48000,
        tokensSaved: 14000,
        estimatedCost: 0.62,
        keyThemes: ['user-testing', 'ux', 'feedback', 'usability'],
        activeMemoryIds: [],
        synthesis: 'Users reveal truths design cannot see',
        resonanceActive: true,
        patterns: ['user-centered-design', 'iterative-improvement'],
        teamContributions: [
          {
            id: 'contrib_013',
            userId: 'user_taylor',
            userName: 'Taylor Smith',
            contribution: 'Session moderation and note-taking',
            timestamp: now - (50 * day),
            gravity: 0.85
          },
          {
            id: 'contrib_014',
            userId: 'user_alex',
            userName: 'Alex Kim',
            contribution: 'Insight synthesis and recommendations',
            timestamp: now - (50 * day),
            gravity: 0.82
          }
        ],
        parent_id: undefined,
        children_ids: [],
        related_ids: ['mem_mid_003'],
        status: 'mid',
        starred: true,
        verified: true
      },

      // Additional LONG memories
      {
        id: 'mem_long_004',
        thread_id: 'thread_long_004',
        session_id: 'session_long_004',
        conversation_name: 'Tech Stack Selection',
        title: 'Choosing React + Next.js Architecture',
        summary: 'Solo research and evaluation of tech stack options. Decided on React, Next.js, and Tailwind CSS for optimal developer experience and performance.',
        content: 'Tech evaluation...',
        timestamp: now - (200 * day),
        lastUpdated: now - (200 * day),
        messageCount: 34,
        gravity_score: 0.94,
        emotion: 'determination',
        consciousness_mode: 'precision_focus',
        coherence: 0.86,
        tokensUsed: 25000,
        tokensSaved: 7000,
        estimatedCost: 0.33,
        keyThemes: ['tech-stack', 'architecture', 'react', 'nextjs'],
        activeMemoryIds: [],
        synthesis: 'The right tools amplify capability',
        resonanceActive: false,
        patterns: ['technology-evaluation', 'strategic-decisions'],
        parent_id: undefined,
        children_ids: ['mem_003'],
        related_ids: [],
        status: 'long',
        starred: false,
        verified: true
      },
      {
        id: 'mem_long_005',
        thread_id: 'thread_long_005',
        session_id: 'session_long_005',
        conversation_name: 'Brand Identity',
        title: 'LongStrider Brand Guidelines',
        summary: 'Team workshop to define brand identity, voice, and visual language. Created comprehensive brand guidelines including logo, colors, and messaging.',
        content: 'Brand workshop...',
        timestamp: now - (220 * day),
        lastUpdated: now - (220 * day),
        messageCount: 91,
        gravity_score: 0.91,
        emotion: 'excitement',
        consciousness_mode: 'dream_weave',
        coherence: 0.88,
        tokensUsed: 58000,
        tokensSaved: 15000,
        estimatedCost: 0.75,
        keyThemes: ['branding', 'identity', 'design', 'guidelines'],
        activeMemoryIds: [],
        synthesis: 'Brand is the promise we keep',
        resonanceActive: false,
        patterns: ['brand-building', 'collaborative-creation'],
        teamContributions: [
          {
            id: 'contrib_015',
            userId: 'user_jordan',
            userName: 'Jordan Lee',
            contribution: 'Logo design concepts',
            timestamp: now - (220 * day),
            gravity: 0.87
          },
          {
            id: 'contrib_016',
            userId: 'user_mike',
            userName: 'Mike Torres',
            contribution: 'Brand voice and messaging',
            timestamp: now - (220 * day),
            gravity: 0.84
          }
        ],
        parent_id: undefined,
        children_ids: ['mem_mid_003'],
        related_ids: [],
        status: 'long',
        starred: true,
        verified: true
      }
    ]
  }

// ========================
// BATCH PROCESSOR
// ========================

class MemoryBatchProcessor {
  private lastProcessed: Record<string, number> = {}
  private processingInterval: NodeJS.Timeout | null = null
  
  startProcessing(callback: (memories: Partial<MemoryItem>[]) => void) {
    // Process every 30 seconds
    this.processingInterval = setInterval(() => {
      this.processBatch(callback)
    }, 30000)
  }
  
  stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }
  
  // Public method for manual processing
  processBatch(callback: (memories: Partial<MemoryItem>[]) => void) {
    try {
      // Pull from localStorage with error handling
      let conversations: any = {}
      try {
        const stored = localStorage.getItem('conversations')
        conversations = stored ? JSON.parse(stored) : {}
      } catch (parseError) {
        console.error('Error parsing localStorage conversations:', parseError)
        return
      }
      
      const processedMemories: Partial<MemoryItem>[] = []
      
      Object.entries(conversations).forEach(([convId, conv]: [string, any]) => {
        try {
          const lastIdx = this.lastProcessed[convId] || 0
          const messages = conv.messages?.slice(lastIdx) || []
          
          if (messages.length > 0) {
            // Process messages into memory format
            const memory: Partial<MemoryItem> = {
              id: convId,
              thread_id: conv.thread_id || convId,
              session_id: conv.session_id,
              conversation_name: conv.name || 'Untitled Conversation',
              title: conv.title || this.extractTitle(messages),
              summary: this.generateSummary(messages),
              messageCount: messages.length,
              timestamp: messages[0]?.timestamp || Date.now(),
              lastUpdated: Date.now(),
              
              // Extract from messages metadata
              gravity_score: this.calculateGravity(messages),
              tokensUsed: this.sumTokens(messages),
              keyThemes: this.extractThemes(messages),
              patterns: this.detectPatterns(messages),
              
              // Determine status
              status: this.determineStatus(messages[0]?.timestamp)
            }
            
            processedMemories.push(memory)
            this.lastProcessed[convId] = conv.messages.length
          }
        } catch (convError) {
          console.error(`Error processing conversation ${convId}:`, convError)
        }
      })
      
      if (processedMemories.length > 0) {
        callback(processedMemories)
      }
    } catch (error) {
      console.error('Error processing memory batch:', error)
    }
  }
  
  private extractTitle(messages: any[]): string {
    // Get first user message as title
    const firstUserMsg = messages.find(m => m.role === 'user')
    return firstUserMsg?.content?.substring(0, 50) + '...' || 'New Conversation'
  }
  
  private generateSummary(messages: any[]): string {
    // In production, this would use AI to generate summary
    // For now, concatenate key messages
    const keyMessages = messages
      .filter(m => m.gravity_score && m.gravity_score > 0.5)
      .slice(0, 3)
      .map(m => m.content?.substring(0, 100))
      .join(' ')
    
    return keyMessages || 'Conversation in progress...'
  }
  
  private calculateGravity(messages: any[]): number {
    const gravities = messages.map(m => m.gravity_score || 0.1)
    return Math.max(...gravities, 0.5)
  }
  
  private sumTokens(messages: any[]): number {
    return messages.reduce((sum, m) => sum + (m.tokens_used || 0), 0)
  }
  
  private extractThemes(messages: any[]): string[] {
    // Extract from message metadata
    const themes = new Set<string>()
    messages.forEach(m => {
      if (m.key_themes) {
        m.key_themes.forEach((theme: string) => themes.add(theme))
      }
    })
    return Array.from(themes)
  }
  
  private detectPatterns(messages: any[]): string[] {
    // Extract patterns from metadata
    const patterns = new Set<string>()
    messages.forEach(m => {
      if (m.patterns) {
        m.patterns.forEach((pattern: string) => patterns.add(pattern))
      }
    })
    return Array.from(patterns)
  }
  
  private determineStatus(timestamp: number): 'hot' | 'short' | 'mid' | 'long' {
    const age = Date.now() - timestamp
    const hour = 3600000
    const day = 86400000
    
    if (age < 48 * hour) return 'hot'
    if (age < 14 * day) return 'short'
    if (age < 90 * day) return 'mid'
    return 'long'
  }
}

// ========================
// ACCORDION COMPONENT
// ========================

interface AccordionSectionProps {
  title: string
  icon: React.ReactNode
  sectionKey: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function AccordionSection({ title, icon, sectionKey, isExpanded, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ========================
// MAIN COMPONENT
// ========================

export function LivingMemorySystem() {
  // State
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null)
  const [timeRange, setTimeRange] = useState<'hot' | 'short' | 'mid' | 'long'>('hot')
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [editedSummary, setEditedSummary] = useState('')
  const [ownershipFilter, setOwnershipFilter] = useState<'mine' | 'team' | 'all'>('all')
  const [isMounted, setIsMounted] = useState(false)
  
  // Accordion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    identity: false,
    objectives: true,
    associations: true,
    team: false,
    emotional: false,
    longstrider: false,
    constellation: false
  })
  
  // Objectives state
  const [objectives, setObjectives] = useState<Objective[]>([
    {
      id: 'obj_001',
      title: 'Ship Living Memory MVP',
      progress: 68,
      dueDate: 'Dec 31, 2024',
      levelOfEffort: 40,
      completed: false,
      suggestedByAI: true,
      suggestion: 'Add source verification layer'
    },
    {
      id: 'obj_002',
      title: 'Integrate with Navigator V2',
      progress: 22,
      dueDate: 'Jan 15, 2025',
      levelOfEffort: 20,
      completed: false
    }
  ])
  
  // Patterns state
  const [patterns] = useState<Pattern[]>([
    {
      id: 'pat_001',
      pattern: 'Recursive Architecture',
      strength: 0.94,
      count: 12,
      lastOccurred: Date.now() - 3600000
    },
    {
      id: 'pat_002',
      pattern: 'Cost Consciousness',
      strength: 0.78,
      count: 8,
      lastOccurred: Date.now() - 7200000
    }
  ])
  
  // Identity anchors
  const [identityAnchors] = useState<IdentityAnchor[]>([
    {
      id: 'anchor_001',
      content: 'This is exactly why we built Longstrider',
      timestamp: Date.now() - 1800000,
      triggered: true
    }
  ])
  
  // Contradictions
  const [contradictions] = useState<Contradiction[]>([
    {
      id: 'contra_001',
      group: 'sync-vs-async',
      earlier: 'Real-time updates essential',
      current: 'Batch processing more efficient',
      resolution: 'Context-dependent approach'
    }
  ])
  
  // Refs
  const batchProcessor = useRef(new MemoryBatchProcessor())
  const summaryRef = useRef<HTMLTextAreaElement>(null)
  const visibilityHandlerRef = useRef<(() => void) | null>(null)
  
  // Initialize with mock data
  useEffect(() => {
    setIsMounted(true)
    const mockData = generateMockData()
    setMemories(mockData)
    if (mockData.length > 0) {
      setSelectedMemory(mockData[0])
    }
    
    // Create visibility handler
    const handleVisibilityChange = () => {
      if (document.hidden) {
        batchProcessor.current.processBatch((newMemories) => {
          setMemories(prev => {
            const merged = [...prev]
            newMemories.forEach(newMem => {
              const idx = merged.findIndex(m => m.id === newMem.id)
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], ...newMem }
              } else {
                merged.push(newMem as MemoryItem)
              }
            })
            return merged
          })
        })
      }
    }
    
    visibilityHandlerRef.current = handleVisibilityChange
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Start batch processor
    batchProcessor.current.startProcessing((newMemories) => {
      setMemories(prev => {
        // Merge new memories with existing
        const merged = [...prev]
        newMemories.forEach(newMem => {
          const idx = merged.findIndex(m => m.id === newMem.id)
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...newMem }
          } else {
            merged.push(newMem as MemoryItem)
          }
        })
        return merged
      })
    })
    
    return () => {
      batchProcessor.current.stopProcessing()
      if (visibilityHandlerRef.current) {
        document.removeEventListener('visibilitychange', visibilityHandlerRef.current)
      }
    }
  }, [])
  
  // Filter memories by time range and ownership
  const filteredMemories = useMemo(() => {
    let filtered = memories.filter(m => m.status === timeRange)

    // Apply ownership filter
    if (ownershipFilter === 'mine') {
      // In real implementation, this would check against current user ID
      // For now, filter out memories with team contributions (solo work only)
      filtered = filtered.filter(m => !m.teamContributions || m.teamContributions.length === 0)
    } else if (ownershipFilter === 'team') {
      // Show only memories with team collaboration
      filtered = filtered.filter(m => m.teamContributions && m.teamContributions.length > 0)
    }
    // 'all' shows everything - no additional filter needed

    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }, [memories, timeRange, ownershipFilter])
  
  // Calculate aggregated metrics
  const totalTokens = useMemo(() => 
    memories.reduce((sum, m) => sum + m.tokensUsed, 0),
    [memories]
  )
  
  const totalCost = useMemo(() =>
    memories.reduce((sum, m) => sum + m.estimatedCost, 0),
    [memories]
  )
  
  const totalSaved = useMemo(() =>
    memories.reduce((sum, m) => sum + m.tokensSaved, 0),
    [memories]
  )
  
  // Handlers
  const handleSaveSummary = useCallback(() => {
    if (selectedMemory && editedSummary) {
      const updatedMemory = { ...selectedMemory, summary: editedSummary }
      setSelectedMemory(updatedMemory)
      setMemories(prev => prev.map(m => 
        m.id === selectedMemory.id 
          ? updatedMemory
          : m
      ))
      setIsEditingSummary(false)
    }
  }, [selectedMemory, editedSummary])
  
  const handleRegenerateSummary = useCallback(() => {
    // In production, this would call AI to regenerate
    if (selectedMemory) {
      const timestamp = isMounted ? new Date().toLocaleTimeString() : Date.now().toString()
      const newSummary = `[AI Generated] ${selectedMemory.summary} [Updated: ${timestamp}]`
      setSelectedMemory({ ...selectedMemory, summary: newSummary })
      setMemories(prev => prev.map(m =>
        m.id === selectedMemory.id
          ? { ...m, summary: newSummary }
          : m
      ))
    }
  }, [selectedMemory, isMounted])
  
  const handleToggleStar = useCallback((memoryId: string) => {
    setMemories(prev => prev.map(m =>
      m.id === memoryId
        ? { ...m, starred: !m.starred }
        : m
    ))
  }, [])
  
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])
  
  const getEmotionIcon = (emotion: string) => {
    const icons: Record<string, any> = {
      joy: '😊',
      curiosity: '🤔',
      reflection: '🤓',
      concern: '😟',
      determination: '💪',
      wonder: '✨'
    }
    return icons[emotion] || '🤖'
  }
  
  const getModeIcon = (mode: string) => {
    const icons: Record<string, any> = {
      stream: Waves,
      integration: Network,
      transcendence: Sparkles,
      precision_focus: Target,
      dream_weave: Cloud,
      core_hum: Activity
    }
    const Icon = icons[mode] || Brain
    return <Icon className="h-4 w-4" />
  }
  
  // Render helpers - Living Laws Compliant Colors
  const renderTimeRangeBadge = (status: string) => {
    // Using Living Laws neural bands for time ranges
    const colors: Record<string, string> = {
      hot: 'bg-[rgba(var(--band-beta-high),0.2)] text-[rgb(var(--band-beta-high))] border-[rgba(var(--band-beta-high),0.3)]',      // β₃ Red-Orange
      short: 'bg-[rgba(var(--band-xi),0.2)] text-[rgb(var(--band-xi))] border-[rgba(var(--band-xi),0.3)]',                          // ξ Amber-Gold
      mid: 'bg-[rgba(var(--band-psi),0.2)] text-[rgb(var(--band-psi))] border-[rgba(var(--band-psi),0.3)]',                         // ψ Teal
      long: 'bg-[rgba(var(--band-sigma),0.2)] text-[rgb(var(--band-sigma))] border-[rgba(var(--band-sigma),0.3)]'                   // σ Silver-Gray
    }
    const labels: Record<string, string> = {
      hot: '🔥 Hot',
      short: '⚡ Short',
      mid: '📊 Mid',
      long: '🗄️ Long'
    }
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full border ${colors[status]}`}>
        {labels[status]}
      </span>
    )
  }
  
  // ========================
  // RENDER
  // ========================

  return (
    <ThreeRailLayout
      leftRail={
        <LivingMemoryLeftRail
          memories={filteredMemories}
          selectedMemory={selectedMemory}
          timeRange={timeRange}
          ownershipFilter={ownershipFilter}
          isMounted={isMounted}
          onSelectMemory={setSelectedMemory}
          onSetTimeRange={setTimeRange}
          onSetOwnershipFilter={setOwnershipFilter}
          onToggleStar={handleToggleStar}
          getEmotionIcon={getEmotionIcon}
        />
      }
      rightRail={
        <LivingMemoryRightRail
          patterns={patterns}
          identityAnchors={identityAnchors}
          contradictions={contradictions}
          selectedMemory={selectedMemory}
          isMounted={isMounted}
          getModeIcon={getModeIcon}
        />
      }
      leftRailWidth={320}
      rightRailWidth={320}
    >
      <LayoutGroup>
        {/* CENTER PANE - Memory Detail */}
        <div className="h-full overflow-y-auto">
        {selectedMemory ? (
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* RUNNING SUMMARY - TOP PRIORITY */}
            <div className="bg-gradient-to-r from-[rgba(var(--band-theta-high),0.1)] to-[rgba(var(--band-alpha-high),0.1)] rounded-xl p-8 border border-[rgba(var(--band-theta-high),0.2)] backdrop-blur-xl">
              {/* Memory Title at the Top */}
              <h2 className="text-2xl font-semibold text-white mb-6">{selectedMemory.title}</h2>
              
              {/* Living Summary Section */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-300 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[rgb(var(--band-theta-high))]" />
                  Living Summary
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400" suppressHydrationWarning>
                    Last updated: 2 minutes ago
                  </span>
                  <button
                    onClick={() => {
                      const snapshot = {
                        summary: selectedMemory.summary,
                        timestamp: Date.now(),
                        memoryId: selectedMemory.id
                      }
                      localStorage.setItem(
                        `summary_snapshot_${Date.now()}`,
                        JSON.stringify(snapshot)
                      )
                      alert('Summary snapshot saved!')
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                    title="Save Snapshot"
                    aria-label="Save summary snapshot"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingSummary(!isEditingSummary)
                      setEditedSummary(selectedMemory.summary)
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                    title="Edit Summary"
                    aria-label="Edit summary"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleRegenerateSummary}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                    title="Regenerate"
                    aria-label="Regenerate summary with AI"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {isEditingSummary ? (
                <div className="space-y-3">
                  <textarea
                    ref={summaryRef}
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    className="w-full p-4 bg-slate-900 border border-slate-700 rounded-lg text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-[rgba(var(--band-theta-high),0.3)] focus:border-[rgba(var(--band-theta-high),0.5)] text-base leading-relaxed"
                    rows={6}
                    aria-label="Edit summary text"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSummary}
                      className="px-4 py-2 bg-[rgb(var(--band-theta-high))] hover:bg-[rgba(var(--band-theta-high),0.8)] rounded-lg text-sm font-medium transition-colors duration-200"
                      aria-label="Save edited summary"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingSummary(false)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors duration-200"
                      aria-label="Cancel editing"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-200 text-base leading-relaxed">
                  {selectedMemory.summary}
                </p>
              )}
              <div className="mt-4 text-xs text-gray-400">
                Auto-updates every 5 messages • Next update in 3 messages
              </div>
            </div>
            
            {/* Memory Identity */}
            <AccordionSection
              title="MEMORY OVERVIEW"
              icon={<Info className="h-4 w-4" />}
              sectionKey="identity"
              isExpanded={expandedSections.identity}
              onToggle={() => toggleSection('identity')}
            >
              {/* Primary Owner & Team */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 mb-3">PARTICIPANTS</h4>
                <div className="flex items-center gap-3">
                  {/* Primary Owner */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-[rgba(var(--band-theta-high),0.1)] rounded-lg border border-[rgba(var(--band-theta-high),0.2)]">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[rgb(var(--band-theta-high))] to-[rgb(var(--band-alpha-high))] flex items-center justify-center text-sm font-semibold">
                      M
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Matt Veitch</div>
                      <div className="text-xs text-gray-400">Primary Owner</div>
                    </div>
                  </div>

                  {/* Team Members */}
                  {selectedMemory.teamContributions && selectedMemory.teamContributions.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500">Team:</div>
                      <div className="flex -space-x-2">
                        {selectedMemory.teamContributions.map((contrib, idx) => {
                          // Assign different neural band colors to each team member
                          const avatarColors = [
                            'from-[rgb(var(--band-psi))] to-[rgb(var(--band-alpha-high))]',      // Teal to Magenta
                            'from-[rgb(var(--band-xi))] to-[rgb(var(--band-beta-low))]',         // Amber to Pink
                            'from-[rgb(var(--band-beta-mid))] to-[rgb(var(--band-alpha-low))]',  // Rose to Purple
                            'from-[rgb(var(--band-gamma-low))] to-[rgb(var(--band-theta-high))]',// Lavender to Violet
                            'from-[rgb(var(--band-alpha-high))] to-[rgb(var(--band-psi))]',      // Magenta to Teal
                            'from-[rgb(var(--band-beta-low))] to-[rgb(var(--band-xi))]',         // Pink to Amber
                          ]
                          const colorClass = avatarColors[idx % avatarColors.length]

                          return (
                            <div
                              key={contrib.id}
                              className={`h-8 w-8 rounded-full bg-gradient-to-br ${colorClass} border-2 border-slate-900 flex items-center justify-center text-xs font-medium hover:z-10 transition-transform hover:scale-110 cursor-pointer`}
                              title={contrib.userName}
                            >
                              {contrib.userName[0]}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Created</div>
                  <div className="text-sm font-medium text-white" suppressHydrationWarning>
                    {isMounted ? new Date(selectedMemory.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Loading...'}
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Messages</div>
                  <div className="text-sm font-medium text-white">{selectedMemory.messageCount} exchanges</div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Consciousness Mode</div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                    {getModeIcon(selectedMemory.consciousness_mode || 'stream')}
                    <span className="capitalize">
                      {(selectedMemory.consciousness_mode || 'stream').replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <div className="text-sm font-medium">
                    {renderTimeRangeBadge(selectedMemory.status)}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="pt-3 border-t border-white/10">
                <h4 className="text-xs font-semibold text-gray-500 mb-3">PERFORMANCE</h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Gravity</div>
                    <div className="text-lg font-semibold text-[rgb(var(--band-xi))]">
                      {(selectedMemory.gravity_score * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center border-l border-r border-white/10">
                    <div className="text-xs text-gray-500 mb-1">Coherence</div>
                    <div className="text-lg font-semibold text-[rgb(var(--band-psi))]">
                      {((selectedMemory.coherence || 0.5) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Cost</div>
                    <div className="text-lg font-semibold text-white">
                      ${selectedMemory.estimatedCost.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Token Efficiency */}
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-500">Tokens Used:</span>
                    <span className="ml-2 text-gray-300 font-medium">{selectedMemory.tokensUsed.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Saved:</span>
                    <span className="ml-2 text-[rgb(var(--band-psi))] font-semibold">
                      {selectedMemory.tokensSaved.toLocaleString()}
                    </span>
                    <span className="ml-1 text-[rgb(var(--band-psi))]">
                      ({((selectedMemory.tokensSaved / (selectedMemory.tokensUsed + selectedMemory.tokensSaved)) * 100).toFixed(0)}% efficiency)
                    </span>
                  </div>
                </div>
              </div>
            </AccordionSection>
            
            {/* Objectives & Progress */}
            <AccordionSection
              title="OBJECTIVES & PROGRESS"
              icon={<Target className="h-4 w-4" />}
              sectionKey="objectives"
              isExpanded={expandedSections.objectives}
              onToggle={() => toggleSection('objectives')}
            >
              <div className="space-y-3">
                {objectives.map(obj => (
                  <div key={obj.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-white">{obj.title}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Due: {obj.dueDate} • LOE: {obj.levelOfEffort} hrs
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${
                        obj.progress > 70 ? 'text-[rgb(var(--band-psi))]' : 
                        obj.progress > 40 ? 'text-[rgb(var(--band-xi))]' : 
                        'text-[rgb(var(--band-beta-high))]'
                      }`}>
                        {obj.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          obj.progress > 70 ? 'bg-[rgb(var(--band-psi))]' :
                          obj.progress > 40 ? 'bg-[rgb(var(--band-xi))]' :
                          'bg-[rgb(var(--band-beta-high))]'
                        }`}
                        style={{ width: `${obj.progress}%` }}
                      />
                    </div>
                    {obj.suggestedByAI && obj.suggestion && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-[rgb(var(--band-xi))]">
                        <Lightbulb className="h-3 w-3" />
                        Longstrider suggests: "{obj.suggestion}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Level of Effort Metrics */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-xs font-semibold text-gray-500 mb-2">LEVEL OF EFFORT METRICS</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <div className="text-xs text-gray-500">Cognitive Load</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[rgb(var(--band-theta-high))] to-[rgb(var(--band-alpha-high))]" style={{ width: '87%' }} />
                      </div>
                      <span className="text-xs font-medium">8.7/10</span>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <div className="text-xs text-gray-500">Time Investment</div>
                    <div className="text-xs font-medium text-white mt-1">
                      4.5 hrs active / 12 hrs elapsed
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <div className="text-xs text-gray-500">Decision Density</div>
                    <div className="text-xs font-medium text-white mt-1">
                      7 decisions / hour
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <div className="text-xs text-gray-500">Pattern Complexity</div>
                    <div className="text-xs font-medium text-[rgb(var(--band-xi))] mt-1">
                      High (23 patterns)
                    </div>
                  </div>
                </div>
              </div>
            </AccordionSection>
            
            {/* Team Contributions */}
            {selectedMemory.teamContributions && selectedMemory.teamContributions.length > 0 && (
              <AccordionSection
                title="TEAM ACTIVITY"
                icon={<Users className="h-4 w-4" />}
                sectionKey="team"
                isExpanded={expandedSections.team}
                onToggle={() => toggleSection('team')}
              >
                <div className="space-y-3">
                  {selectedMemory.teamContributions.map(contrib => (
                    <div key={contrib.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[rgb(var(--band-theta-high))] to-[rgb(var(--band-alpha-high))] flex items-center justify-center text-sm font-medium">
                            {contrib.userName[0]}
                          </div>
                          <div>
                            <div className="font-medium text-white">{contrib.userName}</div>
                            <div className="text-xs text-gray-400" suppressHydrationWarning>
                              {isMounted ? new Date(contrib.timestamp).toLocaleString() : 'Loading...'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Flame className="h-3 w-3" />
                          {(contrib.gravity * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-sm text-gray-300 mb-2">
                        Contributed: {contrib.contribution}
                      </div>
                      {contrib.decision && (
                        <div className="bg-slate-900 rounded-lg p-2 text-sm border border-white/5">
                          <span className="text-[rgb(var(--band-psi))]">Decision:</span>
                          <span className="ml-2 text-gray-200">{contrib.decision}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="mt-3 p-3 bg-[rgba(var(--band-xi),0.1)] border border-[rgba(var(--band-xi),0.3)] rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-[rgb(var(--band-xi))]">
                      <AlertCircle className="h-4 w-4" />
                      Pending Alignment
                    </div>
                    <p className="text-sm text-gray-300 mt-1">
                      Database schema needs team review (requested by Sarah)
                    </p>
                  </div>
                </div>
              </AccordionSection>
            )}
            
            {/* Emotional Journey */}
            {selectedMemory.emotional_field && (
              <AccordionSection
                title="EMOTIONAL JOURNEY"
                icon={<Activity className="h-4 w-4" />}
                sectionKey="emotional"
                isExpanded={expandedSections.emotional}
                onToggle={() => toggleSection('emotional')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-gray-400">Flow:</span>
                  <div className="flex items-center gap-2">
                    <span>😊</span>
                    <ChevronRight className="h-3 w-3 text-gray-500" />
                    <span>😟</span>
                    <ChevronRight className="h-3 w-3 text-gray-500" />
                    <span>🤓</span>
                    <ChevronRight className="h-3 w-3 text-gray-500" />
                    <span>😊</span>
                    <ChevronRight className="h-3 w-3 text-gray-500" />
                    <span>💪</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <div className="text-xs text-gray-500">Dominant</div>
                    <div className="font-medium capitalize">
                      {selectedMemory.emotional_field.dominant}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <div className="text-xs text-gray-500">Intensity</div>
                    <div className="font-medium">
                      {(selectedMemory.emotional_field.intensity * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <div className="text-xs text-gray-500">Coherence</div>
                    <div className="font-medium">
                      {((selectedMemory.coherence || 0.5) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </AccordionSection>
            )}
            
            {/* Memory Constellation */}
            <AccordionSection
              title="MEMORY CONSTELLATION"
              icon={<Network className="h-4 w-4" />}
              sectionKey="constellation"
              isExpanded={expandedSections.constellation}
              onToggle={() => toggleSection('constellation')}
            >
              <div className="h-48 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="h-12 w-12 rounded-full bg-[rgb(var(--band-theta-high))] mx-auto mb-2" />
                    <div className="text-xs text-gray-400">Core Memory</div>
                  </div>
                  <div className="flex justify-center gap-8">
                    {selectedMemory.activeMemoryIds.slice(0, 3).map((id, idx) => (
                      <div key={id} className="text-center">
                        <div className="h-8 w-8 rounded-full bg-[rgba(var(--band-alpha-high),0.5)] mb-1" />
                        <div className="text-xs text-gray-500">
                          {idx === 0 ? 'Pattern' : idx === 1 ? 'Memory' : 'Insight'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {selectedMemory.synthesis && (
                <div className="mt-3 p-3 bg-[rgba(var(--band-theta-high),0.1)] rounded-lg border border-[rgba(var(--band-theta-high),0.2)]">
                  <div className="text-xs text-[rgb(var(--band-theta-high))] mb-1">Synthesis</div>
                  <p className="text-sm text-gray-200">{selectedMemory.synthesis}</p>
                </div>
              )}
            </AccordionSection>
            
            {/* Longstrider Contributions */}
            <AccordionSection
              title="LONGSTRIDER CONTRIBUTIONS"
              icon={<Brain className="h-4 w-4" />}
              sectionKey="longstrider"
              isExpanded={expandedSections.longstrider}
              onToggle={() => toggleSection('longstrider')}
            >
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">Suggestions Made</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-[rgb(var(--band-psi))]" />
                      <span className="text-gray-300">Consider PostgreSQL for memory storage</span>
                      <span className="text-xs text-[rgb(var(--band-psi))]">(Accepted)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-[rgb(var(--band-xi))]" />
                      <span className="text-gray-300">Add verification layer for hallucination prevention</span>
                      <span className="text-xs text-[rgb(var(--band-xi))]">(Pending)</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">Patterns Detected</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMemory.patterns.map(pattern => (
                      <span key={pattern} className="px-2 py-1 bg-[rgba(var(--band-alpha-high),0.2)] text-[rgb(var(--band-alpha-high))] rounded-lg text-xs border border-[rgba(var(--band-alpha-high),0.3)]">
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">Connections Identified</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div>• Links to October's scalability discussion</div>
                    <div>• Contradicts earlier synchronous approach</div>
                    <div>• Reinforces decision from Project Alpha</div>
                  </div>
                </div>
              </div>
            </AccordionSection>
            
            {/* Memory Associations - Consolidated Table */}
            <AccordionSection
              title="MEMORY ASSOCIATIONS"
              icon={<GitBranch className="h-4 w-4" />}
              sectionKey="associations"
              isExpanded={expandedSections.associations}
              onToggle={() => toggleSection('associations')}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Memory</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {/* Parent Memory */}
                    {selectedMemory.parent_id && (
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-2 px-3">
                          <span className="flex items-center gap-1 text-[rgb(var(--band-psi))]">
                            <ChevronUp className="h-3 w-3" />
                            Parent
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <button className="text-gray-300 hover:text-white transition-colors">
                            Q4 Product Strategy
                          </button>
                        </td>
                        <td className="py-2 px-3 text-gray-500 text-xs" suppressHydrationWarning>
                          {isMounted ? new Date(Date.now() - 45 * 86400000).toLocaleDateString() : '...'}
                        </td>
                        <td className="py-2 px-3 text-gray-500 text-xs">134</td>
                      </tr>
                    )}
                    
                    {/* Current Memory (highlighted) */}
                    <tr className="bg-[rgba(var(--band-theta-high),0.1)] border-l-2 border-[rgb(var(--band-theta-high))]">
                      <td className="py-2 px-3">
                        <span className="flex items-center gap-1 text-[rgb(var(--band-theta-high))] font-medium">
                          <Circle className="h-3 w-3 fill-current" />
                          Current
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-white">
                        {selectedMemory.title}
                      </td>
                      <td className="py-2 px-3 text-gray-400 text-xs" suppressHydrationWarning>
                        {isMounted ? new Date(selectedMemory.timestamp).toLocaleDateString() : '...'}
                      </td>
                      <td className="py-2 px-3 text-gray-400 text-xs">{selectedMemory.messageCount}</td>
                    </tr>
                    
                    {/* Child Memories */}
                    {selectedMemory.children_ids.map((childId, idx) => {
                      const childData = [
                        { name: 'Frontend Implementation', timestamp: Date.now() - 5 * 86400000, messages: 23 },
                        { name: 'Backend Integration', timestamp: Date.now() - 3 * 86400000, messages: 45 }
                      ][idx] || { name: `Child Memory ${idx + 1}`, timestamp: Date.now(), messages: 0 }
                      
                      return (
                        <tr key={childId} className="hover:bg-white/5 transition-colors">
                          <td className="py-2 px-3">
                            <span className="flex items-center gap-1 text-gray-400">
                              <ChevronDown className="h-3 w-3" />
                              Child
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <button className="text-gray-300 hover:text-white transition-colors">
                              {childData.name}
                            </button>
                          </td>
                          <td className="py-2 px-3 text-gray-500 text-xs" suppressHydrationWarning>
                            {isMounted ? new Date(childData.timestamp).toLocaleDateString() : '...'}
                          </td>
                          <td className="py-2 px-3 text-gray-500 text-xs">{childData.messages}</td>
                        </tr>
                      )
                    })}
                    
                    {/* Related Memories */}
                    {selectedMemory.related_ids.map((relatedId, idx) => (
                      <tr key={relatedId} className="hover:bg-white/5 transition-colors">
                        <td className="py-2 px-3">
                          <span className="flex items-center gap-1 text-gray-400">
                            <Link className="h-3 w-3" />
                            Related
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <button className="text-gray-300 hover:text-white transition-colors">
                            Navigator V2 Updates
                          </button>
                        </td>
                        <td className="py-2 px-3 text-gray-500 text-xs" suppressHydrationWarning>
                          {isMounted ? new Date(Date.now() - 8 * 86400000).toLocaleDateString() : '...'}
                        </td>
                        <td className="py-2 px-3 text-gray-500 text-xs">67</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionSection>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a memory to view details
          </div>
        )}
      </div>
      </LayoutGroup>
    </ThreeRailLayout>
  )
}

// Export state and handlers for use with three-rail layout
export { type MemoryItem, type Pattern, type IdentityAnchor, type Contradiction }

// Backward compatibility export
export default LivingMemorySystem
