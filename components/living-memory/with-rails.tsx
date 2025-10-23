"use client"

/**
 * Living Memory with Three-Rail Layout
 *
 * Wrapper that composes the Living Memory system with the global three-rail layout.
 * This component imports the full Living Memory system and will be refactored
 * iteratively to properly separate concerns.
 *
 * Architecture:
 * - Uses ThreeRailLayout for LEFT/CENTER/RIGHT rail structure
 * - LEFT: Temporal timeline (LivingMemoryLeftRail)
 * - CENTER: Memory detail view (from LivingMemorySystem)
 * - RIGHT: Meta intelligence (LivingMemoryRightRail)
 */

import { LivingMemorySystem } from './system'

export function LivingMemoryWithRails() {
  // TEMPORARY: Using the full Living Memory System as-is
  // TODO: Refactor to properly separate rails from center content
  return <LivingMemorySystem />
}
