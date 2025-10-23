/**
 * Mock data generator for Space features
 * Simulates real activity, tokens, and evolution until backend is connected
 */

import type { SpaceActivity, Space } from '@/stores/consciousness-store'

/**
 * Generate mock token usage based on Space activity
 */
export function generateMockTokens(space: Space): {
  tokens_used: number
  tokens_saved: number
  estimated_cost: number
} {
  const baseTokens = space.analytics.message_count * 2000 // ~2K tokens per interaction
  const complexityMultiplier = 1 + (space.analytics.complexity_score / 10)
  
  const tokens_used = Math.round(baseTokens * complexityMultiplier)
  const tokens_saved = Math.round(tokens_used * 0.3) // Mock 30% savings from context management
  const estimated_cost = tokens_used * 0.00002 // $0.02 per 1K tokens (rough GPT-4 pricing)
  
  return {
    tokens_used,
    tokens_saved,
    estimated_cost
  }
}

/**
 * Generate mock activity feed
 */
export function generateMockActivity(space: Space): SpaceActivity[] {
  const activities: SpaceActivity[] = []
  const now = Date.now()
  
  // Generate based on message count
  if (space.analytics.message_count > 0) {
    activities.push({
      id: crypto.randomUUID(),
      type: 'message',
      content: 'You started exploring this thought space',
      timestamp: now - (space.analytics.message_count * 60000), // spread out over time
      gravity: 0.4
    })
  }
  
  if (space.analytics.message_count > 5) {
    activities.push({
      id: crypto.randomUUID(),
      type: 'pattern',
      content: 'Pattern detected: increasing complexity in your reasoning',
      timestamp: now - 30000,
      gravity: 0.6
    })
  }
  
  if (space.analytics.gravity_score > 0.5) {
    activities.push({
      id: crypto.randomUUID(),
      type: 'insight',
      content: 'High-gravity moment captured: breakthrough thinking',
      timestamp: now - 15000,
      gravity: 0.8,
      emotion: 'excited'
    })
  }
  
  if (space.meta_memory && space.meta_memory.consciousness_snapshots.length > 0) {
    activities.push({
      id: crypto.randomUUID(),
      type: 'memory',
      content: `Consciousness snapshot saved: ${space.meta_memory.consciousness_snapshots[0].patternDetected}`,
      timestamp: now - 5000,
      gravity: 0.7
    })
  }
  
  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
}

/**
 * Simulate activity over time (for demo)
 */
export function simulateSpaceActivity(space: Space) {
  // Increment message count
  const newMessageCount = space.analytics.message_count + 1
  const newWordCount = space.analytics.word_count + Math.floor(Math.random() * 100 + 50)
  
  // Update complexity based on activity
  const newComplexity = Math.min(10, space.analytics.complexity_score + 0.1)
  
  // Gravity might spike
  const gravityDelta = (Math.random() - 0.5) * 0.2
  const newGravity = Math.max(0, Math.min(1, space.analytics.gravity_score + gravityDelta))
  
  // Generate new activity
  const newActivity: SpaceActivity = {
    id: crypto.randomUUID(),
    type: Math.random() > 0.7 ? 'insight' : 'message',
    content: Math.random() > 0.7 
      ? 'New insight: Your thinking is evolving on this topic'
      : 'You continued the conversation',
    timestamp: Date.now(),
    gravity: newGravity,
    emotion: newGravity > 0.6 ? 'curious' : undefined
  }
  
  const mockTokens = generateMockTokens({
    ...space,
    analytics: {
      ...space.analytics,
      message_count: newMessageCount
    }
  })
  
  return {
    analytics: {
      ...space.analytics,
      message_count: newMessageCount,
      word_count: newWordCount,
      complexity_score: newComplexity,
      gravity_score: newGravity,
      ...mockTokens
    },
    recent_activity: [newActivity, ...space.recent_activity].slice(0, 10)
  }
}

/**
 * Add mock meta_memory for evolution panels
 */
export function enrichSpaceWithEvolution(space: Space): Partial<Space> {
  if (space.analytics.message_count < 3) return {}
  
  return {
    meta_memory: {
      trending_patterns: [
        'Your questions are getting more specific and targeted',
        'You\'re connecting ideas across multiple domains',
        'Your thinking has shifted from theoretical to practical'
      ].slice(0, Math.min(3, Math.floor(space.analytics.message_count / 5))),
      aggregate_gravity: space.analytics.gravity_score,
      dominant_concepts: ['decision-making', 'strategic thinking', 'self-awareness'],
      consciousness_snapshots: [
        {
          id: crypto.randomUUID(),
          messageIndex: Math.floor(space.analytics.message_count / 2),
          gravitySpike: true,
          patternDetected: 'Breakthrough moment detected',
          timestamp: Date.now() - 60000
        }
      ]
    }
  }
}
