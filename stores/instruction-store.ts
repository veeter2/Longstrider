"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================
// INSTRUCTION STORE v2
// Cortex integration + instruction evolution (placeholder for now)
// ============================

export interface Instruction {
  id: string
  name: string
  description: string
  code: string
  weight: number
  confidence: number
  maturity: 'draft' | 'developing' | 'mature' | 'deprecated'
  conflicts: string[]
  dependencies: string[]
  createdAt: number
  updatedAt: number
  lastUsed: number
  usageCount: number
}

export interface InstructionState {
  // Instructions
  instructions: Record<string, Instruction>
  
  // Active Instructions
  activeInstructionIds: string[]
  
  // Conflicts
  conflicts: Array<{
    id: string
    instructionIds: string[]
    severity: 'low' | 'medium' | 'high'
    resolution?: string
  }>
  
  // Loading
  isLoading: boolean
  isResolvingConflicts: boolean
  
  // Actions (placeholder - will implement when we connect to Cortex)
  addInstruction: (instruction: Omit<Instruction, 'id' | 'createdAt' | 'updatedAt' | 'lastUsed' | 'usageCount'>) => Instruction
  updateInstruction: (id: string, updates: Partial<Instruction>) => void
  deleteInstruction: (id: string) => void
  activateInstruction: (id: string) => void
  deactivateInstruction: (id: string) => void
  resolveConflict: (conflictId: string, resolution: string) => void
  getActiveInstructions: () => Instruction[]
  getInstructionsByMaturity: (maturity: Instruction['maturity']) => Instruction[]
}

export const useInstructionStore = create<InstructionState>()(
  persist(
    (set, get) => ({
      // Initial State
      instructions: {},
      activeInstructionIds: [],
      conflicts: [],
      isLoading: false,
      isResolvingConflicts: false,
      
      // Placeholder Actions
      addInstruction: (instructionData) => {
        const id = crypto.randomUUID()
        const now = Date.now()
        
        const instruction: Instruction = {
          ...instructionData,
          id,
          createdAt: now,
          updatedAt: now,
          lastUsed: now,
          usageCount: 0
        }
        
        set((state) => ({
          instructions: { ...state.instructions, [id]: instruction }
        }))
        
        return instruction
      },
      
      updateInstruction: (id, updates) => {
        set((state) => {
          const instruction = state.instructions[id]
          if (!instruction) return state
          
          return {
            instructions: {
              ...state.instructions,
              [id]: {
                ...instruction,
                ...updates,
                updatedAt: Date.now()
              }
            }
          }
        })
      },
      
      deleteInstruction: (id) => {
        set((state) => {
          const { [id]: deleted, ...remaining } = state.instructions
          return {
            instructions: remaining,
            activeInstructionIds: state.activeInstructionIds.filter(activeId => activeId !== id)
          }
        })
      },
      
      activateInstruction: (id) => {
        set((state) => {
          if (state.activeInstructionIds.includes(id)) return state
          
          return {
            activeInstructionIds: [...state.activeInstructionIds, id]
          }
        })
        
        // Update usage
        get().updateInstruction(id, { 
          lastUsed: Date.now(),
          usageCount: (get().instructions[id]?.usageCount || 0) + 1
        })
      },
      
      deactivateInstruction: (id) => {
        set((state) => ({
          activeInstructionIds: state.activeInstructionIds.filter(activeId => activeId !== id)
        }))
      },
      
      resolveConflict: (conflictId, resolution) => {
        set((state) => ({
          conflicts: state.conflicts.map(conflict => 
            conflict.id === conflictId 
              ? { ...conflict, resolution }
              : conflict
          )
        }))
      },
      
      getActiveInstructions: () => {
        return get().activeInstructionIds
          .map(id => get().instructions[id])
          .filter(Boolean)
      },
      
      getInstructionsByMaturity: (maturity) => {
        return Object.values(get().instructions)
          .filter(instruction => instruction.maturity === maturity)
      }
    }),
    {
      name: 'instruction-store-v2',
      partialize: (state) => ({
        instructions: state.instructions,
        activeInstructionIds: state.activeInstructionIds,
        conflicts: state.conflicts
      })
    }
  )
)
