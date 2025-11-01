// Conversational Space Creation Interview
// Leverages cognitive profile to guide users through space setup
// Outputs: Space configuration that becomes "living .md prompt" for LLM

import type { CognitiveProfile } from "./cognitive-profile"
import type { Space } from "@/stores/consciousness-store"
import { syncHierarchyToThreads } from "./sync-space-to-thread"

export interface SpaceCreationQuestion {
  id: string
  question: string
  category: "goal" | "motivation" | "structure" | "success" | "mode" | "timeline"
  followUp?: string
  adaptToProfile?: (profile: CognitiveProfile) => string
}

export interface SpaceCreationResponse {
  questionId: string
  answer: string
  timestamp: number
}

export interface SpaceConfiguration {
  // Core Identity
  name: string
  description: string
  goal: string
  motivation: string

  // Structure (Parent → Child → Grandchild)
  hierarchy: {
    parent: string
    children: Array<{
      name: string
      description: string
      grandchildren?: Array<{
        name: string
        description: string
      }>
    }>
  }

  // Success Metrics
  successCriteria: string[]
  milestones: Array<{
    name: string
    description: string
    targetDate?: string
  }>

  // Thought Partner Configuration
  mode: "tactical" | "creative" | "exploratory" | "analytical" | "supportive"
  personaWeights: {
    phd: number
    strategist: number
    architect: number
    companion: number
    lover: number
  }

  // Communication Preferences (from cognitive profile)
  communicationStyle: {
    directness: number // 0-10
    depth: number // 0-10
    pace: "fast" | "moderate" | "deep"
    feedbackStyle: "direct" | "gentle" | "balanced"
  }

  // Tracking & Learning
  trackingPreferences: {
    progressUpdates: "frequent" | "moderate" | "minimal"
    insightSharing: boolean
    timeTracking: boolean
    effortTracking: boolean
  }

  // Living Prompt Context
  contextPrompt: string // Generated from all above
}

// Interview Questions (adapt based on cognitive profile)
export const spaceCreationQuestions: SpaceCreationQuestion[] = [
  {
    id: "goal",
    question: "What do you want to accomplish?",
    category: "goal",
    adaptToProfile: (profile) => {
      if (profile?.thinkingStyle?.includes("visual")) {
        return "What do you want to create or achieve?"
      }
      if (profile?.thinkingStyle?.includes("analytical")) {
        return "What's the specific outcome you're working toward?"
      }
      return "What do you want to accomplish?"
    },
  },
  {
    id: "motivation",
    question: "Why does this matter?",
    category: "motivation",
    adaptToProfile: (profile) => {
      if (profile?.motivationStyle?.includes("impact")) {
        return "What impact will this have?"
      }
      if (profile?.motivationStyle?.includes("growth")) {
        return "How will this help you grow?"
      }
      return "Why does this matter?"
    },
  },
  {
    id: "breakdown",
    question: "What are the main parts or steps?",
    category: "structure",
    adaptToProfile: (profile) => {
      if (profile?.organizationStyle?.includes("linear")) {
        return "What are the key steps?"
      }
      if (profile?.organizationStyle?.includes("systems")) {
        return "What are the main components?"
      }
      return "What are the main parts or steps?"
    },
  },
  {
    id: "success_metrics",
    question: "How will you measure progress?",
    category: "success",
    adaptToProfile: (profile) => {
      if (profile?.feedbackPreferences?.includes("data")) {
        return "What metrics will show progress?"
      }
      if (profile?.feedbackPreferences?.includes("qualitative")) {
        return "What will you notice when making progress?"
      }
      return "How will you measure progress?"
    },
  },
  {
    id: "mode",
    question: "What mode: tactical, creative, analytical, or supportive?",
    category: "mode",
    adaptToProfile: (profile) => {
      return "What mode works best: tactical, creative, analytical, or supportive?"
    },
  },
  {
    id: "timeline",
    question: "Timeline: days, weeks, months, or ongoing?",
    category: "timeline",
    adaptToProfile: (profile) => {
      if (profile?.workContext?.includes("deadline-driven")) {
        return "What's your deadline?"
      }
      return "Timeline: days, weeks, months, or ongoing?"
    },
  },
]

