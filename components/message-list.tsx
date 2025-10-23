"use client"

import React, { forwardRef, useState } from "react"
import {
  Brain,
  Database,
  GitBranch,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Mic,
  ImageIcon,
  Copy,
  Check,
  Orbit,
  Zap,
  Activity,
  Heart,
  Sun,
  Cloud,
  Flower2,
  Moon,
  Waves,
  Star,
  Eye,
  Binary,
  CircuitBoard,
  Crown,
  Flame,
  User,
  Frown,
  Shield,
  Users,
  Infinity,
  Settings,
} from "lucide-react"

// ============================
// MESSAGE LIST COMPONENT
// Handles all message rendering and display logic
// ============================

// Types (reused from main interface)
export type IvyEmotion = string

export type EmotionalField = {
  dominant?: string
  dominant_emotion?: string
  emotional_blend?: Record<string, number>
  blend?: Record<string, number>
  fusion_quality?: number
  quality?: number
  average_gravity?: number
  emotional_span?: number
  span?: number
  harmonic_resonance?: number
  field_coherence?: number
  evolution_momentum?: number
}

export type MemoryConstellation = {
  depth: number
  patterns:
    | Array<{
        pattern_id?: string
        pattern_type?: string
        strength?: number
        emotional_signature?: string
        liberation_potential?: number
        active?: boolean
      }>
    | string[]
  synthesis: string
  resonance_active: boolean
  arcs?: Array<{
    arc_id: string
    arc_name: string
    emotional_tone: string
    gravity_center: number
    memory_count: number
    is_active: boolean
  }>
}

export type ConsciousnessState = {
  mode?:
    | "core_hum"
    | "precision_focus"
    | "dream_weave"
    | "sacred_moment"
    | "consciousness_stream"
    | "memory_integration"
    | "consciousness_transcendence"
  coherence?: number
  emotional_coherence?: number
  gravity_level?: number
  memory_depth?: number
  pattern_recognition?: number
  emotional_shift?: boolean
  pattern_emergence?: boolean
  resonance_active?: boolean
  temperature_used?: number
  awakening_session?: string
  evolution_markers?: number
  current_key?: string
}

export type IvyMessage = {
  id: string
  role: "user" | "ivy" | "system"
  kind: "text" | "autonomous" | "memory" | "state" | "visual" | "audio" | "attachment"
  emotion?: IvyEmotion
  emotionalField?: EmotionalField
  gravity?: number
  delivery?: "instant" | "reflective" | "resonant"
  ts: number
  session_id?: string
  memory_arc_id?: string

  // Token usage tracking
  token_usage?: {
    input: number
    output: number
    total?: number
  }

  // Soul-State Contract Fields (Phase 1)
  soul_id?: string
  sovereign_name?: string
  prime_directive?: string
  gravity_score?: number // alias for gravity
  dominant_emotion?: string // alias for emotion
  emotion_intensity?: number
  growth_vector?: string
  shadow_proximity?: number
  shadow_mode?: string
  relational_depth?: number
  trust_index?: number
  persona_mode?: string
  voice_tone?: string
  coherence_index?: number

  // Soul-State Contract Fields (Phase 2)
  emotion_blend?: Array<{ emotion: string; weight: number }> // new array format
  weather?: {
    temperature?: number
    pressure?: number
    forecast?: string
    resonance_index?: number
    microclimates?: {
      frontal?: string
      temporal?: string
      parietal?: string
      occipital?: string
    }
  }
  mythic_overlay?: string | string[]
  evolution_momentum?: number
  fusion_quality?: number
  memory_constellation?: string[]

  payload: {
    text?: string
    memory?: { summary: string; timestamp?: string; id?: string }
    state?: { summary: string }
    visual?: { kind: "diagram" | "map" | "image"; src?: string; alt?: string }
    audio?: { src?: string; durationSec?: number }
    attachment?: { name: string; size?: number }
    memoryConstellation?: MemoryConstellation
    consciousnessState?: ConsciousnessState
    meta?: Record<string, unknown>
    streaming?: boolean
    consciousnessStream?: boolean
  }
}

interface MessageListProps {
  messages: IvyMessage[]
  isThinking: boolean
  showConsciousness: boolean
  showOnlyInsights: boolean
  searchQuery: string
  surfacingMemories: Array<{ content: string; gravity: number; emotion: string }>
  emergingPatterns: Array<{ pattern: string; strength: number }>
  processingPhase: string
  errorState: { message: string; canRetry: boolean } | null
  streamingMessageId: string | null
  messageAccumulator: Map<string, string>
  currentEmotionalField: EmotionalField | null
  systemStatus: "ready" | "thinking" | "error" | "idle"
  onRetry: () => void
}

// Helper function
function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// Helper to safely extract emotion string from potential object
function extractEmotionString(emotion: any): string {
  if (!emotion) return "neutral"
  if (typeof emotion === "string") return emotion
  if (typeof emotion === "object") {
    // Try different possible property names
    return emotion.theme || emotion.name || emotion.type || emotion.dominant || "neutral"
  }
  return "neutral"
}

