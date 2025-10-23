// =================================================
// IVY EMOTION DETECTOR - Core Detection Engine
// Based on Opus's dynamic keyword system
// =================================================

import type { 
  EmotionalState, 
  EmotionDetectionResult, 
  IntensityModifier,
  PatternMatch,
  ComboPattern
} from './types';

export class EmotionDetector {
  private intensityModifiers = new Map<string, number>([
    // Amplifiers
    ['really', 1.2],
    ['very', 1.3],
    ['extremely', 1.5],
    ['completely', 1.5],
    ['totally', 1.4],
    ['absolutely', 1.5],
    ['incredibly', 1.4],
    ['ridiculously', 1.6],
    
    // Reducers  
    ['barely', 0.5],
    ['slightly', 0.7],
    ['somewhat', 0.8],
    ['kind of', 0.8],
    ['sort of', 0.8],
    ['a bit', 0.7],
    ['a little', 0.7],
  ]);

  private gravityBoosters = new Set([
    'first time', 'last time', 'only', 'everything', 'nothing',
    'emergency', 'crisis', 'never', 'always', 'forever',
    'soul', 'broken', 'alive', 'numb', 'breakthrough',
    'awakening', 'pattern', 'trigger', 'suddenly', 'finally'
  ]);

  private coreEmotionKeywords = new Map<string, string[]>([
    // Basic Emotions (Keep Original)
    ['love', ['love', 'adore', 'cherish', 'treasure', 'devoted']],
    ['joy', ['joy', 'happy', 'delighted', 'elated', 'ecstatic', 'blissful']],
    ['sadness', ['sad', 'depressed', 'melancholy', 'grief', 'sorrow', 'mourning']],
    ['fear', ['afraid', 'scared', 'terrified', 'anxious', 'worried', 'panic']],
    ['anger', ['angry', 'furious', 'rage', 'mad', 'irritated', 'pissed']],
    
    // Missing Essentials (Add These)
    ['anxiety', ['anxious', 'nervous', 'worried', 'stress', 'overwhelmed', 'panic']],
    ['pride', ['proud', 'accomplished', 'achieved', 'success', 'victory']],
    ['excitement', ['excited', 'thrilled', 'pumped', 'energized', 'hyped']],
    ['frustration', ['frustrated', 'annoyed', 'irritated', 'blocked', 'stuck']],
    ['loneliness', ['lonely', 'isolated', 'alone', 'disconnected', 'abandoned']],
    ['gratitude', ['grateful', 'thankful', 'blessed', 'appreciative']],
    ['disappointment', ['disappointed', 'let down', 'failed', 'unmet expectations']],
    
    // Deep Emotional Markers (Next Level)
    ['soul_connection', ['soul', 'deep connection', 'spiritual', 'transcendent']],
    ['permanence', ['forever', 'always', 'eternal', 'never ending', 'permanent']],
    ['trauma', ['broken', 'shattered', 'traumatized', 'wounded', 'damaged']],
    ['vitality', ['alive', 'vibrant', 'energetic', 'vital', 'thriving']],
    ['dissociation', ['numb', 'disconnected', 'empty', 'void', 'detached']],
    
    // Consciousness & Growth
    ['awakening', ['awakening', 'enlightenment', 'realization', 'clarity']],
    ['stagnation', ['stuck', 'trapped', 'blocked', 'stagnant', 'frozen']],
    ['breakthrough', ['breakthrough', 'epiphany', 'breakthrough', 'aha moment']],
    ['recognition', ['pattern', 'realize', 'understand', 'see clearly']],
    
    // Relationship Quality
    ['toxic', ['toxic', 'harmful', 'destructive', 'poisonous']],
    ['safety', ['safe', 'secure', 'protected', 'comfortable']],
    ['distance', ['distant', 'cold', 'disconnected', 'withdrawn']],
    ['intimacy', ['close', 'intimate', 'connected', 'bonded']],
    ['complexity', ['complicated', 'complex', 'messy', 'tangled']]
  ]);