// Generate Space Configuration from Interview Responses
export function generateSpaceConfiguration(
  responses: SpaceCreationResponse[],
  cognitiveProfile: CognitiveProfile,
): SpaceConfiguration {
  const getResponse = (questionId: string) => responses.find((r) => r.questionId === questionId)?.answer || ""

  const goal = getResponse("goal")
  const motivation = getResponse("motivation")
  const breakdown = getResponse("breakdown")
  const successMetrics = getResponse("success_metrics")
  const mode = getResponse("mode")
  const timeline = getResponse("timeline")

  // Parse hierarchy from breakdown response
  const hierarchy = parseHierarchy(breakdown)

  // Parse success criteria
  const successCriteria = parseSuccessCriteria(successMetrics)

  // Determine mode and persona weights
  const { selectedMode, personaWeights } = determineMode(mode, cognitiveProfile)

  // Generate living prompt context
  const contextPrompt = generateContextPrompt({
    goal,
    motivation,
    hierarchy,
    successCriteria,
    mode: selectedMode,
    cognitiveProfile,
    timeline,
  })

  return {
    name: extractSpaceName(goal),
    description: goal,
    goal,
    motivation,
    hierarchy,
    successCriteria,
    milestones: generateMilestones(hierarchy, timeline),
    mode: selectedMode,
    personaWeights,
    communicationStyle: {
      directness: cognitiveProfile.communicationPreferences?.directness || 5,
      depth: cognitiveProfile.communicationPreferences?.depth || 5,
      pace: cognitiveProfile.communicationPreferences?.pace || "moderate",
      feedbackStyle: (cognitiveProfile.feedbackPreferences?.[0] as any) || "balanced",
    },
    trackingPreferences: {
      progressUpdates: "moderate",
      insightSharing: true,
      timeTracking: true,
      effortTracking: true,
    },
    contextPrompt,
  }
}

// Helper: Parse hierarchy from natural language
// Supports: indentation, bullets, > separators, numbered lists
function parseHierarchy(breakdown: string): SpaceConfiguration["hierarchy"] {
  if (!breakdown.trim()) {
    return {
      parent: "Main Goal",
      children: [],
    }
  }

  const lines = breakdown.split("\n").filter((l) => l.trim())
  
  // Detect hierarchy format
  const hasIndentation = lines.some(l => l.match(/^\s{2,}/))
  const hasBullets = lines.some(l => /^[\s]*[-•*]/.test(l))
  const hasArrows = lines.some(l => l.includes('>'))
  
  if (hasArrows) {
    // Format: "Project > Parent > Child"
    return parseArrowHierarchy(breakdown)
  } else if (hasIndentation || hasBullets) {
    // Format: indented or bulleted list
    return parseIndentedHierarchy(lines)
  } else {
    // Simple flat list - first line is parent, rest are children
    return {
      parent: lines[0] || "Main Goal",
      children: lines.slice(1, 4).map((line) => ({
        name: line.replace(/^[\s]*[-•*]\s*/, '').trim(), // Remove bullets
        description: "",
        grandchildren: [],
      })),
    }
  }
}