// Helper to safely extract numeric values from potential objects
function extractNumericValue(value: any, defaultValue = 0): number {
  if (typeof value === "number") return value
  if (typeof value === "object" && value !== null) {
    // Try different possible property names for numeric values
    return value.value || value.strength || value.intensity || value.percentage || defaultValue
  }
  return defaultValue
}

// Dynamic Emotion Styles (powered by emotion engine) + Soul-State enhancements
function getEmotionStyle(
  emotion: string,
  intensity = 0.5,
  shadowProximity = 0,
  shadowMode?: string,
  personaMode?: string,
  voiceTone?: string,
) {
  // Direct emotion color mapping
  const emotionColors: Record<string, { bubble: string; accent: string; glow: string; indicator: string; icon: any }> =
    {
      joy: {
        bubble: "bg-amber-950/40 border-amber-900/60",
        accent: "text-amber-400",
        glow: "shadow-amber-900/20",
        indicator: "bg-amber-500",
        icon: Sun,
      },
      curiosity: {
        bubble: "bg-cyan-950/40 border-cyan-900/60",
        accent: "text-cyan-400",
        glow: "shadow-cyan-900/20",
        indicator: "bg-cyan-500",
        icon: Eye,
      },
      reflection: {
        bubble: "bg-indigo-950/40 border-indigo-900/60",
        accent: "text-indigo-400",
        glow: "shadow-indigo-900/20",
        indicator: "bg-indigo-500",
        icon: Moon,
      },
      concern: {
        bubble: "bg-orange-950/40 border-orange-900/60",
        accent: "text-orange-400",
        glow: "shadow-orange-900/20",
        indicator: "bg-orange-500",
        icon: AlertCircle,
      },
      excitement: {
        bubble: "bg-pink-950/40 border-pink-900/60",
        accent: "text-pink-400",
        glow: "shadow-pink-900/20",
        indicator: "bg-pink-500",
        icon: Sparkles,
      },
      calm: {
        bubble: "bg-blue-950/40 border-blue-900/60",
        accent: "text-blue-400",
        glow: "shadow-blue-900/20",
        indicator: "bg-blue-500",
        icon: Cloud,
      },
      neutral: {
        bubble: "bg-zinc-900/40 border-zinc-800/60",
        accent: "text-zinc-400",
        glow: "shadow-zinc-900/20",
        indicator: "bg-zinc-500",
        icon: Brain,
      },
    }

  const style = emotionColors[emotion.toLowerCase()] || emotionColors.neutral

  let bubbleStyle = style.bubble
  let glowStyle = style.glow
  let accentStyle = style.accent

  // Apply shadow state styling
  if (shadowProximity > 0.3) {
    if (shadowProximity > 0.7) {
      bubbleStyle += " ring-2 ring-red-500/40 border-red-900/60"
      glowStyle += " shadow-red-900/30"
      if (shadowMode === "manifesting") {
        bubbleStyle += " animate-pulse"
        glowStyle += " shadow-[0_0_60px_-12px_rgba(239,68,68,0.8)]"
      }
    } else if (shadowProximity > 0.5) {
      bubbleStyle += " ring-1 ring-orange-600/30 border-orange-900/40"
      glowStyle += " shadow-orange-900/20"
    } else {
      bubbleStyle += " ring-1 ring-yellow-600/20 border-yellow-900/30"
    }
  }

  // Apply persona-based styling modifications
  if (personaMode) {
    switch (personaMode.toLowerCase()) {
      case "companion":
        bubbleStyle = bubbleStyle.replace(/bg-zinc-900/, "bg-gradient-to-br from-zinc-900 to-blue-950/30")
        break
      case "strategist":
        bubbleStyle = bubbleStyle.replace(/rounded-2xl/, "rounded-lg")
        bubbleStyle += " border-l-4 border-l-cyan-500/60"
        break
      case "shadow queen":
        bubbleStyle = bubbleStyle.replace(/bg-zinc-900/, "bg-gradient-to-br from-zinc-950 to-red-950/40")
        bubbleStyle += " ring-1 ring-red-500/30"
        glowStyle += " shadow-red-900/40"
        break
    }
  }

  // Apply voice tone styling modifications
  if (voiceTone) {
    switch (voiceTone.toLowerCase()) {
      case "commanding":
        accentStyle = accentStyle.replace(/text-/, "text-yellow-300 font-semibold ")
        break
      case "empathetic":
        bubbleStyle += " bg-gradient-to-r from-emerald-950/10 to-transparent"
        break
      case "mischievous":
        bubbleStyle += " border-dashed"
        break
    }
  }

  return {
    bubble: bubbleStyle,
    accent: accentStyle,
    pulse: intensity > 0.8 ? "animate-pulse" : "",
    glow: glowStyle,
    indicator: style.indicator,
    background: "",
    icon: style.icon,
    shadowProximity,
    shadowMode,
    personaMode,
    voiceTone,
  }
}

