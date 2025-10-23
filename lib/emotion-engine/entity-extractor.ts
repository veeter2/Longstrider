// =================================================
// IVY ENTITY EXTRACTOR - Dynamic Entity Detection
// Learns entities from user's actual conversation data
// =================================================

import type { DetectedEntity } from './types';

export class EntityExtractor {
  private entityFrequency = new Map<string, number>();
  private entityEmotions = new Map<string, string[]>();
  private entityTypes = new Map<string, 'person' | 'place' | 'concept' | 'relationship' | 'unknown'>();
  
  private relationshipKeywords = new Set([
    'partner', 'spouse', 'ex', 'parent', 'child', 'sibling', 
    'friend', 'boss', 'colleague', 'mentor', 'family',
    'mother', 'father', 'brother', 'sister', 'boyfriend', 'girlfriend',
    'husband', 'wife', 'son', 'daughter', 'mom', 'dad'
  ]);

  private placeKeywords = new Set([
    'home', 'work', 'office', 'school', 'university', 'hospital',
    'city', 'town', 'country', 'state', 'beach', 'park',
    'restaurant', 'cafe', 'gym', 'studio', 'house', 'apartment'
  ]);

  private conceptKeywords = new Set([
    'project', 'goal', 'dream', 'plan', 'idea', 'concept',
    'business', 'startup', 'career', 'job', 'hobby', 'passion',
    'belief', 'value', 'principle', 'philosophy', 'vision'
  ]);

  /**
   * Extract entities from user message and update learning model
   */
  public extractEntities(text: string, previousContext: string[] = []): DetectedEntity[] {
    const entities: DetectedEntity[] = [];
    
    // 1. Find capitalized words (potential proper nouns)
    const capitalizedEntities = this.findCapitalizedEntities(text);
    
    // 2. Find relationship references
    const relationshipEntities = this.findRelationshipEntities(text);
    
    // 3. Find place references
    const placeEntities = this.findPlaceEntities(text);
    
    // 4. Find concept references
    const conceptEntities = this.findConceptEntities(text);
    
    // Combine all entities
    const allEntities = [
      ...capitalizedEntities,
      ...relationshipEntities, 
      ...placeEntities,
      ...conceptEntities
    ];

    // 5. Update frequency tracking and return processed entities
    allEntities.forEach(entity => {
      this.updateEntityFrequency(entity.text);
      const processedEntity = this.processEntity(entity, text);
      entities.push(processedEntity);
    });

    return this.deduplicateEntities(entities);
  }