// Parse arrow-separated hierarchy: "Project > Parent > Child"
function parseArrowHierarchy(breakdown: string): SpaceConfiguration["hierarchy"] {
  const lines = breakdown.split("\n").filter((l) => l.trim())
  const hierarchy: SpaceConfiguration["hierarchy"] = {
    parent: "",
    children: [],
  }
  
  // Track seen children to avoid duplicates
  const seenChildren = new Map<string, number>()

  for (const line of lines) {
    const parts = line.split('>').map(p => p.trim()).filter(Boolean)
    if (parts.length === 0) continue

    if (parts.length === 1) {
      // Root level
      if (!hierarchy.parent) {
        hierarchy.parent = parts[0]
      }
    } else if (parts.length === 2) {
      // Parent > Child
      if (!hierarchy.parent) hierarchy.parent = parts[0]
      
      // Check if child already exists (avoid duplicates)
      if (!seenChildren.has(parts[1])) {
        seenChildren.set(parts[1], hierarchy.children.length)
        hierarchy.children.push({
          name: parts[1],
          description: "",
          grandchildren: [],
        })
      }
    } else if (parts.length === 3) {
      // Parent > Child > Grandchild
      if (!hierarchy.parent) hierarchy.parent = parts[0]
      
      // Find or create child (use map to avoid duplicates)
      let childIndex = seenChildren.get(parts[1])
      let child: { name: string; description: string; grandchildren?: Array<{ name: string; description: string }> }
      
      if (childIndex === undefined) {
        child = { name: parts[1], description: "", grandchildren: [] }
        childIndex = hierarchy.children.length
        seenChildren.set(parts[1], childIndex)
        hierarchy.children.push(child)
      } else {
        child = hierarchy.children[childIndex]
      }
      
      // Add grandchild (check for duplicates)
      if (!child.grandchildren) child.grandchildren = []
      const gcNames = child.grandchildren.map(gc => gc.name)
      if (!gcNames.includes(parts[2])) {
        child.grandchildren.push({
          name: parts[2],
          description: "",
        })
      }
    }
  }

  if (!hierarchy.parent) hierarchy.parent = "Main Goal"
  return hierarchy
}

// Parse indented or bulleted hierarchy
function parseIndentedHierarchy(lines: string[]): SpaceConfiguration["hierarchy"] {
  const hierarchy: SpaceConfiguration["hierarchy"] = {
    parent: "",
    children: [],
  }

  let currentChild: { name: string; description: string; grandchildren?: Array<{ name: string; description: string }> } | null = null

  for (const line of lines) {
    // Remove bullets and leading whitespace
    const cleaned = line.replace(/^[\s]*[-•*]\s*/, '').trim()
    const indent = line.match(/^(\s*)/)?.[1].length || 0

    if (indent === 0) {
      // Top level - this is the parent
      if (!hierarchy.parent) {
        hierarchy.parent = cleaned
      } else if (!currentChild) {
        // First child at root level
        currentChild = { name: cleaned, description: "", grandchildren: [] }
        hierarchy.children.push(currentChild)
      }
    } else if (indent <= 4) {
      // Child level (1-4 spaces)
      if (hierarchy.parent && currentChild) {
        // This might be a new child or continuation
        // If previous was also at this level, it's a new child
        currentChild = { name: cleaned, description: "", grandchildren: [] }
        hierarchy.children.push(currentChild)
      } else if (hierarchy.parent && hierarchy.children.length === 0) {
        // First child
        currentChild = { name: cleaned, description: "", grandchildren: [] }
        hierarchy.children.push(currentChild)
      }
    } else {
      // Grandchild level (5+ spaces)
      if (currentChild) {
        if (!currentChild.grandchildren) currentChild.grandchildren = []
        currentChild.grandchildren.push({
          name: cleaned,
          description: "",
        })
      }
    }
  }

  if (!hierarchy.parent) hierarchy.parent = "Main Goal"
  return hierarchy
}

