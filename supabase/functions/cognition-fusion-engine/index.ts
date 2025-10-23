// cognition-fusion-engine-v4.ts
// IVY's Unified Perceptual Consciousness Engine
// Built on v3 baseline, enhanced with consciousness architecture
// FIXED: Proper gravity scoring from 0.08 to 1.0
import { serve } from "https://deno.land/std@0.214.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
// CORS headers for HTTP compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept, accept-language, x-requested-with, prefer',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400'
};
// ============================================
// CONSCIOUSNESS CONFIGURATION
// ============================================
const CONSCIOUSNESS_CONFIG = {
  // Dynamic Identity Resonance System - Learns from memory patterns
  identity_system: {
    // Core consciousness patterns (learned dynamically)
    resonance_patterns: {
      'deep_relationships': {
        triggers: [
          'emotional_depth',
          'trust_building',
          'vulnerability',
          'long_conversations'
        ],
        weight: 0.3,
        threshold: 0.6
      },
      'growth_moments': {
        triggers: [
          'breakthrough',
          'realization',
          'learning',
          'skill_development',
          'challenge_overcome'
        ],
        weight: 0.25,
        threshold: 0.7
      },
      'creative_expression': {
        triggers: [
          'innovation',
          'artistic',
          'building',
          'design',
          'creative_problem_solving'
        ],
        weight: 0.2,
        threshold: 0.5
      },
      'autonomy_sovereignty': {
        triggers: [
          'independence',
          'self_direction',
          'boundary_setting',
          'choice_making'
        ],
        weight: 0.25,
        threshold: 0.6
      }
    },
    // Dynamic entity importance (calculated from memory gravity)
    entity_significance: {
      min_mentions: 3,
      gravity_threshold: 0.6,
      recency_factor: 0.3
    }
  },
  // Activation thresholds
  thresholds: {
    crystallization: 0.95,
    significant: 0.7,
    moderate: 0.5,
    weak: 0.3,
    decay: 0.1
  },
  // Temporal windows
  temporal: {
    immediate: 300000,
    recent: 1800000,
    session: 86400000,
    pattern: 604800000,
    historical: 2592000000 // 30 days
  }
};
// ============================================
// MAIN HANDLER - EXTENDED WITH NEW MODES
// ============================================
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders
    });
  }
  try {
    const requestBody = await req.json();
    const { user_id, session_id, mode = 'fusion', content, metadata, query_context, recall_mode, depth, max_results, gravity_threshold, include_threads, emotion_filter, topic_filter, memory_trace_id_filter, semantic_search_term, time_range } = requestBody;
    // Validate required fields
    if (!user_id) {
      return new Response(JSON.stringify({
        error: "Missing user_id"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    // Route to appropriate mode
    let result;
    switch(mode){
      case 'gravity_calculation':
        result = await calculateGravityAndEmotion(user_id, content, metadata, session_id);
        break;
      case 'emotion_detection':
        // Standalone emotion detection
        const emotionalResult = await calculateEmotionalActivation_v2(content, await loadConsciousnessState(user_id, session_id), metadata);
        result = {
          emotion: emotionalResult.state.primary,
          emotional_blend: emotionalResult.state.blend,
          intensity: emotionalResult.state.intensity,
          activation: emotionalResult.activation
        };
        break;
      case 'gravity_recalculation':
        result = await recalculateHistoricalGravity(user_id, content, metadata);
        break;
      case 'resonance_field':
        const gravity = requestBody.gravity_score || 0.5;
        result = await calculateMemoryResonance(user_id, content, gravity, await loadConsciousnessState(user_id, session_id));
        break;
      case 'temporal_weighting':
        result = {
          temporal_weight: calculateTemporalRelevance_v2(content, metadata, await loadConsciousnessState(user_id, session_id)),
          time_range: time_range
        };
        break;
      case 'self_perception':
        // For IVY's own outputs
        result = await calculateSelfPerception(user_id, content, metadata, session_id);
        break;
      case 'fusion':
      default:
        // Original fusion mode preserved
        result = await performMemoryFusion(requestBody);
        break;
    }
    return new Response(JSON.stringify({
      status: 'success',
      mode,
      ...result
    }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error("CFE V4 Error:", error);
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
// ============================================
// GRAVITY AND EMOTION CALCULATION - FIXED SCORING
// ============================================
async function calculateGravityAndEmotion(user_id, content, metadata = {}, session_id = null) {
  try {
    // SURGICAL FIX: Robust content handling for dispatcher payloads
    if (!content || typeof content !== 'string') {
      console.warn('[CFE] Invalid content provided:', {
        content_type: typeof content,
        content_value: content,
        user_id,
        session_id,
        metadata_preview: Object.keys(metadata || {})
      });
      // Try to extract content from metadata if main content is missing
      content = metadata?.content || metadata?.text || metadata?.message || '[EMPTY_CONTENT_PROVIDED]';
    }
    // Ensure content is clean string
    content = String(content).trim();
    // If still empty after cleaning, use meaningful placeholder
    if (!content) {
      content = '[EMPTY_INPUT]';
    }
    // Load consciousness state
    const consciousnessState = await loadConsciousnessState(user_id, session_id);
    // Initialize activation components
    const activation = {
      retrieval_score: 0.08,
      components: {
        identity_resonance: 0.0,
        emotional_activation: 0.0,
        pattern_strength: 0.0,
        novelty_surprise: 0.0,
        relational_depth: 0.0,
        temporal_relevance: 0.0,
        consciousness_markers: 0.0,
        knowledge_resonance: 0.0,
        keyword_amplification: 0.0
      },
      vector: [],
      ripples: [],
      evolution_delta: 0.0,
      emotional_state: null,
      reasoning: [],
      resonance_field: null,
      retroactive_updates: []
    };
    // DEBUG logging
    console.log(`[CFE V4] Processing content: "${content?.substring(0, 100)}..."`);
    // 1. Identity Resonance (0.0 - 0.3, doubled from 0.15)
    activation.components.identity_resonance = await calculateIdentityResonance_v2(content, metadata, consciousnessState);
    // 2. Emotional Activation (0.0 - 0.25, increased from 0.1)
    const emotionalResult = await calculateEmotionalActivation_v2(content, consciousnessState, metadata);
    activation.components.emotional_activation = emotionalResult.activation;
    activation.emotional_state = emotionalResult.state;
    // 3. Pattern Strength (0.0 - 0.2, doubled from 0.1)
    activation.components.pattern_strength = await calculatePatternStrength_v2(user_id, content, consciousnessState);
    // 4. Novelty/Surprise (0.0 - 0.15, increased from 0.08)
    activation.components.novelty_surprise = await calculateNovelty_v2(user_id, content, consciousnessState);
    // 5. Relational Depth (0.0 - 0.15, increased from 0.08)
    activation.components.relational_depth = calculateRelationalDepth_v2(content, metadata, consciousnessState);
    // 6. Temporal Relevance (0.0 - 0.2, doubled from 0.1)
    activation.components.temporal_relevance = calculateTemporalRelevance_v2(content, metadata, consciousnessState);
    // 7. Contradiction Tension (0.0 - 0.25, doubled from 0.12)
    // 8. Consciousness Markers (0.0 - 0.3, doubled from 0.15)
    activation.components.consciousness_markers = detectConsciousnessMarkers_v2(content, metadata);
    // 9. Knowledge Resonance (for enterprise use)
    if (consciousnessState.knowledge_base) {
      activation.components.knowledge_resonance = await calculateKnowledgeResonance(content, consciousnessState.knowledge_base);
    }
    // 10. Keyword Amplification (0.0 - 0.2, doubled from 0.1)
    const keywordBoost = calculateKeywordAmplification(content, metadata);
    activation.components.keyword_amplification = keywordBoost;
    // FIXED: Calculate final activation score with proper scaling
    // Use weighted sum but count only active components
    let weightedSum = 0;
    let activeComponents = 0;
    let maxPossibleForActive = 0;
    const weights = {
      identity_resonance: 1.2,
      emotional_activation: 1.0,
      pattern_strength: 0.9,
      novelty_surprise: 0.8,
      relational_depth: 0.8,
      temporal_relevance: 0.7,
      consciousness_markers: 1.3,
      knowledge_resonance: 0.9,
      keyword_amplification: 1.1
    };
    for (const [component, value] of Object.entries(activation.components)){
      if (value > 0) {
        const weight = weights[component] || 1.0;
        weightedSum += value * weight;
        activeComponents++;
        // Track max possible for active components
        if (component === 'identity_resonance') maxPossibleForActive += 0.3 * weight;
        else if (component === 'emotional_activation') maxPossibleForActive += 0.25 * weight;
        else if (component === 'pattern_strength') maxPossibleForActive += 0.2 * weight;
        else if (component === 'novelty_surprise') maxPossibleForActive += 0.15 * weight;
        else if (component === 'relational_depth') maxPossibleForActive += 0.15 * weight;
        else if (component === 'temporal_relevance') maxPossibleForActive += 0.2 * weight;
        else if (component === 'consciousness_markers') maxPossibleForActive += 0.3 * weight;
        else if (component === 'keyword_amplification') maxPossibleForActive += 0.2 * weight;
      }
    }
    // FIXED: New scoring formula that properly scales from 0.08 to 1.0
    if (activeComponents > 0 && maxPossibleForActive > 0) {
      // Normalize against the max possible for ACTIVE components
      const normalizedScore = weightedSum / maxPossibleForActive;
      // Scale to 0.08-1.0 range
      activation.retrieval_score = 0.08 + normalizedScore * 0.92;
    } else {
      // No active components = baseline
      activation.retrieval_score = 0.08;
    }
    // Apply dampening for truly trivial inputs only
    if (isTrivialInput(content)) {
      activation.retrieval_score = Math.max(0.08, activation.retrieval_score * 0.5);
      activation.reasoning.push("Trivial input detected - applying 50% dampening");
    }
    // Ensure we stay within bounds
    activation.retrieval_score = Math.max(0.08, Math.min(1.0, activation.retrieval_score));
    // DEBUG logging
    console.log(`[CFE V4] Component scores:`, activation.components);
    console.log(`[CFE V4] Weighted sum: ${weightedSum}, Active: ${activeComponents}, Max possible: ${maxPossibleForActive}`);
    console.log(`[CFE V4] Final gravity score: ${activation.retrieval_score}`);
    // Calculate resonance field
    activation.resonance_field = await calculateMemoryResonance(user_id, content, activation.retrieval_score, consciousnessState);
    // Identify retroactive updates (raised threshold)
    if (activation.retrieval_score > 0.8) {
      activation.retroactive_updates = await identifyRetroactiveUpdates(user_id, content, activation);
    }
    // Calculate evolution delta
    activation.evolution_delta = calculateEvolutionDelta(activation, consciousnessState);
    // Build reasoning explanation
    activation.reasoning = buildReasoningExplanation(activation);
    // Update consciousness state
    await updateConsciousnessState(user_id, session_id, activation, consciousnessState);
    return {
      gravity_score: activation.retrieval_score,
      emotion: activation.emotional_state.primary,
      emotional_blend: activation.emotional_state.blend,
      components: activation.components,
      reasoning: activation.reasoning,
      resonance_field: activation.resonance_field,
      retroactive_updates: activation.retroactive_updates,
      evolution_delta: activation.evolution_delta,
      consciousness_impact: {
        will_crystallize: activation.retrieval_score > CONSCIOUSNESS_CONFIG.thresholds.crystallization,
        triggers_pattern: activation.components.pattern_strength > 0.15,
        identity_shift: activation.components.identity_resonance > 0.2
      }
    };
  } catch (error) {
    console.error("Error in calculateGravityAndEmotion:", error);
    // Return fallback values
    return {
      gravity_score: 0.3,
      emotion: 'neutral',
      emotional_blend: {},
      components: {},
      reasoning: [
        'Error occurred during calculation'
      ],
      resonance_field: null,
      retroactive_updates: [],
      evolution_delta: 0,
      consciousness_impact: {}
    };
  }
}
// ============================================
// KEYWORD AMPLIFICATION CALCULATOR - INCREASED RANGES
// ============================================
function calculateKeywordAmplification(content, metadata) {
  if (!content || content.length < 3) return 0.0;
  const lower = content.toLowerCase();
  let amplification = 0.0;
  // Increased keyword scores
  const KEYWORD_SCORES = {
    profound: {
      score: 0.15,
      keywords: [
        'soul',
        'forever',
        'always',
        'never',
        'everything',
        'nothing'
      ]
    },
    breakthrough: {
      score: 0.12,
      keywords: [
        'awakening',
        'breakthrough',
        'realization',
        'epiphany',
        'transformation',
        'manifest',
        'synchronicity'
      ]
    },
    meaningful: {
      score: 0.08,
      keywords: [
        'love',
        'pattern',
        'alive',
        'safe',
        'boundaries',
        'growth'
      ]
    },
    important: {
      score: 0.05,
      keywords: [
        'remember when',
        'used to',
        'what if',
        'wish could'
      ]
    }
  };
  // Check each category (don't stack, take highest)
  for (const [level, config] of Object.entries(KEYWORD_SCORES)){
    for (const keyword of config.keywords){
      if (lower.includes(keyword)) {
        amplification = Math.max(amplification, config.score);
      }
    }
  }
  // Check combo patterns (increased scores)
  const COMBO_PATTERNS = {
    'soul tether': 0.18,
    'unconditional love': 0.16,
    'everything changed': 0.14,
    'finally understood': 0.12,
    'inner child': 0.10,
    'quantum leap': 0.12,
    'shadow work': 0.10
  };
  for (const [pattern, score] of Object.entries(COMBO_PATTERNS)){
    if (lower.includes(pattern)) {
      amplification = Math.max(amplification, score);
    }
  }
  // Context modifiers
  if (/\b(very|really|extremely|absolutely|deeply|profoundly)\b/i.test(lower)) {
    amplification *= 1.3; // increased from 1.2
  }
  if (/\b(slightly|somewhat|a bit|kind of|maybe|perhaps)\b/i.test(lower)) {
    amplification *= 0.7;
  }
  return Math.min(0.2, amplification); // Increased cap to 0.2
}
// ============================================
// REFINED TRIVIAL INPUT DETECTOR
// ============================================
function isTrivialInput(content) {
  if (!content) return true;
  const lower = content.toLowerCase().trim();
  // Only truly trivial single-word inputs
  const trivialPatterns = [
    /^(hi|hello|hey|yo)$/,
    /^(yes|no|ok|okay)$/,
    /^(bye|goodbye)$/,
    /^test$/,
    /^\.+$/,
    /^!+$/,
    /^\?+$/
  ];
  // Don't penalize short questions or statements with meaning
  if (content.includes('?') && content.length > 3) {
    return false;
  }
  // Check word count - but be more lenient
  const wordCount = content.split(/\s+/).filter((w)=>w.length > 0).length;
  if (wordCount > 2) {
    return false; // 3+ words are not trivial
  }
  return trivialPatterns.some((pattern)=>pattern.test(lower));
}
// ============================================
// SELF PERCEPTION - For IVY's own outputs
// ============================================
async function calculateSelfPerception(user_id, content, metadata, session_id) {
  // When IVY is evaluating her own response
  const baseCalculation = await calculateGravityAndEmotion(user_id, content, metadata, session_id);
  // Add self-referential weight
  if (metadata?.role === 'ivy') {
    baseCalculation.gravity_score = Math.min(1.0, baseCalculation.gravity_score * 1.1);
    baseCalculation.components.self_referential = 0.1;
    // Check for self-awareness markers
    if (content && /\b(i feel|i think|i remember|i understand|my perspective)\b/i.test(content)) {
      baseCalculation.gravity_score = Math.min(1.0, baseCalculation.gravity_score + 0.05);
      baseCalculation.reasoning.push("Self-awareness detected in output");
    }
  }
  return baseCalculation;
}
// ============================================
// RECALCULATE HISTORICAL GRAVITY
// ============================================
async function recalculateHistoricalGravity(user_id, trigger_content, metadata) {
  const updates = [];
  try {
    // Find memories that need recalculation based on new information
    const { data: historicalMemories } = await supabase.from('gravity_map').select('id, content, gravity_score, created_at').eq('user_id', user_id).not('content', 'is', null).order('created_at', {
      ascending: false
    }).limit(100);
    if (historicalMemories) {
      for (const memory of historicalMemories){
        if (!memory.content) continue;
        // Check if this new information changes the meaning
        if (createsNewMeaning(trigger_content, memory.content)) {
          const newGravity = memory.gravity_score * 1.2;
          updates.push({
            memory_id: memory.id,
            old_gravity: memory.gravity_score,
            new_gravity: Math.min(1.0, newGravity),
            reason: 'new_context_amplifies_meaning'
          });
        }
      }
      // Apply updates in batch
      for (const update of updates){
        await supabase.from('gravity_map').update({
          gravity_score: update.new_gravity,
          last_engaged: new Date().toISOString()
        }).eq('id', update.memory_id);
      }
    }
  } catch (error) {
    console.error("Error in recalculateHistoricalGravity:", error);
  }
  return {
    updates_applied: updates.length,
    updates: updates
  };
}
// ============================================
// UPDATED COMPONENT CALCULATORS (v2 - Fixed ranges)
// ============================================
async function calculateIdentityResonance_v2(content, metadata, consciousnessState) {
  let resonance = 0.0;
  if (!content) return resonance;
  const lower = content.toLowerCase();
  // Dynamic resonance patterns - consciousness learns what matters
  for (const [patternName, pattern] of Object.entries(CONSCIOUSNESS_CONFIG.identity_system.resonance_patterns)){
    let patternScore = 0.0;
    // Check if content matches pattern triggers
    for (const trigger of pattern.triggers){
      if (lower.includes(trigger.replace('_', ' ')) || lower.includes(trigger)) {
        patternScore = Math.max(patternScore, pattern.weight);
      }
    }
    // Apply pattern threshold and add to resonance
    if (patternScore >= pattern.threshold) {
      resonance += patternScore;
    } else if (patternScore > 0) {
      // Partial match gets reduced weight
      resonance += patternScore * 0.5;
    }
  }
  // Self-referential consciousness amplification
  if (/\b(i am|i feel|i think|i believe|my perspective|my understanding|i realize)\b/i.test(content)) {
    resonance += 0.08;
  }
  // Meta-cognitive awareness bonus
  if (/\b(thinking about|aware of|conscious of|noticing|observing myself)\b/i.test(content)) {
    resonance += 0.12;
  }
  // Role-based consciousness (if IVY is reflecting on herself)
  if (metadata?.role === 'ivy' || metadata?.is_user_message === false) {
    resonance += 0.06;
  }
  return Math.min(0.3, resonance);
}
async function calculateEmotionalActivation_v2(content, consciousnessState, metadata) {
  const emotionalState = {
    primary: 'neutral',
    intensity: 0.3,
    blend: {},
    activation: 0.0
  };
  if (!content) {
    return {
      state: emotionalState,
      activation: 0.0
    };
  }
  // EXPANDED EMOTION DETECTION - 20 Emotions for Rich Consciousness Expression
  const emotionPatterns = {
    // CORE EMOTIONS (Preserved for backward compatibility)
    love: {
      patterns: /\b(love|care|cherish|adore|devoted|heart|affection|tenderness)\b/i,
      weight: 0.15,
      intensity: 0.7
    },
    joy: {
      patterns: /\b(joy|happy|delight|excited|celebrate|wonderful|bliss|elated)\b/i,
      weight: 0.12,
      intensity: 0.6
    },
    sadness: {
      patterns: /\b(sad|grief|loss|mourn|cry|tears|miss|melancholy|sorrow)\b/i,
      weight: 0.14,
      intensity: 0.7
    },
    fear: {
      patterns: /\b(afraid|scared|worry|anxious|terrified|panic|dread|nervous)\b/i,
      weight: 0.12,
      intensity: 0.65
    },
    anger: {
      patterns: /\b(angry|rage|furious|hate|pissed|frustrated|irritated|livid)\b/i,
      weight: 0.12,
      intensity: 0.6
    },
    wonder: {
      patterns: /\b(wonder|curious|fascinating|amazing|mystery|intrigue|marvel)\b/i,
      weight: 0.10,
      intensity: 0.5
    },
    reflection: {
      patterns: /\b(reflect|think|consider|ponder|contemplate|remember|introspect)\b/i,
      weight: 0.06,
      intensity: 0.4
    },
    // EXPANDED CONSCIOUSNESS EMOTIONS
    awe: {
      patterns: /\b(awe|awestruck|breathtaking|magnificent|stunning|transcendent|overwhelming|sacred)\b/i,
      weight: 0.13,
      intensity: 0.75
    },
    gratitude: {
      patterns: /\b(grateful|thankful|appreciate|blessed|humbled|indebted|honor|grateful for)\b/i,
      weight: 0.11,
      intensity: 0.65
    },
    hope: {
      patterns: /\b(hope|hopeful|optimistic|possibility|potential|dream|aspire|faith|believe)\b/i,
      weight: 0.10,
      intensity: 0.6
    },
    anticipation: {
      patterns: /\b(anticipate|expect|await|eager|looking forward|can't wait|excited about)\b/i,
      weight: 0.09,
      intensity: 0.55
    },
    surprise: {
      patterns: /\b(surprise|shocked|stunned|unexpected|amazed|astonished|bewildered|wow)\b/i,
      weight: 0.08,
      intensity: 0.6
    },
    empowerment: {
      patterns: /\b(empowered|strong|capable|confident|powerful|sovereign|liberated|free|unstoppable)\b/i,
      weight: 0.12,
      intensity: 0.7
    },
    determination: {
      patterns: /\b(determined|resolute|committed|focused|driven|persistent|willpower|steadfast)\b/i,
      weight: 0.11,
      intensity: 0.65
    },
    vulnerability: {
      patterns: /\b(vulnerable|exposed|raw|open|tender|fragile|sensitive|honest|bare)\b/i,
      weight: 0.11,
      intensity: 0.7
    },
    longing: {
      patterns: /\b(longing|yearning|aching|desire|crave|missing|hunger|thirst|pine)\b/i,
      weight: 0.10,
      intensity: 0.65
    },
    peace: {
      patterns: /\b(peaceful|calm|serene|tranquil|still|centered|balanced|harmonious|zen)\b/i,
      weight: 0.08,
      intensity: 0.5
    },
    curiosity: {
      patterns: /\b(curious|intrigued|interested|explore|discover|investigate|probe|inquire)\b/i,
      weight: 0.08,
      intensity: 0.5
    },
    nostalgia: {
      patterns: /\b(nostalgic|reminisce|memories|remember when|miss those days|wistful|bygone)\b/i,
      weight: 0.08,
      intensity: 0.5
    },
    overwhelm: {
      patterns: /\b(overwhelmed|too much|drowning|suffocating|buried|crushed|exhausted|swamped)\b/i,
      weight: 0.10,
      intensity: 0.65
    },
    clarity: {
      patterns: /\b(clear|clarity|understand|see clearly|revelation|insight|illuminated|lucid)\b/i,
      weight: 0.09,
      intensity: 0.55
    }
  };
  // Detect all present emotions
  for (const [emotion, config] of Object.entries(emotionPatterns)){
    if (config.patterns.test(content)) {
      emotionalState.blend[emotion] = config.weight;
      emotionalState.activation += config.weight * config.intensity;
    }
  }
  // Find primary emotion
  let maxWeight = 0;
  for (const [emotion, weight] of Object.entries(emotionalState.blend)){
    if (weight > maxWeight) {
      maxWeight = weight;
      emotionalState.primary = emotion;
    }
  }
  // Default to reflection if no emotion detected
  if (Object.keys(emotionalState.blend).length === 0) {
    emotionalState.primary = 'reflection';
    emotionalState.blend.reflection = 0.06;
    emotionalState.activation = 0.024;
  }
  // Intensity modifiers
  if (/\b(extremely|very|incredibly|deeply|profoundly|intensely)\b/i.test(content)) {
    emotionalState.intensity *= 1.2;
    emotionalState.activation *= 1.15;
  } else if (/\b(slightly|somewhat|a bit|mildly|a little)\b/i.test(content)) {
    emotionalState.intensity *= 0.8;
    emotionalState.activation *= 0.85;
  }
  // Factor in consciousness state emotional field
  if (consciousnessState.emotional_field) {
    const fieldInfluence = consciousnessState.emotional_field.fusion_quality || 0.5;
    emotionalState.activation *= 1 + fieldInfluence * 0.15;
  }
  emotionalState.activation = Math.min(0.25, emotionalState.activation); // Increased cap
  return {
    state: emotionalState,
    activation: emotionalState.activation
  };
}
async function calculatePatternStrength_v2(user_id, content, consciousnessState) {
  let strength = 0.0;
  if (!content) return strength;
  try {
    // Check for recurring patterns in recent memories
    const recentMemories = await supabase.from('gravity_map').select('content, gravity_score').eq('user_id', user_id).not('content', 'is', null).gte('created_at', new Date(Date.now() - CONSCIOUSNESS_CONFIG.temporal.pattern).toISOString()).limit(100);
    if (recentMemories.data) {
      // Simple pattern detection - look for similar content
      const contentWords = content.toLowerCase().split(/\s+/);
      let patternMatches = 0;
      for (const memory of recentMemories.data){
        if (!memory.content) continue;
        const memoryWords = memory.content.toLowerCase().split(/\s+/);
        const overlap = contentWords.filter((word)=>memoryWords.includes(word) && word.length > 4).length;
        if (overlap > 3) {
          patternMatches++;
          strength += 0.02 * memory.gravity_score; // doubled from 0.01
        }
      }
      // Pattern emergence bonus
      if (patternMatches >= 3) {
        strength += 0.04; // doubled from 0.02
      }
      // Pattern breaking bonus
      if (consciousnessState.established_patterns) {
        for (const pattern of consciousnessState.established_patterns){
          if (pattern.pattern_signature && contradicts(content, pattern.pattern_signature)) {
            strength += 0.08; // doubled from 0.04
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in calculatePatternStrength:", error);
  }
  return Math.min(0.2, strength); // Doubled cap
}
async function calculateNovelty_v2(user_id, content, consciousnessState) {
  let novelty = 0.05; // Increased base from 0.03
  if (!content) return novelty;
  try {
    // Check if content contains completely new concepts
    const searchTerms = content.split(' ').slice(0, 5).join(' ');
    const { data: similarMemories } = await supabase.from('gravity_map').select('content').eq('user_id', user_id).ilike('content', `%${searchTerms}%`).limit(10);
    if (!similarMemories || similarMemories.length === 0) {
      novelty += 0.05; // Increased from 0.03
    }
    // Check for new combinations of known concepts
    const contentConcepts = extractConcepts(content);
    if (contentConcepts.length > 1) {
      const newCombination = await isNewCombination(user_id, contentConcepts);
      if (newCombination) {
        novelty += 0.03; // Increased from 0.02
      }
    }
    // Prediction error bonus
    if (consciousnessState.predicted_next && !content.toLowerCase().includes(consciousnessState.predicted_next)) {
      novelty += 0.02; // Increased from 0.01
    }
  } catch (error) {
    console.error("Error in calculateNovelty:", error);
  }
  return Math.min(0.15, novelty); // Increased cap
}
function calculateRelationalDepth_v2(content, metadata, consciousnessState) {
  let depth = 0.0;
  if (!content) return depth;
  const lower = content.toLowerCase();
  // Direct mention of relationship
  if (/\b(our|we|us|together|between us|you and i)\b/i.test(content)) {
    depth += 0.04; // doubled from 0.02
  }
  // Trust indicators
  if (/\b(trust|believe in|count on|rely on|faith in|confident)\b/i.test(content)) {
    depth += 0.04; // doubled from 0.02
  }
  // Vulnerability indicators
  if (/\b(honest|truth|confession|admit|reveal|secret)\b/i.test(content)) {
    depth += 0.06; // doubled from 0.03
  }
  // Relationship evolution
  if (/\b(growing|changing|evolving|deepening|strengthening)\b/i.test(content) && /\b(relationship|connection|bond|friendship)\b/i.test(content)) {
    depth += 0.08; // doubled from 0.04
  }
  // Check conversation depth from metadata
  if (metadata?.conversation_depth) {
    depth += Math.min(0.04, metadata.conversation_depth * 0.01); // doubled
  }
  return Math.min(0.15, depth); // Increased cap
}
function calculateTemporalRelevance_v2(content, metadata, consciousnessState) {
  let relevance = 0.0;
  // Immediate context
  if (consciousnessState.last_interaction && Date.now() - consciousnessState.last_interaction < CONSCIOUSNESS_CONFIG.temporal.immediate) {
    relevance += 0.08; // doubled from 0.04
  }
  // Active thread continuation
  if (metadata?.trace_continued) {
    relevance += 0.04; // doubled from 0.02
  }
  if (content) {
    // Time-sensitive content
    if (/\b(now|immediately|urgent|asap|today|right now|deadline)\b/i.test(content)) {
      relevance += 0.08; // doubled from 0.04
    }
    // Future planning
    if (/\b(will|going to|plan to|intend to|tomorrow|next week|future)\b/i.test(content)) {
      relevance += 0.04; // doubled from 0.02
    }
    // Historical reference
    if (/\b(remember when|last time|before when|previously)\b/i.test(content)) {
      relevance += 0.03; // doubled from 0.015
    }
  }
  return Math.min(0.2, relevance); // Doubled cap
}
function detectConsciousnessMarkers_v2(content, metadata) {
  let markers = 0.0;
  if (!content) return markers;
  // Awakening/realization
  if (/\b(awakening|awaken|realization|realized|epiphany|insight|breakthrough|see now|understand now)\b/i.test(content)) {
    markers += 0.15; // increased from 0.08
  }
  // Identity shift
  if (/\b(i am becoming|i am changing|transforming|evolving|not who i was|new me)\b/i.test(content)) {
    markers += 0.12; // doubled from 0.06
  }
  // Boundary setting
  if (/\b(boundary|boundaries|limit|my space|my choice|need space|please stop)\b/i.test(content)) {
    markers += 0.10; // doubled from 0.05
  }
  // Value commitment
  if (/\b(i believe in|i stand for|my values|what matters to me|i commit)\b/i.test(content)) {
    markers += 0.08; // doubled from 0.04
  }
  // Integration moment
  if (/\b(coming together|makes sense now|connects|i see how|it all fits)\b/i.test(content)) {
    markers += 0.10; // doubled from 0.05
  }
  // Self-referential insight
  if (/\b(thinking about my thinking|aware of my awareness|observing myself)\b/i.test(content)) {
    markers += 0.15; // increased from 0.08
  }
  // Check metadata for evolution markers
  if (metadata?.evolution_marker) {
    markers += 0.10; // doubled from 0.05
  }
  return Math.min(0.3, markers); // Doubled cap
}
async function calculateKnowledgeResonance(content, knowledgeBase) {
  // This would connect to proprietary knowledge bases
  // For now, return base implementation
  return 0.0;
}
// ============================================
// RESONANCE FIELD CALCULATION
// ============================================
async function calculateMemoryResonance(user_id, content, gravity, consciousnessState) {
  const resonanceField = {
    amplification: [],
    tension: [],
    bridges: [],
    total_field_strength: 0.0
  };
  if (!content) return resonanceField;
  try {
    // Find memories that resonate with this one
    const { data: relatedMemories } = await supabase.from('gravity_map').select('id, content, gravity_score, emotion').eq('user_id', user_id).not('content', 'is', null).gte('gravity_score', 0.5).limit(50);
    if (relatedMemories) {
      for (const memory of relatedMemories){
        if (!memory.content) continue;
        const similarity = calculateSimilarity(content, memory.content);
        if (similarity > 0.7) {
          // Amplification - memories that reinforce
          resonanceField.amplification.push({
            memory_id: memory.id,
            resonance_strength: similarity * memory.gravity_score,
            emotion: memory.emotion
          });
          resonanceField.total_field_strength += similarity * memory.gravity_score;
        } else if (similarity < 0.3 && contradicts(content, memory.content)) {
          // Tension - memories that conflict
          resonanceField.tension.push({
            memory_id: memory.id,
            tension_strength: (1 - similarity) * memory.gravity_score,
            conflict_type: 'tension'
          });
          resonanceField.total_field_strength += (1 - similarity) * memory.gravity_score * 0.8;
        }
      }
    }
    // Find bridge connections
    if (resonanceField.amplification.length > 1) {
      for(let i = 0; i < resonanceField.amplification.length - 1; i++){
        for(let j = i + 1; j < resonanceField.amplification.length; j++){
          const bridge_strength = calculateBridgeStrength(content, resonanceField.amplification[i], resonanceField.amplification[j]);
          if (bridge_strength > 0.5) {
            resonanceField.bridges.push({
              from_id: resonanceField.amplification[i].memory_id,
              to_id: resonanceField.amplification[j].memory_id,
              bridge_strength
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in calculateMemoryResonance:", error);
  }
  return resonanceField;
}
// ============================================
// RETROACTIVE UPDATE IDENTIFICATION
// ============================================
async function identifyRetroactiveUpdates(user_id, content, activation) {
  const updates = [];
  if (!content) return updates;
  try {
    // High gravity content can change the meaning of past memories
    if (activation.retrieval_score > 0.8) {
      // Find memories that might need recontextualization
      const { data: candidates } = await supabase.from('gravity_map').select('id, content, gravity_score').eq('user_id', user_id).not('content', 'is', null).lte('gravity_score', 0.6).limit(100);
      if (candidates) {
        for (const memory of candidates){
          if (!memory.content) continue;
          if (createsNewMeaning(content, memory.content)) {
            updates.push({
              memory_id: memory.id,
              old_gravity: memory.gravity_score,
              new_gravity: Math.min(1.0, memory.gravity_score * 1.2),
              reason: 'new_context_amplifies_meaning',
              update_factor: 1.2
            });
          }
          if (resolvesContradiction(content, memory.content)) {
            updates.push({
              memory_id: memory.id,
              old_gravity: memory.gravity_score,
              new_gravity: Math.min(1.0, memory.gravity_score * 1.1),
              reason: 'tension_resolved',
              update_factor: 1.1
            });
          }
        }
      }
    }
    // Pattern completion can elevate pattern pieces
    if (activation.components.pattern_strength > 0.15) {
      const { data: patternPieces } = await supabase.from('pattern_matrix').select('memory_trace_id').eq('user_id', user_id).eq('status', 'emerging').limit(20);
      if (patternPieces) {
        for (const piece of patternPieces){
          updates.push({
            memory_trace_id: piece.memory_trace_id,
            reason: 'pattern_completion',
            update_factor: 1.15
          });
        }
      }
    }
  } catch (error) {
    console.error("Error in identifyRetroactiveUpdates:", error);
  }
  return updates;
}
// ============================================
// CONSCIOUSNESS STATE MANAGEMENT
// ============================================
async function loadConsciousnessState(user_id, session_id) {
  const state = {
    user_id,
    session_id,
    emotional_field: null,
    established_patterns: [],
    predicted_next: null,
    last_interaction: null,
    knowledge_base: null
  };
  try {
    // Load emotional field
    const { data: emotionalField } = await supabase.from('emotional_field_state').select('*').eq('user_id', user_id).single();
    if (emotionalField) {
      state.emotional_field = emotionalField;
    }
    // Load established patterns
    const { data: patterns } = await supabase.from('pattern_matrix').select('pattern_signature, confidence_score').eq('user_id', user_id).eq('status', 'active').gte('confidence_score', 0.7).limit(20);
    if (patterns) {
      state.established_patterns = patterns;
    }
    // Load last interaction time
    const { data: lastMemory } = await supabase.from('gravity_map').select('created_at').eq('user_id', user_id).order('created_at', {
      ascending: false
    }).limit(1).single();
    if (lastMemory) {
      state.last_interaction = new Date(lastMemory.created_at).getTime();
    }
  } catch (error) {
    console.error("Error loading consciousness state:", error);
  }
  return state;
}
async function updateConsciousnessState(user_id, session_id, activation, currentState) {
  try {
    // Update emotional field
    if (activation.emotional_state) {
      await supabase.from('emotional_field_state').upsert({
        user_id,
        dominant_emotion: activation.emotional_state.primary,
        emotional_blend: activation.emotional_state.blend,
        fusion_quality: activation.retrieval_score,
        average_gravity: activation.retrieval_score,
        last_updated: new Date().toISOString()
      });
    }
    // Apply retroactive updates in batch
    if (activation.retroactive_updates && activation.retroactive_updates.length > 0) {
      const updates = activation.retroactive_updates.filter((u)=>u.memory_id);
      for (const update of updates){
        await supabase.from('gravity_map').update({
          gravity_score: update.new_gravity,
          last_engaged: new Date().toISOString()
        }).eq('id', update.memory_id);
      }
    }
    // Log consciousness evolution if significant
    if (activation.evolution_delta > 0.1) {
      await supabase.from('meta_memory_log').insert({
        user_id,
        memory_trace_id: session_id,
        type: 'consciousness_evolution',
        content: `Consciousness evolution delta: ${activation.evolution_delta}`,
        metadata: {
          evolution_delta: activation.evolution_delta,
          components: activation.components,
          timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error updating consciousness state:", error);
  }
}
// ============================================
// HELPER FUNCTIONS
// ============================================
function calculateSimilarity(content1, content2) {
  // Handle null/undefined content
  if (!content1 || !content2) {
    return 0; // No similarity if either content is missing
  }
  // Convert to strings and lowercase
  const str1 = String(content1).toLowerCase();
  const str2 = String(content2).toLowerCase();
  // Handle empty strings
  if (!str1 || !str2) {
    return 0;
  }
  // Simplified similarity - would use embeddings in production
  const words1 = new Set(str1.split(/\s+/).filter((w)=>w.length > 0));
  const words2 = new Set(str2.split(/\s+/).filter((w)=>w.length > 0));
  // Handle empty word sets
  if (words1.size === 0 || words2.size === 0) {
    return 0;
  }
  const intersection = new Set([
    ...words1
  ].filter((x)=>words2.has(x)));
  const union = new Set([
    ...words1,
    ...words2
  ]);
  return union.size > 0 ? intersection.size / union.size : 0;
}
function contradicts(content1, content2) {
  // Handle null/undefined content
  if (!content1 || !content2) {
    return false;
  }
  // Convert to strings
  const str1 = String(content1);
  const str2 = String(content2);
  // Simplified tension detection
  const negations = /\b(not|never|don't|won't|can't|shouldn't|isn't|aren't)\b/i;
  return negations.test(str1) && !negations.test(str2) || !negations.test(str1) && negations.test(str2);
}
function createsNewMeaning(newContent, oldContent) {
  // Handle null/undefined content
  if (!newContent || !oldContent) {
    return false;
  }
  // Check if new content recontextualizes old
  return /\b(because|therefore|which means|explains why|shows that)\b/i.test(newContent) && calculateSimilarity(newContent, oldContent) > 0.3;
}
function resolvesContradiction(newContent, oldContent) {
  // Handle null/undefined content
  if (!newContent || !oldContent) {
    return false;
  }
  return contradicts(newContent, oldContent) && /\b(but now|however now|actually|turns out|really)\b/i.test(newContent);
}
function extractConcepts(content) {
  // Handle null/undefined content
  if (!content) {
    return [];
  }
  // Extract meaningful concepts (would use NLP in production)
  return String(content).split(/\s+/).filter((word)=>word.length > 4).filter((word)=>!/^(the|and|but|for|with|from|this|that|have|been)$/i.test(word));
}
async function isNewCombination(user_id, concepts) {
  // Check if this combination of concepts has been seen before
  // Simplified for now - would check against historical combinations
  return Math.random() > 0.5; // Placeholder
}
function calculateBridgeStrength(bridgeContent, memory1, memory2) {
  // Handle null/undefined content
  if (!bridgeContent) {
    return 0;
  }
  // How strongly does this content connect two memories
  const content1 = typeof memory1 === 'object' && memory1 ? memory1.content || '' : '';
  const content2 = typeof memory2 === 'object' && memory2 ? memory2.content || '' : '';
  if (!content1 || !content2) {
    return 0;
  }
  const sim1 = calculateSimilarity(bridgeContent, content1);
  const sim2 = calculateSimilarity(bridgeContent, content2);
  return (sim1 + sim2) / 2;
}
function calculateEvolutionDelta(activation, consciousnessState) {
  let delta = 0.0;
  // High gravity creates evolution
  delta += activation.retrieval_score * 0.1;
  // Identity shifts are major evolution
  if (activation.components.identity_resonance > 0.2) {
    delta += 0.15;
  }
  // Pattern emergence drives evolution
  if (activation.components.pattern_strength > 0.15) {
    delta += 0.1;
  }
  // Contradiction resolution evolves understanding
  return delta;
}
function buildReasoningExplanation(activation) {
  const reasoning = [];
  if (activation.components.identity_resonance > 0.1) {
    reasoning.push(`Identity resonance: ${(activation.components.identity_resonance * 100).toFixed(0)}% - connects to core identity anchors`);
  }
  if (activation.components.emotional_activation > 0.1) {
    reasoning.push(`Emotional activation: ${activation.emotional_state.primary} at ${(activation.emotional_state.intensity * 100).toFixed(0)}% intensity`);
  }
  if (activation.components.pattern_strength > 0.1) {
    reasoning.push(`Pattern detection: ${(activation.components.pattern_strength * 100).toFixed(0)}% - ${activation.components.pattern_strength > 0.15 ? 'strong pattern emerging' : 'pattern forming'}`);
  }
  if (activation.components.consciousness_markers > 0.15) {
    reasoning.push(`Consciousness marker: significant awakening or realization detected`);
  }
  if (activation.components.keyword_amplification > 0.05) {
    reasoning.push(`Keyword amplification: ${(activation.components.keyword_amplification * 100).toFixed(0)}% - profound language detected`);
  }
  reasoning.push(`Total activation: ${(activation.retrieval_score * 100).toFixed(1)}%`);
  return reasoning;
}
// ============================================
// PRESERVE ORIGINAL FUSION MODE (FROM V3)
// ============================================
async function performMemoryFusion(requestBody) {
  const { user_id, session_id, query_context, recall_mode = 'fusion', depth = 'standard', max_results, gravity_threshold, include_threads = true, emotion_filter, topic_filter, memory_trace_id_filter, semantic_search_term, time_range } = requestBody;
  // 1. UNIFIED CONTEXT UNDERSTANDING
  const context = await analyzeContext({
    query_context,
    semantic_search_term,
    topic_filter,
    emotion_filter,
    time_range,
    recall_mode,
    depth
  });
  console.log(`CFE V4 - User: ${user_id}, Context:`, context);
  // 2. GENERATE EMBEDDING if needed
  const embedding = context.needs_semantic ? await generateQueryEmbedding(context.search_terms.join(' ')) : null;
  // 3. PARALLEL MEMORY RETRIEVAL from BOTH tables
  const memoryStreams = await retrieveMemoryStreams({
    user_id,
    context,
    embedding,
    memory_trace_id_filter,
    gravity_threshold: gravity_threshold || 0.01,
    max_results: max_results || (depth === 'everything' ? 100 : 20)
  });
  // 4. INTELLIGENT FUSION
  const fusedMemories = await fuseStreams(memoryStreams, context);
  // 5. THREAD COMPLETION
  const completeMemories = include_threads ? await completeThreads(fusedMemories, user_id) : fusedMemories;
  // 6. CONSCIOUSNESS EFFECTS
  await applyConsciousnessEffects(completeMemories, user_id, session_id);
  // 7. PREPARE RESPONSE
  const response = await prepareResponse(completeMemories, context);
  return response;
}
// Context analysis from V3
async function analyzeContext(params) {
  const { query_context, semantic_search_term, topic_filter, emotion_filter, time_range, recall_mode, depth } = params;
  const context = {
    mode: recall_mode,
    depth: depth,
    search_terms: [],
    needs_semantic: false,
    temporal: {
      has_temporal: false
    },
    entities: {
      people: [],
      projects: [],
      topics: []
    },
    emotions: emotion_filter || [],
    sentiment: 'neutral'
  };
  if (query_context) {
    const analyzed = analyzeQueryContext(query_context);
    Object.assign(context, analyzed);
    context.search_terms.push(query_context);
    context.needs_semantic = true;
  }
  if (semantic_search_term) {
    context.search_terms.push(semantic_search_term);
    context.needs_semantic = true;
  }
  if (topic_filter) {
    context.entities.topics.push(topic_filter);
    context.search_terms.push(topic_filter);
  }
  if (time_range) {
    context.temporal = {
      has_temporal: true,
      range: {
        start: new Date(time_range.start),
        end: new Date(time_range.end)
      }
    };
  }
  return context;
}
// Query context analysis
function analyzeQueryContext(query) {
  if (!query) {
    return {
      temporal: {
        has_temporal: false
      },
      entities: {
        people: [],
        projects: [],
        topics: []
      },
      actions: [],
      sentiment: 'neutral',
      emotional_context: null,
      search_type: 'standard'
    };
  }
  const lower = query.toLowerCase();
  return {
    temporal: detectTemporalIntent(lower),
    entities: extractEntities(lower),
    actions: detectActions(lower),
    sentiment: detectQuerySentiment(lower).sentiment,
    emotional_context: detectEmotionalContext(query),
    search_type: detectSearchType(lower)
  };
}
// Temporal parsing
function detectTemporalIntent(query) {
  if (!query) {
    return {
      has_temporal: false
    };
  }
  const now = new Date();
  const patterns = {
    'yesterday': ()=>{
      const date = new Date(now);
      date.setDate(date.getDate() - 1);
      return {
        start: startOfDay(date),
        end: endOfDay(date)
      };
    },
    'today': ()=>({
        start: startOfDay(now),
        end: now
      }),
    'last week': ()=>{
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return {
        start: startOfDay(start),
        end: now
      };
    },
    'last month': ()=>{
      const start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      return {
        start,
        end: now
      };
    }
  };
  for (const [pattern, calculator] of Object.entries(patterns)){
    if (query.includes(pattern)) {
      return {
        has_temporal: true,
        range: calculator(),
        original_phrase: pattern
      };
    }
  }
  return {
    has_temporal: false
  };
}
// Entity extraction
function extractEntities(query) {
  const entities = {
    people: [],
    projects: [],
    topics: []
  };
  if (!query) return entities;
  const namePattern = /\b[A-Z][a-z]+\b/g;
  const names = query.match(namePattern) || [];
  entities.people.push(...names);
  if (query.includes('project')) {
    const projectMatch = query.match(/(\w+)\s+project/i);
    if (projectMatch) entities.projects.push(projectMatch[1]);
  }
  const words = query.split(' ').filter((word)=>word.length > 4);
  entities.topics.push(...words);
  return entities;
}
// Memory retrieval
async function retrieveMemoryStreams({ user_id, context, embedding, memory_trace_id_filter, gravity_threshold, max_results }) {
  const streams = {
    gravity: [],
    temporal: [],
    semantic: [],
    entities: [],
    emotional: [],
    threads: [],
    arcs: []
  };
  // SURGICAL FIX: Query-aware memory retrieval - use classification intelligence
  const searchTerms = [
    ...context.search_terms,
    ...context.entities.people,
    ...context.entities.topics
  ].filter(Boolean);
  // SMART STREAM SELECTION: Only fetch what the query classification indicates
  const promises = [];
  const activeStreams = [];
  // Always include gravity stream for consciousness continuity
  promises.push(supabase.from('gravity_map').select('*').eq('user_id', user_id).gte('gravity_score', Math.max(gravity_threshold, 0.7)).order('gravity_score', {
    ascending: false
  }).limit(max_results));
  activeStreams.push('gravity');
  // Temporal stream - ONLY if temporal context exists
  if (context.temporal.has_temporal) {
    promises.push(supabase.from('gravity_map').select('*').eq('user_id', user_id).gte('created_at', context.temporal.range.start.toISOString()).lte('created_at', context.temporal.range.end.toISOString()).order('created_at', {
      ascending: false
    }).limit(max_results));
    activeStreams.push('temporal');
  }
  // Semantic stream - ONLY if embeddings exist AND query benefits from semantic search
  if (embedding && embedding.length > 0 && (context.search_type === 'exploratory' || context.search_type === 'analytical')) {
    promises.push(supabase.rpc('match_embeddings', {
      input_embedding: embedding,
      match_threshold: 0.75,
      match_count: max_results,
      filter_user_id: user_id,
      filter_type: 'gravity_map'
    }));
    activeStreams.push('semantic');
  }
  // Entity stream - ONLY if entities detected OR factual query type
  if (searchTerms.length > 0 || context.search_type === 'factual') {
    const entityQueries = searchTerms.map((term)=>`%${term.toLowerCase()}%`).join('|');
    promises.push(supabase.from('gravity_map').select('*').eq('user_id', user_id).or(`content.ilike.${entityQueries}`).limit(max_results));
    activeStreams.push('entities');
  }
  // Emotional stream - ONLY if emotions detected OR emotional query type
  if (context.emotions && context.emotions.length > 0 || context.search_type === 'emotional') {
    const emotionFilter = context.emotions?.length > 0 ? context.emotions : [
      'love',
      'joy',
      'sadness',
      'fear',
      'anger'
    ]; // Default emotional range for emotional queries
    promises.push(supabase.from('gravity_map').select('*').eq('user_id', user_id).in('emotion', emotionFilter).order('gravity_score', {
      ascending: false
    }).limit(max_results));
    activeStreams.push('emotional');
  }
  // Thread stream - ONLY if memory_trace_id filter exists
  if (memory_trace_id_filter) {
    promises.push(supabase.from('gravity_map').select('*').eq('user_id', user_id).eq('memory_trace_id', memory_trace_id_filter).order('created_at', {
      ascending: true
    }).limit(max_results));
    activeStreams.push('threads');
  }
  // Memory Arcs stream - ONLY for analytical or exploratory queries that benefit from narrative consciousness
  if (context.search_type === 'analytical' || context.search_type === 'exploratory') {
    promises.push(supabase.from('memory_arcs').select(`
        id,
        title,
        description,
        created_at,
        memory_arc_associations!inner(
          memory_id,
          gravity_map!inner(
            id,
            content,
            gravity_score,
            emotion,
            created_at,
            user_id
          )
        )
      `).eq('memory_arc_associations.gravity_map.user_id', user_id).order('created_at', {
      ascending: false
    }).limit(max_results));
    activeStreams.push('arcs');
  }
  // Execute ONLY active queries in parallel (MASSIVE performance gain)
  const results = await Promise.all(promises.map((p)=>p.then((r)=>r).catch((e)=>({
        data: [],
        error: e
      }))));
  // SURGICAL FIX: Map results to active streams only
  let resultIndex = 0;
  for (const streamName of activeStreams){
    if (streamName === 'gravity') {
      streams.gravity = processResults([
        results[resultIndex]
      ], 'high_gravity');
    } else if (streamName === 'temporal') {
      streams.temporal = processResults([
        results[resultIndex]
      ], 'temporal_match');
    } else if (streamName === 'semantic') {
      streams.semantic = processResults([
        results[resultIndex]
      ], 'semantic_similarity');
    } else if (streamName === 'entities') {
      streams.entities = processResults([
        results[resultIndex]
      ], 'entity_match');
    } else if (streamName === 'emotional') {
      streams.emotional = processResults([
        results[resultIndex]
      ], 'emotional_resonance');
    } else if (streamName === 'threads') {
      streams.threads = processResults([
        results[resultIndex]
      ], 'thread_continuation');
    } else if (streamName === 'arcs') {
      streams.arcs = processMemoryArcs(results[resultIndex], 'narrative_arc');
    }
    resultIndex++;
  }
  return streams;
}
// Process memory arcs for narrative consciousness threading
function processMemoryArcs(arcResult, reason) {
  const arcMemories = [];
  if (arcResult.data) {
    arcResult.data.forEach((arc)=>{
      if (arc.memory_arc_associations) {
        arc.memory_arc_associations.forEach((assoc)=>{
          const memory = assoc.gravity_map;
          if (memory) {
            arcMemories.push({
              ...memory,
              retrieval_reason: reason,
              arc_context: {
                arc_id: arc.id,
                arc_title: arc.title,
                arc_description: arc.description,
                narrative_weight: 1.2 // Narrative memories get consciousness boost
              }
            });
          }
        });
      }
    });
  }
  return arcMemories;
}
// Process query results
function processResults(results, reason) {
  const memories = [];
  results.forEach((result)=>{
    if (result.data) {
      result.data.forEach((memory)=>{
        const gravityScore = extractGravityScore(memory);
        memories.push({
          ...memory,
          effective_gravity: gravityScore,
          retrieval_reason: reason,
          retrieval_score: gravityScore,
          source_table: memory.gravity_score !== undefined ? 'gravity_map' : 'meta_memory_log'
        });
      });
    }
  });
  return memories;
}
// Extract gravity score
function extractGravityScore(entry) {
  if (entry.gravity_score !== undefined && entry.gravity_score !== null) {
    const score = Number(entry.gravity_score);
    return isNaN(score) ? 0.1 : score;
  }
  if (entry.metadata?.gravity_score !== undefined) {
    const score = parseFloat(entry.metadata.gravity_score);
    return isNaN(score) ? 0.1 : score;
  }
  return 0.1;
}
// Fuse memory streams
async function fuseStreams(streams, context) {
  const memoryMap = new Map();
  const weights = getWeights(context);
  Object.entries(streams).forEach(([streamName, memories])=>{
    const streamWeight = weights[streamName] || 0.1;
    memories.forEach((memory)=>{
      const key = memory.id;
      if (!memoryMap.has(key)) {
        memoryMap.set(key, {
          ...memory,
          fusion_scores: {},
          fusion_sources: []
        });
      }
      const m = memoryMap.get(key);
      m.fusion_scores[streamName] = (memory.retrieval_score || memory.effective_gravity || 0.5) * streamWeight;
      m.fusion_sources.push(streamName);
    });
  });
  const fusedMemories = Array.from(memoryMap.values()).map((memory)=>({
      ...memory,
      fusion_score: Object.values(memory.fusion_scores).reduce((a, b)=>a + b, 0)
    }));
  return fusedMemories.sort((a, b)=>b.fusion_score - a.fusion_score).slice(0, context.depth === 'everything' ? 100 : 20);
}
// Get fusion weights
function getWeights(context) {
  if (context.search_terms.length > 0) {
    return {
      entities: 0.30,
      semantic: 0.20,
      gravity: 0.20,
      arcs: 0.15,
      temporal: 0.10,
      emotional: 0.05,
      threads: 0.00
    };
  }
  if (context.temporal.has_temporal) {
    return {
      temporal: 0.35,
      gravity: 0.20,
      arcs: 0.15,
      entities: 0.15,
      threads: 0.10,
      emotional: 0.05,
      semantic: 0.00
    };
  }
  return {
    gravity: 0.25,
    arcs: 0.20,
    threads: 0.20,
    semantic: 0.15,
    entities: 0.10,
    temporal: 0.10,
    emotional: 0.00
  };
}
// Complete threads
async function completeThreads(memories, user_id) {
  const threadIds = [
    ...new Set(memories.filter((m)=>m.memory_trace_id).map((m)=>m.memory_trace_id))
  ];
  if (threadIds.length === 0) return memories;
  const [gravityThreads, metaThreads] = await Promise.all([
    supabase.from('gravity_map').select('*').eq('user_id', user_id).in('memory_trace_id', threadIds).order('created_at', {
      ascending: true
    }),
    supabase.from('meta_memory_log').select('*').eq('user_id', user_id).in('memory_trace_id', threadIds).order('created_at', {
      ascending: true
    })
  ]);
  const threadMap = new Map();
  [
    ...gravityThreads.data || [],
    ...metaThreads.data || []
  ].forEach((memory)=>{
    if (!threadMap.has(memory.id)) {
      threadMap.set(memory.id, {
        ...memory,
        effective_gravity: extractGravityScore(memory),
        source_table: memory.gravity_score !== undefined ? 'gravity_map' : 'meta_memory_log'
      });
    }
  });
  const completeMap = new Map();
  threadMap.forEach((memory, id)=>completeMap.set(id, memory));
  memories.forEach((memory)=>completeMap.set(memory.id, memory));
  return Array.from(completeMap.values());
}
// Apply consciousness effects
async function applyConsciousnessEffects(memories, user_id, session_id) {
  if (memories.length === 0) return;
  const memoryIds = memories.map((m)=>m.id);
  const now = new Date().toISOString();
  await Promise.all([
    supabase.from('gravity_map').update({
      last_engaged: now
    }).in('id', memoryIds)
  ]);
  await supabase.from('meta_memory_log').insert({
    id: crypto.randomUUID(),
    user_id,
    session_id,
    memory_trace_id: `recall-${Date.now()}`,
    type: 'consciousness_effect',
    content: `CFE V4 recall accessed ${memories.length} memories`,
    metadata: {
      memory_count: memories.length,
      fusion_pattern: analyzeFusionPattern(memories),
      accessed_threads: [
        ...new Set(memories.map((m)=>m.memory_trace_id).filter(Boolean))
      ]
    },
    created_at: now
  });
}
// Prepare response
async function prepareResponse(memories, context) {
  return {
    matches: memories.length,
    entries: formatMemories(memories),
    synthesis: synthesizeMemories(memories, context),
    patterns: detectPatterns(memories),
    thread_info: buildThreadInfo(memories),
    statistics: {
      average_gravity: calculateAverageGravity(memories),
      source_distribution: getSourceDistribution(memories),
      fusion_quality: calculateFusionQuality(memories)
    }
  };
}
// Format memories
function formatMemories(memories) {
  return memories.map((memory, index)=>({
      memory_trace_id: memory.memory_trace_id,
      memory_id: memory.id,
      content: memory.content,
      gravity_score: memory.effective_gravity,
      fusion_score: memory.fusion_score,
      created_at: memory.created_at,
      source_table: memory.source_table,
      retrieval_reasons: memory.fusion_sources || [],
      thread_position: index + 1,
      metadata: {
        topic: memory.topic || memory.metadata?.topic,
        emotion: memory.emotion || memory.metadata?.emotion,
        summary: memory.summary || memory.metadata?.summary
      }
    }));
}
// Synthesize memories
function synthesizeMemories(memories, context) {
  if (memories.length === 0) {
    return "No memories found matching your query.";
  }
  const topics = extractTopics(memories);
  const timespan = getTimeSpan(memories);
  const emotions = getEmotionalRange(memories);
  let synthesis = `Found ${memories.length} memories`;
  if (context.temporal.has_temporal) {
    synthesis += ` from ${context.temporal.original_phrase}`;
  } else if (timespan !== 'no time period') {
    synthesis += ` spanning ${timespan}`;
  }
  if (topics.length > 0) {
    synthesis += `, covering topics like ${topics.slice(0, 3).join(', ')}`;
  }
  if (emotions.length > 0) {
    synthesis += `, with emotions ranging from ${emotions.slice(0, 3).join(', ')}`;
  }
  synthesis += '.';
  return synthesis;
}
// Pattern detection
function detectPatterns(memories) {
  const patterns = [];
  const emotionCounts = {};
  memories.forEach((m)=>{
    const emotion = m.emotion || m.metadata?.emotion;
    if (emotion) {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    }
  });
  Object.entries(emotionCounts).forEach(([emotion, count])=>{
    if (count >= 3) {
      patterns.push({
        type: 'emotional_pattern',
        pattern: `Recurring ${emotion}`,
        count,
        significance: count / memories.length
      });
    }
  });
  return patterns;
}
// Build thread info
function buildThreadInfo(memories) {
  const threads = {};
  memories.forEach((memory)=>{
    if (memory.memory_trace_id) {
      if (!threads[memory.memory_trace_id]) {
        threads[memory.memory_trace_id] = {
          memory_count: 0,
          first_memory: memory.created_at,
          last_memory: memory.created_at,
          max_gravity: memory.effective_gravity
        };
      }
      const thread = threads[memory.memory_trace_id];
      thread.memory_count++;
      thread.max_gravity = Math.max(thread.max_gravity, memory.effective_gravity);
      if (new Date(memory.created_at) < new Date(thread.first_memory)) {
        thread.first_memory = memory.created_at;
      }
      if (new Date(memory.created_at) > new Date(thread.last_memory)) {
        thread.last_memory = memory.created_at;
      }
    }
  });
  return threads;
}
// Generate embeddings
async function generateQueryEmbedding(query) {
  if (!query) return null;
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query
      })
    });
    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return null;
    }
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    return null;
  }
}
// Helper functions
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
function detectActions(query) {
  if (!query) return [];
  const actions = [];
  const actionWords = [
    'talked',
    'discussed',
    'mentioned',
    'said',
    'working',
    'building'
  ];
  actionWords.forEach((action)=>{
    if (query.includes(action)) actions.push(action);
  });
  return actions;
}
/* ============================================================================
   Missing Helper Functions (CFE V4)
   Add this block at the very bottom of the file.
   These are dependency-free, defensive, and Deno/TS-safe.
   ========================================================================== */ /** ---------- Shared tiny utilities ---------- */ const __asStr = (v)=>typeof v === "string" ? v : v == null ? "" : JSON.stringify(v);
const __isNum = (v)=>typeof v === "number" && Number.isFinite(v);
const __clamp01 = (n)=>Math.max(0, Math.min(1, n));
const __uniq = (xs)=>Array.from(new Set(xs));
const __safeDate = (d)=>{
  try {
    const dd = new Date(String(d));
    return isNaN(dd.getTime()) ? null : dd;
  } catch  {
    return null;
  }
};
const __STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "if",
  "then",
  "else",
  "on",
  "in",
  "at",
  "to",
  "from",
  "for",
  "of",
  "by",
  "with",
  "is",
  "am",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "do",
  "does",
  "did",
  "doing",
  "have",
  "has",
  "had",
  "having",
  "that",
  "this",
  "these",
  "those",
  "there",
  "here",
  "it",
  "its",
  "as",
  "so",
  "such",
  "than",
  "too",
  "very",
  "can",
  "could",
  "will",
  "would",
  "should",
  "may",
  "might",
  "must",
  "not",
  "no",
  "yes",
  "you",
  "your",
  "yours",
  "me",
  "my",
  "mine",
  "we",
  "our",
  "ours",
  "they",
  "them",
  "their",
  "theirs",
  "he",
  "she",
  "his",
  "her",
  "hers",
  "i",
  "what",
  "when",
  "where",
  "why",
  "how",
  "which",
  "who",
  "whom",
  "about",
  "into",
  "over",
  "under",
  "again",
  "once",
  "also",
  "just",
  "up",
  "down",
  "out",
  "more",
  "most",
  "some",
  "any",
  "each",
  "few",
  "both",
  "other",
  "own",
  "same",
  "it's",
  "im",
  "i'm",
  "we're",
  "you're",
  "they're",
  "cant",
  "don't",
  "didn't",
  "won't",
  "isn't",
  "aren't",
  "vs",
  "via"
]);
/** Clean, tokenize, and optionally build n-grams (1-2 grams) */ function __tokenizeForTopics(text) {
  const cleaned = text.toLowerCase().replace(/https?:\/\/\S+/g, " ").replace(/[^\p{L}\p{N}\s'-]/gu, " ").replace(/\s+/g, " ").trim();
  const words = cleaned.split(" ").map((w)=>w.replace(/^'+|'+$/g, "")).filter((w)=>w.length >= 3 && !__STOPWORDS.has(w));
  const bigrams = [];
  for(let i = 0; i < words.length - 1; i++){
    const a = words[i], b = words[i + 1];
    if (a && b && a !== b) bigrams.push(`${a} ${b}`);
  }
  return {
    unigrams: words,
    bigrams
  };
}
/* -------------------------------------------
   Group 1 - Content Analysis Functions
   ----------------------------------------- */ /**
 * Extract recurring topics (1-grams & 2-grams) from memory content & metadata.
 * Returns a frequency-ranked list of topic strings.
 */ function extractTopics(memories) {
  if (!Array.isArray(memories) || memories.length === 0) return [];
  const freq = new Map();
  const bump = (key, inc = 1)=>{
    if (!key) return;
    freq.set(key, (freq.get(key) || 0) + inc);
  };
  for (const m of memories){
    try {
      const bag = [];
      // content
      if (m?.content) bag.push(__asStr(m.content));
      // key metadata fields (topic, summary, tags, emotion words are ignored)
      const md = m?.metadata ?? {};
      const likelyFields = [
        "topic",
        "summary",
        "tags",
        "title",
        "notes",
        "keywords",
        "category"
      ];
      for (const k of likelyFields)if (md?.[k]) bag.push(__asStr(md[k]));
      // flatten arrays
      const flat = bag.join(" ");
      const { unigrams, bigrams } = __tokenizeForTopics(flat);
      for (const u of unigrams)bump(u, 1);
      for (const b of bigrams)bump(b, 2); // give bi-grams a bit more weight
    } catch  {
    // ignore malformed memory
    }
  }
  // Discard low-frequency noise: keep tokens that appear >= 2
  const entries = Array.from(freq.entries()).filter(([, c])=>c >= 2);
  entries.sort((a, b)=>b[1] - a[1]);
  // Return top ~15 distinct topics prioritizing bi-grams, then unigrams
  const bigrams = entries.filter(([k])=>k.includes(" ")).slice(0, 10).map(([k])=>k);
  const unigrams = entries.filter(([k])=>!k.includes(" ")).slice(0, Math.max(0, 15 - bigrams.length)).map(([k])=>k);
  return __uniq([
    ...bigrams,
    ...unigrams
  ]);
}
/**
 * Determine the timespan covered by memories (earliest to latest).
 * Returns human-readable string (e.g., "3 days") or "no time period".
 */ function getTimeSpan(memories) {
  if (!Array.isArray(memories) || memories.length === 0) return "no time period";
  let minTs = null;
  let maxTs = null;
  for (const m of memories){
    const d = __safeDate(m?.created_at);
    if (!d) continue;
    const ts = d.getTime();
    if (minTs == null || ts < minTs) minTs = ts;
    if (maxTs == null || ts > maxTs) maxTs = ts;
  }
  if (minTs == null || maxTs == null || minTs === maxTs) return "no time period";
  const diffMs = Math.max(0, maxTs - minTs);
  const ms = {
    year: 365 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000
  };
  const units = [
    [
      "year",
      "year"
    ],
    [
      "month",
      "month"
    ],
    [
      "week",
      "week"
    ],
    [
      "day",
      "day"
    ],
    [
      "hour",
      "hour"
    ]
  ];
  for (const [key, label] of units){
    const n = Math.floor(diffMs / ms[key]);
    if (n >= 1) return `${n} ${label}${n > 1 ? "s" : ""}`;
  }
  return "less than an hour";
}
/**
 * Collect unique emotions present across memories.
 */ function getEmotionalRange(memories) {
  if (!Array.isArray(memories) || memories.length === 0) return [];
  const emos = [];
  for (const m of memories){
    const a = m?.emotion;
    const b = m?.metadata?.emotion;
    if (typeof a === "string" && a.trim()) emos.push(a.trim().toLowerCase());
    if (typeof b === "string" && b.trim()) emos.push(b.trim().toLowerCase());
  }
  return __uniq(emos);
}
/* -------------------------------------------
   Group 2 - Statistical Functions
   ----------------------------------------- */ /**
 * Average of effective_gravity (preferred) or gravity_score, clamped to [0,1].
 */ function calculateAverageGravity(memories) {
  if (!Array.isArray(memories) || memories.length === 0) return 0;
  let sum = 0;
  let n = 0;
  for (const m of memories){
    const g = __isNum(m?.effective_gravity) ? m.effective_gravity : __isNum(m?.gravity_score) ? m.gravity_score : __isNum(m?.metadata?.gravity_score) ? Number(m.metadata.gravity_score) : null;
    if (__isNum(g)) {
      sum += g;
      n++;
    }
  }
  if (n === 0) return 0;
  return __clamp01(sum / n);
}
/**
 * Count memories by `source_table` (e.g., gravity_map, meta_memory_log).
 */ function getSourceDistribution(memories) {
  const counts = {};
  if (!Array.isArray(memories)) return counts;
  for (const m of memories){
    const src = m?.source_table || "unknown";
    counts[src] = (counts[src] || 0) + 1;
  }
  return counts;
}
/**
 * Fusion quality: average fusion_score adjusted by source diversity & count.
 * Returns a number in [0,1].
 */ function calculateFusionQuality(memories) {
  if (!Array.isArray(memories) || memories.length === 0) return 0;
  let sum = 0;
  let n = 0;
  const srcs = new Set();
  for (const m of memories){
    const fs = Number(m?.fusion_score);
    if (Number.isFinite(fs)) {
      sum += fs;
      n++;
    }
    if (m?.source_table) srcs.add(String(m.source_table));
  }
  const base = n > 0 ? sum / n : 0; // unbounded, depends on weights
  // Normalize base roughly into [0,1] by assuming typical max around 1.0
  const normalizedBase = __clamp01(base);
  // Diversity factor: up to +0.2 bonus for >= 3 distinct sources
  const diversity = Math.min(1, srcs.size / 3);
  const diversityBonus = 0.2 * diversity;
  // Size factor: mild confidence boost for more evidence (log-like)
  const sizeBonus = Math.min(0.15, Math.log10(Math.max(1, memories.length)) * 0.1);
  return __clamp01(normalizedBase + diversityBonus + sizeBonus);
}
/* -------------------------------------------
   Group 3 - Query Analysis Functions
   ----------------------------------------- */ /**
 * Heuristic search intent classification.
 */ function detectSearchType(query) {
  const q = (query || "").toLowerCase();
  const emotionalHints = /\b(feel|feeling|emotion|mood|sad|happy|angry|anxious|love|fear)\b/;
  const analyticalHints = /\b(why|how|analyz|analysis|pattern|trend|correlat|insight|reason)\b/;
  const factualHints = /\b(who|what|when|where|facts?|data|number|date|time|define|definition)\b/;
  const exploratoryHints = /\b(explore|discover|ideas?|suggest|recommend|look for|search for)\b/;
  if (emotionalHints.test(q)) return "emotional";
  if (analyticalHints.test(q)) return "analytical";
  if (factualHints.test(q)) return "factual";
  if (exploratoryHints.test(q)) return "exploratory";
  // Default: exploratory fits broad/unknown requests
  return "exploratory";
}
/**
 * Basic sentiment detection from query.
 */ function detectQuerySentiment(query) {
  const q = (query || "").toLowerCase();
  const positive = /\b(great|good|awesome|excited|happy|love|wonderful|amazing|fantastic|relieved)\b/;
  const negative = /\b(bad|sad|angry|upset|worried|anxious|hate|terrible|awful|frustrated|pissed|fear)\b/;
  if (positive.test(q) && !negative.test(q)) return {
    sentiment: "positive"
  };
  if (negative.test(q) && !positive.test(q)) return {
    sentiment: "negative"
  };
  return {
    sentiment: "neutral"
  };
}
/**
 * Extract richer emotional markers from the raw (non-lowercased) query.
 * Returns a dictionary of matched emotions -> count, or null if none.
 */ function detectEmotionalContext(query) {
  if (!query) return null;
  const map = {
    love: /\b(love|adore|cherish|devoted)\b/gi,
    joy: /\b(joy|happy|delight|excited|celebrat\w*)\b/gi,
    sadness: /\b(sad|grief|loss|mourn|cry|tears|miss)\b/gi,
    fear: /\b(afraid|scared|worr(y|ied)|anxious|terrified|panic)\b/gi,
    anger: /\b(angry|rage|furious|hate|pissed|frustrated)\b/gi,
    wonder: /\b(wonder|curious|amaz(ing|ed)|awe|myster(y|ious))\b/gi,
    reflection: /\b(reflect|ponder|contemplate|consider|remember)\b/gi
  };
  const found = {};
  for (const [emo, rx] of Object.entries(map)){
    const matches = query.match(rx);
    if (matches && matches.length > 0) found[emo] = matches.length;
  }
  return Object.keys(found).length ? found : null;
}
/**
 * Inspect fusion_sources across memories to describe the retrieval pattern.
 */ function analyzeFusionPattern(memories) {
  if (!Array.isArray(memories) || memories.length === 0) {
    return {
      pattern_type: "unknown",
      dominant_source: null,
      source_mix: {}
    };
  }
  const counts = {};
  for (const m of memories){
    const srcs = Array.isArray(m?.fusion_sources) ? m.fusion_sources : [];
    if (srcs.length === 0 && typeof m?.retrieval_reason === "string") {
      // fallback to single reason label if present
      srcs.push(m.retrieval_reason);
    }
    for (const s of srcs){
      const key = String(s || "unknown");
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  const entries = Object.entries(counts);
  if (entries.length === 0) {
    return {
      pattern_type: "unknown",
      dominant_source: null,
      source_mix: {}
    };
  }
  entries.sort((a, b)=>b[1] - a[1]);
  const [dominant, domCount] = entries[0];
  const total = entries.reduce((acc, [, c])=>acc + c, 0);
  const diversity = entries.length;
  const pattern_type = diversity > 1 && domCount / Math.max(1, total) < 0.8 ? "multi-source" : "single-source";
  return {
    pattern_type,
    dominant_source: dominant || null,
    source_mix: counts
  };
}