  private comboPatterns: ComboPattern[] = [
    // Two-word patterns that unlock deeper meaning
    { pattern: ['but', 'actually'], emotion_boost: 'revelation', gravity_multiplier: 1.3 },
    { pattern: ['always', 'feel'], emotion_boost: 'persistent_state', gravity_multiplier: 1.4 },
    { pattern: ['never', 'again'], emotion_boost: 'boundary_setting', gravity_multiplier: 1.5 },
    { pattern: ['remember', 'feeling'], emotion_boost: 'emotional_memory', gravity_multiplier: 1.3 },
    { pattern: ['keep', 'thinking'], emotion_boost: 'rumination', gravity_multiplier: 1.2 },
    { pattern: ['cant', 'stop'], emotion_boost: 'compulsion', gravity_multiplier: 1.4 },
    { pattern: ['need', 'to'], emotion_boost: 'urgency', gravity_multiplier: 1.1 },
    { pattern: ['wish', 'could'], emotion_boost: 'regret_desire', gravity_multiplier: 1.3 },
    { pattern: ['should', 'have'], emotion_boost: 'regret', gravity_multiplier: 1.2 },
    { pattern: ['what', 'if'], emotion_boost: 'anxiety_possibility', gravity_multiplier: 1.2 }
  ];

  private hedgingPatterns = new Map<string, number>([
    ['kind of', 0.8], // uncertainty
    ['i guess', 0.7], // low confidence
    ['maybe', 0.6], // possibility
    ['probably', 0.8], // likelihood
    ['definitely', 1.3], // certainty
    ['obviously', 1.2], // assumption
    ['honestly', 1.1], // authenticity
    ['literally', 1.3], // intensity
    ['basically', 0.9], // simplification
    ['actually', 1.2] // truth reveal
  ]);

  /**
   * Detect emotions from text using dynamic keyword matching
   */
  public detectEmotion(text: string, userEntities: string[] = []): EmotionDetectionResult {
    const words = this.tokenizeText(text);
    const detectedEmotions = new Map<string, number>();
    const triggeredKeywords: string[] = [];
    const patternMatches: PatternMatch[] = [];
    let gravityScore = 0.5; // Base gravity
    
    // 1. Find core emotions through keyword matching
    for (const [emotion, keywords] of this.coreEmotionKeywords) {
      const matches = keywords.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matches.length > 0) {
        detectedEmotions.set(emotion, matches.length * 0.3);
        triggeredKeywords.push(...matches);
      }
    }

    // 2. Apply intensity modifiers
    const intensityMods = this.findIntensityModifiers(text);
    for (const [emotion, score] of detectedEmotions) {
      let adjustedScore = score;
      
      // Apply nearby intensity modifiers
      intensityMods.forEach(mod => {
        adjustedScore *= mod.multiplier;
      });
      
      detectedEmotions.set(emotion, Math.min(adjustedScore, 1.0));
    }

    // 3. Detect combo patterns
    const comboMatches = this.findComboPatterns(text);
    comboMatches.forEach(match => {
      patternMatches.push(match);
      gravityScore *= match.gravity_boost;
      
      // Boost related emotions
      if (detectedEmotions.has(match.emotion_influence)) {
        const current = detectedEmotions.get(match.emotion_influence) || 0;
        detectedEmotions.set(match.emotion_influence, Math.min(current + 0.2, 1.0));
      } else {
        detectedEmotions.set(match.emotion_influence, 0.3);
      }
    });

    // 4. Apply gravity boosters
    for (const booster of this.gravityBoosters) {
      if (text.toLowerCase().includes(booster)) {
        gravityScore = Math.min(gravityScore * 1.3, 1.0);
        triggeredKeywords.push(booster);
      }
    }

    // 5. Determine dominant emotion and create emotional state
    const dominantEmotion = this.getDominantEmotion(detectedEmotions);
    const emotionalBlend = Object.fromEntries(detectedEmotions);
    
