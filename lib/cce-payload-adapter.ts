// ============================================
// CCE DISPATCHER PAYLOAD ADAPTER v1.2
// Fully aligned with CCE Dispatcher Schema
// ============================================

import type { IvyUnifiedMessage } from '../components/ivy-cognitive-interface';

// ============================================
// PAYLOAD TYPES (Matching Dispatcher Schema v1.2)
// ============================================

interface CCEDispatcherPayload {
  // === REQUIRED FIELDS ===
  user_id: string;
  content: string;
  
  // === SESSION & THREAD IDENTIFIERS ===
  session_id?: string;
  thread_id?: string;
  memory_trace_id?: string;
  conversation_name?: string;
  
  // === CLASSIFICATION FIELDS ===
  type?: string;
  topic?: string;
  summary?: string;
  
  // === EMOTIONAL & GRAVITY ===
  sentiment?: string;
  emotion?: string;
  gravity_score?: number;
  
  // === V5.0 SCHEMA FIELDS ===
  statement_type?: string;
  temporal_type?: string;
  episodic?: boolean;
  entities?: string[];
  relationship_strength?: number;
  identity_anchor?: boolean;
  contradiction_group?: string;
  confidence_score?: number;
  retrieval_score?: number;
  fusion_score?: number;
  overlay_context?: Record<string, any>;
  persona_overlay?: string;
  response_strategy?: string;
  blocker_type?: string;
  
  // === ORGANIZATIONAL ===
  org_id?: string;
  project_id?: string;
  meta_tags?: string[];
  t_valid?: string;
  
  // === METADATA OBJECT ===
  metadata?: {
    thread_id?: string;
    conversation_name?: string;
    statement_type?: string;
    temporal_type?: string;
    episodic?: boolean;
    entities?: string[];
    relationship_strength?: number;
    identity_anchor?: boolean;
    is_user_message?: boolean;
    memory_type?: 'user_input' | 'ivy_response';
    role?: 'user' | 'assistant';
    source?: string;
    [key: string]: any;
  };
}

// ============================================
// OUTGOING PAYLOAD PREPARATION
// ============================================

/**
 * Prepare frontend payload for CCE Dispatcher
 * Ensures full compliance with dispatcher schema v1.2
 */
export function prepareCCEPayload(input: {
  content: string;
  user_id: string;
  session_id?: string;
  thread_id?: string;
  memory_trace_id?: string;
  conversation_name?: string;
  emotion?: string;
  gravity_score?: number;
  isUserMessage: boolean;
  metadata?: Record<string, any>;
}): CCEDispatcherPayload {
  
  // Determine message type
  const messageType = input.isUserMessage ? 'user' : 'assistant';
  const memoryType = input.isUserMessage ? 'user_input' : 'ivy_response';
  
  // Base gravity score (will be auto-reduced by dispatcher for IVY)
  const baseGravity = input.gravity_score ?? (input.isUserMessage ? 0.5 : 0.3);
  
  return {
    // === REQUIRED FIELDS ===
    user_id: input.user_id,
    content: input.content,
    
    // === SESSION & THREAD IDENTIFIERS ===
    session_id: input.session_id,
    thread_id: input.thread_id,
    memory_trace_id: input.memory_trace_id || input.thread_id, // Fallback to thread_id
    conversation_name: input.conversation_name,
    
    // === CLASSIFICATION FIELDS ===
    type: messageType,
    
    // === EMOTIONAL & GRAVITY ===
    emotion: input.emotion || 'neutral',
    gravity_score: baseGravity,
    
    // === V5.0 DEFAULTS ===
    temporal_type: 'static',
    episodic: true,
    relationship_strength: 0.0,
    identity_anchor: false,
    confidence_score: 0.8,
    
    // === METADATA (with fallbacks) ===
    metadata: {
      // Dispatcher tracking
      source: 'chat',
      timestamp: new Date().toISOString(),
      dispatcher_target: 'gravity_map',
      
      // Message classification
      is_user_message: input.isUserMessage,
      memory_type: memoryType,
      role: messageType === 'user' ? 'user' : 'assistant',
      
      // Thread context
      thread_id: input.thread_id,
      conversation_name: input.conversation_name,
      
      // Session tracking
      session_id: input.session_id,
      
      // V5.0 defaults in metadata
      temporal_type: 'static',
      episodic: true,
      relationship_strength: 0.0,
      identity_anchor: false,
      
      // Merge any additional metadata
      ...input.metadata
    }
  };
}

// ============================================
// RESPONSE NORMALIZATION (FROM DISPATCHER)
// ============================================

/**
 * Normalize dispatcher response to unified message
 */
