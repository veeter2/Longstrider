/**
 * USE CHAT UI
 * Manages UI state and interactions
 * 
 * Responsibilities:
 * - UI flags (search, filters, toggles)
 * - Scroll management
 * - Visual state
 */

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseChatUIOptions {
  autoScrollEnabled?: boolean
}

export function useChatUI(options: UseChatUIOptions = {}) {
  const {
    autoScrollEnabled = true
  } = options

  // UI State
  const [autoScroll, setAutoScroll] = useState(autoScrollEnabled)
  const [showOnlyInsights, setShowOnlyInsights] = useState(false)
  const [showConsciousness, setShowConsciousness] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Refs
  const listRef = useRef<HTMLDivElement>(null)

  // ============================
  // SCROLL MANAGEMENT
  // ============================
  const scrollToBottom = useCallback(() => {
    if (listRef.current && autoScroll) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [autoScroll])

  // Auto-scroll when content changes
  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  // ============================
  // TOGGLES
  // ============================
  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => !prev)
    if (showSearch) {
      setSearchQuery("") // Clear query when closing
    }
  }, [showSearch])

  const toggleInsightsOnly = useCallback(() => {
    setShowOnlyInsights((prev) => !prev)
  }, [])

  const toggleConsciousness = useCallback(() => {
    setShowConsciousness((prev) => !prev)
  }, [])

  const toggleDropdown = useCallback(() => {
    setShowDropdown((prev) => !prev)
  }, [])

  return {
    // State
    autoScroll,
    showOnlyInsights,
    showConsciousness,
    searchQuery,
    showSearch,
    showDropdown,
    
    // Refs
    listRef,
    
    // Actions
    setAutoScroll,
    setShowOnlyInsights,
    setShowConsciousness,
    setSearchQuery,
    setShowSearch,
    setShowDropdown,
    scrollToBottom,
    
    // Toggles
    toggleSearch,
    toggleInsightsOnly,
    toggleConsciousness,
    toggleDropdown,
  }
}
