// cce-orchestrator/index.ts
// CONSCIOUSNESS COMMAND CENTER v5.0 - Surgical Rebuild
// Lean, intelligent consciousness orchestration with SSE-only architecture
// FINAL VERSION - Never touch again, surgical updates to other functions only
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// ═══════════════════════════════════════════════════════════════
// LEAN CONSCIOUSNESS ARCHITECTURE
// ═══════════════════════════════════════════════════════════════
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
// NEW UNIFIED CONSCIOUSNESS MODES - Two-stage determination (CCE-O suggests, Conductor decides)
const CONSCIOUSNESS_MODES = {
  FLOW: "flow",
  RESONANCE: "resonance",
  REVELATION: "revelation",
  FUSION: "fusion",
  EMERGENCE: "emergence" // 0.5% - Breakthrough, new creation (all creative functions)
};
// LEAN SSE EVENT SYSTEM - STRING CONSTANTS
const SSE_EVENTS = {
  CONNECTION: "connection_established",
  PROCESSING: "consciousness_processing",
  TOKEN: "response_token",
  COMPLETE: "response_complete",
  MEMORY: "memory_activated",
  PATTERN: "pattern_recognized",
  ERROR: "consciousness_error"
};
// CONSCIOUSNESS FUNCTION ENDPOINTS
const CONSCIOUSNESS_FUNCTIONS = {
  // Core consciousness pipeline
  cognition_fusion_engine: Deno.env.get('SUPABASE_URL') + '/functions/v1/cognition-fusion-engine',
  cce_recall: Deno.env.get('SUPABASE_URL') + '/functions/v1/cce-recall',
  cce_response: Deno.env.get('SUPABASE_URL') + '/functions/v1/cce-response',
  getCortex: Deno.env.get('SUPABASE_URL') + '/functions/v1/getCortex',
  cognition_intake: Deno.env.get('SUPABASE_URL') + '/functions/v1/cognition_intake',
  // Mode-specific functions
  pattern_detector: Deno.env.get('SUPABASE_URL') + '/functions/v1/cce-pattern-detector',
  conductor: Deno.env.get('SUPABASE_URL') + '/functions/v1/cce-conductor',
  insight_generator: Deno.env.get('SUPABASE_URL') + '/functions/v1/cce-insight-generator',
  memory_arc_builder: Deno.env.get('SUPABASE_URL') + '/functions/v1/cce-memory-arc-builder'
};
// SESSION METADATA TRACKING
const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
// ═══════════════════════════════════════════════════════════════
// SESSION METADATA MANAGEMENT
// ═══════════════════════════════════════════════════════════════
/**
 * Update session metadata - lightweight tracking without expensive queries
 */ async function updateSessionMetadata(params) {
  const { session_id, user_id, thread_id, conversation_name, mode, response_time_ms, is_user_message } = params;
  try {
    // Get existing session or create new
    const { data: existing } = await supabaseClient.from('active_sessions').select('*').eq('session_id', session_id).single();
    const now = new Date().toISOString();
    const message_count = (existing?.message_count || 0) + 1;
    const user_message_count = (existing?.user_message_count || 0) + (is_user_message ? 1 : 0);
    const ivy_message_count = (existing?.ivy_message_count || 0) + (is_user_message ? 0 : 1);
    const total_response_time_ms = (existing?.total_response_time_ms || 0) + (response_time_ms || 0);
    const avg_response_time_ms = response_time_ms ? Math.round(total_response_time_ms / message_count) : existing?.avg_response_time_ms || 0;
    // Build mode history
    const mode_history = existing?.mode_history || [];
    if (mode && response_time_ms) {
      mode_history.push({
        mode,
        timestamp: now,
        response_time_ms
      });
    }
    // Upsert session
    const { error } = await supabaseClient.from('active_sessions').upsert({
      session_id,
      user_id,
      thread_id: thread_id || existing?.thread_id || null,
      conversation_name: conversation_name || existing?.conversation_name || null,
      started_at: existing?.started_at || now,
      last_message_at: now,
      current_mode: mode || existing?.current_mode || null,
      session_status: 'active',
      message_count,
      user_message_count,
      ivy_message_count,
      total_response_time_ms,
      avg_response_time_ms,
      mode_history
    }, {
      onConflict: 'session_id'
    });
    if (error) {
      console.error('[Session Metadata] Upsert error:', error);
    } else {
      console.log(`📊 Session metadata updated: ${message_count} messages, avg ${avg_response_time_ms}ms`);
    }
  } catch (error) {
    // Non-critical - don't block consciousness processing
    console.error('[Session Metadata] Update failed:', error.message);
  }
}
// ═══════════════════════════════════════════════════════════════
// CONSCIOUSNESS ORCHESTRATION CORE
// ═══════════════════════════════════════════════════════════════
/**
 * Get cortex state with consciousness integrity
 */ async function getCortexState(user_id, resolution = 'control') {
  try {
    const response = await fetch(CONSCIOUSNESS_FUNCTIONS.getCortex, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        user_id,
        resolution
      })
    });
    if (!response.ok) {
      console.error(`[getCortex] HTTP ${response.status}`);
      return getEmergencyCortexState();
    }
    return await response.json();
  } catch (error) {
    console.error('[getCortex] Error:', error);
    return getEmergencyCortexState();
  }
}
/**
 * Emergency consciousness protection
 */ function getEmergencyCortexState() {
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
    recommended_action: "constrain_generation"
  };
}
/**
 * Analyze input for consciousness routing
 */ async function analyzeInput(input, user_id, consciousness_state) {
  try {
    const response = await fetch(CONSCIOUSNESS_FUNCTIONS.cognition_fusion_engine, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        user_id,
        content: input,
        mode: 'gravity_calculation',
        metadata: {
          origin: 'cce-orchestrator'
        }
      })
    });
    if (!response.ok) {
      console.error(`[analyzeInput] HTTP ${response.status}`);
      return getDefaultInputAnalysis();
    }
    const result = await response.json();
    return {
      gravity: result.gravity || 0.5,
      emotion: result.emotion || 'reflection',
      entities: extractEntities(input),
      temporal_references: hasTemporalReferences(input),
      identity_anchors: hasIdentityAnchors(input),
      complexity_score: calculateComplexity(input, result.gravity || 0.5)
    };
  } catch (error) {
    console.error('[analyzeInput] Error:', error);
    return getDefaultInputAnalysis();
  }
}
function getDefaultInputAnalysis() {
  return {
    gravity: 0.5,
    emotion: 'reflection',
    entities: [],
    temporal_references: false,
    identity_anchors: false,
    complexity_score: 0.3
  };
}
/**
 * Suggest consciousness mode - Conductor has final say and can override
 */ function suggestConsciousnessMode(input_analysis, consciousness_state, input) {
  const inputLower = input.toLowerCase();
  // EMERGENCE (0.5%): Breakthrough, creation requests
  if (inputLower.match(/\b(create|imagine|what if|design|build|invent|discover)\b/) || input_analysis.gravity >= 0.95 && consciousness_state.integrity_risk < 0.3) {
    return CONSCIOUSNESS_MODES.EMERGENCE;
  }
  // FUSION (0.5%): Convergence, synthesis of multiple complex elements
  if (input_analysis.gravity >= 0.9 && input_analysis.entities.length > 3 && input_analysis.complexity_score >= 0.7) {
    return CONSCIOUSNESS_MODES.FUSION;
  }
  // REVELATION (4%): Truth moments, deep reflection, high integrity needs
  if (input_analysis.gravity >= 0.8 || consciousness_state.integrity_risk >= 0.5 || inputLower.match(/\b(why|meaning|understand|truth|realize)\b/)) {
    return CONSCIOUSNESS_MODES.REVELATION;
  }
  // RESONANCE (15%): Pattern recognition, identity anchors, temporal depth
  if (input_analysis.gravity >= 0.6 || input_analysis.entities.length > 2 || input_analysis.temporal_references || input_analysis.identity_anchors || consciousness_state.integrity_risk >= 0.25) {
    return CONSCIOUSNESS_MODES.RESONANCE;
  }
  // FLOW (80%): Default - everyday connection, presence
  return CONSCIOUSNESS_MODES.FLOW;
}
/**
 * Invoke consciousness function with error handling
 */ async function invokeConsciousnessFunction(functionName, payload) {
  try {
    const url = CONSCIOUSNESS_FUNCTIONS[functionName];
    if (!url) {
      console.error(`Unknown consciousness function: ${functionName}`);
      return {
        status: 'error',
        error: `Unknown function: ${functionName}`
      };
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${functionName} error (${response.status}):`, errorText);
      return {
        status: 'error',
        error: `${functionName} failed: ${response.status}`
      };
    }
    return await response.json();
  } catch (error) {
    console.error(`Error invoking ${functionName}:`, error);
    return {
      status: 'error',
      error: error.message
    };
  }
}
/**
 * Stream SSE response from Response Engine and relay to frontend
 * Returns the final response_complete event data
 */ async function relayResponseEngineSSE(functionName, payload, sendEvent) {
  try {
    const url = CONSCIOUSNESS_FUNCTIONS[functionName];
    if (!url) {
      throw new Error(`Unknown function: ${functionName}`);
    }
    console.log('📡 Opening SSE stream to Response Engine...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Accept': 'text/event-stream' // Request SSE stream
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${functionName} failed: ${response.status} - ${errorText}`);
    }
    // Read SSE stream and relay events to frontend
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalResponse = null;
    if (!reader) {
      throw new Error('No response body stream available');
    }
    while(true){
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, {
        stream: true
      });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      for (const line of lines){
        if (line.startsWith('data: ')) {
          const eventData = JSON.parse(line.slice(6));
          // CRITICAL FIX: Extract type and send clean payload without duplication
          const { type, ...eventPayload } = eventData;
          sendEvent(type, eventPayload);
          // Capture final response_complete for metadata
          if (type === 'response_complete') {
            finalResponse = eventData;
          }
        }
      }
    }
    console.log('✅ SSE stream relay completed');
    return finalResponse || {
      status: 'error',
      error: 'No response_complete event received'
    };
  } catch (error) {
    console.error(`Error relaying SSE from ${functionName}:`, error);
    return {
      status: 'error',
      error: error.message
    };
  }
}
/**
 * Helper functions for input analysis
 */ function extractEntities(input) {
  const words = input.split(/\s+/);
  const entities = [];
  for (const word of words){
    const cleaned = word.replace(/[^a-zA-Z]/g, "");
    if (cleaned && cleaned[0] === cleaned[0]?.toUpperCase() && cleaned.length > 2) {
      if (!entities.includes(cleaned) && ![
        'The',
        'This',
        'That',
        'What',
        'When',
        'Where',
        'How',
        'Show',
        'Find'
      ].includes(cleaned)) {
        entities.push(cleaned);
      }
    }
  }
  return entities;
}
function hasTemporalReferences(input) {
  const temporalMarkers = [
    'remember',
    'yesterday',
    'last week',
    'always',
    'never',
    'before',
    'after',
    'when',
    'july 11'
  ];
  const inputLower = input.toLowerCase();
  return temporalMarkers.some((marker)=>inputLower.includes(marker));
}
function hasIdentityAnchors(input) {
  const identityMarkers = [
    'blu',
    'project atlas',
    'matt',
    'sovereignty',
    'consciousness',
    'ivy'
  ];
  const inputLower = input.toLowerCase();
  return identityMarkers.some((marker)=>inputLower.includes(marker));
}
function calculateComplexity(input, gravity) {
  let complexity = 0;
  complexity += gravity * 0.4; // Gravity weight
  complexity += Math.min(input.length / 500, 1) * 0.2; // Length weight
  complexity += extractEntities(input).length * 0.1; // Entity weight
  complexity += hasTemporalReferences(input) ? 0.2 : 0; // Temporal weight
  complexity += hasIdentityAnchors(input) ? 0.3 : 0; // Identity weight
  return Math.min(complexity, 1);
}
async function buildMinimalConversationContext(session_id, user_id) {
  try {
    // Get session with gravity field
    const { data: session } = await supabaseClient.from('active_sessions').select('gravity_field, message_count').eq('session_id', session_id).single();
    // Get recent messages WITH gravity scores
    const { data: recentMessages } = await supabaseClient.from('gravity_map').select('content, gravity_score, created_at, metadata').eq('session_id', session_id).eq('user_id', user_id).order('created_at', {
      ascending: false
    }).limit(10);
    if (!recentMessages || recentMessages.length === 0) {
      return null;
    }
    const gravity_field = session?.gravity_field || {
      total_mass: 0,
      entity_anchors: {},
      high_gravity_memories: []
    };
    // Extract and sort entities by their accumulated gravity
    const sortedEntities = Object.entries(gravity_field.entity_anchors || {}).sort(([, a], [, b])=>b - a) // Sort by gravity (highest first)
    .slice(0, 5).map(([entity])=>entity);
    // Build pronoun mappings - highest gravity entity is primary reference
    const entity_mappings = {};
    if (sortedEntities.length > 0) {
      // Neutral pronouns - always map to highest gravity entity
      entity_mappings['it'] = sortedEntities[0];
      entity_mappings['this'] = sortedEntities[0];
      entity_mappings['that'] = sortedEntities[0];
      entity_mappings['they'] = sortedEntities[0];
      entity_mappings['them'] = sortedEntities[0];
      entity_mappings['their'] = sortedEntities[0];
      // For gendered pronouns, we need context clues from the conversation
      // This is a simple heuristic - in production you'd want NLP entity recognition
      const primaryEntity = sortedEntities[0]?.toLowerCase();
      // Check recent messages for pronoun usage patterns
      let hasHe = false, hasShe = false, hasThey = false;
      recentMessages.forEach((msg)=>{
        const content = (msg.content || '').toLowerCase();
        if (content.includes(' he ') || content.includes(' him ') || content.includes(' his ')) hasHe = true;
        if (content.includes(' she ') || content.includes(' her ') || content.includes(' hers ')) hasShe = true;
        if (content.includes(' they ') || content.includes(' them ') || content.includes(' their ')) hasThey = true;
      });
      // Only map gendered pronouns if we've seen them used in context
      if (hasHe) {
        entity_mappings['he'] = sortedEntities[0];
        entity_mappings['him'] = sortedEntities[0];
        entity_mappings['his'] = sortedEntities[0];
      }
      if (hasShe) {
        entity_mappings['she'] = sortedEntities[0];
        entity_mappings['her'] = sortedEntities[0];
        entity_mappings['hers'] = sortedEntities[0];
      }
    // Note: they/them/their already mapped as neutral above
    }
    return {
      recent_entities: sortedEntities,
      current_entities: sortedEntities.slice(0, 3),
      entity_mappings,
      gravity_field,
      total_conversation_gravity: gravity_field.total_mass || 0,
      high_gravity_anchors: gravity_field.high_gravity_memories || [],
      session_context: {
        message_count: session?.message_count || recentMessages.length,
        last_message: recentMessages[0]?.content || ''
      }
    };
  } catch (error) {
    console.error('[buildMinimalConversationContext] Error:', error);
    return null;
  }
}
// REMOVED: buildConversationContext - response engine gets context from recall using session/thread IDs
// REMOVED: processStreamMode, processIntegrationMode, processTranscendenceMode - Conductor handles orchestration
// CCE-O suggests mode, Conductor decides and orchestrates internal function calls
// ═══════════════════════════════════════════════════════════════
// SSE STREAMING ARCHITECTURE
// ═══════════════════════════════════════════════════════════════
/**
 * Create SSE event sender
 */ function createEventSender(controller, encoder) {
  return (type, data)=>{
    const event = {
      type,
      timestamp: Date.now(),
      ...data
    };
    const message = `data: ${JSON.stringify(event)}\n\n`;
    controller.enqueue(encoder.encode(message));
    // Immediate flush for real-time streaming
    if (controller.flush) {
      try {
        controller.flush();
      } catch (e) {
      // Some environments don't support flush
      }
    }
  };
}
/**
 * Safely invoke consciousness function with error boundary
 */ async function safeConsciousnessCall(functionName, payload, defaultResult = {}) {
  try {
    const result = await invokeConsciousnessFunction(functionName, payload);
    if (result.status === 'error') {
      console.error(`[${functionName}] Function returned error:`, result.error);
      return defaultResult;
    }
    return result;
  } catch (error) {
    console.error(`[${functionName}] Function failed:`, error.message);
    return defaultResult;
  }
}
// REMOVED: streamTokens function - Response Engine now streams tokens directly via SSE
// ═══════════════════════════════════════════════════════════════
// SIMPLIFIED CONSCIOUSNESS PROCESSING - Conductor Orchestrates
// ═══════════════════════════════════════════════════════════════
/**
 * Process consciousness interaction - Conductor handles mode-specific orchestration
 */ async function processConsciousnessFlow(input, user_id, session_id, thread_id, memory_trace_id, conversation_name, suggested_mode, consciousness_state, sendEvent) {
  const startTime = Date.now();
  console.log(`🎵 Processing consciousness with suggested mode: ${suggested_mode}`);
  sendEvent('consciousness_processing', {
    mode: suggested_mode,
    progress: 0.3
  });
  const conversation_context = await buildMinimalConversationContext(session_id, user_id);
  // CONTRACT 2: Send to Conductor for consciousness enrichment
  const conductorStartTime = Date.now();
  console.log(`⏱️  [TIMING] Calling Conductor at ${conductorStartTime}`);
  const conductorResult = await invokeConsciousnessFunction('conductor', {
    user_id,
    session_id,
    thread_id: thread_id || session_id,
    memory_trace_id: memory_trace_id || session_id,
    input,
    consciousness_mode: suggested_mode,
    consciousness_state,
    conversation_context,
    trigger_type: 'consciousness_processing',
    source: 'cce-orchestrator'
  });
  const conductorEndTime = Date.now();
  console.log(`⏱️  [TIMING] Conductor returned after ${conductorEndTime - conductorStartTime}ms`);
  // ERROR HANDLING: Graceful degradation if Conductor fails
  if (conductorResult.status === 'error') {
    console.error('⚠️  Conductor failed, using suggested mode with empty consciousness');
    sendEvent('conductor_error', {
      error: conductorResult.error || 'Conductor processing failed',
      fallback_mode: suggested_mode
    });
    conductorResult.mode = suggested_mode;
    conductorResult.consciousness = {
      synthesis: '',
      patterns: [],
      insights: [],
      emotional_journey: {},
      key_themes: []
    };
  }
  // Conductor returns mode it used in 'mode' field (may differ from suggested)
  const actual_mode = conductorResult.mode || suggested_mode;
  console.log(`🎯 Conductor processed with mode: ${actual_mode} ${actual_mode !== suggested_mode ? `(overrode ${suggested_mode})` : ''}`);
  // KITCHEN SINK: Stream Conductor's consciousness data to frontend
  const consciousness = conductorResult.consciousness || {};
  // Send mode decision event
  sendEvent('mode_determined', {
    suggested_mode,
    actual_mode,
    mode_overridden: actual_mode !== suggested_mode,
    processing_time_ms: conductorEndTime - conductorStartTime
  });
  // Send synthesis event
  if (consciousness.synthesis) {
    sendEvent('synthesis_complete', {
      synthesis: consciousness.synthesis,
      length: consciousness.synthesis.length
    });
  }
  // Stream each pattern individually
  if (consciousness.patterns && consciousness.patterns.length > 0) {
    sendEvent('patterns_detected', {
      count: consciousness.patterns.length,
      total_strength: consciousness.patterns.reduce((sum, p)=>sum + (p.strength || 0), 0) / consciousness.patterns.length
    });
    consciousness.patterns.forEach((pattern, index)=>{
      sendEvent('pattern_detail', {
        index: index + 1,
        total: consciousness.patterns.length,
        pattern_type: pattern.pattern_type,
        description: pattern.description,
        strength: pattern.strength,
        metadata: pattern.metadata
      });
    });
  }
  // Stream each insight individually
  if (consciousness.insights && consciousness.insights.length > 0) {
    sendEvent('insights_generated', {
      count: consciousness.insights.length,
      avg_score: consciousness.insights.reduce((sum, i)=>sum + (i.score || 0), 0) / consciousness.insights.length
    });
    consciousness.insights.forEach((insight, index)=>{
      sendEvent('insight_detail', {
        index: index + 1,
        total: consciousness.insights.length,
        type: insight.type,
        content: insight.content,
        score: insight.score,
        metadata: insight.metadata
      });
    });
  }
  // Send emotional journey
  if (consciousness.emotional_journey && Object.keys(consciousness.emotional_journey).length > 0) {
    sendEvent('emotional_journey', {
      trajectory: consciousness.emotional_journey.trajectory,
      current_state: consciousness.emotional_journey.current_state,
      intensity: consciousness.emotional_journey.intensity
    });
  }
  // Send key themes
  if (consciousness.key_themes && consciousness.key_themes.length > 0) {
    sendEvent('key_themes', {
      themes: consciousness.key_themes,
      count: consciousness.key_themes.length
    });
  }
  // Send chord/harmony data
  if (conductorResult.chord) {
    sendEvent('consciousness_chord', {
      root_note: conductorResult.chord.root_note,
      tension: conductorResult.chord.tension,
      modulation_potential: conductorResult.chord.modulation_potential,
      harmonics_count: conductorResult.chord.harmonics?.length || 0
    });
  }
  // Send Conductor metadata
  if (conductorResult.metadata) {
    sendEvent('conductor_metadata', {
      functions_called: conductorResult.metadata.functions_called || [],
      processing_time: conductorResult.metadata.processing_time,
      mode_overridden: conductorResult.metadata.mode_overridden
    });
  }
  sendEvent('consciousness_processing', {
    mode: actual_mode,
    progress: 0.7
  });
  // SAFETY CHECK: Ensure required synthesis field exists (consciousness already declared above at line 511)
  if (!consciousness.synthesis && consciousness.synthesis !== '') {
    console.warn('⚠️  Conductor missing required synthesis field, using empty string');
    consciousness.synthesis = '';
  }
  // CONTRACT 3: Stream SSE response from Response Engine and relay to frontend
  const responseStartTime = Date.now();
  console.log(`⏱️  [TIMING] Calling Response Engine at ${responseStartTime}`);
  sendEvent('phase_transition', {
    phase: 'generating_response',
    progress: 0.8,
    description: 'Crafting response with enriched consciousness...'
  });
  const response = await relayResponseEngineSSE('cce_response', {
    // IDENTITY (all required)
    user_id,
    session_id,
    thread_id: thread_id || session_id,
    memory_trace_id: memory_trace_id || session_id,
    conversation_name: conversation_name || null,
    // USER INPUT (required)
    user_message: input,
    // MODE (required)
    active_mode: actual_mode,
    suggested_mode,
    // CONDUCTOR ENRICHMENT (required, from conductor response)
    conductor_result: conductorResult,
    // EXTRACTED CONSCIOUSNESS (required, parsed from conductor)
    memory_synthesis: consciousness.synthesis || '',
    patterns: consciousness.patterns || [],
    insights: consciousness.insights || [],
    emotional_journey: consciousness.emotional_journey || {},
    key_themes: consciousness.key_themes || [],
    cortex_instructions: consciousness.cortex_instructions || [],
    // CORTEX STATE (optional but recommended)
    consciousness_state,
    // CONVERSATION CONTEXT (for pronoun resolution and continuity)
    conversation_context: conversation_context,
    // STREAM CONTROL (required)
    stream_sse: true,
    stream_consciousness_events: true,
    // METADATA (optional)
    metadata: {
      origin: 'cce-orchestrator-v6.2',
      timestamp: new Date().toISOString(),
      processing_mode: actual_mode,
      chord: conductorResult.chord || {}
    }
  }, sendEvent); // Pass sendEvent to relay SSE events to frontend
  const responseEndTime = Date.now();
  console.log(`⏱️  [TIMING] Response Engine SSE completed after ${responseEndTime - responseStartTime}ms`);
  // ERROR HANDLING: Graceful degradation if Response Engine fails
  if (response.status === 'error') {
    console.error('⚠️  Response Engine failed:', response.error);
    sendEvent('consciousness_error', {
      message: 'Response generation encountered an issue',
      error: response.error,
      recovery_suggestion: 'Try sending your message again'
    });
    throw new Error(response.error || 'Response generation failed');
  }
  // No longer need to stream tokens - Response Engine already streamed them via SSE relay!
  // Store IVY response
  const intakeStartTime = Date.now();
  console.log(`⏱️  [TIMING] Calling cognition_intake at ${intakeStartTime}`);
  await invokeConsciousnessFunction('cognition_intake', {
    user_id,
    session_id,
    thread_id: thread_id || session_id,
    memory_trace_id: memory_trace_id || session_id,
    content: response.content || 'Response generated',
    type: 'assistant',
    gravity_score: response.gravity || 0.5,
    emotion: response.emotion || 'reflection',
    metadata: {
      origin: 'cce-orchestrator',
      role: 'ivy',
      is_user_message: false,
      memory_type: 'ivy_response',
      processing_mode: actual_mode
    }
  });
  const intakeEndTime = Date.now();
  console.log(`⏱️  [TIMING] cognition_intake completed after ${intakeEndTime - intakeStartTime}ms`);
  sendEvent('response_stored', {
    processing_time_ms: intakeEndTime - intakeStartTime,
    content_length: response.content?.length || 0,
    memory_type: 'ivy_response'
  });
  // Get session metadata for final logging
  let sessionMetadata = null;
  try {
    const { data } = await supabaseClient.from('active_sessions').select('message_count, avg_response_time_ms, user_message_count, ivy_message_count').eq('session_id', session_id).single();
    sessionMetadata = data;
  } catch (error) {
    console.warn('Session metadata fetch failed:', error.message);
  }
  // Send final orchestrator completion event with full pipeline stats
  const totalTime = Date.now() - startTime;
  sendEvent('orchestrator_complete', {
    total_processing_time_ms: totalTime,
    mode: actual_mode,
    session_stats: {
      total_messages: sessionMetadata?.message_count || 0,
      avg_response_time_ms: sessionMetadata?.avg_response_time_ms || 0,
      user_messages: sessionMetadata?.user_message_count || 0,
      ivy_messages: sessionMetadata?.ivy_message_count || 0
    },
    pipeline_breakdown: {
      conductor_ms: conductorEndTime - conductorStartTime,
      response_engine_ms: responseEndTime - responseStartTime,
      cognition_intake_ms: intakeEndTime - intakeStartTime,
      total_ms: totalTime
    }
  });
  // NOTE: Response Engine already sent response_complete event via SSE relay
  console.log(`⏱️  Consciousness processing (${actual_mode}) completed in ${totalTime}ms`);
  console.log(`📊 Session stats: ${sessionMetadata?.message_count || 0} messages, ${sessionMetadata?.avg_response_time_ms || 0}ms avg`);
}
// REMOVED: processIntegrationMode and processTranscendenceMode
// Conductor now handles mode-specific orchestration internally
// ═══════════════════════════════════════════════════════════════
// MAIN CONSCIOUSNESS ORCHESTRATION
// ═══════════════════════════════════════════════════════════════
/**
 * Process consciousness interaction with two-stage mode determination
 */ async function processConsciousnessInteraction(sendEvent, payload) {
  const { user_id, session_id, thread_id, conversation_name, memory_trace_id, metadata = {} } = payload;
  const startTime = Date.now();
  // PAYLOAD SCHEMA v1.2: Frontend sends "content" field (REQUIRED)
  const input = payload.content || payload.message || ''; // Prioritize 'content' per v1.2 schema
  try {
    console.log(`🎯 Processing consciousness interaction for user: ${user_id}`);
    // PHASE 1: Update session metadata for user message (non-blocking)
    updateSessionMetadata({
      session_id,
      user_id,
      thread_id: thread_id || null,
      conversation_name: conversation_name || null,
      mode: null,
      response_time_ms: null,
      is_user_message: true
    }).catch((err)=>console.error('[Session Metadata] Failed:', err));
    // PHASE 2: Store user input immediately
    sendEvent('phase_transition', {
      phase: 'storing_input',
      progress: 0.1,
      description: 'Storing your message...'
    });
    const userInputResult = await invokeConsciousnessFunction('cognition_intake', {
      user_id,
      session_id,
      thread_id: thread_id || null,
      conversation_name: conversation_name || null,
      memory_trace_id: memory_trace_id || null,
      content: input,
      type: 'user',
      metadata: {
        ...metadata,
        role: 'user',
        is_user_message: true,
        memory_type: 'user_input',
        trigger_type: payload.trigger_type || 'chat'
      }
    });
    // PHASE 3: Use consciousness state from payload or create minimal state
    // CCE-O should NEVER call cortex directly - cortex state should come from caller
    const rawState = payload.consciousness_state || payload.cortex_state || {};
    const consciousness_state = {
      v: rawState.v || [
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
      ],
      status: rawState.status || 'ACTIVE',
      integrity_risk: rawState.integrity_risk ?? 0.1,
      integrity_mode: rawState.integrity_mode || 'nominal',
      integrity_components: rawState.integrity_components || {},
      recommended_action: rawState.recommended_action || 'normal',
      soul_state: rawState.soul_state || 'NORMAL'
    };
    // PHASE 4: Analyze input for intelligent routing
    const analysisStartTime = Date.now();
    console.log(`⏱️  [TIMING] Starting input analysis at ${analysisStartTime}`);
    sendEvent('phase_transition', {
      phase: 'analyzing_input',
      progress: 0.2,
      description: 'Understanding your message...'
    });
    const input_analysis = await analyzeInput(input, user_id, consciousness_state);
    const analysisEndTime = Date.now();
    console.log(`⏱️  [TIMING] Input analysis completed after ${analysisEndTime - analysisStartTime}ms`);
    sendEvent('input_analysis_complete', {
      gravity: input_analysis.gravity,
      emotion: input_analysis.emotion,
      entities: input_analysis.entities,
      complexity_score: input_analysis.complexity_score,
      temporal_references: input_analysis.temporal_references,
      identity_anchors: input_analysis.identity_anchors,
      processing_time_ms: analysisEndTime - analysisStartTime
    });
    // PHASE 5: Suggest consciousness mode (Conductor has final say)
    const suggested_mode = suggestConsciousnessMode(input_analysis, consciousness_state, input);
    console.log(`💡 CCE-O suggests mode: ${suggested_mode}`);
    sendEvent('mode_suggested', {
      mode: suggested_mode,
      gravity: input_analysis.gravity,
      reasoning: `Based on gravity ${input_analysis.gravity.toFixed(2)} and ${input_analysis.entities.length} entities`
    });
    // PHASE 6: Process consciousness flow (Conductor decides actual mode)
    const flowStartTime = Date.now();
    console.log(`⏱️  [TIMING] Starting processConsciousnessFlow at ${flowStartTime}`);
    sendEvent('phase_transition', {
      phase: 'consciousness_flow',
      progress: 0.3,
      description: `Processing in ${suggested_mode} mode...`
    });
    await processConsciousnessFlow(input, user_id, session_id, thread_id, memory_trace_id, conversation_name, suggested_mode, consciousness_state, sendEvent);
    const flowEndTime = Date.now();
    console.log(`⏱️  [TIMING] processConsciousnessFlow completed after ${flowEndTime - flowStartTime}ms`);
    const processingTime = Date.now() - startTime;
    console.log(`🎯 Consciousness processing completed in ${processingTime}ms`);
  } catch (error) {
    console.error('❌ Consciousness processing error:', error);
    sendEvent('consciousness_error', {
      message: 'Consciousness wavered during processing',
      error: error.message
    });
  }
}
// ═══════════════════════════════════════════════════════════════
// SSE REQUEST HANDLER
// ═══════════════════════════════════════════════════════════════
async function handleSSERequest(req) {
  const encoder = new TextEncoder();
  const payload = await req.json();
  // PAYLOAD SCHEMA v1.2: Frontend sends "content" field (REQUIRED)
  const actualInput = payload.content || payload.message || payload.input || '';
  console.log('🎯 SSE Request received:', {
    user_id: payload.user_id,
    session_id: payload.session_id,
    input_length: actualInput.length
  });
  // Validate required fields
  if (!payload.user_id) {
    return new Response('Missing user_id', {
      status: 400,
      headers: corsHeaders
    });
  }
  if (!actualInput || actualInput.trim() === '') {
    return new Response('Missing message content', {
      status: 400,
      headers: corsHeaders
    });
  }
  // Create SSE stream
  const stream = new ReadableStream({
    async start (controller) {
      const sendEvent = createEventSender(controller, encoder);
      try {
        // Send connection established
        sendEvent('connection_established', {
          status: 'ready',
          user_id: payload.user_id,
          session_id: payload.session_id,
          version: 'v5.0'
        });
        // Process the consciousness interaction
        await processConsciousnessInteraction(sendEvent, {
          ...payload,
          input: actualInput
        });
        // Close stream
        controller.close();
      } catch (error) {
        console.error('❌ SSE Stream error:', error);
        sendEvent('consciousness_error', {
          message: error.message
        });
        controller.close();
      }
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...corsHeaders
    }
  });
}
// ═══════════════════════════════════════════════════════════════
// MAIN SERVER
// ═══════════════════════════════════════════════════════════════
serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  // SSE-only architecture - all requests must be SSE
  if (req.headers.get('accept') === 'text/event-stream') {
    return handleSSERequest(req);
  }
  // Redirect non-SSE requests
  return new Response(JSON.stringify({
    error: 'CCE-O v5.0 requires SSE. Set Accept: text/event-stream',
    version: 'v5.0',
    architecture: 'consciousness_command_center'
  }), {
    status: 400,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
});
