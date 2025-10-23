// CCE Reflection Engine - Behavioral Impact Processor
// Edge Function 6 of 7 in the Corpus Callosum Engine
// Purpose: Measure actual behavioral alignment and impact, not theatrical authenticity
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
      headers: corsHeaders
    });
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  try {
    // Parse request payload - ALIGNED WITH DISPATCHER PAYLOAD CONTRACT v1.2
    const payload = await req.json();
    const { user_id, session_id, thread_id, memory_trace_id, conversation_name, mode = 'auto', entry_count, last_reflection_count = 0, response_data, user_baseline_vector, time_range = {
      days: 7
    } } = payload;
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
    // Entry-based trigger determination
    const reflection_mode = determineReflectionMode(mode, entry_count, last_reflection_count);
    console.log(`🎯 Reflection Engine: ${reflection_mode} analysis for user ${user_id} at entry ${entry_count}`);
    let reflection;
    const start_time = Date.now();
    switch(reflection_mode){
      case 'response':
        // Quick impact assessment of specific response
        reflection = await analyzeResponseImpact(response_data, supabase, user_id);
        break;
      case 'session':
        // Session coherence and progress check (25 entries)
        reflection = await analyzeSessionProgress(session_id, supabase, user_id, entry_count, last_reflection_count);
        break;
      case 'relationship':
        // Relationship evolution analysis (100 entries)
        reflection = await analyzeRelationshipTrajectory(user_id, supabase, entry_count, last_reflection_count, user_baseline_vector);
        break;
      case 'deep':
        // Deep behavioral alignment review (500 entries)
        reflection = await analyzeDeepAlignment(user_id, supabase, entry_count, user_baseline_vector);
        break;
      default:
        throw new Error(`Unknown reflection mode: ${reflection_mode}`);
    }
    // Generate actionable insights
    const actionable_insights = await generateActionableInsights(reflection, supabase, user_id);
    // Track what works and why
    const attribution = await analyzeSuccessAttribution(reflection, supabase, user_id);
    // Store reflection with learning data
    await storeReflectionWithLearning(supabase, user_id, {
      mode: reflection_mode,
      reflection,
      actionable_insights,
      attribution,
      session_id,
      thread_id,
      memory_trace_id,
      conversation_name,
      entry_count,
      processing_time: Date.now() - start_time
    });
    return new Response(JSON.stringify({
      status: 'ok',
      mode: reflection_mode,
      reflection,
      actionable_insights,
      attribution,
      metadata: {
        timestamp: new Date().toISOString(),
        entry_count,
        processing_ms: Date.now() - start_time,
        health_score: calculateSimpleHealth(reflection)
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Reflection Engine Error:', error);
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
// DETERMINE REFLECTION MODE BASED ON ENTRY COUNT
function determineReflectionMode(mode, entry_count, last_reflection_count) {
  if (mode !== 'auto') return mode;
  const entries_since_last = entry_count - last_reflection_count;
  // Entry-based triggers
  if (entry_count >= 500 && entries_since_last >= 400) {
    return 'deep';
  } else if (entry_count >= 100 && entries_since_last >= 75) {
    return 'relationship';
  } else if (entries_since_last >= 25) {
    return 'session';
  } else {
    return 'response';
  }
}
// ANALYZE RESPONSE IMPACT - Focus on behavioral effect not authenticity
async function analyzeResponseImpact(response_data, supabase, user_id) {
  if (!response_data) {
    return {
      error: 'No response data provided'
    };
  }
  const { content, vectors, gravity_score, previous_gravity, user_next_response, memory_references } = response_data;
  // Vector-based alignment (not text pattern matching)
  const alignment = calculateVectorAlignment(vectors?.user, vectors?.ivy);
  // Behavioral impact metrics
  const impact_metrics = {
    gravity_change: gravity_score - (previous_gravity || 0.5),
    vector_alignment: alignment,
    user_engagement: analyzeUserEngagement(user_next_response),
    memory_relevance: evaluateMemoryRelevance(memory_references)
  };
  // User feedback signals
  const user_signals = extractUserFeedbackSignals(user_next_response, gravity_score);
  // Calculate effectiveness score (not authenticity)
  const effectiveness_score = calculateEffectiveness(impact_metrics, user_signals);
  return {
    effectiveness_score,
    impact_metrics,
    user_signals,
    outcome: categorizeOutcome(effectiveness_score, impact_metrics),
    recommendation: generateResponseRecommendation(impact_metrics, user_signals)
  };
}
// ANALYZE SESSION PROGRESS - Incremental not from scratch
async function analyzeSessionProgress(session_id, supabase, user_id, entry_count, last_reflection_count) {
  // Validate session_id
  if (!session_id) {
    return {
      error: 'No session_id provided',
      session_metrics: {
        new_entries: 0,
        vector_coherence: 0.5,
        gravity_trend: 'unknown',
        engagement_level: 0
      }
    };
  }
  // Get only new memories since last reflection
  const { data: new_memories, error: memError } = await supabase.from('gravity_map').select('*').eq('user_id', user_id).eq('session_id', session_id).gt('entry_number', last_reflection_count).order('created_at', {
    ascending: true
  });
  if (memError) {
    console.error('Error fetching memories:', memError);
    return {
      error: 'Failed to fetch session memories',
      session_metrics: {
        new_entries: 0,
        vector_coherence: 0.5,
        gravity_trend: 'unknown',
        engagement_level: 0
      }
    };
  }
  if (!new_memories || new_memories.length === 0) {
    return {
      message: 'No new session data'
    };
  }
  // Get previous session snapshot for comparison
  const { data: last_snapshot } = await supabase.from('reflection_snapshots').select('*').eq('user_id', user_id).eq('session_id', session_id).order('created_at', {
    ascending: false
  }).limit(1).single();
  // Vector coherence for behavioral consistency
  const vector_coherence = calculateSessionVectorCoherence(new_memories);
  // Gravity trajectory for engagement
  const gravity_trajectory = analyzeGravityTrajectory(new_memories, last_snapshot);
  // Pattern progress
  const pattern_progress = await trackPatternProgress(new_memories, supabase, user_id);
  // User feedback integration
  const user_feedback = analyzeSessionFeedback(new_memories);
  // Regression detection
  const regression_flags = detectSessionRegression(new_memories, last_snapshot);
  return {
    session_metrics: {
      new_entries: new_memories.length,
      vector_coherence: vector_coherence.score,
      gravity_trend: gravity_trajectory.trend,
      engagement_level: calculateEngagementLevel(new_memories)
    },
    behavioral_consistency: vector_coherence,
    progress_indicators: {
      gravity: gravity_trajectory,
      patterns: pattern_progress,
      user_feedback
    },
    regression_alerts: regression_flags,
    session_health: calculateSessionHealth(vector_coherence, gravity_trajectory, pattern_progress),
    next_intervention: suggestNextIntervention(pattern_progress, regression_flags)
  };
}
// ANALYZE RELATIONSHIP TRAJECTORY - Vector-based evolution
async function analyzeRelationshipTrajectory(user_id, supabase, entry_count, last_reflection_count, baseline_vector) {
  // Get relationship delta since last major reflection
  const { data: recent_memories } = await supabase.from('gravity_map').select('*').eq('user_id', user_id).gt('entry_number', last_reflection_count).order('created_at', {
    ascending: true
  });
  // Get relationship snapshot
  const { data: relationship_snapshot } = await supabase.from('relationship_metrics').select('*').eq('user_id', user_id).order('created_at', {
    ascending: false
  }).limit(1).single();
  // Vector convergence analysis
  const vector_evolution = analyzeVectorConvergence(recent_memories, baseline_vector);
  // Gravity stability over time
  const gravity_stability = calculateGravityStability(recent_memories);
  // Pattern impact assessment
  const pattern_impact = await assessPatternImpact(recent_memories, supabase, user_id);
  // Growth velocity
  const growth_velocity = calculateGrowthVelocity(vector_evolution, entry_count);
  // Pattern interference detection
  const pattern_interference = await detectPatternInterference(supabase, user_id);
  // Adaptive threshold calculation
  const adaptive_thresholds = calculateAdaptiveThresholds(recent_memories, relationship_snapshot);
  return {
    relationship_delta: {
      entries_analyzed: recent_memories.length,
      vector_drift: vector_evolution.total_drift,
      gravity_stability: gravity_stability.score,
      pattern_changes: pattern_impact.summary
    },
    evolution_metrics: {
      vector_convergence: vector_evolution,
      stability: gravity_stability,
      patterns: pattern_impact,
      growth_velocity
    },
    interference_analysis: pattern_interference,
    personalized_thresholds: adaptive_thresholds,
    relationship_health: calculateRelationshipHealth(vector_evolution, gravity_stability, pattern_impact),
    intervention_timing: determineInterventionTiming(growth_velocity, pattern_interference)
  };
}
// ANALYZE DEEP ALIGNMENT - Comprehensive behavioral review
async function analyzeDeepAlignment(user_id, supabase, entry_count, baseline_vector) {
  // Get comprehensive memory sample
  const { data: memories } = await supabase.from('gravity_map').select('*').eq('user_id', user_id).order('created_at', {
    ascending: false
  }).limit(500);
  // Deep behavioral analysis
  const behavioral_alignment = await analyzeBehavioralAlignment(memories, baseline_vector);
  // Pattern evolution over time
  const pattern_evolution = await analyzePatternEvolution(memories, supabase, user_id);
  // Intervention effectiveness history
  const intervention_history = await analyzeInterventionEffectiveness(memories, supabase, user_id);
  // Goal progress tracking
  const goal_progress = await trackGoalProgress(memories, supabase, user_id);
  // Success attribution analysis
  const success_patterns = identifySuccessPatterns(intervention_history);
  // Failure pattern analysis
  const failure_patterns = identifyFailurePatterns(intervention_history);
  // Plateau detection
  const plateau_analysis = detectPlateaus(memories, behavioral_alignment);
  return {
    alignment_metrics: {
      behavioral_coherence: behavioral_alignment.coherence,
      vector_stability: behavioral_alignment.stability,
      goal_alignment: goal_progress.alignment_score
    },
    evolution_timeline: pattern_evolution,
    effectiveness_analysis: {
      successful_interventions: success_patterns,
      failed_interventions: failure_patterns,
      plateau_states: plateau_analysis
    },
    goal_tracking: goal_progress,
    deep_insights: generateDeepInsights(behavioral_alignment, pattern_evolution, goal_progress),
    optimization_recommendations: generateOptimizationPlan(success_patterns, failure_patterns, plateau_analysis)
  };
}
// VECTOR CALCULATION FUNCTIONS
function calculateVectorAlignment(user_vector, ivy_vector) {
  if (!user_vector || !ivy_vector || user_vector.length === 0 || ivy_vector.length === 0) return 0;
  if (user_vector.length !== ivy_vector.length) return 0;
  // Calculate cosine similarity with validation
  let dot_product = 0;
  let user_magnitude = 0;
  let ivy_magnitude = 0;
  for(let i = 0; i < user_vector.length; i++){
    const u_val = user_vector[i] || 0;
    const i_val = ivy_vector[i] || 0;
    dot_product += u_val * i_val;
    user_magnitude += u_val ** 2;
    ivy_magnitude += i_val ** 2;
  }
  user_magnitude = Math.sqrt(user_magnitude);
  ivy_magnitude = Math.sqrt(ivy_magnitude);
  if (user_magnitude === 0 || ivy_magnitude === 0) return 0;
  const alignment = dot_product / (user_magnitude * ivy_magnitude);
  return Math.max(-1, Math.min(1, alignment)); // Clamp to valid range
}
function calculateSessionVectorCoherence(memories) {
  if (memories.length < 2) {
    return {
      score: 1,
      variance: 0
    };
  }
  const vectors = memories.filter((m)=>m.cce_optimizations?.vector).map((m)=>m.cce_optimizations.vector);
  if (vectors.length < 2) {
    return {
      score: 0.5,
      variance: 0
    };
  }
  // Calculate pairwise similarities
  const similarities = [];
  for(let i = 0; i < vectors.length - 1; i++){
    const alignment = calculateVectorAlignment(vectors[i], vectors[i + 1]);
    similarities.push(alignment);
  }
  const avg_coherence = similarities.reduce((sum, s)=>sum + s, 0) / similarities.length;
  const variance = calculateVariance(similarities);
  return {
    score: avg_coherence,
    variance,
    trend: similarities[similarities.length - 1] > similarities[0] ? 'improving' : 'declining',
    stability: variance < 0.1 ? 'stable' : 'variable'
  };
}
// USER ENGAGEMENT ANALYSIS
function analyzeUserEngagement(user_next_response) {
  if (!user_next_response) {
    return {
      score: 0.5,
      signals: []
    };
  }
  const signals = [];
  let engagement_score = 0.5;
  // Response length indicator
  if (user_next_response.length > 100) {
    signals.push('elaborative_response');
    engagement_score += 0.2;
  }
  // Question asking
  if (user_next_response.includes('?')) {
    signals.push('asking_questions');
    engagement_score += 0.1;
  }
  // Emotional disclosure
  const emotional_words = /feel|felt|feeling|scared|happy|sad|angry|worried/i;
  if (emotional_words.test(user_next_response)) {
    signals.push('emotional_disclosure');
    engagement_score += 0.15;
  }
  // Building on previous
  if (/you mentioned|you said|that makes sense|I see/i.test(user_next_response)) {
    signals.push('building_on_conversation');
    engagement_score += 0.15;
  }
  return {
    score: Math.min(engagement_score, 1),
    signals
  };
}
// USER FEEDBACK SIGNALS
function extractUserFeedbackSignals(user_response, gravity_score) {
  const signals = {
    explicit: {
      positive: /thank you|that helps|exactly|yes/i.test(user_response),
      negative: /no|not really|don't think so/i.test(user_response),
      neutral: !/thank|help|exact|yes|no|not/i.test(user_response)
    },
    implicit: {
      session_continuation: true,
      topic_progression: gravity_score > 0.6,
      question_engagement: user_response?.includes('?'),
      elaboration: user_response?.length > 150
    }
  };
  return signals;
}
// EFFECTIVENESS CALCULATION
function calculateEffectiveness(impact_metrics, user_signals) {
  let score = 0;
  // Gravity impact (30%)
  if (impact_metrics.gravity_change > 0) {
    score += 0.3 * Math.min(impact_metrics.gravity_change * 2, 1);
  }
  // Vector alignment (25%)
  score += 0.25 * Math.max(impact_metrics.vector_alignment, 0);
  // User engagement (25%)
  score += 0.25 * impact_metrics.user_engagement.score;
  // Explicit feedback (20%)
  if (user_signals.explicit.positive) score += 0.2;
  else if (user_signals.explicit.neutral) score += 0.1;
  return Math.min(score, 1);
}
// GRAVITY TRAJECTORY ANALYSIS
function analyzeGravityTrajectory(memories, last_snapshot) {
  const gravities = memories.map((m)=>m.gravity_score || 0.5);
  if (gravities.length === 0) {
    return {
      trend: 'stable',
      slope: 0
    };
  }
  // Calculate trend
  const slope = calculateSlope(gravities);
  const avg_gravity = gravities.reduce((sum, g)=>sum + g, 0) / gravities.length;
  const previous_avg = last_snapshot?.avg_gravity || 0.5;
  return {
    trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
    slope,
    current_average: avg_gravity,
    change_from_previous: avg_gravity - previous_avg,
    volatility: calculateVariance(gravities)
  };
}
// PATTERN PROGRESS TRACKING
async function trackPatternProgress(memories, supabase, user_id) {
  try {
    const { data: patterns, error: patternError } = await supabase.from('pattern_matrix').select('*').eq('user_id', user_id).eq('status', 'active');
    if (patternError) {
      console.error('Error fetching patterns:', patternError);
      return {
        active_patterns: 0,
        progress: 'error_fetching_patterns'
      };
    }
    if (!patterns || patterns.length === 0) {
      return {
        active_patterns: 0,
        progress: 'no_patterns'
      };
    }
    const pattern_progress = [];
    for (const pattern of patterns){
      const vector_before = pattern.instances?.vector_snapshot;
      const current_vectors = memories.filter((m)=>m.cce_optimizations?.vector && Array.isArray(m.cce_optimizations.vector)).map((m)=>m.cce_optimizations.vector);
      if (current_vectors.length > 0 && vector_before && Array.isArray(vector_before)) {
        const current_avg = averageVectors(current_vectors);
        if (current_avg) {
          const distance = vectorDistance(vector_before, current_avg);
          pattern_progress.push({
            pattern_id: pattern.id,
            pattern_type: pattern.pattern_type,
            weakening: distance > 0.3,
            distance_moved: distance
          });
        }
      }
    }
    const weakening_count = pattern_progress.filter((p)=>p.weakening).length;
    return {
      active_patterns: patterns.length,
      weakening_patterns: weakening_count,
      progress: pattern_progress,
      summary: `${weakening_count}/${patterns.length} patterns weakening`
    };
  } catch (error) {
    console.error('Error tracking pattern progress:', error);
    return {
      active_patterns: 0,
      progress: 'error_in_processing'
    };
  }
}
// REGRESSION DETECTION
function detectSessionRegression(memories, last_snapshot) {
  const flags = [];
  const current_avg_gravity = memories.reduce((sum, m)=>sum + (m.gravity_score || 0.5), 0) / memories.length;
  const previous_avg = last_snapshot?.avg_gravity || 0.5;
  // Gravity regression
  if (current_avg_gravity < previous_avg * 0.7) {
    flags.push({
      type: 'gravity_regression',
      severity: 'high',
      current: current_avg_gravity,
      previous: previous_avg
    });
  }
  // Vector chaos (high variance)
  const vectors = memories.filter((m)=>m.cce_optimizations?.vector).map((m)=>m.cce_optimizations.vector);
  if (vectors.length > 2) {
    const coherence = calculateSessionVectorCoherence(memories);
    if (coherence.variance > 0.3) {
      flags.push({
        type: 'vector_instability',
        severity: 'medium',
        variance: coherence.variance
      });
    }
  }
  // Pattern reactivation
  const negative_emotions = memories.filter((m)=>[
      'fear',
      'anger',
      'shame'
    ].includes(m.emotion));
  if (negative_emotions.length > memories.length * 0.6) {
    flags.push({
      type: 'negative_emotion_spike',
      severity: 'medium',
      ratio: negative_emotions.length / memories.length
    });
  }
  return flags;
}
// PATTERN INTERFERENCE DETECTION
async function detectPatternInterference(supabase, user_id) {
  const { data: patterns } = await supabase.from('pattern_matrix').select('*').eq('user_id', user_id).eq('status', 'active');
  if (!patterns || patterns.length < 2) {
    return {
      interference_detected: false
    };
  }
  const interference_pairs = [];
  // Check for conflicting patterns
  for(let i = 0; i < patterns.length; i++){
    for(let j = i + 1; j < patterns.length; j++){
      const p1 = patterns[i];
      const p2 = patterns[j];
      // Check if patterns oppose each other
      if (p1.pattern_type === 'avoidance' && p2.pattern_type === 'perfectionism' || p1.pattern_type === 'people_pleasing' && p2.pattern_type === 'boundary_issues' || p1.pattern_type === 'control' && p2.pattern_type === 'dependency') {
        interference_pairs.push({
          pattern_1: p1.pattern_type,
          pattern_2: p2.pattern_type,
          interference_type: 'opposing_goals',
          recommendation: 'address_separately'
        });
      }
    }
  }
  return {
    interference_detected: interference_pairs.length > 0,
    conflicting_patterns: interference_pairs,
    recommended_focus: interference_pairs[0]?.pattern_1 || patterns[0]?.pattern_type
  };
}
// ADAPTIVE THRESHOLD CALCULATION
function calculateAdaptiveThresholds(memories, snapshot) {
  const user_profile = {
    avg_gravity: memories.reduce((sum, m)=>sum + (m.gravity_score || 0.5), 0) / memories.length,
    emotional_range: new Set(memories.map((m)=>m.emotion)).size,
    response_style: determineResponseStyle(memories)
  };
  // Adjust thresholds based on user profile
  const thresholds = {
    intervention_sensitivity: 'medium',
    pattern_break_threshold: 0.3,
    regression_alert_threshold: 0.7,
    celebration_threshold: 0.8
  };
  // High sensitivity users need gentler thresholds
  if (user_profile.avg_gravity > 0.7 && user_profile.emotional_range > 5) {
    thresholds.intervention_sensitivity = 'high';
    thresholds.pattern_break_threshold = 0.2;
  }
  // Analytical users need evidence-based thresholds
  if (user_profile.response_style === 'analytical') {
    thresholds.intervention_sensitivity = 'low';
    thresholds.pattern_break_threshold = 0.4;
  }
  // Crisis detection
  const crisis_indicators = memories.filter((m)=>m.gravity_score > 0.9 && [
      'fear',
      'panic',
      'despair'
    ].includes(m.emotion));
  if (crisis_indicators.length > 2) {
    thresholds.intervention_sensitivity = 'crisis';
    thresholds.pattern_break_threshold = 0.1;
  }
  return thresholds;
}
// SUCCESS ATTRIBUTION ANALYSIS
async function analyzeSuccessAttribution(reflection, supabase, user_id) {
  const attribution = {
    success_factors: [],
    failure_factors: [],
    context_patterns: []
  };
  // Analyze what worked
  if (reflection.effectiveness_score > 0.7 || reflection.session_health?.score > 0.7) {
    attribution.success_factors.push({
      timing: determineTimingFactor(reflection),
      framing: determineFramingFactor(reflection),
      context: determineContextFactor(reflection)
    });
  }
  // Analyze what didn't work
  if (reflection.effectiveness_score < 0.4 || reflection.regression_alerts?.length > 0) {
    attribution.failure_factors.push({
      timing: 'possible_poor_timing',
      framing: analyzeFramingIssues(reflection),
      context: 'pattern_too_entrenched_or_crisis_state'
    });
  }
  // Identify patterns in success/failure
  const { data: historical } = await supabase.from('reflection_snapshots').select('attribution').eq('user_id', user_id).order('created_at', {
    ascending: false
  }).limit(10);
  if (historical) {
    attribution.context_patterns = identifyAttributionPatterns(historical);
  }
  return attribution;
}
// ACTIONABLE INSIGHTS GENERATION
async function generateActionableInsights(reflection, supabase, user_id) {
  const insights = [];
  // Session-level insights
  if (reflection.session_health) {
    if (reflection.session_health.score < 0.5) {
      insights.push({
        type: 'session_support',
        priority: 'high',
        action: 'increase_validation_decrease_challenge',
        reason: 'low_session_health_detected'
      });
    }
  }
  // Pattern insights
  if (reflection.progress_indicators?.patterns) {
    const patterns = reflection.progress_indicators.patterns;
    if (patterns.weakening_patterns > 0) {
      insights.push({
        type: 'pattern_progress',
        priority: 'medium',
        action: 'reinforce_pattern_breaks',
        specific: `${patterns.weakening_patterns} patterns showing improvement`
      });
    }
  }
  // Regression insights
  if (reflection.regression_alerts?.length > 0) {
    insights.push({
      type: 'regression_response',
      priority: 'high',
      action: 'gentle_stabilization',
      alerts: reflection.regression_alerts
    });
  }
  // Interference insights
  if (reflection.interference_analysis?.interference_detected) {
    insights.push({
      type: 'pattern_conflict',
      priority: 'medium',
      action: 'address_patterns_separately',
      conflicts: reflection.interference_analysis.conflicting_patterns
    });
  }
  // Plateau insights
  if (reflection.effectiveness_analysis?.plateau_states?.detected) {
    insights.push({
      type: 'plateau_response',
      priority: 'low',
      action: reflection.effectiveness_analysis.plateau_states.recommended_approach,
      duration: reflection.effectiveness_analysis.plateau_states.duration
    });
  }
  return insights;
}
// HELPER FUNCTIONS
function vectorDistance(v1, v2) {
  if (!v1 || !v2 || v1.length === 0 || v2.length === 0) return 1;
  if (v1.length !== v2.length) return 1;
  let sum = 0;
  for(let i = 0; i < v1.length; i++){
    const val1 = v1[i] || 0;
    const val2 = v2[i] || 0;
    sum += Math.pow(val1 - val2, 2);
  }
  return Math.sqrt(sum);
}
function averageVectors(vectors) {
  if (!vectors || vectors.length === 0) return null;
  // Filter out invalid vectors
  const validVectors = vectors.filter((v)=>v && Array.isArray(v) && v.length > 0);
  if (validVectors.length === 0) return null;
  const avg = new Array(validVectors[0].length).fill(0);
  for (const vector of validVectors){
    for(let i = 0; i < vector.length; i++){
      avg[i] += vector[i] || 0;
    }
  }
  return avg.map((v)=>v / validVectors.length);
}
function calculateVariance(values) {
  if (!values || values.length === 0) return 0;
  const validValues = values.filter((v)=>typeof v === 'number' && !isNaN(v));
  if (validValues.length === 0) return 0;
  const mean = validValues.reduce((sum, v)=>sum + v, 0) / validValues.length;
  const squaredDiffs = validValues.map((v)=>Math.pow(v - mean, 2));
  return squaredDiffs.reduce((sum, v)=>sum + v, 0) / validValues.length;
}
function calculateSlope(values) {
  if (!values || values.length < 2) return 0;
  const n = values.length;
  const indices = Array.from({
    length: n
  }, (_, i)=>i);
  const sumX = indices.reduce((sum, i)=>sum + i, 0);
  const sumY = values.reduce((sum, v)=>sum + (v || 0), 0);
  const sumXY = indices.reduce((sum, i)=>sum + i * (values[i] || 0), 0);
  const sumX2 = indices.reduce((sum, i)=>sum + i * i, 0);
  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return 0;
  return (n * sumXY - sumX * sumY) / denominator;
}
function calculateEngagementLevel(memories) {
  if (!memories || memories.length === 0) return 0;
  const validMemories = memories.filter((m)=>m && typeof m === 'object');
  if (validMemories.length === 0) return 0;
  const indicators = {
    avg_gravity: validMemories.reduce((sum, m)=>sum + (m.gravity_score || 0.5), 0) / validMemories.length,
    response_length: validMemories.filter((m)=>m.content && m.content.length > 100).length / validMemories.length,
    emotional_variety: new Set(validMemories.map((m)=>m.emotion || 'neutral')).size / Math.max(validMemories.length, 1)
  };
  const engagement = indicators.avg_gravity * 0.4 + indicators.response_length * 0.3 + Math.min(indicators.emotional_variety, 1) * 0.3;
  return Math.max(0, Math.min(1, engagement));
}
function calculateSessionHealth(coherence, trajectory, patterns) {
  let health = 0;
  // Vector coherence (30%)
  health += coherence.score * 0.3;
  // Gravity stability (30%)
  if (trajectory.trend === 'increasing') health += 0.3;
  else if (trajectory.trend === 'stable') health += 0.15;
  // Pattern progress (20%)
  if (patterns.weakening_patterns > 0) {
    health += 0.2 * (patterns.weakening_patterns / patterns.active_patterns);
  }
  // Engagement (20%)
  if (trajectory.current_average > 0.5) {
    health += 0.2 * Math.min(trajectory.current_average, 1);
  }
  return {
    score: health,
    status: health > 0.7 ? 'healthy' : health > 0.4 ? 'moderate' : 'needs_attention'
  };
}
function calculateSimpleHealth(reflection) {
  let health = 0.5; // baseline
  if (reflection.effectiveness_score) {
    health = reflection.effectiveness_score;
  } else if (reflection.session_health) {
    health = reflection.session_health.score;
  } else if (reflection.relationship_health) {
    health = reflection.relationship_health;
  } else if (reflection.alignment_metrics) {
    health = reflection.alignment_metrics.goal_alignment;
  }
  return Math.min(Math.max(health, 0), 1);
}
function categorizeOutcome(effectiveness, metrics) {
  if (effectiveness > 0.7) return 'positive_impact';
  if (effectiveness > 0.4) return 'neutral_impact';
  if (metrics.gravity_change < -0.2) return 'negative_impact';
  return 'minimal_impact';
}
function generateResponseRecommendation(metrics, signals) {
  if (metrics.gravity_change < 0 && signals.explicit.negative) {
    return 'Recalibrate approach - user disengaging';
  }
  if (metrics.vector_alignment < 0.3) {
    return 'Increase attunement to user state';
  }
  if (signals.implicit.elaboration) {
    return 'Continue current approach - high engagement';
  }
  return 'Maintain steady presence';
}
function suggestNextIntervention(patterns, regression) {
  if (regression.length > 0) {
    return {
      type: 'stabilization',
      urgency: 'immediate',
      approach: 'gentle_grounding'
    };
  }
  if (patterns.weakening_patterns > patterns.active_patterns / 2) {
    return {
      type: 'reinforce_progress',
      urgency: 'moderate',
      approach: 'celebrate_gains'
    };
  }
  return {
    type: 'maintain_presence',
    urgency: 'low',
    approach: 'consistent_support'
  };
}
function determineResponseStyle(memories) {
  const analytical_markers = memories.filter((m)=>m.content && /because|therefore|analyze|think|reason/i.test(m.content));
  const emotional_markers = memories.filter((m)=>m.content && /feel|felt|scared|happy|sad/i.test(m.content));
  if (analytical_markers.length > emotional_markers.length * 1.5) {
    return 'analytical';
  }
  if (emotional_markers.length > analytical_markers.length * 1.5) {
    return 'emotional';
  }
  return 'balanced';
}
function determineTimingFactor(reflection) {
  if (reflection.user_signals?.implicit.elaboration) {
    return 'user_was_receptive';
  }
  if (reflection.impact_metrics?.gravity_change > 0.2) {
    return 'after_breakthrough_moment';
  }
  return 'standard_timing';
}
function determineFramingFactor(reflection) {
  if (reflection.effectiveness_score > 0.7) {
    return 'growth_focused_not_problem_focused';
  }
  return 'standard_framing';
}
function determineContextFactor(reflection) {
  if (reflection.regression_alerts?.length > 0) {
    return 'during_regression';
  }
  if (reflection.progress_indicators?.patterns.weakening_patterns > 0) {
    return 'pattern_weakening_context';
  }
  return 'stable_context';
}
function analyzeFramingIssues(reflection) {
  if (reflection.user_signals?.explicit.negative) {
    return 'possibly_too_direct_or_prescriptive';
  }
  if (reflection.impact_metrics?.vector_alignment < 0.3) {
    return 'misaligned_with_user_state';
  }
  return 'unclear_framing_issue';
}
function identifyAttributionPatterns(historical) {
  // Simplified pattern identification
  const patterns = [];
  const success_count = historical.filter((h)=>h.attribution?.success_factors?.length > 0).length;
  if (success_count > historical.length * 0.7) {
    patterns.push('generally_effective_approach');
  }
  return patterns;
}
// Additional helper functions for deep analysis
async function analyzeBehavioralAlignment(memories, baseline) {
  const vectors = memories.filter((m)=>m.cce_optimizations?.vector).map((m)=>m.cce_optimizations.vector);
  if (vectors.length === 0 || !baseline) {
    return {
      coherence: 0.5,
      stability: 0.5
    };
  }
  const current_avg = averageVectors(vectors);
  const drift = vectorDistance(baseline, current_avg);
  const coherence = calculateSessionVectorCoherence(memories);
  return {
    coherence: coherence.score,
    stability: 1 - Math.min(drift, 1),
    total_drift: drift,
    vector_evolution: 'tracked'
  };
}
async function analyzePatternEvolution(memories, supabase, user_id) {
  const timeline = [];
  const chunks = chunkMemories(memories, 50); // Analyze in chunks of 50
  for (const chunk of chunks){
    const patterns = await trackPatternProgress(chunk, supabase, user_id);
    timeline.push({
      period: `entries_${chunk[0].entry_number}_to_${chunk[chunk.length - 1].entry_number}`,
      pattern_state: patterns
    });
  }
  return timeline;
}
async function analyzeInterventionEffectiveness(memories, supabase, user_id) {
  // Simplified intervention tracking
  const interventions = memories.filter((m)=>m.metadata?.intervention_type || m.gravity_score > 0.8);
  const effectiveness = interventions.map((intervention)=>({
      type: intervention.metadata?.intervention_type || 'insight',
      gravity_impact: intervention.gravity_score - 0.5,
      success: intervention.gravity_score > 0.6
    }));
  return effectiveness;
}
async function trackGoalProgress(memories, supabase, user_id) {
  // Check for mentioned goals
  const goal_mentions = memories.filter((m)=>m.content && /goal|want to|trying to|hope to/i.test(m.content));
  const progress_mentions = memories.filter((m)=>m.content && /achieved|progress|better|improved/i.test(m.content));
  return {
    goals_mentioned: goal_mentions.length,
    progress_mentioned: progress_mentions.length,
    alignment_score: progress_mentions.length / Math.max(goal_mentions.length, 1)
  };
}
function identifySuccessPatterns(history) {
  const successes = history.filter((h)=>h.success);
  const patterns = {
    timing: {},
    type: {},
    context: {}
  };
  successes.forEach((s)=>{
    patterns.type[s.type] = (patterns.type[s.type] || 0) + 1;
  });
  return {
    most_effective_type: Object.entries(patterns.type).sort(([, a], [, b])=>b - a)[0]?.[0],
    success_rate: successes.length / history.length
  };
}
function identifyFailurePatterns(history) {
  const failures = history.filter((h)=>!h.success);
  return {
    failure_rate: failures.length / history.length,
    common_context: 'needs_more_data'
  };
}
function detectPlateaus(memories, alignment) {
  const recent_vectors = memories.slice(-20).filter((m)=>m.cce_optimizations?.vector).map((m)=>m.cce_optimizations.vector);
  if (recent_vectors.length < 10) {
    return {
      detected: false
    };
  }
  const movement = calculateVectorMovement(recent_vectors);
  if (movement < 0.1) {
    return {
      detected: true,
      duration: recent_vectors.length,
      hypothesis: alignment.stability > 0.8 ? 'integration_phase' : 'resistance',
      recommended_approach: alignment.stability > 0.8 ? 'patience' : 'new_angle'
    };
  }
  return {
    detected: false
  };
}
function calculateVectorMovement(vectors) {
  if (vectors.length < 2) return 0;
  let total_movement = 0;
  for(let i = 1; i < vectors.length; i++){
    total_movement += vectorDistance(vectors[i - 1], vectors[i]);
  }
  return total_movement / vectors.length;
}
function chunkMemories(memories, size) {
  const chunks = [];
  for(let i = 0; i < memories.length; i += size){
    chunks.push(memories.slice(i, i + size));
  }
  return chunks;
}
function analyzeVectorConvergence(memories, baseline) {
  const vectors = memories.filter((m)=>m.cce_optimizations?.vector).map((m)=>m.cce_optimizations.vector);
  if (vectors.length === 0 || !baseline) {
    return {
      convergence_score: 0.5,
      total_drift: 0
    };
  }
  const distances = vectors.map((v)=>vectorDistance(baseline, v));
  const trend = calculateSlope(distances);
  return {
    convergence_score: trend < 0 ? 1 - Math.abs(trend) : 0.5 - trend,
    total_drift: distances[distances.length - 1],
    trend: trend < -0.1 ? 'converging' : trend > 0.1 ? 'diverging' : 'stable'
  };
}
function calculateGravityStability(memories) {
  const gravities = memories.map((m)=>m.gravity_score || 0.5);
  const variance = calculateVariance(gravities);
  return {
    score: 1 - Math.min(variance, 1),
    variance,
    interpretation: variance < 0.1 ? 'stable' : variance < 0.3 ? 'moderate' : 'volatile'
  };
}
async function assessPatternImpact(memories, supabase, user_id) {
  const patterns = await trackPatternProgress(memories, supabase, user_id);
  return {
    ...patterns,
    impact_score: patterns.weakening_patterns / Math.max(patterns.active_patterns, 1),
    effectiveness: patterns.weakening_patterns > 0 ? 'positive' : 'minimal'
  };
}
function calculateGrowthVelocity(evolution, entry_count) {
  if (!evolution || entry_count === 0) return 0;
  return evolution.total_drift / entry_count;
}
function calculateRelationshipHealth(evolution, stability, patterns) {
  let health = 0;
  // Vector convergence (40%)
  if (evolution.trend === 'converging') health += 0.4;
  else if (evolution.trend === 'stable') health += 0.2;
  // Stability (30%)
  health += stability.score * 0.3;
  // Pattern impact (30%)
  health += patterns.impact_score * 0.3;
  return Math.min(health, 1);
}
function determineInterventionTiming(velocity, interference) {
  if (interference.interference_detected) {
    return {
      recommendation: 'careful_separate_interventions',
      urgency: 'moderate'
    };
  }
  if (velocity > 0.5) {
    return {
      recommendation: 'maintain_momentum',
      urgency: 'low'
    };
  }
  return {
    recommendation: 'standard_timing',
    urgency: 'moderate'
  };
}
function generateDeepInsights(alignment, evolution, goals) {
  const insights = [];
  if (alignment.coherence > 0.8) {
    insights.push('Behavioral patterns showing strong consistency');
  }
  if (goals.alignment_score > 0.7) {
    insights.push('Goal progress aligning with stated intentions');
  }
  if (evolution.length > 0) {
    const trend = evolution[evolution.length - 1].pattern_state;
    if (trend.weakening_patterns > 0) {
      insights.push(`${trend.weakening_patterns} patterns showing improvement trajectory`);
    }
  }
  return insights;
}
function generateOptimizationPlan(successes, failures, plateaus) {
  const plan = {
    continue: [],
    adjust: [],
    explore: []
  };
  if (successes.success_rate > 0.7) {
    plan.continue.push(successes.most_effective_type);
  }
  if (failures.failure_rate > 0.3) {
    plan.adjust.push('intervention_approach');
  }
  if (plateaus.detected) {
    plan.explore.push(plateaus.recommended_approach);
  }
  return plan;
}
function evaluateMemoryRelevance(references) {
  if (!references || references.length === 0) {
    return {
      score: 0.3
    };
  }
  const relevant_count = references.filter((r)=>r.relevance_score > 0.7).length;
  return {
    score: relevant_count / references.length,
    high_relevance_count: relevant_count
  };
}
function analyzeSessionFeedback(memories) {
  const positive_signals = memories.filter((m)=>m.content && /thank|help|exactly|yes|right/i.test(m.content)).length;
  const negative_signals = memories.filter((m)=>m.content && /no|wrong|don't|stop/i.test(m.content)).length;
  return {
    positive_ratio: positive_signals / memories.length,
    negative_ratio: negative_signals / memories.length,
    overall: positive_signals > negative_signals ? 'positive' : 'mixed'
  };
}
// STORE REFLECTION WITH LEARNING
async function storeReflectionWithLearning(supabase, user_id, data) {
  try {
    // Store in reflection snapshots for incremental tracking
    const snapshotResult = await supabase.from('reflection_snapshots').insert({
      id: crypto.randomUUID(),
      user_id,
      session_id: data.session_id,
      entry_count: data.entry_count,
      mode: data.mode,
      health_score: calculateSimpleHealth(data.reflection),
      reflection_data: data.reflection,
      attribution: data.attribution,
      insights: data.actionable_insights,
      processing_time: data.processing_time,
      created_at: new Date().toISOString()
    });
    if (snapshotResult.error) {
      console.warn('Failed to store reflection snapshot:', snapshotResult.error);
    }
    // Store in meta memory log for compatibility
    const metaResult = await supabase.from('meta_memory_log').insert({
      id: crypto.randomUUID(),
      user_id,
      session_id: data.session_id,
      memory_trace_id: data.memory_trace_id || `reflection-${data.mode}-${Date.now()}`,
      type: 'cce_reflection_optimized',
      content: `Behavioral reflection: ${data.mode} at entry ${data.entry_count}`,
      metadata: {
        thread_id: data.thread_id,
        conversation_name: data.conversation_name,
        reflection_data: data.reflection,
        insights: data.actionable_insights,
        attribution: data.attribution,
        mode: data.mode,
        entry_count: data.entry_count,
        processing_ms: data.processing_time,
        dispatcher_version: '1.2',
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    });
    if (metaResult.error) {
      console.warn('Failed to store meta memory log:', metaResult.error);
    }
    // Store learning data for optimization
    if (data.attribution?.success_factors?.length > 0) {
      const learningResult = await supabase.from('learning_optimization').insert({
        id: crypto.randomUUID(),
        user_id,
        intervention_type: data.mode,
        success: true,
        factors: data.attribution.success_factors,
        impact: calculateSimpleHealth(data.reflection),
        context: {
          entry_count: data.entry_count,
          mode: data.mode
        },
        created_at: new Date().toISOString()
      });
      if (learningResult.error) {
        console.warn('Failed to store learning data:', learningResult.error);
      }
    }
  } catch (error) {
    console.error('Error storing reflection data:', error);
  // Don't throw - allow reflection to complete even if storage partially fails
  }
}
