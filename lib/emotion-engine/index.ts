// =================================================
// IVY EMOTION ENGINE - Main Export
// Complete emotional intelligence system
// =================================================

import { EmotionDetector } from './emotion-detector';
import { EmotionStyleEngine } from './emotion-styles';
import { EntityExtractor } from './entity-extractor';
import type { 
  EmotionDetectionResult, 
  EmotionalState, 
  EmotionStyle,
  DetectedEntity 
} from './types';

export class IvyEmotionEngine {
  private detector = new EmotionDetector();
  private styleEngine = new EmotionStyleEngine();
  private entityExtractor = new EntityExtractor();

  /**
   * Analyze a message for emotions, entities, and patterns
   */
  public async analyzeMessage(
    text: string, 
    previousMessages: string[] = [],
    userEntityData?: any
  ): Promise<EmotionDetectionResult> {
    
    // Load user's entity learning data if provided
    if (userEntityData) {
      this.entityExtractor.loadEntityData(userEntityData);
    }

    // Extract entities first
    const entities = this.entityExtractor.extractEntities(
      text, 
      previousMessages
    );

    // Detect emotions with entity context
    const emotionResult = this.detector.detectEmotion(
      text, 
      entities.map(e => e.text)
    );

    // Merge entity data into result
    emotionResult.detected_entities = entities;

    return emotionResult;
  }

  /**
   * Get visual style for emotion
   */
  public getEmotionStyle(emotion: string, intensity: number = 0.5): EmotionStyle {
    return this.styleEngine.getEmotionStyle(emotion, intensity);
  }

  /**
   * Get style for emotional blend (multiple emotions)
   */
  public getBlendStyle(emotions: Record<string, number>): EmotionStyle {
    return this.styleEngine.createBlendStyle(emotions);
  }

  /**
   * Get user's most frequent entities (for UI display)
   */
  public getUserTopEntities(limit: number = 10) {
    return this.entityExtractor.getTopEntities(limit);
  }

  /**
   * Export user's entity learning data (for persistence)
   */
  public exportUserEntityData() {
    return this.entityExtractor.exportEntityData();
  }

  /**
   * Clear user's entity learning data (for privacy)
   */
  public clearUserEntityData() {
    this.entityExtractor.clearEntityData();
  }

  /**
   * Get all available core emotion styles (for UI components)
   */
  public getCoreEmotionStyles() {
    return this.styleEngine.getCoreEmotionStyles();
  }

  /**
   * Register custom emotion style
   */
  public registerCustomEmotion(emotion: string, style: EmotionStyle) {
    this.styleEngine.registerEmotionStyle(emotion, style);
  }

  /**
   * Quick emotion detection for simple use cases
   */
  public quickDetect(text: string): {
    emotion: string;
    intensity: number;
    gravity: number;
    style: EmotionStyle;
  } {
    const result = this.detector.detectEmotion(text);
    const style = this.getEmotionStyle(
      result.emotional_state.dominant, 
      result.emotional_state.intensity
    );

    return {
      emotion: result.emotional_state.dominant,
      intensity: result.emotional_state.intensity,
      gravity: result.gravity_score,
      style
    };
  }
}

// Export individual components for advanced use cases
export { EmotionDetector } from './emotion-detector';
export { EmotionStyleEngine } from './emotion-styles';
export { EntityExtractor } from './entity-extractor';

// Export types
export type {
  EmotionalState,
  EmotionDetectionResult,
  EmotionStyle,
  DetectedEntity,
  EmotionalContext,
  IntensityModifier,
  PatternMatch,
  ComboPattern
} from './types';

// Create singleton instance for easy importing
export const emotionEngine = new IvyEmotionEngine();

// Default export
export default IvyEmotionEngine;
