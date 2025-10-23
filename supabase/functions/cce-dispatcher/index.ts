// CCE Dispatcher - Central routing for Corpus Callosum Engine
// Routes memories to appropriate CCE functions based on gravity and type
// v1.2 - Added conversation_name capture and smart embedding generation (user inputs only)
import { serve } from "https://deno.land/std@0.214.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
// Generate embedding using OpenAI
async function generateEmbedding(text) {
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('No OpenAI API key found - embeddings will be null');
      return null;
    }
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000) // Limit to 8000 chars for API
      })
    });
    if (!response.ok) {
      console.error(`OpenAI embedding error: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return null;
  }
}
serve(async (req)=>{
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  try {
    const payload = await req.json();
    const { user_id, session_id, content, memory_trace_id, thread_id, conversation_name, type, topic, summary, sentiment, emotion, gravity_score = 0.05, metadata = {} } = payload;
    if (!user_id || !content) {
      return new Response(JSON.stringify({
        error: 'user_id and content are required'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    console.log(`🧠 CCE Dispatcher: Processing memory for user ${user_id}`);
    console.log(`Original gravity: ${gravity_score}, Type: ${type}`);
    // Determine memory type - critical for smart embedding and recall
    const isUserMessage = type === 'user' || metadata.is_user_message || metadata.memory_type === 'user_input';
    const memory_type = isUserMessage ? 'user_input' : 'ivy_response';
    // Auto-adjust gravity for IVY responses (reduce by 50% to prevent philosophical loops)
    let adjusted_gravity_score = gravity_score;
    if (memory_type === 'ivy_response') {
      adjusted_gravity_score = gravity_score * 0.5;
      console.log(`⚖️ Gravity adjusted for IVY response: ${gravity_score} → ${adjusted_gravity_score}`);
    }
    // FULL EMBEDDING GENERATION: Both user inputs AND IVY responses
    // This ensures complete semantic searchability for all memories
    let embedding = null;
    console.log(`🔮 Generating embedding for ${memory_type}...`);
    embedding = await generateEmbedding(content);
    if (embedding) {
      console.log(`✅ Embedding generated successfully (${memory_type}, gravity: ${adjusted_gravity_score})`);
    } else {
      console.log(`⚠️ Embedding generation failed for ${memory_type} - memory will have limited searchability`);
    }
    // Prepare the memory object with all v5.0 fields
    const memory = {
      id: crypto.randomUUID(),
      memory_trace_id: memory_trace_id || crypto.randomUUID(),
      thread_id: thread_id || metadata.thread_id || null,
      conversation_name: conversation_name || metadata.conversation_name || null,
      memory_type: memory_type,
      user_id,
      session_id,
      content,
      type: type || 'memory',
      topic,
      summary,
      sentiment,
      emotion,
      gravity_score: adjusted_gravity_score,
      embedding,
      created_at: new Date().toISOString(),
      last_engaged: null,
      t_valid: payload.t_valid || new Date().toISOString(),
      t_ingested: new Date().toISOString(),
      // V5.0 fields
      statement_type: metadata.statement_type || payload.statement_type || null,
      temporal_type: metadata.temporal_type || payload.temporal_type || 'static',
      episodic: metadata.episodic !== undefined ? metadata.episodic : true,
      entities: metadata.entities || payload.entities || [],
      relationship_strength: metadata.relationship_strength || payload.relationship_strength || 0.0,
      identity_anchor: metadata.identity_anchor || payload.identity_anchor || false,
      contradiction_group: metadata.contradiction_group || payload.contradiction_group || null,
      confidence_score: metadata.confidence_score || payload.confidence_score || null,
      retrieval_score: metadata.retrieval_score || payload.retrieval_score || null,
      fusion_score: metadata.fusion_score || payload.fusion_score || null,
      overlay_context: metadata.overlay_context || payload.overlay_context || null,
      persona_overlay: metadata.persona_overlay || payload.persona_overlay || null,
      response_strategy: metadata.response_strategy || payload.response_strategy || null,
      blocker_type: metadata.blocker_type || payload.blocker_type || null,
      source_table: 'gravity_map',
      status: 'active',
      org_id: payload.org_id || null,
      project_id: payload.project_id || null,
      meta_tags: metadata.meta_tags || [],
      metadata: {
        ...metadata,
        dispatcher_version: '1.2',
        processed_at: new Date().toISOString(),
        has_embedding: embedding !== null,
        memory_type: memory_type,
        thread_id: thread_id // ADD: Include in metadata too
      }
    };
    // Primary route: Always insert to gravity_map
    const { data: primaryData, error: primaryError } = await supabase.from('gravity_map').insert([
      memory
    ]).select().single();
    if (primaryError) {
      console.error('Primary insertion failed:', primaryError);
      return new Response(JSON.stringify({
        error: 'Failed to insert to gravity_map',
        detail: primaryError.message
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    // Cascade routing based on gravity and type
    const cascades = [];
    // High gravity memories trigger CCE fusion (using adjusted gravity)
    if (adjusted_gravity_score >= 0.7) {
      try {
        const fusionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/cce-memory-arc-builder`;
        const fusionResponse = await fetch(fusionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            memory_id: primaryData.id,
            user_id
          })
        });
        if (fusionResponse.ok) {
          const fusionResult = await fusionResponse.json();
          cascades.push({
            function: 'cce-memory-arc-builder',
            status: 'success',
            result: fusionResult
          });
        }
      } catch (err) {
        console.error('Fusion cascade failed:', err);
        cascades.push({
          function: 'cce-memory-arc-builder',
          status: 'failed',
          error: err.message
        });
      }
    }
    // Emotional memories trigger pattern detection
    if (emotion && emotion !== 'neutral') {
      cascades.push({
        function: 'cce-pattern-detector',
        status: 'queued',
        trigger: 'emotional_content'
      });
    }
    // Identity anchors trigger reflection
    if (memory.identity_anchor) {
      cascades.push({
        function: 'cce-reflection-engine',
        status: 'queued',
        trigger: 'identity_anchor'
      });
    }
    // Log to meta_memory_log for tracking
    await supabase.from('meta_memory_log').insert({
      id: crypto.randomUUID(),
      user_id,
      memory_trace_id: memory.memory_trace_id,
      type: 'cce_dispatch',
      content: `Memory dispatched: gravity=${adjusted_gravity_score} (original=${gravity_score}), cascades=${cascades.length}, embedding=${embedding ? 'generated' : memory_type === 'ivy_response' ? 'skipped' : 'failed'}, type=${memory_type}`,
      metadata: {
        memory_id: primaryData.id,
        cascades,
        gravity_score: adjusted_gravity_score,
        original_gravity: gravity_score,
        has_embedding: embedding !== null,
        memory_type: memory_type,
        conversation_name: conversation_name
      },
      created_at: new Date().toISOString()
    });
    // Calculate vital signs
    const vitalSigns = {
      memory_health: adjusted_gravity_score > 0.3 ? 'healthy' : 'weak',
      cascade_potential: cascades.length,
      integration_status: adjusted_gravity_score > 0.7 ? 'high' : 'normal',
      semantic_searchable: embedding !== null,
      memory_type: memory_type
    };
    return new Response(JSON.stringify({
      success: true,
      primary: primaryData,
      cascades,
      vital_signs: vitalSigns,
      analysis: {
        gravity_classification: classifyGravity(adjusted_gravity_score),
        emotional_resonance: emotion !== 'neutral',
        requires_fusion: adjusted_gravity_score >= 0.7,
        has_embedding: embedding !== null,
        memory_type: memory_type,
        conversation_name: conversation_name || 'unnamed'
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Dispatcher error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      status: 'dispatcher_failure'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
function classifyGravity(score) {
  if (score >= 0.9) return 'critical';
  if (score >= 0.7) return 'significant';
  if (score >= 0.5) return 'moderate';
  if (score >= 0.3) return 'light';
  return 'minimal';
}
