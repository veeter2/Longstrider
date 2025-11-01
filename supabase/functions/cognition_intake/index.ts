//cognition_intake v5.1 - ALIGNED WITH DISPATCHER v1.2
import { serve } from "https://deno.land/std@0.214.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Performance flag - set to false in production for max speed
const DEBUG_MODE = Deno.env.get("DEBUG_MODE") === "true";
const log = DEBUG_MODE ? console.log : ()=>{};
const logWarn = DEBUG_MODE ? console.warn : ()=>{};
const logError = console.error; // Always log errors
// CORS headers for compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
// Memory Contract - fields that MUST exist for gravity/recall to work
const MEMORY_CONTRACT_FIELDS = {
  memory_trace_id: {
    required: false,
    type: 'string'
  },
  user_id: {
    required: true,
    type: 'string'
  },
  content: {
    required: true,
    type: 'string',
    minLength: 1
  },
  gravity_score: {
    required: false,
    type: 'number',
    default: 0.5
  },
  cognition_type: {
    required: false,
    type: 'string'
  },
  created_at: {
    required: false,
    type: 'string'
  }
};
// OPTIMIZED: Cache for field lookups
class FieldCache {
  constructor(parsed){
    this.parsed = parsed;
    this.cache = new Map();
  }
  // OPTIMIZED: Iterative deep search instead of recursive
  findField(fieldName) {
    // Check cache first
    if (this.cache.has(fieldName)) {
      return this.cache.get(fieldName);
    }
    // Stack-based iterative search (faster than recursion)
    const stack = [
      {
        obj: this.parsed,
        depth: 0
      }
    ];
    const visited = new WeakSet();
    while(stack.length > 0){
      const { obj, depth } = stack.pop();
      if (!obj || typeof obj !== 'object' || depth > 5 || visited.has(obj)) continue;
      visited.add(obj);
      // Direct match
      if (obj[fieldName] !== undefined && obj[fieldName] !== null) {
        this.cache.set(fieldName, obj[fieldName]);
        return obj[fieldName];
      }
      // Add nested objects to stack
      const searchPaths = [
        obj.metadata,
        obj.processing_metadata,
        obj.meta,
        obj.context,
        obj.consciousness_context,
        obj.memory_significance
      ];
      for (const path of searchPaths){
        if (path && typeof path === 'object') {
          stack.push({
            obj: path,
            depth: depth + 1
          });
        }
      }
      // Add all object properties
      for(const key in obj){
        if (typeof obj[key] === 'object' && key !== fieldName) {
          stack.push({
            obj: obj[key],
            depth: depth + 1
          });
        }
      }
    }
    this.cache.set(fieldName, null);
    return null;
  }
  // Batch find multiple fields at once
  findFields(fieldNames) {
    const results = {};
    for (const field of fieldNames){
      results[field] = this.findField(field);
    }
    return results;
  }
}
// OPTIMIZED: Fast payload normalizer with caching
class PayloadNormalizer {
  constructor(parsed){
    this.parsed = parsed;
    this.fieldCache = new FieldCache(parsed);
    this.normalized = null;
  }
  normalize() {
    // Return cached result if already normalized
    if (this.normalized) return this.normalized;
    const now = new Date().toISOString();
    // Extract all fields in one pass
    const memory_trace_id = this.findMemoryTraceId();
    const thread_id = this.findThreadId(); // NEW: Find thread_id
    const conversation_name = this.findConversationName(); // NEW: Find conversation_name
    const user_id = this.findUserId();
    const session_id = this.findSessionId();
    const content = this.findContent();
    const type = this.findType();
    const topic = this.fieldCache.findField('topic') || `${type} from ${user_id}`;
    const summary = this.fieldCache.findField('summary') || content.substring(0, 100);
    const sentiment = this.fieldCache.findField('sentiment');
    const emotion = this.findEmotion();
    const gravity_score = this.findGravityScore();

    // Compute 8D behavioral vector for pattern detection
    const behavioralVector = this.computeBehavioralVector(
      emotion, sentiment, gravity_score, type, content
    );
    // Build the complete memory object with ALL v5.0 fields
    this.normalized = {
      id: crypto.randomUUID(),
      memory_trace_id,
      thread_id,
      conversation_name,
      user_id,
      session_id,
      // Core Content
      content,
      type,
      topic,
      summary,
      sentiment,
      emotion,
      gravity_score,
      // Timestamps - use parsed.created_at if available
      created_at: this.parsed.created_at || now,
      last_engaged: null,
      t_valid: this.parsed.t_valid ? new Date(this.parsed.t_valid).toISOString() : now,
      t_ingested: now,
      // Tagging Dimensions
      statement_type: this.parsed.statement_type || null,
      temporal_type: this.parsed.temporal_type || "static",
      episodic: this.parsed.episodic !== undefined ? this.parsed.episodic : true,
      entities: Array.isArray(this.parsed.entities) && this.parsed.entities.length > 0 ? this.parsed.entities : extractBasicEntities(this.parsed.content || ''),
      relationship_strength: this.parsed.relationship_strength ? parseFloat(this.parsed.relationship_strength) : 0.0,
      identity_anchor: this.parsed.identity_anchor !== undefined ? this.parsed.identity_anchor : extractBasicEntities(this.parsed.content || '').some((e)=>[
          'Blu',
          'Matt',
          'Atlas',
          'Ivy'
        ].some((anchor)=>e.toLowerCase().includes(anchor.toLowerCase()))),
      // Contradictions & Confidence
      contradiction_group: this.parsed.contradiction_group || null,
      confidence_score: this.parsed.confidence_score ? parseFloat(this.parsed.confidence_score) : null,
      retrieval_score: this.parsed.retrieval_score ? parseFloat(this.parsed.retrieval_score) : null,
      fusion_score: this.parsed.fusion_score ? parseFloat(this.parsed.fusion_score) : null,
      // Overlays
      overlay_context: this.parsed.overlay_context || null,
      persona_overlay: this.parsed.persona_overlay || null,
      response_strategy: this.parsed.response_strategy || null,
      blocker_type: this.parsed.blocker_type || null,
      source_table: this.parsed.source_table || "gravity_map",
      // Lifecycle & Status
      status: this.parsed.status || "active",
      // Enterprise Multi-Tenancy
      org_id: this.parsed.org_id || null,
      project_id: this.parsed.project_id || null,
      // Flexible Tags + Metadata
      meta_tags: Array.isArray(this.parsed.meta_tags) ? this.parsed.meta_tags : [],
      metadata: this.mergeAllMetadata(),
      // Behavioral vector for pattern detection
      cce_optimizations: {
        vector: behavioralVector,
        computed_at: now
      }
    };
    return this.normalized;
  }

