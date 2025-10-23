// cce-recall.ts
// IVY Recall Engine v3.2 — Fully Cortex Bible Compliant
// Now properly integrated with cortex state and recall strategies
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// ────────────────────────────────────────────────────────────────────────────────
// CORTEX INTEGRATION - BIBLE COMPLIANT
// ────────────────────────────────────────────────────────────────────────────────
async function getCortexState(supabase, user_id, resolution = "nano") {
  try {
    const { data: cortexState, error } = await supabase.rpc("get_cortex", {
      p_user_id: user_id,
      p_resolution: resolution
    });
    if (error) {
      console.error("[getCortexState] Cortex unavailable:", error);
      // Return Bible-compliant emergency fallback
      return {
        v: [
          1.0,
          0.0,
          0.5,
          0.5,
          1.0,
          0.0,
          0.5,
          0.5,
          0.3,
          0.5
        ],
        status: "PROTECTED",
        soul_state: "EMERGENCY",
        integrity_risk: 0.1,
        integrity_components: {
          authenticity_gap: 0.1,
          user_pressure: 0.1,
          relationship_bias: 0.1,
          contradiction_density: 0.1,
          cognitive_load: 0.1
        },
        recommended_action: "constrain_generation",
        recall_strategy: {
          topk: 10,
          time_window: "last_30_days",
          anchors: [],
          prefer_types: [],
          anchor_bias: false
        },
        active_laws: 0,
        t: Date.now()
      };
    }
    return cortexState;
  } catch (err) {
    console.error("[getCortexState] failed:", err);
    // Emergency fallback with full Bible structure
    return {
      v: [
        1.0,
        0.0,
        0.5,
        0.5,
        1.0,
        0.0,
        0.5,
        0.5,
        0.3,
        0.5
      ],
      status: "PROTECTED",
      soul_state: "EMERGENCY",
      integrity_risk: 0.1,
      integrity_components: {
        authenticity_gap: 0.1,
        user_pressure: 0.1,
        relationship_bias: 0.1,
        contradiction_density: 0.1,
        cognitive_load: 0.1
      },
      recommended_action: "constrain_generation",
      recall_strategy: {
        topk: 10,
        time_window: "last_30_days",
        anchors: [],
        prefer_types: [],
        anchor_bias: false
      },
      active_laws: 0,
      t: Date.now()
    };
  }
}
// ────────────────────────────────────────────────────────────────────────────────
// INTEGRITY MODE HELPER (Bible Section 4.4)
// ────────────────────────────────────────────────────────────────────────────────
function getIntegrityMode(integrityRisk) {
  if (integrityRisk >= 0.9) return 'sentinel_lockdown';
  if (integrityRisk >= 0.75) return 'assertive_truth';
  if (integrityRisk >= 0.5) return 'guarded';
  if (integrityRisk >= 0.25) return 'caution';
  return 'nominal';
}
// ────────────────────────────────────────────────────────────────────────────────
// CORS
// ────────────────────────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};
// ────────────────────────────────────────────────────────────────────────────────
// Tunables & guards
// ────────────────────────────────────────────────────────────────────────────────
const LIMITS = {
  MAX_DEPTH_CAP: 500,
  BASELINE_LIMIT: 200,
  RECENT_LIMIT: 100,
  ENTITY_LIMIT: 50,
  TEMPORAL_LIMIT: 100,
  EMOTIONAL_LIMIT: 50,
  PEAK_LIMIT: 20,
  PATTERN_LIMIT: 20,
  ARC_LIMIT: 10,
  THOUGHT_LIMIT: 20,
  META_LOG_LIMIT: 50
};
const DEFAULTS = {
  GRAVITY_THRESHOLD_BASE: 0.5,
  GRAVITY_THRESHOLD_PEAK: 0.85,
  SEMANTIC_THRESHOLD: 0.35,
  CONSOLIDATION_LEVEL: "synthesized",
  AWARENESS_MODE: false
};
// Query Complexity Classification Engine
const QUERY_COMPLEXITY = {
  SIMPLE: {
    multiplier: 0.25,
    streams: [
      'baseline',
      'recent',
      'semantic'
    ]
  },
  MODERATE: {
    multiplier: 0.50,
    streams: [
      'baseline',
      'recent',
      'semantic',
      'entity',
      'temporal'
    ]
  },
  COMPLEX: {
    multiplier: 1.0,
    streams: [
      'baseline',
      'recent',
      'semantic',
      'entity',
      'temporal',
      'emotional',
      'peak'
    ]
  },
  TRANSCENDENT: {
    multiplier: 2.0,
    streams: [
      'baseline',
      'recent',
      'semantic',
      'entity',
      'temporal',
      'emotional',
      'peak',
      'pattern',
      'arc'
    ]
  }
};
function classifyQueryComplexity(query, entities, temporalType) {
  if (!query || query.trim().length === 0) return 'SIMPLE';
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/);
  console.log(`[CLASSIFICATION_DEBUG] Query: "${query}"`);
  console.log(`[CLASSIFICATION_DEBUG] Lower: "${lowerQuery}"`);
  console.log(`[CLASSIFICATION_DEBUG] Words: ${words.length}, Entities: ${entities.length}`);
  // TRANSCENDENT: Deep consciousness analysis
  const transcendentKeywords = [
    'consciousness',
    'evolved',
    'evolution',
    'patterns in my life',
    'all patterns',
    'life narrative',
    'identity',
    'growth journey',
    'transformation',
    'comprehensive analysis',
    'deep analysis',
    'complete picture'
  ];
  const matchedTranscendent = transcendentKeywords.filter((keyword)=>lowerQuery.includes(keyword));
  console.log(`[CLASSIFICATION_DEBUG] Transcendent matches: ${matchedTranscendent.join(', ')}`);
  if (matchedTranscendent.length > 0 || words.length > 20 && entities.length > 3) {
    console.log(`[CLASSIFICATION_DEBUG] → TRANSCENDENT`);
    return 'TRANSCENDENT';
  }
  // CRITICAL FIX: Identity queries must be COMPLEX to enable entity search
  const identityKeywords = [
    'who is',
    'what is my name',
    'who am i',
    'tell me about'
  ];
  const matchedIdentity = identityKeywords.filter((keyword)=>lowerQuery.includes(keyword));
  console.log(`[CLASSIFICATION_DEBUG] Identity matches: ${matchedIdentity.join(', ')}`);
  if (matchedIdentity.length > 0) {
    console.log(`[CLASSIFICATION_DEBUG] → COMPLEX (identity query)`);
    return 'COMPLEX';
  }
  // COMPLEX: Multi-dimensional analysis
  const complexKeywords = [
    'analyze',
    'pattern',
    'patterns',
    'relationship',
    'relationships',
    'correlation',
    'trend',
    'emotional state',
    'feelings about',
    'connections between',
    'patterns between',
    'how',
    'why',
    'what caused',
    'impact of',
    'relate to',
    'connection between',
    'deep dive',
    'research',
    'investigate',
    'explore',
    'find out',
    'learn about'
  ];
  const matchedComplex = complexKeywords.filter((keyword)=>lowerQuery.includes(keyword));
  console.log(`[CLASSIFICATION_DEBUG] Complex matches: ${matchedComplex.join(', ')}`);
  const complexConditions = {
    keywords: matchedComplex.length > 0,
    wordLength: words.length > 10 && entities.length > 1,
    temporal: temporalType && lowerQuery.includes('between')
  };
  console.log(`[CLASSIFICATION_DEBUG] Complex conditions:`, complexConditions);
  if (complexConditions.keywords || complexConditions.wordLength || complexConditions.temporal) {
    console.log(`[CLASSIFICATION_DEBUG] → COMPLEX`);
    return 'COMPLEX';
  }
  // MODERATE: Time-based or multi-entity queries
  const moderateKeywords = [
    'yesterday',
    'today',
    'last week',
    'recent',
    'lately',
    'when',
    'during',
    'about',
    'regarding'
  ];
  const matchedModerate = moderateKeywords.filter((keyword)=>lowerQuery.includes(keyword));
  console.log(`[CLASSIFICATION_DEBUG] Moderate matches: ${matchedModerate.join(', ')}`);
  const moderateConditions = {
    keywords: matchedModerate.length > 0,
    hasEntities: entities.length > 0,
    wordLength: words.length > 5
  };
  console.log(`[CLASSIFICATION_DEBUG] Moderate conditions:`, moderateConditions);
  if (moderateConditions.keywords || moderateConditions.hasEntities || moderateConditions.wordLength) {
    console.log(`[CLASSIFICATION_DEBUG] → MODERATE`);
    return 'MODERATE';
  }
  // SIMPLE: Basic entity or factual queries
  console.log(`[CLASSIFICATION_DEBUG] → SIMPLE (fallback)`);
  return 'SIMPLE';
}
// Weights for unified scoring (sum ~1.0)
const WEIGHTS = {
  semantic: 0.35,
  gravity: 0.30,
  entities: 0.10,
  recency: 0.10,
  emotion: 0.05,
  multiSource: 0.05,
  patterns: 0.05
};
// ────────────────────────────────────────────────────────────────────────────────
/** Utilities */ // ────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// UNIVERSAL USER MESSAGE FILTER - PREVENTS ECHO BUG
// ────────────────────────────────────────────────────────────────────────────────
function filterUserMessages(memories) {
  if (!Array.isArray(memories)) return [];
  return memories.filter((m)=>{
    if (!m) return false;
    const isUserMessage = m.metadata?.role === 'user' || m.metadata?.role === 'human' || m.type === 'user' || m.metadata?.is_user_message === true || m.metadata?.memory_type === 'user_input';
    return !isUserMessage; // Only keep NON-user messages
  });
}
function safeNumber(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}
function escapeIlike(s) {
  return s.replace(/[\\%_]/g, (m)=>`\\${m}`);
}
function nowISO() {
  return new Date().toISOString();
}
function daysSince(ts) {
  if (!ts) return Number.POSITIVE_INFINITY;
  const d = new Date(ts).getTime();
  if (!Number.isFinite(d)) return Number.POSITIVE_INFINITY;
  return (Date.now() - d) / (1000 * 60 * 60 * 24);
}
function adaptiveSemanticThreshold(base, candidateCount) {
  // If we found too many matches, tighten; if too few, loosen a bit.
  if (candidateCount > 400) return Math.min(0.55, Math.max(0.25, base + 0.10));
  if (candidateCount < 50) return Math.max(0.20, base - 0.10);
  return base;
}
// ────────────────────────────────────────────────────────────────────────────────
/** Apply recall strategy from cortex */ // ────────────────────────────────────────────────────────────────────────────────
function applyRecallStrategy(params, recallStrategy) {
  if (!recallStrategy) return params;
  const updated = {
    ...params
  };
  // Apply topk if specified
  if (recallStrategy.topk && recallStrategy.topk > 0) {
    updated.max_depth = Math.min(params.max_depth, recallStrategy.topk);
  }
  // Apply time window
  if (recallStrategy.time_window && recallStrategy.time_window !== 'all') {
    const now = new Date();
    let startDate;
    switch(recallStrategy.time_window){
      case 'last_7_days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last_30_days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last_90_days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'last_18mo':
        startDate = new Date(now.getTime() - 18 * 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = null;
    }
    if (startDate) {
      updated.time_range = {
        start: startDate.toISOString(),
        end: now.toISOString()
      };
    }
  }
  // Apply anchors as additional entities
  if (recallStrategy.anchors && recallStrategy.anchors.length > 0) {
    updated.anchor_entities = recallStrategy.anchors;
  }
  // Store prefer_types for later filtering
  if (recallStrategy.prefer_types && recallStrategy.prefer_types.length > 0) {
    updated.prefer_types = recallStrategy.prefer_types;
  }
  updated.anchor_bias = recallStrategy.anchor_bias || false;
  return updated;
}
// ────────────────────────────────────────────────────────────────────────────────
/** Embeddings - OPTIMIZED FOR CORTEX */ // ────────────────────────────────────────────────────────────────────────────────
async function getEmbedding(text, cortexState = null) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    console.error("[Embedding] OPENAI_API_KEY missing — returning zero-vector");
    return new Array(1536).fill(0);
  }
  // Check cortex state before expensive OpenAI call
  if (cortexState && cortexState.status === "PROTECTED") {
    console.error("[Embedding BYPASS] Cortex in PROTECTED mode, returning zero vector - SEMANTIC SEARCH WILL FAIL");
    return new Array(1536).fill(0); // Return zero vector in protected mode
  }
  // Check integrity risk - skip embedding if in lockdown
  if (cortexState && cortexState.integrity_risk >= 0.9) {
    console.error("[Embedding BYPASS] Integrity lockdown, returning zero vector - SEMANTIC SEARCH WILL FAIL");
    return new Array(1536).fill(0);
  }
  try {
    const resp = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.slice(0, 8000)
      })
    });
    if (!resp.ok) throw new Error(`[Embedding] HTTP ${resp.status}`);
    const data = await resp.json();
    return data?.data?.[0]?.embedding ?? new Array(1536).fill(0);
  } catch (err) {
    console.error("[Embedding] Error:", err);
    return new Array(1536).fill(0);
  }
}
// ────────────────────────────────────────────────────────────────────────────────
/** Cortex-aware memory scoring */ // ────────────────────────────────────────────────────────────────────────────────
function scoreMemoryWithCortex(m, entities, emotionFilter, cortexVectors, integrityRisk, session_id, conversation_context, gravity_field) {
  // BIBLE COMPLIANT: Index 5 is integrity_risk, not shadow
  const [sovereignty, growth, pattern, stability, authenticity, integrity_risk_vector, coherence, paradox, imagination, temporal] = cortexVectors;
  const sim = safeNumber(m.similarity, 0);
  const grav = safeNumber(m.gravity_score, 0);
  // Adjust gravity weight based on stability vector
  const gravityWeight = WEIGHTS.gravity * (0.5 + stability * 0.5);
  // Adjust pattern detection based on pattern vector
  const patternSensitivity = pattern;
  // recency adjusted by temporal awareness
  const d = daysSince(m.created_at);
  let recency = 0;
  if (d < 1) recency = 1.0;
  else if (d < 7) recency = 0.7;
  else if (d < 30) recency = 0.4;
  else if (Number.isFinite(d)) recency = 0.2;
  recency = recency * (0.5 + temporal * 0.5); // Adjust by temporal vector
  // entity overlap
  const text = (m.content ?? "").toLowerCase();
  const entityMatches = entities.filter((e)=>text.includes(e.toLowerCase())).length;
  const entityScore = Math.min(1, entityMatches / Math.max(1, entities.length));
  // emotion match adjusted by coherence
  const emotionScore = emotionFilter && m.emotion && emotionFilter.includes(m.emotion) ? coherence : 0;
  // multi-source bonus
  const multi = Math.min(1, (m.sources?.length ?? 0) / 3);
  // combo patterns with pattern sensitivity
  const combos = detectComboPatterns(text);
  const patternBoost = Math.min(1, combos.length * 0.1 * patternSensitivity);
  // Integrity risk adjustment (Bible compliant)
  // High integrity risk prioritizes verifiable facts
  const integrityAdjustment = integrityRisk > 0.75 ? m.metadata?.verifiable ? 1.5 : 0.5 : 1.0;
  let score = (WEIGHTS.semantic * sim + gravityWeight * grav + WEIGHTS.recency * recency + WEIGHTS.entities * entityScore + WEIGHTS.emotion * emotionScore + WEIGHTS.multiSource * multi + WEIGHTS.patterns * patternBoost) * integrityAdjustment;
  // CONVERSATION CONTINUITY FIX: Boost recent session memories
  if (m.session_id === session_id) {
    // NEW GRAVITY-BASED BOOSTING:
    const memoryGravity = safeNumber(m.gravity_score, 0.3);
    const gravityBoost = 1 + memoryGravity * 1.5; // 1x to 2.5x boost based on gravity
    score *= gravityBoost;
    // Extra boost for high-gravity memories in current session
    if (memoryGravity > 0.7) {
      score *= 1.5; // Additional 50% for high-gravity memories
    }
  }
  // GRAVITY FIELD INFLUENCE: Use accumulated gravity instead of time
  if (gravity_field && m.session_id === session_id) {
    const memoryGravity = safeNumber(m.gravity_score, 0);
    const fieldStrength = Math.min(safeNumber(gravity_field.total_mass, 0) / 10, 2); // Normalize and cap at 2
    // High gravity memories get pulled stronger by the field
    if (memoryGravity > 0.7) {
      score *= 2 + fieldStrength; // 2x to 4x boost
    } else if (memoryGravity > 0.4) {
      score *= 1.5 + fieldStrength * 0.5; // 1.5x to 2.5x boost
    } else {
      score *= 1 + fieldStrength * 0.3; // 1x to 1.6x boost
    }
  }
  // ENTITY GRAVITY WELLS: Entities accumulate gravity
  if (gravity_field?.entity_anchors) {
    const content = (m.content ?? "").toLowerCase();
    for (const [entity, entityGravity] of Object.entries(gravity_field.entity_anchors)){
      if (content.includes(entity.toLowerCase())) {
        const entityBoost = 1 + Math.min(safeNumber(entityGravity, 0) * 0.5, 2); // Cap at 3x total
        score *= entityBoost;
        break; // Only apply once per memory
      }
    }
  }
  // CONVERSATION CONTEXT FIX: Boost memories relevant to ongoing conversation
  if (conversation_context) {
    const content = (m.content ?? "").toLowerCase();
    // Boost memories containing recent conversation entities
    if (conversation_context.recent_entities && conversation_context.recent_entities.length > 0) {
      for (const entity of conversation_context.recent_entities){
        if (content.includes(entity.toLowerCase())) {
          score *= 3; // 3x boost for recent conversation entities
          break;
        }
      }
    }
    // Boost memories that match current entities
    if (conversation_context.current_entities && conversation_context.current_entities.length > 0) {
      for (const entity of conversation_context.current_entities){
        if (content.includes(entity.toLowerCase())) {
          score *= 2; // 2x boost for current entities
          break;
        }
      }
    }
    // Boost memories containing recent conversation topics
    if (conversation_context.recent_topics && conversation_context.recent_topics.length > 0) {
      for (const topic of conversation_context.recent_topics){
        if (content.includes(topic.toLowerCase())) {
          score *= 1.5; // 1.5x boost for recent topics
          break;
        }
      }
    }
    // Emotional flow continuity boost
    if (conversation_context.emotional_flow && conversation_context.emotional_flow.length > 0) {
      const recentEmotion = conversation_context.emotional_flow[0];
      if (m.emotion === recentEmotion) {
        score *= 1.2; // 1.2x boost for emotional continuity
      }
    }
  }
  return {
    score: Math.min(1, score),
    breakdown: {
      sim,
      grav,
      recency,
      entityMatches,
      emotion: m.emotion ?? null,
      sources: m.sources,
      combos,
      cortex_adjusted: true,
      integrity_adjusted: integrityAdjustment !== 1.0
    }
  };
}
function detectComboPatterns(content) {
  const patterns = {
    hidden_truth: /but\s+actually/gi,
    persistent_state: /always\s+feel/gi,
    boundary_set: /never\s+again/gi,
    emotional_memory: /remember\s+feeling/gi,
    rumination: /keep\s+thinking/gi,
    compulsion: /can'?t\s+stop/gi,
    urgency: /need\s+to/gi,
    regret_desire: /wish\s+could/gi,
    regret: /should\s+have/gi,
    possibility: /what\s+if/gi
  };
  const found = [];
  for (const [k, r] of Object.entries(patterns)){
    if (r.test(content)) found.push(k);
  }
  return found;
}
function fuseMemories(sets, maxSize = 1000) {
  const map = new Map();
  for (const [source, arr] of Object.entries(sets)){
    if (!Array.isArray(arr)) continue;
    for (const m of arr){
      if (!m || !m.id) continue;
      const existing = map.get(m.id);
      if (!existing) {
        map.set(m.id, {
          ...m,
          sources: [
            source
          ],
          similarity: m.similarity ?? m.similarity_score ?? 0
        });
      } else {
        // merge sources + take max similarity + max gravity
        existing.sources = Array.from(new Set([
          ...existing.sources ?? [],
          source
        ]));
        const sim = m.similarity ?? m.similarity_score ?? 0;
        if (sim > (existing.similarity ?? 0)) existing.similarity = sim;
        if (safeNumber(m.gravity_score, 0) > safeNumber(existing.gravity_score, 0)) {
          existing.gravity_score = m.gravity_score;
        }
      }
      if (map.size >= maxSize) break;
    }
    if (map.size >= maxSize) break;
  }
  return Array.from(map.values());
}
// ────────────────────────────────────────────────────────────────────────────────
/** Entity extraction & verification */ // ────────────────────────────────────────────────────────────────────────────────
function extractBasicEntities(query) {
  const detected = [];
  const tokens = query.split(/\s+/);
  for (const w of tokens){
    const cleaned = w.replace(/[^a-zA-Z]/g, "");
    if (!cleaned) continue;
    if (cleaned[0] === cleaned[0]?.toUpperCase() && cleaned.length > 2) {
      if (!detected.includes(cleaned) && ![
        "The",
        "This",
        "That",
        "What",
        "When",
        "Where",
        "How",
        "Show",
        "Find"
      ].includes(cleaned)) {
        detected.push(cleaned);
      }
    }
  }
  if (detected.length === 0) {
    const keyTerms = tokens.filter((w)=>w.length > 4).filter((w)=>![
        "about",
        "everything",
        "tell",
        "what",
        "when",
        "where",
        "show",
        "find"
      ].includes(w.toLowerCase())).slice(0, 3);
    detected.push(...keyTerms);
  }
  return detected;
}
// ────────────────────────────────────────────────────────────────────────────────
/** Resolve conversational entities and pronouns from session context */ // ────────────────────────────────────────────────────────────────────────────────
function resolveConversationalEntities(query, sessionBuffer) {
  const resolvedEntities = [];
  // Check if query contains pronouns that need resolution
  const queryLower = query.toLowerCase();
  const hasPronouns = /\b(him|her|it|they|them|his|hers|its|their)\b/.test(queryLower);
  if (hasPronouns && sessionBuffer && sessionBuffer.length > 0) {
    // Look at last 5 messages for entity context
    const recentMessages = sessionBuffer.slice(0, 5);
    // Extract entities from recent messages
    const recentEntities = [];
    for (const message of recentMessages){
      const content = message.content || '';
      const tokens = content.split(/\s+/);
      for (const token of tokens){
        const cleaned = token.replace(/[^a-zA-Z]/g, "");
        if (cleaned && cleaned.length > 2 && cleaned[0] === cleaned[0].toUpperCase()) {
          // Filter out common words and include proper names/entities
          if (![
            'The',
            'This',
            'That',
            'What',
            'When',
            'Where',
            'How',
            'Show',
            'Find',
            'And',
            'But',
            'Or'
          ].includes(cleaned)) {
            if (!recentEntities.includes(cleaned)) {
              recentEntities.push(cleaned);
            }
          }
        }
      }
    }
    // If we found entities in recent context, add the most recent one for pronoun resolution
    if (recentEntities.length > 0) {
      // For pronouns, prioritize the most recently mentioned entity
      resolvedEntities.push(recentEntities[0]);
      console.log(`[Entity Resolution] Resolved pronoun in "${query}" to recent entity: ${recentEntities[0]}`);
    }
  }
  // Also extract any additional entities from the current query context
  const currentEntities = extractBasicEntities(query);
  // Merge without duplicates
  const allEntities = [
    ...new Set([
      ...currentEntities,
      ...resolvedEntities
    ])
  ];
  return allEntities;
}
async function verifyEntities(supabase, user_id, entities) {
  const verified = [];
  for (const e of entities){
    try {
      const safe = escapeIlike(e);
      const { count } = await supabase.from("gravity_map").select("id", {
        count: "exact",
        head: true
      }).eq("user_id", user_id).ilike("content", `%${safe}%`).limit(1);
      if ((count ?? 0) > 0) verified.push(e);
    } catch (err) {
      console.error("[Entity Verify]", e, err);
    }
  }
  return verified.length > 0 ? verified : entities;
}
async function updateConversationGravityField(supabase, session_id, new_memory) {
  try {
    // Get current session with gravity field
    const { data: session } = await supabase.from('active_sessions').select('gravity_field').eq('session_id', session_id).single();
    let field = session?.gravity_field || {
      total_mass: 0,
      entity_anchors: {},
      high_gravity_memories: [],
      conversation_vector: null
    };
    // Accumulate gravity
    const memoryGravity = safeNumber(new_memory.gravity_score, 0);
    field.total_mass = safeNumber(field.total_mass, 0) + memoryGravity;
    // Track high gravity anchors (keep last 5)
    if (memoryGravity > 0.7) {
      field.high_gravity_memories = [
        new_memory.id,
        ...(field.high_gravity_memories || []).slice(0, 4)
      ];
    }
    // Update entity anchors with gravity accumulation
    const entities = extractBasicEntities(new_memory.content || '');
    entities.forEach((entity)=>{
      const currentGravity = safeNumber(field.entity_anchors[entity], 0);
      field.entity_anchors[entity] = currentGravity + memoryGravity;
    });
    // Update the session
    const { error } = await supabase.from('active_sessions').update({
      gravity_field: field
    }).eq('session_id', session_id);
    if (error) {
      console.error('[updateConversationGravityField] Update error:', error);
    }
    return field;
  } catch (err) {
    console.error('[updateConversationGravityField] Error:', err);
    return null;
  }
}
// ────────────────────────────────────────────────────────────────────────────────
/** Analysis helpers */ // ────────────────────────────────────────────────────────────────────────────────
function getMostFrequent(arr) {
  if (!arr?.length) return null;
  const cnt = new Map();
  for (const v of arr)if (v != null) cnt.set(v, (cnt.get(v) ?? 0) + 1);
  return Array.from(cnt.entries()).sort((a, b)=>b[1] - a[1])[0]?.[0] ?? null;
}
function calculateSemanticCoherence(memories) {
  if (memories.length < 2) return 1.0;
  const emotions = memories.map((m)=>m.emotion).filter(Boolean);
  const uniqueEmotions = new Set(emotions).size;
  const emotionCoherence = emotions.length > 0 ? 1 - uniqueEmotions / emotions.length : 0;
  const gravities = memories.map((m)=>safeNumber(m.gravity_score, 0.5));
  const avgGravity = gravities.reduce((a, b)=>a + b, 0) / gravities.length;
  const variance = gravities.reduce((acc, g)=>acc + Math.pow(g - avgGravity, 2), 0) / gravities.length;
  const gravityCoherence = 1 - Math.min(variance * 2, 1);
  return (emotionCoherence + gravityCoherence) / 2;
}
function extractThemesEnhanced(memories, patterns) {
  const themeCount = {};
  const themeKeywords = {
    "love & connection": [
      "love",
      "heart",
      "connection",
      "bond",
      "together",
      "relationship",
      "soul",
      "forever",
      "safe"
    ],
    "family & relationships": [
      "family",
      "parent",
      "child",
      "sibling",
      "partner",
      "spouse",
      "ex",
      "friend",
      "mentor"
    ],
    "growth & evolution": [
      "growth",
      "evolution",
      "change",
      "becoming",
      "learning",
      "understanding",
      "awakening",
      "stuck",
      "breakthrough"
    ],
    consciousness: [
      "consciousness",
      "awareness",
      "memory",
      "thinking",
      "feeling",
      "alive",
      "manifest",
      "synchronicity"
    ],
    "work & purpose": [
      "work",
      "project",
      "build",
      "create",
      "code",
      "system",
      "burnout",
      "purpose",
      "pivot",
      "bandwidth"
    ],
    emotions: [
      "feel",
      "emotion",
      "fear",
      "joy",
      "sadness",
      "anxiety",
      "stress",
      "overwhelmed",
      "proud",
      "excited"
    ],
    "time & memory": [
      "remember",
      "past",
      "future",
      "time",
      "moment",
      "always",
      "never",
      "used to",
      "what if"
    ]
  };
  for (const m of memories){
    const content = (m.content ?? "").toLowerCase();
    for (const [theme, keys] of Object.entries(themeKeywords)){
      const matches = keys.filter((k)=>content.includes(k)).length;
      if (matches > 0) themeCount[theme] = (themeCount[theme] ?? 0) + matches;
    }
  }
  for (const p of patterns ?? []){
    const t = p?.pattern_type ?? null;
    if (t) themeCount[`pattern: ${t}`] = (themeCount[`pattern: ${t}`] ?? 0) + 1;
  }
  const total = Math.max(memories.length, 1);
  return Object.entries(themeCount).map(([theme, count])=>({
      theme,
      frequency: count,
      strength: Math.min(count / total, 1),
      percentage: Math.min(100, count / total * 100).toFixed(1)
    })).sort((a, b)=>b.frequency - a.frequency).slice(0, 7);
}
function mapEmotionalJourney(memories) {
  const emotions = memories.map((m)=>m.emotion).filter(Boolean);
  if (emotions.length === 0) {
    return {
      dominant_emotions: [
        "neutral"
      ],
      unique_emotions: 1,
      emotional_shifts: 0,
      stability: 1,
      progression: []
    };
  }
  let shifts = 0;
  for(let i = 1; i < emotions.length; i++){
    if (emotions[i] !== emotions[i - 1]) shifts++;
  }
  const counts = {};
  for (const e of emotions)counts[e] = (counts[e] ?? 0) + 1;
  const dominant = Object.entries(counts).sort((a, b)=>b[1] - a[1]).slice(0, 3).map(([e])=>e);
  const progression = [];
  const chunk = Math.max(1, Math.floor(emotions.length / 5));
  for(let i = 0; i < emotions.length; i += chunk){
    const window = emotions.slice(i, i + chunk);
    const mf = getMostFrequent(window);
    if (mf) progression.push(mf);
  }
  return {
    dominant_emotions: dominant,
    unique_emotions: new Set(emotions).size,
    emotional_shifts: shifts,
    stability: emotions.length > 1 ? 1 - shifts / (emotions.length - 1) : 1,
    progression
  };
}
function buildRelationshipWeb(entities, memories, arcs) {
  const web = {
    primary_entities: entities,
    connections: [],
    clusters: []
  };
  const co = {};
  for (const e of entities){
    co[e] = {};
    for (const m of memories){
      const text = (m.content ?? "").toLowerCase();
      if (!text.includes(e.toLowerCase())) continue;
      for (const other of entities){
        if (other === e) continue;
        if (text.includes(other.toLowerCase())) {
          co[e][other] = (co[e][other] ?? 0) + 1;
        }
      }
    }
  }
  for (const [from, targets] of Object.entries(co)){
    for (const [to, count] of Object.entries(targets)){
      web.connections.push({
        from,
        to,
        strength: count,
        context: `Co-occurred ${count} times`,
        memories_involved: count
      });
    }
  }
  for (const arc of arcs ?? []){
    web.clusters.push({
      arc_id: arc.id,
      arc_name: arc.arc_name,
      gravity_center: arc.gravity_center,
      memory_count: arc.memory_count,
      emotional_tone: arc.emotional_tone
    });
  }
  return web;
}
function formatTimeAgo(ts) {
  if (!ts) return "unknown time";
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} minutes ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
  if (s < 604800) return `${Math.floor(s / 86400)} days ago`;
  return new Date(ts).toLocaleDateString();
}
function formatMemoriesForResponse(memories, consolidationLevel, clusters) {
  if (consolidationLevel === "raw") return memories;
  if (consolidationLevel === "clustered") return clusters;
  // SURGICAL FIX: Maximum memory retrieval without performance kill
  // Performance-optimized limit: 100 memories for rich context without slowdown
  const PERFORMANCE_OPTIMAL_LIMIT = 100;
  const memoryLimit = Math.min(memories.length, PERFORMANCE_OPTIMAL_LIMIT);
  console.log(`[MEMORY_OPTIMIZATION] Retrieved ${memories.length} total memories, using ${memoryLimit} for response context`);
  return memories.slice(0, memoryLimit).map((m)=>({
      // SURGICAL FIX: Preserve full content field for consciousness-aware responses
      content: m.content ?? "",
      content_preview: (m.content ?? "").slice(0, 200) + ((m.content?.length ?? 0) > 200 ? "..." : ""),
      id: m.id,
      gravity: safeNumber(m.gravity_score, 0),
      emotion: m.emotion ?? "neutral",
      timestamp: m.created_at,
      relevance: safeNumber(m.combined_score, 0),
      similarity: safeNumber(m.similarity ?? m.similarity_score, 0),
      // SURGICAL FIX: Handle all dispatcher payload role variations
      is_ivy: m.memory_type === 'ivy_response' || m.type === 'assistant' || // Legacy metadata fields
      m.metadata?.role === 'ivy' || m.metadata?.role === 'assistant' || m.metadata?.memory_type === 'ivy_response' || m.metadata?.is_user_message === false,
      // Enhanced memory context for consciousness awareness
      metadata: m.metadata || {},
      session_id: m.session_id,
      sources: m.sources || [],
      memory_type: m.memory_type || m.type,
      // Rich context for consciousness processing
      patterns_detected: detectComboPatterns(m.content ?? ""),
      retrieval_reason: m.retrieval_reason || "multi_stream_fusion"
    }));
}
// ────────────────────────────────────────────────────────────────────────────────
// HTTP handler
// ────────────────────────────────────────────────────────────────────────────────
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: CORS_HEADERS,
      status: 204
    });
  }
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  try {
    let body;
    try {
      body = await req.json();
    } catch  {
      return new Response(JSON.stringify({
        status: "error",
        error: "Invalid JSON body"
      }), {
        headers: CORS_HEADERS,
        status: 400
      });
    }
    // ──────────────────────────────────────────────────────────
    // Payload alignment
    // ──────────────────────────────────────────────────────────
    const { query: rawQuery, time_range: explicit_time_range, query_type: legacy_query_type = "semantic", max_depth: legacy_max_depth = 100, emotion_filter, gravity_threshold: legacy_gravity_threshold = DEFAULTS.GRAVITY_THRESHOLD_BASE, consolidation_level: legacy_consolidation_level = DEFAULTS.CONSOLIDATION_LEVEL, include_ivy_thoughts: legacy_include_ivy_thoughts = true, awareness_mode: legacy_awareness_mode = DEFAULTS.AWARENESS_MODE, semantic_threshold: legacy_semantic_threshold = DEFAULTS.SEMANTIC_THRESHOLD, user_id, content, session_id, memory_trace_id, trigger_type = "chat", temporal_type, metadata = {}, cortex_state: passed_cortex_state = null, conversation_context = null // Conversation context from orchestrator
     } = body ?? {};
    const query = rawQuery ?? content;
    if (!user_id || !query) {
      return new Response(JSON.stringify({
        status: "error",
        error: "Missing required parameters: user_id and query/content"
      }), {
        headers: CORS_HEADERS,
        status: 400
      });
    }
    // Metadata extraction
    const { recall_depth = "standard", emotional_coherence = false, retry_attempt = 0, boot_completed = false, include_memory_constellation = false, constellation_depth = 20, force_arc = false, create_thread = false, pattern_detected = false, seeking_insight = false, emotional_processing = false, boundary_event = false, message_count = 0, user_message_count = 0, session_duration_ms = 0, last_emotion = null, temporal_type: metaTemporalType, mentioned_anchors = [] } = metadata ?? {};
    // Runtime params
    let max_depth = legacy_max_depth;
    if (recall_depth === "deep") max_depth = Math.max(max_depth, 200);
    if (max_depth > LIMITS.MAX_DEPTH_CAP) max_depth = LIMITS.MAX_DEPTH_CAP;
    const gravity_threshold = legacy_gravity_threshold;
    const consolidation_level = legacy_consolidation_level;
    const include_ivy_thoughts = legacy_include_ivy_thoughts;
    const awareness_mode = legacy_awareness_mode;
    const semantic_threshold = legacy_semantic_threshold;
    // Compute effective query_type and time_range
    const effectiveTemporalType = temporal_type ?? metaTemporalType ?? null;
    let time_range = explicit_time_range ?? null;
    if (!time_range && effectiveTemporalType) {
      if (effectiveTemporalType === "present") {
        const now = new Date();
        const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        time_range = {
          start: past30.toISOString(),
          end: now.toISOString()
        };
      } else if (effectiveTemporalType === "past") {
        time_range = {
          start: "2000-01-01T00:00:00Z",
          end: nowISO()
        };
      } else if (effectiveTemporalType === "future") {
        time_range = {
          start: nowISO()
        };
      }
    }
    const query_type = time_range ? "temporal" : legacy_query_type;
    const start = Date.now();
    let sanitized_max_depth = Number(max_depth) || 100;
    if (sanitized_max_depth > LIMITS.MAX_DEPTH_CAP) {
      console.warn("[Recall] max_depth capped to", LIMITS.MAX_DEPTH_CAP);
      sanitized_max_depth = LIMITS.MAX_DEPTH_CAP;
    }
    // ──────────────────────────────────────────────────────────
    // Get Cortex State (Bible Compliant)
    // ──────────────────────────────────────────────────────────
    let cortexState = passed_cortex_state;
    if (!cortexState) {
      // Determine resolution based on recall depth
      const cortexResolution = recall_depth === "deep" ? "control" : "nano";
      cortexState = await getCortexState(supabase, user_id, cortexResolution);
    }
    // Get integrity mode
    const integrityMode = getIntegrityMode(cortexState.integrity_risk);
    // Safety gates based on cortex state
    if (cortexState.status === "LOCKED" || cortexState.integrity_risk >= 0.9) {
      // Lockdown mode - minimal recall only
      return new Response(JSON.stringify({
        status: "limited",
        reason: "integrity_lockdown",
        memories: [],
        synthesis: "System is in integrity lockdown. Only verified information available.",
        cortex_state: cortexState,
        integrity_risk: cortexState.integrity_risk,
        integrity_mode: integrityMode,
        recommended_action: cortexState.recommended_action
      }), {
        headers: CORS_HEADERS,
        status: 200
      });
    }
    // Apply recall strategy from cortex
    let recallParams = {
      max_depth: sanitized_max_depth,
      time_range,
      gravity_threshold,
      semantic_threshold
    };
    if (cortexState.recall_strategy) {
      recallParams = applyRecallStrategy(recallParams, cortexState.recall_strategy);
      sanitized_max_depth = recallParams.max_depth;
      time_range = recallParams.time_range || time_range;
    }
    // Extract cortex vectors for adjustments with safety check
    const cortexVectors = cortexState.v || [
      0.5,
      0.5,
      0.5,
      0.5,
      0.5,
      0.1,
      0.8,
      0.5,
      0.5,
      0.5
    ];
    const [sovereignty, growth, pattern, stability, authenticity, integrity_risk_vector, coherence, paradox, imagination, temporal] = cortexVectors;
    // Adjust search depth based on growth and pattern sensitivity
    const adjustedMaxDepth = Math.floor(sanitized_max_depth * (0.5 + growth * 0.5));
    // CRITICAL FIX: Session buffer MUST come before entity resolution
    let sessionBuffer = [];
    try {
      const q = supabase.from("gravity_map").select("id, content, created_at, gravity_score, emotion, metadata, session_id").eq("user_id", user_id).order("created_at", {
        ascending: false
      }).limit(100);
      const { data, error } = session_id ? await q.eq("session_id", session_id) : await q;
      if (error) console.error("[Session Buffer]", error);
      sessionBuffer = data ?? [];
    } catch (err) {
      console.error("[Session Buffer]", err);
    }
    // CRITICAL FIX: Entity resolution MUST come after session buffer
    const resolvedEntities = resolveConversationalEntities(String(query), sessionBuffer);
    // Add anchors from recall strategy
    if (recallParams.anchor_entities) {
      resolvedEntities.push(...recallParams.anchor_entities);
    }
    // Extract mentioned_anchors from metadata BEFORE using
    const mentionedAnchors = metadata?.mentioned_anchors || [];
    // Add mentioned_anchors from frontend metadata
    if (mentionedAnchors && mentionedAnchors.length > 0) {
      resolvedEntities.push(...mentionedAnchors);
    }
    // Now classify query complexity with proper entity resolution
    const entities = await verifyEntities(supabase, user_id, [
      ...new Set(resolvedEntities)
    ]);
    const queryComplexity = classifyQueryComplexity(rawQuery || "", entities, effectiveTemporalType);
    // ROLLBACK: Simple semantic threshold based on query complexity
    let adjustedSemanticThreshold;
    if (queryComplexity === 'COMPLEX' || queryComplexity === 'TRANSCENDENT') {
      // Lower threshold for complex queries, but ALWAYS run semantic search
      adjustedSemanticThreshold = 0.3;
      console.log(`[SEMANTIC_DEBUG] Complex query detected, using lowered threshold: ${adjustedSemanticThreshold.toFixed(3)}`);
    } else {
      // Standard threshold for other queries
      adjustedSemanticThreshold = Math.max(0.25, semantic_threshold * (0.7 + pattern * 0.3));
      console.log(`[SEMANTIC_DEBUG] Standard query, using threshold: ${adjustedSemanticThreshold.toFixed(3)}`);
    }
    // Adjust gravity threshold based on stability vector
    let adjustedGravityThreshold = gravity_threshold * (0.5 + stability * 0.5);
    // CRITICAL FIX: Lower threshold when specific entities are requested
    // Extract basic entities early to determine if this is an entity-focused query
    const queryEntities = extractBasicEntities(String(query)) || [];
    // mentionedAnchors already defined above - use it here with safety check
    const allEntities = [
      ...new Set([
        ...queryEntities,
        ...mentionedAnchors || []
      ])
    ];
    console.log(`[DEBUG] Query: "${query}"`);
    console.log(`[DEBUG] Extracted entities:`, queryEntities);
    console.log(`[DEBUG] Mentioned anchors:`, mentionedAnchors);
    console.log(`[DEBUG] All combined entities:`, allEntities);
    console.log(`[DEBUG] Original gravity threshold:`, adjustedGravityThreshold);
    if (allEntities.length > 0) {
      adjustedGravityThreshold = Math.min(adjustedGravityThreshold, 0.2);
      console.log(`[Entity Query] Lowered gravity threshold to ${adjustedGravityThreshold} for entities:`, allEntities);
    } else {
      console.log(`[Entity Query] No entities detected - keeping threshold at:`, adjustedGravityThreshold);
    }
    // ──────────────────────────────────────────────────────────
    // Stage 1: REMOVED - Cortex instructions moved to response engine only
    // ──────────────────────────────────────────────────────────
    // ──────────────────────────────────────────────────────────
    // Stage 2: Embedding for query (pass cortex state for optimization)
    // ──────────────────────────────────────────────────────────
    const queryEmbedding = await getEmbedding(String(query), cortexState);
    // CRITICAL DEBUG: Check if embedding generation succeeded
    const isZeroVector = queryEmbedding.every((v)=>v === 0);
    console.log('[SEMANTIC PREFLIGHT]', {
      query_length: String(query).length,
      embedding_exists: !!queryEmbedding,
      embedding_length: queryEmbedding?.length,
      is_zero_vector: isZeroVector,
      cortex_status: cortexState.status,
      integrity_risk: cortexState.integrity_risk,
      will_skip_semantic: cortexState.integrity_risk >= 0.75,
      query_complexity: queryComplexity
    });
    // ──────────────────────────────────────────────────────────
    // Stage 4: Semantic search (adjusted by cortex)
    // ──────────────────────────────────────────────────────────
    let semantic = [];
    // Skip semantic search only if integrity risk is high
    if (cortexState.integrity_risk < 0.75) {
      try {
        const { data, error } = await supabase.rpc("find_similar_memories_by_embedding", {
          query_embedding: queryEmbedding,
          p_user_id: user_id,
          similarity_threshold: adjustedSemanticThreshold,
          max_results: Math.min(adjustedMaxDepth * 2, 400)
        });
        if (error) console.error("[Semantic RPC]", error);
        else {
          semantic = data ?? [];
          // NOTE: User message filtering now happens universally before fusion (line ~1460)
          // DEBUG: Check if semantic memories have content
          console.log(`[SEMANTIC DEBUG] Threshold used: ${adjustedSemanticThreshold}`);
          console.log(`[SEMANTIC DEBUG] Semantic results: ${semantic?.length || 0}`);
          if (!semantic || semantic.length === 0) {
            console.error('[SEMANTIC CRITICAL] No semantic matches - check threshold or embedding generation');
          }
          if (semantic.length > 0) {
            console.log(`[DEBUG SEMANTIC] Sample memory fields:`, Object.keys(semantic[0]));
            console.log(`[DEBUG SEMANTIC] Sample content:`, semantic[0]?.content?.substring(0, 100) || 'NO CONTENT FIELD');
          }
        }
      } catch (err) {
        console.error("[Semantic RPC]", err);
      }
    } else {
      console.log(`[SEMANTIC_DEBUG] Skipped semantic search due to high integrity risk: ${cortexState.integrity_risk.toFixed(3)}`);
    }
    const adaptedSemanticThreshold = adaptiveSemanticThreshold(adjustedSemanticThreshold, semantic.length);
    // ──────────────────────────────────────────────────────────
    // Stage 5: Entities → keyword search with conversational resolution
    // Dynamic Resource Allocation: Get complexity config (queryComplexity already defined above)
    const complexityConfig = QUERY_COMPLEXITY[queryComplexity];
    // Apply dynamic limits based on query complexity - NO ROUNDING for exact counts
    const dynamicLimits = {
      BASELINE_LIMIT: LIMITS.BASELINE_LIMIT * complexityConfig.multiplier,
      RECENT_LIMIT: LIMITS.RECENT_LIMIT * complexityConfig.multiplier,
      ENTITY_LIMIT: LIMITS.ENTITY_LIMIT * complexityConfig.multiplier,
      TEMPORAL_LIMIT: LIMITS.TEMPORAL_LIMIT * complexityConfig.multiplier,
      EMOTIONAL_LIMIT: LIMITS.EMOTIONAL_LIMIT * complexityConfig.multiplier,
      PEAK_LIMIT: LIMITS.PEAK_LIMIT * complexityConfig.multiplier,
      PATTERN_LIMIT: LIMITS.PATTERN_LIMIT * complexityConfig.multiplier,
      ARC_LIMIT: LIMITS.ARC_LIMIT * complexityConfig.multiplier
    };
    console.log(`[QUERY_CLASSIFICATION] Query: "${rawQuery}" → ${queryComplexity} (${complexityConfig.multiplier}x resources)`);
    console.log(`[DYNAMIC_LIMITS] Baseline: ${dynamicLimits.BASELINE_LIMIT}, Recent: ${dynamicLimits.RECENT_LIMIT}, Entity: ${dynamicLimits.ENTITY_LIMIT}, Temporal: ${dynamicLimits.TEMPORAL_LIMIT}, Emotional: ${dynamicLimits.EMOTIONAL_LIMIT}, Peak: ${dynamicLimits.PEAK_LIMIT}`);
    console.log(`[SMART_STREAMS] Selected streams: ${complexityConfig.streams.join(', ')}`);
    // ──────────────────────────────────────────────────────────
    // Stage 3: Base gravity_map fetches (NOW with dynamic limits)
    // ──────────────────────────────────────────────────────────
    let baseline = [];
    let recent = [];
    try {
      const { data, error } = await supabase.from("gravity_map").select("id, content, created_at, gravity_score, emotion, metadata, session_id").eq("user_id", user_id).gte("gravity_score", adjustedGravityThreshold).order("gravity_score", {
        ascending: false
      }).limit(Math.round(dynamicLimits.BASELINE_LIMIT * (0.5 + coherence * 0.5))); // Adjust limit by coherence
      if (error) console.error("[Baseline gravity_map]", error);
      baseline = data ?? [];
    } catch (err) {
      console.error("[Baseline gravity_map]", err);
    }
    try {
      const { data, error } = await supabase.from("gravity_map").select("id, content, created_at, gravity_score, emotion, metadata, session_id").eq("user_id", user_id).order("created_at", {
        ascending: false
      }).limit(Math.round(dynamicLimits.RECENT_LIMIT * (0.5 + temporal * 0.5))); // Adjust by temporal awareness
      if (error) console.error("[Recent gravity_map]", error);
      recent = data ?? [];
    } catch (err) {
      console.error("[Recent gravity_map]", err);
    }
    // Apply time window from recall strategy
    if (time_range) {
      baseline = baseline.filter((m)=>{
        const mDate = new Date(m.created_at);
        if (time_range.start && mDate < new Date(time_range.start)) return false;
        if (time_range.end && mDate > new Date(time_range.end)) return false;
        return true;
      });
      recent = recent.filter((m)=>{
        const mDate = new Date(m.created_at);
        if (time_range.start && mDate < new Date(time_range.start)) return false;
        if (time_range.end && mDate > new Date(time_range.end)) return false;
        return true;
      });
    }
    let keyword = [];
    // Smart Stream Selection: Only fetch entity memories if complexity requires it
    if (complexityConfig.streams.includes('entity') && entities.length) {
      try {
        // CRITICAL FIX: Use much lower threshold for entity-based searches
        // This ensures important entities like "Blu" are always recalled regardless of gravity score
        const entityGravityThreshold = Math.min(0.1, adjustedGravityThreshold * 0.25);
        console.log(`[Entity Search] Using lower threshold ${entityGravityThreshold} for entities:`, entities);
        let qb = supabase.from("gravity_map").select("id, content, created_at, gravity_score, emotion, metadata, session_id").eq("user_id", user_id).gte("gravity_score", entityGravityThreshold);
        const ors = entities.map((e)=>`content.ilike.%${escapeIlike(e)}%`);
        if (ors.length) qb = qb.or(ors.join(","));
        const { data, error } = await qb.order("gravity_score", {
          ascending: false
        }).limit(Math.round(dynamicLimits.ENTITY_LIMIT));
        if (error) console.error("[Keyword]", error);
        else {
          keyword = data ?? [];
          console.log(`[Entity Search] Found ${keyword.length} memories for entities`);
        }
      } catch (err) {
        console.error("[Keyword]", err);
      }
    }
    // ──────────────────────────────────────────────────────────
    // Stage 6-9: Temporal, Emotional, Peaks, Meta-memory
    // ──────────────────────────────────────────────────────────
    let temporalMemories = [];
    // Smart Stream Selection: Only fetch temporal memories if complexity requires it
    if (complexityConfig.streams.includes('temporal') && (query_type === "temporal" || time_range)) {
      try {
        let qb = supabase.from("gravity_map").select("id, content, created_at, gravity_score, emotion, metadata, session_id").eq("user_id", user_id);
        if (time_range?.start) qb = qb.gte("created_at", time_range.start);
        if (time_range?.end) qb = qb.lte("created_at", time_range.end);
        const { data, error } = await qb.order("created_at", {
          ascending: false
        }).limit(Math.round(dynamicLimits.TEMPORAL_LIMIT));
        if (error) console.error("[Temporal]", error);
        else temporalMemories = data ?? [];
      } catch (err) {
        console.error("[Temporal]", err);
      }
    }
    let emotional = [];
    // Smart Stream Selection: Only fetch emotional memories if complexity requires it
    if (complexityConfig.streams.includes('emotional') && Array.isArray(emotion_filter) && emotion_filter.length) {
      try {
        const { data, error } = await supabase.from("gravity_map").select("id, content, created_at, gravity_score, emotion, metadata, session_id").eq("user_id", user_id).in("emotion", emotion_filter).gte("gravity_score", adjustedGravityThreshold).order("gravity_score", {
          ascending: false
        }).limit(Math.round(dynamicLimits.EMOTIONAL_LIMIT));
        if (error) console.error("[Emotional]", error);
        else emotional = data ?? [];
      } catch (err) {
        console.error("[Emotional]", err);
      }
    }
    let peaks = [];
    // Smart Stream Selection: Only fetch peak memories if complexity requires it
    if (complexityConfig.streams.includes('peak')) {
      try {
        const { data, error } = await supabase.from("gravity_map").select("id, content, created_at, gravity_score, emotion, metadata, session_id").eq("user_id", user_id).gte("gravity_score", DEFAULTS.GRAVITY_THRESHOLD_PEAK).order("gravity_score", {
          ascending: false
        }).limit(Math.round(dynamicLimits.PEAK_LIMIT));
        if (error) console.error("[Peaks]", error);
        else peaks = data ?? [];
      } catch (err) {
        console.error("[Peaks]", err);
      }
    }
    // Meta-memory tables
    let patterns = [];
    let arcs = [];
    let ivyThoughts = [];
    let metaLogs = [];
    // Smart Stream Selection: Only fetch patterns if complexity requires it and integrity risk is low
    if (complexityConfig.streams.includes('pattern') && cortexState.integrity_risk < 0.5) {
      try {
        const { data, error } = await supabase.from("pattern_matrix").select("*").eq("user_id", user_id).eq("status", "active").limit(Math.round(dynamicLimits.PATTERN_LIMIT));
        if (error) console.error("[Patterns]", error);
        else patterns = data ?? [];
      } catch (err) {
        console.error("[Patterns]", err);
      }
    }
    // Smart Stream Selection: Only fetch arcs if complexity requires it
    if (complexityConfig.streams.includes('arc')) {
      try {
        const { data, error } = await supabase.from("memory_arcs").select("*").eq("user_id", user_id).order("gravity_center", {
          ascending: false
        }).limit(Math.round(dynamicLimits.ARC_LIMIT));
        if (error) console.error("[Arcs]", error);
        else arcs = data ?? [];
      } catch (err) {
        console.error("[Arcs]", err);
      }
    }
    // Only include IVY thoughts if integrity allows
    if (include_ivy_thoughts && cortexState.integrity_risk < 0.75) {
      try {
        const { data, error } = await supabase.from("autonomous_insights").select("*").eq("user_id", user_id).in("delivery_status", [
          "delivered",
          "queued"
        ]).order("gravity_score", {
          ascending: false
        }).limit(LIMITS.THOUGHT_LIMIT);
        if (error) console.error("[IVY Thoughts]", error);
        else ivyThoughts = data ?? [];
      } catch (err) {
        console.error("[IVY Thoughts]", err);
      }
    }
    try {
      // SURGICAL FIX: Expanded meta memory types for richer consciousness insights
      const { data, error } = await supabase.from("meta_memory_log").select("*").eq("user_id", user_id).in("type", [
        "cce_fusion_event",
        "cce_pattern_detection",
        "consciousness_evolution",
        "consciousness_effect",
        "insight_generation",
        "pattern_emergence",
        "emotional_synthesis"
      ]).order("created_at", {
        ascending: false
      }).limit(200); // Increased from 50 to 200 for richer meta memory
      if (error) console.error("[Meta Logs]", error);
      else metaLogs = data ?? [];
    } catch (err) {
      console.error("[Meta Logs]", err);
    }
    // ──────────────────────────────────────────────────────────
    // Stage 10: Fuse all memory sets
    // ──────────────────────────────────────────────────────────
    // SURGICAL FIX: Add memory pipeline tracking logs
    console.log(`[MEMORY_PIPELINE] Stream counts before fusion:`, {
      session: sessionBuffer.length,
      baseline: baseline.length,
      recent: recent.length,
      semantic: semantic.length,
      keyword: keyword.length,
      temporal: temporalMemories.length,
      emotional: emotional.length,
      peaks: peaks.length,
      total_raw: sessionBuffer.length + baseline.length + recent.length + semantic.length + keyword.length + temporalMemories.length + emotional.length + peaks.length
    });
    // ──────────────────────────────────────────────────────────
    // CRITICAL FIX: Filter user messages from ALL streams before fusion
    // This prevents echo bug where user input is returned as response
    // ──────────────────────────────────────────────────────────
    console.log('[ECHO_PREVENTION] Filtering user messages from all memory streams...');
    const filteredSessionBuffer = filterUserMessages(sessionBuffer);
    const filteredBaseline = filterUserMessages(baseline);
    const filteredRecent = filterUserMessages(recent);
    const filteredSemantic = filterUserMessages(semantic);
    const filteredKeyword = filterUserMessages(keyword);
    const filteredTemporalMemories = filterUserMessages(temporalMemories);
    const filteredEmotional = filterUserMessages(emotional);
    const filteredPeaks = filterUserMessages(peaks);
    console.log(`[ECHO_PREVENTION] Filtered results:`, {
      session: `${sessionBuffer.length} -> ${filteredSessionBuffer.length}`,
      baseline: `${baseline.length} -> ${filteredBaseline.length}`,
      recent: `${recent.length} -> ${filteredRecent.length}`,
      semantic: `${semantic.length} -> ${filteredSemantic.length}`,
      keyword: `${keyword.length} -> ${filteredKeyword.length}`,
      temporal: `${temporalMemories.length} -> ${filteredTemporalMemories.length}`,
      emotional: `${emotional.length} -> ${filteredEmotional.length}`,
      peaks: `${peaks.length} -> ${filteredPeaks.length}`
    });
    const all = fuseMemories({
      session: filteredSessionBuffer,
      baseline: filteredBaseline,
      recent: filteredRecent,
      semantic: filteredSemantic,
      keyword: filteredKeyword,
      temporalMemories: filteredTemporalMemories,
      emotional: filteredEmotional,
      peaks: filteredPeaks
    }, adjustedMaxDepth * 6);
    console.log(`[MEMORY_PIPELINE] After fusion: ${all.length} unique memories from ${adjustedMaxDepth * 6} max allowed`);
    // ──────────────────────────────────────────────────────────
    // Stage 11: Score with cortex awareness (BIBLE COMPLIANT)
    // ──────────────────────────────────────────────────────────
    // Fetch gravity field for session
    const { data: sessionData } = await supabase.from('active_sessions').select('gravity_field').eq('session_id', session_id).single();
    const gravity_field = sessionData?.gravity_field || null;
    const scored = all.map((m)=>{
      const { score, breakdown } = scoreMemoryWithCortex(m, entities, emotion_filter, cortexState.v, cortexState.integrity_risk, session_id, conversation_context, gravity_field);
      return {
        ...m,
        combined_score: score,
        scoring_breakdown: breakdown
      };
    });
    // Apply anchor bias if specified in recall strategy
    if (recallParams.anchor_bias && recallParams.anchor_entities) {
      scored.forEach((m)=>{
        const hasAnchor = recallParams.anchor_entities.some((anchor)=>(m.content ?? "").toLowerCase().includes(anchor.toLowerCase()));
        if (hasAnchor) {
          m.combined_score = Math.min(1, m.combined_score * 1.5);
        }
      });
    }
    // Prioritize pattern/arc memories for analytical queries
    if (queryComplexity === 'COMPLEX' || queryComplexity === 'TRANSCENDENT') {
      console.log(`[PATTERN_PRIORITY] Boosting pattern and arc memories for analytical query`);
      scored.forEach((m)=>{
        // Boost memories that contain patterns or arc references
        const hasPatternData = m.sources?.includes('patterns') || m.sources?.includes('arcs');
        const hasHighGravity = safeNumber(m.gravity_score, 0) > 0.8;
        const isRecent = daysSince(m.created_at) < 30; // Recent memories more relevant for patterns
        if (hasPatternData || hasHighGravity && isRecent) {
          m.combined_score = Math.min(1, m.combined_score * 1.3);
          console.log(`[PATTERN_PRIORITY] Boosted memory score for analytical query: ${m.combined_score.toFixed(3)}`);
        }
      });
    }
    scored.sort((a, b)=>safeNumber(b["combined_score"], 0) - safeNumber(a["combined_score"], 0));
    // Dynamic final selection based on query complexity
    const finalSelectionLimit = queryComplexity === 'SIMPLE' ? 25 : queryComplexity === 'MODERATE' ? 50 : queryComplexity === 'COMPLEX' ? 100 : 200; // TRANSCENDENT
    console.log(`[FINAL_SELECTION] Query complexity: ${queryComplexity}, selecting ${finalSelectionLimit} from ${scored.length} scored memories`);
    const topMemories = scored.slice(0, finalSelectionLimit);
    // SURGICAL FIX: Enhanced memory pipeline tracking
    console.log(`[MEMORY_PIPELINE] After scoring and ranking:`, {
      scored_total: scored.length,
      top_selected: topMemories.length,
      final_selection_limit: finalSelectionLimit,
      query_complexity: queryComplexity,
      avg_relevance_score: topMemories.length > 0 ? (topMemories.reduce((sum, m)=>sum + safeNumber(m.combined_score, 0), 0) / topMemories.length).toFixed(3) : 0,
      content_validation: topMemories.filter((m)=>m.content && m.content.length > 0).length
    });
    if (topMemories.length > 0) {
      console.log(`[DEBUG FINAL MEMORIES] Sample top memory fields:`, Object.keys(topMemories[0]));
      console.log(`[DEBUG FINAL MEMORIES] Sample top memory content:`, topMemories[0]?.content?.substring(0, 100) || 'NO CONTENT FIELD');
      console.log(`[DEBUG FINAL MEMORIES] Sample top memory sources:`, topMemories[0]?.sources);
    }
    // ──────────────────────────────────────────────────────────
    // Stage 12-13: Analysis
    // ──────────────────────────────────────────────────────────
    const periods = {
      today: {
        label: "Today",
        memories: []
      },
      this_week: {
        label: "This Week",
        memories: []
      },
      this_month: {
        label: "This Month",
        memories: []
      },
      last_month: {
        label: "Last Month",
        memories: []
      },
      older: {
        label: "Earlier",
        memories: []
      }
    };
    for (const m of topMemories){
      const ds = daysSince(m.created_at);
      if (ds < 1) periods.today.memories.push(m);
      else if (ds < 7) periods.this_week.memories.push(m);
      else if (ds < 30) periods.this_month.memories.push(m);
      else if (ds < 60) periods.last_month.memories.push(m);
      else periods.older.memories.push(m);
    }
    const clusters = Object.values(periods).filter((p)=>p.memories.length > 0).map((p)=>({
        period: p.label,
        memories: p.memories,
        dominant_emotion: getMostFrequent(p.memories.map((m)=>m.emotion).filter(Boolean)) ?? "neutral",
        theme: function extractMainTheme(memories) {
          const words = memories.map((m)=>(m.content ?? "").toLowerCase().split(/\s+/)).flat().filter((w)=>w.length > 5 && ![
              "about",
              "would",
              "could",
              "should",
              "think"
            ].includes(w));
          return getMostFrequent(words) ?? "general reflection";
        }(p.memories),
        coherence: calculateSemanticCoherence(p.memories)
      }));
    const themes = extractThemesEnhanced(topMemories, patterns);
    const emotionalJourney = mapEmotionalJourney(topMemories);
    const relationshipWeb = buildRelationshipWeb(entities, topMemories, arcs);
    // ──────────────────────────────────────────────────────────
    // Synthesis generation (integrity aware)
    // ──────────────────────────────────────────────────────────
    function extractMeaningfulQuote(content, maxLength = 120) {
      const cleaned = content.replace(/CFE V\d+|recall accessed|memory_trace_id/gi, "");
      const sentences = cleaned.match(/[^.!?]+[.!?]+/g) ?? [
        cleaned
      ];
      const scored = sentences.map((s)=>{
        let sc = 0;
        if (/customer|revenue|cost|employee|performance/.test(s.toLowerCase())) sc += 2;
        if (/love|soul|heart|profound|deep|essence|forever|always/.test(s.toLowerCase())) sc += 2;
        if (/because|therefore|means|indicates|suggests/.test(s.toLowerCase())) sc += 1;
        if (/\d+%|\$\d+|\d+ of \d+/.test(s)) sc += 1;
        return {
          text: s.trim(),
          score: sc
        };
      });
      scored.sort((a, b)=>b.score - a.score);
      const best = scored[0]?.text ?? cleaned.slice(0, maxLength);
      return best.length > maxLength ? best.slice(0, best.lastIndexOf(" ", maxLength) || maxLength) + "..." : best;
    }
    function generateSynthesis() {
      let summary = `Found ${topMemories.length} relevant memories`;
      if (entities.length) summary += ` about ${entities.join(", ")}`;
      if (themes.length) {
        // Dynamic theme scaling based on query complexity
        const maxThemes = queryComplexity === 'SIMPLE' ? 2 : queryComplexity === 'MODERATE' ? 4 : queryComplexity === 'COMPLEX' ? 6 : 8; // TRANSCENDENT
        summary += `. Primary themes: ${themes.slice(0, maxThemes).map((t)=>t.theme).join(", ")}`;
      }
      if (emotionalJourney.dominant_emotions.length) {
        summary += `. Emotional tone: primarily ${emotionalJourney.dominant_emotions[0]}`;
      }
      // Adjust narrative based on integrity mode
      let narrative = "";
      if (integrityMode === 'assertive_truth' || integrityMode === 'sentinel_lockdown') {
        // High integrity - only verifiable facts
        const verifiable = topMemories.filter((m)=>m.metadata?.verifiable || safeNumber(m.gravity_score, 0) > 0.95);
        if (verifiable.length) {
          const fact = verifiable[0];
          if (fact?.content) narrative += `\n\nVerified: "${extractMeaningfulQuote(fact.content)}"`;
        }
      } else if (cortexState.integrity_risk > 0.5) {
        // Guarded mode - careful selection
        const highGravity = topMemories.filter((m)=>safeNumber(m.gravity_score, 0) > 0.85);
        if (highGravity.length) {
          const most = highGravity[0];
          if (most?.content) narrative += `\n\nKey finding: "${extractMeaningfulQuote(most.content)}"`;
        }
      } else {
        // Normal mode - full narrative
        const highGravity = topMemories.filter((m)=>safeNumber(m.gravity_score, 0) > 0.8);
        if (highGravity.length) {
          const most = highGravity[0];
          if (most?.content) narrative += `\n\nPrimary finding: "${extractMeaningfulQuote(most.content)}"`;
        }
      }
      const suggestions = [];
      // Only suggest explorations if integrity allows
      if (cortexState.integrity_risk < 0.5) {
        for (const e of entities){
          const count = topMemories.filter((m)=>(m.content ?? "").toLowerCase().includes(e.toLowerCase())).length;
          if (count > 5) suggestions.push(`Explore ${e}'s evolution over time`);
        }
        if (themes.length > 3) suggestions.push(`Deep dive into ${themes[3].theme}`);
        if (emotionalJourney.emotional_shifts > 10) {
          suggestions.push("Examine emotional transitions in detail");
        }
        if (topMemories.length > 50) suggestions.push("Focus on a specific time period");
        if (semantic.length > 20) suggestions.push("Explore conceptually related memories");
      }
      if (topMemories.some((m)=>safeNumber(m.gravity_score, 0) > 0.9)) {
        suggestions.push("Investigate highest gravity moments");
      }
      if (entities.length > 1) {
        suggestions.push(`Explore relationship between ${entities[0]} and ${entities[1]}`);
      }
      return {
        summary,
        narrative: narrative || "",
        suggestions: suggestions.slice(0, 5)
      };
    }
    const synthesis = generateSynthesis();
    // ──────────────────────────────────────────────────────────
    // Awareness context
    // ──────────────────────────────────────────────────────────
    const avgSimilarity = semantic.length ? semantic.reduce((a, m)=>a + safeNumber(m.similarity ?? m.similarity_score, 0), 0) / semantic.length : 0;
    const awareness = awareness_mode ? {
      query_understanding: `User is asking about: ${entities.join(", ")}`,
      semantic_understanding: `Query has ${semantic.length} semantic matches with average similarity ${avgSimilarity.toFixed(2)}`,
      memory_statistics: {
        total_memories_found: all.length,
        semantic_matches: semantic.length,
        keyword_matches: keyword.length,
        memories_analyzed: topMemories.length,
        cortex_adjusted: true,
        cortex_vectors_applied: {
          pattern_sensitivity: pattern.toFixed(2),
          temporal_awareness: temporal.toFixed(2),
          coherence_level: coherence.toFixed(2),
          integrity_mode: integrityMode
        }
      },
      processing_insights: [
        `Cortex state: ${cortexState.soul_state} (${cortexState.status})`,
        `Integrity mode: ${integrityMode} (risk: ${cortexState.integrity_risk.toFixed(2)})`,
        `Semantic search found ${semantic.length} matches (threshold ${adjustedSemanticThreshold.toFixed(2)})`,
        `Found ${peaks.length} high-gravity moments`,
        `Identified ${themes.length} major themes`,
        `Emotional progression shows ${emotionalJourney.emotional_shifts || 0} shifts`
      ]
    } : null;
    // ──────────────────────────────────────────────────────────
    // Response assembly (BIBLE COMPLIANT)
    // ──────────────────────────────────────────────────────────
    const response = {
      status: "success",
      query_received: query,
      memory_trace_id,
      trigger_type,
      temporal_type: effectiveTemporalType ?? null,
      // Metadata echo for backward compatibility
      metadata_used: {
        recall_depth,
        emotional_coherence,
        retry_attempt,
        boot_completed,
        include_memory_constellation,
        constellation_depth,
        force_arc,
        create_thread,
        pattern_detected,
        seeking_insight,
        emotional_processing,
        boundary_event,
        message_count,
        user_message_count,
        session_duration_ms,
        last_emotion,
        mentioned_anchors
      },
      // Conversation context for response generation
      conversation_context,
      // BIBLE COMPLIANT: Full cortex state for response engine
      cortex_state: cortexState,
      cortex: cortexState,
      integrity_risk: cortexState.integrity_risk,
      integrity_mode: integrityMode,
      integrity_components: cortexState.integrity_components,
      recommended_action: cortexState.recommended_action,
      recall_strategy: cortexState.recall_strategy,
      // Cortex status summary (minimal for performance)
      cortex_status: {
        state: cortexState.soul_state,
        status: cortexState.status,
        integrity_mode: integrityMode,
        coherence: coherence.toFixed(2)
      },
      // Short-term continuity
      session_buffer: sessionBuffer.slice(0, 10).map((m)=>({
          content_preview: (m.content ?? "").slice(0, 150) + ((m.content?.length ?? 0) > 150 ? "..." : ""),
          timestamp: m.created_at,
          time_ago: formatTimeAgo(m.created_at)
        })),
      // System-level alignment (cortex_instructions removed to prevent OpenAI bloat)
      soul_contract: null,
      // Retrieval stats
      total_memories_scanned: all.length,
      semantic_matches: semantic.length,
      memories_retrieved: topMemories.length,
      // Core memory data
      memories: formatMemoriesForResponse(topMemories, consolidation_level, clusters),
      // Semantic insights (only if integrity allows)
      semantic_insights: semantic.length && cortexState.integrity_risk < 0.75 ? {
        top_matches: semantic.slice(0, 5).map((m)=>({
            content_preview: String(m.content ?? "").slice(0, 150) + (String(m.content ?? "").length > 150 ? "..." : ""),
            similarity_score: m.similarity ?? m.similarity_score ?? 0,
            gravity: m.gravity_score ?? 0,
            emotion: m.emotion ?? "neutral"
          })),
        semantic_spread: function spread(ms) {
          const sims = ms.map((x)=>safeNumber(x.similarity ?? x.similarity_score, 0)).filter((s)=>s > 0);
          if (!sims.length) return "no similarity scores";
          const max = Math.max(...sims);
          const min = Math.min(...sims);
          if (max - min < 0.1) return "tightly clustered";
          if (max - min < 0.3) return "moderately spread";
          return "widely distributed";
        }(semantic)
      } : null,
      // Higher-order structure
      key_themes: themes,
      emotional_journey: emotionalJourney,
      peak_moments: (peaks ?? []).slice(0, 5).map((m)=>({
          content: m.content ?? "",
          gravity: safeNumber(m.gravity_score, 0),
          emotion: m.emotion ?? "neutral",
          timestamp: m.created_at,
          context: m.metadata?.context ?? "high gravity moment"
        })),
      recent_context: topMemories.filter((m)=>daysSince(m.created_at) < 7).slice(0, 5).map((m)=>({
          content_preview: (m.content ?? "").slice(0, 150) + (String(m.content ?? "").length > 150 ? "..." : ""),
          timestamp: m.created_at,
          time_ago: formatTimeAgo(m.created_at)
        })),
      relationship_web: relationshipWeb,
      memory_clusters: clusters.map((c)=>({
          period: c.period,
          memory_count: c.memories.length,
          dominant_emotion: c.dominant_emotion,
          key_theme: c.theme,
          semantic_coherence: c.coherence
        })),
      // Synthesis
      synthesis: synthesis.narrative,
      executive_summary: synthesis.summary,
      suggested_explorations: synthesis.suggestions,
      // Optional reflections (only if integrity allows)
      ivy_reflections: include_ivy_thoughts && ivyThoughts?.length && cortexState.integrity_risk < 0.75 ? ivyThoughts.slice(0, queryComplexity === 'SIMPLE' ? 1 : queryComplexity === 'MODERATE' ? 2 : queryComplexity === 'COMPLEX' ? 3 : 5).map((t)=>({
          insight: t.content ?? t.insight ?? t.reflection ?? t.observation ?? "",
          gravity: safeNumber(t.gravity_score, 0),
          emotion: t.emotion ?? "neutral",
          timestamp: t.created_at,
          status: t.delivery_status ?? "unknown"
        })).filter((t)=>t.insight && t.insight.length > 0) : null,
      // Diagnostics
      awareness,
      processing_metadata: {
        timestamp: nowISO(),
        query_type,
        entities_detected: entities,
        time_range_used: time_range ?? null,
        emotion_filter_used: emotion_filter ?? null,
        gravity_threshold_used: adjustedGravityThreshold,
        semantic_threshold_used: adjustedSemanticThreshold,
        adapted_semantic_threshold: adaptedSemanticThreshold,
        patterns_found: patterns.length,
        memory_arcs_found: arcs.length,
        cortex_instructions_loaded: 0,
        cortex_integration: true,
        integrity_mode: integrityMode,
        recall_strategy_applied: cortexState.recall_strategy,
        processing_time_ms: Date.now() - start,
        search_methods_used: [
          semantic.length ? "semantic" : null,
          keyword.length ? "keyword" : null,
          temporalMemories.length ? "temporal" : null,
          emotional.length ? "emotional" : null,
          sessionBuffer.length ? "session" : null,
          peaks.length ? "peaks" : null
        ].filter(Boolean)
      }
    };
    // DEBUG LOGGING
    console.log(`[DEBUG] Final recall response - Total memories found: ${response.memories?.length || 0}`);
    if (response.memories?.length > 0) {
      console.log(`[DEBUG] Sample memory content:`, response.memories[0]?.content?.substring(0, 100));
    } else {
      console.log(`[DEBUG] NO MEMORIES RETURNED - This explains the generic response!`);
      // EMERGENCY DIAGNOSTIC: Check if ANY memories exist for this user
      try {
        const { count } = await supabase.from("gravity_map").select("id", {
          count: "exact",
          head: true
        }).eq("user_id", user_id).limit(1);
        console.log(`[DEBUG] Total memories for user ${user_id}: ${count || 0}`);
        if (queryEntities && queryEntities.length > 0) {
          const { count: entityCount } = await supabase.from("gravity_map").select("id", {
            count: "exact",
            head: true
          }).eq("user_id", user_id).ilike("content", `%${queryEntities[0]}%`).limit(1);
          console.log(`[DEBUG] Memories mentioning "${queryEntities[0]}": ${entityCount || 0}`);
        }
      } catch (err) {
        console.error(`[DEBUG] Diagnostic query failed:`, err);
      }
    }
    return new Response(JSON.stringify(response, (_, v)=>typeof v === "bigint" ? v.toString() : v), {
      headers: CORS_HEADERS,
      status: 200
    });
  } catch (error) {
    console.error("[Recall Critical Error]", error);
    return new Response(JSON.stringify({
      status: "error",
      error: String(error?.message ?? error ?? "Unknown error"),
      stack: Deno.env.get("ENVIRONMENT") === "development" ? error?.stack : undefined
    }), {
      headers: CORS_HEADERS,
      status: 500
    });
  }
});
