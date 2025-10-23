"use client"

/**
 * Three-Rail Layout System
 *
 * Global layout wrapper providing LEFT, CENTER, RIGHT rail structure
 * Compliant with DESIGN-LIVING-LAWS.md v2.0 Section 6
 *
 * Architecture:
 * - LEFT RAIL: Temporal navigation, filters (RailSidebar)
 * - CENTER: Main content area (children)
 * - RIGHT RAIL: Intelligence, context, metrics (RailSidebar)
 *
 * Rails integrate with global UI store for state persistence
 * Handles follow locked specifications (Section 6.3)
 */

import { type ReactNode } from 'react'
import { RailSidebar } from '@/components/rail-sidebar'

interface ThreeRailLayoutProps {
  children: ReactNode
  leftRail?: ReactNode
  rightRail?: ReactNode
  leftRailWidth?: number
  rightRailWidth?: number
  leftRailCognitiveBand?: string
  rightRailCognitiveBand?: string
}

export function ThreeRailLayout({
  children,
  leftRail,
  rightRail,
  leftRailWidth = 320,
  rightRailWidth = 320,
  leftRailCognitiveBand = 'theta-high',
  rightRailCognitiveBand = 'gamma-low',
}: ThreeRailLayoutProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-950">
      {/* Page Header Bar - Spans all three sections */}
      <div className="flex-shrink-0 h-16 border-b border-white/10 bg-slate-950/50 backdrop-blur-sm">
        {/* Optional: Add page title, breadcrumbs, or actions here */}
      </div>

      {/* DEBUG MARKER - THREE RAIL LAYOUT ACTIVE */}
      <div className="flex-1 flex items-stretch gap-6 px-6 py-4 text-gray-100 overflow-hidden">
        {/* LEFT RAIL - Temporal/Navigation */}
        {leftRail && (
          <RailSidebar
            side="left"
            defaultWidth={leftRailWidth}
            className="flex-shrink-0"
            cognitiveBand={leftRailCognitiveBand}
          >
            {leftRail}
          </RailSidebar>
        )}

        {/* CENTER - Main Content */}
        <main className="flex-1 min-w-0 overflow-hidden">
          {children}
        </main>

        {/* RIGHT RAIL - Intelligence/Context */}
        {rightRail && (
          <RailSidebar
            side="right"
            defaultWidth={rightRailWidth}
            className="flex-shrink-0"
            cognitiveBand={rightRailCognitiveBand}
          >
            {rightRail}
          </RailSidebar>
        )}
      </div>
    </div>
  )
}