  // Compute 8D behavioral vector for pattern detection
  // [0] emotion_valence, [1] cognitive_load, [2] temporal_urgency, [3] identity_relevance
  // [4] contradiction_score, [5] pattern_strength, [6] relationship_impact, [7] action_potential
  computeBehavioralVector(emotion, sentiment, gravity_score, type, content) {
    // [0] Emotion valence (-1 to 1)
    let emotion_valence = 0;
    if (emotion) {
      const emotionLower = emotion.toLowerCase();
      if (['joy', 'love', 'excitement', 'gratitude', 'hope'].some(e => emotionLower.includes(e))) {
        emotion_valence = 0.7;
      } else if (['sadness', 'fear', 'anger', 'anxiety', 'frustration'].some(e => emotionLower.includes(e))) {
        emotion_valence = -0.7;
      } else if (['curious', 'interested', 'calm'].some(e => emotionLower.includes(e))) {
        emotion_valence = 0.3;
      }
    }
    if (sentiment) {
      if (sentiment === 'positive') emotion_valence += 0.2;
      else if (sentiment === 'negative') emotion_valence -= 0.2;
    }
    emotion_valence = Math.max(-1, Math.min(1, emotion_valence));

    // [1] Cognitive load (0 to 1)
    const questionWords = ['why', 'how', 'what', 'when', 'where', 'should', 'could', 'would'];
    const hasQuestion = questionWords.some(w => content.toLowerCase().includes(w + ' '));
    const wordCount = content.split(/\s+/).length;
    let cognitive_load = hasQuestion ? 0.6 : 0.3;
    if (wordCount > 100) cognitive_load += 0.2;
    if (type === 'reflection' || type === 'analysis') cognitive_load += 0.3;
    cognitive_load = Math.min(1, cognitive_load);

    // [2] Temporal urgency (0 to 1)
    const urgentWords = ['now', 'urgent', 'asap', 'immediately', 'today', 'need', 'must'];
    const temporal_urgency = urgentWords.some(w => content.toLowerCase().includes(w)) ? 0.8 : 0.3;

    // [3] Identity relevance (0 to 1)
    const identityWords = ['i am', 'i feel', 'i think', 'i believe', 'my', 'me', 'myself'];
    const identity_relevance = identityWords.some(w => content.toLowerCase().includes(w)) ? 0.7 : 0.2;

    // [4] Contradiction score (0 to 1)
    const contradictionWords = ['but', 'however', 'although', 'yet', 'though', 'conflicted'];
    const contradiction_score = contradictionWords.some(w => content.toLowerCase().includes(w)) ? 0.6 : 0.1;

    // [5] Pattern strength (0 to 1) - based on gravity
    const pattern_strength = Math.min(1, gravity_score || 0.5);

    // [6] Relationship impact (0 to 1)
    const relationshipWords = ['we', 'us', 'together', 'relationship', 'friend', 'family', 'partner'];
    const relationship_impact = relationshipWords.some(w => content.toLowerCase().includes(w)) ? 0.7 : 0.2;

    // [7] Action potential (0 to 1)
    const actionWords = ['will', 'going to', 'plan', 'want to', 'should', 'need to', 'trying'];
    const action_potential = actionWords.some(w => content.toLowerCase().includes(w)) ? 0.7 : 0.3;

    return [
      emotion_valence,
      cognitive_load,
      temporal_urgency,
      identity_relevance,
      contradiction_score,
      pattern_strength,
      relationship_impact,
      action_potential
    ];
  }

