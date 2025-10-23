"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================
// UI STORE v2
// Pure frontend interface state management
// ============================

interface RailState {
  isCollapsed: boolean
  width: number
  storageKey: string
}

export interface UIState {
  // Thread Manager UI
  threadManager: {
    showDropdown: boolean
    showSwitcher: boolean
    showNewThreadModal: boolean
    searchQuery: string
    selectedThreadIds: string[]
    expandedFolders: string[]
    activeView: 'list' | 'grid' | 'timeline' | 'graph'
  }
  
  // Intelligence Sidebar
  intelligenceSidebar: {
    isOpen: boolean
    currentThreadId: string | null
    activeTab: 'meta-cognition' | 'connections' | 'metrics'
  }
  
  // Modals
  modals: {
    showFolderModal: boolean
    showTagModal: boolean
    showExportModal: boolean
    showSettingsModal: boolean
  }
  
  // Navigation
  navigation: {
    sidebarCollapsed: boolean
    currentRoute: string
    breadcrumbs: Array<{
      label: string
      path: string
    }>
  }
  
  // Loading States
  loading: {
    isCreatingThread: boolean
    isUpdatingThread: boolean
    isDeletingThread: boolean
    isAnalyzingPatterns: boolean
  }
  
  // User Preferences
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    defaultView: 'list' | 'grid' | 'timeline' | 'graph'
    autoSave: boolean
    showAnalytics: boolean
    showMetaMemory: boolean
  }
  
  // Rail System
  rails: {
    left: RailState
    right: RailState
    globalSync: boolean
  }
  
  // Actions
  setThreadManagerState: (updates: Partial<UIState['threadManager']>) => void
  setIntelligenceSidebarState: (updates: Partial<UIState['intelligenceSidebar']>) => void
  setModalState: (modal: keyof UIState['modals'], isOpen: boolean) => void
  setNavigationState: (updates: Partial<UIState['navigation']>) => void
  setLoadingState: (key: keyof UIState['loading'], isLoading: boolean) => void
  setPreferences: (updates: Partial<UIState['preferences']>) => void
  
  // Rail System Actions
  setRailState: (side: 'left' | 'right', updates: Partial<RailState>) => void
  toggleRail: (side: 'left' | 'right') => void
  setRailWidth: (side: 'left' | 'right', width: number) => void
  
  // Thread Manager Actions
  toggleDropdown: () => void
  toggleSwitcher: () => void
  toggleNewThreadModal: () => void
  setSearchQuery: (query: string) => void
  toggleThreadSelection: (id: string) => void
  clearThreadSelection: () => void
  toggleFolderExpansion: (folderPath: string) => void
  setActiveView: (view: UIState['threadManager']['activeView']) => void
  
  // Intelligence Sidebar Actions
  openIntelligenceSidebar: (threadId: string) => void
  closeIntelligenceSidebar: () => void
  setIntelligenceTab: (tab: UIState['intelligenceSidebar']['activeTab']) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial State
      threadManager: {
        showDropdown: false,
        showSwitcher: false,
        showNewThreadModal: false,
        searchQuery: '',
        selectedThreadIds: [],
        expandedFolders: [],
        activeView: 'list'
      },
      
      intelligenceSidebar: {
        isOpen: false,
        currentThreadId: null,
        activeTab: 'meta-cognition'
      },
      
      modals: {
        showFolderModal: false,
        showTagModal: false,
        showExportModal: false,
        showSettingsModal: false
      },
      
      navigation: {
        sidebarCollapsed: false,
        currentRoute: '/living-memory',
        breadcrumbs: [
          { label: 'Home', path: '/' },
          { label: 'Living Memory', path: '/living-memory' }
        ]
      },
      
      loading: {
        isCreatingThread: false,
        isUpdatingThread: false,
        isDeletingThread: false,
        isAnalyzingPatterns: false
      },
      
      preferences: {
        theme: 'dark',
        defaultView: 'list',
        autoSave: true,
        showAnalytics: true,
        showMetaMemory: true
      },
      
      rails: {
        left: {
          isCollapsed: false,
          width: 280,
          storageKey: 'rail-left'
        },
        right: {
          isCollapsed: false,
          width: 320,
          storageKey: 'rail-right'
        },
        globalSync: true
      },
      
      // Actions
      setThreadManagerState: (updates) => {
        set((state) => ({
          threadManager: { ...state.threadManager, ...updates }
        }))
      },
      
      setIntelligenceSidebarState: (updates) => {
        set((state) => ({
          intelligenceSidebar: { ...state.intelligenceSidebar, ...updates }
        }))
      },
      
      setModalState: (modal, isOpen) => {
        set((state) => ({
          modals: { ...state.modals, [modal]: isOpen }
        }))
      },
      
      setNavigationState: (updates) => {
        set((state) => ({
          navigation: { ...state.navigation, ...updates }
        }))
      },
      
      setLoadingState: (key, isLoading) => {
        set((state) => ({
          loading: { ...state.loading, [key]: isLoading }
        }))
      },
      
      setPreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates }
        }))
      },
      
      // Thread Manager Actions
      toggleDropdown: () => {
        set((state) => ({
          threadManager: { ...state.threadManager, showDropdown: !state.threadManager.showDropdown }
        }))
      },
      
      toggleSwitcher: () => {
        set((state) => ({
          threadManager: { ...state.threadManager, showSwitcher: !state.threadManager.showSwitcher }
        }))
      },
      
      toggleNewThreadModal: () => {
        set((state) => ({
          threadManager: { ...state.threadManager, showNewThreadModal: !state.threadManager.showNewThreadModal }
        }))
      },
      
      setSearchQuery: (query) => {
        set((state) => ({
          threadManager: { ...state.threadManager, searchQuery: query }
        }))
      },
      
      toggleThreadSelection: (id) => {
        set((state) => {
          const selectedIds = state.threadManager.selectedThreadIds
          const newSelection = selectedIds.includes(id)
            ? selectedIds.filter(selectedId => selectedId !== id)
            : [...selectedIds, id]
          
          return {
            threadManager: { ...state.threadManager, selectedThreadIds: newSelection }
          }
        })
      },
      
      clearThreadSelection: () => {
        set((state) => ({
          threadManager: { ...state.threadManager, selectedThreadIds: [] }
        }))
      },
      
      toggleFolderExpansion: (folderPath) => {
        set((state) => {
          const expandedFolders = state.threadManager.expandedFolders
          const newExpanded = expandedFolders.includes(folderPath)
            ? expandedFolders.filter(path => path !== folderPath)
            : [...expandedFolders, folderPath]
          
          return {
            threadManager: { ...state.threadManager, expandedFolders: newExpanded }
          }
        })
      },
      
      setActiveView: (view) => {
        set((state) => ({
          threadManager: { ...state.threadManager, activeView: view }
        }))
      },
      
      // Intelligence Sidebar Actions
      openIntelligenceSidebar: (threadId) => {
        set((state) => ({
          intelligenceSidebar: {
            ...state.intelligenceSidebar,
            isOpen: true,
            currentThreadId: threadId
          }
        }))
      },
      
      closeIntelligenceSidebar: () => {
        set((state) => ({
          intelligenceSidebar: {
            ...state.intelligenceSidebar,
            isOpen: false,
            currentThreadId: null
          }
        }))
      },
      
      setIntelligenceTab: (tab) => {
        set((state) => ({
          intelligenceSidebar: { ...state.intelligenceSidebar, activeTab: tab }
        }))
      },
      
      // Rail System Actions
      setRailState: (side, updates) => {
        set((state) => ({
          rails: {
            ...state.rails,
            [side]: { ...state.rails[side], ...updates }
          }
        }))
      },
      
      toggleRail: (side) => {
        set((state) => {
          const newCollapsed = !state.rails[side].isCollapsed
          const storageKey = state.rails[side].storageKey
          
          // Persist to localStorage for backward compatibility
          if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, newCollapsed.toString())
          }
          
          return {
            rails: {
              ...state.rails,
              [side]: { ...state.rails[side], isCollapsed: newCollapsed }
            }
          }
        })
      },
      
      setRailWidth: (side, width) => {
        set((state) => ({
          rails: {
            ...state.rails,
            [side]: { ...state.rails[side], width }
          }
        }))
      },
      
    }),
    {
      name: 'ui-store-v2',
      // Only persist user preferences, not transient UI state
      partialize: (state) => ({
        preferences: state.preferences,
        navigation: {
          sidebarCollapsed: state.navigation.sidebarCollapsed,
          currentRoute: state.navigation.currentRoute
        },
        rails: {
          left: {
            isCollapsed: state.rails.left.isCollapsed,
            width: state.rails.left.width
          },
          right: {
            isCollapsed: state.rails.right.isCollapsed,
            width: state.rails.right.width
          },
          globalSync: state.rails.globalSync
        }
      })
    }
  )
)
