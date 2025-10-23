"use client"

import React, { useState, useMemo } from 'react'
import {
  Brain,
  GitBranch,
  Heart,
  Zap,
  Waves,
  Eye,
  Binary,
  TrendingUp,
  Clock,
  Link,
  Star,
  Network,
  Shield,
  Layers,
  Database,
  Info,
  Hash,
  ChevronRight
} from 'lucide-react'

// ============================
// DYNAMIC METADATA RENDERER
// Schema-agnostic field detection and rendering
// Extracted from chat-center.tsx
// ============================

// Helper for class names
function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// Dynamic field type detection
export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'unknown'

export function detectFieldType(value: any): FieldType {
  if (value === null || value === undefined) return 'unknown'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'string') return 'string'
  return 'unknown'
}

// Get appropriate icon for field name or type
export function getFieldIcon(fieldName: string, value: any): React.ReactNode {
  const name = fieldName.toLowerCase()

  // Name-based icons
  if (name.includes('memory') || name.includes('echo')) return <Brain className="w-3 h-3" />
  if (name.includes('pattern')) return <GitBranch className="w-3 h-3" />
  if (name.includes('emotion') || name.includes('feel')) return <Heart className="w-3 h-3" />
  if (name.includes('gravity') || name.includes('weight')) return <Zap className="w-3 h-3" />
  if (name.includes('resonance') || name.includes('wave')) return <Waves className="w-3 h-3" />
  if (name.includes('conscious')) return <Eye className="w-3 h-3" />
  if (name.includes('token')) return <Binary className="w-3 h-3" />
  if (name.includes('cost') || name.includes('price')) return <TrendingUp className="w-3 h-3" />
  if (name.includes('time') || name.includes('date')) return <Clock className="w-3 h-3" />
  if (name.includes('link') || name.includes('connect')) return <Link className="w-3 h-3" />
  if (name.includes('synthesis') || name.includes('summary')) return <Star className="w-3 h-3" />
  if (name.includes('network') || name.includes('graph')) return <Network className="w-3 h-3" />
  if (name.includes('shield') || name.includes('protect')) return <Shield className="w-3 h-3" />
  if (name.includes('mode') || name.includes('state')) return <Layers className="w-3 h-3" />
  if (name.includes('data') || name.includes('store')) return <Database className="w-3 h-3" />

  // Type-based fallbacks
  const fieldType = detectFieldType(value)
  if (fieldType === 'array') return <Layers className="w-3 h-3" />
  if (fieldType === 'object') return <Database className="w-3 h-3" />
  if (fieldType === 'number') return <Hash className="w-3 h-3" />

  return <Info className="w-3 h-3" />
}

