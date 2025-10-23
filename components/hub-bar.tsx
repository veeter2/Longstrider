"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, usePathname } from "next/navigation"
import { Search, ChevronRight } from "lucide-react"

const pages = [
  {
    symbol: "γ",
    label: "Stream",
    path: "/longstrider",
    color: "rgb(var(--band-gamma-low))",
    glow: "rgba(var(--band-gamma-low), 0.3)",
  },
  {
    symbol: "θ",
    label: "Living Memory",
    path: "/living-memory",
    color: "rgb(var(--band-theta-high))",
    glow: "rgba(var(--band-theta-high), 0.4)",
  },
  {
    symbol: "β",
    label: "Cortex",
    path: "/cortex",
    color: "rgb(var(--band-beta-low))",
    glow: "rgba(var(--band-beta-low), 0.4)",
  },
  {
    symbol: "χ",
    label: "Labs",
    path: "/labs",
    color: "rgb(var(--band-chi-cyan))",
    glow: "rgba(var(--band-chi-cyan), 0.4)",
  },
  {
    symbol: "δ",
    label: "Settings",
    path: "/settings",
    color: "rgb(var(--band-delta))",
    glow: "rgba(var(--band-delta), 0.5)",
  },
]

export function GlobalNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const isActive = (path: string) => pathname.startsWith(path)

  // Generate breadcrumbs from current pathname
  const getBreadcrumbs = () => {
    if (pathname === "/") return []

    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs = segments.map((segment, index) => {
      const path = "/" + segments.slice(0, index + 1).join("/")
      const page = pages.find(p => p.path === path)

      // Format segment name
      let label = segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      // Use page label if available
      if (page) {
        label = page.label
      }

      return { label, path }
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  const handleSearchFocus = () => {
    setIsSearchExpanded(true)
  }

  const handleSearchBlur = () => {
    if (!searchQuery.trim()) {
      setIsSearchExpanded(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isSearchExpanded) {
      setIsSearchExpanded(false)
      setSearchQuery("")
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-[rgba(22,22,28,0.90)] backdrop-blur-xl border-b border-violet-400/30 shadow-[inset_0_1px_0_0_rgba(139,92,246,0.2),0_2px_8px_0_rgba(124,58,237,0.15),0_1px_3px_0_rgba(0,0,0,0.4)]">
      <div
        className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-violet-500/10 pointer-events-none animate-pulse"
        style={{ animationDuration: "4s" }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-100/8 to-transparent pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-700" />

      <div className="relative flex items-center gap-2 z-10">
        <button
          onClick={() => handleNavigate("/")}
          className="text-lg font-medium text-white hover:text-violet-200 transition-colors"
        >
          LongStrider
        </button>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 ml-2">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              const activePage = pages.find(p => p.path === crumb.path)

              return (
                <div key={crumb.path} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                  <button
                    onClick={() => !isLast && handleNavigate(crumb.path)}
                    className={`text-sm transition-colors ${
                      isLast
                        ? activePage
                          ? `font-medium`
                          : "text-slate-300 font-medium"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                    style={isLast && activePage ? { color: activePage.color } : {}}
                    disabled={isLast}
                  >
                    {crumb.label}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <nav className="relative flex items-center gap-1 z-10">
        {pages.map((page) => {
          const active = isActive(page.path)

          return (
            <motion.button
              key={page.path}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigate(page.path)}
              className="relative group p-2.5 rounded-lg transition-all"
              style={{
                backgroundColor: active ? `${page.color}15` : "transparent",
              }}
            >
              {/* Greek Letter Symbol with active color */}
              <div
                className="relative text-2xl font-light transition-all"
                style={{
                  color: active ? page.color : "#94a3b8",
                  textShadow: active ? `0 0 12px ${page.glow}` : "none",
                }}
              >
                {page.symbol}
              </div>

              {/* Active indicator pulse */}
              {active && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  animate={{
                    boxShadow: [`0 0 8px ${page.glow}`, `0 0 16px ${page.glow}`, `0 0 8px ${page.glow}`],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
              )}

              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-black/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100]">
                <div className="text-xs font-normal text-white">{page.label}</div>
              </div>
            </motion.button>
          )
        })}
      </nav>

      <div className="relative flex items-center gap-2 z-10">
        {/* Expandable Global Search */}
        <div className="relative flex justify-end">
          <AnimatePresence mode="wait">
            {!isSearchExpanded ? (
              <motion.button
                key="search-icon"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearchFocus}
                className="p-2.5 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors group"
                aria-label="Search"
                title="Search"
              >
                <Search className="h-5 w-5 text-slate-300 group-hover:text-white" />
              </motion.button>
            ) : (
              <motion.div
                key="search-input"
                initial={{ width: 40, opacity: 0, scale: 0.95 }}
                animate={{ width: 256, opacity: 1, scale: 1 }}
                exit={{ width: 40, opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.25, 
                  ease: [0.4, 0, 0.2, 1],
                  opacity: { duration: 0.15 }
                }}
                className="relative flex justify-end"
              >
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    onKeyDown={handleKeyDown}
                    placeholder="Search spaces, memories, conversations..."
                    className="pl-10 pr-4 py-2 w-full h-10 bg-white/10 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--band-theta-high))]/20 focus:border-[rgb(var(--band-theta-high))]/50 transition-all duration-200"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavigate("/profile")}
          className="relative group p-2.5 rounded-lg transition-all"
          style={{
            backgroundColor: pathname === "/profile" ? "rgba(var(--band-phi), 0.15)" : "transparent",
          }}
          aria-label="User Profile"
          title="User Profile"
        >
          {/* Phi symbol with active color */}
          <div
            className="relative text-2xl font-light transition-all"
            style={{
              color: pathname === "/profile" ? "rgb(var(--band-phi))" : "#94a3b8",
              textShadow: pathname === "/profile" ? "0 0 12px rgba(var(--band-phi), 0.4)" : "none",
            }}
          >
            φ
          </div>

          {/* Active indicator pulse */}
          {pathname === "/profile" && (
            <motion.div
              className="absolute inset-0 rounded-lg"
              animate={{
                boxShadow: [
                  "0 0 8px rgba(var(--band-phi), 0.4)",
                  "0 0 16px rgba(var(--band-phi), 0.4)",
                  "0 0 8px rgba(var(--band-phi), 0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
          )}

          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-black/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100]">
            <div className="text-xs font-normal text-white">Profile</div>
          </div>
        </motion.button>
      </div>
    </div>
  )
}

