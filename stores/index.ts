// ============================
// CONSCIOUSNESS STORES v2
// Clean, focused store architecture for Longstrider
// ============================

export { useConsciousnessStore } from './consciousness-store'
export { useUIStore } from './ui-store'
export { useMemoryStore } from './memory-store'
export { useInstructionStore } from './instruction-store'

// Re-export types for convenience
export type { Thread, ConsciousnessState } from './consciousness-store'
export type { UIState } from './ui-store'
export type { MemoryArc, MemoryVaultItem, MemoryState } from './memory-store'
export type { Instruction, InstructionState } from './instruction-store'