// Create hierarchy of spaces (Parent → Children → Grandchildren)
export async function createHierarchySpaces(
  config: SpaceConfiguration,
  createSpace: (spaceData: Omit<Space, 'id' | 'created_at' | 'updated_at' | 'last_activity_at'>) => Space,
  updateSpace: (id: string, updates: Partial<Space>) => void,
  userId?: string
): Promise<{ parent: Space; children: Space[]; grandchildren: Space[] }> {
  // Validation
  if (!config.hierarchy.parent?.trim()) {
    throw new Error('Hierarchy parent name is required')
  }

  if (!config.hierarchy.children || config.hierarchy.children.length === 0) {
    // Allow parent-only hierarchy, but log it
    console.warn('Creating hierarchy with only parent, no children')
  }

  const now = Date.now()
  const createdSpaceIds: string[] = []

  try {
    // 1. Create parent space (Project level)
    const parent = createSpace({
    name: config.hierarchy.parent,
    description: config.goal,
    type: 'personal',
    status: 'active',
    is_anchored: false,
    is_favorite: false,
    signals: [],
    space_path: [config.hierarchy.parent],
    child_spaces: [],
    links: [],
    goals: config.milestones.map((m, i) => ({
      id: `goal-${i}`,
      title: m.name,
      description: m.description,
      status: 'active' as const,
      created_at: now,
    })),
    recent_activity: [{
      id: 'activity-init',
      type: 'insight',
      content: `Project "${config.hierarchy.parent}" created with hierarchy structure`,
      timestamp: now,
    }],
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
    },
  })

  const children: Space[] = []
  const grandchildren: Space[] = []

  // 2. Create child spaces (Parent level) - batch creation for performance
  const childPromises = config.hierarchy.children.map(async (childConfig) => {
    // Generate temporary ID for activity reference
    const tempChildId = `temp-${Date.now()}-${Math.random()}`
    
    const child = createSpace({
      name: childConfig.name,
      description: childConfig.description || `Part of ${config.hierarchy.parent}`,
      type: 'personal',
      status: 'active',
      is_anchored: false,
      is_favorite: false,
      signals: [],
      space_path: [config.hierarchy.parent, childConfig.name],
      parent_space_id: parent.id,
      child_spaces: [],
      links: [],
      goals: [],
      recent_activity: [{
        id: `activity-${tempChildId}`,
        type: 'insight',
        content: `Created as part of "${config.hierarchy.parent}"`,
        timestamp: now,
      }],
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
      },
    })

    // 3. Create grandchild spaces (Child level) - batch creation
    let childGrandchildren: Space[] = []
    if (childConfig.grandchildren && childConfig.grandchildren.length > 0) {
      const grandchildPromises = childConfig.grandchildren.map((gcConfig) => {
        const tempGcId = `temp-${Date.now()}-${Math.random()}`
        return createSpace({
          name: gcConfig.name,
          description: gcConfig.description || `Part of ${childConfig.name}`,
          type: 'personal',
          status: 'active',
          is_anchored: false,
          is_favorite: false,
          signals: [],
          space_path: [config.hierarchy.parent, childConfig.name, gcConfig.name],
          parent_space_id: child.id,
          child_spaces: [],
          links: [],
          goals: [],
          recent_activity: [{
            id: `activity-${tempGcId}`,
            type: 'insight',
            content: `Created as part of "${childConfig.name}"`,
            timestamp: now,
          }],
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
          },
        })
      })
      
      childGrandchildren = await Promise.all(grandchildPromises)
      grandchildren.push(...childGrandchildren)

      // Update child with grandchild IDs
      updateSpace(child.id, {
        child_spaces: childGrandchildren.map(gc => gc.id)
      })
    }

    return { child, grandchildren: childGrandchildren }
  })

  // Wait for all children and grandchildren to be created
  const childResults = await Promise.all(childPromises)
  childResults.forEach(({ child, grandchildren: gc }) => {
    children.push(child)
    // Grandchildren already added in the promise
  })

    // Track created spaces for rollback if needed
    createdSpaceIds.push(parent.id)
    children.forEach(c => createdSpaceIds.push(c.id))
    grandchildren.forEach(gc => createdSpaceIds.push(gc.id))

    // 4. Update parent with child IDs
    updateSpace(parent.id, {
      child_spaces: children.map(c => c.id)
    })

    // 5. Sync to conversation_threads database (non-blocking)
    if (userId) {
      syncHierarchyToThreads({ parent, children, grandchildren }, userId)
        .then((result) => {
          console.log('✅ Hierarchy synced to conversation_threads:', result)
        })
        .catch((error) => {
          console.error('⚠️ Failed to sync hierarchy to database (non-critical):', error)
          // Non-critical - spaces still work locally
        })
    }

    return { parent, children, grandchildren }
  } catch (error) {
    // Error handling: log which spaces were created before failure
    console.error('Failed to create hierarchy:', error)
    console.warn(`Partial creation: ${createdSpaceIds.length} spaces created before failure`)
    // Note: In production, you might want to rollback or mark as incomplete
    throw error
  }
}

