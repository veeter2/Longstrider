"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================
// MEMORY STORE v2
// Memory Vault integration + memory arcs (placeholder for now)
// ============================

export interface MemoryArc {
  id: string
  threadId: string
  content: string
  timestamp: number
  gravity: number
  patterns: string[]
  connections: string[]
}

export interface MemoryVaultItem {
  id: string
  name: string
  type: 'document' | 'book' | 'pdf' | 'url' | 'note'
  content: string
  uploadDate: number
  lastAccessed: number
  tags: string[]
}

export interface MemoryState {
  // Memory Arcs
  memoryArcs: Record<string, MemoryArc>
  
  // Memory Vault
  vaultItems: Record<string, MemoryVaultItem>
  
  // Search
  searchQuery: string
  searchResults: string[]
  
  // Loading
  isLoading: boolean
  isSearching: boolean
  
  // Actions (placeholder - will implement when we connect to backend)
  addMemoryArc: (arc: Omit<MemoryArc, 'id'>) => MemoryArc
  getMemoryArcs: (threadId: string) => MemoryArc[]
  searchVault: (query: string) => void
  uploadToVault: (item: Omit<MemoryVaultItem, 'id' | 'uploadDate' | 'lastAccessed'>) => MemoryVaultItem
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set, get) => ({
      // Initial State
      memoryArcs: {},
      vaultItems: {},
      searchQuery: '',
      searchResults: [],
      isLoading: false,
      isSearching: false,
      
      // Placeholder Actions
      addMemoryArc: (arcData) => {
        const id = crypto.randomUUID()
        const arc: MemoryArc = {
          ...arcData,
          id
        }
        
        set((state) => ({
          memoryArcs: { ...state.memoryArcs, [id]: arc }
        }))
        
        return arc
      },
      
      getMemoryArcs: (threadId) => {
        return Object.values(get().memoryArcs).filter(arc => arc.threadId === threadId)
      },
      
      searchVault: (query) => {
        set({ searchQuery: query, isSearching: true })
        
        // Placeholder search logic
        const results = Object.keys(get().vaultItems).filter(id => {
          const item = get().vaultItems[id]
          return item.name.toLowerCase().includes(query.toLowerCase()) ||
                 item.content.toLowerCase().includes(query.toLowerCase())
        })
        
        set({ searchResults: results, isSearching: false })
      },
      
      uploadToVault: (itemData) => {
        const id = crypto.randomUUID()
        const now = Date.now()
        
        const item: MemoryVaultItem = {
          ...itemData,
          id,
          uploadDate: now,
          lastAccessed: now
        }
        
        set((state) => ({
          vaultItems: { ...state.vaultItems, [id]: item }
        }))
        
        return item
      }
    }),
    {
      name: 'memory-store-v2',
      partialize: (state) => ({
        memoryArcs: state.memoryArcs,
        vaultItems: state.vaultItems
      })
    }
  )
)
