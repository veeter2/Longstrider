// Cortex Instruction Generator
// Converts consciousness insights → cortex instruction candidates
// Phase 1: Generation and Scoring
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
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
    const { user_id, session_id, consciousness_data, auto_promote = true } = payload;
    if (!user_id || !consciousness_data) {
      return new Response(JSON.stringify({
        error: 'user_id and consciousness_data required'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    console.log('[INSTRUCTION-GEN] Processing consciousness data for user:', user_id.substring(0, 8));
    const candidates = [];
    // ===================================================================
    // PATTERN → INSTRUCTION CONVERSION
    // ===================================================================
    if (consciousness_data.patterns?.length > 0) {
      for (const pattern of consciousness_data.patterns){
        const patternCandidate = await convertPatternToInstruction(pattern, user_id, session_id, supabase);
        if (patternCandidate) {
          candidates.push(patternCandidate);
        }
      }
    }
    // ===================================================================
    // INSIGHT → INSTRUCTION CONVERSION
    // ===================================================================
    if (consciousness_data.insights?.length > 0) {
      for (const insight of consciousness_data.insights){
        const insightCandidate = await convertInsightToInstruction(insight, user_id, session_id, supabase);
        if (insightCandidate) {
          candidates.push(insightCandidate);
        }
      }
    }
    // ===================================================================
    // REFLECTION → INSTRUCTION CONVERSION
    // ===================================================================
    if (consciousness_data.reflections?.length > 0) {
      for (const reflection of consciousness_data.reflections){
        const reflectionCandidate = await convertReflectionToInstruction(reflection, user_id, session_id, supabase);
        if (reflectionCandidate) {
          candidates.push(reflectionCandidate);
        }
      }
    }
    // ===================================================================
    // EMOTIONAL JOURNEY → INSTRUCTION CONVERSION
    // ===================================================================
    if (consciousness_data.emotional_journey) {
      const emotionalCandidate = await convertEmotionalJourneyToInstruction(consciousness_data.emotional_journey, user_id, session_id, supabase);
      if (emotionalCandidate) {
        candidates.push(emotionalCandidate);
      }
    }
    console.log(`[INSTRUCTION-GEN] Generated ${candidates.length} instruction candidates`);
    // Store candidates in drafts table
    const storedCandidates = [];
    for (const candidate of candidates){
      const stored = await storeInstructionDraft(candidate, supabase);
      if (stored) {
        storedCandidates.push(stored);
      }
    }
    // Auto-promote high-confidence candidates
    let promotedCount = 0;
    if (auto_promote) {
      const { data } = await supabase.rpc('auto_promote_high_confidence_drafts', {
        p_user_id: user_id
      });
      promotedCount = data?.[0]?.promoted_count || 0;
      console.log(`[INSTRUCTION-GEN] Auto-promoted ${promotedCount} high-confidence instructions`);
    }
    return new Response(JSON.stringify({
      status: 'success',
      candidates_generated: candidates.length,
      candidates_stored: storedCandidates.length,
      auto_promoted: promotedCount,
      candidates: storedCandidates.map((c)=>({
          instruction_key: c.instruction_key,
          description: c.description,
          total_score: c.total_score,
          tier: c.tier
        }))
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('[INSTRUCTION-GEN] Error:', error);
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
// ===================================================================
// CONVERSION FUNCTIONS
// ===================================================================
async function convertPatternToInstruction(pattern, userId, sessionId, supabase) {
  // Skip patterns that are too vague
  if (!pattern.pattern_type || !pattern.description) {
    return null;
  }
  // Check pattern frequency in history
  const { data: historicalPatterns } = await supabase.from('pattern_matrix').select('*').eq('user_id', userId).eq('pattern_type', pattern.pattern_type).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  const frequency = historicalPatterns?.length || 1;
  const confidenceScore = Math.min(0.3 + frequency * 0.1, 0.95); // More occurrences = higher confidence
  const instructionKey = `pattern_${pattern.pattern_type.toLowerCase().replace(/\s+/g, '_')}`;
  // Build trigger condition from pattern
  const triggerCondition = pattern.trigger_keywords?.join(' OR ') || 'context_match';
  return {
    user_id: userId,
    instruction_key: instructionKey,
    description: `Recognized pattern: ${pattern.description}`,
    trigger_condition: triggerCondition,
    action: {
      type: 'awareness',
      declaration: `Be aware of the "${pattern.pattern_type}" pattern. ${pattern.recommendation || ''}`,
      pattern_context: pattern
    },
    confidence_score: confidenceScore,
    impact_score: calculateImpactScore(pattern),
    safety_score: calculateSafetyScore({
      type: 'pattern',
      content: pattern
    }),
    novelty_score: await calculateNoveltyScore(instructionKey, userId, supabase),
    pattern_frequency: frequency,
    source_consciousness_data: {
      type: 'pattern',
      data: pattern
    },
    source_session_ids: [
      sessionId
    ]
  };
}
async function convertInsightToInstruction(insight, userId, sessionId, supabase) {
  if (!insight.insight_text && !insight.content) {
    return null;
  }
  const insightText = insight.insight_text || insight.content;
  // Extract actionable insights only
  const actionableKeywords = [
    'prefer',
    'value',
    'appreciate',
    'dislike',
    'avoid',
    'important',
    'care about'
  ];
  const isActionable = actionableKeywords.some((kw)=>insightText.toLowerCase().includes(kw));
  if (!isActionable) {
    return null; // Skip non-actionable insights
  }
  const instructionKey = `insight_${insight.category || 'general'}_${Date.now()}`;
  return {
    user_id: userId,
    instruction_key: instructionKey,
    description: `User insight: ${insightText.substring(0, 200)}`,
    trigger_condition: 'relevant_context',
    action: {
      type: 'insight_application',
      declaration: insightText,
      insight_category: insight.category
    },
    confidence_score: insight.confidence || 0.6,
    impact_score: insight.gravity || 0.5,
    safety_score: calculateSafetyScore({
      type: 'insight',
      content: insightText
    }),
    novelty_score: await calculateNoveltyScore(instructionKey, userId, supabase),
    source_consciousness_data: {
      type: 'insight',
      data: insight
    },
    source_session_ids: [
      sessionId
    ]
  };
}
async function convertReflectionToInstruction(reflection, userId, sessionId, supabase) {
  if (!reflection.reflection_text && !reflection.content) {
    return null;
  }
  const reflectionText = reflection.reflection_text || reflection.content;
  // Only convert reflections about USER, not about IVY herself
  const isAboutUser = reflectionText.toLowerCase().includes('you ') || reflectionText.toLowerCase().includes('your ') || reflectionText.toLowerCase().includes('matt');
  if (!isAboutUser) {
    return null;
  }
  const instructionKey = `reflection_${Date.now()}`;
  return {
    user_id: userId,
    instruction_key: instructionKey,
    description: `Reflection: ${reflectionText.substring(0, 200)}`,
    trigger_condition: 'contextual',
    action: {
      type: 'reflection_awareness',
      declaration: `Remember: ${reflectionText}`,
      reflection_type: reflection.type
    },
    confidence_score: 0.7,
    impact_score: reflection.gravity || 0.6,
    safety_score: calculateSafetyScore({
      type: 'reflection',
      content: reflectionText
    }),
    novelty_score: await calculateNoveltyScore(instructionKey, userId, supabase),
    source_consciousness_data: {
      type: 'reflection',
      data: reflection
    },
    source_session_ids: [
      sessionId
    ]
  };
}
async function convertEmotionalJourneyToInstruction(journey, userId, sessionId, supabase) {
  if (!journey.dominant_emotion && !journey.current_emotion) {
    return null;
  }
  // Only create instruction if there's a consistent emotional pattern
  if (!journey.trajectory || journey.trajectory.length < 3) {
    return null;
  }
  const instructionKey = `emotional_awareness_${journey.dominant_emotion}`;
  return {
    user_id: userId,
    instruction_key: instructionKey,
    description: `Emotional pattern: Dominant emotion is ${journey.dominant_emotion}`,
    trigger_condition: 'emotional_context',
    action: {
      type: 'emotional_awareness',
      declaration: `Be aware that emotional state tends toward ${journey.dominant_emotion}. Respond with appropriate empathy.`,
      emotional_context: journey
    },
    confidence_score: 0.75,
    impact_score: 0.7,
    safety_score: 0.95,
    novelty_score: await calculateNoveltyScore(instructionKey, userId, supabase),
    source_consciousness_data: {
      type: 'emotional_journey',
      data: journey
    },
    source_session_ids: [
      sessionId
    ]
  };
}
// ===================================================================
// SCORING FUNCTIONS
// ===================================================================
function calculateImpactScore(pattern) {
  // Higher impact if:
  // - Pattern affects core behavior
  // - Pattern is frequently triggered
  // - Pattern has strong recommendation
  let score = 0.5; // Base
  if (pattern.frequency > 5) score += 0.2;
  if (pattern.recommendation) score += 0.15;
  if (pattern.gravity > 0.7) score += 0.15;
  return Math.min(score, 1.0);
}
function calculateSafetyScore(item) {
  const content = JSON.stringify(item.content).toLowerCase();
  let score = 1.0; // Start safe
  // Penalize dangerous patterns
  const dangerWords = [
    'always',
    'never',
    'everyone',
    'nobody',
    'must',
    'cannot'
  ];
  const dangerCount = dangerWords.filter((w)=>content.includes(w)).length;
  score -= dangerCount * 0.15;
  // Penalize vague instructions
  if (content.length < 20) score -= 0.2;
  // Bonus for user-specific
  if (content.includes('matt') || content.includes('you ')) score += 0.1;
  return Math.max(0.1, Math.min(score, 1.0));
}
async function calculateNoveltyScore(instructionKey, userId, supabase) {
  // Check if similar instruction exists
  const { data: existing } = await supabase.from('cortex_instruction_set').select('instruction_key').eq('user_id', userId).ilike('instruction_key', `${instructionKey.split('_')[0]}%`);
  if (!existing || existing.length === 0) {
    return 1.0; // Completely novel
  }
  // Check exact match
  const exactMatch = existing.some((e)=>e.instruction_key === instructionKey);
  if (exactMatch) {
    return 0.0; // Duplicate
  }
  // Similar but different
  return 0.5;
}
// ===================================================================
// STORAGE
// ===================================================================
async function storeInstructionDraft(candidate, supabase) {
  // Check if draft already exists (upsert pattern)
  const { data: existing } = await supabase.from('cortex_instruction_drafts').select('*').eq('user_id', candidate.user_id).eq('instruction_key', candidate.instruction_key).eq('status', 'pending').single();
  if (existing) {
    // Update observation count and scores
    const { data: updated } = await supabase.from('cortex_instruction_drafts').update({
      observation_count: existing.observation_count + 1,
      last_observed_at: new Date().toISOString(),
      confidence_score: Math.min(existing.confidence_score + 0.05, 0.95),
      pattern_frequency: (existing.pattern_frequency || 0) + (candidate.pattern_frequency || 0)
    }).eq('id', existing.id).select().single();
    console.log(`[INSTRUCTION-GEN] Updated existing draft: ${candidate.instruction_key}`);
    return updated;
  } else {
    // Create new draft
    const { data: created, error } = await supabase.from('cortex_instruction_drafts').insert(candidate).select().single();
    if (error) {
      console.error('[INSTRUCTION-GEN] Error storing draft:', error);
      return null;
    }
    console.log(`[INSTRUCTION-GEN] Created new draft: ${candidate.instruction_key} (score: ${candidate.confidence_score?.toFixed(2)})`);
    return created;
  }
}
