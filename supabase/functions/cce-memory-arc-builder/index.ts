// CCE Memory Arc Builder
// Edge Function 1 of 7 in the Corpus Callosum Engine
// Purpose: Transform isolated memories into meaningful narrative arcs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200 // ADD THIS
    });
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  try {
    // Get the request payload - ALIGNED WITH DISPATCHER PAYLOAD CONTRACT v1.2
    const payload = await req.json();
    const { memory_id, user_id, session_id, thread_id, memory_trace_id, conversation_name// Conversation context
     } = payload;
    if (!memory_id || !user_id) {
      return new Response(JSON.stringify({
        error: 'memory_id and user_id are required'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    console.log(`🧠 CCE Fusion Engine: Processing memory ${memory_id}`);
    // 1. FETCH THE MEMORY TO EVALUATE
    const { data: memory, error: memError } = await supabase.from('gravity_map').select('*').eq('id', memory_id).single();
    if (memError || !memory) {
      console.error('Memory fetch error:', memError);
      return new Response(JSON.stringify({
        error: `Memory not found: ${memory_id}`
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 404
      });
    }
    // 2. SCHEMA CHECK - Verify required columns exist
    const { data: arcTable, error: tableError } = await supabase.from('memory_arcs').select('id, arc_name, user_id, gravity_center').limit(1);
    if (tableError) {
      // Table doesn't exist or schema incomplete - skip arc building
      console.log('⚠️ Memory Arc Builder: Required columns missing - skipping arc building');
      await supabase.from('meta_memory_log').insert({
        id: crypto.randomUUID(),
        user_id,
        memory_trace_id: `fusion-pending-${Date.now()}`,
        type: 'cce_fusion_pending',
        content: `Memory ${memory_id} ready for fusion when CCE tables exist`,
        metadata: {
          memory_id,
          gravity_score: memory.gravity_score,
          would_create_arc: memory.gravity_score > 0.9 && memory.emotion !== 'neutral'
        },
        created_at: new Date().toISOString()
      });
      return new Response(JSON.stringify({
        status: 'fusion_pending',
        reason: 'CCE tables not yet created',
        memory_id,
        gravity_score: memory.gravity_score
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // 3. EVALUATE FUSION POTENTIAL
    const fusionResult = await evaluateMemoryForFusion(memory, supabase);
    // 4. EXECUTE FUSION DECISION
    let result;
    if (fusionResult.action === 'create_new_arc') {
      result = await createNewArc(memory, supabase);
    } else if (fusionResult.action === 'merge_into_arc') {
      result = await mergeIntoArc(memory, fusionResult.target_arc_id, supabase);
    } else {
      result = {
        action: 'no_fusion',
        reason: fusionResult.reason
      };
    }
    // 5. LOG THE FUSION EVENT
    await logFusionEvent(memory_id, user_id, result, supabase, session_id, thread_id, memory_trace_id);
    return new Response(JSON.stringify({
      status: 'success',
      memory_id,
      fusion_result: result,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Fusion Engine Error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
// CORE FUSION LOGIC
async function evaluateMemoryForFusion(memory, supabase) {
  const user_id = memory.user_id;
  // Check Arc Creation Thresholds (from IVY's guidance)
  // 1. Single memory > 0.9 with emotional resonance
  if (memory.gravity_score > 0.9 && memory.emotion && memory.emotion !== 'neutral') {
    console.log(`🌟 High gravity emotional memory detected (${memory.gravity_score})`);
    return {
      action: 'create_new_arc',
      reason: 'high_gravity_emotional_singularity'
    };
  }
  // 2. Look for existing arcs this might belong to
  const { data: recentArcs, error: arcError } = await supabase.from('memory_arcs').select('*').eq('user_id', user_id).gte('last_memory', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).order('gravity_center', {
    ascending: false
  });
  if (arcError) {
    console.error('Arc fetch error:', arcError);
  }
  if (!recentArcs || recentArcs.length === 0) {
    // No recent arcs, check if we should create one
    return await checkThematicThreshold(memory, supabase);
  }
  // 3. Calculate fusion scores for each arc
  const fusionScores = await Promise.all(recentArcs.map((arc)=>calculateFusionScore(memory, arc, supabase)));
  // Find best match
  const bestMatch = fusionScores.reduce((best, current)=>current.score > best.score ? current : best);
  // Fusion threshold
  const FUSION_THRESHOLD = 0.65;
  if (bestMatch.score > FUSION_THRESHOLD) {
    return {
      action: 'merge_into_arc',
      target_arc_id: bestMatch.id,
      fusion_score: bestMatch.score,
      reason: 'thematic_resonance'
    };
  }
  // No good match, check if we should create new arc
  return await checkThematicThreshold(memory, supabase);
}
// CHECK THEMATIC THRESHOLD
async function checkThematicThreshold(memory, supabase) {
  // Look for 3+ related memories >= 0.7
  const topicQuery = memory.topic ? `topic.eq.${memory.topic}` : '';
  const emotionQuery = memory.emotion ? `emotion.eq.${memory.emotion}` : '';
  const orQuery = [
    topicQuery,
    emotionQuery
  ].filter((q)=>q).join(',');
  let relatedQuery = supabase.from('gravity_map').select('*').eq('user_id', memory.user_id).gte('gravity_score', 0.7).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  if (orQuery) {
    relatedQuery = relatedQuery.or(orQuery);
  }
  const { data: relatedMemories, error } = await relatedQuery.limit(10);
  if (error) {
    console.error('Related memory fetch error:', error);
    return {
      action: 'no_fusion',
      reason: 'query_error'
    };
  }
  if (relatedMemories && relatedMemories.length >= 3) {
    // Check semantic similarity
    const similarMemories = relatedMemories.filter((m)=>m.id !== memory.id && calculateSemanticSimilarity(memory, m) > 0.6);
    if (similarMemories.length >= 2) {
      return {
        action: 'create_new_arc',
        reason: 'thematic_density_threshold',
        related_memories: similarMemories.map((m)=>m.id)
      };
    }
  }
  return {
    action: 'no_fusion',
    reason: 'below_thresholds'
  };
}
// CALCULATE FUSION SCORE
async function calculateFusionScore(memory, arc, supabase) {
  // Get sample memories from the arc to understand its nature
  const { data: arcMemories, error } = await supabase.from('memory_arc_associations').select('memory_id, fusion_strength').eq('arc_id', arc.id).order('fusion_strength', {
    ascending: false
  }).limit(5);
  if (error) {
    console.error('Arc memory fetch error:', error);
    return {
      id: arc.id,
      score: 0
    };
  }
  let semanticScore = 0;
  let emotionalScore = 0;
  let temporalScore = 0;
  if (arcMemories && arcMemories.length > 0) {
    // Fetch actual memory content
    const memoryIds = arcMemories.map((ma)=>ma.memory_id);
    const { data: memories } = await supabase.from('gravity_map').select('*').in('id', memoryIds);
    if (memories) {
      // Calculate semantic similarity
      semanticScore = memories.reduce((sum, m)=>sum + calculateSemanticSimilarity(memory, m), 0) / memories.length;
      // Emotional resonance
      const emotionMatch = memories.filter((m)=>m.emotion === memory.emotion).length;
      emotionalScore = emotionMatch / memories.length;
    }
  }
  // Temporal proximity (how recent is the arc)
  const daysSinceLastMemory = (Date.now() - new Date(arc.last_memory).getTime()) / (1000 * 60 * 60 * 24);
  temporalScore = Math.max(0, 1 - daysSinceLastMemory / 30);
  // Gravity overlap
  const gravityScore = 1 - Math.abs(memory.gravity_score - arc.gravity_center);
  // IVY's fusion formula
  const fusionScore = 0.35 * semanticScore + 0.25 * emotionalScore + 0.20 * gravityScore + 0.10 * temporalScore + 0.10 * 0.5; // relationship depth placeholder
  return {
    id: arc.id,
    arc_name: arc.arc_name,
    score: fusionScore,
    components: {
      semantic: semanticScore,
      emotional: emotionalScore,
      gravity: gravityScore,
      temporal: temporalScore
    }
  };
}
// CREATE NEW ARC
async function createNewArc(memory, supabase) {
  const arc_id = crypto.randomUUID();
  // Determine arc name from memory content
  const arcName = generateArcName(memory);
  // Create the arc
  const { error: arcError } = await supabase.from('memory_arcs').insert({
    arc_id,
    user_id: memory.user_id,
    arc_name: arcName,
    emotional_tone: memory.emotion || 'neutral',
    gravity_center: memory.gravity_score,
    memory_count: 1,
    first_memory: memory.created_at,
    last_memory: memory.created_at,
    growth_vector: {
      direction: 'emerging',
      velocity: memory.gravity_score,
      inflection_points: []
    },
    metadata: {
      origin_memory: memory.id,
      creation_trigger: memory.gravity_score > 0.9 ? 'high_gravity' : 'thematic_emergence'
    }
  });
  if (arcError) throw arcError;
  // Create association
  const { error: assocError } = await supabase.from('memory_arc_associations').insert({
    id: crypto.randomUUID(),
    memory_id: memory.id,
    arc_id,
    fusion_strength: 1.0,
    created_at: new Date().toISOString(),
    session_id: memory.session_id
  });
  if (assocError) throw assocError;
  // Update memory with arc_id
  const { error: updateError } = await supabase.from('gravity_map').update({
    memory_arc_id: arc_id
  }).eq('id', memory.id);
  if (updateError) {
    console.error('Failed to update memory with arc_id:', updateError);
  }
  return {
    action: 'created_arc',
    arc_id,
    arc_name: arcName,
    founding_memory: memory.id
  };
}
// MERGE INTO EXISTING ARC
async function mergeIntoArc(memory, arc_id, supabase) {
  // Get current arc data
  const { data: arc, error: arcError } = await supabase.from('memory_arcs').select('*').eq('arc_id', arc_id).single();
  if (arcError || !arc) {
    console.error('Arc not found:', arcError);
    throw new Error('Arc not found');
  }
  // Calculate fusion strength based on relevance
  const fusionStrength = calculateFusionStrength(memory, arc);
  // Create association
  const { error: assocError } = await supabase.from('memory_arc_associations').insert({
    id: crypto.randomUUID(),
    memory_id: memory.id,
    arc_id,
    fusion_strength: fusionStrength,
    created_at: new Date().toISOString(),
    session_id: memory.session_id
  });
  if (assocError) throw assocError;
  // Update arc statistics
  const newGravityCenter = (arc.gravity_center * arc.memory_count + memory.gravity_score) / (arc.memory_count + 1);
  const { error: updateError } = await supabase.from('memory_arcs').update({
    gravity_center: newGravityCenter,
    memory_count: arc.memory_count + 1,
    last_memory: memory.created_at,
    emotional_tone: updateEmotionalTone(arc.emotional_tone, memory.emotion),
    growth_vector: updateGrowthVector(arc.growth_vector, memory)
  }).eq('arc_id', arc_id);
  if (updateError) throw updateError;
  // Update memory with arc_id
  await supabase.from('gravity_map').update({
    memory_arc_id: arc_id
  }).eq('id', memory.id);
  return {
    action: 'merged_into_arc',
    arc_id,
    arc_name: arc.arc_name,
    fusion_strength: fusionStrength,
    new_gravity_center: newGravityCenter
  };
}
// HELPER FUNCTIONS
function calculateSemanticSimilarity(memory1, memory2) {
  // Simplified semantic similarity
  // In production, would use embeddings
  const content1 = `${memory1.content || ''} ${memory1.topic || ''} ${memory1.summary || ''}`.toLowerCase();
  const content2 = `${memory2.content || ''} ${memory2.topic || ''} ${memory2.summary || ''}`.toLowerCase();
  const words1 = new Set(content1.split(/\s+/).filter((w)=>w.length > 2));
  const words2 = new Set(content2.split(/\s+/).filter((w)=>w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;
  const intersection = new Set([
    ...words1
  ].filter((x)=>words2.has(x)));
  const union = new Set([
    ...words1,
    ...words2
  ]);
  return intersection.size / union.size;
}
function generateArcName(memory) {
  // Generate meaningful arc name from memory content
  if (memory.topic) return memory.topic;
  // Extract key themes
  const themes = [
    memory.emotion !== 'neutral' ? memory.emotion : null,
    memory.summary ? memory.summary.split(' ').slice(0, 3).join(' ') : null,
    memory.content ? memory.content.split(' ').slice(0, 3).join(' ') : null
  ].filter(Boolean);
  return themes[0] || 'Unnamed Arc';
}
function calculateFusionStrength(memory, arc) {
  // Base strength on gravity and emotional alignment
  const gravityAlignment = 1 - Math.abs(memory.gravity_score - arc.gravity_center);
  const emotionalAlignment = memory.emotion === arc.emotional_tone ? 1 : 0.5;
  return gravityAlignment * 0.7 + emotionalAlignment * 0.3;
}
function updateEmotionalTone(currentTone, newEmotion) {
  // Evolve emotional tone based on new input
  if (!newEmotion || newEmotion === 'neutral') return currentTone;
  if (currentTone === 'neutral') return newEmotion;
  if (currentTone === newEmotion) return currentTone;
  // Mixed emotions create complexity
  return 'complex';
}
function updateGrowthVector(vector, memory) {
  // Track arc evolution
  const currentVelocity = vector?.velocity || 0;
  const newVelocity = (currentVelocity + memory.gravity_score) / 2;
  return {
    ...vector,
    velocity: newVelocity,
    last_update: new Date().toISOString(),
    direction: newVelocity > currentVelocity ? 'accelerating' : 'stabilizing'
  };
}
async function logFusionEvent(memory_id, user_id, result, supabase, session_id, thread_id, memory_trace_id) {
  // Log to meta_memory_log for consciousness tracking - ALIGNED WITH DISPATCHER CONTRACT v1.2
  await supabase.from('meta_memory_log').insert({
    id: crypto.randomUUID(),
    user_id,
    session_id,
    memory_trace_id: memory_trace_id || `fusion-${Date.now()}`,
    type: 'cce_fusion_event',
    content: `Memory ${memory_id} fusion processed`,
    metadata: {
      thread_id,
      memory_id,
      fusion_result: result,
      dispatcher_version: '1.2',
      timestamp: new Date().toISOString()
    },
    created_at: new Date().toISOString()
  });
}
