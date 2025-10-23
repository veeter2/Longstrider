// lib/ivy-message-adapter.ts

// Type the backend envelope
export type BackendEnvelope = {
  source?: string; // e.g., "insight_generator"
  type?: string;   // e.g., "insight.v1"
  payload: any;    // any shape from backend
  tone?: string;   // optional tone tag
  emotion?: Record<string, number>;
  delivery?: "instant" | "reflective";
  created_at?: number | string; // epoch ms or ISO string
  
  // Soul-State Contract Fields (Phase 1)
  soul_id?: string;
  sovereign_name?: string;
  prime_directive?: string;
  gravity_score?: number;
  dominant_emotion?: string;
  emotion_intensity?: number;
  growth_vector?: string;
  shadow_proximity?: number;
  shadow_mode?: string;
  relational_depth?: number;
  trust_index?: number;
  persona_mode?: string;
  voice_tone?: string;
  coherence_index?: number;
  
  // Soul-State Contract Fields (Phase 2)
  emotion_blend?: Array<{ emotion: string; weight: number }>;
  weather?: {
    temperature?: number;
    pressure?: number;
    forecast?: string;
    resonance_index?: number;
    microclimates?: {
      frontal?: string;
      temporal?: string;
      parietal?: string;
      occipital?: string;
    };
  };
  mythic_overlay?: string | string[];
  evolution_momentum?: number;
  fusion_quality?: number;
  memory_constellation?: string[];
  
  // Token usage tracking
  token_usage?: {
    input: number;
    output: number;
    total?: number;
  };
};

// --- Helpers ---

// Normalize created_at into epoch ms
function toEpochMs(v?: number | string): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Date.parse(v);
    if (!Number.isNaN(n)) return n;
  }
  return Date.now();
}

// Convert new emotion_blend array format to existing object format for backward compatibility
function convertEmotionBlend(blend?: Array<{ emotion: string; weight: number }>): Record<string, number> | undefined {
  if (!blend || !Array.isArray(blend)) return undefined;
  
  const result: Record<string, number> = {};
  blend.forEach(({ emotion, weight }) => {
    if (emotion && typeof weight === 'number') {
      result[emotion] = weight;
    }
  });
  
  return Object.keys(result).length > 0 ? result : undefined;
}

// Decide IvyMessage.kind based on source/type/payload
function inferKind(env: BackendEnvelope):
  | "autonomous"
  | "memory"
  | "state"
  | "visual"
  | "audio"
  | "attachment"
  | "text" {

  const s = (env.source || "").toLowerCase();
  const t = (env.type || "").toLowerCase();

  // Autonomous sources
  if (["insight_generator", "pattern_detector", "contradiction_mapper", "reflection_engine", "snapshot_engine"].includes(s)) {
    return "autonomous";
  }

  // Memory/state/visual/audio/attachment hints
  if (t.startsWith("memory") || env.payload?.memory) return "memory";
  if (t.startsWith("state")  || env.payload?.state)  return "state";
  if (t.startsWith("visual") || env.payload?.visual) return "visual";
  if (t.startsWith("audio")  || env.payload?.audio)  return "audio";
  if (t.startsWith("attachment") || env.payload?.attachment) return "attachment";

  // Default to text if payload has text
  if (env.payload && typeof env.payload.text === "string") return "text";

  return "text";
}

// --- Main mapping functions ---

// Map a single BackendEnvelope to an IvyMessage
export function mapToIvyMessage(env: BackendEnvelope) {
  const kind = inferKind(env);

  return {
    id: (typeof crypto !== "undefined" && "randomUUID" in crypto)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    role: "ivy" as const,
    kind,
    tone: env.tone as any,
    emotion: env.emotion || env.dominant_emotion, // Support both formats
    delivery: env.delivery,
    ts: toEpochMs(env.created_at),
    
    // Soul-State Contract Fields (Phase 1)
    soul_id: env.soul_id,
    sovereign_name: env.sovereign_name,
    prime_directive: env.prime_directive,
    gravity_score: env.gravity_score,
    dominant_emotion: env.dominant_emotion,
    emotion_intensity: env.emotion_intensity,
    growth_vector: env.growth_vector,
    shadow_proximity: env.shadow_proximity,
    shadow_mode: env.shadow_mode,
    relational_depth: env.relational_depth,
    trust_index: env.trust_index,
    persona_mode: env.persona_mode,
    voice_tone: env.voice_tone,
    coherence_index: env.coherence_index,
    
    // Soul-State Contract Fields (Phase 2)
    emotion_blend: env.emotion_blend,
    weather: env.weather,
    mythic_overlay: env.mythic_overlay,
    evolution_momentum: env.evolution_momentum,
    fusion_quality: env.fusion_quality,
    memory_constellation: env.memory_constellation,
    
    // Token usage tracking
    token_usage: env.token_usage,
    
    // Convert new emotion_blend to existing emotionalField format for compatibility
    emotionalField: env.emotion_blend ? {
      dominant: env.dominant_emotion,
      dominant_emotion: env.dominant_emotion,
      emotional_blend: convertEmotionBlend(env.emotion_blend),
      blend: convertEmotionBlend(env.emotion_blend),
      fusion_quality: env.fusion_quality,
      quality: env.fusion_quality,
      average_gravity: env.gravity_score,
      emotional_span: env.emotion_intensity,
      span: env.emotion_intensity,
      harmonic_resonance: env.weather?.resonance_index,
      field_coherence: env.coherence_index,
      evolution_momentum: env.evolution_momentum,
    } : undefined,
    
    payload: {
      text: env.payload?.text,
      memory: env.payload?.memory,
      state: env.payload?.state,
      visual: env.payload?.visual,
      audio: env.payload?.audio,
      attachment: env.payload?.attachment,
      meta: env.payload?.meta ?? undefined,
    },
  };
}

// Map an array of BackendEnvelope objects
export function mapBatch(list: BackendEnvelope[]) {
  return list.map(mapToIvyMessage);
}
