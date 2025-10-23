"use client"

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useConsciousnessStore } from '@/stores/consciousness-store'
import { useUIStore } from '@/stores/ui-store'
import type { Space, Domain, Signal } from '@/stores/consciousness-store'
import { generateMockTokens, generateMockActivity, enrichSpaceWithEvolution } from '@/lib/mock-space-data'

// ============================
// MY NAVIGATOR HOOK v3 - SPACE ARCHITECTURE
// Navigate your thoughts through cognitive topology
// Domains → Spaces → Memories
// ============================

export interface NavigatorConfig {
  userId: string
  workspaceId: string
  enableAnalytics?: boolean
  autoSync?: boolean
}

export function useNavigator(config: NavigatorConfig) {
  const {
    userId,
    workspaceId,
    enableAnalytics = true,
    autoSync = true
  } = config

  // Navigation
  const router = useRouter()

  // Consciousness Store - Space & Domain data
  const {
    spaces,
    domains,
    cognitiveState,
    crossSpacePatterns,
    globalAnalytics,
    isLoading,
    isAnalyzing,
    // Domain actions
    createDomain,
    updateDomain,
    deleteDomain,
    getDomain,
    getSpacesByDomain,
    // Space actions
    linkToSpace,
    createSpace,
    updateSpace,
    deleteSpace,
    getSpace,
    anchorSpace,
    unanchorSpace,
    favoriteSpace,
    unfavoriteSpace,
    hibernateSpace,
    activateSpace,
    // Space operations
    branchSpace,
    cloneSpace,
    mergeSpaces,
    // Signal management
    addSignal,
    removeSignal,
    // Meta memory
    updateMetaMemory,
    analyzeCrossSpacePatterns,
    updateGlobalAnalytics,
    // Search
    searchSpaces,
    getSpacesByStatus,
    getAnchoredSpaces,
    getFavoriteSpaces,
    getSpaceHierarchy
  } = useConsciousnessStore()

  // UI Store - Interface state
  const {
    threadManager,
    intelligenceSidebar,
    loading,
    preferences,
    toggleDropdown,
    toggleSwitcher,
    toggleNewThreadModal,
    setSearchQuery,
    toggleThreadSelection,
    clearThreadSelection,
    toggleFolderExpansion,
    setActiveView,
    openIntelligenceSidebar,
    closeIntelligenceSidebar,
    setIntelligenceTab
  } = useUIStore()

  // Computed Values
  const currentSpace = useMemo(() => {
    return cognitiveState.current_space_id ? getSpace(cognitiveState.current_space_id) : null
  }, [cognitiveState.current_space_id, spaces, getSpace])

  const allSpaces = useMemo(() => {
    return Object.values(spaces)
  }, [spaces])

  const allDomains = useMemo(() => {
    return Object.values(domains)
  }, [domains])

  const recentSpaces = useMemo(() => {
    return Object.values(spaces)
      .filter(s => s.status === 'active')
      .sort((a, b) => b.last_activity_at - a.last_activity_at)
      .slice(0, 10)
  }, [spaces])

  const anchoredSpaces = useMemo(() => {
    return getAnchoredSpaces()
  }, [spaces])

  const favoriteSpaces = useMemo(() => {
    return getFavoriteSpaces()
  }, [spaces])

  const hibernatedSpaces = useMemo(() => {
    return getSpacesByStatus('hibernated')
  }, [spaces])

  // Domain Operations
  const handleCreateDomain = useCallback((
    data: Omit<Domain, 'id' | 'created_at'>
  ) => {
    const domain = createDomain(data)
    return domain
  }, [createDomain])

  const handleUpdateDomain = useCallback((
    domainId: string,
    updates: Partial<Domain>
  ) => {
    updateDomain(domainId, updates)
  }, [updateDomain])

  const handleDeleteDomain = useCallback((domainId: string) => {
    deleteDomain(domainId)
  }, [deleteDomain])

  // Space Operations
  const handleCreateSpace = useCallback((
    data: Omit<Space, 'id' | 'created_at' | 'updated_at' | 'last_activity_at'>
  ) => {
    // Enrich with mock data
    const mockTokens = generateMockTokens({ ...data, analytics: data.analytics } as Space)
    const mockActivity = generateMockActivity({ ...data, analytics: data.analytics } as Space)
    const mockEvolution = enrichSpaceWithEvolution({ ...data, analytics: data.analytics } as Space)
    
    const enrichedData = {
      ...data,
      recent_activity: mockActivity,
      analytics: {
        ...data.analytics,
        ...mockTokens
      },
      ...mockEvolution
    }
    
    const space = createSpace(enrichedData)
    
    // Link to newly created space
    linkToSpace(space.id)
    
    // Navigate to cognitive page for new space
    console.log('🧭 [useNavigator] Navigating to /cognitive for new space:', space.name)
    router.push('/cognitive')
    return space
  }, [createSpace, linkToSpace, router])

  const handleSwitchSpace = useCallback((spaceId: string) => {
    console.log('[Navigator] Switching to space:', spaceId)
    
    // Link to space
    linkToSpace(spaceId)
    console.log('[Navigator] Space linked:', spaceId)
    
    openIntelligenceSidebar(spaceId)
    
    // Navigate to cognitive page for conversation
    router.push('/cognitive')
  }, [linkToSpace, openIntelligenceSidebar, router])

  const handleUpdateSpace = useCallback((
    spaceId: string,
    updates: Partial<Space>
  ) => {
    updateSpace(spaceId, updates)
  }, [updateSpace])

  const handleDeleteSpace = useCallback((spaceId: string) => {
    if (cognitiveState.current_space_id === spaceId) {
      linkToSpace('')
    }
    deleteSpace(spaceId)
  }, [deleteSpace, cognitiveState.current_space_id, linkToSpace])

  const handleAnchorSpace = useCallback((spaceId: string) => {
    const space = getSpace(spaceId)
    if (space?.is_anchored) {
      unanchorSpace(spaceId)
    } else {
      anchorSpace(spaceId)
    }
  }, [getSpace, anchorSpace, unanchorSpace])

  const handleFavoriteSpace = useCallback((spaceId: string) => {
    const space = getSpace(spaceId)
    if (space?.is_favorite) {
      unfavoriteSpace(spaceId)
    } else {
      favoriteSpace(spaceId)
    }
  }, [getSpace, favoriteSpace, unfavoriteSpace])

  const handleHibernateSpace = useCallback((spaceId: string) => {
    hibernateSpace(spaceId)
    if (cognitiveState.current_space_id === spaceId) {
      linkToSpace('')
    }
  }, [hibernateSpace, cognitiveState.current_space_id, linkToSpace])

  const handleActivateSpace = useCallback((spaceId: string) => {
    activateSpace(spaceId)
  }, [activateSpace])

  // Branch Space (creates child with parent reference)
  const handleBranchSpace = useCallback((
    sourceSpaceId: string,
    options: {
      name: string
      description?: string
    }
  ) => {
    const branchedSpace = branchSpace(sourceSpaceId, options.name)
    if (options.description) {
      updateSpace(branchedSpace.id, { description: options.description })
    }
    linkToSpace(branchedSpace.id)
    
    // Navigate to cognitive page for branched space
    router.push('/cognitive')
    return branchedSpace
  }, [branchSpace, updateSpace, linkToSpace, router])

  // Clone Space (creates independent copy)
  const handleCloneSpace = useCallback((
    sourceSpaceId: string,
    newName: string
  ) => {
    const clonedSpace = cloneSpace(sourceSpaceId, newName)
    linkToSpace(clonedSpace.id)
    
    // Navigate to cognitive page for cloned space
    router.push('/cognitive')
    return clonedSpace
  }, [cloneSpace, linkToSpace, router])

  // Merge Spaces
  const handleMergeSpaces = useCallback((
    sourceSpaceIds: string[],
    targetName: string
  ) => {
    const mergedSpace = mergeSpaces(sourceSpaceIds, targetName)
    linkToSpace(mergedSpace.id)
    
    // Navigate to cognitive page for merged space
    router.push('/cognitive')
    return mergedSpace
  }, [mergeSpaces, linkToSpace, router])

  // Signal Management
  const handleAddSignal = useCallback((
    spaceId: string,
    signalData: Omit<Signal, 'id' | 'created_at'>
  ) => {
    addSignal(spaceId, signalData)
  }, [addSignal])

  const handleRemoveSignal = useCallback((
    spaceId: string,
    signalId: string
  ) => {
    removeSignal(spaceId, signalId)
  }, [removeSignal])

  // Move Space to Domain
  const handleMoveSpaceToDomain = useCallback((
    spaceId: string,
    domainId: string
  ) => {
    updateSpace(spaceId, { domain_id: domainId })
  }, [updateSpace])

  // Update Space Path
  const handleUpdateSpacePath = useCallback((
    spaceId: string,
    spacePath: string[]
  ) => {
    updateSpace(spaceId, { space_path: spacePath })
  }, [updateSpace])

  // Search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    return searchSpaces(query)
  }, [searchSpaces, setSearchQuery])

  // Analytics
  const handleUpdateAnalytics = useCallback((
    spaceId: string,
    analytics: Partial<Space['analytics']>
  ) => {
    const space = getSpace(spaceId)
    if (!space) return

    updateSpace(spaceId, {
      analytics: {
        ...space.analytics,
        ...analytics
      },
      last_activity_at: Date.now()
    })

    if (enableAnalytics) {
      updateGlobalAnalytics()
    }
  }, [getSpace, updateSpace, updateGlobalAnalytics, enableAnalytics])

  // Meta Memory
  const handleUpdateMetaMemory = useCallback((
    spaceId: string,
    metaMemory: Space['meta_memory']
  ) => {
    updateMetaMemory(spaceId, metaMemory)
    
    if (enableAnalytics) {
      analyzeCrossSpacePatterns()
    }
  }, [updateMetaMemory, analyzeCrossSpacePatterns, enableAnalytics])

  return {
    // Data
    currentSpace,
    allSpaces,
    allDomains,
    recentSpaces,
    anchoredSpaces,
    favoriteSpaces,
    hibernatedSpaces,
    crossSpacePatterns,
    globalAnalytics,
    
    // UI State
    ui: {
      threadManager, // Keep for backward compat with UI store
      intelligenceSidebar,
      loading,
      preferences
    },
    
    // Loading States
    isLoading,
    isAnalyzing,
    
    // Domain Operations
    createDomain: handleCreateDomain,
    updateDomain: handleUpdateDomain,
    deleteDomain: handleDeleteDomain,
    getDomain,
    getSpacesByDomain,
    
    // Space Operations
    createSpace: handleCreateSpace,
    switchSpace: handleSwitchSpace,
    updateSpace: handleUpdateSpace,
    deleteSpace: handleDeleteSpace,
    anchorSpace: handleAnchorSpace,
    favoriteSpace: handleFavoriteSpace,
    hibernateSpace: handleHibernateSpace,
    activateSpace: handleActivateSpace,
    branchSpace: handleBranchSpace,
    cloneSpace: handleCloneSpace,
    mergeSpaces: handleMergeSpaces,
    
    // Organization
    addSignal: handleAddSignal,
    removeSignal: handleRemoveSignal,
    moveSpaceToDomain: handleMoveSpaceToDomain,
    updateSpacePath: handleUpdateSpacePath,
    
    // Search
    search: handleSearch,
    searchQuery: threadManager.searchQuery,
    
    // Analytics & Meta Memory
    updateAnalytics: handleUpdateAnalytics,
    updateMetaMemory: handleUpdateMetaMemory,
    
    // Queries
    getSpace,
    getSpacesByStatus,
    getSpaceHierarchy,
    
    // UI Actions
    toggleDropdown,
    toggleSwitcher,
    toggleNewThreadModal,
    toggleThreadSelection,
    clearThreadSelection,
    toggleFolderExpansion,
    setActiveView,
    openIntelligenceSidebar,
    closeIntelligenceSidebar,
    setIntelligenceTab,
    
    // Config
    config: {
      userId,
      workspaceId,
      enableAnalytics,
      autoSync
    }
  }
}
