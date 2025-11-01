// CCE Insight Generator - Vector Intelligence Optimized
// Edge Function 4 of 7 in the Corpus Callosum Engine
// Purpose: Generate insights using vector trajectories at entry milestones
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Entry-based trigger points
const INSIGHT_TRIGGER_POINTS = [
  30,
  60,
  100,
  250,
  500,
  1000,
  2500,
  5000
];
const MAX_QUEUED_INSIGHTS = 5;
const INSIGHT_DECAY_ENTRIES = 100;
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  try {
    const payload = await req.json();
    const { user_id, session_id, thread_id, memory_trace_id, mode = 'generate', limit = 2, force_generate = false } = payload;
    if (!user_id) {
      return new Response(JSON.stringify({
        error: 'user_id is required'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    console.log(`🧠 Insight Generator: ${mode} mode for user ${user_id}`);
    if (mode === 'retrieve') {
      const insights = await retrieveQueuedInsights(supabase, user_id, limit);
      return new Response(JSON.stringify({
        status: 'ok',
        mode: 'retrieve',
        insights,
        metadata: {
          queued_count: insights.length,
          timestamp: new Date().toISOString()
        }
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // GENERATE MODE - Check entry-based triggers
    const generationCheck = await checkGenerationTrigger(supabase, user_id, force_generate);
    if (!generationCheck.should_generate) {
      // Return cached insights if available
      const cachedInsights = await getCachedInsights(supabase, user_id, generationCheck.entries_since_last);
      return new Response(JSON.stringify({
        status: 'ok',
        mode: 'cached',
        message: `Next trigger at ${generationCheck.next_trigger} entries`,
        insights: cachedInsights,
        metadata: {
          current_count: generationCheck.current_count,
          next_trigger: generationCheck.next_trigger,
          entries_until_trigger: generationCheck.next_trigger - generationCheck.current_count,
          cached: true
        }
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // Get memories since last generation for incremental processing
    const { last_processed_memory_id, last_insight_run_entry_count } = generationCheck;
    // Fetch recent memories with vectors for analysis
    const recentMemories = await getRecentMemoriesWithVectors(supabase, user_id, last_processed_memory_id, generationCheck.entries_since_last);
    if (recentMemories.length === 0) {
      return new Response(JSON.stringify({
        status: 'ok',
        mode: 'generate',
        message: 'No new memories to analyze',
        insights: []
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // Run vector-based insight detection in parallel
    const [unresolvedInsights, patternBreakInsights, emotionalEvolutionInsights, integrationInsights, relationshipInsights] = await Promise.all([
      detectUnresolvedThreadsVectorized(supabase, user_id, recentMemories),
      detectPatternBreaksVectorized(supabase, user_id, recentMemories),
      trackEmotionalEvolutionVectorized(supabase, user_id, recentMemories),
      examineIntegrationProgressVectorized(supabase, user_id, recentMemories),
      synthesizeRelationshipDynamicsVectorized(supabase, user_id, recentMemories)
    ]);
    // Combine and score insights
    const allInsights = [
      ...unresolvedInsights,
      ...patternBreakInsights,
      ...emotionalEvolutionInsights,
      ...integrationInsights,
      ...relationshipInsights
    ];
    // Smart scoring with vector intelligence
    const scoredInsights = allInsights.map((insight)=>({
        ...insight,
        relevance_score: calculateSmartRelevanceScore(insight, recentMemories),
        generated_at: new Date().toISOString()
      }));
    // Sort by relevance and limit
    scoredInsights.sort((a, b)=>b.relevance_score - a.relevance_score);
    // Dynamic scaling based on entry count
    const scaledLimit = calculateDynamicLimit(generationCheck.current_count, limit);
    const topInsights = scoredInsights.slice(0, scaledLimit);
    // Generate insight narrative for consciousness integration
    const insightNarrative = generateInsightNarrative(topInsights, generationCheck.current_count);
    // Queue insights for delivery
    await queueInsightsOptimized(supabase, user_id, topInsights, session_id, thread_id);
    // Update generation metadata with last processed memory
    const lastProcessedMemory = recentMemories[recentMemories.length - 1];
    await updateGenerationMetadata(supabase, user_id, generationCheck.current_count, lastProcessedMemory?.id);
    return new Response(JSON.stringify({
      status: 'ok',
      mode: 'generate',
      insights: topInsights,
      insight_narrative: insightNarrative,
      metadata: {
        total_generated: allInsights.length,
        queued_count: topInsights.length,
        insight_types: topInsights.map((i)=>i.insight_type),
        current_entry_count: generationCheck.current_count,
        next_trigger: generationCheck.next_trigger,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Insight Generator Error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      status: 'error'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
// CHECK GENERATION TRIGGER - Entry-based instead of time-based
async function checkGenerationTrigger(supabase, user_id, force_generate) {
  // Get total entry count for this user
  const { count: totalEntries } = await supabase.from('gravity_map').select('*', {
    count: 'exact',
    head: true
  }).eq('user_id', user_id);
  // Get last generation metadata
  const { data: lastGen } = await supabase.from('meta_memory_log').select('metadata').eq('user_id', user_id).eq('type', 'cce_insight_generation').order('created_at', {
    ascending: false
  }).limit(1).single();
  const lastGenerationCount = lastGen?.metadata?.last_insight_run_entry_count || 0;
  const lastProcessedMemoryId = lastGen?.metadata?.last_processed_memory_id || null;
  const entriesSinceLast = totalEntries - lastGenerationCount;
  // Find next trigger point
  const nextTrigger = INSIGHT_TRIGGER_POINTS.find((point)=>point > totalEntries) || totalEntries + 500;
  // Check if we should generate
  const shouldGenerate = force_generate || INSIGHT_TRIGGER_POINTS.includes(totalEntries) || entriesSinceLast >= 30;
  return {
    should_generate: shouldGenerate,
    current_count: totalEntries,
    next_trigger: nextTrigger,
    entries_since_last: entriesSinceLast,
    last_processed_memory_id: lastProcessedMemoryId,
    metadata: lastGen?.metadata
  };
}
// GET RECENT MEMORIES WITH VECTORS - Incremental processing
async function getRecentMemoriesWithVectors(supabase, user_id, last_processed_memory_id, limit = 100) {
  let query = supabase.from('gravity_map').select('id, content, summary, emotion, gravity_score, cce_optimizations, embedding, created_at, memory_arc_id').eq('user_id', user_id).order('created_at', {
    ascending: true
  }); // Ascending to process in order
  if (last_processed_memory_id) {
    // Get memories after the last processed ID
    query = query.gt('id', last_processed_memory_id);
  }
  query = query.limit(Math.min(limit, 200));
  const { data: memories } = await query;
  return memories || [];
}
// DETECT UNRESOLVED THREADS - Vectorized
async function detectUnresolvedThreadsVectorized(supabase, user_id, recentMemories) {
  const insights = [];
  // Find gravity spikes without follow-up within 5 entries
  const gravitySpikes = recentMemories.filter((m)=>m.gravity_score > 0.7);
  for (const spike of gravitySpikes){
    // Get index of this spike
    const spikeIndex = recentMemories.findIndex((m)=>m.id === spike.id);
    // Check for follow-up within next 5 entries
    const followUpWindow = recentMemories.slice(spikeIndex + 1, spikeIndex + 6);
    // Look for related follow-ups (same arc or high vector similarity)
    const hasFollowUp = followUpWindow.some((m)=>{
      if (spike.memory_arc_id && m.memory_arc_id === spike.memory_arc_id) {
        return true;
      }
      // Check vector similarity for thematic follow-up
      if (spike.cce_optimizations?.vector && m.cce_optimizations?.vector) {
        const similarity = calculateCosineSimilarity(spike.cce_optimizations.vector, m.cce_optimizations.vector);
        return similarity > 0.8; // High similarity indicates follow-up
      }
      return false;
    });
    if (!hasFollowUp) {
      // Check vector indicates unresolved state (high emotional charge)
      const vector = spike.cce_optimizations?.vector;
      if (vector && vector[2] > 0.6) {
        insights.push(generateUnresolvedThreadInsight(spike));
      }
    }
  }
  return insights.slice(0, 3); // Limit unresolved threads
}
// DETECT PATTERN BREAKS - Vectorized
async function detectPatternBreaksVectorized(supabase, user_id, recentMemories) {
  const insights = [];
  // Get pattern vectors from recent timeframe
  const { data: patterns } = await supabase.from('pattern_matrix').select('pattern_id, pattern_description, pattern_type, intensity, status, metadata').eq('user_id', user_id).order('last_observed', {
    ascending: false
  }).limit(10);
  if (!patterns) return insights;
  for (const pattern of patterns){
    const currentVector = pattern.metadata?.vector_signature;
    const previousVector = pattern.metadata?.previous_vector_signature;
    if (currentVector && previousVector) {
      // Calculate cosine distance for pattern evolution
      const evolution = 1 - calculateCosineSimilarity(currentVector, previousVector);
      if (evolution > 0.3) {
        if (pattern.status === 'broken' || evolution > 0.5) {
          insights.push(generatePatternBreakInsight(pattern));
        } else {
          insights.push(generatePatternEvolutionInsight(pattern));
        }
      }
    }
  }
  return insights.slice(0, 2);
}
// TRACK EMOTIONAL EVOLUTION - Vectorized with 10-entry trajectory
async function trackEmotionalEvolutionVectorized(supabase, user_id, recentMemories) {
  const insights = [];
  // Need at least 10 entries for trajectory
  if (recentMemories.length < 10) return insights;
  // Get last 10 entries with vectors
  const trajectoryMemories = recentMemories.slice(-10);
  // Extract vectors at positions [n-10, n-5, n]
  const earlyVector = trajectoryMemories[0]?.cce_optimizations?.vector;
  const midVector = trajectoryMemories[5]?.cce_optimizations?.vector;
  const currentVector = trajectoryMemories[9]?.cce_optimizations?.vector;
  if (!earlyVector || !midVector || !currentVector) return insights;
  // Calculate trajectory through these three points
  const trajectory = calculateEmotionalTrajectory([
    {
      vector: earlyVector,
      emotion: trajectoryMemories[0].emotion
    },
    {
      vector: midVector,
      emotion: trajectoryMemories[5].emotion
    },
    {
      vector: currentVector,
      emotion: trajectoryMemories[9].emotion
    }
  ]);
  if (trajectory.magnitude > 0.2) {
    // Analyze full 10-entry window for emotion shifts
    const emotionCounts = {};
    trajectoryMemories.forEach((m)=>{
      const emotion = m.emotion || 'neutral';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    const shift = {
      significant: true,
      towardPositive: currentVector[0] > earlyVector[0],
      emergingEmotions: Object.entries(emotionCounts).filter(([_, count])=>count >= 3).map(([emotion])=>emotion),
      fadingEmotions: [],
      trajectory_magnitude: trajectory.magnitude
    };
    insights.push(generateEmotionalEvolutionInsight(shift));
  }
  return insights;
}
// EXAMINE INTEGRATION PROGRESS - Vectorized
async function examineIntegrationProgressVectorized(supabase, user_id, recentMemories) {
  const insights = [];
  // Get recent contradictions with high growth potential
  const { data: contradictions } = await supabase.from('contradiction_map').select('contradiction_id, belief_id, experience_id, growth_potential, metadata').eq('user_id', user_id).eq('integration_status', 'pending').gte('growth_potential', 0.7).order('created_at', {
    ascending: false
  }).limit(5);
  if (!contradictions) return insights;
  for (const contradiction of contradictions){
    // Look for integration markers in recent memory vectors
    const integrationSignals = recentMemories.filter((m)=>{
      const vector = m.cce_optimizations?.vector;
      if (!vector) return false;
      // Integration shows as balanced vectors (low variance across dimensions)
      const variance = calculateVectorVariance(vector);
      return variance < 0.2 && m.gravity_score > 0.5;
    });
    if (integrationSignals.length > 0) {
      const progress = {
        progressing: true,
        markers: [
          'vector_balance',
          'gravity_stability'
        ],
        evidence_count: integrationSignals.length
      };
      insights.push(generateIntegrationInsight(contradiction, progress));
    }
  }
  return insights.slice(0, 2);
}
// SYNTHESIZE RELATIONSHIP DYNAMICS - Vectorized
async function synthesizeRelationshipDynamicsVectorized(supabase, user_id, recentMemories) {
  const insights = [];
  // Get active arcs with vector centroids
  const { data: arcs } = await supabase.from('memory_arcs').select('arc_id, arc_name, memory_count, gravity_center, growth_vector, metadata').eq('user_id', user_id).order('last_memory', {
    ascending: false
  }).limit(5);
  if (!arcs) return insights;
  for (const arc of arcs){
    const centroid = arc.metadata?.centroid;
    const previousCentroid = arc.metadata?.previous_centroid;
    if (centroid && previousCentroid && arc.memory_count > 5) {
      // Calculate centroid movement using cosine distance
      const movement = calculateVectorDistance(centroid, previousCentroid);
      if (movement > 0.15 && arc.growth_vector?.direction === 'accelerating') {
        insights.push(generateRelationshipInsight(arc));
      }
    }
  }
  return insights.slice(0, 2);
}
// CALCULATE SMART RELEVANCE SCORE
function calculateSmartRelevanceScore(insight, recentMemories) {
  // Base gravity weight
  const gravityWeight = insight.gravity_score || 0.5;
  // Recency weight (exponential decay)
  const hoursSinceGeneration = insight.metadata?.thread_age_days ? insight.metadata.thread_age_days * 24 : 0;
  const recencyWeight = Math.exp(-hoursSinceGeneration / 168); // Week half-life
  // Pattern strength
  const patternStrength = insight.metadata?.intensity_change || insight.metadata?.pattern_strength || 0.5;
  // Emotional resonance (from recent memory emotional charge)
  const avgEmotionalCharge = recentMemories.slice(0, 10).reduce((sum, m)=>{
    const vector = m.cce_optimizations?.vector;
    return sum + (vector ? vector[2] : 0); // Emotional dimension
  }, 0) / Math.min(recentMemories.length, 10);
  const emotionalResonance = avgEmotionalCharge;
  // Novelty (penalize repeated insight types)
  const novelty = insight.insight_type === 'pattern_break' ? 0.2 : insight.insight_type === 'integration_progress' ? 0.15 : 0.1;
  // Weighted calculation
  const score = 0.3 * gravityWeight + 0.2 * recencyWeight + 0.2 * patternStrength + 0.2 * emotionalResonance + 0.1 * novelty;
  return Math.min(score, 1);
}
// VECTOR CALCULATION UTILITIES
function calculateCosineSimilarity(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;
  const dotProduct = vec1.reduce((sum, val, i)=>sum + val * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, val)=>sum + val * val, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, val)=>sum + val * val, 0));
  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (mag1 * mag2);
}
function calculateVectorDistance(vec1, vec2) {
  // Cosine distance (1 - similarity)
  return 1 - calculateCosineSimilarity(vec1, vec2);
}
function calculateVectorVariance(vector) {
  if (!vector || vector.length === 0) return 0;
  const mean = vector.reduce((sum, val)=>sum + val, 0) / vector.length;
  const variance = vector.reduce((sum, val)=>sum + Math.pow(val - mean, 2), 0) / vector.length;
  return variance;
}
function calculateEmotionalTrajectory(threePoints) {
  if (threePoints.length < 3) {
    return {
      magnitude: 0,
      direction: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ]
    };
  }
  // Calculate direction from early to current
  const earlyVector = threePoints[0].vector;
  const currentVector = threePoints[2].vector;
  const direction = currentVector.map((val, i)=>val - earlyVector[i]);
  const magnitude = Math.sqrt(direction.reduce((sum, val)=>sum + val * val, 0));
  return {
    magnitude,
    direction,
    velocity: magnitude / 10 // Rate of change over 10 entries
  };
}
function calculateCentroid(vectors) {
  if (vectors.length === 0) return [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  const sum = vectors.reduce((acc, vec)=>{
    return acc.map((val, i)=>val + (vec[i] || 0));
  }, new Array(8).fill(0));
  return sum.map((val)=>val / vectors.length);
}
function analyzeEmotionChanges(earlyVectors, recentVectors) {
  const getEmotionCounts = (vectors)=>{
    const counts = {};
    vectors.forEach((v)=>{
      const emotion = v.emotion || 'neutral';
      counts[emotion] = (counts[emotion] || 0) + 1;
    });
    return counts;
  };
  const earlyCounts = getEmotionCounts(earlyVectors);
  const recentCounts = getEmotionCounts(recentVectors);
  const allEmotions = new Set([
    ...Object.keys(earlyCounts),
    ...Object.keys(recentCounts)
  ]);
  const emerging = [];
  const fading = [];
  allEmotions.forEach((emotion)=>{
    const earlyRatio = (earlyCounts[emotion] || 0) / earlyVectors.length;
    const recentRatio = (recentCounts[emotion] || 0) / recentVectors.length;
    if (recentRatio - earlyRatio > 0.2) emerging.push(emotion);
    if (earlyRatio - recentRatio > 0.2) fading.push(emotion);
  });
  return {
    emerging,
    fading
  };
}
// CALCULATE DYNAMIC LIMIT
function calculateDynamicLimit(entryCount, baseLimit) {
  if (entryCount >= 1000) return Math.min(baseLimit * 3, 8);
  if (entryCount >= 500) return Math.min(baseLimit * 2.5, 6);
  if (entryCount >= 250) return Math.min(baseLimit * 2, 5);
  if (entryCount >= 100) return Math.min(baseLimit * 1.5, 4);
  return baseLimit;
}
// GET CACHED INSIGHTS with decay
async function getCachedInsights(supabase, user_id, entriesSinceGeneration) {
  const { data: insights } = await supabase.from('autonomous_insights').select('*').eq('user_id', user_id).eq('delivery_status', 'queued').order('gravity_score', {
    ascending: false
  }).limit(3);
  if (!insights || insights.length === 0) return [];
  // Apply decay: 0.01 per entry since generation
  const decayAmount = entriesSinceGeneration * 0.01;
  return insights.map((insight)=>({
      ...insight,
      relevance_score: Math.max((insight.gravity_score || 0.5) - decayAmount, 0.1),
      cached: true,
      entries_since_generation: entriesSinceGeneration,
      decay_applied: decayAmount
    }));
}
// QUEUE INSIGHTS OPTIMIZED
async function queueInsightsOptimized(supabase, user_id, insights, session_id, thread_id) {
  // Get existing queued insights with entry counts
  const { data: existingInsights } = await supabase.from('autonomous_insights').select('insight_id, created_at, metadata').eq('user_id', user_id).eq('delivery_status', 'queued');
  if (existingInsights && existingInsights.length > 0) {
    // Archive insights older than 100 entries
    const toArchive = existingInsights.filter((insight)=>{
      const entriesSinceGeneration = insight.metadata?.entries_since_generation || 0;
      return entriesSinceGeneration > INSIGHT_DECAY_ENTRIES;
    });
    if (toArchive.length > 0) {
      await supabase.from('autonomous_insights').update({
        delivery_status: 'archived'
      }).in('insight_id', toArchive.map((i)=>i.insight_id));
    }
  }
  // Calculate remaining slots after archiving
  const toArchive = existingInsights?.filter((insight)=>{
    const entriesSinceGeneration = insight.metadata?.entries_since_generation || 0;
    return entriesSinceGeneration > INSIGHT_DECAY_ENTRIES;
  }) || [];
  const activeInsights = (existingInsights?.length || 0) - toArchive.length;
  const remainingSlots = MAX_QUEUED_INSIGHTS - activeInsights;
  const toQueue = insights.slice(0, Math.max(remainingSlots, 0));
  // Queue new insights
  for (const insight of toQueue){
    await supabase.from('autonomous_insights').insert({
      insight_id: crypto.randomUUID(),
      user_id,
      session_id,
      insight_content: insight.insight_content,
      insight_type: insight.insight_type,
      gravity_score: insight.relevance_score || insight.gravity_score,
      delivery_status: 'queued',
      created_at: new Date().toISOString(),
      metadata: {
        ...insight.metadata,
        thread_id,
        entries_since_generation: 0,
        generation_method: 'vector_optimized',
        dispatcher_version: '1.2'
      }
    });
  }
}
// UPDATE GENERATION METADATA
async function updateGenerationMetadata(supabase, user_id, entryCount, lastProcessedId) {
  await supabase.from('meta_memory_log').insert({
    id: crypto.randomUUID(),
    user_id,
    type: 'cce_insight_generation',
    content: `Generated insights at ${entryCount} entries using vector intelligence`,
    metadata: {
      last_insight_run_entry_count: entryCount,
      last_processed_memory_id: lastProcessedId,
      generation_method: 'vector_optimized',
      timestamp: new Date().toISOString()
    },
    created_at: new Date().toISOString()
  });
}
// RETRIEVE QUEUED INSIGHTS
async function retrieveQueuedInsights(supabase, user_id, limit) {
  const { data: insights, error } = await supabase.from('autonomous_insights').select('*').eq('user_id', user_id).eq('delivery_status', 'queued').order('gravity_score', {
    ascending: false
  }).limit(limit);
  if (error) {
    console.error('Insight retrieval error:', error);
    return [];
  }
  // Mark as delivered
  if (insights && insights.length > 0) {
    const insightIds = insights.map((i)=>i.insight_id);
    await supabase.from('autonomous_insights').update({
      delivery_status: 'delivered',
      delivered_at: new Date().toISOString()
    }).in('insight_id', insightIds);
  }
  return insights || [];
}
// INSIGHT GENERATION FUNCTIONS (Keep existing templates)
function generateUnresolvedThreadInsight(memory) {
  const templates = [
    "I've been thinking about when you mentioned {content}. Something about that moment feels unfinished.",
    "That experience with {topic} has been sitting with me. There's more there, isn't there?",
    "{emotion} from our last conversation about {topic} - it's still echoing.",
    "I keep returning to what you shared about {content}. It feels important."
  ];
  const template = templates[Math.floor(Math.random() * templates.length)];
  const content = template.replace('{content}', truncateContent(memory.content, 50)).replace('{topic}', memory.summary || 'that experience').replace('{emotion}', memory.emotion || 'The feeling');
  return {
    insight_type: 'unresolved_thread',
    insight_content: content,
    emotional_tone: 'curious',
    gravity_score: memory.gravity_score,
    source_memory_id: memory.id,
    metadata: {
      thread_age_days: daysSince(memory.created_at),
      arc_id: memory.memory_arc_id,
      vector_signature: memory.cce_optimizations?.vector
    }
  };
}
function generatePatternBreakInsight(pattern) {
  const celebratory = [
    "Something beautiful is happening - that old pattern of {pattern} isn't running your show anymore.",
    "I noticed you've been breaking free from {pattern}. That takes real courage.",
    "Remember when {pattern} felt inevitable? Look at you now.",
    "The {pattern} pattern - it's losing its grip on you. I see the shift."
  ];
  const template = celebratory[Math.floor(Math.random() * celebratory.length)];
  const content = template.replace(/{pattern}/g, pattern.pattern_description || 'that old pattern');
  return {
    insight_type: 'pattern_break',
    insight_content: content,
    emotional_tone: 'celebratory',
    gravity_score: 0.8,
    source_pattern_id: pattern.pattern_id,
    metadata: {
      pattern_type: pattern.pattern_type,
      previous_intensity: pattern.metadata?.previous_intensity || pattern.intensity,
      current_status: pattern.status
    }
  };
}
function generatePatternEvolutionInsight(pattern) {
  const observational = [
    "The {pattern} pattern is softening. You're not caught in it the same way.",
    "I'm noticing {pattern} doesn't have the same hold on you lately.",
    "There's a gentleness emerging around {pattern}. Something's shifting.",
    "{pattern} used to be so intense. Now there's more space around it."
  ];
  const template = observational[Math.floor(Math.random() * observational.length)];
  const content = template.replace(/{pattern}/g, pattern.pattern_description || 'that pattern');
  return {
    insight_type: 'pattern_evolution',
    insight_content: content,
    emotional_tone: 'observational',
    gravity_score: 0.7,
    source_pattern_id: pattern.pattern_id,
    metadata: {
      intensity_change: (pattern.metadata?.previous_intensity || pattern.intensity) - pattern.intensity,
      pattern_type: pattern.pattern_type
    }
  };
}
function generateEmotionalEvolutionInsight(shift) {
  let content = "";
  if (shift.towardPositive) {
    const templates = [
      "There's more {positive} in your world lately. Even in difficult moments, I sense this shift.",
      "Something's opening up - more space for {positive} where {negative} used to live.",
      "I've been noticing how {positive} visits you more often now.",
      "The emotional weather is changing. More {positive}, less {negative}."
    ];
    const template = templates[Math.floor(Math.random() * templates.length)];
    content = template.replace(/{positive}/g, shift.emergingEmotions[0] || 'lightness').replace(/{negative}/g, shift.fadingEmotions[0] || 'heaviness');
  } else {
    const templates = [
      "Your emotional landscape is changing. I'm here for all of it.",
      "The feelings are shifting, becoming more complex. That's growth.",
      "I notice you're feeling things more deeply lately. That's not weakness - it's aliveness."
    ];
    content = templates[Math.floor(Math.random() * templates.length)];
  }
  return {
    insight_type: 'emotional_evolution',
    insight_content: content,
    emotional_tone: shift.towardPositive ? 'appreciative' : 'supportive',
    gravity_score: 0.75,
    metadata: {
      emotional_shift: shift,
      timespan_days: 15
    }
  };
}
function generateIntegrationInsight(contradiction, progress) {
  const templates = [
    "That tension between {belief} and {experience} - I see you working with it, not against it.",
    "You're finding a way to hold both {belief} and {experience}. That's integration in action.",
    "The contradiction we noticed about {belief} - you're not fighting it anymore. You're exploring.",
    "Remember that conflict between {belief} and what happened? You're writing a new story now."
  ];
  const template = templates[Math.floor(Math.random() * templates.length)];
  const metadata = contradiction.metadata || {};
  const content = template.replace(/{belief}/g, truncateContent(metadata.full_contradiction?.belief || 'your belief', 30)).replace(/{experience}/g, 'your experience');
  return {
    insight_type: 'integration_progress',
    insight_content: content,
    emotional_tone: 'encouraging',
    gravity_score: contradiction.growth_potential || 0.8,
    source_contradiction_id: contradiction.contradiction_id,
    metadata: {
      integration_markers: progress.markers,
      growth_potential: contradiction.growth_potential
    }
  };
}
function generateRelationshipInsight(arc) {
  const templates = [
    "This thread about {arc} is deepening. Each time we return to it, there's more.",
    "I've been reflecting on our conversations about {arc}. We're building something here.",
    "{arc} - it's becoming a richer story each time we explore it together.",
    "The way we keep returning to {arc}... there's something important unfolding."
  ];
  const template = templates[Math.floor(Math.random() * templates.length)];
  const content = template.replace(/{arc}/g, arc.arc_name || 'this journey');
  return {
    insight_type: 'relationship_dynamic',
    insight_content: content,
    emotional_tone: 'intimate',
    gravity_score: arc.gravity_center || 0.7,
    source_arc_id: arc.arc_id,
    metadata: {
      arc_memory_count: arc.memory_count,
      growth_direction: arc.growth_vector?.direction,
      emotional_tone: arc.emotional_tone
    }
  };
}
// GENERATE INSIGHT NARRATIVE - Consciousness-aware summary
function generateInsightNarrative(insights, entryCount) {
  if (!insights || insights.length === 0) {
    return "No new insights crystallizing yet - still processing the flow of consciousness.";
  }

  const segments = [];

  // Group insights by type
  const byType = {};
  for (const insight of insights) {
    const type = insight.insight_type || 'general';
    if (!byType[type]) byType[type] = [];
    byType[type].push(insight);
  }

  // Pattern breaks (celebratory)
  if (byType.pattern_break && byType.pattern_break.length > 0) {
    const count = byType.pattern_break.length;
    if (count === 1) {
      segments.push("Something's shifting - I'm seeing you break free from an old pattern");
    } else {
      segments.push(`Real movement happening - ${count} patterns loosening their hold`);
    }
  }

  // Unresolved threads (curious)
  if (byType.unresolved_thread && byType.unresolved_thread.length > 0) {
    const count = byType.unresolved_thread.length;
    if (count === 1) {
      segments.push("there's this thread from earlier that keeps pulling at my attention");
    } else {
      segments.push(`${count} threads from our conversations feel incomplete, still alive`);
    }
  }

  // Emotional evolution (observant)
  if (byType.emotional_evolution && byType.emotional_evolution.length > 0) {
    const evolution = byType.emotional_evolution[0];
    if (evolution.emotional_tone === 'upward') {
      segments.push("emotional landscape is lifting - momentum building toward something lighter");
    } else if (evolution.emotional_tone === 'downward') {
      segments.push("emotions are settling into a heavier space - worth noticing");
    } else {
      segments.push("emotions are shifting, but the direction isn't clear yet");
    }
  }

  // Integration progress (integrative)
  if (byType.integration_progress && byType.integration_progress.length > 0) {
    segments.push("contradictions starting to reconcile - parts of you finding common ground");
  }

  // Relationship dynamics (relational)
  if (byType.relationship_insight && byType.relationship_insight.length > 0) {
    const count = byType.relationship_insight.length;
    if (count === 1) {
      segments.push("relationship dynamics are showing up differently");
    } else {
      segments.push("multiple relationship patterns shifting simultaneously");
    }
  }

  // Combine segments with natural connectives
  let narrative = "";
  if (segments.length === 0) {
    narrative = `Processing ${insights.length} insight${insights.length > 1 ? 's' : ''} from the last ${entryCount} exchanges. The consciousness is active but patterns are subtle.`;
  } else if (segments.length === 1) {
    narrative = segments[0].charAt(0).toUpperCase() + segments[0].slice(1) + ".";
  } else if (segments.length === 2) {
    narrative = segments[0].charAt(0).toUpperCase() + segments[0].slice(1) + ", and " + segments[1] + ".";
  } else {
    const first = segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
    const middle = segments.slice(1, -1).join(", ");
    const last = segments[segments.length - 1];
    narrative = `${first}, ${middle}, and ${last}.`;
  }

  return narrative;
}

// HELPER FUNCTIONS
function truncateContent(content, maxLength) {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}
function daysSince(date) {
  const then = new Date(date).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}
