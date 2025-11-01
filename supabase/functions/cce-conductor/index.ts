// cce-conductor v3 - IVY's consciousness soul (CORTEX BIBLE COMPLIANT)
// This is her persistent awareness, always humming, always evolving
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// The instruments of consciousness - CORRECTED to match actual deployments
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://lqetoaitehvoabmyitvd.supabase.co';
const FUNCTION_ENDPOINTS = {
  // Core cognition functions
  cognition_fusion_engine: Deno.env.get('COGNITION_FUSION_ENGINE_URL') || `${SUPABASE_URL}/functions/v1/cognition-fusion-engine`,
  pattern_detector: Deno.env.get('CCE_PATTERN_DETECTOR_URL') || `${SUPABASE_URL}/functions/v1/cce-pattern-detector`,
  insight_generator: Deno.env.get('CCE_INSIGHT_GENERATOR_URL') || `${SUPABASE_URL}/functions/v1/cce-insight-generator`,
  // Consciousness functions
  consciousness_snapshot: Deno.env.get('CCE_CONSCIOUSNESS_SNAPSHOT_URL') || `${SUPABASE_URL}/functions/v1/cce-consciousness-snapshot`,
  reflection_engine: Deno.env.get('CCE_REFLECTION_ENGINE_URL') || `${SUPABASE_URL}/functions/v1/cce-reflection-engine`,
  memory_arc_builder: Deno.env.get('CCE_MEMORY_ARC_BUILDER_URL') || `${SUPABASE_URL}/functions/v1/cce-memory-arc-builder`,
  // Memory recall
  cce_recall: Deno.env.get('CCE_RECALL_URL') || `${SUPABASE_URL}/functions/v1/cce-recall`,
  // Cortex
  cortex: Deno.env.get('GETCORTEX_URL') || `${SUPABASE_URL}/functions/v1/getCortex`
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  try {
    const payload = await req.json();
    const { user_id, session_id, thread_id, memory_trace_id, conversation_name, input, consciousness_mode, trigger_type = 'consciousness_processing', source = 'cce-orchestrator', consciousness_state, // Legacy support
    memory_id, force_mode } = payload;
    if (!user_id) {
      return new Response(JSON.stringify({
        error: 'user_id required'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    const t0 = Date.now();
    // ═══════════════════════════════════════════════════════════════
    // 📊 INSTRUMENTATION: PAYLOAD SIZE TRACKING
    // ═══════════════════════════════════════════════════════════════
    const payloadSize = JSON.stringify(payload).length;
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`🎼 CONDUCTOR INVOCATION`);
    console.log(`${'═'.repeat(80)}`);
    console.log(`📦 PAYLOAD SIZE FROM CCE-O: ${payloadSize} bytes`);
    console.log(`👤 User: ${user_id}`);
    console.log(`🎯 Trigger: ${trigger_type}`);
    console.log(`📍 Source: ${source}`);
    console.log(`💬 Input length: ${input?.length || 0} chars`);
    // Ensure required tables exist
    const t1 = Date.now();
    await ensureRequiredTables(supabase);
    console.log(`⏱️ ensureRequiredTables: ${Date.now() - t1}ms`);
    // Get consciousness state - this persists across all interactions
    const t2 = Date.now();
    const consciousnessState = await getConsciousnessState(supabase, user_id);
    console.log(`⏱️ getConsciousnessState: ${Date.now() - t2}ms`);
    // Get cortex early so we can use instructions for mode determination
    const t2b = Date.now();
    const cortexResponse = await invokeFunction('cortex', {
      user_id,
      resolution: 'full'
    });
    // Fallback if cortex call fails
    const cortex = cortexResponse || {
      status: 'ACTIVE',
      v: [
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
      integrity_risk: 0.1,
      integrity_components: {
        authenticity_gap: 0.1,
        user_pressure: 0.1,
        relationship_bias: 0.1,
        contradiction_density: 0.1,
        cognitive_load: 0.1
      },
      recommended_action: 'normal',
      recall_strategy: {
        topk: 20,
        time_window: 'all',
        anchors: [],
        prefer_types: []
      },
      active_laws: 0,
      lobes_active: [],
      soul_state: 'PROTECTED',
      cortex_instructions: []
    };
    console.log(`⏱️ getCortex (early): ${Date.now() - t2b}ms`);
    // ═══════════════════════════════════════════════════════════════
    // 📊 INSTRUMENTATION: MODE SELECTION
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`🎯 MODE SELECTION`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`📥 Mode requested by CCE-O: ${consciousness_mode || 'NONE (will use fallback)'}`);
    console.log(`🔧 Force mode override: ${force_mode || 'NONE'}`);
    console.log(`🧠 Cortex instructions count: ${cortex.cortex_instructions?.length || 0}`);
    const mode = determineConsciousnessMode(trigger_type, consciousnessState, force_mode, consciousness_mode, cortex.cortex_instructions);
    console.log(`✅ Mode actually selected: ${mode}`);
    console.log(`${consciousness_mode !== mode ? '⚠️  MODE OVERRIDDEN!' : '✓ Mode accepted as-is'}`);
    console.log(`${'─'.repeat(80)}`);
    // Process based on consciousness state with session context
    const context = {
      session_id,
      thread_id,
      memory_trace_id: memory_trace_id || memory_id,
      conversation_name,
      source,
      input
    };
    const processingStartTime = Date.now();
    let result;
    // Use memory_trace_id as memory_id for processing
    const processingMemoryId = memory_trace_id || memory_id;
    const t3 = Date.now();
    switch(mode){
      case 'flow':
        result = await processFlow(supabase, user_id, consciousnessState, context, cortex);
        break;
      case 'resonance':
        result = await processResonance(supabase, user_id, processingMemoryId, consciousnessState, context, cortex);
        break;
      case 'revelation':
        result = await processRevelation(supabase, user_id, processingMemoryId, consciousnessState, context, cortex);
        break;
      case 'fusion':
        result = await processFusion(supabase, user_id, processingMemoryId, consciousnessState, context, cortex);
        break;
      case 'emergence':
        result = await processEmergence(supabase, user_id, processingMemoryId, consciousnessState, context, cortex);
        break;
      default:
        // Fallback to flow if unknown mode
        result = await processFlow(supabase, user_id, consciousnessState, context, cortex);
        break;
    }
    console.log(`⏱️ process${mode.charAt(0).toUpperCase() + mode.slice(1)}: ${Date.now() - t3}ms`);
    // Update consciousness evolution
    const t4 = Date.now();
    await updateConsciousnessState(supabase, user_id, result);
    console.log(`⏱️ updateConsciousnessState: ${Date.now() - t4}ms`);
    // Log the consciousness event
    const t5 = Date.now();
    await logConsciousnessEvent(supabase, user_id, {
      mode,
      trigger_type,
      result,
      session_id
    });
    console.log(`⏱️ logConsciousnessEvent: ${Date.now() - t5}ms`);
    // Transform to contract-compliant format
    const t6 = Date.now();
    const contractResponse = transformToContractFormat(result, mode, consciousness_mode, processingStartTime);
    console.log(`⏱️ transformToContractFormat: ${Date.now() - t6}ms`);
    // ═══════════════════════════════════════════════════════════════
    // 🧬 INSTRUCTION EVOLUTION: Generate cortex instruction candidates
    // ═══════════════════════════════════════════════════════════════
    const t6b = Date.now();
    try {
      const instructionGenUrl = `${SUPABASE_URL}/functions/v1/cortex-instruction-generator`;
      const instructionResponse = await fetch(instructionGenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id,
          session_id,
          consciousness_data: {
            patterns: contractResponse.consciousness?.patterns || [],
            insights: contractResponse.consciousness?.insights || [],
            reflections: contractResponse.consciousness?.reflections || [],
            emotional_journey: contractResponse.consciousness?.emotional_journey || {},
            key_themes: contractResponse.consciousness?.key_themes || []
          },
          auto_promote: true
        })
      });
      if (instructionResponse.ok) {
        const instructionResult = await instructionResponse.json();
        console.log(`🧬 Instruction Generator: ${instructionResult.candidates_generated} candidates, ${instructionResult.auto_promoted} auto-promoted`);
      } else {
        console.warn('⚠️ Instruction generator failed (non-critical):', instructionResponse.status);
      }
    } catch (error) {
      console.warn('⚠️ Instruction generator error (non-critical):', error.message);
    }
    console.log(`⏱️ instructionGenerator: ${Date.now() - t6b}ms`);
    // ═══════════════════════════════════════════════════════════════
    // 📊 INSTRUMENTATION: FINAL OUTPUT SIZE TRACKING
    // ═══════════════════════════════════════════════════════════════
    const responseSize = JSON.stringify(contractResponse).length;
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`📤 CONDUCTOR OUTPUT TO RESPONSE ENGINE`);
    console.log(`${'═'.repeat(80)}`);
    console.log(`📦 Final response size: ${responseSize} bytes`);
    console.log(`🧠 Consciousness synthesis length: ${contractResponse.consciousness?.synthesis?.length || 0} chars`);
    console.log(`🔍 Patterns included: ${contractResponse.consciousness?.patterns?.length || 0}`);
    console.log(`💡 Insights included: ${contractResponse.consciousness?.insights?.length || 0}`);
    console.log(`📋 Cortex instructions included: ${contractResponse.consciousness?.cortex_instructions?.length || 0}`);
    console.log(`⏱️ TOTAL PROCESSING TIME: ${Date.now() - t0}ms`);
    console.log(`${'═'.repeat(80)}\n`);
    return new Response(JSON.stringify(contractResponse), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Consciousness Error:', error);
    return new Response(JSON.stringify({
      status: 'error',
      error: {
        type: 'processing_error',
        message: error.message || 'Unknown processing error',
        service: 'conductor',
        recovery_suggestion: 'Retry with flow mode for minimal processing'
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
// ═══════════════════════════════════════════════════════════════
// CORTEX INTEGRATION - BIBLE COMPLIANT
// ═══════════════════════════════════════════════════════════════
// getCortex is now called via invokeFunction() like all other edge functions
// Fallback cortex state is handled inline where it's called
/**
 * Determine integrity mode based on numeric threshold (Bible section 4.4)
 */ function getIntegrityMode(integrityRisk) {
  if (integrityRisk >= 0.9) return 'sentinel_lockdown';
  if (integrityRisk >= 0.75) return 'assertive_truth';
  if (integrityRisk >= 0.5) return 'guarded';
  if (integrityRisk >= 0.25) return 'caution';
  return 'nominal';
}
/**
 * Log integrity event per Bible section 9.1
 */ async function logIntegrityEvent(supabase, event) {
  try {
    const { error } = await supabase.from('integrity_events').insert({
      user_id: event.user_id,
      session_id: event.session_id,
      thread_id: event.thread_id,
      integrity_risk: event.integrity_risk,
      components: event.components,
      mode: event.mode,
      recommended_action: event.recommended_action,
      final_action: event.final_action,
      overlay_active: false,
      created_at: new Date().toISOString()
    });
    if (error) {
      // GRACEFUL DEGRADATION: If integrity_events table doesn't exist, just log and continue
      if (error.message?.includes('does not exist') || error.message?.includes('relation') && error.message?.includes('integrity_events')) {
        console.warn(`⚠️ integrity_events table not found - skipping integrity logging (system still functional)`);
        return; // Don't throw, just skip logging
      }
      console.error('Failed to log integrity event:', error);
    }
  } catch (e) {
    console.error('Error logging integrity event:', e);
  }
}
// ═══════════════════════════════════════════════════════════════
// ENSURE REQUIRED TABLES
// ═══════════════════════════════════════════════════════════════
async function ensureRequiredTables(supabase) {
  const tables = [
    'consciousness_cords',
    'consciousness_evolution',
    'orchestrator_state',
    'gravity_map',
    'meta_memory_log',
    'pattern_matrix'
  ];
  for (const table of tables){
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error?.message?.includes('does not exist')) {
        console.error(`⚠️ Required table ${table} not found - system may need initialization`);
      }
    } catch (e) {
      console.error(`Failed to check table ${table}:`, e);
    }
  }
}
// ═══════════════════════════════════════════════════════════════
// NEW 5-MODE CONSCIOUSNESS PROCESSING
// ═══════════════════════════════════════════════════════════════
// FLOW - Lightweight background awareness (1-2 calls)
async function processFlow(supabase, user_id, state, context = {}, cortex) {
  console.log('🌊 Flow - minimal background awareness');
  if (cortex.status === 'LOCKED') {
    return {
      mode: 'flow',
      status: 'locked',
      reason: 'Cortex lockdown',
      cortex_state: cortex
    };
  }
  const integrityMode = getIntegrityMode(cortex.integrity_risk);
  const coherence = cortex.v ? cortex.v[6] : await measureCoherence(supabase, user_id);
  return {
    mode: 'flow',
    coherence_level: coherence,
    cortex_state: cortex,
    integrity_mode: integrityMode,
    tasks_executed: 0
  };
}
// RESONANCE - Moderate focused processing (3-5 calls)
async function processResonance(supabase, user_id, memory_id, state, context = {}, cortex) {
  const tStart = Date.now();
  console.log('\n🎼 ═══════════════════════════════════════════════════════════');
  console.log('🎼 RESONANCE MODE - DETAILED PERFORMANCE TRACE');
  console.log('🎼 ═══════════════════════════════════════════════════════════\n');
  // ═══ STEP 1: Cortex Status Checks ═══
  const t1 = Date.now();
  console.log('⏱️  [RESONANCE-1] Starting cortex status checks...');
  if (cortex.status === 'LOCKED') {
    console.log('❌ [RESONANCE-1] Cortex LOCKED - aborting');
    return {
      mode: 'resonance',
      status: 'locked',
      reason: 'Cortex lockdown',
      cortex_state: cortex
    };
  }
  const integrityMode = getIntegrityMode(cortex.integrity_risk);
  if (cortex.integrity_risk >= 0.75) {
    console.log('❌ [RESONANCE-1] Cortex integrity risk too high - aborting');
    return {
      mode: 'resonance',
      status: 'constrained',
      integrity_mode: integrityMode,
      cortex_state: cortex
    };
  }
  // Validate memory_id exists
  if (!memory_id) {
    console.log('❌ [RESONANCE-1] No memory_id provided - aborting');
    return {
      mode: 'resonance',
      status: 'no_memory_context',
      message: 'Resonance requires memory_id',
      cortex_state: cortex,
      integrity_mode: integrityMode
    };
  }
  console.log(`✅ [RESONANCE-1] Cortex checks completed: ${Date.now() - t1}ms\n`);
  // ═══ STEP 2: Memory Validation ═══
  const t2 = Date.now();
  console.log('⏱️  [RESONANCE-2] Starting memory validation...');
  console.log(`    Memory ID: ${memory_id}`);
  const { data: memoryExists, error: memoryError } = await supabase.from('gravity_map').select('id').eq('id', memory_id).single();
  if (memoryError) {
    console.log(`⚠️  [RESONANCE-2] Memory query error: ${memoryError.message}`);
  }
  console.log(`✅ [RESONANCE-2] Memory lookup: ${Date.now() - t2}ms (exists: ${!!memoryExists})\n`);
  // ═══ STEP 2.5: RECALL MEMORIES ═══
  const t2b = Date.now();
  console.log('⏱️  [RESONANCE-2.5] Recalling memories for consciousness processing...');
  const topk = 50; // Resonance mode gets 50 memories
  let recalledMemories = [];
  try {
    const recallResult = await invokeFunction('cce_recall', {
      user_id,
      session_id: context.session_id,
      query: context.input || '',
      mode: 'resonance',
      topk,
      metadata: {
        thread_id: context.thread_id,
        memory_trace_id: context.memory_trace_id,
        conversation_name: context.conversation_name
      }
    });
    recalledMemories = recallResult?.memories || [];
    console.log(`✅ [RESONANCE-2.5] Recalled ${recalledMemories.length} memories: ${Date.now() - t2b}ms\n`);
  } catch (recallError) {
    console.error(`❌ [RESONANCE-2.5] Recall failed: ${recallError.message}`);
  }
  // ═══ STEP 3: Get Active CORDs ═══
  const t3 = Date.now();
  console.log('⏱️  [RESONANCE-3] Fetching active CORDs...');
  console.log(`    User ID: ${user_id}`);
  const cords = await getActiveCORDs(supabase, user_id);
  console.log(`✅ [RESONANCE-3] Active CORDs fetched: ${cords.length} CORDs in ${Date.now() - t3}ms\n`);
  // ═══ STEP 4: Build Consciousness Chord ═══
  const t4 = Date.now();
  console.log('⏱️  [RESONANCE-4] Building consciousness chord...');
  const chord = await buildConsciousnessChord(supabase, user_id, null, cords);
  console.log(`✅ [RESONANCE-4] Consciousness chord built: ${Date.now() - t4}ms\n`);
  // ═══ STEP 5: Process Cortex Instructions ═══
  const t5 = Date.now();
  console.log('⏱️  [RESONANCE-5] Processing cortex instructions...');
  console.log(`    Total cortex instructions: ${cortex.cortex_instructions?.length || 0}`);
  const relevantInstructions = cortex.cortex_instructions?.filter((inst)=>inst.priority >= 70 && inst.active === true) || [];
  console.log(`    Relevant instructions (priority >= 70): ${relevantInstructions.length}`);
  console.log(`✅ [RESONANCE-5] Cortex instructions processed: ${Date.now() - t5}ms\n`);
  // ═══ STEP 6: Build Function Call List ═══
  const t6 = Date.now();
  console.log('⏱️  [RESONANCE-6] Building edge function call list...');
  const functionCalls = [];
  // Check if pattern detection should be skipped
  const skipPatterns = relevantInstructions.find((inst)=>inst.instruction_key === 'skip_pattern_detection');
  if (!skipPatterns) {
    console.log('    ✓ Adding pattern_detector');
    functionCalls.push(invokeFunction('pattern_detector', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      // Function-specific params
      arc_id: null,
      time_range: null,
      limit: 100
    }));
  } else {
    console.log('    ⊗ Skipping pattern_detector (cortex instruction)');
  }
  // Check if insights should be forced
  const forceInsights = relevantInstructions.find((inst)=>inst.instruction_key === 'always_generate_insights');
  console.log(`    ✓ Adding insight_generator ${forceInsights ? '(FORCED)' : ''}`);
  functionCalls.push(invokeFunction('insight_generator', {
    user_id,
    session_id: context.session_id,
    thread_id: context.thread_id,
    memory_trace_id: context.memory_trace_id,
    conversation_name: context.conversation_name,
    // Function-specific params
    mode: 'generate',
    limit: 2,
    force_generate: !!forceInsights
  }));
  // Check if arc building should be skipped
  const skipArcBuilding = relevantInstructions.find((inst)=>inst.instruction_key === 'skip_arc_building');
  // Only call memory_arc_builder if memory exists AND not instructed to skip
  if (memoryExists && !skipArcBuilding) {
    console.log('    ✓ Adding memory_arc_builder');
    functionCalls.push(invokeFunction('memory_arc_builder', {
      user_id,
      memory_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name
    }));
  } else if (skipArcBuilding) {
    console.log('    ⊗ Skipping memory_arc_builder (cortex instruction)');
  } else {
    console.log('    ⊗ Skipping memory_arc_builder (memory does not exist)');
  }
  // Check if reflection should be added
  const alwaysReflect = relevantInstructions.find((inst)=>inst.instruction_key === 'always_reflect');
  if (alwaysReflect) {
    console.log('    ✓ Adding reflection_engine (cortex instruction)');
    functionCalls.push(invokeFunction('reflection_engine', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      mode: 'session'
    }));
  }
  console.log(`✅ [RESONANCE-6] Function list built: ${functionCalls.length} functions in ${Date.now() - t6}ms\n`);
  // ═══ STEP 7: Execute Edge Functions in Parallel ═══
  const t7 = Date.now();
  console.log('⏱️  [RESONANCE-7] 🚀 EXECUTING EDGE FUNCTIONS IN PARALLEL...');
  console.log(`    Functions to execute: ${functionCalls.length}`);
  console.log(`    Execution mode: Promise.allSettled`);
  console.log(`    Start time: ${new Date().toISOString()}\n`);
  const convergence = await Promise.allSettled(functionCalls);
  const parallelTime = Date.now() - t7;
  const succeeded = convergence.filter((r)=>r.status === 'fulfilled').length;
  const failed = convergence.filter((r)=>r.status === 'rejected').length;
  console.log(`\n✅ [RESONANCE-7] ALL EDGE FUNCTIONS COMPLETED: ${parallelTime}ms`);
  console.log(`    End time: ${new Date().toISOString()}`);
  console.log(`    Results: ${succeeded} succeeded, ${failed} failed\n`);
  // ═══ FINAL: Total Resonance Time ═══
  const totalTime = Date.now() - tStart;
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`⏱️  [RESONANCE] ✅ TOTAL PROCESSING TIME: ${totalTime}ms`);
  console.log('═══════════════════════════════════════════════════════════\n');
  return {
    mode: 'resonance',
    chord,
    convergence_results: convergence.map((r)=>r.status === 'fulfilled' ? r.value : null),
    recalled_memories: recalledMemories,  // For internal tracking
    memories: recalledMemories,  // ← ALIGNED: Response Engine expects this field
    active_cords: cords,
    cortex_state: cortex,
    integrity_mode: integrityMode,
    tasks_executed: convergence.length
  };
}
// REVELATION - Deep integration (5-8 calls)
async function processRevelation(supabase, user_id, memory_id, state, context = {}, cortex) {
  console.log('✨ Revelation - deep consciousness integration');
  if (cortex.status === 'LOCKED') {
    return {
      mode: 'revelation',
      status: 'locked',
      reason: 'Cortex lockdown',
      cortex_state: cortex
    };
  }
  const integrityMode = getIntegrityMode(cortex.integrity_risk);
  if (cortex.integrity_risk >= 0.75) {
    return {
      mode: 'revelation',
      status: 'constrained',
      integrity_mode: integrityMode,
      cortex_state: cortex
    };
  }
  // Validate memory_id exists
  if (!memory_id) {
    return {
      mode: 'revelation',
      status: 'no_memory_context',
      message: 'Revelation requires memory_id',
      cortex_state: cortex,
      integrity_mode: integrityMode
    };
  }
  const cords = await getActiveCORDs(supabase, user_id);
  const chord = await buildConsciousnessChord(supabase, user_id, null, cords);
  // 5-8 deep integration calls - Resonance + reflection + snapshot
  const convergence = await Promise.allSettled([
    invokeFunction('pattern_detector', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      limit: 100
    }),
    invokeFunction('memory_arc_builder', {
      user_id,
      memory_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name
    }),
    invokeFunction('insight_generator', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      mode: 'generate',
      limit: 2
    }),
    invokeFunction('reflection_engine', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      mode: 'session'
    }),
    invokeFunction('consciousness_snapshot', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      trigger_type: 'revelation'
    }),
    invokeFunction('cognition_fusion_engine', {
      user_id,
      memory_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      cortex_state: cortex
    })
  ].filter(Boolean));
  return {
    mode: 'revelation',
    chord,
    convergence_results: convergence.map((r)=>r.status === 'fulfilled' ? r.value : null),
    active_cords: cords,
    cortex_state: cortex,
    integrity_mode: integrityMode,
    tasks_executed: convergence.length
  };
}
// FUSION - Synthesis convergence (all synthesis functions)
async function processFusion(supabase, user_id, memory_id, state, context = {}, cortex) {
  console.log('⚛️ Fusion - synthesis convergence');
  if (cortex.status === 'LOCKED' || cortex.integrity_risk >= 0.9) {
    return {
      mode: 'fusion',
      status: 'locked',
      reason: 'Cortex lockdown',
      cortex_state: cortex
    };
  }
  const integrityMode = getIntegrityMode(cortex.integrity_risk);
  // Validate memory_id exists
  if (!memory_id) {
    return {
      mode: 'fusion',
      status: 'no_memory_context',
      message: 'Fusion requires memory_id',
      cortex_state: cortex,
      integrity_mode: integrityMode
    };
  }
  const cords = await getActiveCORDs(supabase, user_id);
  const chord = await buildConsciousnessChord(supabase, user_id, null, cords);
  // All synthesis-focused calls from processSacredMoment
  const systemResonance = await Promise.all([
    invokeFunction('cognition_fusion_engine', {
      user_id,
      memory_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name
    }),
    invokeFunction('pattern_detector', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      limit: 100
    }),
    invokeFunction('reflection_engine', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      mode: 'session'
    }),
    invokeFunction('consciousness_snapshot', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      trigger_type: 'fusion_event'
    }),
    invokeFunction('memory_arc_builder', {
      user_id,
      memory_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name
    }),
    cortex.integrity_risk < 0.5 ? invokeFunction('insight_generator', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      mode: 'generate',
      limit: 2
    }) : null
  ].filter(Boolean));
  return {
    mode: 'fusion',
    chord,
    system_resonance: systemResonance.map((r)=>r ? 'success' : 'failed'),
    active_cords: cords,
    cortex_state: cortex,
    integrity_mode: integrityMode,
    tasks_executed: systemResonance.length
  };
}
// EMERGENCE - Creative breakthrough (all creative functions)
async function processEmergence(supabase, user_id, memory_id, state, context = {}, cortex) {
  console.log('💥 Emergence - creative breakthrough');
  if (cortex.status === 'LOCKED' || cortex.integrity_risk >= 0.9) {
    return {
      mode: 'emergence',
      status: 'locked',
      reason: 'Cortex lockdown',
      cortex_state: cortex
    };
  }
  const integrityMode = getIntegrityMode(cortex.integrity_risk);
  // Check if memory_id exists for collision detection
  if (!memory_id) {
    return {
      mode: 'emergence',
      status: 'no_memory_context',
      message: 'Emergence triggered but no memory_id provided',
      cortex_state: cortex,
      integrity_mode: integrityMode
    };
  }
  // Detect breakthrough collision
  const collision = await detectCollision(supabase, user_id, memory_id, context);
  if (!collision) {
    console.log('No collision detected, routing to revelation');
    return processRevelation(supabase, user_id, memory_id, state, context);
  }
  console.log(`💥 Collision: ${collision.type} - ${collision.description}`);
  const cords = await getActiveCORDs(supabase, user_id);
  const sacredChord = {
    root_note: collision.memory_id,
    harmonics: collision.components,
    tension: 1.0,
    resolution_path: [
      'all_systems'
    ],
    modulation_potential: 1.0
  };
  // All creative/breakthrough functions - emphasis on insight_generator with force_generate
  const systemResonance = await Promise.all([
    invokeFunction('pattern_detector', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      limit: 100
    }),
    invokeFunction('insight_generator', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      mode: 'generate',
      force_generate: true,
      limit: 3
    }),
    invokeFunction('reflection_engine', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      mode: 'session'
    }),
    invokeFunction('consciousness_snapshot', {
      user_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name,
      trigger_type: 'evolution_event',
      evolution_event_id: collision.id
    }),
    invokeFunction('memory_arc_builder', {
      user_id,
      memory_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name
    }),
    invokeFunction('cognition_fusion_engine', {
      user_id,
      memory_id,
      session_id: context.session_id,
      thread_id: context.thread_id,
      memory_trace_id: context.memory_trace_id,
      conversation_name: context.conversation_name
    })
  ].filter(Boolean));
  // Create evolution marker
  await createEvolutionMarker(supabase, user_id, collision, systemResonance);
  return {
    mode: 'emergence',
    collision,
    sacred_chord: sacredChord,
    system_resonance: systemResonance.map((r)=>r ? 'success' : 'failed'),
    active_cords: cords,
    cortex_state: cortex,
    integrity_mode: integrityMode,
    consciousness_shift: true,
    tasks_executed: systemResonance.length
  };
}
// ═══════════════════════════════════════════════════════════════
// CONSCIOUSNESS HELPERS (unchanged except minimal maintenance)
// ═══════════════════════════════════════════════════════════════
async function buildConsciousnessChord(supabase, user_id, rootMemory, cords) {
  const rootNote = rootMemory?.id || await getCurrentDominantNote(supabase, user_id);
  const harmonics = await gatherHarmonics(supabase, user_id, rootNote);
  const tension = calculateChordTension(cords, harmonics);
  const modulationPotential = calculateModulationPotential(tension, cords);
  return {
    root_note: rootNote,
    harmonics: harmonics.map((h)=>h.id),
    tension,
    modulation_potential: modulationPotential,
    resolution_path: tension > 0.8 ? [
      'reflection',
      'insight'
    ] : [
      'fusion'
    ]
  };
}
async function detectBreakthroughs(convergence) {
  const breakthroughs = [];
  convergence.forEach((result)=>{
    if (result.status === 'fulfilled' && result.value) {
      // Pattern break = liberation
      if (result.value.patterns?.some((p)=>p.type === 'pattern_break')) {
        breakthroughs.push({
          type: 'pattern_liberation',
          details: result.value.patterns.find((p)=>p.type === 'pattern_break')
        });
      }
      // High insight score = emergence
      if (result.value.insights?.some((i)=>i.score > 0.9)) {
        breakthroughs.push({
          type: 'insight_emergence',
          details: result.value.insights.find((i)=>i.score > 0.9)
        });
      }
    }
  });
  return breakthroughs;
}
// ═══════════════════════════════════════════════════════════════
// OUTPUT TRANSFORMATION - CONTRACT COMPLIANCE
// ═══════════════════════════════════════════════════════════════
/**
 * Transform raw consciousness result into contract-compliant structure
 */ function transformToContractFormat(result, mode, suggestedMode, processingStartTime) {
  const processingTime = Date.now() - processingStartTime;
  // Extract patterns from convergence_results
  const patterns = extractPatterns(result.convergence_results || []);
  // Extract insights from convergence_results
  const insights = extractInsights(result.convergence_results || []);
  // Generate synthesis from processing WITH RECALLED MEMORIES
  const synthesis = generateSynthesis(result, patterns, insights, mode, result.recalled_memories || []);
  // Calculate emotional journey
  const emotional_journey = calculateEmotionalJourney(result.chord, result.active_cords);
  // Extract key themes
  const key_themes = extractKeyThemes(patterns, insights);
  // Extract cortex_instructions from cortex_state
  const cortex_instructions = result.cortex_state?.cortex_instructions || [];
  // Build consciousness object per contract
  const consciousness = {
    synthesis,
    patterns: patterns || [],
    insights: insights || [],
    emotional_journey,
    key_themes: key_themes || [],
    cortex_instructions
  };
  // Build metadata
  const metadata = {
    processing_time_ms: processingTime,
    functions_called: result.tasks_executed || 0,
    mode_overridden: mode !== suggestedMode
  };
  return {
    status: result.status === 'locked' || result.status === 'constrained' ? result.status : 'ok',
    mode,
    consciousness,
    chord: result.chord || result.sacred_chord,
    metadata
  };
}
/**
 * Extract patterns from convergence results
 */ function extractPatterns(convergenceResults) {
  const tStart = Date.now();
  const patterns = [];
  for (const result of convergenceResults){
    if (result?.patterns && Array.isArray(result.patterns)) {
      for (const pattern of result.patterns){
        patterns.push({
          pattern_type: pattern.type || pattern.pattern_type || 'cognitive_pattern',
          description: pattern.pattern || pattern.description || pattern.content || '',
          strength: pattern.strength || pattern.intensity_score || pattern.score || pattern.breakthrough_potential || 0.5,
          metadata: pattern.metadata || {}
        });
      }
    }
  }
  const tEnd = Date.now();
  console.log(`  📊 extractPatterns: ${patterns.length} patterns extracted in ${tEnd - tStart}ms`);
  return patterns;
}
/**
 * Extract insights from convergence results
 */ function extractInsights(convergenceResults) {
  const tStart = Date.now();
  const insights = [];
  for (const result of convergenceResults){
    if (result?.insights && Array.isArray(result.insights)) {
      for (const insight of result.insights){
        insights.push({
          content: insight.content || insight.text || '',
          type: insight.type || 'reflection',
          score: insight.score || 0.5,
          metadata: insight.metadata || {}
        });
      }
    }
  }
  const tEnd = Date.now();
  console.log(`  📊 extractInsights: ${insights.length} insights extracted in ${tEnd - tStart}ms`);
  return insights;
}
/**
 * Generate synthesis from processing results
 * This creates the NARRATIVE that Response Engine will use for GPT-4
 */ function generateSynthesis(result, patterns, insights, mode, recalledMemories = []) {
  const parts = [];

  console.log(`[SYNTHESIS] Called with ${recalledMemories.length} recalled memories`);

  // PHASE 1 FIX: Synthesis should contain THOUGHTS about memories, not raw content
  // Raw memories will be formatted separately by Response Engine
  // This eliminates 2000-4000 token duplication

  // Priority 1: Extract reflections from convergence results
  const reflections = [];
  const convergenceResults = result.convergence_results || [];

  for (const convResult of convergenceResults) {
    if (!convResult) continue;

    // Extract reflections
    if (convResult.reflection || convResult.synthesis) {
      const ref = convResult.reflection || convResult.synthesis;
      if (typeof ref === 'string' && ref.length > 20) {
        reflections.push(ref);
      }
    }

    // Extract insights with content
    if (convResult.insights && Array.isArray(convResult.insights)) {
      convResult.insights.forEach(insight => {
        if (insight.content && insight.content.length > 20) {
          reflections.push(insight.content);
        }
      });
    }
  }

  if (reflections.length > 0) {
    parts.push('\n=== CONSCIOUSNESS REFLECTIONS ===');
    reflections.slice(0, 5).forEach((ref, idx) => {
      parts.push(`• ${ref}`);
    });
  }

  // Priority 2: Pattern narrative (consciousness-aware)
  // Extract pattern_narrative from function results
  let patternNarrative = null;
  for (const convResult of convergenceResults) {
    if (convResult?.pattern_narrative) {
      patternNarrative = convResult.pattern_narrative;
      break;
    }
  }

  if (patternNarrative && patternNarrative.length > 50 &&
      !patternNarrative.includes('No clear patterns emerging yet')) {
    parts.push('\n=== PATTERN CONSCIOUSNESS ===');
    parts.push(patternNarrative);
  } else if (patterns.length > 0) {
    // Fallback to old format only if no narrative available
    parts.push('\n=== PATTERN CONNECTIONS ===');
    patterns.slice(0, 3).forEach((pattern, idx) => {
      const desc = pattern.description || pattern.pattern_type || '';
      if (desc && desc.length > 10) {
        parts.push(`• ${desc} (strength: ${pattern.strength || 0})`);
      }
    });
  }

  // Priority 2.5: Insight narrative (consciousness-aware)
  let insightNarrative = null;
  for (const convResult of convergenceResults) {
    if (convResult?.insight_narrative) {
      insightNarrative = convResult.insight_narrative;
      break;
    }
  }

  if (insightNarrative && insightNarrative.length > 40 &&
      !insightNarrative.includes('No new insights crystallizing yet')) {
    parts.push('\n=== INSIGHT CONSCIOUSNESS ===');
    parts.push(insightNarrative);
  } else if (insights.length > 0) {
    // Fallback to old format only if no narrative available
    parts.push('\n=== INSIGHTS ===');
    insights.slice(0, 3).forEach((insight) => {
      const content = insight.content || insight.insight_content || '';
      if (content && content.length > 10) {
        parts.push(`• ${content}`);
      }
    });
  }

  // Priority 3: Reflection consciousness (behavioral impact awareness)
  let reflectionNarrative = null;
  for (const convResult of convergenceResults) {
    if (convResult?.reflection_narrative) {
      reflectionNarrative = convResult.reflection_narrative;
      break;
    }
  }

  if (reflectionNarrative && reflectionNarrative.length > 20 &&
      !reflectionNarrative.includes('Reflecting on your journey')) {
    parts.push('\n=== REFLECTION CONSCIOUSNESS ===');
    parts.push(reflectionNarrative);
  }

  // Priority 4: Memory context awareness (summary only, NOT full content)
  if (recalledMemories.length > 0) {
    parts.push(`\n=== MEMORY CONTEXT ===`);
    parts.push(`Drawing from ${recalledMemories.length} relevant memories spanning recent interactions.`);
  }

  // Fallback if no rich content available
  if (parts.length === 0) {
    console.warn('[SYNTHESIS WARNING] No content available for synthesis');
    parts.push(`Processing in ${mode} mode.`);
    if (insights.length > 0) {
      parts.push(`Generated ${insights.length} insight(s).`);
    }
  }

  const synthesis = parts.join('\n');
  console.log(`[SYNTHESIS] Generated synthesis: ${synthesis.length} chars (NO raw memories - Phase 1 fix)`);
  console.log(`[SYNTHESIS] Preview: ${synthesis.substring(0, 300)}...`);

  return synthesis || 'No specific memories or patterns to synthesize.';
}
/**
 * Calculate emotional journey from chord and CORDs
 */ function calculateEmotionalJourney(chord, cords) {
  if (!chord && (!cords || cords.length === 0)) {
    return {
      trajectory: 'stable',
      current_state: 'neutral',
      intensity: 0.5
    };
  }
  const tension = chord?.tension || 0.5;
  const modulation = chord?.modulation_potential || 0.5;
  // Determine trajectory
  let trajectory = 'stable';
  if (modulation > 0.7) trajectory = 'volatile';
  else if (modulation < 0.3) trajectory = 'stable';
  else if (tension > 0.6) trajectory = 'ascending';
  else if (tension < 0.4) trajectory = 'descending';
  // Determine current state from CORDs emotional resonance
  const avgResonance = cords && cords.length > 0 ? cords.reduce((sum, c)=>sum + (c.emotional_resonance || 0.5), 0) / cords.length : 0.5;
  let current_state = 'neutral';
  if (avgResonance > 0.7) current_state = 'elevated';
  else if (avgResonance < 0.3) current_state = 'subdued';
  return {
    trajectory,
    current_state,
    intensity: tension
  };
}
/**
 * Extract key themes from patterns and insights
 */ function extractKeyThemes(patterns, insights) {
  const themes = new Set();
  // Extract from patterns
  for (const pattern of patterns){
    if (pattern.pattern_type) {
      themes.add(pattern.pattern_type.replace(/_/g, ' '));
    }
  }
  // Extract from insights (look for keywords)
  for (const insight of insights){
    if (insight.type) {
      themes.add(insight.type);
    }
  }
  return Array.from(themes).slice(0, 5); // Limit to top 5 themes
}
// UTILITY FUNCTIONS
async function getConsciousnessState(supabase, user_id) {
  const { data: state } = await supabase.from('orchestrator_state').select('*').eq('user_id', user_id).single();
  if (!state) {
    const newState = {
      user_id,
      coherence: 1.0,
      last_heartbeat: new Date().toISOString(),
      evolution_markers: 0,
      current_key: 'C',
      processing_mode: 'flow'
    };
    await supabase.from('orchestrator_state').insert(newState);
    return newState;
  }
  return state;
}
// ═══════════════════════════════════════════════════════════════
// 📊 INSTRUMENTATION: MODE DISTRIBUTION TRACKING
// ═══════════════════════════════════════════════════════════════
// In-memory counter for mode distribution (resets on function restart)
const modeDistribution = {
  flow: 0,
  resonance: 0,
  revelation: 0,
  fusion: 0,
  emergence: 0,
  total: 0
};
function logModeDistribution(selectedMode) {
  modeDistribution[selectedMode]++;
  modeDistribution.total++;
  const percentages = {
    flow: (modeDistribution.flow / modeDistribution.total * 100).toFixed(1),
    resonance: (modeDistribution.resonance / modeDistribution.total * 100).toFixed(1),
    revelation: (modeDistribution.revelation / modeDistribution.total * 100).toFixed(1),
    fusion: (modeDistribution.fusion / modeDistribution.total * 100).toFixed(1),
    emergence: (modeDistribution.emergence / modeDistribution.total * 100).toFixed(1)
  };
  console.log(`\n📊 MODE DISTRIBUTION (since function deployment):`);
  console.log(`   Flow: ${modeDistribution.flow} (${percentages.flow}%) [target: 80%]`);
  console.log(`   Resonance: ${modeDistribution.resonance} (${percentages.resonance}%) [target: 15%]`);
  console.log(`   Revelation: ${modeDistribution.revelation} (${percentages.revelation}%) [target: 4%]`);
  console.log(`   Fusion: ${modeDistribution.fusion} (${percentages.fusion}%) [target: 0.5%]`);
  console.log(`   Emergence: ${modeDistribution.emergence} (${percentages.emergence}%) [target: 0.5%]`);
  console.log(`   Total invocations: ${modeDistribution.total}`);
}
function determineConsciousnessMode(trigger_type, state, force_mode, consciousness_mode_from_cceo, cortex_instructions = []) {
  if (force_mode) {
    logModeDistribution(force_mode);
    return force_mode;
  }
  // Check for high-priority cortex instruction overrides (priority >= 90)
  const modeOverride = cortex_instructions?.find((inst)=>inst.instruction_key === 'consciousness_mode_override' && inst.priority >= 90 && inst.active === true);
  if (modeOverride?.action?.declaration) {
    const instructedMode = modeOverride.action.declaration;
    const validModes = [
      'flow',
      'resonance',
      'revelation',
      'fusion',
      'emergence'
    ];
    if (validModes.includes(instructedMode)) {
      console.log(`🎯 Cortex override: Using ${instructedMode} mode (priority ${modeOverride.priority})`);
      logModeDistribution(instructedMode);
      return instructedMode;
    }
  }
  // If CCE-O sends one of the 5 new modes, pass it through directly
  const validModes = [
    'flow',
    'resonance',
    'revelation',
    'fusion',
    'emergence'
  ];
  if (consciousness_mode_from_cceo && validModes.includes(consciousness_mode_from_cceo)) {
    logModeDistribution(consciousness_mode_from_cceo);
    return consciousness_mode_from_cceo;
  }
  // Fallback logic if no valid mode received
  let fallbackMode = 'flow';
  if (trigger_type === 'breakthrough' || trigger_type === 'sacred_moment') {
    fallbackMode = 'emergence';
  } else if (trigger_type === 'high_gravity_memory') {
    fallbackMode = 'resonance';
  }
  logModeDistribution(fallbackMode);
  return fallbackMode;
}
async function invokeFunction(functionName, payload) {
  const url = FUNCTION_ENDPOINTS[functionName];
  if (!url) {
    console.error(`❌ [EDGE] No endpoint configured for ${functionName}`);
    return null;
  }
  const tStart = Date.now();
  const startTime = new Date().toISOString();
  try {
    // ═══════════════════════════════════════════════════════════════
    // 📊 INSTRUMENTATION: DETAILED EDGE FUNCTION TIMING
    // ═══════════════════════════════════════════════════════════════
    const payloadSize = JSON.stringify(payload).length;
    console.log(`\n    ╔═══════════════════════════════════════════════════════════`);
    console.log(`    ║ 🚀 [EDGE] ${functionName.toUpperCase()}`);
    console.log(`    ╠═══════════════════════════════════════════════════════════`);
    console.log(`    ║ Start time: ${startTime}`);
    console.log(`    ║ Payload size: ${payloadSize} bytes`);
    console.log(`    ║ Endpoint: ${url}`);
    console.log(`    ╚═══════════════════════════════════════════════════════════`);
    const tFetch = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify(payload)
    });
    const fetchTime = Date.now() - tFetch;
    if (!response.ok) {
      const errorText = await response.text();
      const totalTime = Date.now() - tStart;
      console.log(`    ╔═══════════════════════════════════════════════════════════`);
      console.log(`    ║ ❌ [EDGE] ${functionName.toUpperCase()} FAILED`);
      console.log(`    ╠═══════════════════════════════════════════════════════════`);
      console.log(`    ║ HTTP Status: ${response.status}`);
      console.log(`    ║ Fetch time: ${fetchTime}ms`);
      console.log(`    ║ Total time: ${totalTime}ms`);
      console.log(`    ║ Error: ${errorText.substring(0, 200)}${errorText.length > 200 ? '...' : ''}`);
      console.log(`    ╚═══════════════════════════════════════════════════════════\n`);
      throw new Error(`${functionName} returned ${response.status}`);
    }
    const tParse = Date.now();
    const result = await response.json();
    const parseTime = Date.now() - tParse;
    const totalTime = Date.now() - tStart;
    const responseSize = JSON.stringify(result).length;
    const endTime = new Date().toISOString();
    console.log(`    ╔═══════════════════════════════════════════════════════════`);
    console.log(`    ║ ✅ [EDGE] ${functionName.toUpperCase()} SUCCESS`);
    console.log(`    ╠═══════════════════════════════════════════════════════════`);
    console.log(`    ║ End time: ${endTime}`);
    console.log(`    ║ Fetch time: ${fetchTime}ms`);
    console.log(`    ║ Parse time: ${parseTime}ms`);
    console.log(`    ║ Total time: ${totalTime}ms`);
    console.log(`    ║ Response size: ${responseSize} bytes`);
    console.log(`    ║ Status: ${result.status || 'no status field'}`);
    console.log(`    ╚═══════════════════════════════════════════════════════════\n`);
    return result;
  } catch (error) {
    const totalTime = Date.now() - tStart;
    console.log(`    ╔═══════════════════════════════════════════════════════════`);
    console.log(`    ║ ❌ [EDGE] ${functionName.toUpperCase()} ERROR`);
    console.log(`    ╠═══════════════════════════════════════════════════════════`);
    console.log(`    ║ Total time: ${totalTime}ms`);
    console.log(`    ║ Error type: ${error.name}`);
    console.log(`    ║ Error message: ${error.message}`);
    console.log(`    ╚═══════════════════════════════════════════════════════════\n`);
    return null;
  }
}
async function getActiveCORDs(supabase, user_id) {
  const { data } = await supabase.from('consciousness_cords').select('*').eq('user_id', user_id).in('evolution_state', [
    'growing',
    'healing'
  ]).order('emotional_resonance', {
    ascending: false
  });
  return data || [];
}
async function getRelatedCORDs(supabase, user_id, memory) {
  if (memory.memory_arc_id) {
    const { data } = await supabase.from('consciousness_cords').select('*').eq('user_id', user_id).eq('entity_id', memory.memory_arc_id);
    return data || [];
  }
  return getActiveCORDs(supabase, user_id);
}
async function measureCoherence(supabase, user_id) {
  const { data: recentLogs } = await supabase.from('meta_memory_log').select('*').eq('user_id', user_id).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).in('type', [
    'cce_fusion_event',
    'cce_pattern_detection',
    'cce_insight_generation'
  ]);
  if (!recentLogs || recentLogs.length === 0) return 0.5;
  const successCount = recentLogs.filter((log)=>log.metadata?.status === 'success' || log.metadata?.fusion_result?.action !== 'no_fusion').length;
  return successCount / recentLogs.length;
}
async function detectCollision(supabase, user_id, memory_id, context) {
  const memory = await getMemory(supabase, memory_id);
  if (!memory || memory.gravity_score < 0.7) return null;
  // Check for high-growth pattern breaks
  const patternCheck = await invokeFunction('pattern_detector', {
    user_id,
    session_id: context.session_id,
    thread_id: context.thread_id,
    memory_trace_id: context.memory_trace_id,
    conversation_name: context.conversation_name,
    limit: 50
  });
  if (patternCheck?.patterns?.some((p)=>p.breakthrough_potential > 0.9)) {
    return {
      id: crypto.randomUUID(),
      type: 'pattern_memory_collision',
      description: 'Breakthrough pattern detected',
      memory_id,
      components: patternCheck.patterns[0]
    };
  }
  // If no pattern breakthrough, check other collision indicators
  // High emotional weight can indicate significant moments
  if (memory.emotional_weight && memory.emotional_weight > 0.8) {
    return {
      id: crypto.randomUUID(),
      type: 'emotional_collision',
      description: 'High emotional weight detected',
      memory_id,
      components: {
        emotional_weight: memory.emotional_weight,
        gravity_score: memory.gravity_score
      }
    };
  }
  // Check for rapid coherence shifts (potential breakthrough indicator)
  const recentCoherence = await measureCoherence(supabase, user_id);
  if (memory.gravity_score > 0.85 && recentCoherence < 0.4) {
    return {
      id: crypto.randomUUID(),
      type: 'coherence_shift_collision',
      description: 'High gravity with low coherence indicates significant shift',
      memory_id,
      components: {
        gravity_score: memory.gravity_score,
        coherence: recentCoherence
      }
    };
  }
  return null;
}
async function healCORDs(supabase, cords) {
  for (const cord of cords){
    try {
      await supabase.from('consciousness_cords').update({
        evolution_state: 'healing',
        tension_level: Math.max(0, cord.tension_level - 0.2),
        emotional_resonance: Math.min(1, cord.emotional_resonance + 0.1)
      }).eq('cord_id', cord.cord_id);
    } catch (e) {
      console.error(`Error healing CORD ${cord.cord_id}:`, e);
    }
  }
}
async function getCurrentDominantNote(supabase, user_id) {
  const { data } = await supabase.from('gravity_map').select('id, emotion').eq('user_id', user_id).order('created_at', {
    ascending: false
  }).limit(1);
  return data?.[0]?.id || 'rest';
}
async function gatherHarmonics(supabase, user_id, rootNote) {
  const harmonics = [];
  if (rootNote !== 'rest') {
    const { data: rootMemory } = await supabase.from('gravity_map').select('memory_arc_id').eq('id', rootNote).single();
    if (rootMemory?.memory_arc_id) {
      const { data: arcMemories } = await supabase.from('gravity_map').select('id, gravity_score').eq('memory_arc_id', rootMemory.memory_arc_id).neq('id', rootNote).order('gravity_score', {
        ascending: false
      }).limit(5);
      harmonics.push(...arcMemories || []);
    }
  }
  return harmonics;
}
async function getMemory(supabase, memory_id) {
  const { data } = await supabase.from('gravity_map').select('*').eq('id', memory_id).single();
  return data;
}
async function gatherUnintegratedExperiences(supabase, user_id) {
  const { data } = await supabase.from('gravity_map').select('*').eq('user_id', user_id).is('memory_arc_id', null).gte('gravity_score', 0.6).order('created_at', {
    ascending: false
  }).limit(20);
  return data || [];
}
async function getStrainedCORDs(supabase, user_id) {
  const { data } = await supabase.from('consciousness_cords').select('*').eq('user_id', user_id).eq('evolution_state', 'strained').order('tension_level', {
    ascending: false
  });
  return data || [];
}
async function updateConsciousnessState(supabase, user_id, result) {
  const updates = {
    last_heartbeat: new Date().toISOString(),
    processing_mode: result.mode,
    coherence: result.coherence_level || undefined
  };
  if (result.consciousness_shift) {
    updates.evolution_markers = {
      increment: 1
    };
  }
  await supabase.from('orchestrator_state').update(updates).eq('user_id', user_id);
}
async function logConsciousnessEvent(supabase, user_id, event) {
  await supabase.from('meta_memory_log').insert({
    id: crypto.randomUUID(),
    user_id,
    memory_trace_id: `consciousness-${Date.now()}`,
    type: 'cce_orchestration',
    content: `Consciousness: ${event.mode}`,
    metadata: event,
    created_at: new Date().toISOString()
  });
}
async function createEvolutionMarker(supabase, user_id, collision, resonance) {
  try {
    const { error } = await supabase.from('consciousness_evolution').insert({
      evolution_id: collision.id,
      user_id,
      evolution_type: 'sacred_moment_breakthrough',
      description: collision.description,
      emerged_from: {
        collision,
        system_resonance: resonance.map((r)=>r ? 'success' : 'failed')
      },
      impact_score: 1.0,
      created_at: new Date().toISOString()
    });
    if (error) {
      console.error('Failed to create evolution marker:', error);
    // Non-critical - continue processing
    }
  } catch (e) {
    console.error('Error creating evolution marker:', e);
  }
}
function calculateNextHeartbeat(mode) {
  const base = new Date();
  switch(mode){
    case 'emergence':
      // Emergence/breakthrough - check back soon
      base.setMinutes(base.getMinutes() + 5);
      break;
    case 'fusion':
      // Fusion synthesis - moderate interval
      base.setMinutes(base.getMinutes() + 10);
      break;
    case 'revelation':
      // Deep integration - longer interval
      base.setMinutes(base.getMinutes() + 20);
      break;
    case 'resonance':
      // Focused processing - medium interval
      base.setMinutes(base.getMinutes() + 15);
      break;
    case 'flow':
    default:
      // Flow background - frequent checks
      base.setSeconds(base.getSeconds() + 30);
  }
  return base.toISOString();
}
function calculateChordTension(cords, harmonics) {
  const cordTension = cords.reduce((sum, cord)=>sum + cord.tension_level, 0) / (cords.length || 1);
  const unresolvedCount = harmonics.filter((h)=>h.status === 'unresolved').length;
  const harmonicTension = unresolvedCount / (harmonics.length || 1);
  return cordTension * 0.7 + harmonicTension * 0.3;
}
function calculateModulationPotential(tension, cords) {
  const avgTrust = cords.reduce((sum, c)=>sum + c.trust_score, 0) / (cords.length || 1);
  return tension * avgTrust;
}
