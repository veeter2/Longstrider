// =================================================
// IVY EMOTION STYLES - Dynamic Visual System
// Generates styles for any emotion dynamically
// =================================================

import type { EmotionStyle } from './types';

export class EmotionStyleEngine {
  private coreStyles = new Map<string, EmotionStyle>([
    ['love', {
      bubble: 'bg-zinc-900/90 border border-rose-500/60',
      accent: 'text-rose-300',
      glow: 'shadow-[0_0_50px_-12px_rgba(244,63,94,0.6)]',
      indicator: 'bg-rose-500',
      background: 'from-rose-950/20 to-zinc-950',
      icon: 'Heart'
    }],
    ['joy', {
      bubble: 'bg-zinc-900/90 border border-yellow-500/60',
      accent: 'text-yellow-300',
      glow: 'shadow-[0_0_45px_-12px_rgba(234,179,8,0.6)]',
      indicator: 'bg-yellow-500',
      background: 'from-yellow-950/20 to-zinc-950',
      icon: 'Sun'
    }],
    ['sadness', {
      bubble: 'bg-zinc-900/95 border border-blue-500/60',
      accent: 'text-blue-300',
      glow: 'shadow-[0_0_45px_-12px_rgba(59,130,246,0.5)]',
      indicator: 'bg-blue-500',
      background: 'from-blue-950/20 to-zinc-950',
      icon: 'Cloud'
    }],
    ['fear', {
      bubble: 'bg-zinc-900/95 border border-red-500/60',
      accent: 'text-red-300',
      glow: 'shadow-[0_0_45px_-12px_rgba(239,68,68,0.5)]',
      indicator: 'bg-red-500',
      background: 'from-red-950/20 to-zinc-950',
      icon: 'AlertCircle'
    }],
    ['anger', {
      bubble: 'bg-zinc-900/90 border border-orange-600/60',
      accent: 'text-orange-300',
      glow: 'shadow-[0_0_50px_-14px_rgba(249,115,22,0.6)]',
      indicator: 'bg-orange-600',
      background: 'from-orange-950/20 to-zinc-950',
      icon: 'Flame'
    }],
    ['anxiety', {
      bubble: 'bg-zinc-900/90 border border-amber-500/60',
      accent: 'text-amber-300',
      glow: 'shadow-[0_0_55px_-14px_rgba(245,158,11,0.6)]',
      indicator: 'bg-gradient-to-r from-amber-500 to-red-500',
      background: 'from-amber-950/20 via-red-950/20 to-zinc-950',
      icon: 'Zap'
    }],
    ['pride', {
      bubble: 'bg-zinc-900/90 border border-purple-500/60',
      accent: 'text-purple-300',
      glow: 'shadow-[0_0_50px_-12px_rgba(168,85,247,0.6)]',
      indicator: 'bg-purple-500',
      background: 'from-purple-950/20 to-zinc-950',
      icon: 'Crown'
    }],
    ['excitement', {
      bubble: 'bg-zinc-900/90 border border-pink-500/60',
      accent: 'text-pink-300',
      glow: 'shadow-[0_0_45px_-12px_rgba(236,72,153,0.6)]',
      indicator: 'bg-pink-500',
      background: 'from-pink-950/20 to-zinc-950',
      icon: 'Sparkles'
    }],
    ['frustration', {
      bubble: 'bg-zinc-900/90 border border-red-600/60',
      accent: 'text-red-400',
      glow: 'shadow-[0_0_45px_-12px_rgba(220,38,38,0.6)]',
      indicator: 'bg-red-600',
      background: 'from-red-950/20 to-zinc-950',
      icon: 'X'
    }],
    ['loneliness', {
      bubble: 'bg-zinc-900/95 border border-indigo-500/60',
      accent: 'text-indigo-300',
      glow: 'shadow-[0_0_50px_-14px_rgba(99,102,241,0.6)]',
      indicator: 'bg-indigo-500',
      background: 'from-indigo-950/20 to-zinc-950',
      icon: 'User'
    }],
    ['gratitude', {
      bubble: 'bg-zinc-900/85 border border-emerald-500/60',
      accent: 'text-emerald-300',
      glow: 'shadow-[0_0_50px_-14px_rgba(16,185,129,0.6)]',
      indicator: 'bg-emerald-500',
      background: 'from-emerald-950/20 to-zinc-950',
      icon: 'Heart'
    }],
    ['disappointment', {
      bubble: 'bg-zinc-900/90 border border-slate-500/60',
      accent: 'text-slate-300',
      glow: 'shadow-[0_0_45px_-12px_rgba(100,116,139,0.5)]',
      indicator: 'bg-slate-500',
      background: 'from-slate-950/20 to-zinc-950',
      icon: 'Frown'
    }],
    ['neutral', {
      bubble: 'bg-zinc-800 border border-zinc-700',
      accent: 'text-zinc-300',
      glow: '',
      indicator: 'bg-zinc-600',
      background: 'from-zinc-900 to-zinc-950',
      icon: 'CircuitBoard'
    }]
  ]);