  /**
   * Find capitalized words that appear multiple times (likely proper nouns)
   */
  private findCapitalizedEntities(text: string): Partial<DetectedEntity>[] {
    const entities: Partial<DetectedEntity>[] = [];
    const words = text.split(/\s+/);
    
    words.forEach(word => {
      // Remove punctuation and check if capitalized
      const cleanWord = word.replace(/[.,!?;:"()[\]{}]/g, '');
      
      if (this.isCapitalizedProperNoun(cleanWord) && !this.isCommonWord(cleanWord)) {
        entities.push({
          text: cleanWord,
          type: this.guessEntityType(cleanWord, text),
          frequency: this.getEntityFrequency(cleanWord)
        });
      }
    });

    return entities;
  }

  /**
   * Find relationship references
   */
  private findRelationshipEntities(text: string): Partial<DetectedEntity>[] {
    const entities: Partial<DetectedEntity>[] = [];
    const lowerText = text.toLowerCase();
    
    this.relationshipKeywords.forEach(relationship => {
      if (lowerText.includes(relationship)) {
        entities.push({
          text: relationship,
          type: 'relationship',
          frequency: this.getEntityFrequency(relationship)
        });
      }
    });

    return entities;
  }

  /**
   * Find place references
   */
  private findPlaceEntities(text: string): Partial<DetectedEntity>[] {
    const entities: Partial<DetectedEntity>[] = [];
    const lowerText = text.toLowerCase();
    
    this.placeKeywords.forEach(place => {
      if (lowerText.includes(place)) {
        entities.push({
          text: place,
          type: 'place',
          frequency: this.getEntityFrequency(place)
        });
      }
    });

    return entities;
  }

  /**
   * Find concept references
   */
  private findConceptEntities(text: string): Partial<DetectedEntity>[] {
    const entities: Partial<DetectedEntity>[] = [];
    const lowerText = text.toLowerCase();
    
    this.conceptKeywords.forEach(concept => {
      if (lowerText.includes(concept)) {
        entities.push({
          text: concept,
          type: 'concept',
          frequency: this.getEntityFrequency(concept)
        });
      }
    });

    return entities;
  }

  /**
   * Process entity with emotional context and gravity
   */
  private processEntity(entity: Partial<DetectedEntity>, messageText: string): DetectedEntity {
    const entityText = entity.text!;
    
    // Determine emotional context for this entity
    const emotionalContext = this.getEmotionalContext(entityText, messageText);
    
    // Calculate gravity based on frequency and emotional intensity
    const gravity = this.calculateEntityGravity(entityText, emotionalContext);
    
    return {
      text: entityText,
      type: entity.type || 'unknown',
      frequency: entity.frequency || 1,
      emotional_context: emotionalContext,
      gravity
    };
  }

  /**
   * Update entity frequency tracking
   */
  private updateEntityFrequency(entity: string): void {
    const normalizedEntity = entity.toLowerCase();
    const currentCount = this.entityFrequency.get(normalizedEntity) || 0;
    this.entityFrequency.set(normalizedEntity, currentCount + 1);
  }

  /**
   * Get emotional context for entity from surrounding text
   */
  private getEmotionalContext(entity: string, messageText: string): string[] {
    const emotionalKeywords = [
      'love', 'hate', 'fear', 'worry', 'excited', 'angry', 'sad', 'happy',
      'frustrated', 'disappointed', 'proud', 'grateful', 'anxious',
      'comfortable', 'uncomfortable', 'safe', 'dangerous', 'toxic',
      'healing', 'supportive', 'difficult', 'easy', 'challenging'
    ];
    
    const context: string[] = [];
    const lowerText = messageText.toLowerCase();
    
    // Find emotional words near the entity
    emotionalKeywords.forEach(emotion => {
      if (lowerText.includes(emotion)) {
        // Check if emotion and entity are within reasonable distance
        const entityIndex = lowerText.indexOf(entity.toLowerCase());
        const emotionIndex = lowerText.indexOf(emotion);
        
        if (entityIndex !== -1 && emotionIndex !== -1) {
          const distance = Math.abs(entityIndex - emotionIndex);
          if (distance < 50) { // Within 50 characters
            context.push(emotion);
          }
        }
      }
    });

    return context;
  }

  /**
   * Calculate entity importance/gravity
   */
  private calculateEntityGravity(entity: string, emotionalContext: string[]): number {
    let gravity = 0.3; // Base gravity
    
    // Frequency boost
    const frequency = this.getEntityFrequency(entity);
    if (frequency > 3) gravity += 0.2;
    if (frequency > 10) gravity += 0.3;
    
    // Emotional context boost
    if (emotionalContext.length > 0) {
      gravity += emotionalContext.length * 0.1;
    }
    
    // Strong emotional markers boost gravity significantly
    const strongEmotions = ['love', 'hate', 'fear', 'trauma', 'breakthrough'];
    const hasStrongEmotion = emotionalContext.some(emotion => 
      strongEmotions.includes(emotion)
    );
    
    if (hasStrongEmotion) {
      gravity += 0.4;
    }
    
    return Math.min(gravity, 1.0);
  }

  /**
   * Guess entity type from context
   */
  private guessEntityType(entity: string, context: string): 'person' | 'place' | 'concept' | 'relationship' | 'unknown' {
    const lowerEntity = entity.toLowerCase();
    const lowerContext = context.toLowerCase();
    
    // Check against known types
    if (this.relationshipKeywords.has(lowerEntity)) return 'relationship';
    if (this.placeKeywords.has(lowerEntity)) return 'place';
    if (this.conceptKeywords.has(lowerEntity)) return 'concept';
    
    // Context clues for person names
    const personIndicators = ['said', 'told', 'with', 'and', 'met', 'called', 'texted'];
    if (personIndicators.some(indicator => lowerContext.includes(`${indicator} ${lowerEntity}`))) {
      return 'person';
    }
    
    // Context clues for places
    const placeIndicators = ['at', 'in', 'to', 'from', 'near', 'around'];
    if (placeIndicators.some(indicator => lowerContext.includes(`${indicator} ${lowerEntity}`))) {
      return 'place';
    }
    
    return 'unknown';
  }

  /**
   * Check if word is a capitalized proper noun
   */
  private isCapitalizedProperNoun(word: string): boolean {
    return word.length > 1 && word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase();
  }

  /**
   * Check if word is common and should be ignored
   */
  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'The', 'This', 'That', 'There', 'Then', 'They', 'Today', 'Tomorrow',
      'Yesterday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
      'Saturday', 'Sunday', 'January', 'February', 'March', 'April', 'May',
      'June', 'July', 'August', 'September', 'October', 'November', 'December',
      'I', 'You', 'We', 'He', 'She', 'It', 'But', 'And', 'Or', 'So', 'If'
    ]);
    
    return commonWords.has(word);
  }

  /**
   * Get current frequency for entity
   */
  private getEntityFrequency(entity: string): number {
    return this.entityFrequency.get(entity.toLowerCase()) || 0;
  }

  /**
   * Remove duplicate entities
   */
  private deduplicateEntities(entities: DetectedEntity[]): DetectedEntity[] {
    const uniqueEntities = new Map<string, DetectedEntity>();
    
    entities.forEach(entity => {
      const key = entity.text.toLowerCase();
      const existing = uniqueEntities.get(key);
      
      if (!existing || entity.gravity > existing.gravity) {
        uniqueEntities.set(key, entity);
      }
    });
    
    return Array.from(uniqueEntities.values());
  }

  /**
   * Get top entities by frequency (for UI display)
   */
  public getTopEntities(limit: number = 10): Array<{entity: string, frequency: number}> {
    return Array.from(this.entityFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([entity, frequency]) => ({ entity, frequency }));
  }

  /**
   * Load entity learning data from storage
   */
  public loadEntityData(data: {
    frequencies?: Map<string, number>;
    emotions?: Map<string, string[]>;
    types?: Map<string, 'person' | 'place' | 'concept' | 'relationship' | 'unknown'>;
  }): void {
    if (data.frequencies) this.entityFrequency = data.frequencies;
    if (data.emotions) this.entityEmotions = data.emotions;
    if (data.types) this.entityTypes = data.types;
  }

  /**
   * Export entity learning data for storage
   */
  public exportEntityData() {
    return {
      frequencies: this.entityFrequency,
      emotions: this.entityEmotions,
      types: this.entityTypes
    };
  }

  /**
   * Clear entity learning data (for privacy/reset)
   */
  public clearEntityData(): void {
    this.entityFrequency.clear();
    this.entityEmotions.clear();
    this.entityTypes.clear();
  }
}
