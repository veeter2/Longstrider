// Conversational Space Creation Interview
// Leverages cognitive profile to guide users through space setup
// Outputs: Space configuration that becomes "living .md prompt" for LLM

import type { CognitiveProfile } from "./cognitive-profile"

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
function parseHierarchy(breakdown: string): SpaceConfiguration["hierarchy"] {
  // Simple parsing - can be enhanced with NLP
  const lines = breakdown.split("\n").filter((l) => l.trim())

  return {
    parent: lines[0] || "Main Goal",
    children: lines.slice(1, 4).map((line) => ({
      name: line.trim(),
      description: "",
      grandchildren: [],
    })),
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