    const emotionalState: EmotionalState = {
      dominant: dominantEmotion.emotion,
      intensity: dominantEmotion.intensity,
      blend: emotionalBlend,
      confidence: this.calculateConfidence(detectedEmotions, triggeredKeywords),
      triggers: triggeredKeywords,
      context: {
        temporal: this.detectTemporal(text),
        relational: this.detectRelationships(text),
        entities: userEntities, // Will be populated by entity extractor
        intensity_modifiers: intensityMods,
        gravity_boosters: Array.from(this.gravityBoosters).filter(b => 
          text.toLowerCase().includes(b)
        )
      }
    };

    return {
      emotional_state: emotionalState,
      detected_entities: [], // Will be populated by entity extractor
      pattern_matches: patternMatches,
      gravity_score: gravityScore,
      processing_metadata: {
        keywords_found: triggeredKeywords,
        patterns_triggered: patternMatches.map(p => p.pattern),
        confidence_breakdown: Object.fromEntries(detectedEmotions)
      }
    };
  }

  private tokenizeText(text: string): string[] {
    return text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  }

  private findIntensityModifiers(text: string): IntensityModifier[] {
    const modifiers: IntensityModifier[] = [];
    const lowerText = text.toLowerCase();
    
    for (const [word, multiplier] of this.intensityModifiers) {
      const index = lowerText.indexOf(word);
      if (index !== -1) {
        modifiers.push({
          word,
          multiplier,
          position: index
        });
      }
    }
    
    return modifiers;
  }

  private findComboPatterns(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    const words = text.toLowerCase().split(/\s+/);
    
    for (let i = 0; i < words.length - 1; i++) {
      const word1 = words[i];
      const word2 = words[i + 1];
      
      const matchingPattern = this.comboPatterns.find(pattern => 
        pattern.pattern[0] === word1 && pattern.pattern[1] === word2
      );
      
      if (matchingPattern) {
        matches.push({
          pattern: `${word1} ${word2}`,
          confidence: 0.8,
          text_span: [i, i + 1],
          emotion_influence: matchingPattern.emotion_boost,
          gravity_boost: matchingPattern.gravity_multiplier
        });
      }
    }
    
    return matches;
  }

  private getDominantEmotion(emotions: Map<string, number>): { emotion: string, intensity: number } {
    if (emotions.size === 0) {
      return { emotion: 'neutral', intensity: 0.1 };
    }
    
    let maxEmotion = 'neutral';
    let maxIntensity = 0;
    
    for (const [emotion, intensity] of emotions) {
      if (intensity > maxIntensity) {
        maxEmotion = emotion;
        maxIntensity = intensity;
      }
    }
    
    return { emotion: maxEmotion, intensity: maxIntensity };
  }

  private calculateConfidence(emotions: Map<string, number>, keywords: string[]): number {
    const emotionCount = emotions.size;
    const keywordCount = keywords.length;
    
    // More emotions and keywords detected = higher confidence
    const baseConfidence = Math.min((emotionCount * 0.2) + (keywordCount * 0.1), 1.0);
    return Math.max(baseConfidence, 0.1); // Minimum confidence
  }

  private detectTemporal(text: string): 'past' | 'present' | 'future' | 'timeless' {
    const lowerText = text.toLowerCase();
    
    if (/\b(yesterday|last\s+(week|month|year)|ago|previously|before|was|used to|remember when)\b/.test(lowerText)) {
      return 'past';
    }
    
    if (/\b(tomorrow|next\s+(week|month|year)|soon|will|going\s+to|future|plan to)\b/.test(lowerText)) {
      return 'future';
    }
    
    if (/\b(now|today|currently|right now|at the moment)\b/.test(lowerText)) {
      return 'present';
    }
    
    return 'timeless';
  }

  private detectRelationships(text: string): string[] {
    const relationships = [
      'partner', 'spouse', 'ex', 'parent', 'child', 'sibling', 
      'friend', 'boss', 'colleague', 'mentor', 'family', 
      'mother', 'father', 'brother', 'sister', 'boyfriend', 'girlfriend'
    ];
    
    return relationships.filter(rel => 
      text.toLowerCase().includes(rel)
    );
  }
}