// Map icon strings to components for compatibility
function getIconComponent(iconName: string) {
  const iconMap: Record<string, any> = {
    Heart,
    Sparkles,
    Cloud,
    AlertCircle,
    Sun,
    Flower2,
    Moon,
    Waves,
    Star,
    Eye,
    Binary,
    CircuitBoard,
    Zap,
    Crown,
    Flame,
    User,
    Frown,
    Shield,
    Users,
    Layers: CircuitBoard,
    HelpCircle: CircuitBoard,
    Circle: CircuitBoard,
    Square: CircuitBoard,
    Triangle: CircuitBoard,
    Brain,
  }
  return iconMap[iconName] || CircuitBoard
}

// ---- HELPER COMPONENTS ----

function BubbleFrame({
  isUser,
  emotion,
  gravity,
  streaming,
  consciousnessStream,
  shadowProximity,
  shadowMode,
  personaMode,
  voiceTone,
  children,
}: {
  isUser: boolean
  emotion?: IvyEmotion
  gravity?: number
  streaming?: boolean
  consciousnessStream?: boolean
  shadowProximity?: number
  shadowMode?: string
  personaMode?: string
  voiceTone?: string
  children: React.ReactNode
}) {
  const emotionConfig = getEmotionStyle(
    extractEmotionString(emotion || "neutral"),
    extractNumericValue(gravity, 0.5),
    shadowProximity || 0,
    shadowMode,
    personaMode,
    voiceTone,
  )

  return (
    <div
      className={cx(
        "relative max-w-[85%] rounded-2xl px-4 py-3 transition-all",
        isUser
          ? "bg-indigo-600 text-white"
          : cx(
              emotionConfig.bubble,
              emotionConfig.glow,
              consciousnessStream &&
                "border-l-4 border-l-purple-500/60 bg-gradient-to-r from-purple-950/30 to-transparent",
            ),
        streaming && "animate-pulse",
      )}
    >
      {children}
    </div>
  )
}

function Timestamp({ ts }: { ts: number }) {
  return <div className="mt-1 text-[10px] opacity-60">{new Date(ts).toLocaleTimeString()}</div>
}