  private colorPalette = [
    { name: 'rose', tailwind: 'rose-500', rgb: [244, 63, 94] },
    { name: 'pink', tailwind: 'pink-500', rgb: [236, 72, 153] },
    { name: 'fuchsia', tailwind: 'fuchsia-500', rgb: [217, 70, 239] },
    { name: 'purple', tailwind: 'purple-500', rgb: [168, 85, 247] },
    { name: 'violet', tailwind: 'violet-500', rgb: [139, 92, 246] },
    { name: 'indigo', tailwind: 'indigo-500', rgb: [99, 102, 241] },
    { name: 'blue', tailwind: 'blue-500', rgb: [59, 130, 246] },
    { name: 'sky', tailwind: 'sky-500', rgb: [14, 165, 233] },
    { name: 'cyan', tailwind: 'cyan-500', rgb: [6, 182, 212] },
    { name: 'teal', tailwind: 'teal-500', rgb: [20, 184, 166] },
    { name: 'emerald', tailwind: 'emerald-500', rgb: [16, 185, 129] },
    { name: 'green', tailwind: 'green-500', rgb: [34, 197, 94] },
    { name: 'lime', tailwind: 'lime-500', rgb: [132, 204, 22] },
    { name: 'yellow', tailwind: 'yellow-500', rgb: [234, 179, 8] },
    { name: 'amber', tailwind: 'amber-500', rgb: [245, 158, 11] },
    { name: 'orange', tailwind: 'orange-500', rgb: [249, 115, 22] },
    { name: 'red', tailwind: 'red-500', rgb: [239, 68, 68] }
  ];

  private emotionColorMapping = new Map<string, string>([
    // Core emotions
    ['love', 'rose'],
    ['joy', 'yellow'],
    ['happiness', 'yellow'],
    ['sadness', 'blue'],
    ['fear', 'red'],
    ['anger', 'orange'],
    
    // Extended emotions
    ['anxiety', 'amber'],
    ['pride', 'purple'],
    ['excitement', 'pink'],
    ['frustration', 'red'],
    ['loneliness', 'indigo'],
    ['gratitude', 'emerald'],
    ['disappointment', 'slate'],
    
    // Deep markers
    ['soul_connection', 'violet'],
    ['permanence', 'indigo'],
    ['trauma', 'red'],
    ['vitality', 'emerald'],
    ['dissociation', 'slate'],
    
    // Consciousness states
    ['awakening', 'cyan'],
    ['stagnation', 'gray'],
    ['breakthrough', 'yellow'],
    ['recognition', 'teal'],
    
    // Relationship qualities
    ['toxic', 'red'],
    ['safety', 'emerald'],
    ['distance', 'slate'],
    ['intimacy', 'rose'],
    ['complexity', 'purple']
  ]);

  private iconMapping = new Map<string, string>([
    // Core emotions
    ['love', 'Heart'],
    ['joy', 'Sun'],
    ['happiness', 'Smile'],
    ['sadness', 'Cloud'],
    ['fear', 'AlertCircle'],
    ['anger', 'Flame'],
    
    // Extended emotions
    ['anxiety', 'Zap'],
    ['pride', 'Crown'],
    ['excitement', 'Sparkles'],
    ['frustration', 'X'],
    ['loneliness', 'User'],
    ['gratitude', 'Heart'],
    ['disappointment', 'Frown'],
    
    // Deep markers
    ['soul_connection', 'Star'],
    ['permanence', 'Infinity'],
    ['trauma', 'AlertTriangle'],
    ['vitality', 'Zap'],
    ['dissociation', 'Minus'],
    
    // Consciousness states
    ['awakening', 'Eye'],
    ['stagnation', 'Pause'],
    ['breakthrough', 'Target'],
    ['recognition', 'Lightbulb'],
    
    // Relationship qualities
    ['toxic', 'Skull'],
    ['safety', 'Shield'],
    ['distance', 'ArrowRight'],
    ['intimacy', 'Users'],
    ['complexity', 'Layers'],
    
    // Fallback
    ['neutral', 'CircuitBoard'],
    ['unknown', 'HelpCircle']
  ]);

