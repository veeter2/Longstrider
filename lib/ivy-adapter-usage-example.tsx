// lib/ivy-adapter-usage-example.tsx
// HOW TO USE THE UNIFIED ADAPTER IN YOUR FRONTEND

import { 
  adaptResponse, 
  prepareOutgoingPayload,
  type IvyUnifiedMessage 
} from './ivy-unified-adapter';

// ============================================
// 1. SENDING DATA TO BACKEND
// ============================================

async function sendToBackend(userMessage: string) {
  const payload = prepareOutgoingPayload({
    user_id: currentUser.id,
    content: userMessage,
    session_id: currentSession,
    thread_id: currentThread,
    emotion: detectedEmotion, // if detected from UI
    metadata: {
      source: 'chat',
      device: 'web'
    }
  });
  
  // Send to cognition_intake
  const response = await fetch('/functions/v1/cognition_intake', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// ============================================
// 2. HANDLING SSE STREAMS
// ============================================

function handleSSEMessage(event: MessageEvent) {
  const data = JSON.parse(event.data);
  
  // Adapt ANY format to unified structure
  const message = adaptResponse(data);
  
  if (message) {
    // Now you have consistent structure!
    setMessages(prev => [...prev, message]);
    
    // Access standardized fields
    console.log('Gravity:', message.gravity_score);
    console.log('Emotion:', message.emotion);
    console.log('Content:', message.content);
  }
}

// ============================================
// 3. HANDLING FUSION ENGINE RESPONSES
// ============================================

async function recallMemories(context: string) {
  const response = await fetch('/functions/v1/cognition-fusion-engine-v3', {
    method: 'POST',
    body: JSON.stringify({
      user_id: currentUser.id,
      query_context: context,
      recall_mode: 'gravity',
      depth: 'deep'
    })
  });
  
  const data = await response.json();
  
  // Adapt fusion response to unified message
  const message = adaptResponse(data) as IvyUnifiedMessage;
  
  // Access memory constellation
  if (message.memory_constellation) {
    message.memory_constellation.memories.forEach(memory => {
      console.log(`Memory: ${memory.content} (${memory.gravity_score})`);
    });
  }
  
  // Access emotional field
  if (message.emotional_field) {
    console.log('Emotional blend:', message.emotional_field.emotional_blend);
    console.log('Average gravity:', message.emotional_field.average_gravity);
  }
}

// ============================================
// 4. IN YOUR REACT COMPONENT
// ============================================

export function IvyChatComponent() {
  const [messages, setMessages] = useState<IvyUnifiedMessage[]>([]);
  
  useEffect(() => {
    const eventSource = new EventSource('/api/stream');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // SINGLE LINE handles ANY backend format!
        const message = adaptResponse(data);
        
        if (message && !Array.isArray(message)) {
          setMessages(prev => [...prev, message]);
          
          // Update UI based on standardized fields
          if (message.emotional_field) {
            updateEmotionalDisplay(message.emotional_field);
          }
          
          if (message.memory_constellation) {
            updateConstellationView(message.memory_constellation);
          }
          
          if (message.consciousness_evolution?.evolution_marker) {
            triggerEvolutionAnimation();
          }
        }
      } catch (error) {
        console.error('Failed to parse SSE:', error);
      }
    };
    
    return () => eventSource.close();
  }, []);
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          {/* Consistent structure for ALL messages */}
          <p>{msg.content}</p>
          <span>Gravity: {msg.gravity_score}</span>
          {msg.emotion && <span>Emotion: {msg.emotion}</span>}
        </div>
      ))}
    </div>
  );
}

// ============================================
// 5. REPLACE OLD ADAPTER USAGE
// ============================================

// OLD WAY (in ivy-cognitive-interface.tsx line 712):
// const adaptedMessages = Array.isArray(envOrList)
//   ? (mapBatch(envOrList) as unknown as IvyMessage[])
//   : ([mapToIvyMessage(envOrList)] as unknown as IvyMessage[]);

// NEW WAY:
const adaptedMessages = adaptResponse(data);
if (adaptedMessages) {
  const messagesArray = Array.isArray(adaptedMessages) 
    ? adaptedMessages 
    : [adaptedMessages];
  
  messagesArray.forEach(msg => {
    // Everything is normalized!
    console.log(msg.content, msg.gravity_score, msg.emotion);
  });
}