  findMemoryTraceId() {
    const candidates = [
      this.parsed.memory_trace_id,
      this.fieldCache.findField('memory_trace_id'),
      this.fieldCache.findField('trace_id'),
      this.parsed.metadata?.memory_trace_id,
      this.parsed.trace_id // Added direct trace_id check
    ];
    for (const candidate of candidates){
      if (candidate) {
        return candidate;
      }
    }
    return null;
  }
  // NEW: Find thread_id from multiple possible locations
  findThreadId() {
    const candidates = [
      this.parsed.thread_id,
      this.parsed.metadata?.thread_id,
      this.fieldCache.findField('thread_id'),
      this.parsed.threadId,
      this.parsed.metadata?.threadId
    ];
    for (const candidate of candidates){
      if (candidate) return candidate;
    }
    return null;
  }
  // NEW: Find conversation_name from multiple possible locations
  findConversationName() {
    const candidates = [
      this.parsed.conversation_name,
      this.parsed.metadata?.conversation_name,
      this.fieldCache.findField('conversation_name'),
      this.parsed.conversationName,
      this.parsed.metadata?.conversationName
    ];
    for (const candidate of candidates){
      if (candidate) return candidate;
    }
    return null;
  }
  findContent() {
    // Direct field access first (fastest)
    if (this.parsed.content && typeof this.parsed.content === 'string' && this.parsed.content.trim()) {
      return this.parsed.content;
    }
    // Try other common field names
    const contentFields = [
      'content',
      'memory_content',
      'text',
      'message',
      'input',
      'body'
    ];
    for (const field of contentFields){
      const value = this.parsed[field] || this.fieldCache.findField(field);
      if (value && typeof value === 'string' && value.trim()) {
        return value;
      }
    }
    return null; // CHANGED: Return null to trigger validation error
  }
  findType() {
    // CLARIFIED: type is structural (memory, reflection, system_event, source_code)
    const type = this.parsed.type || this.parsed.memory_type || this.fieldCache.findField('type') || 'memory';
    return type;
  }
  findUserId() {
    const userId = this.parsed.user_id || this.parsed.userId || this.fieldCache.findField('user_id') || this.fieldCache.findField('userId');
    return userId;
  }
  findSessionId() {
    return this.parsed.session_id || this.parsed.sessionId || this.fieldCache.findField('session_id') || this.fieldCache.findField('sessionId');
  }
  findGravityScore() {
    const score = this.parsed.gravity_score || this.parsed.memory_significance?.gravity_score || this.fieldCache.findField('gravity_score') || this.fieldCache.findField('gravity');
    const finalScore = score !== null && score !== undefined ? parseFloat(score) : 0.5;
    return finalScore;
  }
  findEmotion() {
    return this.parsed.emotion || this.fieldCache.findField('emotion') || this.parsed.sentiment || this.fieldCache.findField('sentiment');
  }
  mergeAllMetadata() {
    // NEW: Detect if this is a user message or IVY response
    const isUserMessage = this.detectIfUserMessage();
    return {
      ...this.parsed.metadata,
      ...this.parsed.processing_metadata,
      ...this.parsed.consciousness_context,
      ...this.parsed.memory_significance,
      normalized_at: new Date().toISOString(),
      intake_version: "5.1-aligned",
      trace_continued: false,
      original_type: this.parsed.type,
      // NEW: Critical signals for dispatcher
      is_user_message: isUserMessage,
      memory_type: isUserMessage ? 'user_input' : 'ivy_response',
      role: this.parsed.role || (isUserMessage ? 'user' : 'assistant'),
      thread_id: this.findThreadId(),
      conversation_name: this.findConversationName()
    };
  }
  // NEW: Detect if this is a user message vs IVY response
  detectIfUserMessage() {
    // Check multiple signals to determine if it's a user message
    const isUser = this.parsed.role === 'user' || this.parsed.type === 'user' || this.parsed.metadata?.is_user_message === true || this.parsed.metadata?.role === 'user' || this.parsed.metadata?.memory_type === 'user_input' || this.parsed.message_type === 'user_input' || this.parsed.is_user_message === true;
    return isUser;
  }
}
// OPTIMIZED: Exponential backoff for retries
async function insertWithRetry(supabase, table, data, maxRetries = 3) {
  let lastError;
  for(let attempt = 0; attempt < maxRetries; attempt++){
    const { error } = await supabase.from(table).insert([
      data
    ]);
    if (!error) return {
      success: true,
      error: null
    };
    lastError = error;
    if (attempt < maxRetries - 1) {
      // Exponential backoff: 100ms, 200ms, 400ms...
      const delay = 100 * Math.pow(2, attempt);
      await new Promise((resolve)=>setTimeout(resolve, delay));
    }
  }
  return {
    success: false,
    error: lastError
  };
}
// Helper: Extract entities from content
function extractBasicEntities(content) {
  const detected = [];
  const tokens = content.split(/\s+/);
  for (const w of tokens){
    const cleaned = w.replace(/[^a-zA-Z]/g, "");
    if (!cleaned) continue;
    if (cleaned[0] === cleaned[0]?.toUpperCase() && cleaned.length > 2) {
      if (!detected.includes(cleaned) && ![
        "The",
        "This",
        "That",
        "What",
        "When",
        "Where",
        "How",
        "Show",
        "Find"
      ].includes(cleaned)) {
        detected.push(cleaned);
      }
    }
  }
  return detected;
}
// Helper: Safe number conversion
function safeNumber(val, defaultVal = 0) {
  const num = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(num) || !isFinite(num) ? defaultVal : num;
}
// Update conversation gravity field after message storage
async function updateConversationGravityField(supabase, session_id, new_memory) {
  try {
    // Get current session with gravity field
    const { data: session } = await supabase.from('active_sessions').select('gravity_field').eq('session_id', session_id).single();
    let field = session?.gravity_field || {
      total_mass: 0,
      entity_anchors: {},
      high_gravity_memories: [],
      conversation_vector: null
    };
    // Accumulate gravity
    const memoryGravity = safeNumber(new_memory.gravity_score, 0);
    field.total_mass = safeNumber(field.total_mass, 0) + memoryGravity;
    // Track high gravity anchors (keep last 5)
    if (memoryGravity > 0.7) {
      field.high_gravity_memories = [
        new_memory.id,
        ...(field.high_gravity_memories || []).slice(0, 4)
      ];
    }
    // Update entity anchors with gravity accumulation
    const entities = extractBasicEntities(new_memory.content || '');
    entities.forEach((entity)=>{
      const currentGravity = safeNumber(field.entity_anchors[entity], 0);
      field.entity_anchors[entity] = currentGravity + memoryGravity;
    });
    // Update the session
    const { error } = await supabase.from('active_sessions').update({
      gravity_field: field
    }).eq('session_id', session_id);
    if (error) {
      logError('[updateConversationGravityField] Update error:', error);
    }
    return field;
  } catch (err) {
    logError('[updateConversationGravityField] Error:', err);
    return null;
  }
}
// MAIN HANDLER - OPTIMIZED
serve(async (req)=>{
  // FAST PATH: Handle CORS immediately
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method Not Allowed"
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 405
    });
  }
  // Parse request ONCE
  let parsed;
  try {
    parsed = await req.json();
    // SLIM LOGGING: Only essential info
    if (DEBUG_MODE) {
      log("🚀 cognition_intake v5.1 - Aligned with Dispatcher v1.2");
    }
  } catch (err) {
    return new Response(JSON.stringify({
      error: "Invalid JSON",
      detail: err.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
  // EARLY VALIDATION - Fail fast with CONTRACT ENFORCEMENT
  const normalizer = new PayloadNormalizer(parsed);
  const user_id = normalizer.findUserId();
  const content = normalizer.findContent();
  // CONTRACT: user_id required
  if (!user_id) {
    logError("❌ Contract violation: missing user_id");
    return new Response(JSON.stringify({
      error: "Contract violation",
      detail: "user_id is required",
      contract_field: "user_id"
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
  // CONTRACT: content required and non-empty
  if (!content || content.trim().length === 0) {
    logError("❌ Contract violation: missing or empty content");
    return new Response(JSON.stringify({
      error: "Contract violation",
      detail: "content is required and must be non-empty",
      contract_field: "content"
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
  // Initialize Supabase client AFTER validation
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  // REMOVED: Cortex instructions moved to response engine only to prevent data bloat
  // Get the normalized memory object
  const memory = normalizer.normalize();
  // SLIM LOGGING: Only essentials
  if (DEBUG_MODE) {
    log(`👤 User: ${user_id}`);
    log(`📍 Trace: ${memory.memory_trace_id || 'will generate'}`);
    log(`🧵 Thread: ${memory.thread_id || 'none'}`);
    log(`💬 Conversation: ${memory.conversation_name || 'unnamed'}`);
    log(`📏 Content length: ${content.length}`);
    log(`🎭 Message type: ${memory.metadata.memory_type}`);
  }
  // Handle memory_trace_id resolution
  if (!memory.memory_trace_id) {
    try {
      // OPTIMIZED: Use single query with proper indexing
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: recentMemory, error: lookupError } = await supabase.from("gravity_map").select("memory_trace_id").eq("user_id", user_id).gte("created_at", thirtyMinutesAgo).order("created_at", {
        ascending: false
      }).limit(1);
      if (!lookupError && recentMemory?.length > 0) {
        memory.memory_trace_id = recentMemory[0].memory_trace_id;
        memory.metadata.trace_continued = true;
      } else {
        memory.memory_trace_id = crypto.randomUUID();
      }
    } catch (err) {
      logError("Trace lookup failed:", err);
      memory.memory_trace_id = crypto.randomUUID();
    }
  } else {
    // Check if trace exists
    const { count, error: countError } = await supabase.from("gravity_map").select("id", {
      count: 'exact',
      head: true
    }).eq("memory_trace_id", memory.memory_trace_id);
    if (!countError && count !== null) {
      memory.metadata.trace_continued = count > 0;
    }
  }
  // Special handling for source code (separate flow) - KEEP AS IS
  if (memory.type === "source_code") {
    const { error: codeError } = await supabase.from("ai_mri_scan").insert([
      {
        user_id: memory.user_id,
        session_id: memory.session_id,
        type: memory.type,
        function_name: parsed.function_name || "unnamed_function",
        version_tag: parsed.version_tag || "v0.1",
        source_code: parsed.source_code || memory.content,
        component_scope: parsed.component_scope,
        summary: memory.summary,
        timestamp: memory.created_at,
        metadata: memory.metadata
      }
    ]);
    if (codeError) {
      logError("❌ Failed to insert source_code:", codeError);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to insert source_code",
        detail: codeError.message
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    return new Response(JSON.stringify({
      success: true,
      status: "Source code stored",
      target: "ai_mri_scan"
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  }
  // ============================================
  // DISPATCHER ONLY - ALIGNED WITH v1.2
  // ============================================
  try {
    // Prepare payload for dispatcher with COMPLETE ALIGNMENT
    const dispatcherPayload = {
      // Core fields the dispatcher expects
      user_id: memory.user_id,
      session_id: memory.session_id,
      thread_id: memory.thread_id,
      conversation_name: memory.conversation_name,
      content: memory.content,
      // Pass through all the normalized fields AT ROOT LEVEL
      memory_trace_id: memory.memory_trace_id,
      type: memory.type,
      topic: memory.topic,
      summary: memory.summary,
      sentiment: memory.sentiment,
      emotion: memory.emotion,
      gravity_score: memory.gravity_score,
      // REMOVED: cortex_instructions to prevent data bloat
      // V5.0 fields AT ROOT LEVEL (not just in metadata)
      statement_type: memory.statement_type,
      temporal_type: memory.temporal_type,
      episodic: memory.episodic,
      entities: memory.entities,
      relationship_strength: memory.relationship_strength,
      identity_anchor: memory.identity_anchor,
      contradiction_group: memory.contradiction_group,
      confidence_score: memory.confidence_score,
      retrieval_score: memory.retrieval_score,
      fusion_score: memory.fusion_score,
      overlay_context: memory.overlay_context,
      persona_overlay: memory.persona_overlay,
      response_strategy: memory.response_strategy,
      blocker_type: memory.blocker_type,
      // Timestamps
      t_valid: memory.t_valid,
      // Multi-tenancy
      org_id: memory.org_id,
      project_id: memory.project_id,
      meta_tags: memory.meta_tags,
      // Metadata with CRITICAL SIGNALS for dispatcher
      metadata: {
        ...memory.metadata,
        // CRITICAL: Memory type signals for dispatcher v1.2
        is_user_message: memory.metadata.is_user_message,
        memory_type: memory.metadata.memory_type,
        role: memory.metadata.role,
        // Thread and conversation tracking
        thread_id: memory.thread_id,
        conversation_name: memory.conversation_name,
        // Include intake processing info
        intake_version: "5.1-aligned",
        normalized_at: memory.metadata.normalized_at,
        trace_continued: memory.metadata.trace_continued,
        original_type: memory.type,
        source_table: memory.source_table
      }
    };
    // Call the dispatcher
    const dispatcherUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/cce-dispatcher`;
    const dispatcherResponse = await fetch(dispatcherUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dispatcherPayload)
    });
    if (!dispatcherResponse.ok) {
      const errorText = await dispatcherResponse.text();
      throw new Error(`Dispatcher returned ${dispatcherResponse.status}: ${errorText}`);
    }
    const dispatcherResult = await dispatcherResponse.json();
    // Update gravity field for session (non-blocking)
    if (memory.session_id && (dispatcherResult.primary?.gravity_score || memory.gravity_score)) {
      updateConversationGravityField(supabase, memory.session_id, {
        id: dispatcherResult.primary?.id || memory.id,
        content: memory.content,
        gravity_score: dispatcherResult.primary?.gravity_score || memory.gravity_score
      }).catch((err)=>logError('[Gravity Field Update] Failed:', err));
    }

    // PHASE 1: Broadcast Realtime event for immediate UI updates
    if (dispatcherResult.primary?.id) {
      try {
        // Use unique channel name per user to avoid conflicts
        const channelName = `memory_events:${memory.user_id}`;
        const channel = supabase.channel(channelName);
        
        // Subscribe before sending (required for broadcast)
        await channel.subscribe();
        
        // Broadcast memory_created event
        const broadcastPayload = {
          memory_id: dispatcherResult.primary.id,
          user_id: memory.user_id,
          session_id: memory.session_id || null,
          thread_id: memory.thread_id || null,
          memory_trace_id: memory.memory_trace_id || null,
          gravity_score: dispatcherResult.primary.gravity_score || memory.gravity_score || 0.5,
          emotion: memory.emotion || 'neutral',
          content_preview: memory.content?.substring(0, 100) || '',
          entities: memory.entities || [],
          created_at: new Date().toISOString(),
          type: memory.type || 'user_input'
        };

        const { error: broadcastError } = await channel.send({
          type: 'broadcast',
          event: 'memory_created',
          payload: broadcastPayload
        });

        if (broadcastError) {
          logError('[Realtime] Broadcast failed for memory:', dispatcherResult.primary.id, broadcastError);
        } else {
          log('📡 Realtime event broadcast for memory:', dispatcherResult.primary.id);
        }

        // Cleanup: unsubscribe after broadcast (non-blocking)
        channel.unsubscribe().catch((err) => logWarn('[Realtime] Unsubscribe warning:', err));
      } catch (realtimeError) {
        // Non-critical - don't block response
        logError('[Realtime] Broadcast error for memory:', dispatcherResult.primary.id, realtimeError);
      }
    }

    // Return enhanced response with dispatcher info
    return new Response(JSON.stringify({
      success: true,
      status: "Memory processed through dispatcher v1.2",
      // Primary routing info
      primary: dispatcherResult.primary,
      // Cascade info
      cascades: dispatcherResult.cascades,
      cascade_count: dispatcherResult.cascades?.length || 0,
      // Vital signs from dispatcher
      vital_signs: dispatcherResult.vital_signs,
      // Original memory info
      memory_id: dispatcherResult.primary?.id || memory.id,
      memory_trace_id: memory.memory_trace_id,
      thread_id: memory.thread_id,
      conversation_name: memory.conversation_name,
      memory_type: memory.metadata.memory_type,
      trace_continued: memory.metadata.trace_continued,
      gravity_score: dispatcherResult.primary?.gravity_score || memory.gravity_score,
      type: memory.type,
      content_stored: true,
      // v5.0 confirmation fields
      v5_fields: {
        temporal_type: memory.temporal_type,
        statement_type: memory.statement_type,
        episodic: memory.episodic,
        entities_count: memory.entities.length,
        has_contradictions: memory.contradiction_group !== null,
        has_overlays: memory.overlay_context !== null || memory.persona_overlay !== null
      },
      // Dispatcher analysis
      dispatcher_analysis: dispatcherResult.analysis
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (dispatcherError) {
    logError("❌ Dispatcher call failed:", dispatcherError);
    // FALLBACK: Direct insert to gravity_map if dispatcher fails
    const { success, error: insertError } = await insertWithRetry(supabase, "gravity_map", memory);
    if (!success) {
      // Log the complete failure
      await supabase.from("meta_memory_log").insert([
        {
          user_id: memory.user_id,
          type: "system_event",
          content: `Dispatcher and fallback both failed: ${dispatcherError.message} | ${insertError?.message}`,
          metadata: {
            dispatcher_error: dispatcherError.message,
            fallback_error: insertError,
            attempted_table: "gravity_map",
            original_payload: memory,
            timestamp: new Date().toISOString()
          }
        }
      ]).catch((e)=>logError("Failed to log error:", e));
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to process memory through dispatcher and fallback",
        dispatcher_error: dispatcherError.message,
        fallback_error: insertError?.message
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    // Fallback succeeded
    return new Response(JSON.stringify({
      success: true,
      status: "Memory stored via fallback",
      fallback_used: true,
      target: "gravity_map",
      memory_id: memory.id,
      memory_trace_id: memory.memory_trace_id,
      thread_id: memory.thread_id,
      conversation_name: memory.conversation_name,
      memory_type: memory.metadata.memory_type,
      trace_continued: memory.metadata.trace_continued,
      gravity_score: memory.gravity_score,
      type: memory.type,
      dispatcher_error: dispatcherError.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  }
});
