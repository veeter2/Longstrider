"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUIStore } from "@/stores/ui-store"

interface RailSidebarProps {
  children: ReactNode
  side: "left" | "right"
  defaultWidth?: number
  className?: string
  cognitiveBand?: "theta-high" | "gamma-low" | "beta-low" | "sigma" | "delta"
}

export function RailSidebar({ 
  children, 
  side, 
  defaultWidth = 280, 
  className = "",
  cognitiveBand = side === "left" ? "theta-high" : "sigma"
}: RailSidebarProps) {
  const [isMounted, setIsMounted] = useState(false)
  const isInitialized = useRef(false)
  
  // Get rail state from global store
  const railState = useUIStore((state) => state.rails[side])
  const toggleRail = useUIStore((state) => state.toggleRail)
  const setRailState = useUIStore((state) => state.setRailState)

  // Initialize component once - FIX: Prevent re-initialization loops
  useEffect(() => {
    setIsMounted(true)

    // Only initialize once per component lifecycle
    // If store doesn't have this rail's width set, initialize it
    if (!isInitialized.current) {
      isInitialized.current = true
      // Only update if the width is significantly different from default
      if (!railState.width || Math.abs(railState.width - defaultWidth) > 10) {
        setRailState(side, {
          width: defaultWidth,
          isCollapsed: railState.isCollapsed ?? false,
          storageKey: `rail-${side}`
        })
      }
    }
  }, []) // FIX: Remove dependencies to prevent re-runs

  const toggleSidebar = () => {
    toggleRail(side)
  }

  // Get current state with proper defaults - FIX: Simplify state derivation
  const isCollapsed = railState?.isCollapsed ?? false
  const currentWidth = railState?.width || defaultWidth

  // FIX: Prevent animation on mount
  const shouldAnimate = isMounted && isInitialized.current

  // Cognitive band mapping per design laws (Section 16)
  const getBandClass = (band: string) => {
    const bandMap = {
      "theta-high": "band-theta-high",
      "gamma-low": "band-gamma-low", 
      "beta-low": "band-beta-low",
      "sigma": "band-sigma",
      "delta": "band-delta"
    }
    return bandMap[band as keyof typeof bandMap] || "band-theta-high"
  }

  // Get appropriate alpha values for different bands
  // Handle alpha values are standardized - both rails must behave identically
  const getBandAlphas = (band: string) => {
    // Standard handle alpha values that both rails must use for consistency
    // INCREASED VISIBILITY: Handles now have stronger color presence
    const standardHandleAlphas = {
      bg: 0.5,       // Increased collapse handle background (was 0.3)
      border: 0.6,   // Increased collapse handle border (was 0.4)
      inner: 1.0,    // Maximum collapse inner indicator (was 0.8)
      hoverBg: 0.7,  // Increased hover background (was 0.5)
      hoverBorder: 0.8, // Increased hover border (was 0.6)
      hoverInner: 1.0,  // Maximum inner visibility on hover
      expandBg: 0.6,       // Increased visibility for collapsed handles (was 0.4)
      expandBorder: 0.7,    // Increased border for collapsed handles (was 0.5)
      expandInner: 1.0,     // Maximum inner indicator (was 0.8)
      expandHoverBg: 0.8,   // Increased hover state (was 0.6)
      expandHoverBorder: 0.9,  // Increased hover border (was 0.7)
      expandHoverInner: 1.0,   // Maximum inner visibility on hover
      expandArrow: 0.9,     // Increased arrow visibility (was 0.7)
      expandArrowHover: 1.0 // Maximum arrow hover (was 0.9)
    }

    // Use standard handle alphas for all bands to ensure left/right rail consistency
    return standardHandleAlphas
  }

  const bandAlphas = getBandAlphas(cognitiveBand)

  // Standardized handle dimensions - both rails identical per design laws (Section 6.3 LOCKED)
  const COLLAPSE_INNER_HEIGHT = "h-12"  // 48px - comfortable touch target
  const COLLAPSE_INNER_WIDTH = "w-0.5"  // 2px - subtle when expanded
  const EXPAND_INNER_HEIGHT = "h-12"    // 48px - MUST match collapse handle
  const EXPAND_INNER_WIDTH = "w-1"      // 4px - more visible when collapsed

  // Both rails use same handle color for consistency - use left rail color (theta-high)
  const handleBandClass = "band-theta-high"

  // Build color classes with proper CSS variable syntax
  const collapseHandleClasses = `bg-[rgba(var(--${handleBandClass}),${bandAlphas.bg})] hover:bg-[rgba(var(--${handleBandClass}),${bandAlphas.hoverBg})] border-[rgba(var(--${handleBandClass}),${bandAlphas.border})] hover:border-[rgba(var(--${handleBandClass}),${bandAlphas.hoverBorder})]`
  const collapseInnerClasses = `bg-[rgba(var(--${handleBandClass}),${bandAlphas.inner})] group-hover:bg-[rgba(var(--${handleBandClass}),${bandAlphas.hoverInner})]`
  const expandHandleClasses = `bg-[rgba(var(--${handleBandClass}),${bandAlphas.expandBg})] hover:bg-[rgba(var(--${handleBandClass}),${bandAlphas.expandHoverBg})] border-[rgba(var(--${handleBandClass}),${bandAlphas.expandBorder})] hover:border-[rgba(var(--${handleBandClass}),${bandAlphas.expandHoverBorder})]`
  const expandInnerClasses = `bg-[rgba(var(--${handleBandClass}),${bandAlphas.expandInner})] group-hover:bg-[rgba(var(--${handleBandClass}),${bandAlphas.expandHoverInner})]`
  const expandArrowClasses = `border-[rgba(var(--${handleBandClass}),${bandAlphas.expandArrow})] group-hover:border-[rgba(var(--${handleBandClass}),${bandAlphas.expandArrowHover})]`

  // Rail border - matches the handle color for cohesion (Living Laws Section 2.2)
  const railBorderClass = `border-[rgba(var(--${handleBandClass}),0.15)]`

  return (
    <>
      {/* Sidebar Container */}
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? 0 : currentWidth,
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={shouldAnimate ? {
          duration: 0.3, // Using --duration-base token value
          ease: "easeOut", // Using --ease-out from design laws (Framer Motion format)
          opacity: { duration: 0.2 } // Using --duration-fast token value
        } : { duration: 0 }}
        className={`relative h-full flex-shrink-0 overflow-hidden ${className}`}
        style={{
          // FIX: Ensure stable width during transitions
          minWidth: isCollapsed ? 0 : undefined,
          maxWidth: isCollapsed ? 0 : currentWidth
        }}
      >
        <div
          className={`h-full transition-opacity duration-200 ${isCollapsed ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'} ${side === "left" ? `border-r ${railBorderClass}` : `border-l ${railBorderClass}`} bg-black/20 backdrop-blur-sm`}
          style={{ width: currentWidth }} // FIX: Maintain content width
        >
          {children}
        </div>

        {/* Collapse Handle (when visible) */}
        {isMounted && !isCollapsed && (
          <button
            onClick={toggleSidebar}
            className={`absolute ${side === "left" ? "right-0 border-l" : "left-0 border-r"} top-1/2 -translate-y-1/2 w-1 h-16 ${collapseHandleClasses} transition-all duration-300 ease-out group z-40 rounded-sm hover:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--band-theta-high),0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900`}
            aria-label="Collapse sidebar"
          >
            <div
              className={`absolute ${side === "left" ? "right-0.5" : "left-0.5"} top-1/2 -translate-y-1/2 ${COLLAPSE_INNER_WIDTH} ${COLLAPSE_INNER_HEIGHT} ${collapseInnerClasses} rounded-full transition-all duration-300`}
            />
          </button>
        )}
      </motion.div>

      {/* Expand Handle (when collapsed) */}
      <AnimatePresence mode="wait">
        {isMounted && isCollapsed && (
          <motion.button
            key={`expand-handle-${side}`}
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={toggleSidebar}
            className={`fixed ${side === "left" ? "left-0 border-r" : "right-0 border-l"} top-1/2 -translate-y-1/2 w-4 h-24 ${expandHandleClasses} transition-all duration-300 ease-out group z-50 ${side === "left" ? "rounded-r-sm hover:rounded-r-md" : "rounded-l-sm hover:rounded-l-md"} backdrop-blur-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--band-theta-high),0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900`}
            aria-label="Expand sidebar"
          >
            {/* Handle indicator */}
            <div
              className={`absolute ${side === "left" ? "right-1.5" : "left-1.5"} top-1/2 -translate-y-1/2 ${EXPAND_INNER_WIDTH} ${EXPAND_INNER_HEIGHT} ${expandInnerClasses} rounded-full transition-all duration-300`}
            />
            {/* Expand arrow indicator */}
            <div
              className={`absolute ${side === "left" ? "right-0.5" : "left-0.5"} top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 ${expandArrowClasses} transition-all duration-300 ${side === "left" ? "rotate-45" : "-rotate-[135deg]"}`}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}