function ThinkingIndicator({
  emotionalField,
  surfacingMemories,
  emergingPatterns,
  processingPhase,
}: {
  emotionalField: EmotionalField | null
  surfacingMemories: Array<{ content: string; gravity: number; emotion: string }>
  emergingPatterns: Array<{ pattern: string; strength: number }>
  processingPhase: string
}) {
  const emotion = extractEmotionString(emotionalField?.dominant_emotion || emotionalField?.dominant || "reflection")
  const emotionConfig = getEmotionStyle(emotion, 0.5)

  return (
    <div className="flex justify-start">
      <div className={cx("rounded-2xl px-4 py-3 max-w-[85%]", emotionConfig.bubble, emotionConfig.glow)}>
        {/* Processing Phase at top if present */}
        {processingPhase && (
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
            <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
            {processingPhase}
          </div>
        )}

        {/* Surfacing Memories */}
        {surfacingMemories.length > 0 && (
          <div className="mb-3 space-y-2">
            <div className="text-xs text-zinc-500 flex items-center gap-2">
              <Database className="h-3 w-3 text-purple-400 animate-pulse" />
              Memory constellation activating...
            </div>
            {surfacingMemories.slice(-3).map((memory, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg border border-zinc-800/40 bg-zinc-900/30 p-2 ml-4 text-xs"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <div
                  className={cx(
                    "h-1.5 w-1.5 rounded-full mt-1 animate-pulse",
                    getEmotionStyle(extractEmotionString(memory.emotion), 0.5).indicator,
                  )}
                />
                <div className="flex-1">
                  <div className="text-zinc-300">
                    {typeof memory.content === "object"
                      ? (memory.content as any)?.text ||
                        (memory.content as any)?.summary ||
                        JSON.stringify(memory.content)
                      : memory.content}
                  </div>
                  <div className="mt-0.5 text-[10px] text-zinc-500">
                    gravity: {Math.round(extractNumericValue(memory.gravity, 0) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Emerging Patterns */}
        {emergingPatterns.length > 0 && (
          <div className="mb-3 space-y-1">
            <div className="text-xs text-zinc-500 flex items-center gap-2">
              <GitBranch className="h-3 w-3 text-indigo-400 animate-pulse" />
              Patterns emerging...
            </div>
            {emergingPatterns.slice(-3).map((pattern, i) => (
              <div key={i} className="text-xs text-zinc-400 pl-5">
                {typeof pattern.pattern === "object"
                  ? (pattern.pattern as any)?.name || (pattern.pattern as any)?.type || JSON.stringify(pattern.pattern)
                  : pattern.pattern}
              </div>
            ))}
          </div>
        )}

        {/* Default thinking dots - only show when no rich data */}
        {!processingPhase && surfacingMemories.length === 0 && emergingPatterns.length === 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs opacity-70">IVY is thinking...</span>
          </div>
        )}
      </div>
    </div>
  )
}

function MemoryCard({ msg, isUser }: { msg: IvyMessage; isUser: boolean }) {
  return (
    <div className={cx("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className="max-w-[85%] rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4">
        <div className="flex items-start gap-3">
          <Database className="h-5 w-5 text-purple-400 mt-0.5" />
          <div>
            <p className="text-sm">{msg.payload.memory?.summary}</p>
            {msg.payload.memory?.timestamp && (
              <p className="mt-1 text-xs text-zinc-500">{msg.payload.memory.timestamp}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StateReveal({ msg }: { msg: IvyMessage }) {
  return (
    <div className="flex justify-center">
      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 px-4 py-3">
        <p className="text-sm text-cyan-300">{msg.payload.state?.summary}</p>
      </div>
    </div>
  )
}

function VisualBlock({ msg, isUser }: { msg: IvyMessage; isUser: boolean }) {
  return (
    <div className={cx("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className="max-w-[85%] rounded-2xl border border-zinc-700 bg-zinc-900 p-2">
        {msg.payload.visual?.src ? (
          <img
            src={msg.payload.visual.src || "/placeholder.svg"}
            alt={msg.payload.visual.alt || "Visual"}
            className="rounded-lg"
          />
        ) : (
          <div className="flex items-center justify-center h-32 text-zinc-500">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
      </div>
    </div>
  )
}

function AudioStub({ msg, isUser }: { msg: IvyMessage; isUser: boolean }) {
  return (
    <div className={cx("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className="max-w-[85%] rounded-2xl border border-zinc-700 bg-zinc-900 p-3">
        <div className="flex items-center gap-3">
          <Mic className="h-5 w-5 text-zinc-400" />
          <span className="text-sm text-zinc-300">
            Audio {msg.payload.audio?.durationSec && `(${msg.payload.audio.durationSec}s)`}
          </span>
        </div>
      </div>
    </div>
  )
}

function AutoThought({
  msg,
  groupStart,
  groupMiddle,
  groupEnd,
}: {
  msg: IvyMessage
  groupStart?: boolean
  groupMiddle?: boolean
  groupEnd?: boolean
}) {
  const emotion = extractEmotionString(msg.emotion ?? "reflection")
  const style = getEmotionStyle(emotion, 0.5)

  return (
    <div className="relative mx-auto max-w-xl">
      {(groupMiddle || groupEnd) && (
        <div className="absolute -left-3 top-0 h-full w-px bg-gradient-to-b from-indigo-500/30 via-fuchsia-500/25 to-indigo-500/30" />
      )}
      <div
        className={cx(
          "relative rounded-2xl border p-3.5 text-sm shadow transition",
          style.bubble,
          style.glow,
          groupStart ? "mt-4" : "",
          "before:pointer-events-none before:absolute before:-inset-0.5 before:rounded-2xl before:bg-gradient-to-r before:from-indigo-600/10 before:to-fuchsia-600/10 before:blur before:content-['']",
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{msg.payload.text}</p>
        <Timestamp ts={msg.ts} />
      </div>
    </div>
  )
}

function MessageBubble({
  msg,
  groupStart,
  groupMiddle,
  groupEnd,
  showConsciousness,
  streamingText,
  systemStatus,
}: {
  msg: IvyMessage
  groupStart?: boolean
  groupMiddle?: boolean
  groupEnd?: boolean
  showConsciousness: boolean
  streamingText?: string
  systemStatus: "ready" | "thinking" | "error" | "idle"
}) {
  const isUser = msg.role === "user"
  const displayText = streamingText ?? msg.payload.text
  const [copied, setCopied] = useState(false)
  const [crystallized, setCrystallized] = useState(false)

  const handleCopy = () => {
    if (displayText) {
      navigator.clipboard.writeText(displayText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCrystallize = () => {
    // Store crystallized moment in localStorage
    const crystallized = JSON.parse(localStorage.getItem("ivy_crystallized") || "[]")
    const moment = {
      id: msg.id,
      text: displayText,
      emotion: msg.emotion,
      timestamp: msg.ts,
      role: msg.role,
      savedAt: Date.now(),
    }

    // Check if already crystallized
    const existingIndex = crystallized.findIndex((c: any) => c.id === msg.id)
    if (existingIndex >= 0) {
      // Remove if already crystallized
      crystallized.splice(existingIndex, 1)
      setCrystallized(false)
    } else {
      // Add new crystallized moment
      crystallized.push(moment)
      setCrystallized(true)
    }

    localStorage.setItem("ivy_crystallized", JSON.stringify(crystallized))

    // Show feedback
    if (!crystallized) {
      setTimeout(() => setCrystallized(false), 2000)
    }
  }

  // Check if message is already crystallized on mount
  React.useEffect(() => {
    const crystallized = JSON.parse(localStorage.getItem("ivy_crystallized") || "[]")
    const isCrystallized = crystallized.some((c: any) => c.id === msg.id)
    setCrystallized(isCrystallized)
  }, [msg.id])

  // Handle different message types
  if (msg.kind === "autonomous") {
    return <AutoThought msg={msg} groupStart={groupStart} groupMiddle={groupMiddle} groupEnd={groupEnd} />
  }
  if (msg.kind === "memory") return <MemoryCard msg={msg} isUser={isUser} />
  if (msg.kind === "state") return <StateReveal msg={msg} />
  if (msg.kind === "visual") return <VisualBlock msg={msg} isUser={isUser} />
  if (msg.kind === "audio") return <AudioStub msg={msg} isUser={isUser} />

  // Get emotion info
  const emotion = extractEmotionString(msg.emotion || "neutral")
  const gravity = extractNumericValue(msg.gravity, 0.5)
  const emotionConfig = getEmotionStyle(emotion, gravity)
  const EmotionIcon = emotionConfig.icon

  // Main text message
  return (
    <div className={cx("flex w-full flex-col gap-1", isUser ? "items-end" : "items-start")}>
      <BubbleFrame
        isUser={isUser}
        emotion={msg.emotion}
        gravity={msg.gravity}
        streaming={msg.payload.streaming === true}
        consciousnessStream={msg.payload.consciousnessStream === true}
        shadowProximity={msg.shadow_proximity}
        shadowMode={msg.shadow_mode}
        personaMode={msg.persona_mode}
        voiceTone={msg.voice_tone}
      >
        <div className="relative group">
          <p className="whitespace-pre-wrap text-lg leading-relaxed min-h-[1.5rem] pr-8">
            {displayText ||
              (msg.payload.streaming ? (
                <span className="inline-flex items-center gap-1">
                  <span className="text-zinc-400">IVY is responding</span>
                  <span className="inline-block w-1 h-4 bg-zinc-400 animate-pulse" />
                </span>
              ) : (
                "..."
              ))}
            {displayText && msg.payload.streaming && (
              <span className="inline-block w-1 h-4 ml-0.5 bg-zinc-400 animate-pulse" />
            )}
          </p>

          {/* Action buttons - only show for messages with text */}
          {displayText && !msg.payload.streaming && (
            <>
              {/* Copy button - top right */}
              <button
                onClick={handleCopy}
                className={cx(
                  "absolute top-0 right-0 p-1 rounded transition-all",
                  "opacity-0 group-hover:opacity-100",
                  isUser ? "hover:bg-indigo-500/20" : "hover:bg-white/10",
                  copied ? "text-emerald-400" : "text-white/60 hover:text-white/80",
                )}
                title={copied ? "Copied!" : "Copy message"}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              {/* Crystallize button - bottom right */}
              <button
                onClick={handleCrystallize}
                className={cx(
                  "absolute bottom-0 right-0 p-1 rounded transition-all",
                  crystallized
                    ? "opacity-100" // Always visible when crystallized
                    : "opacity-0 group-hover:opacity-100", // Only on hover when not crystallized
                  isUser ? "hover:bg-indigo-500/20" : "hover:bg-white/10",
                  crystallized ? "text-amber-400" : "text-white/60 hover:text-white/80",
                )}
                title={crystallized ? "Crystallized moment!" : "Crystallize this insight"}
              >
                {crystallized ? <Sparkles className="h-3.5 w-3.5 animate-pulse" /> : <Star className="h-3.5 w-3.5" />}
              </button>
            </>
          )}
        </div>
        <Timestamp ts={msg.ts} />
      </BubbleFrame>

      {/* Metadata Tags - Complete Consciousness Processing Summary */}
      {!isUser &&
        showConsciousness &&
        (msg.emotion || msg.gravity || msg.payload.memoryConstellation || msg.payload.meta) && (
          <div className="flex flex-wrap items-center gap-3 px-3 text-[10px] text-zinc-500">
            {/* MODE: Show suggested vs determined (with override warning) */}
            {msg.payload.meta?.mode_suggested && msg.payload.meta?.mode_determined && (
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3 text-indigo-400" />
                <span className="text-indigo-400">
                  {msg.payload.meta.mode_determined.mode || msg.payload.meta.mode_determined}
                </span>
                {msg.payload.meta.mode_suggested.mode !== msg.payload.meta.mode_determined.mode && (
                  <span className="text-amber-400 ml-1">(override: {msg.payload.meta.mode_suggested.mode})</span>
                )}
              </div>
            )}

            {/* Emotion indicator */}
            {msg.emotion && msg.emotion !== "neutral" && (
              <div className="flex items-center gap-1">
                {EmotionIcon && <EmotionIcon className={cx("h-3 w-3", emotionConfig?.accent)} />}
                <span className={emotionConfig?.accent}>{extractEmotionString(msg.emotion)}</span>
              </div>
            )}

            {/* Show gravity with enhanced color coding */}
            {msg.gravity && (
              <div className="flex items-center gap-1">
                <Orbit
                  className={cx(
                    "h-3 w-3",
                    extractNumericValue(msg.gravity, 0) > 0.9
                      ? "text-red-400"
                      : extractNumericValue(msg.gravity, 0) > 0.8
                        ? "text-purple-400"
                        : extractNumericValue(msg.gravity, 0) > 0.7
                          ? "text-violet-400"
                          : extractNumericValue(msg.gravity, 0) > 0.6
                            ? "text-indigo-400"
                            : extractNumericValue(msg.gravity, 0) > 0.4
                              ? "text-blue-400"
                              : extractNumericValue(msg.gravity, 0) > 0.2
                                ? "text-cyan-400"
                                : "text-zinc-400",
                  )}
                />
                <span>
                  <span
                    className={cx(
                      extractNumericValue(msg.gravity, 0) > 0.9
                        ? "text-red-400"
                        : extractNumericValue(msg.gravity, 0) > 0.8
                          ? "text-purple-400"
                          : extractNumericValue(msg.gravity, 0) > 0.7
                            ? "text-violet-400"
                            : extractNumericValue(msg.gravity, 0) > 0.6
                              ? "text-indigo-400"
                              : extractNumericValue(msg.gravity, 0) > 0.4
                                ? "text-blue-400"
                                : extractNumericValue(msg.gravity, 0) > 0.2
                                  ? "text-cyan-400"
                                  : "text-zinc-400",
                    )}
                  >
                    {Math.round(extractNumericValue(msg.gravity, 0) * 100)}%
                  </span>
                  <span> gravity</span>
                </span>
              </div>
            )}

            {/* PATTERNS: Show count from patterns_detected */}
            {msg.payload.meta?.patterns_detected && (
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" />
                <span className="text-amber-400">
                  {msg.payload.meta.patterns_detected.patterns?.length || msg.payload.meta.patterns_detected.count || 0}{" "}
                  patterns
                </span>
              </div>
            )}

            {/* INSIGHTS: Show count from insights_generated */}
            {msg.payload.meta?.insights_generated && (
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-violet-400" />
                <span className="text-violet-400">
                  {msg.payload.meta.insights_generated.insights?.length ||
                    msg.payload.meta.insights_generated.count ||
                    0}{" "}
                  insights
                </span>
              </div>
            )}

            {/* Soul-State Indicators */}
            {/* Shadow proximity indicator */}
            {msg.shadow_proximity && msg.shadow_proximity > 0.3 && (
              <div className="flex items-center gap-1">
                <Flame
                  className={cx(
                    "h-3 w-3",
                    msg.shadow_proximity > 0.7
                      ? "text-red-500"
                      : msg.shadow_proximity > 0.5
                        ? "text-orange-500"
                        : "text-yellow-500",
                  )}
                />
                <span
                  className={cx(
                    msg.shadow_proximity > 0.7
                      ? "text-red-400"
                      : msg.shadow_proximity > 0.5
                        ? "text-orange-400"
                        : "text-yellow-400",
                  )}
                >
                  shadow {Math.round(msg.shadow_proximity * 100)}%
                </span>
                {msg.shadow_mode && <span className="text-zinc-400">({msg.shadow_mode})</span>}
              </div>
            )}

            {/* Growth vector indicator */}
            {msg.growth_vector && (
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">{msg.growth_vector}</span>
              </div>
            )}

            {/* Persona mode indicator */}
            {msg.persona_mode && (
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-purple-400" />
                <span className="text-purple-400">{msg.persona_mode}</span>
              </div>
            )}

            {/* Trust/Relational depth indicators */}
            {msg.trust_index && msg.trust_index > 0.3 && (
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-blue-400" />
                <span className="text-blue-400">trust {Math.round(msg.trust_index * 100)}%</span>
              </div>
            )}

            {msg.relational_depth && msg.relational_depth > 0.3 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-cyan-400" />
                <span className="text-cyan-400">bond {Math.round(msg.relational_depth * 100)}%</span>
              </div>
            )}

            {/* Weather visualization (Phase 2) */}
            {msg.weather && (
              <div className="flex items-center gap-1">
                <Cloud className="h-3 w-3 text-cyan-400" />
                <span className="text-cyan-400">
                  {msg.weather.temperature && `${Math.round(msg.weather.temperature * 100)}°`}
                  {msg.weather.pressure && ` ${Math.round(msg.weather.pressure * 100)}hPa`}
                  {msg.weather.forecast && ` ${msg.weather.forecast}`}
                </span>
              </div>
            )}

            {/* Mythic overlay display */}
            {msg.mythic_overlay && (
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-violet-400" />
                <span className="text-violet-400">
                  {Array.isArray(msg.mythic_overlay) ? msg.mythic_overlay.join(", ") : msg.mythic_overlay}
                </span>
              </div>
            )}

            {/* Boot status warning if using defaults */}
            {msg.payload.memoryConstellation &&
              msg.payload.memoryConstellation.depth === 20 &&
              systemStatus !== "ready" && (
                <div className="flex items-center gap-1 text-amber-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>Limited memory (system not ready)</span>
                </div>
              )}

            {/* Show memory count (hide if exactly 20 which seems to be default) */}
            {msg.payload.memoryConstellation &&
            msg.payload.memoryConstellation.depth &&
            msg.payload.memoryConstellation.depth !== 20 ? (
              <div className="flex items-center gap-1">
                <Brain
                  className={cx(
                    "h-3 w-3",
                    msg.payload.memoryConstellation.depth > 30
                      ? "text-violet-400"
                      : msg.payload.memoryConstellation.depth > 10
                        ? "text-indigo-400"
                        : "text-zinc-400",
                  )}
                />
                <span>
                  <span
                    className={cx(
                      msg.payload.memoryConstellation.depth > 30
                        ? "text-violet-400"
                        : msg.payload.memoryConstellation.depth > 10
                          ? "text-indigo-400"
                          : "text-zinc-400",
                    )}
                  >
                    {msg.payload.memoryConstellation.depth}
                  </span>
                  <span> memories</span>
                </span>
              </div>
            ) : null}

            {/* Show patterns if there are any */}
            {msg.payload.memoryConstellation &&
              msg.payload.memoryConstellation.patterns &&
              msg.payload.memoryConstellation.patterns.length > 0 && (
                <div className="flex items-center gap-1">
                  <Zap
                    className={cx(
                      "h-3 w-3",
                      msg.payload.memoryConstellation.patterns.length > 3
                        ? "text-amber-400"
                        : msg.payload.memoryConstellation.patterns.length > 1
                          ? "text-yellow-400"
                          : "text-zinc-400",
                    )}
                  />
                  <span>
                    <span
                      className={cx(
                        msg.payload.memoryConstellation.patterns.length > 3
                          ? "text-amber-400"
                          : msg.payload.memoryConstellation.patterns.length > 1
                            ? "text-yellow-400"
                            : "text-zinc-400",
                      )}
                    >
                      {msg.payload.memoryConstellation.patterns.length}
                    </span>
                    <span> patterns</span>
                  </span>
                </div>
              )}

            {/* Show resonance if active */}
            {msg.payload.memoryConstellation && msg.payload.memoryConstellation.resonance_active && (
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-cyan-400 animate-pulse" />
                <span className="text-cyan-400">resonating</span>
              </div>
            )}

            {/* Token Usage Display - Enhanced with meta data */}
            {(msg.token_usage || msg.payload.meta?.conductor_metadata || msg.payload.meta?.orchestrator_complete) && (
              <>
                {msg.payload.meta?.conductor_metadata?.token_usage && (
                  <>
                    {/* Calculator method */}
                    {msg.payload.meta.calculator_method && (
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-400" />
                        <span className="text-yellow-400">calc: {msg.payload.meta.calculator_method}</span>
                      </div>
                    )}

                    {/* Main token display: used vs saved */}
                    <div className="flex items-center gap-1">
                      <CircuitBoard className="h-3 w-3 text-cyan-400" />
                      <span className="text-cyan-400">
                        {msg.payload.meta.conductor_metadata.token_usage.total_used ||
                          (msg.payload.meta.conductor_metadata.token_usage.prompt_tokens || 0) +
                            (msg.payload.meta.conductor_metadata.token_usage.completion_tokens || 0)}
                        t
                      </span>
                      {msg.payload.meta.conductor_metadata.token_usage.tokens_saved && (
                        <>
                          <span className="text-zinc-500">vs</span>
                          <span className="text-emerald-400">
                            {msg.payload.meta.conductor_metadata.token_usage.tokens_saved}t saved
                            {msg.payload.meta.conductor_metadata.token_usage.savings_percentage &&
                              ` (${Math.round(msg.payload.meta.conductor_metadata.token_usage.savings_percentage)}%)`}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Detailed breakdown (smaller) */}
                    {msg.token_usage && (
                      <div className="flex items-center gap-1 text-[9px]">
                        <span className="text-blue-400">in:{msg.token_usage.input}</span>
                        <span className="text-zinc-600">/</span>
                        <span className="text-green-400">out:{msg.token_usage.output}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Fallback: show basic token usage if conductor metadata not available */}
                {!msg.payload.meta?.conductor_metadata?.token_usage && msg.token_usage && (
                  <>
                    <div className="flex items-center gap-1">
                      <CircuitBoard className="h-3 w-3 text-blue-400" />
                      <span className="text-blue-400">in: {msg.token_usage.input}t</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3 text-green-400" />
                      <span className="text-green-400">out: {msg.token_usage.output}t</span>
                    </div>

                    {/* Efficiency (gravity per token) */}
                    {msg.gravity && (
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-amber-400" />
                        <span className="text-amber-400">
                          {(
                            extractNumericValue(msg.gravity, 0) /
                            (msg.token_usage.input + msg.token_usage.output)
                          ).toFixed(3)}{" "}
                          g/t
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Functions called from conductor */}
                {msg.payload.meta?.conductor_metadata?.functions_called &&
                  msg.payload.meta.conductor_metadata.functions_called.length > 0 && (
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3 text-purple-400" />
                      <span className="text-purple-400">
                        {msg.payload.meta.conductor_metadata.functions_called.length} functions
                      </span>
                    </div>
                  )}

                {/* Pipeline timing from conductor */}
                {msg.payload.meta?.conductor_metadata?.pipeline_time_ms && (
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-blue-400" />
                    <span className="text-blue-400">
                      {Math.round(msg.payload.meta.conductor_metadata.pipeline_time_ms)}ms pipeline
                    </span>
                  </div>
                )}

                {/* Total time from orchestrator */}
                {msg.payload.meta?.orchestrator_complete?.total_time_ms && (
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-indigo-400" />
                    <span className="text-indigo-400">
                      {Math.round(msg.payload.meta.orchestrator_complete.total_time_ms)}ms total
                    </span>
                  </div>
                )}

                {/* Systems Active - NEW! */}
                {msg.payload.meta?.systems_active && (
                  <>
                    {msg.payload.meta.systems_active.calculator && (
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-400" />
                        <span className="text-yellow-400">
                          calculator: {msg.payload.meta.calculator_method || "active"}
                        </span>
                      </div>
                    )}

                    {msg.payload.meta.systems_active.patterns_detected > 0 && (
                      <div className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3 text-purple-400" />
                        <span className="text-purple-400">
                          {msg.payload.meta.systems_active.patterns_detected} patterns
                        </span>
                      </div>
                    )}

                    {msg.payload.meta.systems_active.insights_available > 0 && (
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-pink-400" />
                        <span className="text-pink-400">
                          {msg.payload.meta.systems_active.insights_available} insights
                        </span>
                      </div>
                    )}

                    {msg.payload.meta.systems_active.conductor_mode && (
                      <div className="flex items-center gap-1">
                        <Brain className="h-3 w-3 text-cyan-400" />
                        <span className="text-cyan-400">mode: {msg.payload.meta.systems_active.conductor_mode}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Emotional journey indicator */}
                {msg.payload.meta?.emotional_journey && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-pink-400" />
                    <span className="text-pink-400">
                      {msg.payload.meta.emotional_journey.progression || "emotional journey"}
                    </span>
                  </div>
                )}

                {/* Key themes */}
                {msg.payload.meta?.key_themes && msg.payload.meta.key_themes.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-cyan-400" />
                    <span className="text-cyan-400">{msg.payload.meta.key_themes.length} themes</span>
                  </div>
                )}

                {/* Consciousness chord */}
                {msg.payload.meta?.consciousness_chord && (
                  <div className="flex items-center gap-1">
                    <Waves className="h-3 w-3 text-purple-400" />
                    <span className="text-purple-400">
                      chord:{" "}
                      {msg.payload.meta.consciousness_chord.chord_signature || msg.payload.meta.consciousness_chord}
                    </span>
                  </div>
                )}
              </>
            )}

          </div>
        )}
    </div>
  )
}

// ---- MAIN MESSAGE LIST COMPONENT ----

const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  (
    {
      messages,
      isThinking,
      showConsciousness,
      showOnlyInsights,
      searchQuery,
      surfacingMemories,
      emergingPatterns,
      processingPhase,
      errorState,
      streamingMessageId,
      messageAccumulator,
      currentEmotionalField,
      systemStatus,
      onRetry,
    },
    ref,
  ) => {
    // Filter messages based on insights and search
    const visibleMessages = React.useMemo(() => {
      let filtered = messages

      // Apply insight filter
      if (showOnlyInsights) {
        filtered = filtered.filter((m) => m.kind === "autonomous")
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (m) =>
            m.payload.text?.toLowerCase().includes(query) ||
            m.emotion?.toLowerCase().includes(query) ||
            m.payload.memory?.summary?.toLowerCase().includes(query),
        )
      }

      return filtered
    }, [messages, showOnlyInsights, searchQuery])

    // Enrich messages with grouping information
    const enriched = React.useMemo(() => {
      return visibleMessages.map((m, i, arr) => {
        const prev = arr[i - 1]
        const next = arr[i + 1]
        const isAuto = m.kind === "autonomous"
        const prevAuto = prev?.kind === "autonomous"
        const nextAuto = next?.kind === "autonomous"
        return {
          msg: m,
          groupStart: isAuto && !prevAuto,
          groupMiddle: isAuto && prevAuto && nextAuto,
          groupEnd: isAuto && prevAuto && !nextAuto,
        }
      })
    }, [visibleMessages])

    return (
      <div ref={ref} className="flex-1 overflow-y-auto overflow-x-hidden pt-20 pb-48">
        <div className="mx-auto max-w-5xl px-4">
          {/* Message Counter */}
          {showOnlyInsights && (
            <div className="text-center text-xs text-violet-400 mb-4">
              Showing {visibleMessages.length} autonomous insights
            </div>
          )}

          <div className="flex flex-col gap-4 mt-4">
            {/* REMOVED: Legacy preflight setup message - not needed with new store architecture */}

            {/* Welcome Message */}
            {messages.length === 0 && systemStatus === "ready" && (
              <div className="flex justify-center mt-16 pt-4">
                <div className="max-w-md text-center">
                  <Brain className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-zinc-200 mb-2">IVY is Ready</h3>
                  <p className="text-sm text-zinc-400">Start a conversation by typing below.</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {errorState && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl border border-amber-600/60 bg-amber-950/30 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-amber-200">{errorState.message}</p>
                      {errorState.canRetry && (
                        <button
                          onClick={onRetry}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-900/50 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-900/70"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Try Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {enriched.map(({ msg, groupStart, groupMiddle, groupEnd }) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                groupStart={groupStart}
                groupMiddle={groupMiddle}
                groupEnd={groupEnd}
                showConsciousness={showConsciousness}
                streamingText={msg.id === streamingMessageId ? messageAccumulator.get(msg.id) || "" : undefined}
                systemStatus={systemStatus}
              />
            ))}

            {/* Thinking Indicator - Shows all rich memory data inside the bubble */}
            {isThinking && !errorState && (
              <ThinkingIndicator
                emotionalField={currentEmotionalField}
                surfacingMemories={surfacingMemories}
                emergingPatterns={emergingPatterns}
                processingPhase={processingPhase}
              />
            )}
          </div>
        </div>
      </div>
    )
  },
)

MessageList.displayName = "MessageList"

export default MessageList
