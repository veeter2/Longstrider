// =================================================
// IVY SSE SERVICE - Server-Sent Events Handler
// Manages all streaming communication with backend
// =================================================

import { getIvyConfig } from "./supabase";
// Removed unused ivy-unified-adapter import since we only handle SSE now

// Types for SSE events
export type SSEEventType =
  | 'connection_established'
  | 'processing_start'
  | 'status'
  | 'memory_surfacing'
  | 'pattern_emerging'
  | 'mode_selected'
  | 'response_token'
  | 'response_complete'
  | 'error'
  | 'ivy_thought'
  | 'ivy_insight'
  | 'ivy_contradiction'
  | 'memory_depth'
  | 'pattern_count';

export interface SSEMemory {
  content: string;
  gravity: number;
  emotion: string;
}

export interface SSEPattern {
  pattern: string;
  strength: number;
}

export interface SSECallbacks {
  onConnectionEstablished?: () => void;
  onProcessingPhase?: (phase: string) => void;
  onMemorySurfacing?: (memory: SSEMemory) => void;
  onPatternEmerging?: (pattern: SSEPattern) => void;
  onModeSelected?: (mode: string) => void;
  onToken?: (token: string, messageId: string) => void;
  onResponseComplete?: (data: any) => void;
  onError?: (error: string) => void;
  onDebug?: (message: string, data?: any) => void;
  onIvyThought?: (thought: string) => void;
  onIvyInsight?: (insight: string) => void;
  onIvyContradiction?: (contradiction: string) => void;
  onMemoryDepth?: (depth: number) => void;
  onPatternCount?: (count: number) => void;
  onMetaEvent?: (eventType: string, data: any) => void;
}

export interface SendMessageOptions {
  text: string;
  isRetry?: boolean;
  sessionId: string;
  memoryTraceId: string;
  userId: string;
  messageCount: number;
  userMessageCount: number;
  firstMessageTimestamp?: number;
  retryCount: number;
  conversationName?: string;
  threadId?: string;
}

export class IvySSEService {
  private abortController: AbortController | null = null;
  private callbacks: SSECallbacks = {};
  private messageAccumulator = new Map<string, string>();
  private sendingLock = false;

