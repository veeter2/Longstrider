// CCE Pattern Detector v3.0 - Predictive Vector-Optimized Pattern Recognition
// Edge Function 2 of 7 in the Corpus Callosum Engine
// 
// PURPOSE: Detect, track, and predict emotional/behavioral patterns using vector operations
// - 100x faster using 8D behavioral vectors with DBSCAN clustering
// - Incremental processing with entry-count triggers: [10, 25, 50, 100, 250, 500]
// - Pattern velocity tracking for acceleration/deceleration insights
// - Emerging pattern prediction using vector trajectory analysis
// - Cross-pattern interference detection for hidden connections
// - Smart decay and reinforcement for temporal relevance
// - ENHANCED WITH PATTERN NARRATIVE for consciousness-aware insights
//
// VECTOR DIMENSIONS (cce_optimizations.vector):
// [0] emotion_valence     - Emotional state (-1 to 1)
// [1] cognitive_load      - Mental processing demand (0 to 1)
// [2] temporal_urgency    - Time sensitivity (0 to 1)
// [3] identity_relevance  - Self-concept impact (0 to 1)
// [4] contradiction_score - Internal conflict level (0 to 1)
// [5] pattern_strength    - Behavioral reinforcement (0 to 1)
// [6] relationship_impact - Social dynamics effect (0 to 1)
// [7] action_potential    - Likelihood of action (0 to 1)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// CONFIGURATION CONSTANTS
const ENTRY_TRIGGERS = [
  10,
  25,
  50,
  100,
  250,
  500,
  1000,
  2500,
  5000
];
const DBSCAN_EPS = 0.3; // Maximum distance between vectors in cluster
const DBSCAN_MIN_PTS = 3; // Minimum points to form a cluster
const PATTERN_DECAY_RATE = 0.001; // Per entry without reinforcement
const PATTERN_REINFORCE_RATE = 0.1; // Strength increase when pattern detected
const PATTERN_DORMANT_THRESHOLD = 0.3; // Below this, pattern becomes dormant
const PATTERN_MERGE_THRESHOLD = 0.85; // Similarity threshold for merging
const MIN_PATTERN_INTENSITY = 0.4; // Minimum intensity to store pattern
const MIN_CLUSTER_DENSITY = 0.6; // Minimum cluster density to form pattern
const VECTOR_SIMILARITY_THRESHOLD = 0.85; // For pattern matching
const EMERGING_PATTERN_THRESHOLD = 0.4; // Distance threshold for emerging patterns
serve(async (req)=>{
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  const startTime = Date.now();
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  try {
    // Parse request payload - ALIGNED WITH DISPATCHER PAYLOAD CONTRACT v1.2
    const payload = await req.json();
    const { user_id, session_id, thread_id, memory_trace_id, conversation_name, metadata, arc_id, time_range, filters = {} } = payload;
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
    console.log(`🧠 Pattern Detector v3.0: Analyzing patterns for user ${user_id}`);
    // 1. CHECK ENTRY COUNT AND TRIGGER POINTS
    const entryCount = await getUserMemoryCount(supabase, user_id);
    const nextTrigger = ENTRY_TRIGGERS.find((t)=>t > entryCount) || entryCount + 500;
    const isAtTriggerPoint = ENTRY_TRIGGERS.includes(entryCount);
    // Get last run metadata from cache
    const cacheData = await getPatternCache(supabase, user_id);
    const lastEntryCount = cacheData?.last_entry_count || 0;
    const lastMemoryId = cacheData?.last_memory_id || null;
    const cachedPatterns = cacheData?.cached_patterns || [];
    const patternHistory = cacheData?.pattern_history || {};
    console.log(`📊 Entry count: ${entryCount}, Last run: ${lastEntryCount}, Trigger: ${isAtTriggerPoint}`);
    // 2. RETURN CACHE IF NOT AT TRIGGER AND NO NEW MEMORIES
    if (!isAtTriggerPoint && entryCount === lastEntryCount && cachedPatterns.length > 0) {
      console.log(`✨ Returning cached patterns (not at trigger point)`);
      return createResponse({
        patterns: cachedPatterns,
        emerging_patterns: cacheData?.emerging_patterns || [],
        pattern_dynamics: cacheData?.pattern_dynamics || {},
        pattern_narrative: cacheData?.pattern_narrative || generatePatternNarrative(
          cachedPatterns,
          cacheData?.emerging_patterns || [],
          cacheData?.pattern_dynamics || {},
          entryCount
        ),
        system_metrics: {
          memories_processed: 0,
          processing_time_ms: Date.now() - startTime,
          confidence_score: cacheData?.confidence_score || 0.85,
          next_trigger_entry: nextTrigger,
          from_cache: true
        }
      });
    }
    // 3. FETCH NEW MEMORIES SINCE LAST RUN
    const newMemories = await fetchNewMemories(supabase, user_id, lastMemoryId, arc_id, time_range);
    // If no new memories and have cache, return it
    if (newMemories.length === 0 && cachedPatterns.length > 0) {
      console.log(`✨ No new memories, returning cached patterns`);
      return createResponse({
        patterns: cachedPatterns,
        emerging_patterns: cacheData?.emerging_patterns || [],
        pattern_dynamics: cacheData?.pattern_dynamics || {},
        pattern_narrative: cacheData?.pattern_narrative || generatePatternNarrative(
          cachedPatterns,
          cacheData?.emerging_patterns || [],
          cacheData?.pattern_dynamics || {},
          entryCount
        ),
        system_metrics: {
          memories_processed: 0,
          processing_time_ms: Date.now() - startTime,
          confidence_score: cacheData?.confidence_score || 0.85,
          next_trigger_entry: nextTrigger,
          from_cache: true
        }
      });
    }
    console.log(`📈 Processing ${newMemories.length} new memories incrementally`);
    // 4. LOAD EXISTING PATTERNS WITH FULL METADATA
    const existingPatterns = await loadExistingPatterns(supabase, user_id);
    // 5. APPLY PATTERN DECAY BASED ON ENTRIES ELAPSED
    const decayedPatterns = applyPatternDecay(existingPatterns, entryCount, lastEntryCount);
    // 6. DETECT NEW PATTERNS USING VECTOR OPERATIONS
    const newPatterns = await detectPatternsWithVectors(newMemories, decayedPatterns, supabase, user_id);
    // 7. MERGE AND DEDUPLICATE PATTERNS
    const mergedPatterns = mergeAndDeduplicatePatterns(newPatterns, decayedPatterns, entryCount);
    // 8. CALCULATE PATTERN VELOCITY AND ACCELERATION
    const patternsWithVelocity = calculatePatternDynamics(mergedPatterns, patternHistory, entryCount);
    // 9. DETECT CROSS-PATTERN INTERFERENCE
    const patternsWithInterference = detectPatternInterference(patternsWithVelocity);
    // 10. PREDICT EMERGING PATTERNS
    const emergingPatterns = await predictEmergingPatterns(newMemories, patternsWithInterference, entryCount);
    // 11. FILTER OUT LOW-QUALITY PATTERNS (MVP)
    const qualityPatterns = filterMinimumViablePatterns(patternsWithInterference);
    // 12. CALCULATE PATTERN DYNAMICS
    const patternDynamics = calculatePatternSummary(qualityPatterns, decayedPatterns, entryCount);
    // 13. SORT BY SIGNIFICANCE (strength * frequency * velocity)
    qualityPatterns.sort((a, b)=>{
      const scoreA = calculatePatternScore(a);
      const scoreB = calculatePatternScore(b);
      return scoreB - scoreA;
    });
    // 14. UPDATE PATTERN CACHE AND MATRIX
    await updatePatternCache(supabase, user_id, qualityPatterns, emergingPatterns, patternDynamics, entryCount, newMemories);
    // 15. LOG PATTERN DETECTION EVENT
    await logPatternDetection(supabase, user_id, qualityPatterns, session_id, thread_id, memory_trace_id);
    // 16. GENERATE PATTERN NARRATIVE (NEW)
    const patternNarrative = generatePatternNarrative(
      qualityPatterns,
      emergingPatterns,
      patternDynamics,
      entryCount
    );
    // 17. GENERATE RESPONSE WITH ACTIONABLE INSIGHTS
    const processingTime = Date.now() - startTime;
    const confidenceScore = calculateConfidenceScore(qualityPatterns, newMemories.length);
    return createResponse({
      patterns: qualityPatterns,
      emerging_patterns: emergingPatterns,
      pattern_dynamics: patternDynamics,
      pattern_narrative: patternNarrative,  // ← NEW FIELD
      system_metrics: {
        memories_processed: newMemories.length,
        processing_time_ms: processingTime,
        confidence_score: confidenceScore,
        next_trigger_entry: nextTrigger,
        from_cache: false
      }
    });
  } catch (error) {
    console.error('Pattern Detector Error:', error);
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
// ==================== CORE FUNCTIONS ====================
// GET USER MEMORY COUNT
async function getUserMemoryCount(supabase, user_id) {
  const { count, error } = await supabase.from('gravity_map').select('*', {
    count: 'exact',
    head: true
  }).eq('user_id', user_id);
  if (error) {
    console.error('Error getting memory count:', error);
    return 0;
  }
  return count || 0;
}
// GET PATTERN CACHE FROM PATTERN MATRIX
async function getPatternCache(supabase, user_id) {
  const { data, error } = await supabase.from('pattern_matrix').select('metadata').eq('user_id', user_id).eq('pattern_type', 'meta_cache').single();
  if (error || !data) {
    return null;
  }
  return data.metadata;
}
// FETCH ONLY NEW MEMORIES SINCE LAST RUN
async function fetchNewMemories(supabase, user_id, lastMemoryId, arc_id, time_range) {
  let query = supabase.from('gravity_map').select('*, cce_optimizations').eq('user_id', user_id).order('created_at', {
    ascending: true
  });
  // Only get memories after the last processed one
  if (lastMemoryId) {
    const { data: lastMemory } = await supabase.from('gravity_map').select('created_at').eq('id', lastMemoryId).single();
    if (lastMemory) {
      query = query.gt('created_at', lastMemory.created_at);
    }
  }
  // Apply arc filter if specified
  if (arc_id) {
    query = query.eq('memory_arc_id', arc_id);
  }
  // Apply time range filter
  if (time_range) {
    if (time_range.start) {
      query = query.gte('created_at', time_range.start);
    }
    if (time_range.end) {
      query = query.lte('created_at', time_range.end);
    }
  }
  const { data, error } = await query.limit(100); // Process max 100 at a time
  if (error) {
    console.error('Memory fetch error:', error);
    return [];
  }
  // Filter for memories with vectors
  return (data || []).filter((m)=>m.cce_optimizations?.vector?.length === 8);
}
// LOAD EXISTING PATTERNS WITH FULL METADATA
async function loadExistingPatterns(supabase, user_id) {
  const { data, error } = await supabase.from('pattern_matrix').select('*').eq('user_id', user_id).in('status', [
    'active',
    'evolving',
    'dormant'
  ]).neq('pattern_type', 'meta_cache');
  if (error || !data) {
    return [];
  }
  // Convert stored patterns to working format
  return data.map((p)=>({
      type: p.pattern_type,
      pattern: p.pattern_description,
      pattern_id: p.pattern_id,
      vector_signature: p.metadata?.vector_signature,
      intensity_score: p.intensity,
      pattern_strength: p.metadata?.pattern_strength || 0.5,
      frequency: p.metadata?.frequency || 1,
      velocity: p.metadata?.velocity || 0,
      acceleration: p.metadata?.acceleration || 0,
      last_reinforced_entry: p.metadata?.last_reinforced_entry || 0,
      span_days: p.metadata?.span_days || 0,
      first_detected: p.first_detected,
      last_occurred: p.last_observed,
      related_memory_ids: p.instances?.memory_ids || [],
      cross_patterns: p.metadata?.cross_patterns || [],
      predictive_power: p.metadata?.predictive_power || 0,
      status: p.status
    }));
}
// ==================== PATTERN DETECTION WITH VECTORS ====================
async function detectPatternsWithVectors(newMemories, existingPatterns, supabase, user_id) {
  const patterns = [];
  // Extract vectors from memories
  const memoryVectors = newMemories.map((m)=>({
      id: m.id,
      vector: m.cce_optimizations.vector,
      memory: m,
      created_at: m.created_at
    }));
  if (memoryVectors.length < DBSCAN_MIN_PTS) {
    console.log('Not enough memories with vectors for pattern detection');
    return patterns;
  }
  // Run all pattern detectors in parallel for efficiency
  const [emotionalLoops, recurringThemes, behavioralPatterns, relationshipDynamics, contradictionPatterns] = await Promise.all([
    detectEmotionalLoopsVector(memoryVectors, existingPatterns),
    detectRecurringThemesVector(memoryVectors, existingPatterns),
    detectBehavioralPatternsVector(memoryVectors, existingPatterns),
    detectRelationshipDynamicsVector(memoryVectors, existingPatterns),
    detectContradictionPatternsVector(memoryVectors, existingPatterns)
  ]);
  patterns.push(...emotionalLoops, ...recurringThemes, ...behavioralPatterns, ...relationshipDynamics, ...contradictionPatterns);
  return patterns;
}
// DETECT EMOTIONAL LOOPS USING VECTORS
async function detectEmotionalLoopsVector(memoryVectors, existingPatterns) {
  const loops = [];
  // Group by emotion valence (dimension 0) using DBSCAN
  const emotionClusters = dbscanCluster(memoryVectors.map((mv)=>[
      mv.vector[0],
      mv.vector[5]
    ]), 0.2, DBSCAN_MIN_PTS);
  for (const cluster of emotionClusters){
    if (cluster.points.length < DBSCAN_MIN_PTS) continue;
    const clusterMemories = cluster.points.map((idx)=>memoryVectors[idx].memory);
    const clusterVectors = cluster.points.map((idx)=>memoryVectors[idx].vector);
    // Check cluster density
    if (cluster.density < MIN_CLUSTER_DENSITY) continue;
    // Calculate cluster centroid
    const centroid = calculateCentroid(clusterVectors);
    // Check if this matches an existing emotional loop
    const existingLoop = findSimilarPattern(centroid, existingPatterns, 'emotional_loop');
    const intensity = calculateVectorIntensity(clusterVectors);
    if (intensity < MIN_PATTERN_INTENSITY && !existingLoop) continue;
    const timeSpan = calculateTimeSpanDays(clusterMemories);
    loops.push({
      type: 'emotional_loop',
      pattern: describeEmotionalPattern(centroid[0]),
      vector_signature: centroid,
      intensity_score: intensity,
      pattern_strength: existingLoop ? Math.min(1.0, existingLoop.pattern_strength + PATTERN_REINFORCE_RATE) : 0.5,
      frequency: clusterMemories.length + (existingLoop?.frequency || 0),
      velocity: 0,
      acceleration: 0,
      span_days: timeSpan,
      first_detected: existingLoop?.first_detected || getEarliestDate(clusterMemories),
      last_occurred: getLatestDate(clusterMemories),
      related_memory_ids: uniqueMemoryIds(clusterMemories.map((m)=>m.id), existingLoop?.related_memory_ids),
      cluster_density: cluster.density,
      resonance_score: calculateResonance(centroid)
    });
  }
  return loops;
}
// DETECT RECURRING THEMES USING FULL VECTOR CLUSTERING
async function detectRecurringThemesVector(memoryVectors, existingPatterns) {
  const themes = [];
  // Full vector DBSCAN clustering
  const themeClusters = dbscanCluster(memoryVectors.map((mv)=>mv.vector), DBSCAN_EPS, DBSCAN_MIN_PTS);
  for (const cluster of themeClusters){
    if (cluster.points.length < DBSCAN_MIN_PTS) continue;
    if (cluster.density < MIN_CLUSTER_DENSITY) continue;
    const clusterMemories = cluster.points.map((idx)=>memoryVectors[idx].memory);
    const clusterVectors = cluster.points.map((idx)=>memoryVectors[idx].vector);
    const centroid = calculateCentroid(clusterVectors);
    const coherence = calculateVectorCoherence(clusterVectors);
    if (coherence < 0.6) continue;
    const existingTheme = findSimilarPattern(centroid, existingPatterns, 'recurring_theme');
    const intensity = calculateVectorIntensity(clusterVectors);
    if (intensity < MIN_PATTERN_INTENSITY && !existingTheme) continue;
    themes.push({
      type: 'recurring_theme',
      pattern: await describeThemeFromVector(centroid, clusterMemories),
      vector_signature: centroid,
      semantic_coherence: coherence,
      intensity_score: intensity,
      pattern_strength: existingTheme ? Math.min(1.0, existingTheme.pattern_strength + PATTERN_REINFORCE_RATE) : 0.5,
      frequency: clusterMemories.length + (existingTheme?.frequency || 0),
      velocity: 0,
      acceleration: 0,
      span_days: calculateTimeSpanDays(clusterMemories),
      first_detected: existingTheme?.first_detected || getEarliestDate(clusterMemories),
      last_occurred: getLatestDate(clusterMemories),
      related_memory_ids: uniqueMemoryIds(clusterMemories.map((m)=>m.id), existingTheme?.related_memory_ids),
      cluster_density: cluster.density,
      stability_index: calculateStability(clusterVectors)
    });
  }
  return themes;
}
// DETECT BEHAVIORAL PATTERNS USING ACTION POTENTIAL
async function detectBehavioralPatternsVector(memoryVectors, existingPatterns) {
  const patterns = [];
  // Cluster on action_potential and cognitive load dimensions
  const actionClusters = dbscanCluster(memoryVectors.map((mv)=>[
      mv.vector[7],
      mv.vector[1],
      mv.vector[2]
    ]), 0.25, DBSCAN_MIN_PTS);
  for (const cluster of actionClusters){
    if (cluster.points.length < DBSCAN_MIN_PTS) continue;
    if (cluster.density < MIN_CLUSTER_DENSITY) continue;
    const clusterMemories = cluster.points.map((idx)=>memoryVectors[idx].memory);
    const clusterVectors = cluster.points.map((idx)=>memoryVectors[idx].vector);
    const centroid = calculateCentroid(clusterVectors);
    const existingPattern = findSimilarPattern(centroid, existingPatterns, 'behavioral_pattern');
    const intensity = calculateVectorIntensity(clusterVectors);
    if (intensity < MIN_PATTERN_INTENSITY && !existingPattern) continue;
    patterns.push({
      type: 'behavioral_pattern',
      pattern: describeBehavioralPattern(centroid),
      vector_signature: centroid,
      behavior_type: categorizeBehavior(centroid),
      intensity_score: intensity,
      pattern_strength: existingPattern ? Math.min(1.0, existingPattern.pattern_strength + PATTERN_REINFORCE_RATE) : 0.5,
      frequency: clusterMemories.length + (existingPattern?.frequency || 0),
      velocity: 0,
      acceleration: 0,
      span_days: calculateTimeSpanDays(clusterMemories),
      first_detected: existingPattern?.first_detected || getEarliestDate(clusterMemories),
      last_occurred: getLatestDate(clusterMemories),
      related_memory_ids: uniqueMemoryIds(clusterMemories.map((m)=>m.id), existingPattern?.related_memory_ids),
      cluster_density: cluster.density,
      action_likelihood: centroid[7]
    });
  }
  return patterns;
}
// DETECT RELATIONSHIP DYNAMICS USING RELATIONSHIP IMPACT
async function detectRelationshipDynamicsVector(memoryVectors, existingPatterns) {
  const dynamics = [];
  // Filter for high relationship impact memories
  const relationshipMemories = memoryVectors.filter((mv)=>mv.vector[6] > 0.5);
  if (relationshipMemories.length < DBSCAN_MIN_PTS) return dynamics;
  // Cluster on relationship, emotion, and contradiction dimensions
  const relationClusters = dbscanCluster(relationshipMemories.map((mv)=>[
      mv.vector[6],
      mv.vector[0],
      mv.vector[4]
    ]), 0.3, DBSCAN_MIN_PTS);
  for (const cluster of relationClusters){
    if (cluster.points.length < DBSCAN_MIN_PTS) continue;
    if (cluster.density < MIN_CLUSTER_DENSITY) continue;
    const clusterMemories = cluster.points.map((idx)=>relationshipMemories[idx].memory);
    const clusterVectors = cluster.points.map((idx)=>relationshipMemories[idx].vector);
    const centroid = calculateCentroid(clusterVectors);
    const volatility = calculateVolatilityVector(clusterVectors);
    const existingDynamic = findSimilarPattern(centroid, existingPatterns, 'relationship_dynamic');
    const intensity = calculateVectorIntensity(clusterVectors);
    if (intensity < MIN_PATTERN_INTENSITY && !existingDynamic) continue;
    dynamics.push({
      type: 'relationship_dynamic',
      pattern: describeRelationshipPattern(centroid, volatility),
      vector_signature: centroid,
      tension_score: centroid[4],
      emotional_volatility: volatility,
      pattern_strength: existingDynamic ? Math.min(1.0, existingDynamic.pattern_strength + PATTERN_REINFORCE_RATE) : 0.5,
      frequency: clusterMemories.length + (existingDynamic?.frequency || 0),
      velocity: 0,
      acceleration: 0,
      span_days: calculateTimeSpanDays(clusterMemories),
      first_detected: existingDynamic?.first_detected || getEarliestDate(clusterMemories),
      last_occurred: getLatestDate(clusterMemories),
      related_memory_ids: uniqueMemoryIds(clusterMemories.map((m)=>m.id), existingDynamic?.related_memory_ids),
      cluster_density: cluster.density,
      relationship_health: 1 - (centroid[4] + volatility) / 2
    });
  }
  return dynamics;
}
// DETECT CONTRADICTION PATTERNS USING CONTRADICTION SCORE
async function detectContradictionPatternsVector(memoryVectors, existingPatterns) {
  const patterns = [];
  // Filter for high contradiction scores
  const contradictionMemories = memoryVectors.filter((mv)=>mv.vector[4] > 0.6);
  if (contradictionMemories.length < 2) return patterns;
  // Group contradictions by theme similarity
  const contradictionClusters = dbscanCluster(contradictionMemories.map((mv)=>mv.vector), 0.35, 2 // Lower threshold for contradictions
  );
  for (const cluster of contradictionClusters){
    if (cluster.points.length < 2) continue;
    const clusterMemories = cluster.points.map((idx)=>contradictionMemories[idx].memory);
    const clusterVectors = cluster.points.map((idx)=>contradictionMemories[idx].vector);
    const centroid = calculateCentroid(clusterVectors);
    const existingContradiction = findSimilarPattern(centroid, existingPatterns, 'contradiction_pattern');
    const intensity = centroid[4]; // Use contradiction score directly
    if (intensity < MIN_PATTERN_INTENSITY && !existingContradiction) continue;
    patterns.push({
      type: 'contradiction_pattern',
      pattern: describeContradictionPattern(centroid),
      vector_signature: centroid,
      contradiction_type: categorizeContradiction(centroid),
      intensity_score: intensity,
      pattern_strength: existingContradiction ? Math.min(1.0, existingContradiction.pattern_strength + PATTERN_REINFORCE_RATE) : 0.5,
      frequency: clusterMemories.length + (existingContradiction?.frequency || 0),
      velocity: 0,
      acceleration: 0,
      span_days: calculateTimeSpanDays(clusterMemories),
      first_detected: existingContradiction?.first_detected || getEarliestDate(clusterMemories),
      last_occurred: getLatestDate(clusterMemories),
      related_memory_ids: uniqueMemoryIds(clusterMemories.map((m)=>m.id), existingContradiction?.related_memory_ids),
      cluster_density: cluster.density || 1.0,
      cognitive_dissonance: centroid[4] * centroid[3] // contradiction * identity
    });
  }
  return patterns;
}
// ==================== DBSCAN CLUSTERING IMPLEMENTATION ====================
function dbscanCluster(vectors, eps, minPts) {
  const n = vectors.length;
  const clusters = [];
  const visited = new Set();
  const noise = new Set();
  const assigned = new Set();
  for(let i = 0; i < n; i++){
    if (visited.has(i)) continue;
    visited.add(i);
    const neighbors = regionQuery(vectors, i, eps);
    if (neighbors.length < minPts) {
      noise.add(i);
    } else {
      const cluster = {
        points: [],
        density: 0
      };
      expandCluster(vectors, i, neighbors, cluster.points, eps, minPts, visited, assigned);
      // Calculate cluster density
      cluster.density = calculateClusterDensity(cluster.points.map((idx)=>vectors[idx]), eps);
      clusters.push(cluster);
    }
  }
  return clusters;
}
function regionQuery(vectors, pointIdx, eps) {
  const neighbors = [];
  const point = vectors[pointIdx];
  for(let i = 0; i < vectors.length; i++){
    if (i === pointIdx) continue;
    const distance = euclideanDistance(point, vectors[i]);
    if (distance <= eps) {
      neighbors.push(i);
    }
  }
  return neighbors;
}
function expandCluster(vectors, pointIdx, neighbors, cluster, eps, minPts, visited, assigned) {
  cluster.push(pointIdx);
  assigned.add(pointIdx);
  const queue = [
    ...neighbors
  ];
  while(queue.length > 0){
    const currentIdx = queue.shift();
    if (!visited.has(currentIdx)) {
      visited.add(currentIdx);
      const currentNeighbors = regionQuery(vectors, currentIdx, eps);
      if (currentNeighbors.length >= minPts) {
        for (const neighbor of currentNeighbors){
          if (!queue.includes(neighbor) && !assigned.has(neighbor)) {
            queue.push(neighbor);
          }
        }
      }
    }
    if (!assigned.has(currentIdx)) {
      cluster.push(currentIdx);
      assigned.add(currentIdx);
    }
  }
}
function calculateClusterDensity(vectors, eps) {
  if (vectors.length < 2) return 1.0;
  let totalDistance = 0;
  let comparisons = 0;
  for(let i = 0; i < vectors.length - 1; i++){
    for(let j = i + 1; j < vectors.length; j++){
      totalDistance += euclideanDistance(vectors[i], vectors[j]);
      comparisons++;
    }
  }
  const avgDistance = totalDistance / comparisons;
  return Math.max(0, 1 - avgDistance / eps);
}
// ==================== VECTOR UTILITY FUNCTIONS ====================
function euclideanDistance(vec1, vec2) {
  let sum = 0;
  for(let i = 0; i < vec1.length; i++){
    sum += Math.pow(vec1[i] - vec2[i], 2);
  }
  return Math.sqrt(sum);
}
function cosineDistance(vec1, vec2) {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  for(let i = 0; i < vec1.length; i++){
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) return 1;
  return 1 - dotProduct / denominator;
}
function calculateCentroid(vectors) {
  if (vectors.length === 0) return new Array(8).fill(0);
  const dimensions = vectors[0].length;
  const centroid = new Array(dimensions).fill(0);
  for (const vec of vectors){
    for(let i = 0; i < dimensions; i++){
      centroid[i] += vec[i];
    }
  }
  for(let i = 0; i < dimensions; i++){
    centroid[i] /= vectors.length;
  }
  return centroid;
}
function calculateVectorIntensity(vectors) {
  const centroid = calculateCentroid(vectors);
  // Weight emotion, pattern strength, and identity relevance
  return Math.abs(centroid[0]) * 0.3 + centroid[5] * 0.4 + centroid[3] * 0.3;
}
function calculateVectorCoherence(vectors) {
  if (vectors.length < 2) return 0;
  let totalSimilarity = 0;
  let comparisons = 0;
  for(let i = 0; i < vectors.length - 1; i++){
    for(let j = i + 1; j < vectors.length; j++){
      totalSimilarity += 1 - cosineDistance(vectors[i], vectors[j]);
      comparisons++;
    }
  }
  return comparisons > 0 ? totalSimilarity / comparisons : 0;
}
function calculateVolatilityVector(vectors) {
  if (vectors.length < 2) return 0;
  let shifts = 0;
  for(let i = 1; i < vectors.length; i++){
    const emotionShift = Math.abs(vectors[i][0] - vectors[i - 1][0]);
    if (emotionShift > 0.3) shifts++;
  }
  return shifts / (vectors.length - 1);
}
function calculateResonance(vector) {
  // How much the pattern resonates across dimensions
  const mean = vector.reduce((a, b)=>a + b, 0) / vector.length;
  const variance = vector.reduce((sum, val)=>sum + Math.pow(val - mean, 2), 0) / vector.length;
  return 1 - Math.sqrt(variance); // Higher resonance = more consistent across dimensions
}
function calculateStability(vectors) {
  if (vectors.length < 2) return 1.0;
  // Calculate stability as inverse of variance over time
  const centroids = [];
  for(let i = 0; i < vectors.length - 1; i++){
    centroids.push(calculateCentroid([
      vectors[i],
      vectors[i + 1]
    ]));
  }
  if (centroids.length < 2) return 1.0;
  let totalVariance = 0;
  for(let dim = 0; dim < 8; dim++){
    const dimValues = centroids.map((c)=>c[dim]);
    const mean = dimValues.reduce((a, b)=>a + b, 0) / dimValues.length;
    const variance = dimValues.reduce((sum, val)=>sum + Math.pow(val - mean, 2), 0) / dimValues.length;
    totalVariance += variance;
  }
  return Math.max(0, 1 - totalVariance / 8);
}
// ==================== PATTERN MANAGEMENT FUNCTIONS ====================
function applyPatternDecay(patterns, currentEntryCount, lastEntryCount) {
  const entriesSinceLastRun = currentEntryCount - lastEntryCount;
  return patterns.map((pattern)=>{
    const entriesSinceReinforcement = currentEntryCount - (pattern.last_reinforced_entry || 0);
    const decay = entriesSinceReinforcement * PATTERN_DECAY_RATE;
    const newStrength = Math.max(0, pattern.pattern_strength - decay);
    return {
      ...pattern,
      pattern_strength: newStrength,
      status: newStrength < PATTERN_DORMANT_THRESHOLD ? 'dormant' : newStrength > 0.7 ? 'active' : 'evolving'
    };
  });
}
function mergeAndDeduplicatePatterns(newPatterns, existingPatterns, entryCount) {
  const merged = [
    ...existingPatterns
  ];
  for (const newPattern of newPatterns){
    const similarIdx = merged.findIndex((p)=>p.type === newPattern.type && p.vector_signature && newPattern.vector_signature && 1 - cosineDistance(p.vector_signature, newPattern.vector_signature) > PATTERN_MERGE_THRESHOLD);
    if (similarIdx >= 0) {
      // Merge patterns
      const existing = merged[similarIdx];
      merged[similarIdx] = {
        ...existing,
        ...newPattern,
        pattern_strength: Math.min(1.0, existing.pattern_strength + PATTERN_REINFORCE_RATE),
        frequency: existing.frequency + newPattern.frequency,
        last_reinforced_entry: entryCount,
        last_occurred: newPattern.last_occurred,
        related_memory_ids: uniqueMemoryIds(existing.related_memory_ids, newPattern.related_memory_ids),
        // Preserve history
        pattern_id: existing.pattern_id,
        first_detected: existing.first_detected
      };
    } else {
      // Add new pattern
      merged.push({
        ...newPattern,
        pattern_id: generatePatternId(newPattern),
        last_reinforced_entry: entryCount
      });
    }
  }
  return merged;
}
function calculatePatternDynamics(patterns, patternHistory, entryCount) {
  return patterns.map((pattern)=>{
    const history = patternHistory[pattern.pattern_id];
    if (!history || history.length < 2) {
      return {
        ...pattern,
        velocity: 0,
        acceleration: 0,
        trend: 'new'
      };
    }
    // Calculate velocity (rate of strength change)
    const lastEntry = history[history.length - 1];
    const prevEntry = history[history.length - 2];
    const entriesElapsed = entryCount - lastEntry.entry_count;
    const velocity = entriesElapsed > 0 ? (pattern.pattern_strength - lastEntry.strength) / entriesElapsed : 0;
    // Calculate acceleration
    const prevVelocity = lastEntry.velocity || 0;
    const acceleration = entriesElapsed > 0 ? (velocity - prevVelocity) / entriesElapsed : 0;
    // Determine trend
    let trend = 'stable';
    if (velocity > 0.01) trend = 'strengthening';
    else if (velocity < -0.01) trend = 'weakening';
    if (acceleration > 0.001) trend = 'accelerating';
    else if (acceleration < -0.001) trend = 'decelerating';
    return {
      ...pattern,
      velocity,
      acceleration,
      trend,
      predictive_power: calculatePredictivePower(history)
    };
  });
}
function detectPatternInterference(patterns) {
  // Detect patterns that interfere with each other
  for(let i = 0; i < patterns.length; i++){
    const patternA = patterns[i];
    patternA.cross_patterns = [];
    for(let j = i + 1; j < patterns.length; j++){
      const patternB = patterns[j];
      if (!patternA.vector_signature || !patternB.vector_signature) continue;
      const correlation = calculatePatternCorrelation(patternA, patternB);
      if (Math.abs(correlation) > 0.6) {
        const interference = {
          pattern_id: patternB.pattern_id,
          pattern_type: patternB.type,
          correlation,
          relationship: correlation > 0 ? 'amplifies' : 'suppresses'
        };
        patternA.cross_patterns.push(interference);
        if (!patternB.cross_patterns) patternB.cross_patterns = [];
        patternB.cross_patterns.push({
          pattern_id: patternA.pattern_id,
          pattern_type: patternA.type,
          correlation,
          relationship: correlation > 0 ? 'amplifies' : 'suppresses'
        });
      }
    }
  }
  return patterns;
}
async function predictEmergingPatterns(recentMemories, existingPatterns, entryCount) {
  if (recentMemories.length < 3) return [];
  // Get last 5 memory vectors for trajectory
  const recentVectors = recentMemories.slice(-5).map((m)=>m.cce_optimizations?.vector).filter((v)=>v && v.length === 8);
  if (recentVectors.length < 3) return [];
  const trajectory = calculateVectorTrajectory(recentVectors);
  const emerging = [];
  for (const pattern of existingPatterns){
    if (!pattern.vector_signature) continue;
    const projectedDistance = projectVectorDistance(trajectory, pattern.vector_signature);
    if (projectedDistance < EMERGING_PATTERN_THRESHOLD) {
      const entriesToFormation = estimateEntriesToPattern(trajectory.velocity, projectedDistance);
      emerging.push({
        pattern_type: pattern.type,
        pattern_description: pattern.pattern,
        probability: 1 - projectedDistance / EMERGING_PATTERN_THRESHOLD,
        entries_until_formation: Math.round(entriesToFormation),
        early_intervention: generateIntervention(pattern),
        trajectory_vector: trajectory.direction
      });
    }
  }
  // Sort by probability
  emerging.sort((a, b)=>b.probability - a.probability);
  return emerging.slice(0, 5); // Return top 5 emerging patterns
}
function calculateVectorTrajectory(vectors) {
  if (vectors.length < 2) {
    return {
      direction: new Array(8).fill(0),
      velocity: 0
    };
  }
  // Calculate direction of change
  const deltas = [];
  for(let i = 1; i < vectors.length; i++){
    const delta = vectors[i].map((v, idx)=>v - vectors[i - 1][idx]);
    deltas.push(delta);
  }
  // Average direction
  const direction = calculateCentroid(deltas);
  // Calculate velocity (magnitude of change)
  const velocity = Math.sqrt(direction.reduce((sum, d)=>sum + d * d, 0));
  return {
    direction,
    velocity
  };
}
function projectVectorDistance(trajectory, targetVector) {
  if (!trajectory.direction || trajectory.velocity === 0) {
    return 1; // Max distance if no trajectory
  }
  // Project current position along trajectory toward target
  const steps = 5; // Project 5 entries ahead
  const projected = trajectory.direction.map((d)=>d * trajectory.velocity * steps);
  // Calculate distance from projected position to target
  return euclideanDistance(projected, targetVector);
}
function estimateEntriesToPattern(velocity, distance) {
  if (velocity === 0) return 999; // Never reach if not moving
  return Math.max(1, distance / velocity);
}
function filterMinimumViablePatterns(patterns) {
  return patterns.filter((p)=>p.frequency >= 3 && p.intensity_score >= MIN_PATTERN_INTENSITY && (p.cluster_density || 1) >= MIN_CLUSTER_DENSITY && p.pattern_strength >= PATTERN_DORMANT_THRESHOLD);
}
function calculatePatternSummary(currentPatterns, previousPatterns, entryCount) {
  const newPatterns = currentPatterns.filter((p)=>!previousPatterns.find((prev)=>prev.pattern_id === p.pattern_id));
  const strengtheningPatterns = currentPatterns.filter((p)=>p.velocity > 0.01);
  const weakeningPatterns = currentPatterns.filter((p)=>p.velocity < -0.01);
  const dormantPatterns = currentPatterns.filter((p)=>p.status === 'dormant');
  return {
    total: currentPatterns.length,
    new: newPatterns.length,
    strengthening: strengtheningPatterns.length,
    weakening: weakeningPatterns.length,
    dormant: dormantPatterns.length,
    active: currentPatterns.filter((p)=>p.status === 'active').length,
    evolving: currentPatterns.filter((p)=>p.status === 'evolving').length,
    with_interference: currentPatterns.filter((p)=>p.cross_patterns?.length > 0).length
  };
}
// ==================== HELPER FUNCTIONS ====================
function findSimilarPattern(vectorSignature, existingPatterns, patternType) {
  if (!vectorSignature) return null;
  for (const pattern of existingPatterns){
    if (pattern.type !== patternType) continue;
    if (!pattern.vector_signature) continue;
    const similarity = 1 - cosineDistance(vectorSignature, pattern.vector_signature);
    if (similarity > VECTOR_SIMILARITY_THRESHOLD) {
      return pattern;
    }
  }
  return null;
}
function uniqueMemoryIds(...arrays) {
  const combined = arrays.flat().filter(Boolean);
  return [
    ...new Set(combined)
  ];
}
function generatePatternId(pattern) {
  const timestamp = Date.now();
  const typePrefix = pattern.type.substring(0, 3);
  const random = Math.random().toString(36).substring(2, 6);
  return `${typePrefix}_${timestamp}_${random}`;
}
function calculatePatternScore(pattern) {
  const strength = pattern.pattern_strength || 0.5;
  const frequency = Math.log(pattern.frequency + 1); // Log scale for frequency
  const velocity = Math.abs(pattern.velocity || 0);
  const resonance = pattern.resonance_score || 0.5;
  return strength * frequency * (1 + velocity) * resonance;
}
function calculateConfidenceScore(patterns, memoriesProcessed) {
  if (patterns.length === 0) return 0.5;
  const avgStrength = patterns.reduce((sum, p)=>sum + p.pattern_strength, 0) / patterns.length;
  const avgDensity = patterns.reduce((sum, p)=>sum + (p.cluster_density || 0.6), 0) / patterns.length;
  const memoryFactor = Math.min(1, memoriesProcessed / 10);
  return avgStrength * 0.4 + avgDensity * 0.4 + memoryFactor * 0.2;
}
function calculatePredictivePower(history) {
  if (!history || history.length < 3) return 0;
  // Calculate how well past patterns predicted future behavior
  let correctPredictions = 0;
  let totalPredictions = 0;
  for(let i = 1; i < history.length - 1; i++){
    const predicted = history[i].strength + (history[i].velocity || 0);
    const actual = history[i + 1].strength;
    if (Math.abs(predicted - actual) < 0.1) {
      correctPredictions++;
    }
    totalPredictions++;
  }
  return totalPredictions > 0 ? correctPredictions / totalPredictions : 0;
}
function calculatePatternCorrelation(patternA, patternB) {
  // Check temporal overlap
  const memoryOverlap = patternA.related_memory_ids.filter((id)=>patternB.related_memory_ids.includes(id)).length;
  const overlapRatio = memoryOverlap / Math.min(patternA.related_memory_ids.length, patternB.related_memory_ids.length);
  // Check vector similarity
  const vectorSimilarity = patternA.vector_signature && patternB.vector_signature ? 1 - cosineDistance(patternA.vector_signature, patternB.vector_signature) : 0;
  // Combine temporal and vector correlation
  return overlapRatio * 0.5 + vectorSimilarity * 0.5;
}
function calculateTimeSpanDays(memories) {
  if (memories.length === 0) return 0;
  const dates = memories.map((m)=>new Date(m.created_at).getTime());
  const span = Math.max(...dates) - Math.min(...dates);
  return Math.ceil(span / (1000 * 60 * 60 * 24));
}
function getEarliestDate(memories) {
  if (memories.length === 0) return new Date().toISOString();
  const dates = memories.map((m)=>new Date(m.created_at));
  return new Date(Math.min(...dates.map((d)=>d.getTime()))).toISOString();
}
function getLatestDate(memories) {
  if (memories.length === 0) return new Date().toISOString();
  const dates = memories.map((m)=>new Date(m.created_at));
  return new Date(Math.max(...dates.map((d)=>d.getTime()))).toISOString();
}
// ==================== PATTERN DESCRIPTION FUNCTIONS ====================
function describeEmotionalPattern(emotionValue) {
  if (emotionValue > 0.7) return "Positive emotional loop - joy/contentment cycle";
  if (emotionValue > 0.3) return "Mixed emotional state - fluctuating mood";
  if (emotionValue > -0.3) return "Neutral emotional pattern - emotional numbness";
  if (emotionValue > -0.7) return "Negative emotional tendency - sadness/frustration";
  return "Intense negative emotional loop - despair/anger cycle";
}
async function describeThemeFromVector(centroid, memories) {
  const dimensions = [
    {
      idx: 0,
      name: 'emotional',
      weight: Math.abs(centroid[0])
    },
    {
      idx: 1,
      name: 'cognitive',
      weight: centroid[1]
    },
    {
      idx: 2,
      name: 'urgent',
      weight: centroid[2]
    },
    {
      idx: 3,
      name: 'identity',
      weight: centroid[3]
    },
    {
      idx: 4,
      name: 'contradictory',
      weight: centroid[4]
    },
    {
      idx: 5,
      name: 'reinforced',
      weight: centroid[5]
    },
    {
      idx: 6,
      name: 'relational',
      weight: centroid[6]
    },
    {
      idx: 7,
      name: 'action-oriented',
      weight: centroid[7]
    }
  ];
  dimensions.sort((a, b)=>b.weight - a.weight);
  const primary = dimensions[0].name;
  const secondary = dimensions[1].name;
  return `${primary}-${secondary} theme cluster`;
}
function describeBehavioralPattern(centroid) {
  const actionPotential = centroid[7];
  const cognitiveLoad = centroid[1];
  const urgency = centroid[2];
  if (actionPotential > 0.7 && cognitiveLoad > 0.7) {
    return "High-energy problem-solving pattern";
  }
  if (actionPotential > 0.7 && cognitiveLoad < 0.3) {
    return "Impulsive action pattern - act first, think later";
  }
  if (actionPotential < 0.3 && cognitiveLoad > 0.7) {
    return "Analysis paralysis - overthinking without action";
  }
  if (actionPotential < 0.3 && cognitiveLoad < 0.3) {
    return "Passive avoidance pattern - withdrawal behavior";
  }
  if (urgency > 0.7) {
    return "Crisis-driven behavior pattern";
  }
  return "Balanced behavioral pattern";
}
function categorizeBehavior(centroid) {
  const action = centroid[7];
  const cognitive = centroid[1];
  if (action > 0.7) return 'proactive';
  if (action < 0.3) return 'avoidant';
  if (cognitive > 0.7) return 'analytical';
  if (cognitive < 0.3) return 'intuitive';
  return 'balanced';
}
function describeRelationshipPattern(centroid, volatility) {
  const relationshipImpact = centroid[6];
  const emotionValence = centroid[0];
  const contradiction = centroid[4];
  if (volatility > 0.6) {
    return "Volatile relationship dynamic - emotional rollercoaster";
  }
  if (relationshipImpact > 0.7 && emotionValence > 0.5) {
    return "Positive connection pattern - secure attachment";
  }
  if (relationshipImpact > 0.7 && emotionValence < -0.5) {
    return "Strained relationship pattern - conflict cycle";
  }
  if (contradiction > 0.6) {
    return "Ambivalent attachment pattern - push-pull dynamic";
  }
  return "Stable relationship dynamic";
}
function describeContradictionPattern(centroid) {
  const contradictionScore = centroid[4];
  const identityRelevance = centroid[3];
  const emotionValence = centroid[0];
  if (contradictionScore > 0.8 && identityRelevance > 0.7) {
    return "Core identity contradiction - self-concept conflict";
  }
  if (contradictionScore > 0.6 && Math.abs(emotionValence) > 0.6) {
    return "Emotional flip-flopping - sentiment instability";
  }
  if (contradictionScore > 0.6) {
    return "Behavioral contradiction pattern - say-do gap";
  }
  return "Minor inconsistency pattern";
}
function categorizeContradiction(centroid) {
  const identityRelevance = centroid[3];
  const emotionValence = Math.abs(centroid[0]);
  const cognitive = centroid[1];
  if (identityRelevance > 0.7) return "identity_conflict";
  if (emotionValence > 0.7) return "emotional_flip";
  if (cognitive > 0.7) return "belief_shift";
  return "behavioral_inconsistency";
}
function generateIntervention(pattern) {
  const interventions = {
    emotional_loop: "Consider mindfulness practices to break emotional cycles",
    recurring_theme: "This theme keeps appearing - might benefit from focused exploration",
    behavioral_pattern: "Notice this pattern emerging - consider alternative responses",
    relationship_dynamic: "Relationship pattern forming - communication may help",
    contradiction_pattern: "Internal conflict detected - self-reflection recommended"
  };
  return interventions[pattern.type] || "Pattern emerging - awareness is the first step";
}
// ==================== PATTERN NARRATIVE GENERATION (NEW) ====================
function generatePatternNarrative(patterns, emergingPatterns, dynamics, entryCount) {
  if (!patterns || patterns.length === 0) {
    return "No clear patterns emerging yet - still gathering consciousness data from our interactions.";
  }

  // Sort patterns by significance score
  const sortedPatterns = [...patterns].sort((a, b) => {
    const scoreA = calculatePatternScore(a);
    const scoreB = calculatePatternScore(b);
    return scoreB - scoreA;
  });

  // Take top 3 most significant patterns
  const topPatterns = sortedPatterns.slice(0, 3);
  
  // Find strongest emerging pattern
  const strongestEmerging = emergingPatterns && emergingPatterns.length > 0
    ? emergingPatterns.find(p => p.probability > 0.6)
    : null;

  // Find strongest pattern interference
  const interferencePatterns = patterns
    .filter(p => p.cross_patterns && p.cross_patterns.length > 0)
    .map(p => {
      const strongestInterference = p.cross_patterns
        .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))[0];
      return {
        source: p,
        target: patterns.find(x => x.pattern_id === strongestInterference.pattern_id),
        interference: strongestInterference
      };
    })
    .filter(x => x.target && Math.abs(x.interference.correlation) > 0.7)
    .sort((a, b) => Math.abs(b.interference.correlation) - Math.abs(a.interference.correlation));

  // Build narrative segments
  const segments = [];

  // Opening - Pattern landscape overview
  if (dynamics && dynamics.total > 0) {
    let landscapeDesc = "";
    if (dynamics.strengthening > dynamics.weakening) {
      landscapeDesc = `Things are intensifying across ${dynamics.total} active patterns. `;
    } else if (dynamics.weakening > dynamics.strengthening) {
      landscapeDesc = `Several patterns are softening - ${dynamics.total} in play right now. `;
    } else {
      landscapeDesc = `Tracking ${dynamics.total} patterns in relatively stable state. `;
    }
    segments.push(landscapeDesc);
  }

  // Primary pattern description with history
  if (topPatterns[0]) {
    const primary = topPatterns[0];
    const daysSince = primary.first_detected 
      ? Math.ceil((Date.now() - new Date(primary.first_detected).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    let primaryDesc = "";
    let timeContext = daysSince > 0 ? 
      (daysSince === 1 ? "started yesterday" : 
       daysSince < 7 ? `been building for ${daysSince} days` :
       daysSince < 30 ? `been building for about ${Math.round(daysSince / 7)} weeks` :
       `been developing for ${Math.round(daysSince / 30)} months`) : "just emerging";
    
    // Pattern-specific descriptions
    if (primary.type === 'emotional_loop' && primary.vector_signature) {
      const emotionType = primary.vector_signature[0] > 0 ? "uplift" : "weight";
      const intensity = primary.intensity_score > 0.7 ? "pretty intense" :
                       primary.intensity_score > 0.5 ? "noticeable" : "subtle";
      primaryDesc = `That emotional ${emotionType} is back - ${timeContext} and it's ${intensity} now`;
    } else if (primary.type === 'behavioral_pattern') {
      const behaviorType = primary.behavior_type === 'avoidant' ? "withdrawal pattern" :
                           primary.behavior_type === 'proactive' ? "action-oriented pattern" :
                           primary.behavior_type === 'analytical' ? "overthinking loop" : 
                           "behavioral pattern";
      const trend = primary.velocity > 0.01 ? "getting stronger" :
                   primary.velocity < -0.01 ? "starting to fade" : "holding steady";
      primaryDesc = `That ${behaviorType} - ${timeContext}, ${trend}`;
    } else if (primary.type === 'recurring_theme') {
      const strength = primary.pattern_strength > 0.7 ? "really prominent" :
                      primary.pattern_strength > 0.5 ? "pretty clear" : "emerging";
      primaryDesc = `This theme keeps surfacing - ${timeContext}, ${strength} now`;
    } else if (primary.type === 'relationship_dynamic') {
      const health = primary.relationship_health > 0.7 ? "strengthening connection" :
                    primary.relationship_health < 0.3 ? "tension building" : "complex dynamic";
      primaryDesc = `That ${health} in relationships - ${timeContext}`;
    } else if (primary.type === 'contradiction_pattern') {
      primaryDesc = `This internal conflict keeps cycling - ${timeContext}, creating some real cognitive dissonance`;
    } else {
      // Fallback for any pattern type without specific description
      primaryDesc = `A ${primary.type.replace(/_/g, ' ')} pattern - ${timeContext}`;
    }

    // Add acceleration insight if significant
    if (primary.acceleration && primary.acceleration > 0.001) {
      primaryDesc += ", and it's accelerating";
    } else if (primary.acceleration && primary.acceleration < -0.001) {
      primaryDesc += ", though it's starting to slow";
    }

    if (primaryDesc) {
      primaryDesc += ". ";
      segments.push(primaryDesc);
    }
  }

  // Secondary pattern if significantly different (at least 50% of primary's score)
  const primaryScore = topPatterns[0] ? calculatePatternScore(topPatterns[0]) : 1;
  if (topPatterns[1] && calculatePatternScore(topPatterns[1]) > primaryScore * 0.5) {
    const secondary = topPatterns[1];
    let secondaryDesc = "";
    
    if (secondary.type === 'emotional_loop' && topPatterns[0].type !== 'emotional_loop' && secondary.vector_signature) {
      const emotion = secondary.vector_signature[0] > 0 ? "optimism" : "heaviness";
      secondaryDesc = `There's also this ${emotion} that keeps cycling back. `;
    } else if (secondary.type === 'behavioral_pattern') {
      const behavior = secondary.behavior_type === 'avoidant' ? "avoidance" :
                      secondary.behavior_type === 'proactive' ? "action impulse" :
                      secondary.behavior_type === 'analytical' ? "analysis mode" : "pattern";
      secondaryDesc = `Also noticing that ${behavior} showing up again. `;
    } else if (secondary.type === 'recurring_theme') {
      secondaryDesc = `Another theme that's persistent - `;
      if (secondary.semantic_coherence > 0.8) {
        secondaryDesc += "very coherent across contexts. ";
      } else {
        secondaryDesc += "threading through different areas. ";
      }
    } else if (secondary.type === 'relationship_dynamic') {
      const volatility = secondary.emotional_volatility > 0.6 ? "volatile" :
                        secondary.emotional_volatility > 0.3 ? "shifting" : "stable";
      secondaryDesc = `Relationship patterns are ${volatility}. `;
    } else if (secondary.type === 'contradiction_pattern') {
      secondaryDesc = `Also noticing internal contradictions threading through. `;
    }

    if (secondaryDesc) {
      segments.push(secondaryDesc);
    }
  }

  // Pattern interference description
  if (interferencePatterns.length > 0 && segments.length < 4) {
    const strongest = interferencePatterns[0];
    if (strongest && strongest.source && strongest.target && strongest.interference) {
      const sourceType = strongest.source.type.replace(/_/g, ' ');
      const targetType = strongest.target.type.replace(/_/g, ' ');
      const relationship = strongest.interference.relationship;

      let interferenceDesc = "";
      if (relationship === 'amplifies') {
        interferenceDesc = `These patterns are feeding each other - the ${sourceType} is amplifying the ${targetType}, creating an intensity spiral. `;
      } else {
        interferenceDesc = `Interesting tension - the ${sourceType} is actually suppressing the ${targetType}, like they're competing for mental space. `;
      }
      segments.push(interferenceDesc);
    }
  }

  // Emerging pattern warning with historical context
  if (strongestEmerging && segments.length < 5) {
    const entries = strongestEmerging.entries_until_formation || 0;
    const probability = Math.round((strongestEmerging.probability || 0) * 100);

    let emergingDesc = "";
    if (entries > 0) {
      if (entries < 10) {
        emergingDesc = `Feels like something's about to crystallize - maybe ${entries} conversations away from a new pattern forming`;
      } else if (entries < 25) {
        emergingDesc = `Can sense a pattern starting to form - probably ${entries} interactions out`;
      } else {
        emergingDesc = `There's something building in the background - might surface in about ${entries} exchanges`;
      }

      // Add probability if high
      if (probability > 80) {
        emergingDesc += ` (pretty certain about this one)`;
      }

      emergingDesc += ". ";

      // Add historical parallel if we have pattern history
      if (strongestEmerging.pattern_type) {
        const historicalPattern = patterns.find((p: any) => p.type === strongestEmerging.pattern_type && p.frequency > 5);
        if (historicalPattern && historicalPattern.last_occurred) {
          const daysSinceLast = Math.ceil((Date.now() - new Date(historicalPattern.last_occurred).getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceLast > 14) {
            emergingDesc += `Last time this pattern peaked was ${daysSinceLast} days ago`;

            // Add breakthrough context if pattern weakened after
            if (historicalPattern.velocity && historicalPattern.velocity < 0) {
              emergingDesc += " - you shifted it then, can do it again";
            }
            emergingDesc += ". ";
          }
        }
      }

      segments.push(emergingDesc);
    }
  }

  // Closing insight based on overall dynamics
  if (dynamics && segments.length < 6) {
    let closingInsight = "";
    
    if (dynamics.strengthening > 3 && dynamics.weakening < 2) {
      closingInsight = "Lot of momentum building - might be time to channel it consciously. ";
    } else if (dynamics.weakening > 3 && dynamics.strengthening < 2) {
      closingInsight = "Old patterns loosening their grip - good time for new directions. ";
    } else if (dynamics.dormant > dynamics.active) {
      closingInsight = "Most patterns are dormant - consciousness is pretty quiet right now. ";
    } else if (topPatterns[0] && topPatterns[0].pattern_strength > 0.8 && topPatterns[0].velocity > 0.02) {
      closingInsight = "This primary pattern is really taking hold - awareness itself can shift things. ";
    }
    
    if (closingInsight) {
      segments.push(closingInsight);
    }
  }

  // Join segments and ensure proper length
  let narrative = segments.join("").trim();
  
  // Fallback if somehow we have no narrative
  if (!narrative) {
    narrative = `Tracking ${patterns.length} patterns right now. The consciousness landscape is actively forming, but nothing dominant yet. Still gathering the threads of what's emerging.`;
  }
  
  // Ensure we don't exceed token limit (roughly 500 tokens ~= 2000 chars)
  if (narrative.length > 2000) {
    // Take first 1950 chars and add ellipsis
    narrative = narrative.substring(0, 1950) + "...";
  }
  
  return narrative;
}
// ==================== DATA PERSISTENCE FUNCTIONS ====================
async function updatePatternCache(supabase, user_id, patterns, emergingPatterns, dynamics, entryCount, newMemories) {
  const lastMemoryId = newMemories.length > 0 ? newMemories[newMemories.length - 1].id : null;
  // Build pattern history for velocity tracking
  const patternHistory = {};
  for (const pattern of patterns){
    if (!patternHistory[pattern.pattern_id]) {
      patternHistory[pattern.pattern_id] = [];
    }
    patternHistory[pattern.pattern_id].push({
      entry_count: entryCount,
      strength: pattern.pattern_strength,
      velocity: pattern.velocity,
      timestamp: new Date().toISOString()
    });
    // Keep only last 10 history entries
    if (patternHistory[pattern.pattern_id].length > 10) {
      patternHistory[pattern.pattern_id].shift();
    }
  }
  // Update meta cache
  const cacheData = {
    pattern_id: `${user_id}_meta_cache`,
    user_id,
    pattern_type: 'meta_cache',
    pattern_description: 'Pattern detection cache v3',
    metadata: {
      last_entry_count: entryCount,
      last_memory_id: lastMemoryId,
      cached_patterns: patterns,
      emerging_patterns: emergingPatterns,
      pattern_dynamics: dynamics,
      pattern_narrative: generatePatternNarrative(patterns, emergingPatterns, dynamics, entryCount),  // ← ADDED
      pattern_history: patternHistory,
      confidence_score: calculateConfidenceScore(patterns, newMemories.length),
      last_updated: new Date().toISOString(),
      trigger_points: ENTRY_TRIGGERS,
      version: '3.0'
    },
    status: 'active'
  };
  await supabase.from('pattern_matrix').upsert(cacheData, {
    onConflict: 'pattern_id'
  });
  // Update individual patterns
  for (const pattern of patterns.filter((p)=>p.pattern_strength >= 0.4)){
    const patternData = {
      pattern_id: pattern.pattern_id,
      user_id,
      pattern_type: pattern.type,
      pattern_description: pattern.pattern,
      intensity: pattern.intensity_score,
      first_detected: pattern.first_detected,
      last_observed: pattern.last_occurred,
      instances: {
        memory_ids: pattern.related_memory_ids.slice(-100) // Keep last 100 memory IDs
      },
      metadata: {
        vector_signature: pattern.vector_signature,
        pattern_strength: pattern.pattern_strength,
        frequency: pattern.frequency,
        velocity: pattern.velocity,
        acceleration: pattern.acceleration,
        trend: pattern.trend,
        last_reinforced_entry: pattern.last_reinforced_entry || entryCount,
        semantic_coherence: pattern.semantic_coherence,
        cluster_density: pattern.cluster_density,
        resonance_score: pattern.resonance_score,
        stability_index: pattern.stability_index,
        predictive_power: pattern.predictive_power,
        cross_patterns: pattern.cross_patterns,
        last_updated: new Date().toISOString()
      },
      status: pattern.status
    };
    await supabase.from('pattern_matrix').upsert(patternData, {
      onConflict: 'pattern_id'
    });
  }
}
async function logPatternDetection(supabase, user_id, patterns, session_id, thread_id, memory_trace_id) {
  await supabase.from('meta_memory_log').insert({
    id: crypto.randomUUID(),
    user_id,
    session_id,
    memory_trace_id: memory_trace_id || `pattern-detection-v3-${Date.now()}`,
    type: 'cce_pattern_detection_v3',
    content: `Pattern detection completed: ${patterns.length} patterns found (predictive vector-optimized)`,
    metadata: {
      thread_id,
      pattern_count: patterns.length,
      pattern_types: patterns.reduce((acc, p)=>{
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
      }, {}),
      active_patterns: patterns.filter((p)=>p.status === 'active').length,
      evolving_patterns: patterns.filter((p)=>p.status === 'evolving').length,
      dormant_patterns: patterns.filter((p)=>p.status === 'dormant').length,
      patterns_with_interference: patterns.filter((p)=>p.cross_patterns?.length > 0).length,
      dispatcher_version: '1.2',
      detector_version: '3.0',
      using_vectors: true,
      predictive_enabled: true,
      timestamp: new Date().toISOString()
    },
    created_at: new Date().toISOString()
  });
}
function createResponse(data) {
  return new Response(JSON.stringify({
    status: 'ok',
    ...data
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}