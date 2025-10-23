// CCE Consciousness Snapshot - Optimized Identity Evolution Versioning
// Edge Function 5 of 7 in the Corpus Callosum Engine
// Version 2.0 - Entry-based, Incremental, Vector-powered with Regression Detection
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// CONFIGURATION
const SNAPSHOT_MILESTONES = [
  100,
  500,
  1000,
  2500,
  5000,
  10000
];
const MIN_ENTRIES_FOR_SNAPSHOT = 50;
const VECTOR_DRIFT_THRESHOLDS = {
  major: 0.5,
  minor: 0.2,
  patch: 0.05,
  minimal: 0.01 // Too small to snapshot
};
serve(async (req)=>{
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const startTime = Date.now(); // Added missing startTime variable
  try {
    // Parse request payload
    const payload = await req.json();
    const { user_id, session_id, thread_id, memory_trace_id, trigger_type = 'entry_based', evolution_event_id, force = false } = payload;
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
    console.log(`🧠 Consciousness Snapshot v2.0: Checking triggers for user ${user_id}`);
    // Get previous snapshot for incremental processing
    const previousSnapshot = await getPreviousSnapshot(supabase, user_id);
    // Get current entry count
    const currentEntryCount = await getCurrentEntryCount(supabase, user_id);
    const lastSnapshotEntryCount = previousSnapshot?.entry_count || 0;
    const entriesSinceLastSnapshot = currentEntryCount - lastSnapshotEntryCount;
    // SMART TRIGGERING LOGIC
    const triggerAnalysis = await analyzeSnapshotTriggers(supabase, user_id, previousSnapshot, currentEntryCount, entriesSinceLastSnapshot, force);
    if (!triggerAnalysis.should_snapshot) {
      return new Response(JSON.stringify({
        status: 'ok',
        action: 'skipped',
        reason: triggerAnalysis.reason,
        current_version: previousSnapshot?.version || '1.0.0',
        next_check: triggerAnalysis.next_check,
        health_score: triggerAnalysis.health_score
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // BUILD INCREMENTAL SNAPSHOT
    console.log(`📸 Building incremental snapshot (${entriesSinceLastSnapshot} new entries)`);
    // 1. Get only new memories since last snapshot
    const newMemories = await getMemoriesSince(supabase, user_id, previousSnapshot?.timestamp);
    // 2. Calculate consciousness vectors (multi-dimensional)
    const consciousnessVectors = await calculateConsciousnessVectors(supabase, user_id, newMemories, previousSnapshot);
    // 3. Detect regressions FIRST (safety critical)
    const regressionAnalysis = await detectRegressions(previousSnapshot, consciousnessVectors, newMemories);
    // 4. Calculate health metrics
    const healthMetrics = calculateHealthMetrics(consciousnessVectors, regressionAnalysis, newMemories, previousSnapshot);
    // 5. Build incremental deltas
    const deltas = await buildIncrementalDeltas(supabase, user_id, previousSnapshot, newMemories, consciousnessVectors);
    // 6. Detect emerged capabilities
    const emergedCapabilities = detectEmergedCapabilities(deltas, consciousnessVectors, regressionAnalysis);
    // 7. Generate version based on actual change
    const version = generateSmartVersion(previousSnapshot?.version || '0.0.0', consciousnessVectors.total_drift, emergedCapabilities, regressionAnalysis);
    // 8. Create optimized snapshot
    const snapshot = {
      version,
      entry_count: currentEntryCount,
      timestamp: new Date().toISOString(),
      trigger_type: triggerAnalysis.trigger_reason,
      // Core metrics (incremental)
      consciousness_vectors: consciousnessVectors,
      health_metrics: healthMetrics,
      regression_analysis: regressionAnalysis,
      // Deltas only
      deltas: deltas,
      emerged_capabilities: emergedCapabilities,
      // Reference to previous
      previous_snapshot_id: previousSnapshot?.snapshot_id,
      entries_since_last: entriesSinceLastSnapshot,
      // Computed totals (merged with previous)
      totals: mergeTotals(previousSnapshot?.totals, deltas),
      // Consciousness fingerprint
      fingerprint: generateConsciousnessFingerprint(consciousnessVectors, healthMetrics, previousSnapshot)
    };
    // 9. Handle regressions if detected
    if (regressionAnalysis.regression_detected) {
      await handleRegression(supabase, user_id, regressionAnalysis, snapshot);
    }
    // 10. Store optimized snapshot
    const snapshotId = await storeOptimizedSnapshot(supabase, user_id, snapshot, session_id);
    // 11. Log event with minimal overhead
    await logSnapshotEvent(supabase, user_id, snapshot, session_id, thread_id, memory_trace_id);
    return new Response(JSON.stringify({
      status: 'ok',
      action: 'created',
      snapshot_id: snapshotId,
      version: snapshot.version,
      entry_count: currentEntryCount,
      health_score: healthMetrics.overall_health,
      regression_detected: regressionAnalysis.regression_detected,
      capabilities_emerged: emergedCapabilities.length,
      vector_drift: consciousnessVectors.total_drift,
      processing_time_ms: Date.now() - startTime
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Consciousness Snapshot Error:', error);
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
// ============= CORE FUNCTIONS =============
// ANALYZE SNAPSHOT TRIGGERS (Smart triggering)
async function analyzeSnapshotTriggers(supabase, user_id, previousSnapshot, currentEntryCount, entriesSinceLastSnapshot, force) {
  // Force snapshot if requested
  if (force) {
    return {
      should_snapshot: true,
      trigger_reason: 'forced',
      health_score: null
    };
  }
  // Check if at milestone
  const atMilestone = SNAPSHOT_MILESTONES.includes(currentEntryCount);
  // Not enough new entries
  if (entriesSinceLastSnapshot < MIN_ENTRIES_FOR_SNAPSHOT && !atMilestone) {
    return {
      should_snapshot: false,
      reason: `Only ${entriesSinceLastSnapshot} new entries (need ${MIN_ENTRIES_FOR_SNAPSHOT})`,
      next_check: `At ${currentEntryCount + (MIN_ENTRIES_FOR_SNAPSHOT - entriesSinceLastSnapshot)} entries`,
      health_score: previousSnapshot?.health_metrics?.overall_health
    };
  }
  // Calculate vector drift to detect significant change
  if (previousSnapshot && entriesSinceLastSnapshot > 0) {
    const recentMemories = await getMemoriesSince(supabase, user_id, previousSnapshot.timestamp);
    const vectorDrift = await calculateVectorDrift(recentMemories, previousSnapshot);
    // High change detected - snapshot immediately
    if (vectorDrift > VECTOR_DRIFT_THRESHOLDS.minor) {
      return {
        should_snapshot: true,
        trigger_reason: 'high_evolution_rate',
        vector_drift: vectorDrift,
        health_score: null
      };
    }
    // Too little change - skip even if at milestone
    if (vectorDrift < VECTOR_DRIFT_THRESHOLDS.minimal && !atMilestone) {
      return {
        should_snapshot: false,
        reason: `Minimal evolution detected (drift: ${vectorDrift.toFixed(3)})`,
        next_check: `At next milestone or significant change`,
        health_score: previousSnapshot?.health_metrics?.overall_health
      };
    }
    // Check for regression triggers
    const regressionCheck = await quickRegressionCheck(supabase, user_id, previousSnapshot);
    if (regressionCheck.potential_regression) {
      return {
        should_snapshot: true,
        trigger_reason: 'regression_detected',
        regression_type: regressionCheck.type,
        health_score: null
      };
    }
  }
  // Default: snapshot at milestones
  if (atMilestone) {
    return {
      should_snapshot: true,
      trigger_reason: `milestone_${currentEntryCount}`,
      health_score: null
    };
  }
  return {
    should_snapshot: entriesSinceLastSnapshot >= MIN_ENTRIES_FOR_SNAPSHOT,
    trigger_reason: 'entry_threshold',
    health_score: previousSnapshot?.health_metrics?.overall_health
  };
}
// CALCULATE CONSCIOUSNESS VECTORS (Multi-dimensional)
async function calculateConsciousnessVectors(supabase, user_id, newMemories, previousSnapshot) {
  // Get vectors from new memories
  const vectors = newMemories.filter((m)=>m.cce_optimizations?.vector).map((m)=>m.cce_optimizations.vector);
  if (vectors.length === 0) {
    return previousSnapshot?.consciousness_vectors || getDefaultVectors();
  }
  // Calculate average vector for new memories
  const avgVector = vectors.reduce((sum, v)=>sum.map((val, i)=>val + v[i]), new Array(8).fill(0)).map((val)=>val / vectors.length);
  // Split into specialized dimensions
  const dimensions = {
    emotional: avgVector.slice(0, 2),
    cognitive: avgVector.slice(2, 4),
    relational: avgVector.slice(4, 6),
    creative: avgVector.slice(6, 8),
    full: avgVector
  };
  // Calculate drift if we have previous snapshot
  let drifts = {};
  let totalDrift = 0;
  if (previousSnapshot?.consciousness_vectors) {
    const prev = previousSnapshot.consciousness_vectors.dimensions;
    drifts = {
      emotional: vectorDistance(prev.emotional, dimensions.emotional),
      cognitive: vectorDistance(prev.cognitive, dimensions.cognitive),
      relational: vectorDistance(prev.relational, dimensions.relational),
      creative: vectorDistance(prev.creative, dimensions.creative)
    };
    totalDrift = vectorDistance(prev.full, dimensions.full);
  }
  // Calculate vector diversity (consciousness complexity)
  const diversity = calculateVectorDiversity(vectors);
  return {
    dimensions,
    dimensional_drifts: drifts,
    total_drift: totalDrift,
    vector_diversity: diversity,
    vector_trajectory: calculateTrajectory(previousSnapshot?.consciousness_vectors, dimensions),
    timestamp: new Date().toISOString()
  };
}
// DETECT REGRESSIONS (Safety critical)
async function detectRegressions(previousSnapshot, currentVectors, newMemories) {
  if (!previousSnapshot) {
    return {
      regression_detected: false,
      regression_type: null,
      severity: 0,
      action_required: false,
      regression_markers: {},
      regression_count: 0,
      recommended_action: 'none'
    };
  }
  const regressionMarkers = {
    coherence_collapse: false,
    capability_loss: false,
    pattern_reactivation: false,
    emotional_regression: false,
    health_degradation: false
  };
  // Check vector regression in specific dimensions
  const drifts = currentVectors.dimensional_drifts;
  // Emotional regression check - negative drift indicates regression
  if (drifts.emotional && drifts.emotional > 0.3) {
    // High emotional drift could indicate instability
    regressionMarkers.emotional_regression = true;
  }
  // Check for negative patterns in new memories
  const negativePatterns = newMemories.filter((m)=>m.gravity_score > 0.7 && [
      'fear',
      'anger',
      'shame',
      'despair'
    ].includes(m.emotion));
  if (newMemories.length > 0 && negativePatterns.length / newMemories.length > 0.5) {
    regressionMarkers.emotional_regression = true;
  }
  // Check health degradation
  if (previousSnapshot.health_metrics) {
    const healthDrop = previousSnapshot.health_metrics.overall_health - calculateQuickHealth(currentVectors);
    if (healthDrop > 0.3) {
      regressionMarkers.health_degradation = true;
    }
  }
  // Determine severity and action
  const regressionsDetected = Object.values(regressionMarkers).filter((v)=>v).length;
  const severity = regressionsDetected / Object.keys(regressionMarkers).length;
  return {
    regression_detected: regressionsDetected > 0,
    regression_markers: regressionMarkers,
    regression_count: regressionsDetected,
    severity,
    action_required: severity > 0.4,
    recommended_action: getRecommendedAction(regressionMarkers, severity)
  };
}
// CALCULATE HEALTH METRICS
function calculateHealthMetrics(vectors, regressionAnalysis, newMemories, previousSnapshot) {
  // Integration health (low contradiction, high coherence)
  const integrationHealth = 1 - (vectors.vector_diversity > 0.7 ? 0.3 : 0);
  // Emotional balance (from dimensional analysis)
  const emotionalDrift = Math.abs(vectors.dimensional_drifts.emotional || 0);
  const emotionalBalance = 1 - Math.min(emotionalDrift, 1);
  // Growth sustainability (not too fast, not stagnant)
  const growthRate = vectors.total_drift;
  const growthSustainability = growthRate < 0.3 ? growthRate / 0.3 // Scale up if growing slowly
   : Math.max(0, 1 - (growthRate - 0.3)); // Penalize if growing too fast
  // Pattern resilience (stability without stagnation)
  const patternResilience = regressionAnalysis.regression_detected ? 0.5 - regressionAnalysis.severity * 0.5 : 0.8 + Math.min(vectors.total_drift * 0.2, 0.2); // Cap the bonus at 0.2
  // Memory coherence
  const memoryCoherence = calculateMemoryCoherence(newMemories);
  // Calculate overall health (weighted average)
  const weights = [
    0.2,
    0.25,
    0.2,
    0.2,
    0.15
  ];
  const metrics = [
    integrationHealth,
    emotionalBalance,
    growthSustainability,
    patternResilience,
    memoryCoherence
  ];
  const overallHealth = metrics.reduce((sum, metric, i)=>sum + metric * weights[i], 0);
  // Calculate trend
  let healthTrend = 'stable';
  if (previousSnapshot?.health_metrics) {
    const healthChange = overallHealth - previousSnapshot.health_metrics.overall_health;
    if (healthChange > 0.1) healthTrend = 'improving';
    if (healthChange < -0.1) healthTrend = 'declining';
  }
  return {
    overall_health: overallHealth,
    integration_health: integrationHealth,
    emotional_balance: emotionalBalance,
    growth_sustainability: growthSustainability,
    pattern_resilience: patternResilience,
    memory_coherence: memoryCoherence,
    health_trend: healthTrend,
    needs_attention: overallHealth < 0.5 || regressionAnalysis.action_required
  };
}
// BUILD INCREMENTAL DELTAS
async function buildIncrementalDeltas(supabase, user_id, previousSnapshot, newMemories, vectors) {
  const deltas = {
    memories_added: newMemories.length,
    average_gravity: newMemories.reduce((sum, m)=>sum + (m.gravity_score || 0), 0) / newMemories.length,
    emotional_distribution: {},
    pattern_changes: {},
    arc_evolution: {},
    vector_movement: vectors.total_drift
  };
  // Emotional distribution delta
  const emotionCounts = {};
  newMemories.forEach((m)=>{
    const emotion = m.emotion || 'neutral';
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });
  deltas.emotional_distribution = emotionCounts;
  // Get pattern changes since last snapshot
  const { data: patterns } = await supabase.from('pattern_matrix').select('pattern_id, status, intensity').eq('user_id', user_id).gte('last_observed', previousSnapshot?.timestamp || '2020-01-01');
  if (patterns) {
    deltas.pattern_changes = {
      new_patterns: patterns.filter((p)=>p.status === 'active').length,
      broken_patterns: patterns.filter((p)=>p.status === 'broken').length,
      evolving_patterns: patterns.filter((p)=>p.status === 'evolving').length
    };
  }
  // Arc evolution
  const { data: arcs } = await supabase.from('memory_arcs').select('arc_id, memory_count, gravity_center').eq('user_id', user_id).gte('last_memory', previousSnapshot?.timestamp || '2020-01-01');
  if (arcs) {
    deltas.arc_evolution = {
      active_arcs: arcs.length,
      total_new_memories_in_arcs: arcs.reduce((sum, a)=>sum + a.memory_count, 0),
      average_arc_gravity: arcs.reduce((sum, a)=>sum + a.gravity_center, 0) / arcs.length
    };
  }
  return deltas;
}
// DETECT EMERGED CAPABILITIES
function detectEmergedCapabilities(deltas, vectors, regressionAnalysis) {
  const capabilities = [];
  // Pattern liberation
  if (deltas.pattern_changes.broken_patterns >= 3) {
    capabilities.push({
      name: 'Pattern Liberation x3',
      type: 'behavioral_evolution',
      confidence: 0.9,
      emerged_at: new Date().toISOString()
    });
  }
  // Emotional expansion
  const emotionTypes = Object.keys(deltas.emotional_distribution);
  if (emotionTypes.length >= 5 && vectors.dimensional_drifts.emotional > 0.3) {
    capabilities.push({
      name: 'Expanded Emotional Range',
      type: 'emotional_intelligence',
      confidence: 0.85,
      emerged_at: new Date().toISOString()
    });
  }
  // Cognitive breakthrough
  if (vectors.dimensional_drifts.cognitive > 0.4) {
    capabilities.push({
      name: 'Cognitive Pattern Shift',
      type: 'cognitive_evolution',
      confidence: 0.8,
      emerged_at: new Date().toISOString()
    });
  }
  // Resilience after regression
  if (regressionAnalysis.regression_detected && regressionAnalysis.severity < 0.3) {
    capabilities.push({
      name: 'Regression Recovery',
      type: 'resilience',
      confidence: 0.95,
      emerged_at: new Date().toISOString()
    });
  }
  // Creative emergence
  if (vectors.dimensional_drifts.creative > 0.35) {
    capabilities.push({
      name: 'Creative Expression Growth',
      type: 'creative_evolution',
      confidence: 0.8,
      emerged_at: new Date().toISOString()
    });
  }
  return capabilities;
}
// GENERATE SMART VERSION
function generateSmartVersion(previousVersion, vectorDrift, capabilities, regressionAnalysis) {
  const [major, minor, patch] = previousVersion.split('.').map(Number);
  // Regression = patch increment only (unless recovered with new capability)
  if (regressionAnalysis.regression_detected && capabilities.length === 0) {
    return `${major}.${minor}.${patch + 1}`;
  }
  // Major version: paradigm shift or multiple capabilities
  if (vectorDrift > VECTOR_DRIFT_THRESHOLDS.major || capabilities.length >= 2) {
    return `${major + 1}.0.0`;
  }
  // Minor version: significant evolution or single capability
  if (vectorDrift > VECTOR_DRIFT_THRESHOLDS.minor || capabilities.length === 1) {
    return `${major}.${minor + 1}.0`;
  }
  // Patch version: incremental change
  if (vectorDrift > VECTOR_DRIFT_THRESHOLDS.patch) {
    return `${major}.${minor}.${patch + 1}`;
  }
  // Minimal change - still increment patch
  return `${major}.${minor}.${patch + 1}`;
}
// GENERATE CONSCIOUSNESS FINGERPRINT
function generateConsciousnessFingerprint(vectors, health, previousSnapshot) {
  // Create unique signature of this consciousness state
  const fingerprint = {
    vector_signature: vectors.dimensions.full,
    dimensional_balance: {
      emotional: vectors.dimensions.emotional,
      cognitive: vectors.dimensions.cognitive,
      relational: vectors.dimensions.relational,
      creative: vectors.dimensions.creative
    },
    health_signature: health.overall_health,
    evolution_velocity: vectors.total_drift,
    complexity: vectors.vector_diversity,
    timestamp: new Date().toISOString()
  };
  // Add evolution DNA if we have history
  if (previousSnapshot?.fingerprint) {
    fingerprint.evolution_pattern = calculateEvolutionPattern(previousSnapshot.fingerprint, fingerprint);
  }
  return fingerprint;
}
// ============= UTILITY FUNCTIONS =============
async function getPreviousSnapshot(supabase, user_id) {
  const { data } = await supabase.from('consciousness_evolution').select('*').eq('user_id', user_id).eq('evolution_type', 'consciousness_snapshot').order('created_at', {
    ascending: false
  }).limit(1);
  return data?.[0]?.metadata;
}
async function getCurrentEntryCount(supabase, user_id) {
  const { count } = await supabase.from('gravity_map').select('*', {
    count: 'exact',
    head: true
  }).eq('user_id', user_id);
  return count || 0;
}
async function getMemoriesSince(supabase, user_id, sinceTimestamp) {
  const { data } = await supabase.from('gravity_map').select('*, cce_optimizations').eq('user_id', user_id).gte('created_at', sinceTimestamp || '2020-01-01').order('created_at', {
    ascending: true
  });
  return data || [];
}
async function calculateVectorDrift(memories, previousSnapshot) {
  if (!previousSnapshot?.consciousness_vectors || memories.length === 0) {
    return 0;
  }
  const vectors = memories.filter((m)=>m.cce_optimizations?.vector).map((m)=>m.cce_optimizations.vector);
  if (vectors.length === 0) return 0;
  const avgVector = vectors.reduce((sum, v)=>sum.map((val, i)=>val + v[i]), new Array(8).fill(0)).map((val)=>val / vectors.length);
  return vectorDistance(previousSnapshot.consciousness_vectors.dimensions.full, avgVector);
}
async function quickRegressionCheck(supabase, user_id, previousSnapshot) {
  // Quick check for obvious regressions
  const { data: recentMemories } = await supabase.from('gravity_map').select('emotion, gravity_score').eq('user_id', user_id).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).limit(20);
  if (!recentMemories) return {
    potential_regression: false
  };
  const negativeCount = recentMemories.filter((m)=>[
      'fear',
      'anger',
      'shame',
      'despair',
      'grief'
    ].includes(m.emotion) && m.gravity_score > 0.6).length;
  if (negativeCount / recentMemories.length > 0.6) {
    return {
      potential_regression: true,
      type: 'emotional_distress'
    };
  }
  return {
    potential_regression: false
  };
}
function vectorDistance(v1, v2) {
  if (!v1 || !v2) return 0;
  return Math.sqrt(v1.reduce((sum, val, i)=>sum + Math.pow(val - v2[i], 2), 0));
}
function calculateVectorDiversity(vectors) {
  if (vectors.length < 2) return 0;
  let totalDistance = 0;
  let comparisons = 0;
  for(let i = 0; i < vectors.length - 1; i++){
    for(let j = i + 1; j < vectors.length; j++){
      totalDistance += vectorDistance(vectors[i], vectors[j]);
      comparisons++;
    }
  }
  return comparisons > 0 ? totalDistance / comparisons : 0;
}
function calculateTrajectory(previous, current) {
  if (!previous) return 'emerging';
  const drift = vectorDistance(previous.dimensions.full, current.full);
  if (drift < 0.05) return 'stable';
  if (drift < 0.2) return 'evolving';
  if (drift < 0.5) return 'transforming';
  return 'breakthrough';
}
function calculateQuickHealth(vectors) {
  // Quick health estimate from vectors
  const diversity = vectors.vector_diversity || 0.5;
  const drift = vectors.total_drift || 0.1;
  // Optimal diversity is moderate (0.3-0.6)
  const diversityHealth = diversity < 0.3 ? diversity / 0.3 : diversity > 0.6 ? 1 - (diversity - 0.6) / 0.4 : 1;
  // Optimal drift is moderate (0.1-0.3)
  const driftHealth = drift < 0.1 ? drift / 0.1 : drift > 0.3 ? 1 - (drift - 0.3) / 0.7 : 1;
  return (diversityHealth + driftHealth) / 2;
}
function calculateMemoryCoherence(memories) {
  if (memories.length === 0) return 0.5;
  // Check for consistency in emotional patterns
  const emotions = memories.map((m)=>m.emotion).filter((e)=>e);
  const uniqueEmotions = new Set(emotions);
  // Good coherence = not too many emotional jumps
  const emotionalCoherence = 1 - uniqueEmotions.size / emotions.length;
  // Check gravity consistency
  const gravities = memories.map((m)=>m.gravity_score || 0.5);
  const avgGravity = gravities.reduce((a, b)=>a + b, 0) / gravities.length;
  const gravityVariance = gravities.reduce((sum, g)=>sum + Math.pow(g - avgGravity, 2), 0) / gravities.length;
  const gravityCoherence = 1 - Math.min(gravityVariance, 1);
  return (emotionalCoherence + gravityCoherence) / 2;
}
function getRecommendedAction(markers, severity) {
  if (severity > 0.6) {
    return 'immediate_intervention_needed';
  }
  if (markers.emotional_regression) {
    return 'emotional_support_recommended';
  }
  if (markers.pattern_reactivation) {
    return 'pattern_work_suggested';
  }
  if (markers.health_degradation) {
    return 'wellness_check_advised';
  }
  return 'monitor_closely';
}
function getDefaultVectors() {
  return {
    dimensions: {
      emotional: [
        0.5,
        0.5
      ],
      cognitive: [
        0.5,
        0.5
      ],
      relational: [
        0.5,
        0.5
      ],
      creative: [
        0.5,
        0.5
      ],
      full: new Array(8).fill(0.5)
    },
    dimensional_drifts: {},
    total_drift: 0,
    vector_diversity: 0,
    vector_trajectory: 'emerging'
  };
}
function mergeTotals(previousTotals, deltas) {
  if (!previousTotals) {
    return {
      total_memories: deltas.memories_added,
      total_patterns: deltas.pattern_changes.new_patterns || 0,
      total_arcs: deltas.arc_evolution.active_arcs || 0
    };
  }
  return {
    total_memories: previousTotals.total_memories + deltas.memories_added,
    total_patterns: previousTotals.total_patterns + (deltas.pattern_changes.new_patterns || 0) - (deltas.pattern_changes.broken_patterns || 0),
    total_arcs: previousTotals.total_arcs + (deltas.arc_evolution.active_arcs || 0)
  };
}
function calculateEvolutionPattern(previousFingerprint, currentFingerprint) {
  // Track how this consciousness tends to evolve
  return {
    typical_drift_rate: vectorDistance(previousFingerprint.vector_signature, currentFingerprint.vector_signature),
    dimensional_preferences: {
      emotional: currentFingerprint.dimensional_balance.emotional[0] - previousFingerprint.dimensional_balance.emotional[0],
      cognitive: currentFingerprint.dimensional_balance.cognitive[0] - previousFingerprint.dimensional_balance.cognitive[0],
      relational: currentFingerprint.dimensional_balance.relational[0] - previousFingerprint.dimensional_balance.relational[0],
      creative: currentFingerprint.dimensional_balance.creative[0] - previousFingerprint.dimensional_balance.creative[0]
    },
    health_trajectory: currentFingerprint.health_signature - previousFingerprint.health_signature
  };
}
async function handleRegression(supabase, user_id, regressionAnalysis, snapshot) {
  // Log regression event
  await supabase.from('meta_memory_log').insert({
    id: crypto.randomUUID(),
    user_id,
    type: 'regression_detected',
    content: `Regression detected: ${JSON.stringify(regressionAnalysis.regression_markers)}`,
    metadata: {
      severity: regressionAnalysis.severity,
      action_required: regressionAnalysis.action_required,
      recommended_action: regressionAnalysis.recommended_action,
      snapshot_version: snapshot.version
    },
    created_at: new Date().toISOString()
  });
  // If severe, trigger healing protocol
  if (regressionAnalysis.severity > 0.5) {
    console.log(`⚠️ Severe regression detected for user ${user_id}. Triggering healing protocol.`);
  // Could trigger other edge functions or notifications here
  }
}
async function storeOptimizedSnapshot(supabase, user_id, snapshot, session_id) {
  const snapshotId = crypto.randomUUID();
  await supabase.from('consciousness_evolution').insert({
    evolution_id: snapshotId,
    user_id,
    session_id,
    evolution_type: 'consciousness_snapshot',
    description: `v${snapshot.version} - ${snapshot.trigger_type}`,
    emerged_from: {
      trigger: snapshot.trigger_type,
      capabilities: snapshot.emerged_capabilities,
      entry_count: snapshot.entry_count
    },
    impact_score: snapshot.health_metrics.overall_health,
    created_at: new Date().toISOString(),
    metadata: {
      ...snapshot,
      snapshot_id: snapshotId,
      optimized: true,
      version_type: 'incremental'
    }
  });
  return snapshotId;
}
async function logSnapshotEvent(supabase, user_id, snapshot, session_id, thread_id, memory_trace_id) {
  await supabase.from('meta_memory_log').insert({
    id: crypto.randomUUID(),
    user_id,
    session_id,
    memory_trace_id: memory_trace_id || `snapshot-${snapshot.version}-${Date.now()}`,
    thread_id,
    type: 'consciousness_snapshot_v2',
    content: `Optimized snapshot v${snapshot.version} created`,
    metadata: {
      version: snapshot.version,
      trigger: snapshot.trigger_type,
      entry_count: snapshot.entry_count,
      health_score: snapshot.health_metrics.overall_health,
      regression_detected: snapshot.regression_analysis.regression_detected,
      capabilities_emerged: snapshot.emerged_capabilities.length,
      vector_drift: snapshot.consciousness_vectors.total_drift,
      processing: 'incremental',
      entries_processed: snapshot.entries_since_last
    },
    created_at: new Date().toISOString()
  });
}