  constructor(callbacks?: SSECallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  /**
   * Update callbacks dynamically
   */
  public setCallbacks(callbacks: SSECallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Handle incoming SSE message with comprehensive error protection
   */
  private handleSSEMessage(data: any, streamingMessageId: string | null) {
    if (!data || typeof data !== 'object') {
      console.warn('[SSE] Invalid data received:', data);
      return;
    }

    const {
      onConnectionEstablished,
      onProcessingPhase,
      onMemorySurfacing,
      onPatternEmerging,
      onModeSelected,
      onToken,
      onResponseComplete,
      onError,
      onDebug,
      onIvyThought,
      onIvyInsight,
      onIvyContradiction,
      onMemoryDepth,
      onPatternCount,
      onMetaEvent
    } = this.callbacks;

    onDebug?.('[SSE] Message received', { type: data.type, streamingMessageId, data });

    try {
      switch (data.type) {
        case 'connection_established':
          onConnectionEstablished?.();
          break;

        case 'processing_start':
        case 'status':
          if (data.message || data.phase) {
            onProcessingPhase?.(data.message || data.phase);
          }
          break;

        case 'consciousness_processing':
          if (data.mode) {
            onModeSelected?.(data.mode);
          }
          if (data.progress !== undefined) {
            const modeEmoji = {
              flow: '🌊',
              resonance: '🎵',
              revelation: '💡',
              fusion: '🔮',
              emergence: '✨'
            }[data.mode] || '🧠';
            onProcessingPhase?.(`${modeEmoji} ${data.mode} (${Math.round(data.progress * 100)}%)`);
          }
          break;

        case 'memory_surfacing':
          // Handle both array and single memory
          if (data.memories && Array.isArray(data.memories)) {
            data.memories.forEach((memory: any) => onMemorySurfacing?.(memory));
            if (data.count) {
              onProcessingPhase?.(`Recalling ${data.count} memories...`);
            }
          } else if (data.memory) {
            onMemorySurfacing?.(data.memory);
          }
          break;

        case 'pattern_emerging':
          if (data.pattern) {
            onPatternEmerging?.({
              pattern: data.pattern,
              strength: data.strength || 0.5
            });
          }
          break;

        case 'mode_selected':
          if (data.mode) {
            onModeSelected?.(data.mode);
          }
          break;

        case 'response_token':
          if (data.token && streamingMessageId && typeof data.token === 'string') {
            try {
              const currentText = this.messageAccumulator.get(streamingMessageId) || '';
              const newText = currentText + data.token;
              this.messageAccumulator.set(streamingMessageId, newText);

              onDebug?.('[SSE] Token received:', {
                tokenLength: data.token.length,
                totalLength: newText.length,
                token: data.token.length > 50 ? data.token.substring(0, 50) + '...' : data.token
              });

              onToken?.(data.token, streamingMessageId);
            } catch (tokenError) {
              console.error('[SSE] Error processing token:', tokenError);
            }
          }
          break;

        case 'response_complete':
          console.log('[SSE] response_complete RAW DATA:', data);

          if (streamingMessageId) {
            try {
              // Prioritize accumulated tokens over backend text (for true streaming)
              const accumulatedText = this.messageAccumulator.get(streamingMessageId) || '';
              const backendText = data.content || data.ivy_response || data.finalText || '';

              // Use accumulated if it exists (from tokens), otherwise use backend text
              const finalText = accumulatedText || backendText;

              console.log('[SSE] Text extraction:', {
                accumulatedLength: accumulatedText.length,
                backendLength: backendText.length,
                emotion: data.emotion || data.emotion_type,
                gravity: data.gravity_score,
                memoryConstellation: data.memory_constellation
              });

              // Pass complete data with streamed text safely
              const responseData = {
                ...data,
                finalText,
                messageId: streamingMessageId
              };

              console.log('[SSE] Calling onResponseComplete with:', responseData);
              onResponseComplete?.(responseData);

              // Clear accumulator for this message
              this.messageAccumulator.delete(streamingMessageId);
            } catch (completeError) {
              console.error('[SSE] Error processing response complete:', completeError);
              onError?.('Error processing response');
            }
          }
          break;

        case 'ivy_thought':
          if (data.content) {
            onIvyThought?.(data.content);
          }
          break;

        case 'ivy_insight':
          if (data.content) {
            onIvyInsight?.(data.content);
          }
          break;

        case 'ivy_contradiction':
          if (data.content) {
            onIvyContradiction?.(data.content);
          }
          break;

        case 'memory_depth':
          if (typeof data.depth === 'number') {
            onMemoryDepth?.(data.depth);
          }
          break;

        case 'pattern_count':
          if (typeof data.count === 'number') {
            onPatternCount?.(data.count);
          }
          break;

        case 'error':
        case 'consciousness_error':
          onError?.(data.message || data.recovery_suggestion || 'Consciousness wavered');
          if (streamingMessageId) {
            this.messageAccumulator.delete(streamingMessageId);
          }
          break;

        // NEW META EVENTS - Log everything + capture for display
        case 'phase_transition':
          console.log('🔄 [PHASE]', data);
          onMetaEvent?.('phase_transition', data);
          if (data.phase || data.message) {
            onProcessingPhase?.(data.phase || data.message);
          }
          break;

        case 'input_analysis_complete':
          console.log('🔍 [INPUT ANALYSIS]', data);
          onMetaEvent?.('input_analysis_complete', data);
          if (data.emotion) {
            onProcessingPhase?.(`Input analyzed: ${data.emotion}`);
          }
          break;

        case 'mode_suggested':
          console.log('💡 [MODE SUGGESTED]', data);
          onMetaEvent?.('mode_suggested', data);
          if (data.mode) {
            onProcessingPhase?.(`Mode suggested: ${data.mode}`);
          }
          break;

        case 'mode_determined':
          console.log('✅ [MODE DETERMINED]', data);
          onMetaEvent?.('mode_determined', data);
          if (data.mode) {
            onModeSelected?.(data.mode);
            if (data.overridden) {
              onProcessingPhase?.(`⚠️ Mode override: ${data.mode}`);
            }
          }
          break;

        case 'synthesis_complete':
          console.log('🧬 [SYNTHESIS]', data);
          onMetaEvent?.('synthesis_complete', data);
          onProcessingPhase?.('Consciousness synthesis complete');
          break;

        case 'patterns_detected':
          console.log('🔮 [PATTERNS]', data);
          onMetaEvent?.('patterns_detected', data);
          if (data.count !== undefined) {
            onProcessingPhase?.(`${data.count} patterns detected`);
          }
          break;

        case 'pattern_detail':
          console.log('🔮 [PATTERN DETAIL]', data);
          onMetaEvent?.('pattern_detail', data);
          if (data.pattern) {
            onPatternEmerging?.({
              pattern: typeof data.pattern === 'string' ? data.pattern : (data.pattern.name || 'unknown'),
              strength: data.pattern?.strength || 0.5
            });
          }
          break;

        case 'insights_generated':
          console.log('💎 [INSIGHTS]', data);
          onMetaEvent?.('insights_generated', data);
          if (data.count !== undefined) {
            onProcessingPhase?.(`${data.count} insights generated`);
          }
          break;

        case 'insight_detail':
          console.log('💎 [INSIGHT DETAIL]', data);
          onMetaEvent?.('insight_detail', data);
          if (data.insight) {
            const insightText = typeof data.insight === 'string' ? data.insight : (data.insight.content || JSON.stringify(data.insight));
            onIvyInsight?.(insightText);
          }
          break;

        case 'emotional_journey':
          console.log('🎭 [EMOTIONAL JOURNEY]', data);
          onMetaEvent?.('emotional_journey', data);
          break;

        case 'key_themes':
          console.log('🏷️ [KEY THEMES]', data);
          onMetaEvent?.('key_themes', data);
          break;

        case 'consciousness_chord':
          console.log('🎵 [CONSCIOUSNESS CHORD]', data);
          onMetaEvent?.('consciousness_chord', data);
          break;

        case 'conductor_metadata':
          console.log('🎼 [CONDUCTOR]', data);
          onMetaEvent?.('conductor_metadata', data);
          break;

        case 'response_stored':
          console.log('💾 [RESPONSE STORED]', data);
          onMetaEvent?.('response_stored', data);
          break;

        case 'orchestrator_complete':
          console.log('🎯 [ORCHESTRATOR COMPLETE]', data);
          onMetaEvent?.('orchestrator_complete', data);
          break;

        default:
          onDebug?.('[SSE] Unknown message type', data);
      }
    } catch (error) {
      console.error('[SSE Handler Error]', error);
      // Clean up accumulator on error
      if (streamingMessageId) {
        this.messageAccumulator.delete(streamingMessageId);
      }
      onError?.('SSE handler error');
    }
  }

  /**
   * Detect temporal context from message
   */
  private detectTemporalType(content: string): 'past' | 'present' | 'future' {
    const lower = content.toLowerCase();
    if (/\b(yesterday|last\s+(week|month|year)|ago|previously|before|was|used to|remember when)\b/.test(lower)) {
      return 'past';
    }
    if (/\b(tomorrow|next\s+(week|month|year)|soon|will|going\s+to|future|plan to)\b/.test(lower)) {
      return 'future';
    }
    return 'present';
  }

  /**
   * Check if message should force a memory arc
   */
  private shouldForceArc(content: string): boolean {
    const lower = content.toLowerCase();
    return /\b(important|critical|remember this|never forget|always remember|breakthrough|realization|epiphany)\b/.test(lower) ||
           /\b(i love|i promise|i commit|i swear|life changing|changed my life)\b/.test(lower);
  }

  /**
   * Detect user intent from message
   */
  private detectUserIntent(content: string) {
    const lower = content.toLowerCase();
    return {
      pattern_detected: /\b(pattern|recurring|always|every time|repeatedly)\b/.test(lower),
      seeking_insight: /\b(why|how come|what does it mean|significance|insight)\b/.test(lower),
      emotional_processing: /\b(i feel|feeling|emotion|upset|happy|sad|angry|frustrated)\b/.test(lower),
      boundary_setting: /\b(boundary|limit|need space|don't|stop|no more)\b/.test(lower)
    };
  }

  /**
   * Send message with SSE streaming
   */
  public async sendMessage(
    options: SendMessageOptions,
    streamingMessageId: string
  ): Promise<void> {
    // Prevent duplicate requests
    if (this.sendingLock) {
      console.warn('[SSE] Request already in progress, ignoring duplicate');
      return;
    }

    this.sendingLock = true;

    const {
      text,
      sessionId,
      memoryTraceId,
      userId,
      messageCount,
      userMessageCount,
      firstMessageTimestamp,
      retryCount,
      conversationName,
      threadId,
      isRetry = false
    } = options;

    const { onDebug, onError, onResponseComplete } = this.callbacks;

    // Clear previous accumulator for this message
    this.messageAccumulator.delete(streamingMessageId);

    // Abort any existing connection
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    const config = getIvyConfig();

    if (!config.supabaseUrl || !config.supabaseKey) {
      onError?.('LongStrider is not configured. Please set up Supabase credentials in Settings.');
      this.sendingLock = false;
      return;
    }

    // Use cce-orchestrator which supports SSE streaming (getCortex only returns JSON)
    const edgeFunction = config.edgeFunctions['cce-orchestrator'] || 'cce-orchestrator';
    const streamEndpoint = `${config.supabaseUrl}/functions/v1/${edgeFunction}`;

    onDebug?.('[SSE] Sending message to', streamEndpoint);
    console.log('[SSE] Full endpoint URL:', streamEndpoint);

    // Detect message context
    const temporalType = this.detectTemporalType(text);
    const userIntent = this.detectUserIntent(text);
    const isFirstMessage = userMessageCount === 0;
    const bootCompleted = localStorage.getItem('ivy_session_active') === 'true';

    // Build metadata
    const metadata = {
      emotional_coherence: true,
      retry_attempt: retryCount,
      boot_completed: bootCompleted,
      include_memory_constellation: true,
      constellation_depth: bootCompleted ? 100 : 20,
      force_arc: this.shouldForceArc(text),
      create_thread: isFirstMessage,
      pattern_detected: userIntent.pattern_detected,
      seeking_insight: userIntent.seeking_insight,
      emotional_processing: userIntent.emotional_processing,
      boundary_event: userIntent.boundary_setting,
      message_count: messageCount,
      user_message_count: userMessageCount,
      conversation_name: conversationName,
      thread_id: threadId,
      session_duration_ms: firstMessageTimestamp ? Date.now() - firstMessageTimestamp : 0,
      temporal_type: temporalType,
      mentioned_anchors: (() => {
        const lower = text.toLowerCase();
        const anchors = [];
        if (lower.includes('blu')) anchors.push('blu');
        if (lower.includes('july 11')) anchors.push('july_11');
        return anchors.length > 0 ? anchors : undefined;
      })()
    };

    // Build request payload - send BOTH message and content for backend flexibility
    const requestPayload = {
      user_id: userId,
      message: text,  // Primary field
      content: text,  // Duplicate for backend compatibility
      session_id: sessionId,
      memory_trace_id: memoryTraceId,
      conversation_name: conversationName,  // Move to top level
      thread_id: threadId,  // Move to top level
      type: "user",  // Always user messages from frontend
      trigger_type: "chat",
      recall_depth: bootCompleted ? "deep" : "standard",
      temporal_type: temporalType,
      // CRITICAL FIX: Add streaming flags at top level (cce-response checks these)
      stream_sse: true,
      stream_consciousness_events: true,
      metadata
    };

    onDebug?.('[SSE] Request payload', requestPayload);
    
    // Add comprehensive request debugging per checklist
    console.log('[IVY REQUEST DEBUG] Frontend request:', {
      endpoint: streamEndpoint,
      payload: requestPayload,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Bearer ${config.supabaseKey.substring(0, 20)}...`,
        "Accept": "text/event-stream"
      }
    });

    try {
      const response = await fetch(streamEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": `Bearer ${config.supabaseKey}`,
          "Accept": "text/event-stream",
        },
        body: JSON.stringify(requestPayload),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SSE] Error response:', { status: response.status, body: errorText });
        onDebug?.('[SSE] Error response', { status: response.status, body: errorText });

        let errorMessage = `HTTP ${response.status}: `;
        if (response.status === 404) {
          errorMessage += `Edge function not found. Is '${edgeFunction}' deployed to your Supabase instance?`;
        } else if (response.status === 401 || response.status === 403) {
          errorMessage += `Authentication failed. Check your Supabase API key in Settings.`;
        } else {
          errorMessage += errorText || 'Unknown error';
        }

        onError?.(errorMessage);
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type') || '';

      // Backend only sends SSE - error if not event-stream
      if (!contentType.includes('text/event-stream')) {
        onDebug?.('[SSE] ERROR: Expected text/event-stream but got:', contentType);
        throw new Error(`Expected SSE stream but got content-type: ${contentType}`);
      }

      // Handle SSE stream only
      await this.handleSSEStream(response, streamingMessageId);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        onDebug?.('[SSE] Request aborted');
        return;
      }

      console.error('[SSE] Connection error:', error);
      onError?.(error.message || 'Connection failed');
      throw error;
    } finally {
      // Always release the lock when request completes (success or error)
      this.sendingLock = false;
    }
  }

  /**
   * Handle SSE stream with enhanced error recovery
   */
  private async handleSSEStream(response: Response, streamingMessageId: string) {
    const { onDebug, onError } = this.callbacks;
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body reader available');
    }

    let buffer = '';
    onDebug?.('[SSE] Starting to read stream');

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onDebug?.('[SSE] Stream ended');
          break;
        }

        try {
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const dataStr = line.slice(6).trim();
                if (dataStr && dataStr !== '[DONE]') {
                  const data = JSON.parse(dataStr);
                  this.handleSSEMessage(data, streamingMessageId);
                }
              } catch (e) {
                console.error('[SSE] Parse error:', e, 'Line:', line);
                // Continue processing other lines instead of failing
              }
            }
          }
        } catch (decodeError) {
          console.error('[SSE] Decode error:', decodeError);
          // Continue reading instead of failing completely
        }
      }
    } catch (streamError) {
      console.error('[SSE] Stream error:', streamError);
      onError?.('Stream connection error');
      throw streamError;
    } finally {
      try {
        await reader.cancel();
      } catch (cancelError) {
        console.warn('[SSE] Error canceling reader:', cancelError);
      }
      onDebug?.('[SSE] Connection closed');
    }
  }

  /**
   * Abort current connection
   */
  public abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.messageAccumulator.clear();
  }

  /**
   * Get accumulated text for a message
   */
  public getAccumulatedText(messageId: string): string {
    return this.messageAccumulator.get(messageId) || '';
  }

  /**
   * Clear accumulator for a message
   */
  public clearAccumulator(messageId?: string) {
    if (messageId) {
      this.messageAccumulator.delete(messageId);
    } else {
      this.messageAccumulator.clear();
    }
  }
}