export function normalizeDispatcherResponse(response: any): IvyUnifiedMessage {
  // Extract from either root or metadata
  const getField = (field: string, defaultValue: any = null) => {
    return response[field] ?? 
           response.metadata?.[field] ?? 
           defaultValue;
  };
  
  // Determine role from type/memory_type
  const memoryType = getField('memory_type', 'ivy_response');
  const type = getField('type', 'assistant');
  const role = memoryType === 'user_input' ? 'user' : 'ivy';
  
  return {
    id: response.id || crypto.randomUUID(),
    role: role as any,
    content: response.content || '',
    
    // Gravity and scores
    gravity_score: response.gravity_score || 0.5,
    fusion_score: response.fusion_score,
    confidence_score: response.confidence_score,
    retrieval_score: response.retrieval_score,
    
    // Emotional
    emotion: response.emotion || null,
    emotion_type: response.sentiment || null,
    
    // Identifiers
    thread_id: getField('thread_id', null),
    session_id: getField('session_id', null),
    memory_trace_id: response.memory_trace_id || null,
    
    // Classification
    type: response.type || null,
    cognition_type: response.statement_type || null,
    statement_type: response.statement_type || null,
    
    // V5.0 fields
    temporal_type: getField('temporal_type', 'static'),
    episodic: getField('episodic', true),
    entities: getField('entities', []),
    relationship_strength: getField('relationship_strength', 0.0),
    identity_anchor: getField('identity_anchor', false),
    
    // Timestamps
    created_at: response.created_at || response.t_ingested || new Date().toISOString(),
    timestamp: response.created_at ? Date.parse(response.created_at) : Date.now(),
    
    // Source tracking
    source: response.source_table || 'gravity_map',
    
    // Raw reference
    raw: response
  };
}

// ============================================
// SPECIAL BEHAVIOR TRIGGERS
// ============================================

/**
 * Check if payload will trigger special CCE behaviors
 */
export function checkSpecialTriggers(payload: CCEDispatcherPayload): {
  willTriggerFusion: boolean;
  willTriggerPatternDetection: boolean;
  willTriggerReflection: boolean;
  willGenerateEmbedding: boolean;
} {
  const gravityScore = payload.gravity_score || 0;
  const emotion = payload.emotion || 'neutral';
  const identityAnchor = payload.identity_anchor || payload.metadata?.identity_anchor || false;
  const isUserMessage = payload.type === 'user' || 
                        payload.metadata?.is_user_message || 
                        payload.metadata?.memory_type === 'user_input';
  
  return {
    willTriggerFusion: gravityScore >= 0.7,
    willTriggerPatternDetection: emotion !== 'neutral',
    willTriggerReflection: identityAnchor === true,
    willGenerateEmbedding: isUserMessage
  };
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate payload before sending to dispatcher
 */
export function validateCCEPayload(payload: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!payload.user_id) {
    errors.push('user_id is required');
  }
  if (!payload.content) {
    errors.push('content is required');
  }
  
  // Check critical fields
  if (!payload.session_id) {
    warnings.push('session_id is recommended for session tracking');
  }
  if (!payload.type && !payload.metadata?.is_user_message) {
    warnings.push('type or metadata.is_user_message should be set to distinguish user vs IVY');
  }
  if (!payload.conversation_name && !payload.metadata?.conversation_name) {
    warnings.push('conversation_name is recommended for organization');
  }
  
  // Validate ranges
  if (payload.gravity_score !== undefined) {
    if (payload.gravity_score < 0 || payload.gravity_score > 1) {
      errors.push('gravity_score must be between 0 and 1');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================
// QUICK PAYLOAD BUILDERS
// ============================================

/**
 * Create minimal user message payload
 */
export function createUserPayload(
  user_id: string,
  content: string,
  session_id: string,
  thread_id?: string,
  conversation_name?: string
): CCEDispatcherPayload {
  return prepareCCEPayload({
    user_id,
    content,
    session_id,
    thread_id,
    conversation_name: conversation_name || 'Chat Session',
    isUserMessage: true,
    gravity_score: 0.5
  });
}

/**
 * Create minimal IVY response payload
 */
export function createIvyPayload(
  user_id: string,
  content: string,
  session_id: string,
  thread_id?: string,
  conversation_name?: string,
  gravity_score = 0.3
): CCEDispatcherPayload {
  return prepareCCEPayload({
    user_id,
    content,
    session_id,
    thread_id,
    conversation_name: conversation_name || 'Chat Session',
    isUserMessage: false,
    gravity_score // Will be auto-reduced by dispatcher
  });
}
