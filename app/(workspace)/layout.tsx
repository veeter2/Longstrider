"use client"

import type React from "react"
import { GlobalNavigation } from "@/components/hub-bar"
import { useSpaceInitializer } from "@/hooks/use-space-initializer"

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  useSpaceInitializer()

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <GlobalNavigation />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
