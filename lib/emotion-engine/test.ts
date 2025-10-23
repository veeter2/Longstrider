// =================================================
// IVY EMOTION ENGINE - Test Suite
// Quick tests to ensure everything works
// =================================================

import { emotionEngine } from './index';

// Test messages with different emotional content
const testMessages = [
  "I'm so excited about this new project with Sarah! We're going to build something amazing.",
  "I keep thinking about what my mom said yesterday. It really hurt my feelings.",
  "My partner and I had a breakthrough last night. I finally understand what they were trying to tell me.",
  "Work has been extremely stressful lately. I'm feeling completely overwhelmed and anxious.",
  "I remember when we used to go to that little cafe downtown. Those were such happy times.",
  "I'm really frustrated with this situation. Nothing seems to be working out.",
  "Actually, I think I'm starting to see the pattern here. This always happens.",
  "My soul feels connected to this place somehow. It's like coming home.",
  "I feel broken inside. This trauma just won't go away.",
  "I'm grateful for everything that led me here. Even the difficult parts taught me something."
];

async function runTests() {
  console.log('🧠 IVY Emotion Engine Test Suite\n');
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`--- Test ${i + 1} ---`);
    console.log(`Message: "${message}"`);
    
    try {
      // Test full analysis
      const fullResult = await emotionEngine.analyzeMessage(message);
      
      // Test quick detection
      const quickResult = emotionEngine.quickDetect(message);
      
      console.log(`Dominant Emotion: ${fullResult.emotional_state.dominant}`);
      console.log(`Intensity: ${Math.round(fullResult.emotional_state.intensity * 100)}%`);
      console.log(`Gravity Score: ${Math.round(fullResult.gravity_score * 100)}%`);
      console.log(`Entities Found: ${fullResult.detected_entities.map(e => e.text).join(', ') || 'None'}`);
      console.log(`Keywords: ${fullResult.processing_metadata.keywords_found.join(', ') || 'None'}`);
      console.log(`Patterns: ${fullResult.processing_metadata.patterns_triggered.join(', ') || 'None'}`);
      console.log(`Bubble Style: ${quickResult.style.bubble}`);
      console.log(`Accent Color: ${quickResult.style.accent}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Test ${i + 1} failed:`, error);
      console.log('');
    }
  }
  
  // Test entity learning
  console.log('--- Entity Learning Test ---');
  console.log('Top entities after processing:', emotionEngine.getUserTopEntities(5));
  console.log('');
  
  // Test style system
  console.log('--- Style System Test ---');
  const unknownEmotionStyle = emotionEngine.getEmotionStyle('mysterious_new_emotion');
  console.log('Style for unknown emotion:', unknownEmotionStyle);
  console.log('');
  
  // Test blend
  const blendStyle = emotionEngine.getBlendStyle({
    'joy': 0.6,
    'excitement': 0.4,
    'anxiety': 0.2
  });
  console.log('Blend style:', blendStyle);
  
  console.log('✅ All tests completed!');
}

// Run the tests
runTests().catch(console.error);