// Get color scheme for field
export function getFieldColorScheme(fieldName: string, value: any): { bg: string, border: string, text: string } {
  const name = fieldName.toLowerCase()

  // Priority/importance fields
  if (name.includes('gravity') || name.includes('important') || name.includes('critical')) {
    const intensity = typeof value === 'number' ? value : 0.5
    if (intensity > 0.8) return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' }
    if (intensity > 0.6) return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' }
    return { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' }
  }

  // Memory/echo fields
  if (name.includes('memory') || name.includes('echo')) {
    return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' }
  }

  // Pattern fields
  if (name.includes('pattern') || name.includes('match')) {
    return { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' }
  }

  // Emotional fields
  if (name.includes('emotion') || name.includes('feel')) {
    return { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' }
  }

  // Consciousness fields
  if (name.includes('conscious') || name.includes('aware')) {
    return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' }
  }

  // Default
  return { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400' }
}

// Format field name for display
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ============================
// DYNAMIC FIELD RENDERER
// ============================

export function DynamicField({
  name,
  value,
  depth = 0,
  expanded = false
}: {
  name: string
  value: any
  depth?: number
  expanded?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(expanded)
  const fieldType = detectFieldType(value)
  const colorScheme = getFieldColorScheme(name, value)
  const icon = getFieldIcon(name, value)

  // Don't render null/undefined
  if (value === null || value === undefined) return null

  // Simple values
  if (fieldType === 'string' || fieldType === 'number' || fieldType === 'boolean') {
    return (
      <div className={cx(
        "flex items-center gap-2 p-2 rounded-lg",
        colorScheme.bg,
        "border",
        colorScheme.border,
        colorScheme.text
      )}>
        {icon}
        <span className="text-xs font-medium opacity-70">{formatFieldName(name)}:</span>
        <span className="text-xs">
          {fieldType === 'number' && name.includes('cost')
            ? `$${value.toFixed(4)}`
            : fieldType === 'number' && (name.includes('score') || name.includes('confidence') || name.includes('intensity'))
            ? `${(value * 100).toFixed(0)}%`
            : String(value)
          }
        </span>
      </div>
    )
  }

  // Arrays
  if (fieldType === 'array') {
    const items = value as any[]
    if (items.length === 0) return null

    // Check if it's an array of simple values
    const isSimpleArray = items.every(item =>
      typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
    )

    if (isSimpleArray) {
      return (
        <div className={cx(
          "p-2 rounded-lg",
          colorScheme.bg,
          "border",
          colorScheme.border
        )}>
          <div className={cx("flex items-center gap-2 mb-1", colorScheme.text)}>
            {icon}
            <span className="text-xs font-medium">{formatFieldName(name)}</span>
            <span className="text-xs opacity-60">({items.length})</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {items.map((item, idx) => (
              <span
                key={idx}
                className={cx(
                  "px-2 py-0.5 rounded-full text-xs",
                  "bg-white/5 border border-white/10"
                )}
              >
                {String(item)}
              </span>
            ))}
          </div>
        </div>
      )
    }

    // Complex array - make expandable
    return (
      <div className={cx(
        "rounded-lg",
        colorScheme.bg,
        "border",
        colorScheme.border
      )}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cx(
            "w-full flex items-center gap-2 p-2 hover:bg-white/5 transition-colors",
            colorScheme.text
          )}
        >
          {icon}
          <span className="text-xs font-medium">{formatFieldName(name)}</span>
          <span className="text-xs opacity-60">({items.length} items)</span>
          <ChevronRight className={cx(
            "w-3 h-3 ml-auto transition-transform",
            isExpanded && "rotate-90"
          )} />
        </button>
        {isExpanded && (
          <div className="p-2 pt-0 space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="pl-4">
                {typeof item === 'object' ? (
                  <DynamicObject data={item} depth={depth + 1} />
                ) : (
                  <span className="text-xs opacity-80">{String(item)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Objects
  if (fieldType === 'object') {
    return (
      <div className={cx(
        "rounded-lg",
        colorScheme.bg,
        "border",
        colorScheme.border
      )}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cx(
            "w-full flex items-center gap-2 p-2 hover:bg-white/5 transition-colors",
            colorScheme.text
          )}
        >
          {icon}
          <span className="text-xs font-medium">{formatFieldName(name)}</span>
          <ChevronRight className={cx(
            "w-3 h-3 ml-auto transition-transform",
            isExpanded && "rotate-90"
          )} />
        </button>
        {isExpanded && (
          <div className="p-2 pt-0">
            <DynamicObject data={value} depth={depth + 1} />
          </div>
        )}
      </div>
    )
  }

  return null
}

// ============================
// DYNAMIC OBJECT RENDERER
// ============================

export function DynamicObject({
  data,
  depth = 0
}: {
  data: Record<string, any>
  depth?: number
}) {
  // Group fields by importance/type
  const groupedFields = useMemo(() => {
    const groups = {
      primary: [] as string[],    // gravity, resonance, scores
      memory: [] as string[],      // memory, echo, recall
      patterns: [] as string[],    // pattern, match, synthesis
      emotional: [] as string[],   // emotion, feeling, mood
      metadata: [] as string[]     // everything else
    }

    Object.keys(data).forEach(key => {
      const keyLower = key.toLowerCase()
      if (keyLower.includes('gravity') || keyLower.includes('score') || keyLower.includes('resonance')) {
        groups.primary.push(key)
      } else if (keyLower.includes('memory') || keyLower.includes('echo')) {
        groups.memory.push(key)
      } else if (keyLower.includes('pattern') || keyLower.includes('synthesis')) {
        groups.patterns.push(key)
      } else if (keyLower.includes('emotion') || keyLower.includes('feel')) {
        groups.emotional.push(key)
      } else {
        groups.metadata.push(key)
      }
    })

    return groups
  }, [data])

  return (
    <div className="space-y-2">
      {/* Primary fields - always show */}
      {groupedFields.primary.map(key => (
        <DynamicField key={key} name={key} value={data[key]} depth={depth} expanded={depth < 1} />
      ))}

      {/* Memory fields */}
      {groupedFields.memory.map(key => (
        <DynamicField key={key} name={key} value={data[key]} depth={depth} />
      ))}

      {/* Pattern fields */}
      {groupedFields.patterns.map(key => (
        <DynamicField key={key} name={key} value={data[key]} depth={depth} />
      ))}

      {/* Emotional fields */}
      {groupedFields.emotional.map(key => (
        <DynamicField key={key} name={key} value={data[key]} depth={depth} />
      ))}

      {/* Other metadata */}
      {groupedFields.metadata.map(key => (
        <DynamicField key={key} name={key} value={data[key]} depth={depth} />
      ))}
    </div>
  )
}