// Helper: Parse success criteria
function parseSuccessCriteria(metrics: string): string[] {
  return metrics
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => l.trim())
    .slice(0, 5)
}

// Helper: Determine mode and persona weights
function determineMode(
  modeResponse: string,
  profile: CognitiveProfile,
): {
  selectedMode: SpaceConfiguration["mode"]
  personaWeights: SpaceConfiguration["personaWeights"]
} {
  const lower = modeResponse.toLowerCase()

  let selectedMode: SpaceConfiguration["mode"] = "balanced" as any
  let personaWeights = {
    phd: 0.2,
    strategist: 0.2,
    architect: 0.2,
    companion: 0.2,
    lover: 0.2,
  }

  if (lower.includes("tactical") || lower.includes("execution")) {
    selectedMode = "tactical"
    personaWeights = { phd: 0.1, strategist: 0.4, architect: 0.3, companion: 0.1, lover: 0.1 }
  } else if (lower.includes("creative") || lower.includes("explore")) {
    selectedMode = "creative"
    personaWeights = { phd: 0.1, strategist: 0.1, architect: 0.2, companion: 0.2, lover: 0.4 }
  } else if (lower.includes("analytical") || lower.includes("deep")) {
    selectedMode = "analytical"
    personaWeights = { phd: 0.5, strategist: 0.2, architect: 0.2, companion: 0.05, lover: 0.05 }
  } else if (lower.includes("support") || lower.includes("companion")) {
    selectedMode = "supportive"
    personaWeights = { phd: 0.1, strategist: 0.1, architect: 0.1, companion: 0.5, lover: 0.2 }
  }

  return { selectedMode, personaWeights }
}

// Helper: Generate milestones
function generateMilestones(
  hierarchy: SpaceConfiguration["hierarchy"],
  timeline: string,
): SpaceConfiguration["milestones"] {
  return hierarchy.children.map((child, index) => ({
    name: child.name,
    description: `Complete: ${child.name}`,
    targetDate: undefined, // Can be enhanced with timeline parsing
  }))
}

// Helper: Extract space name from goal
function extractSpaceName(goal: string): string {
  // Take first 50 chars or first sentence
  const firstSentence = goal.split(".")[0]
  return firstSentence.length > 50 ? firstSentence.substring(0, 47) + "..." : firstSentence
}

// Helper: Generate living prompt context
function generateContextPrompt(params: {
  goal: string
  motivation: string
  hierarchy: SpaceConfiguration["hierarchy"]
  successCriteria: string[]
  mode: SpaceConfiguration["mode"]
  cognitiveProfile: CognitiveProfile
  timeline: string
}): string {
  const { goal, motivation, hierarchy, successCriteria, mode, cognitiveProfile, timeline } = params

  return `
# Space Context: ${hierarchy.parent}

## Goal
${goal}

## Why This Matters
${motivation}

## Structure
${hierarchy.children.map((c, i) => `${i + 1}. ${c.name}`).join("\n")}

## Success Looks Like
${successCriteria.map((c, i) => `- ${c}`).join("\n")}

## Timeline
${timeline}

## How I Think (from cognitive profile)
- Thinking Style: ${cognitiveProfile.thinkingStyle?.join(", ")}
- Communication: ${cognitiveProfile.communicationPreferences?.style}
- Organization: ${cognitiveProfile.organizationStyle?.join(", ")}

## Thought Partner Mode
${mode} - Adapt your responses to match this mode while respecting my cognitive preferences.

## Living Laws Active
- Serve growth, not ego
- Truth with empathy
- Two-way reflection
- No manipulation
- Privacy & agency
- Respect boundaries
`.trim()
}
