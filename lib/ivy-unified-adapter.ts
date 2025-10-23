// ============================
// IVY UNIFIED ADAPTER
// Adapts backend SSE responses to frontend message format
// ============================

export interface IvyUnifiedMessage {
  id: string
  role: "user" | "ivy" | "system"
  content: string
  timestamp: number
  emotion?: string
  gravity?: number
  memories?: any[]
  patterns?: any[]
  constellation?: any
  emotionalField?: any
  streaming?: boolean
}

/**
 * Adapt backend SSE response data to unified message format
 */
export function adaptResponse(data: any): Partial<IvyUnifiedMessage> {
  return {
    content: data.content || data.ivy_response || data.finalText || "",
    emotion: data.emotion || data.emotion_type,
    gravity: data.gravity_score || data.gravity || 0.5,
    memories: data.memories || data.memory_constellation?.entries,
    patterns: data.patterns,
    constellation: data.memory_constellation,
    emotionalField: data.emotional_field,
    streaming: false,
  }
}

/**
 * Map backend message to frontend message format
 */
export function mapToIvyMessage(backendMessage: any): IvyUnifiedMessage {
  return {
    id: backendMessage.id || backendMessage.message_id || crypto.randomUUID(),
    role: backendMessage.role || backendMessage.type || "ivy",
    content: backendMessage.content || backendMessage.message || "",
    timestamp: backendMessage.timestamp || backendMessage.created_at || Date.now(),
    emotion: backendMessage.emotion || backendMessage.emotion_type,
    gravity: backendMessage.gravity_score || backendMessage.gravity || 0.5,
    memories: backendMessage.memories,
    patterns: backendMessage.patterns,
    constellation: backendMessage.memory_constellation,
    emotionalField: backendMessage.emotional_field,
    streaming: backendMessage.streaming || false,
  }
}

export function prepareOutgoingPayload(message: string, userId: string, sessionId: string): any {
  return {
    user_id: userId,
    session_id: sessionId,
    content: message,
    timestamp: Date.now(),
    type: "user",
  }
}