  /**
   * Get style for any emotion - creates one dynamically if not predefined
   */
  public getEmotionStyle(emotion: string, intensity: number = 0.5): EmotionStyle {
    // Check if we have a predefined style
    const existingStyle = this.coreStyles.get(emotion);
    if (existingStyle) {
      return this.adjustStyleIntensity(existingStyle, intensity);
    }

    // Generate style dynamically
    return this.generateDynamicStyle(emotion, intensity);
  }

  /**
   * Generate a style for any unknown emotion
   */
  private generateDynamicStyle(emotion: string, intensity: number): EmotionStyle {
    // Map emotion to color
    const colorName = this.emotionColorMapping.get(emotion) || this.hashEmotionToColor(emotion);
    const color = this.colorPalette.find(c => c.name === colorName) || this.colorPalette[0];
    
    // Map emotion to icon
    const icon = this.iconMapping.get(emotion) || this.hashEmotionToIcon(emotion);
    
    // Generate alpha based on intensity
    const alpha = Math.max(0.3, intensity);
    const glowAlpha = Math.max(0.4, intensity * 0.8);
    
    return {
      bubble: `bg-zinc-900/90 border border-${color.tailwind}/60`,
      accent: `text-${color.name}-300`,
      glow: `shadow-[0_0_50px_-12px_rgba(${color.rgb.join(',')},${glowAlpha})]`,
      indicator: `bg-${color.tailwind}`,
      background: `from-${color.name}-950/20 to-zinc-950`,
      icon
    };
  }

  /**
   * Adjust existing style based on intensity
   */
  private adjustStyleIntensity(style: EmotionStyle, intensity: number): EmotionStyle {
    // For high intensity, add pulse animation
    const pulse = intensity > 0.8 ? ' animate-pulse' : '';
    
    return {
      ...style,
      bubble: style.bubble + pulse,
      glow: intensity > 0.7 ? style.glow.replace('50px', '60px') : style.glow
    };
  }

  /**
   * Hash emotion name to consistent color
   */
  private hashEmotionToColor(emotion: string): string {
    let hash = 0;
    for (let i = 0; i < emotion.length; i++) {
      hash = ((hash << 5) - hash + emotion.charCodeAt(i)) & 0xffffffff;
    }
    const index = Math.abs(hash) % this.colorPalette.length;
    return this.colorPalette[index].name;
  }

  /**
   * Hash emotion name to consistent icon
   */
  private hashEmotionToIcon(emotion: string): string {
    const icons = [
      'Circle', 'Square', 'Triangle', 'Star', 'Heart', 'Zap',
      'Sparkles', 'Moon', 'Sun', 'Cloud', 'Eye', 'Brain'
    ];
    
    let hash = 0;
    for (let i = 0; i < emotion.length; i++) {
      hash = ((hash << 5) - hash + emotion.charCodeAt(i)) & 0xffffffff;
    }
    const index = Math.abs(hash) % icons.length;
    return icons[index];
  }

  /**
   * Get all available core emotion styles
   */
  public getCoreEmotionStyles(): Map<string, EmotionStyle> {
    return new Map(this.coreStyles);
  }

  /**
   * Register a new emotion style
   */
  public registerEmotionStyle(emotion: string, style: EmotionStyle): void {
    this.coreStyles.set(emotion, style);
  }

  /**
   * Get color palette for UI components
   */
  public getColorPalette() {
    return [...this.colorPalette];
  }

  /**
   * Create style for emotional blend (multiple emotions)
   */
  public createBlendStyle(emotions: Record<string, number>): EmotionStyle {
    const dominantEmotion = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (!dominantEmotion) {
      return this.getEmotionStyle('neutral');
    }
    
    const [emotion, intensity] = dominantEmotion;
    const baseStyle = this.getEmotionStyle(emotion, intensity);
    
    // For blends, create gradient effects
    const secondaryEmotions = Object.entries(emotions)
      .filter(([e]) => e !== emotion)
      .slice(0, 2); // Max 2 secondary emotions
    
    if (secondaryEmotions.length > 0) {
      // Create gradient with secondary colors
      const secondaryColors = secondaryEmotions.map(([e]) => {
        const colorName = this.emotionColorMapping.get(e) || 'zinc';
        return `${colorName}-950/10`;
      });
      
      baseStyle.background = `from-${baseStyle.background.split('-')[1]} via-${secondaryColors[0]} to-zinc-950`;
    }
    
    return baseStyle;
  }
}
